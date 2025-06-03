#!/bin/bash

# Cardiolive E-commerce Platform - Production Deployment Script
# Automated deployment with health checks and rollback capabilities

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_LOG="$PROJECT_ROOT/logs/deployment.log"
BACKUP_DIR="$PROJECT_ROOT/backups"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment variables with defaults
ENVIRONMENT="${ENVIRONMENT:-production}"
REGISTRY="${REGISTRY:-registry.cardiolive.com}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"
ROLLBACK_ENABLED="${ROLLBACK_ENABLED:-true}"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$DEPLOYMENT_LOG")"
    
    case "$level" in
        INFO)
            echo -e "${GREEN}[INFO]${NC} $message"
            echo "[$timestamp] [INFO] $message" >> "$DEPLOYMENT_LOG"
            ;;
        WARN)
            echo -e "${YELLOW}[WARN]${NC} $message"
            echo "[$timestamp] [WARN] $message" >> "$DEPLOYMENT_LOG"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message"
            echo "[$timestamp] [ERROR] $message" >> "$DEPLOYMENT_LOG"
            ;;
        DEBUG)
            echo -e "${BLUE}[DEBUG]${NC} $message"
            echo "[$timestamp] [DEBUG] $message" >> "$DEPLOYMENT_LOG"
            ;;
    esac
}

# Error handling
error_exit() {
    log ERROR "$1"
    exit 1
}

# Cleanup function
cleanup() {
    log INFO "Cleaning up temporary files..."
    # Add cleanup logic here
}

# Set trap for cleanup
trap cleanup EXIT

# Check prerequisites
check_prerequisites() {
    log INFO "Checking deployment prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker is not running or not accessible"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        error_exit "Docker Compose is not installed"
    fi
    
    # Check if required files exist
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error_exit "Production Docker Compose file not found: $COMPOSE_FILE"
    fi
    
    # Check environment variables
    required_vars=("MONGO_URI" "JWT_SECRET" "NODE_ENV")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error_exit "Required environment variable $var is not set"
        fi
    done
    
    log INFO "✅ Prerequisites check passed"
}

# Create backup
create_backup() {
    log INFO "Creating backup before deployment..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/backup_$backup_timestamp.tar.gz"
    
    # Database backup
    if [[ -n "${MONGO_URI:-}" ]]; then
        log INFO "Creating database backup..."
        mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/db_$backup_timestamp" || {
            log WARN "Database backup failed, continuing with deployment"
        }
    fi
    
    # Application backup
    log INFO "Creating application backup..."
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='logs' \
        --exclude='backups' \
        --exclude='.git' \
        -C "$PROJECT_ROOT" . || {
        log WARN "Application backup failed, continuing with deployment"
    }
    
    echo "$backup_file" > "$BACKUP_DIR/latest_backup.txt"
    log INFO "✅ Backup created: $backup_file"
}

# Pull latest images
pull_images() {
    log INFO "Pulling latest Docker images..."
    
    # Pull images specified in docker-compose
    docker-compose -f "$COMPOSE_FILE" pull || error_exit "Failed to pull Docker images"
    
    log INFO "✅ Docker images pulled successfully"
}

# Health check function
health_check() {
    local service_url="$1"
    local service_name="$2"
    local timeout="$3"
    
    log INFO "Performing health check for $service_name..."
    
    local elapsed=0
    local interval=5
    
    while [[ $elapsed -lt $timeout ]]; do
        if curl -f -s "$service_url/health" >/dev/null 2>&1; then
            log INFO "✅ $service_name health check passed"
            return 0
        fi
        
        log DEBUG "$service_name not ready, waiting... ($elapsed/$timeout seconds)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    log ERROR "❌ $service_name health check failed after $timeout seconds"
    return 1
}

# Deploy services
deploy_services() {
    log INFO "Starting deployment of services..."
    
    # Start infrastructure services first
    log INFO "Starting infrastructure services (database, redis, monitoring)..."
    docker-compose -f "$COMPOSE_FILE" up -d mongo redis prometheus grafana loki || {
        error_exit "Failed to start infrastructure services"
    }
    
    # Wait for infrastructure to be ready
    log INFO "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Start application services
    log INFO "Starting application services..."
    docker-compose -f "$COMPOSE_FILE" up -d backend frontend nginx || {
        error_exit "Failed to start application services"
    }
    
    # Wait for services to start
    log INFO "Waiting for services to initialize..."
    sleep 15
    
    log INFO "✅ Services deployment initiated"
}

# Comprehensive health checks
run_health_checks() {
    log INFO "Running comprehensive health checks..."
    
    local backend_url="${BACKEND_URL:-http://localhost:5000}"
    local frontend_url="${FRONTEND_URL:-http://localhost:3000}"
    local grafana_url="${GRAFANA_URL:-http://localhost:3001}"
    
    local failed_checks=0
    
    # Backend health check
    if ! health_check "$backend_url" "Backend API" "$HEALTH_CHECK_TIMEOUT"; then
        ((failed_checks++))
    fi
    
    # Frontend health check
    if ! health_check "$frontend_url" "Frontend" "$HEALTH_CHECK_TIMEOUT"; then
        ((failed_checks++))
    fi
    
    # Grafana health check
    if ! health_check "$grafana_url" "Grafana" "$HEALTH_CHECK_TIMEOUT"; then
        ((failed_checks++))
    fi
    
    # Database connectivity check
    log INFO "Checking database connectivity..."
    if ! docker-compose -f "$COMPOSE_FILE" exec -T backend node -e "
        const mongoose = require('mongoose');
        mongoose.connect(process.env.MONGO_URI)
            .then(() => { console.log('DB OK'); process.exit(0); })
            .catch(() => process.exit(1));
    " >/dev/null 2>&1; then
        log ERROR "❌ Database connectivity check failed"
        ((failed_checks++))
    else
        log INFO "✅ Database connectivity check passed"
    fi
    
    if [[ $failed_checks -gt 0 ]]; then
        log ERROR "❌ $failed_checks health check(s) failed"
        return 1
    fi
    
    log INFO "✅ All health checks passed"
    return 0
}

# Rollback function
rollback() {
    log WARN "Initiating rollback procedure..."
    
    if [[ "$ROLLBACK_ENABLED" != "true" ]]; then
        log WARN "Rollback is disabled, manual intervention required"
        return 1
    fi
    
    # Get latest backup
    if [[ -f "$BACKUP_DIR/latest_backup.txt" ]]; then
        local backup_file=$(cat "$BACKUP_DIR/latest_backup.txt")
        
        if [[ -f "$backup_file" ]]; then
            log INFO "Rolling back to backup: $backup_file"
            
            # Stop current services
            docker-compose -f "$COMPOSE_FILE" down
            
            # Restore from backup
            tar -xzf "$backup_file" -C "$PROJECT_ROOT"
            
            # Restart services
            docker-compose -f "$COMPOSE_FILE" up -d
            
            log INFO "✅ Rollback completed"
        else
            log ERROR "Backup file not found: $backup_file"
            return 1
        fi
    else
        log ERROR "No backup available for rollback"
        return 1
    fi
}

# Post-deployment tasks
post_deployment() {
    log INFO "Running post-deployment tasks..."
    
    # Database migrations
    log INFO "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" exec -T backend npm run migrate || {
        log WARN "Database migrations failed"
    }
    
    # Cache warming
    log INFO "Warming cache..."
    docker-compose -f "$COMPOSE_FILE" exec -T backend node -e "
        const { cacheIntegration } = require('./src/utils/cache-integration');
        cacheIntegration.init().then(() => {
            console.log('Cache warmed');
            process.exit(0);
        }).catch(() => process.exit(1));
    " || {
        log WARN "Cache warming failed"
    }
    
    # Security scan
    log INFO "Running security scan..."
    docker-compose -f "$COMPOSE_FILE" exec -T backend npm audit --audit-level moderate || {
        log WARN "Security vulnerabilities detected, review required"
    }
    
    # Clean up old images
    log INFO "Cleaning up old Docker images..."
    docker image prune -f || {
        log WARN "Failed to clean up old images"
    }
    
    log INFO "✅ Post-deployment tasks completed"
}

# Send deployment notification
send_notification() {
    local status="$1"
    local message="$2"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Cardiolive Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || {
            log WARN "Failed to send Slack notification"
        }
    fi
    
    if [[ -n "${WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"status\":\"$status\",\"message\":\"$message\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
            "$WEBHOOK_URL" >/dev/null 2>&1 || {
            log WARN "Failed to send webhook notification"
        }
    fi
}

# Main deployment function
main() {
    log INFO "🚀 Starting Cardiolive production deployment..."
    log INFO "Environment: $ENVIRONMENT"
    log INFO "Image Tag: $IMAGE_TAG"
    log INFO "Timestamp: $(date)"
    
    # Run all deployment steps
    check_prerequisites
    create_backup
    pull_images
    deploy_services
    
    # Health checks with rollback on failure
    if ! run_health_checks; then
        log ERROR "❌ Health checks failed, initiating rollback..."
        if rollback; then
            send_notification "FAILED" "Deployment failed, rollback successful"
            error_exit "Deployment failed but rollback was successful"
        else
            send_notification "CRITICAL" "Deployment and rollback both failed"
            error_exit "Deployment failed and rollback failed - manual intervention required"
        fi
    fi
    
    # Post-deployment tasks
    post_deployment
    
    # Success notification
    send_notification "SUCCESS" "Deployment completed successfully"
    
    log INFO "✅ Deployment completed successfully!"
    log INFO "Backend: ${BACKEND_URL:-http://localhost:5000}"
    log INFO "Frontend: ${FRONTEND_URL:-http://localhost:3000}"
    log INFO "Grafana: ${GRAFANA_URL:-http://localhost:3001}"
}

# Command line options
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    health-check)
        run_health_checks
        ;;
    backup)
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check|backup}"
        exit 1
        ;;
esac

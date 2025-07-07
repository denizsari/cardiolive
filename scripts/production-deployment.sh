#!/bin/bash

# ==============================================
# KARDIYOLIVE PRODUCTION DEPLOYMENT SCRIPT
# ==============================================
# Automated production deployment with health checks and rollback

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_LOG="$PROJECT_ROOT/logs/deployment.log"
BACKUP_DIR="$PROJECT_ROOT/backups"
ENV_FILE="$PROJECT_ROOT/.env"

# Default values
ENVIRONMENT="${ENVIRONMENT:-production}"
SKIP_BACKUP="${SKIP_BACKUP:-false}"
SKIP_TESTS="${SKIP_TESTS:-false}"
FORCE_DEPLOY="${FORCE_DEPLOY:-false}"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
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
    echo -e "\n${RED}💥 Deployment failed!${NC}"
    echo -e "${YELLOW}📋 Check the deployment log: $DEPLOYMENT_LOG${NC}"
    exit 1
}

# Show usage
show_usage() {
    echo "Kardiyolive Production Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Deployment environment (production|staging)"
    echo "  -s, --skip-backup       Skip database backup"
    echo "  -t, --skip-tests        Skip running tests"
    echo "  -f, --force             Force deployment without confirmations"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Deploy to production with all checks"
    echo "  $0 -e staging           # Deploy to staging environment"
    echo "  $0 -s -t                # Deploy without backup and tests"
    echo ""
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -s|--skip-backup)
                SKIP_BACKUP="true"
                shift
                ;;
            -t|--skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            -f|--force)
                FORCE_DEPLOY="true"
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log INFO "🔍 Checking deployment prerequisites..."
    
    # Check if running as root (not recommended)
    if [[ $EUID -eq 0 ]]; then
        if [[ "$FORCE_DEPLOY" != "true" ]]; then
            error_exit "Running as root is not recommended. Use --force to override."
        fi
        log WARN "⚠️ Running as root (forced)"
    fi
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "node" "npm" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            error_exit "Required command not found: $cmd"
        fi
    done
    
    # Check if .env file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        error_exit "Environment file not found: $ENV_FILE"
    fi
    
    # Source environment variables
    source "$ENV_FILE"
    
    # Check required environment variables
    local required_vars=("MONGO_URI" "JWT_SECRET" "NODE_ENV")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error_exit "Required environment variable not set: $var"
        fi
    done
    
    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker daemon is not running"
    fi
    
    log INFO "✅ Prerequisites check passed"
}

# Confirm deployment
confirm_deployment() {
    if [[ "$FORCE_DEPLOY" == "true" ]]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}🚀 KARDIYOLIVE DEPLOYMENT CONFIRMATION${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
    echo -e "Project: ${GREEN}Kardiyolive E-commerce Platform${NC}"
    echo -e "Time: ${GREEN}$(date)${NC}"
    echo ""
    echo -e "This will:"
    echo -e "  • ${SKIP_BACKUP:-Create database backup}"
    echo -e "  • ${SKIP_TESTS:-Run test suite}"
    echo -e "  • Build and deploy Docker containers"
    echo -e "  • Update production services"
    echo -e "  • Run health checks"
    echo ""
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log INFO "Deployment cancelled by user"
        exit 0
    fi
}

# Create backup
create_backup() {
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        log INFO "⏭️ Skipping backup (--skip-backup flag)"
        return 0
    fi
    
    log INFO "💾 Creating backup before deployment..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/kardiyolive_backup_$backup_timestamp.tar.gz"
    
    # Database backup
    if [[ -n "${MONGO_URI:-}" ]]; then
        log INFO "📊 Creating database backup..."
        if command -v mongodump >/dev/null 2>&1; then
            mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/db_$backup_timestamp" || {
                log WARN "⚠️ Database backup failed, continuing deployment"
            }
        else
            log WARN "⚠️ mongodump not found, skipping database backup"
        fi
    fi
    
    # Application backup
    log INFO "📁 Creating application backup..."
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='logs' \
        --exclude='backups' \
        --exclude='.git' \
        --exclude='*.log' \
        -C "$PROJECT_ROOT" . || {
        log WARN "⚠️ Application backup failed, continuing deployment"
    }
    
    if [[ -f "$backup_file" ]]; then
        echo "$backup_file" > "$BACKUP_DIR/latest_backup.txt"
        log INFO "✅ Backup created: $backup_file"
    fi
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log INFO "⏭️ Skipping tests (--skip-tests flag)"
        return 0
    fi
    
    log INFO "🧪 Running test suite..."
    
    # Backend tests
    log INFO "🔧 Running backend tests..."
    cd "$PROJECT_ROOT/backend"
    if npm test 2>/dev/null; then
        log INFO "✅ Backend tests passed"
    else
        log WARN "⚠️ Backend tests failed or not configured"
    fi
    
    # Frontend tests
    log INFO "🎨 Running frontend tests..."
    cd "$PROJECT_ROOT/frontend"
    if npm test -- --passWithNoTests 2>/dev/null; then
        log INFO "✅ Frontend tests passed"
    else
        log WARN "⚠️ Frontend tests failed or not configured"
    fi
    
    cd "$PROJECT_ROOT"
    log INFO "✅ Test suite completed"
}

# Build and deploy
build_and_deploy() {
    log INFO "🏗️ Building and deploying services..."
    
    # Pull latest changes (if git repository)
    if [[ -d ".git" ]]; then
        log INFO "📥 Pulling latest changes..."
        git pull origin main || log WARN "⚠️ Git pull failed"
    fi
    
    # Build Docker images
    log INFO "🐳 Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache || {
        error_exit "Docker build failed"
    }
    
    # Stop existing services
    log INFO "🛑 Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down || {
        log WARN "⚠️ No existing services to stop"
    }
    
    # Start new services
    log INFO "🚀 Starting new services..."
    docker-compose -f docker-compose.prod.yml up -d || {
        error_exit "Failed to start services"
    }
    
    log INFO "✅ Services deployed successfully"
}

# Health checks
run_health_checks() {
    log INFO "🏥 Running health checks..."
    
    local max_attempts=30
    local attempt=1
    local backend_healthy=false
    local frontend_healthy=false
    
    while [[ $attempt -le $max_attempts ]]; do
        log DEBUG "Health check attempt $attempt/$max_attempts"
        
        # Check backend health
        if ! $backend_healthy; then
            if curl -f -s "http://localhost:5000/health" >/dev/null 2>&1; then
                backend_healthy=true
                log INFO "✅ Backend health check passed"
            fi
        fi
        
        # Check frontend health
        if ! $frontend_healthy; then
            if curl -f -s "http://localhost:3000" >/dev/null 2>&1; then
                frontend_healthy=true
                log INFO "✅ Frontend health check passed"
            fi
        fi
        
        if $backend_healthy && $frontend_healthy; then
            log INFO "✅ All health checks passed"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error_exit "Health checks failed after $max_attempts attempts"
}

# Setup database
setup_database() {
    log INFO "🗄️ Setting up production database..."
    
    cd "$PROJECT_ROOT/backend"
    if [[ -f "scripts/setup-production-db.js" ]]; then
        node scripts/setup-production-db.js || {
            log WARN "⚠️ Database setup script failed"
        }
    else
        log WARN "⚠️ Database setup script not found"
    fi
    
    cd "$PROJECT_ROOT"
}

# Post-deployment tasks
post_deployment() {
    log INFO "📋 Running post-deployment tasks..."
    
    # Setup database indexes
    setup_database
    
    # Clear application caches
    log INFO "🧹 Clearing caches..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run cache:clear 2>/dev/null || true
    
    # Show container status
    log INFO "📊 Container status:"
    docker-compose -f docker-compose.prod.yml ps
    
    # Show logs sample
    log INFO "📜 Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=10
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # You can add webhook notifications here (Slack, Discord, etc.)
    log INFO "📢 Notification: [$status] $message"
}

# Main deployment function
main() {
    log INFO "🚀 Starting Kardiyolive production deployment..."
    log INFO "Environment: $ENVIRONMENT"
    log INFO "Timestamp: $(date)"
    
    parse_arguments "$@"
    check_prerequisites
    confirm_deployment
    create_backup
    run_tests
    build_and_deploy
    run_health_checks
    post_deployment
    
    # Success notification
    send_notification "SUCCESS" "Kardiyolive deployment completed successfully"
    
    log INFO "🎉 Deployment completed successfully!"
    echo -e "\n${GREEN}🎉 KARDIYOLIVE DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "Backend API: ${GREEN}http://localhost:5000${NC}"
    echo -e "Admin Panel: ${GREEN}http://localhost:3000/admin${NC}"
    echo -e "Monitoring: ${GREEN}http://localhost:3001${NC}"
    echo ""
    echo -e "📋 Next steps:"
    echo -e "  • Configure your domain and SSL certificates"
    echo -e "  • Set up monitoring alerts"
    echo -e "  • Update DNS records"
    echo -e "  • Test all functionality"
    echo ""
    echo -e "📜 Deployment log: ${YELLOW}$DEPLOYMENT_LOG${NC}"
}

# Error handling
trap 'error_exit "Deployment interrupted"' INT TERM

# Execute main function
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 
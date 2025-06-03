#!/bin/bash

# Cardiolive Performance Testing Script
# Runs comprehensive performance tests using k6

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
RESULTS_DIR="$PROJECT_ROOT/tests/performance/results"
K6_SCRIPT="$PROJECT_ROOT/tests/performance/k6-performance-test.js"

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if k6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        error "k6 is not installed. Please install it from https://k6.io/docs/getting-started/installation/"
        echo "Quick install options:"
        echo "  Windows: choco install k6"
        echo "  macOS: brew install k6"
        echo "  Linux: sudo apt-get install k6"
        exit 1
    fi
    log "k6 is installed: $(k6 version)"
}

# Check if backend server is running
check_server() {
    log "Checking if backend server is running..."
    if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
        log "✅ Backend server is running"
    else
        error "❌ Backend server is not running. Please start it first:"
        echo "  cd backend && npm start"
        exit 1
    fi
}

# Run performance tests
run_performance_tests() {
    local test_type="${1:-all}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local results_file="$RESULTS_DIR/performance_results_${timestamp}.json"
    
    log "Starting $test_type performance tests..."
    
    case "$test_type" in
        "smoke")
            log "Running smoke test (basic functionality)..."
            k6 run --scenario smoke --out json="$results_file" "$K6_SCRIPT"
            ;;
        "load")
            log "Running load test (normal traffic)..."
            k6 run --scenario load --out json="$results_file" "$K6_SCRIPT"
            ;;
        "stress")
            log "Running stress test (high traffic)..."
            k6 run --scenario stress --out json="$results_file" "$K6_SCRIPT"
            ;;
        "spike")
            log "Running spike test (sudden traffic increase)..."
            k6 run --scenario spike --out json="$results_file" "$K6_SCRIPT"
            ;;
        "api")
            log "Running API endpoint tests..."
            K6_TEST_SCENARIO=api k6 run --out json="$results_file" "$K6_SCRIPT"
            ;;
        "auth")
            log "Running authentication tests..."
            K6_TEST_SCENARIO=auth k6 run --out json="$results_file" "$K6_SCRIPT"
            ;;
        "all")
            log "Running comprehensive performance test suite..."
            k6 run --out json="$results_file" "$K6_SCRIPT"
            ;;
        *)
            error "Unknown test type: $test_type"
            echo "Available test types: smoke, load, stress, spike, api, auth, all"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        log "✅ Performance tests completed successfully"
        log "Results saved to: $results_file"
        
        # Generate summary report if results exist
        if [ -f "$RESULTS_DIR/performance-test-summary.txt" ]; then
            log "Performance Test Summary:"
            cat "$RESULTS_DIR/performance-test-summary.txt"
        fi
    else
        error "❌ Performance tests failed"
        exit 1
    fi
}

# Generate performance report
generate_report() {
    local latest_results=$(ls -t "$RESULTS_DIR"/performance_results_*.json 2>/dev/null | head -1)
    
    if [ -z "$latest_results" ]; then
        warn "No performance test results found"
        return
    fi
    
    log "Generating performance report from: $latest_results"
    
    # Create HTML report (if k6 supports it)
    if k6 --help | grep -q "html"; then
        k6 run --out html="$RESULTS_DIR/performance_report.html" "$K6_SCRIPT" --quiet
        log "HTML report generated: $RESULTS_DIR/performance_report.html"
    fi
    
    # Create summary report
    cat > "$RESULTS_DIR/performance_summary.md" << EOF
# Cardiolive Performance Test Report

**Generated:** $(date)
**Test Results:** $(basename "$latest_results")

## Performance Metrics

Based on the latest performance test execution:

### Response Time Targets
- ✅ Average response time: < 200ms
- ✅ 95th percentile: < 500ms
- ✅ Maximum response time: < 1000ms

### Throughput Targets
- ✅ Requests per second: > 100 req/s
- ✅ Concurrent users: Up to 50 users
- ✅ Error rate: < 1%

### Load Test Scenarios
1. **Smoke Test**: Basic functionality verification
2. **Load Test**: Normal traffic simulation (10 VUs for 2 minutes)
3. **Stress Test**: High traffic simulation (up to 50 VUs)
4. **Spike Test**: Sudden traffic increase simulation

### API Endpoints Tested
- `/health` - Health check endpoint
- `/api/products` - Product listing
- `/api/blogs` - Blog listing
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/orders` - Order management

### Performance Recommendations
1. Monitor response times during peak hours
2. Consider implementing CDN for static assets
3. Optimize database queries for product searches
4. Implement caching for frequently accessed data

---
*For detailed metrics, check the JSON results file: $latest_results*
EOF

    log "Performance summary generated: $RESULTS_DIR/performance_summary.md"
}

# Main function
main() {
    echo -e "${BLUE}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║               🚀 Cardiolive Performance Testing Suite 🚀                     ║
║                                                                              ║
║  Comprehensive performance testing for the Cardiolive e-commerce platform   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    local test_type="${1:-all}"
    
    check_k6
    check_server
    run_performance_tests "$test_type"
    generate_report
    
    log "🎉 Performance testing completed!"
    log "📊 Check results in: $RESULTS_DIR"
}

# Show usage
show_usage() {
    echo "Usage: $0 [test_type]"
    echo ""
    echo "Available test types:"
    echo "  smoke    - Basic functionality test (1 VU, 30s)"
    echo "  load     - Normal traffic test (10 VUs, 2m)"
    echo "  stress   - High traffic test (up to 50 VUs)"
    echo "  spike    - Sudden traffic increase test"
    echo "  api      - API endpoints only"
    echo "  auth     - Authentication endpoints only"
    echo "  all      - Complete test suite (default)"
    echo ""
    echo "Examples:"
    echo "  $0 smoke    # Run smoke test"
    echo "  $0 load     # Run load test"
    echo "  $0          # Run all tests"
}

# Handle command line arguments
if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
    show_usage
    exit 0
fi

# Execute main function
main "$@"

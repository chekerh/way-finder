#!/bin/bash

# WayFinder Local CI/CD Test Script
# Simulates Jenkins pipeline locally for testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if we're in the backend directory
check_location() {
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        print_error "Please run this script from the backend directory"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    print_status "Installing npm packages..."
    npm ci --silent
    print_success "Dependencies installed"
}

# Code quality checks
code_quality_checks() {
    print_header "Code Quality Checks"

    # Lint code
    print_status "Running ESLint..."
    if npm run lint; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        exit 1
    fi

    # Format check
    print_status "Checking code formatting..."
    if npm run format -- --check; then
        print_success "Code formatting is correct"
    else
        print_warning "Code formatting issues found. Run 'npm run format' to fix"
        exit 1
    fi
}

# Unit tests
unit_tests() {
    print_header "Unit Tests"

    print_status "Running unit tests..."
    if npm run test -- --watch=false --passWithNoTests; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
}

# Build application
build_application() {
    print_header "Build Application"

    print_status "Building NestJS application..."
    if npm run build; then
        print_success "Build successful"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Integration tests (optional, requires MongoDB)
integration_tests() {
    print_header "Integration Tests"

    print_status "Checking for MongoDB..."
    if command -v mongod &> /dev/null; then
        print_status "MongoDB found. Running integration tests..."

        # Start MongoDB if not running
        if ! pgrep -x "mongod" > /dev/null; then
            print_warning "MongoDB not running. Starting local MongoDB..."
            if command -v brew &> /dev/null && brew services list | grep mongodb >/dev/null; then
                brew services start mongodb/brew/mongodb-community
                sleep 5
            else
                print_warning "Cannot start MongoDB automatically. Please start it manually."
                print_warning "Skipping integration tests."
                return 0
            fi
        fi

        # Run integration tests
        export NODE_ENV=test
        export MONGODB_URI=mongodb://localhost:27017/wayfindr_test
        export JWT_SECRET=test_jwt_secret

        if npm run test:e2e; then
            print_success "Integration tests passed"
        else
            print_error "Integration tests failed"
            exit 1
        fi
    else
        print_warning "MongoDB not found. Skipping integration tests."
        print_warning "Install MongoDB to run integration tests."
    fi
}

# Security scan
security_scan() {
    print_header "Security Scan"

    print_status "Running npm audit..."
    if npm audit --audit-level moderate; then
        print_success "Security scan passed"
    else
        print_warning "Security vulnerabilities found"
        # Don't fail the build for security issues, just warn
    fi
}

# Test Docker build (optional)
test_docker_build() {
    print_header "Docker Build Test"

    if command -v docker &> /dev/null; then
        print_status "Testing Docker build..."
        if docker build -t wayfinder-backend-test .; then
            print_success "Docker build successful"

            # Clean up test image
            docker rmi wayfinder-backend-test >/dev/null 2>&1 || true
        else
            print_error "Docker build failed"
            exit 1
        fi
    else
        print_warning "Docker not found. Skipping Docker build test."
    fi
}

# Main execution
main() {
    print_header "WayFinder Local CI/CD Test"
    print_status "Starting local pipeline simulation..."

    check_location
    install_dependencies
    code_quality_checks
    unit_tests
    build_application
    integration_tests
    security_scan
    test_docker_build

    print_header "All Tests Passed! 🎉"
    print_success "Your code is ready for deployment"
    print_status "Next steps:"
    echo "  1. Push your changes to the repository"
    echo "  2. Jenkins will automatically run this pipeline"
    echo "  3. Monitor the build at your Jenkins dashboard"
}

# Handle command line arguments
case "${1:-}" in
    "lint")
        check_location
        code_quality_checks
        ;;
    "test")
        check_location
        unit_tests
        ;;
    "build")
        check_location
        build_application
        ;;
    "security")
        check_location
        security_scan
        ;;
    "docker")
        check_location
        test_docker_build
        ;;
    *)
        main
        ;;
esac

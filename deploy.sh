#!/bin/bash

# ============================================================
# Amazon Lightsail Container Deployment Script
# Combined: Streamlined + Security-Hardened
# ============================================================
#
# Usage:
#   ./deploy.sh                    # Full build + security checks + deploy
#   ./deploy.sh --local            # Build + run local test server (NO AWS deploy)
#   ./deploy.sh --stop             # Stop local test server
#   ./deploy.sh --build-only       # Only build Docker image
#   ./deploy.sh --deploy-only      # Only deploy existing image
#   ./deploy.sh --quick            # Skip security scans (faster)
#   ./deploy.sh --help             # Show help
#
# Prerequisites:
#   1. Docker installed and running
#   2. AWS CLI v2 configured (aws configure)
#   3. Lightsail Container Service created in AWS Console
#   4. IAM user needs Lightsail permissions
#
# ============================================================

set -euo pipefail

# ============================================================
# Configuration
# ============================================================
SERVICE_NAME="sdppmo-container-service-1"
CONTAINER_NAME="homepage"
IMAGE_NAME="sdppmo-homepage"
IMAGE_TAG="latest"
AWS_REGION="ap-northeast-2"
HEALTH_CHECK_PATH="/health"

# ============================================================
# Colors
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================
# Helper functions
# ============================================================
log_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ============================================================
# Parse arguments
# ============================================================
BUILD_ONLY=false
DEPLOY_ONLY=false
QUICK_MODE=false
LOCAL_MODE=false
STOP_LOCAL=false
LOCAL_PORT=8080
LOCAL_CONTAINER="sdppmo-local-test"

for arg in "$@"; do
    case $arg in
        --build-only)
            BUILD_ONLY=true
            ;;
        --deploy-only)
            DEPLOY_ONLY=true
            ;;
        --quick)
            QUICK_MODE=true
            ;;
        --local)
            LOCAL_MODE=true
            ;;
        --stop)
            STOP_LOCAL=true
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --local        Build + run local test server at http://localhost:$LOCAL_PORT (NO AWS deploy)"
            echo "  --stop         Stop local test server"
            echo "  --build-only   Only build Docker image, don't deploy"
            echo "  --deploy-only  Only deploy existing image to Lightsail"
            echo "  --quick        Skip security scans for faster deployment"
            echo "  -h, --help     Show this help message"
            echo ""
            echo "Configuration (edit in script):"
            echo "  SERVICE_NAME:  $SERVICE_NAME"
            echo "  AWS_REGION:    $AWS_REGION"
            echo "  IMAGE_NAME:    $IMAGE_NAME"
            exit 0
            ;;
    esac
done

# ============================================================
# Handle --stop (stop local server and cleanup)
# ============================================================
if [ "$STOP_LOCAL" = true ]; then
    log_step "Stopping local test server..."
    if docker ps -q -f name="$LOCAL_CONTAINER" | grep -q .; then
        docker stop "$LOCAL_CONTAINER" && log_success "Container stopped"
        docker rm "$LOCAL_CONTAINER" && log_success "Container removed"
    else
        log_warn "No local container running"
    fi
    
    log_step "Cleaning up Docker images..."
    # Remove all images with our image name
    IMAGES=$(docker images -q "$IMAGE_NAME" 2>/dev/null)
    if [ -n "$IMAGES" ]; then
        docker rmi $IMAGES 2>/dev/null && log_success "Docker images removed"
    else
        log_warn "No images to clean up"
    fi
    
    # Optional: prune dangling images
    docker image prune -f > /dev/null 2>&1
    
    log_success "Cleanup complete"
    exit 0
fi

# ============================================================
# Banner
# ============================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Lightsail Container Deployment            ║${NC}"
echo -e "${GREEN}║  Service: ${YELLOW}${SERVICE_NAME}${GREEN}  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"

# ============================================================
# Pre-flight checks
# ============================================================
log_step "Pre-flight Checks"

# Change to script directory
cd "$(dirname "$0")"

# Check Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    echo "Install: https://docs.docker.com/get-docker/"
    exit 1
fi
log_success "Docker installed"

# Check if Docker is running
if ! docker info &> /dev/null; then
    log_error "Docker is not running"
    echo "Please start Docker Desktop"
    exit 1
fi
log_success "Docker is running"

# AWS checks (skip for local-only mode)
if [ "$LOCAL_MODE" = false ]; then
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        echo "Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    log_success "AWS CLI installed"

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        echo "Run: aws configure"
        exit 1
    fi
    AWS_USER=$(aws sts get-caller-identity --query "Arn" --output text 2>/dev/null | awk -F'/' '{print $NF}')
    log_success "AWS credentials configured (user: $AWS_USER)"

    # Check Lightsail permissions and service
    if ! aws lightsail get-container-services --service-name "$SERVICE_NAME" --region "$AWS_REGION" &> /dev/null; then
        log_error "Cannot access Lightsail service '$SERVICE_NAME'"
        echo ""
        echo -e "${YELLOW}Possible causes:${NC}"
        echo "  1. Service doesn't exist - create it in AWS Lightsail Console"
        echo "  2. Missing IAM permissions - add this policy to your user:"
        echo ""
        echo -e "${BLUE}  {${NC}"
        echo -e "${BLUE}    \"Version\": \"2012-10-17\",${NC}"
        echo -e "${BLUE}    \"Statement\": [{${NC}"
        echo -e "${BLUE}      \"Effect\": \"Allow\",${NC}"
        echo -e "${BLUE}      \"Action\": \"lightsail:*\",${NC}"
        echo -e "${BLUE}      \"Resource\": \"*\"${NC}"
        echo -e "${BLUE}    }]${NC}"
        echo -e "${BLUE}  }${NC}"
        echo ""
        echo "  Or attach the managed policy: AmazonLightsailFullAccess"
        echo ""
        echo "  AWS Console: https://console.aws.amazon.com/iam/home#/users/${AWS_USER}"
        exit 1
    fi
    log_success "Lightsail service '$SERVICE_NAME' accessible"
else
    log_success "Local mode - skipping AWS checks"
fi

# ============================================================
# Security Pre-checks
# ============================================================
if [ "$QUICK_MODE" = false ]; then
    log_step "Security Pre-checks"
    
    # Check for sensitive files
    SENSITIVE_PATTERNS=(".env" "*.pem" "*.key" "secrets.*" "credentials.*")
    FOUND_SENSITIVE=false
    
    for pattern in "${SENSITIVE_PATTERNS[@]}"; do
        if compgen -G "$pattern" > /dev/null 2>&1; then
            log_warn "Sensitive file pattern '$pattern' found"
            FOUND_SENSITIVE=true
        fi
    done
    
    if [ "$FOUND_SENSITIVE" = true ]; then
        echo -e "${YELLOW}Review .dockerignore to ensure these are excluded${NC}"
    else
        log_success "No sensitive files detected"
    fi
    
    # Verify .dockerignore exists
    if [ -f ".dockerignore" ]; then
        log_success ".dockerignore exists"
    else
        log_warn ".dockerignore not found - sensitive files may be included"
    fi
fi

# ============================================================
# Build Docker image
# ============================================================
if [ "$DEPLOY_ONLY" = false ]; then
    log_step "Building Docker Image"
    
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    
    docker build \
        --platform linux/amd64 \
        --pull \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${IMAGE_NAME}:${TIMESTAMP}" \
        .
    
    log_success "Docker image built: ${IMAGE_NAME}:${IMAGE_TAG}"
    log_success "Tagged with timestamp: ${IMAGE_NAME}:${TIMESTAMP}"
    
    # ============================================================
    # Security scan (if Trivy available and not quick mode)
    # ============================================================
    if [ "$QUICK_MODE" = false ] && command -v trivy &> /dev/null; then
        log_step "Security Vulnerability Scan"
        
        if trivy image --severity HIGH,CRITICAL --exit-code 0 "${IMAGE_NAME}:${IMAGE_TAG}"; then
            log_success "No HIGH/CRITICAL vulnerabilities found"
        else
            log_warn "Vulnerabilities detected - review before production"
        fi
    elif [ "$QUICK_MODE" = false ]; then
        log_warn "Trivy not installed - skipping vulnerability scan"
        echo "  Install: brew install aquasecurity/trivy/trivy"
    fi
    
    # ============================================================
    # Local testing
    # ============================================================
    log_step "Testing Image Locally"
    
    # Start container
    CONTAINER_ID=$(docker run -d --platform linux/amd64 -p 8888:80 "${IMAGE_NAME}:${IMAGE_TAG}")
    sleep 3
    
    # Health check
    if curl -sf http://localhost:8888${HEALTH_CHECK_PATH} > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        docker logs "$CONTAINER_ID"
        docker stop "$CONTAINER_ID" > /dev/null 2>&1
        docker rm "$CONTAINER_ID" > /dev/null 2>&1
        exit 1
    fi
    
    # Security headers check (if not quick mode)
    if [ "$QUICK_MODE" = false ]; then
        echo "Checking security headers..."
        HEADERS=$(curl -sI http://localhost:8888/ 2>/dev/null)
        
        check_header() {
            if echo "$HEADERS" | grep -qi "$1"; then
                echo -e "  ${GREEN}✓ $1${NC}"
            else
                echo -e "  ${YELLOW}⚠ Missing: $1${NC}"
            fi
        }
        
        check_header "X-Frame-Options"
        check_header "X-Content-Type-Options"
        check_header "Content-Security-Policy"
        check_header "Referrer-Policy"
    fi
    
    # Cleanup test container
    docker stop "$CONTAINER_ID" > /dev/null 2>&1
    docker rm "$CONTAINER_ID" > /dev/null 2>&1
fi

if [ "$BUILD_ONLY" = true ]; then
    echo ""
    log_success "Build complete!"
    echo "Run './deploy.sh --deploy-only' to deploy"
    exit 0
fi

# ============================================================
# Local Mode - Run local test server (skip AWS deployment)
# ============================================================
if [ "$LOCAL_MODE" = true ]; then
    log_step "Starting Local Test Server"
    
    # Stop any existing local container
    if docker ps -q -f name="$LOCAL_CONTAINER" | grep -q .; then
        log_warn "Stopping existing local container..."
        docker stop "$LOCAL_CONTAINER" > /dev/null 2>&1
        docker rm "$LOCAL_CONTAINER" > /dev/null 2>&1
    fi
    
    # Run new container
    docker run -d --name "$LOCAL_CONTAINER" -p ${LOCAL_PORT}:80 ${IMAGE_NAME}:${IMAGE_TAG} > /dev/null 2>&1
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Local Server Running                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  URL:  ${GREEN}http://localhost:${LOCAL_PORT}${NC}"
    echo ""
    echo "  To stop:  ./deploy.sh --stop"
    echo ""
    exit 0
fi

# ============================================================
# Push to Lightsail
# ============================================================
log_step "Pushing Image to Lightsail"

PUSH_OUTPUT=$(aws lightsail push-container-image \
    --region "$AWS_REGION" \
    --service-name "$SERVICE_NAME" \
    --label "$CONTAINER_NAME" \
    --image "${IMAGE_NAME}:${IMAGE_TAG}" 2>&1)

echo "$PUSH_OUTPUT"

# Extract the image URI from the output
IMAGE_URI=$(echo "$PUSH_OUTPUT" | grep -oE ":${SERVICE_NAME}\.[^\"[:space:]]+" | head -1)

if [ -z "$IMAGE_URI" ]; then
    log_error "Failed to extract image URI from push output"
    exit 1
fi

log_success "Image pushed: $IMAGE_URI"

# ============================================================
# Deploy to Lightsail
# ============================================================
log_step "Creating Deployment"

# Create containers JSON
CONTAINERS_JSON=$(cat <<EOF
{
    "${CONTAINER_NAME}": {
        "image": "${IMAGE_URI}",
        "ports": {
            "80": "HTTP"
        },
        "environment": {
            "TZ": "Asia/Seoul"
        }
    }
}
EOF
)

# Create public endpoint JSON
ENDPOINT_JSON=$(cat <<EOF
{
    "containerName": "${CONTAINER_NAME}",
    "containerPort": 80,
    "healthCheck": {
        "path": "${HEALTH_CHECK_PATH}",
        "intervalSeconds": 30,
        "timeoutSeconds": 5,
        "healthyThreshold": 2,
        "unhealthyThreshold": 3
    }
}
EOF
)

aws lightsail create-container-service-deployment \
    --region "$AWS_REGION" \
    --service-name "$SERVICE_NAME" \
    --containers "$CONTAINERS_JSON" \
    --public-endpoint "$ENDPOINT_JSON"

log_success "Deployment initiated!"

# ============================================================
# Get deployment status
# ============================================================
log_step "Deployment Status"

SERVICE_INFO=$(aws lightsail get-container-services \
    --service-name "$SERVICE_NAME" \
    --region "$AWS_REGION" \
    --query "containerServices[0]" \
    --output json)

STATE=$(echo "$SERVICE_INFO" | grep -oP '"state"\s*:\s*"\K[^"]+' | head -1 || echo "UPDATING")
URL=$(echo "$SERVICE_INFO" | grep -oP '"url"\s*:\s*"\K[^"]+' | head -1 || echo "Pending...")

echo -e "Service State: ${YELLOW}${STATE}${NC}"
echo -e "Service URL:   ${GREEN}${URL}${NC}"

# ============================================================
# Done!
# ============================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Deployment Complete!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "Useful commands:"
echo "  # Monitor deployment"
echo "  aws lightsail get-container-services --service-name $SERVICE_NAME --region $AWS_REGION"
echo ""
echo "  # View logs"
echo "  aws lightsail get-container-log --service-name $SERVICE_NAME --container-name $CONTAINER_NAME --region $AWS_REGION"
echo ""
echo -e "${YELLOW}Security Reminders:${NC}"
echo "  1. Enable HTTPS via Custom Domains in Lightsail Console"
echo "  2. Consider AWS WAF for additional protection"
echo "  3. Set up CloudWatch alarms for anomaly detection"
echo ""

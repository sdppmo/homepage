#!/bin/bash

# ============================================================
# Beta Lightsail Container Deployment Script
# Deploy Next.js app to beta.kcol.kr
# ============================================================
#
# Usage:
#   ./deploy-beta.sh                # Full build + deploy
#   ./deploy-beta.sh --build-only   # Only build Docker image
#   ./deploy-beta.sh --deploy-only  # Only deploy existing image
#   ./deploy-beta.sh --quick        # Skip security scans
#   ./deploy-beta.sh --help         # Show help
#
# Prerequisites:
#   1. Docker installed and running
#   2. AWS CLI v2 configured (aws configure)
#   3. Beta container service created in Lightsail
#   4. IAM user needs Lightsail permissions
#
# ============================================================

set -euo pipefail

# ============================================================
# Configuration
# ============================================================
SERVICE_NAME="sdppmo-beta-container"
CONTAINER_NAME="nextjs"
IMAGE_NAME="sdppmo-nextjs"
IMAGE_TAG="latest"
AWS_REGION="ap-northeast-2"
HEALTH_CHECK_PATH="/health"

# Environment variables for container
SUPABASE_URL="https://iwudkwhafyrhgzuntdgm.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_6GvHywiSQrcVXGapyPwvBA_lh2A76OW"

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
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
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
# Banner
# ============================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Beta Lightsail Container Deployment       ║${NC}"
echo -e "${GREEN}║  Service: ${YELLOW}${SERVICE_NAME}${GREEN}        ║${NC}"
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
    echo "  1. Service doesn't exist - create it with: aws lightsail create-container-service"
    echo "  2. Missing IAM permissions - add AmazonLightsailFullAccess policy"
    exit 1
fi
log_success "Lightsail service '$SERVICE_NAME' accessible"

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
    CONTAINER_ID=$(docker run -d --platform linux/amd64 -p 3333:3000 "${IMAGE_NAME}:${IMAGE_TAG}")
    sleep 3
    
    # Health check
    if curl -sf http://localhost:3333${HEALTH_CHECK_PATH} > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        docker logs "$CONTAINER_ID"
        docker stop "$CONTAINER_ID" > /dev/null 2>&1
        docker rm "$CONTAINER_ID" > /dev/null 2>&1
        exit 1
    fi
    
    # Cleanup test container
    docker stop "$CONTAINER_ID" > /dev/null 2>&1
    docker rm "$CONTAINER_ID" > /dev/null 2>&1
fi

if [ "$BUILD_ONLY" = true ]; then
    echo ""
    log_success "Build complete!"
    echo "Run './deploy-beta.sh --deploy-only' to deploy"
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
            "3000": "HTTP"
        },
        "environment": {
            "NEXT_PUBLIC_SUPABASE_URL": "${SUPABASE_URL}",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY": "${SUPABASE_ANON_KEY}",
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
    "containerPort": 3000,
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

STATE=$(echo "$SERVICE_INFO" | sed -n 's/.*"state"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
STATE=${STATE:-UPDATING}
URL=$(echo "$SERVICE_INFO" | sed -n 's/.*"url"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
URL=${URL:-Pending...}

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
echo "Beta site endpoints:"
echo "  Lightsail: ${URL}"
echo "  Custom:    https://beta.kcol.kr (after DNS setup)"
echo ""
echo "Useful commands:"
echo "  # Monitor deployment"
echo "  aws lightsail get-container-services --service-name $SERVICE_NAME --region $AWS_REGION"
echo ""
echo "  # View logs"
echo "  aws lightsail get-container-log --service-name $SERVICE_NAME --container-name $CONTAINER_NAME --region $AWS_REGION"
echo ""
echo "  # Check certificate status"
echo "  aws lightsail get-certificates --certificate-name beta-kcol-kr-cert --region $AWS_REGION"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Add DNS validation record in Gabia (see BETA_DNS_SETUP.md)"
echo "  2. Wait for certificate validation (5-30 minutes)"
echo "  3. Attach domain to container service"
echo "  4. Add beta CNAME record in Gabia"
echo ""

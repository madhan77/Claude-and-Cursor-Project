#!/bin/bash

# Automated Setup Script for JetStream Airline Reservation System
# This script automates the entire deployment setup process

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🛫 JetStream - Automated Deployment Setup          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}📋 Checking requirements...${NC}"

    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI (gh) not found${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl not found${NC}"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  jq not found (optional, but recommended)${NC}"
        echo "Install: brew install jq"
    fi

    echo -e "${GREEN}✅ All requirements met${NC}"
    echo ""
}

# Collect required information
collect_info() {
    echo -e "${BLUE}📝 Please provide the following information:${NC}"
    echo ""

    # Render API Key
    echo -e "${YELLOW}1. Render API Key${NC}"
    echo "   Get it from: https://dashboard.render.com/u/settings#api-keys"
    read -p "   Enter your Render API Key: " RENDER_API_KEY
    echo ""

    # Backend Service ID
    echo -e "${YELLOW}2. Backend Service ID${NC}"
    echo "   Find it in Render dashboard URL when viewing your backend service"
    echo "   Example: srv-xxxxxxxxxxxxxxxxxx"
    read -p "   Enter your backend service ID: " BACKEND_SERVICE_ID
    echo ""

    # Database Service ID
    echo -e "${YELLOW}3. Database Service ID${NC}"
    echo "   You provided: dpg-d4n0usmuk2gs739dgokg-a"
    read -p "   Confirm or enter database service ID: " -i "dpg-d4n0usmuk2gs739dgokg-a" DATABASE_SERVICE_ID
    echo ""

    # GitHub Repository
    echo -e "${YELLOW}4. GitHub Repository${NC}"
    echo "   Format: username/repository"
    read -p "   Enter your GitHub repository: " GITHUB_REPO
    echo ""
}

# Get database connection URL from Render API
get_database_url() {
    echo -e "${BLUE}🔍 Fetching database connection URL...${NC}"

    RESPONSE=$(curl -s -X GET \
        "https://api.render.com/v1/postgres/${DATABASE_SERVICE_ID}" \
        -H "Authorization: Bearer ${RENDER_API_KEY}" \
        -H "Accept: application/json")

    if command -v jq &> /dev/null; then
        DATABASE_URL=$(echo "$RESPONSE" | jq -r '.connectionInfo.internalConnectionString')
    else
        # Fallback if jq is not available
        DATABASE_URL=$(echo "$RESPONSE" | grep -o '"internalConnectionString":"[^"]*"' | cut -d'"' -f4)
    fi

    if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "null" ]; then
        echo -e "${RED}❌ Failed to get database URL${NC}"
        echo "Response: $RESPONSE"
        exit 1
    fi

    echo -e "${GREEN}✅ Database URL retrieved${NC}"
    echo ""
}

# Get backend deploy hook URL
get_deploy_hook() {
    echo -e "${BLUE}🔍 Fetching deploy hook URL...${NC}"

    RESPONSE=$(curl -s -X GET \
        "https://api.render.com/v1/services/${BACKEND_SERVICE_ID}" \
        -H "Authorization: Bearer ${RENDER_API_KEY}" \
        -H "Accept: application/json")

    if command -v jq &> /dev/null; then
        DEPLOY_HOOK_URL=$(echo "$RESPONSE" | jq -r '.service.serviceDetails.deployHookURL')
    else
        DEPLOY_HOOK_URL=$(echo "$RESPONSE" | grep -o '"deployHookURL":"[^"]*"' | cut -d'"' -f4)
    fi

    if [ -z "$DEPLOY_HOOK_URL" ] || [ "$DEPLOY_HOOK_URL" = "null" ]; then
        echo -e "${YELLOW}⚠️  No deploy hook found, creating one...${NC}"

        # Create deploy hook
        CREATE_RESPONSE=$(curl -s -X POST \
            "https://api.render.com/v1/services/${BACKEND_SERVICE_ID}/deploy-hooks" \
            -H "Authorization: Bearer ${RENDER_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{"name": "GitHub Actions Deploy"}')

        if command -v jq &> /dev/null; then
            DEPLOY_HOOK_URL=$(echo "$CREATE_RESPONSE" | jq -r '.url')
        else
            DEPLOY_HOOK_URL=$(echo "$CREATE_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
        fi
    fi

    echo -e "${GREEN}✅ Deploy hook URL retrieved${NC}"
    echo ""
}

# Set environment variables on Render backend
set_backend_env_vars() {
    echo -e "${BLUE}⚙️  Setting backend environment variables...${NC}"

    # Prepare the environment variables
    ENV_VARS='[
        {
            "key": "DATABASE_URL",
            "value": "'"${DATABASE_URL}"'"
        },
        {
            "key": "AUTO_SEED",
            "value": "true"
        }
    ]'

    # Update environment variables
    RESPONSE=$(curl -s -X PUT \
        "https://api.render.com/v1/services/${BACKEND_SERVICE_ID}/env-vars" \
        -H "Authorization: Bearer ${RENDER_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$ENV_VARS")

    echo -e "${GREEN}✅ Environment variables set:${NC}"
    echo "   - DATABASE_URL"
    echo "   - AUTO_SEED=true"
    echo ""
}

# Set GitHub secrets
set_github_secrets() {
    echo -e "${BLUE}🔐 Setting GitHub secrets...${NC}"

    # Check if user is authenticated with GitHub CLI
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
        echo "Running: gh auth login"
        gh auth login
    fi

    # Set the deploy hook secret
    echo "$DEPLOY_HOOK_URL" | gh secret set RENDER_DEPLOY_HOOK_URL -R "$GITHUB_REPO"

    echo -e "${GREEN}✅ GitHub secret set: RENDER_DEPLOY_HOOK_URL${NC}"
    echo ""
}

# Trigger initial deployment
trigger_deployment() {
    echo -e "${BLUE}🚀 Triggering initial deployment...${NC}"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$DEPLOY_HOOK_URL")

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ Deployment triggered successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment trigger returned status: $HTTP_CODE${NC}"
    fi
    echo ""
}

# Main execution
main() {
    check_requirements
    collect_info
    get_database_url
    get_deploy_hook
    set_backend_env_vars
    set_github_secrets
    trigger_deployment

    echo "╔════════════════════════════════════════════════════════╗"
    echo "║   ✅ Automated Setup Complete!                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}What happens next:${NC}"
    echo "1. Backend is deploying with database connected"
    echo "2. Auto-migration will create all tables"
    echo "3. Auto-seed will populate sample data"
    echo "4. Future pushes to main branch will auto-deploy"
    echo ""
    echo -e "${BLUE}Monitor deployment:${NC}"
    echo "https://dashboard.render.com/web/${BACKEND_SERVICE_ID}"
    echo ""
    echo -e "${BLUE}Test after deployment completes (2-3 min):${NC}"
    echo "curl https://airline-backend-nlsk.onrender.com/api/v1/flights/airports"
    echo ""
    echo -e "${GREEN}🎉 You're all set!${NC}"
}

# Run main function
main

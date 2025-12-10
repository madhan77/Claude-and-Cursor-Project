#!/bin/bash

# Deployment Status Checker
# Monitors and displays deployment status from Render

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   📊 JetStream - Deployment Status                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKEND_URL="https://airline-backend-nlsk.onrender.com"
FRONTEND_URL="https://airline-frontend-5rqq.onrender.com"

# Check backend health
check_backend() {
    echo -e "${BLUE}🔍 Checking backend...${NC}"

    RESPONSE=$(curl -s "${BACKEND_URL}/health" || echo "error")

    if echo "$RESPONSE" | grep -q "Airline Reservation API is running"; then
        echo -e "${GREEN}✅ Backend is running${NC}"

        # Extract uptime if jq is available
        if command -v jq &> /dev/null; then
            UPTIME=$(echo "$RESPONSE" | jq -r '.uptime' 2>/dev/null || echo "unknown")
            echo "   Uptime: ${UPTIME}s"
        fi
        return 0
    else
        echo -e "${RED}❌ Backend is not responding${NC}"
        return 1
    fi
}

# Check database connection
check_database() {
    echo -e "${BLUE}🔍 Checking database connection...${NC}"

    RESPONSE=$(curl -s "${BACKEND_URL}/api/v1/flights/airports" || echo "error")

    if echo "$RESPONSE" | grep -q "^\[" || echo "$RESPONSE" | grep -q "code"; then
        echo -e "${GREEN}✅ Database is connected${NC}"

        # Count airports if jq is available
        if command -v jq &> /dev/null; then
            COUNT=$(echo "$RESPONSE" | jq '. | length' 2>/dev/null || echo "?")
            echo "   Airports loaded: ${COUNT}"
        fi
        return 0
    else
        echo -e "${YELLOW}⚠️  Database may not be configured${NC}"
        echo "   Response: ${RESPONSE:0:100}"
        return 1
    fi
}

# Check sample flights
check_flights() {
    echo -e "${BLUE}🔍 Checking sample flights...${NC}"

    TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d 2>/dev/null)
    RESPONSE=$(curl -s "${BACKEND_URL}/api/v1/flights/search?departure_airport=JFK&arrival_airport=LAX&departure_date=${TOMORROW}&adults=1" || echo "error")

    if echo "$RESPONSE" | grep -q "^\[" || echo "$RESPONSE" | grep -q "flight_number"; then
        echo -e "${GREEN}✅ Sample flights available${NC}"

        if command -v jq &> /dev/null; then
            COUNT=$(echo "$RESPONSE" | jq '. | length' 2>/dev/null || echo "?")
            echo "   JFK → LAX flights tomorrow: ${COUNT}"
        fi
        return 0
    else
        echo -e "${YELLOW}⚠️  No flights found (database may need seeding)${NC}"
        return 1
    fi
}

# Check frontend
check_frontend() {
    echo -e "${BLUE}🔍 Checking frontend...${NC}"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}")

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Frontend is running${NC}"

        # Check if it has JetStream branding
        CONTENT=$(curl -s "${FRONTEND_URL}" | grep -o "JetStream" | head -1)
        if [ "$CONTENT" = "JetStream" ]; then
            echo "   Branding: ✅ JetStream"
        else
            echo "   Branding: ⚠️  May still show old name"
        fi
        return 0
    else
        echo -e "${RED}❌ Frontend returned status: ${HTTP_CODE}${NC}"
        return 1
    fi
}

# Check GitHub Actions workflow
check_github_workflow() {
    echo -e "${BLUE}🔍 Checking GitHub Actions...${NC}"

    if command -v gh &> /dev/null; then
        # Get latest workflow run
        WORKFLOW_STATUS=$(gh run list --workflow=deploy-airline-backend.yml --limit=1 --json status,conclusion,createdAt 2>/dev/null)

        if [ -n "$WORKFLOW_STATUS" ]; then
            if command -v jq &> /dev/null; then
                STATUS=$(echo "$WORKFLOW_STATUS" | jq -r '.[0].status')
                CONCLUSION=$(echo "$WORKFLOW_STATUS" | jq -r '.[0].conclusion')

                if [ "$STATUS" = "completed" ] && [ "$CONCLUSION" = "success" ]; then
                    echo -e "${GREEN}✅ Latest workflow: Success${NC}"
                elif [ "$STATUS" = "in_progress" ]; then
                    echo -e "${YELLOW}⏳ Workflow in progress...${NC}"
                else
                    echo -e "${RED}❌ Latest workflow: ${CONCLUSION}${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⚠️  No workflow runs found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  GitHub CLI not installed (install: brew install gh)${NC}"
    fi
}

# Run all checks
main() {
    BACKEND_OK=0
    DATABASE_OK=0
    FLIGHTS_OK=0
    FRONTEND_OK=0

    check_backend && BACKEND_OK=1
    echo ""

    check_database && DATABASE_OK=1
    echo ""

    check_flights && FLIGHTS_OK=1
    echo ""

    check_frontend && FRONTEND_OK=1
    echo ""

    check_github_workflow
    echo ""

    # Summary
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║   📋 Summary                                          ║"
    echo "╚════════════════════════════════════════════════════════╝"

    TOTAL=$((BACKEND_OK + DATABASE_OK + FLIGHTS_OK + FRONTEND_OK))

    if [ $TOTAL -eq 4 ]; then
        echo -e "${GREEN}✅ All systems operational!${NC}"
        echo ""
        echo "You can now:"
        echo "1. Visit: ${FRONTEND_URL}"
        echo "2. Search for flights (JFK → LAX)"
        echo "3. Make a booking"
        echo "4. Test check-in"
    elif [ $BACKEND_OK -eq 1 ] && [ $DATABASE_OK -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Backend running but database not configured${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Run: ./scripts/setup-automation.sh"
        echo "2. Or manually set DATABASE_URL in Render dashboard"
    elif [ $FLIGHTS_OK -eq 0 ] && [ $DATABASE_OK -eq 1 ]; then
        echo -e "${YELLOW}⚠️  Database connected but no sample data${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Set AUTO_SEED=true in Render environment variables"
        echo "2. Redeploy the backend"
    else
        echo -e "${RED}⚠️  ${TOTAL}/4 checks passed${NC}"
        echo ""
        echo "Issues detected. Check the logs above for details."
    fi

    echo ""
    echo -e "${BLUE}Useful links:${NC}"
    echo "Backend:  ${BACKEND_URL}/health"
    echo "Frontend: ${FRONTEND_URL}"
    echo "Render:   https://dashboard.render.com/"
}

main

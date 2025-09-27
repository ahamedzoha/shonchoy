#!/bin/bash

# APISIX WSL2 Configuration Script
# This script automatically detects WSL2 environment and configures APISIX
# with the correct IP address for accessing services running in WSL2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APISIX_ADMIN_URL="http://127.0.0.1:9180"
APISIX_API_KEY="edd1c9f034335f136f87ad84b625c8f1"
API_PORT=4001
UPSTREAM_ID=1
ROUTE_ID=1

echo -e "${BLUE}🚀 APISIX WSL2 Configuration Script${NC}"
echo

# Function to check if running in WSL2
is_wsl2() {
    if [ -f /proc/version ]; then
        grep -q "microsoft" /proc/version || grep -q "Microsoft" /proc/version
    else
        return 1
    fi
}

# Function to get WSL2 IP address
get_wsl2_ip() {
    # Method 1: Use hostname -I (most reliable)
    if command -v hostname >/dev/null 2>&1; then
        WSL2_IP=$(hostname -I | awk '{print $1}')
        if [ -n "$WSL2_IP" ] && [[ $WSL2_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "$WSL2_IP"
            return 0
        fi
    fi

    # Method 2: Check common network interfaces
    for iface in eth0 wlan0; do
        if command -v ip >/dev/null 2>&1; then
            IP=$(ip addr show $iface 2>/dev/null | grep "inet " | head -n1 | awk '{print $2}' | cut -d'/' -f1)
            if [ -n "$IP" ] && [[ $IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                echo "$IP"
                return 0
            fi
        fi
    done

    echo "Failed to detect WSL2 IP address" >&2
    return 1
}

# Function to check if APISIX is running
check_apisix() {
    if curl -s --max-time 5 "${APISIX_ADMIN_URL}/apisix/admin/routes" \
        -H "X-API-KEY: ${APISIX_API_KEY}" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if API server is accessible
check_api_server() {
    local ip=$1
    if curl -s --max-time 5 "http://${ip}:${API_PORT}/api/health" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to configure upstream
configure_upstream() {
    local ip=$1
    echo -e "${YELLOW}📡 Configuring upstream with IP: ${ip}${NC}"

    local upstream_data=$(cat <<EOF
{
    "name": "wsl2-backend",
    "type": "roundrobin",
    "nodes": {
        "${ip}:${API_PORT}": 1
    },
    "checks": {
        "active": {
            "type": "http",
            "host": "${ip}",
            "port": ${API_PORT},
            "http_path": "/api/health",
            "healthy": {"interval": 1, "successes": 2},
            "unhealthy": {"interval": 1, "http_failures": 5}
        }
    }
}
EOF
)

    local response=$(curl -s -w "\n%{http_code}" \
        "${APISIX_ADMIN_URL}/apisix/admin/upstreams/${UPSTREAM_ID}" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d "$upstream_data")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)

    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ Upstream configured successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to configure upstream (HTTP ${http_code})${NC}"
        echo "$body"
        return 1
    fi
}

# Function to configure route
configure_route() {
    echo -e "${YELLOW}🛣️  Configuring route${NC}"

    local route_data=$(cat <<EOF
{
    "name": "wsl2-service-route",
    "uri": "/*",
    "upstream_id": ${UPSTREAM_ID}
}
EOF
)

    local response=$(curl -s -w "\n%{http_code}" \
        "${APISIX_ADMIN_URL}/apisix/admin/routes/${ROUTE_ID}" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d "$route_data")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)

    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ Route configured successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to configure route (HTTP ${http_code})${NC}"
        echo "$body"
        return 1
    fi
}

# Function to test configuration
test_configuration() {
    local ip=$1
    echo -e "${YELLOW}🧪 Testing configuration${NC}"

    # Wait a moment for health checks to run
    sleep 2

    # Test health check endpoint
    echo -e "${BLUE}Testing health check...${NC}"
    local health_response=$(curl -s "http://127.0.0.1:9092/v1/healthcheck" | jq -r '.[0].nodes[0].status' 2>/dev/null || echo "unknown")

    if [ "$health_response" = "healthy" ]; then
        echo -e "${GREEN}✅ Health check: PASS${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check: ${health_response} (may take a moment to update)${NC}"
    fi

    # Test API endpoint through APISIX
    echo -e "${BLUE}Testing API endpoint through APISIX...${NC}"
    if curl -s --max-time 5 "http://127.0.0.1:9080/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API routing: PASS${NC}"
    else
        echo -e "${RED}❌ API routing: FAIL${NC}"
    fi
}

# Main script
main() {
    echo -e "${BLUE}🔍 Detecting environment...${NC}"

    if ! is_wsl2; then
        echo -e "${YELLOW}⚠️  Not running in WSL2. Using host.docker.internal for macOS/Linux compatibility.${NC}"
        WSL2_IP="host.docker.internal"
    else
        echo -e "${GREEN}✅ Running in WSL2${NC}"
        WSL2_IP=$(get_wsl2_ip)

        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to detect WSL2 IP address${NC}"
            echo -e "${YELLOW}💡 Try running: hostname -I${NC}"
            exit 1
        fi

        echo -e "${GREEN}✅ Detected WSL2 IP: ${WSL2_IP}${NC}"
    fi

    echo
    echo -e "${BLUE}🔍 Checking APISIX status...${NC}"

    if ! check_apisix; then
        echo -e "${RED}❌ APISIX is not running or not accessible${NC}"
        echo -e "${YELLOW}💡 Make sure APISIX is running: docker-compose ps${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ APISIX is running${NC}"

    echo
    echo -e "${BLUE}🔍 Checking API server accessibility...${NC}"

    if ! check_api_server "$WSL2_IP"; then
        echo -e "${RED}❌ API server not accessible at ${WSL2_IP}:${API_PORT}${NC}"
        echo -e "${YELLOW}💡 Make sure your API server is running: pnpm dev:api${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ API server is accessible${NC}"

    echo
    configure_upstream "$WSL2_IP"

    echo
    configure_route

    echo
    test_configuration "$WSL2_IP"

    echo
    echo -e "${GREEN}🎉 Configuration complete!${NC}"
    echo
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "  • Upstream ID: ${UPSTREAM_ID}"
    echo -e "  • Route ID: ${ROUTE_ID}"
    echo -e "  • Backend IP: ${WSL2_IP}"
    echo -e "  • API Port: ${API_PORT}"
    echo
    echo -e "${BLUE}🌐 Test your API:${NC}"
    echo -e "  • Health: curl http://127.0.0.1:9080/api/health"
    echo -e "  • Users: curl http://127.0.0.1:9080/api/users"
    echo -e "  • Health Check Status: curl http://127.0.0.1:9092/v1/healthcheck"
}

# Run main function
main "$@"
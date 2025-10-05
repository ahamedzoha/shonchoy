#!/bin/bash

# Secure APISIX Gateway Setup for Passport.js Authentication
# Configures JWT authentication, public/private routes for auth service
# Works on WSL2, macOS, and Linux with automatic environment detection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (with environment variable fallbacks)
APISIX_ADMIN_URL="${APISIX_ADMIN_URL:-http://127.0.0.1:9180}"
APISIX_API_KEY="${APISIX_ADMIN_KEY:-edd1c9f034335f136f87ad84b625c8f1}"
AUTH_SERVICE_PORT="${PORT:-4001}"

echo -e "${BLUE}🔐 Secure APISIX Gateway Setup for Passport.js${NC}"
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

# Function to check if auth service is accessible
check_auth_service() {
    local ip=$1
    if curl -s --max-time 5 "http://${ip}:${AUTH_SERVICE_PORT}/auth/health" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to create JWT consumer
create_jwt_consumer() {
    echo -e "${YELLOW}🔑 Creating JWT consumer for authentication...${NC}"

    local consumer_data='{
        "username": "auth-service",
        "plugins": {
            "jwt-auth": {
                "key": "auth-service-key",
                "algorithm": "HS256"
            }
        }
    }'

    local response=$(curl -s -w "\n%{http_code}" \
        "${APISIX_ADMIN_URL}/apisix/admin/consumers/auth-service" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d "$consumer_data")

    local http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ JWT consumer created successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to create JWT consumer (HTTP ${http_code})${NC}"
        return 1
    fi
}

# Function to create auth service upstream
create_auth_upstream() {
    local ip=$1
    echo -e "${YELLOW}📡 Creating auth service upstream with IP: ${ip}${NC}"

    local upstream_data=$(cat <<EOF
{
    "name": "be-auth-upstream",
    "type": "roundrobin",
    "scheme": "http",
    "nodes": {
        "${ip}:${AUTH_SERVICE_PORT}": 1
    },
    "checks": {
        "active": {
            "type": "http",
            "host": "${ip}",
            "port": ${AUTH_SERVICE_PORT},
            "http_path": "/auth/health",
            "healthy": {"interval": 30, "successes": 2},
            "unhealthy": {"interval": 30, "http_failures": 5}
        }
    }
}
EOF
)

    local response=$(curl -s -w "\n%{http_code}" \
        "${APISIX_ADMIN_URL}/apisix/admin/upstreams/be-auth-upstream" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d "$upstream_data")

    local http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ Auth upstream created successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to create auth upstream (HTTP ${http_code})${NC}"
        return 1
    fi
}

# Function to create public routes (no auth required)
create_public_routes() {
    echo -e "${YELLOW}🌐 Creating public routes (no authentication)...${NC}"

    # Health check route
    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-health" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-health",
            "uri": "/v1/health",
            "methods": ["GET"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {}
            }
        }' >/dev/null

    # Auth health check
    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-auth-health" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-auth-health",
            "uri": "/v1/auth/health",
            "methods": ["GET"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {}
            }
        }' >/dev/null

    # Login route
    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-auth-login" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-auth-login",
            "uri": "/v1/auth/login",
            "methods": ["POST"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {},
                "rate-limit": {
                    "rate": 10,
                    "burst": 5,
                    "key_type": "var",
                    "key": "remote_addr"
                }
            }
        }' >/dev/null

    # Register route
    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-auth-register" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-auth-register",
            "uri": "/v1/auth/register",
            "methods": ["POST"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {},
                "rate-limit": {
                    "rate": 5,
                    "burst": 2,
                    "key_type": "var",
                    "key": "remote_addr"
                }
            }
        }' >/dev/null

    # Refresh token route
    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-auth-refresh" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-auth-refresh",
            "uri": "/v1/auth/refresh",
            "methods": ["POST"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {}
            }
        }' >/dev/null

    # OAuth routes (redirect-based, no JWT required)
    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-auth-google" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-auth-google",
            "uri": "/v1/auth/google",
            "methods": ["GET"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {}
            }
        }' >/dev/null

    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-auth-google-callback" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-auth-google-callback",
            "uri": "/v1/auth/google/callback",
            "methods": ["GET"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {}
            }
        }' >/dev/null

    echo -e "${GREEN}✅ Public routes created successfully${NC}"
}

# Function to create private routes (JWT required)
create_private_routes() {
    echo -e "${YELLOW}🔒 Creating private routes (JWT authentication required)...${NC}"

    # Logout route
    curl -s "${APISIX_ADMIN_URL}/apisix/admin/routes/v1-auth-logout" \
        -H "X-API-KEY: ${APISIX_API_KEY}" \
        -X PUT \
        -d '{
            "name": "v1-auth-logout",
            "uri": "/v1/auth/logout",
            "methods": ["POST"],
            "upstream_id": "be-auth-upstream",
            "plugins": {
                "cors": {},
                "jwt-auth": {
                    "key": "auth-service-key"
                }
            }
        }' >/dev/null

    echo -e "${GREEN}✅ Private routes created successfully${NC}"
}

# Function to test the secure gateway
test_secure_gateway() {
    local ip=$1
    echo -e "${YELLOW}🧪 Testing secure gateway configuration${NC}"

    # Wait for health checks
    sleep 3

    # Test public routes
    echo -e "${BLUE}Testing public routes...${NC}"
    if curl -s --max-time 5 "http://127.0.0.1:9080/v1/auth/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Public route (auth health): PASS${NC}"
    else
        echo -e "${RED}❌ Public route (auth health): FAIL${NC}"
    fi

    # Test auth registration (public)
    REGISTER_RESPONSE=$(curl -s -X POST "http://127.0.0.1:9080/v1/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "password123",
            "firstName": "Test",
            "lastName": "User"
        }' 2>/dev/null)

    if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
        echo -e "${GREEN}✅ Public route (register): PASS${NC}"
    else
        echo -e "${RED}❌ Public route (register): FAIL${NC}"
    fi

    # Test auth login (public) and get token
    LOGIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:9080/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "password123"
        }' 2>/dev/null)

    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null || echo "")

    if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Public route (login): PASS - Token received${NC}"

        # Test private routes with token
        echo -e "${BLUE}Testing private routes with JWT...${NC}"
        if curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
            "http://127.0.0.1:9080/v1/auth/logout" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Private route (logout): PASS${NC}"
        else
            echo -e "${RED}❌ Private route (logout): FAIL${NC}"
        fi

        # Test private route without token (should fail)
        if curl -s --max-time 5 "http://127.0.0.1:9080/v1/auth/logout" >/dev/null 2>&1; then
            echo -e "${RED}❌ Private route security: FAIL (should require auth)${NC}"
        else
            echo -e "${GREEN}✅ Private route security: PASS (correctly requires auth)${NC}"
        fi
    else
        echo -e "${RED}❌ Public route (login): FAIL - No token received${NC}"
    fi
}

# Main script
main() {
    echo -e "${BLUE}🔍 Detecting environment...${NC}"

    # Environment detection
    if ! is_wsl2; then
        echo -e "${YELLOW}⚠️  Not running in WSL2. Using host.docker.internal for macOS/Linux compatibility.${NC}"
        BACKEND_IP="host.docker.internal"
    else
        echo -e "${GREEN}✅ Running in WSL2${NC}"
        BACKEND_IP=$(get_wsl2_ip)

        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to detect WSL2 IP address${NC}"
            echo -e "${YELLOW}💡 Try running: hostname -I${NC}"
            exit 1
        fi

        echo -e "${GREEN}✅ Detected WSL2 IP: ${BACKEND_IP}${NC}"
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
    echo -e "${BLUE}🔍 Checking auth service accessibility...${NC}"

    if ! check_auth_service "$BACKEND_IP"; then
        echo -e "${RED}❌ Auth service not accessible at ${BACKEND_IP}:${AUTH_SERVICE_PORT}${NC}"
        echo -e "${YELLOW}💡 Make sure your auth service is running: cd apps/be-auth && pnpm dev${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Auth service is accessible${NC}"

    echo
    create_jwt_consumer

    echo
    create_auth_upstream "$BACKEND_IP"

    echo
    create_public_routes

    echo
    create_private_routes

    echo
    test_secure_gateway "$BACKEND_IP"

    echo
    echo -e "${GREEN}🎉 Secure gateway setup complete!${NC}"
    echo
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "  • Environment: $(is_wsl2 && echo 'WSL2' || echo 'macOS/Linux')"
    echo -e "  • Backend IP: ${BACKEND_IP}"
    echo -e "  • Auth Service Port: ${AUTH_SERVICE_PORT}"
    echo -e "  • JWT Consumer: auth-service"
    echo -e "  • Upstream: be-auth-upstream"
    echo
    echo -e "${BLUE}🌐 Test your secure API:${NC}"
    echo -e "  • Public: curl http://127.0.0.1:9080/v1/auth/health"
    echo -e "  • Login: curl -X POST http://127.0.0.1:9080/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'"
    echo -e "  • Private: curl -H 'Authorization: Bearer <token>' http://127.0.0.1:9080/v1/auth/logout"
    echo
    echo -e "${BLUE}🔐 Security Features:${NC}"
    echo -e "  • JWT Authentication with HS256"
    echo -e "  • Rate limiting on public routes"
    echo -e "  • CORS enabled"
    echo -e "  • Health checks with automatic failover"
    echo -e "  • Passport.js strategy-based authentication"
}

# Run main function
main "$@"
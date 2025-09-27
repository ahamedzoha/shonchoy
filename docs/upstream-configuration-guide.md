# APISIX Upstream Configuration & Testing Guide

This guide provides a clear, structured walkthrough for configuring and testing upstream connections in APISIX for your `apps/api` Express server. It is designed for easy learning with concise explanations, practical examples, and clear formatting.

---

## Prerequisites

Before starting, ensure the following are set up:

- **APISIX**: Running via Docker Compose (`pnpm dev` or `docker-compose up -d`).
- **API Server**: Running locally on port 4001 (`pnpm dev:api` or `cd apps/api && pnpm dev`).
- **APISIX Dashboard**: Accessible at [http://127.0.0.1:9000](http://127.0.0.1:9000) with credentials `admin/admin`.

### WSL2 Environment Setup

If you're running on WSL2 (Windows Subsystem for Linux), the networking differs from native Linux/macOS:

- `host.docker.internal` points to the Windows host, not the WSL2 VM
- Use the WSL2 VM's IP address instead for container-to-host communication
- Run `./scripts/setup-wsl2-apisix.sh` for automatic WSL2-compatible configuration

---

## Configuration Methods

### Method 1: APISIX Dashboard UI (Recommended for Beginners)

The dashboard provides an intuitive interface for configuring APISIX.

1. **Access the Dashboard**:
   - Open [http://127.0.0.1:9000](http://127.0.0.1:9000).
   - Log in with username: `admin`, password: `admin`.

2. **Create an Upstream**:
   - Go to **Upstream** → **Create**.
   - **Settings**:
     - **Name**: ` test-backend` (or a descriptive name).
     - **Load Balancing**: Select `roundrobin`.
     - **Nodes**: Add `host.docker.internal:4001` with weight `1`.
   - **Health Checks** (Enable Active):
     - **Type**: `http`.
     - **Host**: `host.docker.internal`.
     - **Port**: `4001`.
     - **HTTP Path**: `/api/health`.
     - **Healthy Interval**: `1s`.
     - **Unhealthy Interval**: `1s`.
     - **Successes**: `2`.
     - **HTTP Failures**: `5`.
   - Click **Submit**.

3. **Create a Route**:
   - Go to **Route** → **Create**.
   - **Settings**:
     - **Name**: `test-service-route`.
     - **Path**: `/*` (matches all paths).
     - **Upstream**: Select `test-backend`.
   - Click **Submit**.

### Method 2: Admin API (Programmatic/Advanced)

For automation or advanced users, use the APISIX Admin API.

#### Create Upstream

```bash
curl http://127.0.0.1:9180/apisix/admin/upstreams/1 \
  -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1" \
  -X PUT -d '{
    "name": "test-backend",
    "type": "roundrobin",
    "nodes": {
      "host.docker.internal:4001": 1
    },
    "checks": {
      "active": {
        "type": "http",
        "host": "host.docker.internal",
        "port": 4001,
        "http_path": "/api/health",
        "healthy": {"interval": 1, "successes": 2},
        "unhealthy": {"interval": 1, "http_failures": 5}
      }
    }
  }'
```

#### Create Route

```bash
curl http://127.0.0.1:9180/apisix/admin/routes/1 \
  -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1" \
  -X PUT -d '{
    "name": "test-service-route",
    "uri": "/*",
    "upstream_id": 1
  }'
```

### Method 3: WSL2 Auto-Configuration (Recommended for WSL2)

For WSL2 environments, use the automated setup script that detects your WSL2 IP and configures APISIX automatically:

```bash
# Run the WSL2-specific setup script
./scripts/setup-wsl2-apisix.sh
```

**What it does:**

- Detects if you're running in WSL2
- Automatically finds your WSL2 IP address
- Configures upstream with correct IP (instead of `host.docker.internal`)
- Sets up route configuration
- Tests the configuration

**Fallback for other environments:**

- On macOS/Linux: Uses `host.docker.internal`
- On WSL2: Uses detected WSL2 IP address

---

## Testing the Configuration

Verify that your setup works correctly with these tests.

### 1. Verify Upstream Configuration

```bash
curl -s http://127.0.0.1:9180/apisix/admin/upstreams/1 \
  -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1" | jq .
```

**Expected Output**: JSON response with `nodes` containing `"host.docker.internal:4001"`.

### 2. Check Health Status

```bash
curl -s http://127.0.0.1:9092/v1/healthcheck | jq .
```

**Expected Output**: Node status `"healthy"` for `host.docker.internal:4001`.

### 3. Test End-to-End Routing

Test the API through APISIX:

```bash
# Health endpoint
curl -s http://127.0.0.1:9080/api/health | jq .

# API endpoints
curl -s http://127.0.0.1:9080/api/users | jq .
curl -s -X POST http://127.0.0.1:9080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}' | jq .
```

**Expected Output**: Responses from your API server, not APISIX errors.

---

## Troubleshooting

### Common Issues & Fixes

1. **Connection Refused / 502 Bad Gateway**:
   - **Cause**: Upstream set to `localhost` instead of `host.docker.internal` (macOS/Linux) or WSL2 IP.
   - **Fix**:
     - macOS/Linux: Use `host.docker.internal:4001` in upstream nodes.
     - WSL2: Use `./scripts/setup-wsl2-apisix.sh` or manually use WSL2 IP.

2. **Health Check Shows Empty Nodes (WSL2)**:
   - **Cause**: Using `host.docker.internal` which points to Windows host, not WSL2 VM.
   - **Fix**: Run `./scripts/setup-wsl2-apisix.sh` to use correct WSL2 IP.

3. **Health Check Shows Empty Nodes (General)**:
   - **Cause**: Health checks not triggered yet.
   - **Fix**: Send a request to the route, then recheck health status.

4. **API Returns 404**:
   - **Cause**: Route URI mismatch.
   - **Fix**: Ensure route URI is `/*` to match all paths.

5. **Health Check Fails**:
   - **Cause**: API not running or `/api/health` endpoint missing.
   - **Fix**: Verify API server is running on port 4001 and health endpoint exists.

### Debug Commands

```bash
# Check API directly
curl http://localhost:4001/api/health

# View APISIX logs
docker-compose logs apisix

# Check ETCD health
docker exec shonchoy-etcd-1 etcdctl endpoint health
```

---

## Key Concepts

### Upstream

- **What**: Defines backend services, including server nodes, load balancing strategy, and health checks.
- **Example**: An upstream "api-backend" with nodes `host.docker.internal:4001` (weight: 1) and `host.docker.internal:4002` (weight: 2). Requests are distributed 33% to 4001 and 67% to 4002.
- **Purpose**: Manages a pool of backend servers, selecting healthy nodes for load balancing.

### Route

- **What**: Rules that match incoming requests and forward them to an upstream.
- **Example**: A route with URI `/*` and `upstream_id: 1` forwards all requests (e.g., `/api/users`, `/api/health`) to upstream ID 1.
- **Purpose**: Directs traffic based on request attributes (URI, method, headers).

### Health Checks

- **What**: Monitors upstream node availability, removing unhealthy nodes from the pool.
- **Example**: Probes `http://host.docker.internal:4001/api/health` every 1 second. After 5 consecutive failures, the node is marked unhealthy until recovery.
- **Purpose**: Ensures requests are routed only to available servers.

### host.docker.internal

- **What**: Docker DNS name to access the host machine from containers.
- **Example**: Resolves `localhost:4001` on the host to `host.docker.internal:4001` in APISIX container (e.g., `192.168.65.254` on macOS).
- **Purpose**: Enables container-to-host communication, critical for development setups.

---

## Next Steps

- Add multiple upstream nodes for better load balancing.
- Enable passive health checks for enhanced reliability.
- Configure SSL/TLS for secure production deployments.
- Implement rate limiting and authentication plugins for advanced control.

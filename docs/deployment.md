# APISIX Deployment Guide

This guide explains how to deploy APISIX with ETCD across different environments, from local development to production.

## How It Works Locally

### Current Setup

- **ETCD**: Local Docker container using environment variables (no config file mounting issues)
- **APISIX**: Connects to local ETCD via Docker network
- **Configuration**: All ETCD settings from `etcd.conf.yaml` are mapped to environment variables
- **Cross-Platform**: Works identically on macOS, WSL2, and Linux

### Configuration Approach

Your original `services/apisix/conf/etcd/etcd.conf.yaml` file is preserved for reference, but the actual configuration is passed via environment variables to avoid WSL2 file permission issues:

```yaml
# etcd.conf.yaml setting          →  Environment Variable
name: "default"                   →  ETCD_NAME: "default"
listen-client-urls: http://0.0.0.0:2379  →  ETCD_LISTEN_CLIENT_URLS: "http://0.0.0.0:2379"
snapshot-count: 10000             →  ETCD_SNAPSHOT_COUNT: "10000"
```

### Local Development Commands

```bash
# Start local development environment
docker-compose up -d

# Check status
docker-compose ps

# Test APISIX API
curl -i "http://127.0.0.1:9180/apisix/admin/routes" \
  -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1"

# View logs
docker-compose logs apisix
docker-compose logs etcd
```

## Production Deployment Options

### 1. Managed ETCD Services (Recommended)

Use cloud-managed ETCD services for production:

- **AWS**: Amazon Managed Service for ETCD
- **GCP**: Cloud Memorystore for ETCD
- **Azure**: Azure Cache for ETCD
- **Alibaba Cloud**: ApsaraDB for ETCD

### 2. Self-Managed ETCD Cluster

Deploy your own high-availability ETCD cluster:

- 3+ node ETCD cluster on VMs/containers
- Persistent storage with backups
- Load balancing and monitoring

### 3. Kubernetes with ETCD Operator

Use ETCD Operator for automated cluster management:

- Persistent volumes for data
- Automated backups and scaling
- Service discovery integration

## Deployment Configurations

### Production with External ETCD

```bash
# Set environment variables
export ETCD_HOST="etcd-cluster.example.com:2379"
export ETCD_USERNAME="apisix-user"
export ETCD_PASSWORD="secure-password"
export ENVIRONMENT="production"

# Deploy without local ETCD
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# Generate Kubernetes manifests
docker-compose -f docker-compose.yml -f docker-compose.k8s.yml config > k8s-manifest.yml

# Apply to cluster
kubectl apply -f k8s-manifest.yml
```

### Multi-Environment Support

```bash
# Development (default)
docker-compose up -d

# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Environment Variables

### Required for Production

- `ETCD_HOST`: ETCD cluster endpoints (comma-separated for HA)
- `ENVIRONMENT`: deployment environment (development/staging/production)

### Security Variables (Production)

- `ETCD_USERNAME`: ETCD authentication username
- `ETCD_PASSWORD`: ETCD authentication password
- `ETCD_CERT_FILE`: Client certificate path
- `ETCD_KEY_FILE`: Client private key path
- `ETCD_CA_FILE`: CA certificate path
- `APISIX_ADMIN_KEY`: Admin API key
- `APISIX_VIEWER_KEY`: Viewer API key

## Cloud Provider Examples

### AWS with Managed ETCD

```bash
export ETCD_HOST="etcd-cluster.us-west-2.amazonaws.com:2379"
export ETCD_USERNAME="apisix"
export ETCD_PASSWORD="$(aws secretsmanager get-secret-value --secret-id etcd-password --query SecretString --output text)"
```

### Google Cloud

```bash
export ETCD_HOST="etcd.us-central1.gcp.example.com:2379"
export ETCD_CERT_FILE="/etc/ssl/certs/etcd-client.pem"
export ETCD_KEY_FILE="/etc/ssl/private/etcd-client-key.pem"
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: apisix-config
data:
  ETCD_HOST: "etcd-cluster:2379"
  ENVIRONMENT: "production"
```

## Migration Strategy

1. **Development**: Local Docker setup with environment variables
2. **Staging**: Cloud-managed ETCD service for testing
3. **Production**: High-availability ETCD cluster or managed service

## File Structure

```
├── docker-compose.yml              # Base APISIX configuration
├── docker-compose.override.yml     # Local development with ETCD
├── docker-compose.prod.yml         # Production without local ETCD
├── docker-compose.k8s.yml          # Kubernetes-optimized config
├── services/apisix/conf/
│   ├── config.yaml                 # APISIX configuration
│   ├── config.prod.yaml            # Production APISIX config
│   └── etcd/etcd.conf.yaml         # ETCD config (reference only)
└── scripts/
    ├── deploy-production.sh        # Production deployment script
    └── show-etcd-config.sh          # Configuration analysis tool
```

## Benefits of This Approach

✅ **Cross-platform compatibility**: Works identically on macOS, Linux, WSL2  
✅ **No file permission issues**: Uses environment variables instead of volume mounts  
✅ **Production-ready**: Supports external ETCD services and authentication  
✅ **Security-first**: Configurable access controls and TLS support  
✅ **Scalable**: Easy to scale with managed services  
✅ **DevOps friendly**: Standard Docker Compose patterns  
✅ **Configuration preserved**: Original config files kept for reference

## Troubleshooting

### Common Issues

1. **Connection refused**: Check if ETCD container is running and healthy
2. **Permission denied**: Ensure using environment variables, not file mounts
3. **Timeout errors**: Verify network connectivity between APISIX and ETCD

### Health Checks

```bash
# Check ETCD health
docker exec shonchoy-etcd-1 etcdctl --endpoints=http://localhost:2379 endpoint health

# Check APISIX status
curl -s http://127.0.0.1:9180/apisix/admin/routes -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1"

# View configuration mapping
./scripts/show-etcd-config.sh
```

This deployment approach ensures consistent behavior across all environments while maintaining your original configuration preferences.

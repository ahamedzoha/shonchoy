#!/bin/bash
set -e

echo "🚀 Deploying APISIX to Production"

# Load production environment
if [ -f .env.production ]; then
    echo "📋 Loading production environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "❌ .env.production file not found!"
    exit 1
fi

# Validate required variables
required_vars=("ETCD_HOST" "ENVIRONMENT")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment: $ENVIRONMENT"
echo "✅ ETCD Host: $ETCD_HOST"

# Deploy using production compose file
echo "🐳 Starting APISIX with external ETCD..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for APISIX to be ready
echo "⏳ Waiting for APISIX to be ready..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if curl -s "http://127.0.0.1:9180/apisix/admin/routes" -H "X-API-KEY: $APISIX_ADMIN_KEY" > /dev/null 2>&1; then
        echo "✅ APISIX is ready!"
        break
    fi
    counter=$((counter + 5))
    sleep 5
done

if [ $counter -ge $timeout ]; then
    echo "❌ APISIX failed to start within $timeout seconds"
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
echo "📊 Admin API: http://your-domain:9180/apisix/admin/"
echo "🌐 Gateway API: http://your-domain:9080/"

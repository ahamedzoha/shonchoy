#!/bin/bash

echo "🔧 ETCD Configuration Analysis"
echo "================================"

echo ""
echo "📄 Your etcd.conf.yaml settings:"
echo "--------------------------------"
grep -E "^(name|data-dir|listen-client-urls|listen-peer-urls|advertise-client-urls|initial-advertise-peer-urls|initial-cluster|initial-cluster-state|initial-cluster-token|enable-v2):" services/apisix/conf/etcd/etcd.conf.yaml

echo ""
echo "🌍 Docker Compose Environment Variables:"
echo "---------------------------------------"
docker-compose config | grep -A 20 "etcd:" | grep -E "(ETCD_|ALLOW_)"

echo ""
echo "🔍 Running ETCD Container Settings:"
echo "----------------------------------"
if docker ps | grep -q etcd; then
    echo "✅ ETCD container is running"
    echo "Container environment:"
    docker exec shonchoy-etcd-1 printenv | grep ETCD_ | head -10
else
    echo "❌ ETCD container is not running"
fi

echo ""
echo "📋 Configuration Priority:"
echo "-------------------------"
echo "1. Environment variables (highest priority)"
echo "2. Config file settings"
echo "3. Default values"
echo ""
echo "Your config file is mounted at: /opt/bitnami/etcd/conf/etcd.conf.yaml"
echo "But environment variables will override file settings in Bitnami ETCD."

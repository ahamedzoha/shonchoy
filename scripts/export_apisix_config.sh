#!/bin/bash
# scripts/export-apisix-configs.sh
# Export all APISIX configs to JSON files

mkdir -p services/apisix/conf/exports

# Export routes
curl -s http://127.0.0.1:9180/apisix/admin/routes \
  -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1" \
  > services/apisix/conf/exports/routes.json

# Export upstreams
curl -s http://127.0.0.1:9180/apisix/admin/upstreams \
  -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1" \
  > services/apisix/conf/exports/upstreams.json

# Add other resources as needed (services, plugins, etc.)

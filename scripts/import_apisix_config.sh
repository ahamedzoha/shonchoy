#!/bin/bash
# scripts/import-apisix-configs.sh
# Import configs from JSON files to APISIX

set -e  # Exit on any error

# Function to import resources
import_resources() {
    local endpoint=$1
    local json_file=$2
    local resource_type=$3
    
    if [ ! -f "$json_file" ]; then
        echo "Warning: $json_file not found, skipping $resource_type import"
        return
    fi
    
    echo "Importing $resource_type from $json_file..."
    
    # Use jq to extract each item from the list and filter out forbidden fields
    jq -c '.list[]' "$json_file" | while read -r item; do
        # Extract the ID from the key (e.g., "/apisix/routes/1" -> "1")
        local id=$(echo "$item" | jq -r '.key | split("/") | last')
        # Extract the value and remove forbidden fields
        local config=$(echo "$item" | jq -c '.value | del(.id, .create_time, .update_time)')
        
        echo "Creating $resource_type with ID: $id"
        
        # PUT the config to create/update the resource
        curl -s -X PUT "http://127.0.0.1:9180/apisix/admin/$endpoint/$id" \
            -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1" \
            -H "Content-Type: application/json" \
            -d "$config" | jq . || echo "Failed to import $resource_type $id"
    done
}

# Import upstreams FIRST (routes depend on them)
import_resources "upstreams" "services/apisix/conf/exports/upstreams.json" "upstreams"

# Import routes SECOND (after upstreams are available)
import_resources "routes" "services/apisix/conf/exports/routes.json" "routes"

echo "Import completed!"

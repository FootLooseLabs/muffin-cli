#!/bin/bash

source ~/.bashrc

PACKAGE_NAME=$1
TARGET_DIR=$2

# Ensure ELEMENT_COMPONENTS_REGISTRY is set
if [ -z "$ELEMENT_COMPONENTS_REGISTRY" ]; then
  echo "❌ Error: ELEMENT_COMPONENTS_REGISTRY is not set."
  echo "➡️ Run 'source ~/.bashrc' or re-run the init script."
  exit 1
fi

REGISTRY_REPO_PATH="$ELEMENT_COMPONENTS_REGISTRY"
MAPPING_FILE="component-mapping.json"

if [ -z "$PACKAGE_NAME" ]; then
  echo "❌ Error: Missing package name!"
  echo "Usage: npm run pull-component -- <package-name> [target-directory]"
  echo "Example: npm run pull-component -- @route-utils/render-at-route ./components"
  exit 1
fi

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
  echo "❌ Error: 'jq' is required but not installed."
  exit 1
fi

# Clone shared repo to get latest mapping
rm -rf element-registry-repo
git clone "$REGISTRY_REPO_PATH" element-registry-repo
cd element-registry-repo || exit 1

# Ensure mapping file exists
if [ ! -f "$MAPPING_FILE" ]; then
  echo "❌ Error: Mapping file '$MAPPING_FILE' not found in the shared repository."
  cd ..
  rm -rf element-registry-repo
  exit 1
fi

# Read mapping file
COMPONENT_URL=$(jq -r --arg key "$PACKAGE_NAME" '.[$key].curlUrl // empty' "$MAPPING_FILE")

# Cleanup and exit if not found
cd ..
rm -rf element-registry-repo
if [ -z "$COMPONENT_URL" ]; then
  echo "❌ Error: No mapping found for '$PACKAGE_NAME'. Did you push it first?"
  exit 1
fi

# If no target directory is provided, default to the current directory
if [ -z "$TARGET_DIR" ]; then
  TARGET_DIR=$(pwd)
fi

# Ensure target directory exists
mkdir -p "$TARGET_DIR"

# Output the URL and target folder being used
echo "🔄 Curling URL: $COMPONENT_URL"
echo "📂 Saving component to folder: $TARGET_DIR"

# Pull the component using curl and capture the HTTP response code
HTTP_STATUS=$(curl -w "%{http_code}" -X GET -H "Authorization: token $ELEMENT_PACKAGE_MANAGER_PAN" "$COMPONENT_URL" -o "$TARGET_DIR/$(basename "$COMPONENT_URL")")

# Check if the HTTP status is 200 (OK)
if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "❌ Error: Failed to pull component. HTTP Status: $HTTP_STATUS"
  # Optionally, log the error details to a file or console for further investigation
  echo "Failed to pull component from $COMPONENT_URL. HTTP Status: $HTTP_STATUS" >> curl-error.log
  exit 1
fi

echo "✅ Done!"
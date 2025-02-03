#!/bin/bash

# Resolve script directory even when installed globally
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

CONFIG_FILE=$1

if [ -z "$CONFIG_FILE" ]; then
  echo "❌ Error: No configuration file provided."
  echo "Usage: push-components <config-file.json>"
  exit 1
fi

CONFIG_FILE="$(realpath "$CONFIG_FILE")"  # Get absolute path to config file
CONFIG_DIR="$(dirname "$CONFIG_FILE")"    # Get directory of config file

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Error: Configuration file '$CONFIG_FILE' not found."
  exit 1
fi

COMPONENTS=$(jq -c '.[]' "$CONFIG_FILE")

if [ -z "$COMPONENTS" ]; then
  echo "❌ Error: Configuration file must contain a list of components."
  exit 1
fi

for COMPONENT in $COMPONENTS; do
  REMOTE=$(echo "$COMPONENT" | jq -r '.remote')
  BRANCH=$(echo "$COMPONENT" | jq -r '.branch')
  COMPONENT_PATH=$(echo "$COMPONENT" | jq -r '.path')
  PACKAGE_NAME=$(echo "$COMPONENT" | jq -r '.package')

  if [ -z "$REMOTE" ] || [ -z "$BRANCH" ] || [ -z "$COMPONENT_PATH" ] || [ -z "$PACKAGE_NAME" ]; then
    echo "❌ Error: Each component entry must have 'remote', 'branch', 'path', and 'package'."
    continue
  fi

  echo "🚀 Switching to branch: $BRANCH..."
  git fetch "$REMOTE" "$BRANCH"
  git checkout "$BRANCH"

  if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to switch to branch '$BRANCH'. Skipping $PACKAGE_NAME."
    continue
  fi

  echo "🚀 Pushing component: $PACKAGE_NAME ($COMPONENT_PATH) from $BRANCH to $REMOTE..."
  
  # Ensure the correct path to `push-component.sh` is used
  "$SCRIPT_DIR/push-component.sh" "$REMOTE" "$COMPONENT_PATH" "$PACKAGE_NAME"

  if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed $PACKAGE_NAME from $BRANCH"
  else
    echo "❌ Failed to push $PACKAGE_NAME"
  fi

done

echo "🎉 All components processed!"
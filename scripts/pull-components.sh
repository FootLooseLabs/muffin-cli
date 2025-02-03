#!/bin/bash

# Resolve script directory even when installed globally
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

CONFIG_FILE=$1

if [ -z "$CONFIG_FILE" ]; then
  echo "❌ Error: No configuration file provided."
  echo "Usage: pull-components <config-file.json>"
  exit 1
fi

CONFIG_FILE="$(realpath "$CONFIG_FILE")"  # Get absolute path to config file
CONFIG_DIR="$(dirname "$CONFIG_FILE")"    # Get directory of config file

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Error: Configuration file '$CONFIG_FILE' not found."
  exit 1
fi

ENTRIES=$(jq -c '.[]' "$CONFIG_FILE")

if [ -z "$ENTRIES" ]; then
  echo "❌ Error: Configuration file must contain a list of target directories with packages."
  exit 1
fi

for ENTRY in $ENTRIES; do
  TARGET_DIR=$(echo "$ENTRY" | jq -r '.targetDir')
  PACKAGES=$(echo "$ENTRY" | jq -c '.packages[]')

  if [ -z "$TARGET_DIR" ] || [ -z "$PACKAGES" ]; then
    echo "❌ Error: Each entry must have 'targetDir' and at least one package."
    continue
  fi

  for PACKAGE_NAME in $PACKAGES; do
    PACKAGE_NAME=$(echo "$PACKAGE_NAME" | tr -d '"')  # Remove surrounding quotes

    echo "🚀 Pulling package: $PACKAGE_NAME into $TARGET_DIR..."
    
    # Ensure the correct path to `pull-component.sh` is used
    "$SCRIPT_DIR/pull-component.sh" "$PACKAGE_NAME" "$TARGET_DIR"

    if [ $? -eq 0 ]; then
      echo "✅ Successfully pulled $PACKAGE_NAME"
    else
      echo "❌ Failed to pull $PACKAGE_NAME"
    fi
  done
done

echo "🎉 All components processed!"
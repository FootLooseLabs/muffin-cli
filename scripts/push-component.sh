#!/bin/bash

source ~/.bashrc

REMOTE_NAME=$1  # First argument for remote name (upstream, origin, etc.)
COMPONENT_PATH=$2  # Second argument for the component path
PACKAGE_NAME=$3  # Third argument for the package name

echo "COMPONENT_PATH: $REMOTE_NAME:$COMPONENT_PATH"
echo "PACKAGE_NAME: $PACKAGE_NAME"

# Ensure ELEMENT_COMPONENTS_REGISTRY is set
if [ -z "$ELEMENT_COMPONENTS_REGISTRY" ]; then
  echo "❌ Error: ELEMENT_COMPONENTS_REGISTRY is not set."
  echo "➡️ Run 'source ~/.bashrc' or re-run the init script."
  exit 1
fi

REPO_PATH="$ELEMENT_COMPONENTS_REGISTRY"
MAPPING_FILE="component-mapping.json" # Stored in the shared repo
TMP_DIR=".subtree-tmp"

if [ -z "$COMPONENT_PATH" ] || [ -z "$PACKAGE_NAME" ] || [ -z "$REMOTE_NAME" ]; then
  echo "❌ Error: Missing arguments!"
  echo "Usage: npm run push-component -- <remote-name> <component-path> <package-name>"
  echo "Example: npm run push-component -- upstream src/components/utils/render-at-route.js @route-utils/render-at-route"
  exit 1
fi

# Ensure package name follows correct format
if [[ ! "$PACKAGE_NAME" =~ ^@[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$ ]]; then
  echo "❌ Error: Package name must follow format @namespace/name (e.g., @route-utils/render-at-route)"
  exit 1
fi

# Ensure `jq` is installed
if ! command -v jq &> /dev/null; then
  echo "❌ Error: 'jq' is required but not installed."
  exit 1
fi

# Get the remote URL for the specified remote name
REPO_URL=$(git config --get remote.$REMOTE_NAME.url)

# Ensure the remote URL is valid
if [ -z "$REPO_URL" ]; then
  echo "❌ Error: Could not find the remote URL for '$REMOTE_NAME'."
  exit 1
fi

# Get the branch name of the component
COMPONENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Active component branch: $COMPONENT_BRANCH"

# Token for accessing the raw file (ensure this is set in your environment or replace with a variable)
GITHUB_TOKEN="${GITHUB_TOKEN}"  # You can set this token in your environment or in ~/.bashrc

# Construct the raw URL for the component (with the token for private access)
if [[ "$REPO_URL" == https://* ]]; then
  # For HTTPS, remove the 'https://github.com' part and the '.git' suffix
  COMPONENT_REPO_URL="https://raw.githubusercontent.com/$(echo $REPO_URL | sed 's/https:\/\/github\.com\///;s/.git//')/refs/heads/$COMPONENT_BRANCH/$COMPONENT_PATH"
elif [[ "$REPO_URL" == git@* ]]; then
  # For SSH, change the format to match the raw URL structure
  COMPONENT_REPO_URL="https://raw.githubusercontent.com/$(echo $REPO_URL | sed 's/git@github\.com://;s/.git//')/refs/heads/$COMPONENT_BRANCH/$COMPONENT_PATH"
else
  echo "❌ Error: Unsupported remote URL format."
  exit 1
fi

# Handle single file push by wrapping in a directory
if [ -f "$COMPONENT_PATH" ]; then
  echo "📌 Detected a file. Creating a temporary directory..."
  mkdir -p "$TMP_DIR"
  cp --parents "$COMPONENT_PATH" "$TMP_DIR"
  COMPONENT_PATH="$TMP_DIR"
elif [ ! -d "$COMPONENT_PATH" ]; then
  echo "❌ Error: '$COMPONENT_PATH' is neither a file nor a directory."
  exit 1
fi

# Clone shared repo to update mapping
rm -rf shared-repo
git clone "$REPO_PATH" shared-repo
cd shared-repo || exit 1

# Ensure the mapping file exists
if [ ! -f "$MAPPING_FILE" ]; then
  echo "{}" > "$MAPPING_FILE"
fi

# Update mapping file with the correct URL, branch, and raw file URL
echo "🔗 Storing mapping: $PACKAGE_NAME → $COMPONENT_REPO_URL (Branch: $COMPONENT_BRANCH)"
jq --arg key "$PACKAGE_NAME" --arg value "$COMPONENT_REPO_URL" --arg branch "$COMPONENT_BRANCH" \
   '.[$key] = { "url": $value, "branch": $branch, "curlUrl": $value }' "$MAPPING_FILE" > tmp.json && mv tmp.json "$MAPPING_FILE"

# Commit and push mapping changes
git add "$MAPPING_FILE"
git commit -m "Updated mapping for $PACKAGE_NAME"
git push origin main

# Push the actual component
cd ..
git subtree push --prefix="$COMPONENT_PATH" "$REPO_PATH" main

# Cleanup
rm -rf shared-repo
if [ -d "$TMP_DIR" ]; then
  echo "🧹 Cleaning up temporary directory..."
  rm -rf "$TMP_DIR"
fi

echo "✅ Done!"
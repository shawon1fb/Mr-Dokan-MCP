#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Docker Hub Username and Repository name
USERNAME="shawon1fb"
IMAGE_NAME="mr-dokan-mcp-server"
REPO="$USERNAME/$IMAGE_NAME"

# Read version from package.json using Node.js
VERSION=$(node -p "require('./package.json').version")

echo "📦 Building and pushing Docker image for version: $VERSION and latest (linux/amd64)..."
docker buildx build --platform linux/amd64 -t "$REPO:$VERSION" -t "$REPO:latest" --push .

echo "✅ Successfully built and pushed $REPO:$VERSION and $REPO:latest"

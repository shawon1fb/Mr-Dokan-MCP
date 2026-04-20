#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Docker Hub Username and Repository name
USERNAME="shawon1fb"
IMAGE_NAME="mr-dokan-mcp-server"
REPO="$USERNAME/$IMAGE_NAME"

# Read version from package.json using Node.js
VERSION=$(node -p "require('./package.json').version")

echo "📦 Building Docker image for version: $VERSION..."
docker build -t "$REPO:$VERSION" .

echo "🏷️ Tagging as latest..."
docker tag "$REPO:$VERSION" "$REPO:latest"

echo "🚀 Pushing version $VERSION to Docker Hub..."
docker push "$REPO:$VERSION"

echo "🚀 Pushing latest to Docker Hub..."
docker push "$REPO:latest"

echo "✅ Successfully built and pushed $REPO:$VERSION and $REPO:latest"

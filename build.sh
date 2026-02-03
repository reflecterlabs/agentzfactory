#!/bin/bash
# Build script for Cloudflare Pages

# Get the creation ID from environment or use latest
CREATION_ID=${CREATION_ID:-"creation_1738626901234_abcd1234"}

echo "Building creation: $CREATION_ID"

# Go to creation directory
cd "creations/$CREATION_ID"

# Install dependencies
npm install

# Build
npm run build

# Copy dist to root (for Cloudflare Pages)
cp -r dist/* ../../dist/

echo "Build complete!"

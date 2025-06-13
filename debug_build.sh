#!/bin/bash

echo "=== Environment Variables Debug ==="
echo "NODE_ENV: $NODE_ENV"
echo "GITHUB_PAGES: $GITHUB_PAGES" 
echo "NEXT_PUBLIC_GITHUB_PAGES: $NEXT_PUBLIC_GITHUB_PAGES"
echo ""

echo "=== Testing GitHub Build Script ==="
export NEXT_PUBLIC_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)
export NEXT_PUBLIC_GITHUB_PAGES=true
export GITHUB_PAGES=true
export NODE_ENV=production

echo "After setting variables:"
echo "NODE_ENV: $NODE_ENV"
echo "GITHUB_PAGES: $GITHUB_PAGES"
echo "NEXT_PUBLIC_GITHUB_PAGES: $NEXT_PUBLIC_GITHUB_PAGES"
echo ""

echo "Running build..."
next build

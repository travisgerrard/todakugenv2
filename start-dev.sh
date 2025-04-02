#!/bin/bash
cd /root/todakugenv2

# Kill any existing processes on port 3001
fuser -k 3001/tcp 2>/dev/null || true

# Start the development server with the src-loader
HOST=localhost PORT=3001 NODE_OPTIONS="--require ./src-loader.js" npm run dev 
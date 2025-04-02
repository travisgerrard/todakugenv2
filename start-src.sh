#!/bin/bash
cd /root/todakugenv2

# Check if standalone server exists, otherwise fall back to next start
if [ -f ".next/standalone/server.js" ]; then
  echo "Starting standalone server..."
  cd .next/standalone
  PORT=5001 NODE_ENV=production node server.js
else
  echo "Standalone server not found, using next start..."
  NODE_OPTIONS="--require ./src-loader.js" next start -p 5001
fi

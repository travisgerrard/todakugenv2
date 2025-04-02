#!/bin/bash
cd /root/todakugenv2

# Kill any existing processes on ports 5001 and 3000
echo "Stopping any existing processes on ports 5001 and 3000..."
fuser -k 5001/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

# Check if standalone server exists
if [ -f ".next/standalone/server.js" ]; then
  echo "Starting standalone server..."
  cd .next/standalone
  echo "Setting PORT=5001..."
  export PORT=5001
  # Run the server without any host binding (all interfaces)
  NODE_ENV=production node server.js
else
  echo "Standalone server not found, using next start..."
  # Use the Next.js start command
  cd /root/todakugenv2
  NODE_OPTIONS="--require ./src-loader.js" next start -p 5001
fi

#!/bin/bash
cd /home/z/my-project
export NODE_ENV=production
export PORT=3000
export HOSTNAME=0.0.0.0

while true; do
  echo "Starting server at $(date)" >> /home/z/my-project/daemon-loop.log
  node .next/standalone/server.js >> /home/z/my-project/daemon-loop.log 2>&1
  echo "Server exited at $(date), restarting in 3s..." >> /home/z/my-project/daemon-loop.log
  sleep 3
done

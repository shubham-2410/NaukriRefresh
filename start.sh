#!/bin/bash
pkill Xvfb 2>/dev/null || true
sleep 1
Xvfb :99 -screen 0 1366x768x24 &
sleep 2
export DISPLAY=:99
node /home/NaukriRefresh/scheduler.js

#!/bin/sh

set -eu

if command -v apk > /dev/null; then
  apk add --no-cache autoconf automake build-base curl git libtool python3
fi

nodeMajor=$(node -p 'process.versions.node.split(".")[0]')
if [ "$nodeMajor" -lt 18 ]; then
  echo "Node 18 or later is required, found $(node --version)" >&2
  exit 1
fi

npmMajor=$(npm --version | cut -d. -f1)
if [ "$npmMajor" -lt 9 ]; then
  # npm 8 rejects lockfiles that replace a transitive dependency through overrides.
  npm install --global --no-audit --no-fund npm@9.9.4
fi
npm ci --ignore-scripts
cd /usr/workspace
node /usr/action

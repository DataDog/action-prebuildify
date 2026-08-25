#!/usr/bin/env bash

set -euo pipefail

if command -v apk > /dev/null; then
  apk add --no-cache autoconf automake libtool nodejs npm
  PATH=/usr/bin:$PATH
else
  case "$(uname -m)" in
    aarch64)
      nodeArch=arm64
      nodeChecksum=2e3dfc51154e6fea9fc86a90c4ea8f3ecb8b60acaf7367c4b76691da192571c1
      ;;
    armv7l)
      nodeArch=armv7l
      nodeChecksum=d09ea19ff5eb7b0ff47d80316c708092ac401c138254e018e21b89bb6ed9abd0
      ;;
    x86_64)
      nodeArch=x64
      nodeChecksum=27a9f3f14d5e99ad05a07ed3524ba3ee92f8ff8b6db5ff80b00f9feb5ec8097a
      ;;
    *)
      echo "Node 18 does not support $(uname -m) Linux builders" >&2
      exit 1
      ;;
  esac

  nodeDirectory=$(mktemp -d)
  nodeArchive="$nodeDirectory/node.tar.gz"
  curl --fail --location --silent --show-error --output "$nodeArchive" \
    "https://nodejs.org/dist/v18.20.8/node-v18.20.8-linux-$nodeArch.tar.gz"
  echo "$nodeChecksum  $nodeArchive" | sha256sum --check --status
  tar -xzf "$nodeArchive" --directory "$nodeDirectory" --strip-components=1
  PATH="$nodeDirectory/bin:$PATH"
fi

export PATH

nodeMajor=$(node -p 'process.versions.node.split(".")[0]')
if [ "$nodeMajor" -lt 18 ]; then
  echo "Node 18 or later is required, found $(node --version)" >&2
  exit 1
fi

npm ci --ignore-scripts
cd /usr/workspace
node /usr/action

#!/bin/bash
set -eo pipefail
shopt -s nullglob

echo "NODE_ENV: ${NODE_ENV}"

yarn test:e2e

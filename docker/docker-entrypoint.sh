#!/bin/sh
set -e

echo "NODE_ENV: ${NODE_ENV}"

yarn migration:run

exec "$@"

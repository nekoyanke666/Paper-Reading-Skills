#!/bin/sh
cd -- "$(dirname -- "$0")" || exit 1
node .paper-map/map-server.cjs --root . --open

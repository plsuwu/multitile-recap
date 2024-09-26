#!/usr/bin/env bash
set -euo pipefail

wait-for-it "${REDIS_HOST}":"${REDIS_PORT}" -t 60

printf "\n=========\n[+] STARTING BUILD\n=========\n"
bun run build

printf "\n=========\n[+] BUILD OK\n=========\n"
bun run build/index.js

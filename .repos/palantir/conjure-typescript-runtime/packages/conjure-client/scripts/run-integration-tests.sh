#!/usr/bin/env bash

set -euo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

"$DIR/build/downloads/bin/conjure-verification-server" ./build/resources/verification-server-test-cases.json ./build/resources/verification-server-api.conjure.json &
SERVER_PID=$!
yarn karma start --single-run --browsers ChromeHeadless karma.conf.js
kill -kill ${SERVER_PID}
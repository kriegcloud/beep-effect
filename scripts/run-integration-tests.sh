#!/usr/bin/env bash

set -euo pipefail

./build/downloads/bin/conjure-verification-server ./build/resources/verification-server-test-cases.json ./build/resources/verification-server-api.conjure.json &
SERVER_PID=$!
yarn karma start --single-run --browsers ChromeHeadless karma.conf.js

if ps -p ${SERVER_PID} > /dev/null
then
    kill -kill ${SERVER_PID}
fi

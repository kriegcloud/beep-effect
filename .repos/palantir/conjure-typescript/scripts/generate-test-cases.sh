#!/usr/bin/env bash

set -euo pipefail

CONJURE=build/conjure/bin/conjure
TEST_CASE_DIR="build/ir-test-cases"

rm -rf ${TEST_CASE_DIR}
mkdir -p ${TEST_CASE_DIR}

for RELATIVE_PATH in src/commands/generate/__tests__/resources/definitions/*; do
    FILE_NAME=${RELATIVE_PATH##*/}
    ${CONJURE} compile "$RELATIVE_PATH" "${TEST_CASE_DIR}/${FILE_NAME%.*}.json"
done

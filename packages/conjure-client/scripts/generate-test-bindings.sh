#!/usr/bin/env bash

set -euo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

CONJURE_TYPESCRIPT="$DIR/build/conjure-typescript/bin/conjure-typescript"
TEST_DIR="$DIR/src/__integTest__/__generated__"

# Clear directory before regenerating
if [ -e "$TEST_DIR/index.ts" ]; then
    rm -rf "$TEST_DIR/conjure-verification" "$TEST_DIR/index.ts"
fi

"$CONJURE_TYPESCRIPT" generate build/resources/verification-server-api.conjure.json "$TEST_DIR" --rawSource

REPLACE_STRING="s|conjure-client|../../../httpApiBridge|g"

# Replace replaces references to point to internal package
case $(uname -s) in
    Linux*) find "$TEST_DIR" -name "*.ts" -type f -exec sed -i "${REPLACE_STRING}" {} \;;;
    Darwin*) find "$TEST_DIR" -name "*.ts" -type f -exec sed -i "" "${REPLACE_STRING}" {} \;;
esac

# Patch in readable streams until generator supports it

STREAM_INTERFACE_REPLACE="s|receiveBinaryAliasExample(index: number): Promise<Blob>|receiveBinaryAliasExample(index: number): Promise<ReadableStream<Uint8Array>>|g"
STREAM_IMPL_REPLACE="s|return this.bridge.callEndpoint<Blob>({|return this.bridge.callEndpoint<ReadableStream<Uint8Array>>({\\
            binaryAsStream: true,|g"

case $(uname -s) in
    Linux*)
      find "$TEST_DIR" -name "*.ts" -type f -exec sed -i "${STREAM_INTERFACE_REPLACE}" {} \;
      find "$TEST_DIR" -name "*.ts" -type f -exec sed -i "${STREAM_IMPL_REPLACE}" {} \;
    ;;
    Darwin*)
      find "$TEST_DIR" -name "*.ts" -type f -exec sed -i "" "${STREAM_INTERFACE_REPLACE}" {} \;
      find "$TEST_DIR" -name "*.ts" -type f -exec sed -i "" "${STREAM_IMPL_REPLACE}" {} \;
    ;;
esac

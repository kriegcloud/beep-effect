#!/bin/bash

set -ex
set -o pipefail

mkdir -p src/generated
echo "export const IMPLEMENTATION_VERSION = '"${CIRCLE_TAG:-"0.0.0"}"';" > src/generated/index.ts


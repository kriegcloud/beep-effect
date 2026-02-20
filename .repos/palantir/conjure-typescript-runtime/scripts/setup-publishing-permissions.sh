#!/bin/bash

set -ex
set -o pipefail

if [ -z ${CIRCLECI+x} ]; then
    echo "Not on Circle; refusing to run."
    exit 1
fi

# Generate npmrc, ensure it is readable
set +x
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > .npmrc
set -x
chmod +r .npmrc

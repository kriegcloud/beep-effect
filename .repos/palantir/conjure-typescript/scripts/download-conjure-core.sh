#!/usr/bin/env bash

set -euo pipefail

VERSION="$(grep "^com.palantir.conjure:conjure" < versions.props | tail -1 | sed 's/^com.palantir.conjure:conjure = \(.*\)$/\1/')"
ARTIFACT_NAME="conjure-${VERSION}"
DOWNLOAD_OUTPUT="build/downloads/conjure.tgz"

mkdir -p build/downloads
curl -L "https://repo1.maven.org/maven2/com/palantir/conjure/conjure/${VERSION}/${ARTIFACT_NAME}.tgz" -o "$DOWNLOAD_OUTPUT"

tar xf "$DOWNLOAD_OUTPUT" -C build
[ ! -d "build/conjure/$ARTIFACT_NAME" ] && mv "build/$ARTIFACT_NAME" build/conjure || true

#!/usr/bin/env bash

set -euo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

VERSION="$(grep "^com.palantir.conjure.verification:*" < ../../versions.props | tail -1 | sed 's/^com.palantir.conjure.verification:\* = \(.*\)$/\1/')"
TEST_CASES="verification-server-test-cases"
API="verification-server-api"
SERVER="verification-server"

DOWNLOADS_DIR="$DIR/build/downloads"
RESOURCES_DIR="$DIR/build/resources"

mkdir -p "$DOWNLOADS_DIR"/bin
mkdir -p "$RESOURCES_DIR"

function download() {
  basename=$(basename "$1")
  target="$DOWNLOADS_DIR"/"$basename"
  if [[ ! -f "$target" ]]; then
    curl -L --fail "$1" -o "$target"
  fi
  echo "$target"
}

DOWNLOAD_OUTPUT="$RESOURCES_DIR/${API}.conjure.json"
ARTIFACT_NAME="${API}-${VERSION}.conjure.json"
out=$(download "https://repo1.maven.org/maven2/com/palantir/conjure/verification/${API}/${VERSION}/${ARTIFACT_NAME}")
cp -f "$out" "$DOWNLOAD_OUTPUT"

DOWNLOAD_OUTPUT="$RESOURCES_DIR/${TEST_CASES}.json"
ARTIFACT_NAME="${TEST_CASES}-${VERSION}.json"
out=$(download "https://repo1.maven.org/maven2/com/palantir/conjure/verification/${TEST_CASES}/${VERSION}/${ARTIFACT_NAME}")
cp -f "$out" "$DOWNLOAD_OUTPUT"


case $(uname -s) in
    Linux*) TARGET=linux ;;
    Darwin*) TARGET=osx ;;
    *) echo "Unsupported OS" >&2; exit 1;;
esac

ARTIFACT_NAME="${SERVER}-${VERSION}-${TARGET}.tgz"
out=$(download "https://repo1.maven.org/maven2/com/palantir/conjure/verification/${SERVER}/${VERSION}/${ARTIFACT_NAME}")
tar xf "$out" -C "$DOWNLOADS_DIR/bin"
chmod +x "$DOWNLOADS_DIR/bin/conjure-verification-server"

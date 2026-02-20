#!/bin/sh

set -e

echo "Installing openssl development packages"

sudo apt-get update -q
sudo apt-get install -qy libssl-dev

sudo ln -s /lib/x86_64-linux-gnu/libcrypt.so /usr/lib/libcrypto.so
sudo ln -s /lib/x86_64-linux-gnu/libcrypt.so /usr/lib64/libcrypto.so

echo "Linked openssl /usr/lib/libcrypto.so"

ls -al /lib/libcrypto* /usr/lib/libcrypto* /usr/lib64/libcrypto* /usr/lib/x86_64-linux-gnu/libcrypto*

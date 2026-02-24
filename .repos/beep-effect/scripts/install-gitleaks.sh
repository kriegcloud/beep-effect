#!/bin/bash
# Install gitleaks for secret detection

set -e

VERSION="8.21.2"
INSTALL_DIR="${HOME}/.local/bin"

echo "Installing gitleaks v${VERSION}..."

# Create install directory if it doesn't exist
mkdir -p "${INSTALL_DIR}"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "${ARCH}" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: ${ARCH}"; exit 1 ;;
esac

case "${OS}" in
  darwin) OS="darwin" ;;
  linux) OS="linux" ;;
  *) echo "Unsupported OS: ${OS}"; exit 1 ;;
esac

DOWNLOAD_URL="https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}/gitleaks_${VERSION}_${OS}_${ARCH}.tar.gz"

echo "Downloading from: ${DOWNLOAD_URL}"
curl -sSL "${DOWNLOAD_URL}" | tar xz -C "${INSTALL_DIR}" gitleaks

# Make executable
chmod +x "${INSTALL_DIR}/gitleaks"

echo ""
echo "Installed gitleaks to ${INSTALL_DIR}/gitleaks"
echo ""

# Check if install dir is in PATH
if [[ ":${PATH}:" != *":${INSTALL_DIR}:"* ]]; then
  echo "Add ${INSTALL_DIR} to your PATH:"
  echo ""
  echo "  export PATH=\"\${HOME}/.local/bin:\${PATH}\""
  echo ""
  echo "Add this to your ~/.bashrc or ~/.zshrc"
else
  echo "Verifying installation..."
  gitleaks version
fi

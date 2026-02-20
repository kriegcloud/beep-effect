/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

/**
 * Gets the version from the package.json file.
 *
 * During development, reads from the local package.json.
 * When published as an npm package, reads from the package.json
 * that gets set by CircleCI during the publish process.
 *
 * To test locally:
 * 1. npm version 1.2.3-test --no-git-tag-version
 * 2. npm run build
 * 3. npm pack
 * 4. Test with: npx -y ./palantir-mcp-1.2.3-test.tgz --version
 */
export function getPackageVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const currentDir = dirname(__filename)

    // When bundled, we need to find the package root by looking for package.json
    // Try different levels up the directory tree
    const attempts = [
      // For bundled code: dist/index.js -> ../package.json
      '../package.json',
      // For unbundled dev code: src/utils/packageInfo.js -> ../../package.json
      '../../package.json',
      '../../../package.json',
      // In case of different bundling: try current directory
      'package.json',
    ].map((path) => join(currentDir, path))

    for (const packagePath of attempts) {
      try {
        const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
        if (pkg.version) {
          return pkg.version
        }
      } catch {
        // Continue to next attempt
      }
    }

    return '0.0.0-dev'
  } catch {
    return '0.0.0-dev'
  }
}

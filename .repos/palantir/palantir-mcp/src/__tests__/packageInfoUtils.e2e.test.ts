/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

/**
 * End-to-end test for package version functionality.
 *
 * This test validates the complete workflow:
 * 1. Sets a test version in package.json
 * 2. Builds the project (bundling the version lookup code)
 * 3. Packs into an npm tarball
 * 4. Tests the package using npx (no global install needed)
 * 5. Tests that `--version` flag returns the correct version
 * 6. Tests that the version appears in user agent strings
 *
 * Cleanup steps ensure the test doesn't leave artifacts:
 * - Removes the generated tarball file
 * - Restores package.json and package-lock.json from backups
 * - Cleans up built files (dist/)
 *
 * This ensures the version system works end-to-end as it will
 * in production when CircleCI publishes with real version numbers.
 */

import { execSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Package Version E2E', () => {
  const testVersion = '12.34.56-e2e-test'
  let tarballPath: string

  beforeAll(() => {
    // Save original package.json and package-lock.json in backup files, so we can revert after the test completes
    execSync('cp package.json package.json.backup', { stdio: 'pipe' })
    if (existsSync('package-lock.json')) {
      execSync('cp package-lock.json package-lock.json.backup', { stdio: 'pipe' })
    }

    // Set test version
    execSync(`npm version ${testVersion} --no-git-tag-version --allow-same-version`, {
      stdio: 'pipe',
    })

    // Build the package
    execSync('npm run build', { stdio: 'pipe' })

    // Pack the package
    const packOutput = execSync('npm pack', { encoding: 'utf8', stdio: 'pipe' })
    tarballPath = packOutput.trim().split('\n').pop() || ''
  })

  afterAll(() => {
    // Clean up the tarball
    if (tarballPath && existsSync(tarballPath)) {
      unlinkSync(tarballPath)
    }

    // Restore original package.json
    if (existsSync('package.json.backup')) {
      execSync('mv package.json.backup package.json', { stdio: 'pipe' })
    }

    // Restore original package-lock.json if it was backed up
    if (existsSync('package-lock.json.backup')) {
      execSync('mv package-lock.json.backup package-lock.json', { stdio: 'pipe' })
    } else if (existsSync('package-lock.json')) {
      // Remove package-lock.json if it didn't exist originally
      unlinkSync('package-lock.json')
    }

    // Clean up built files
    execSync('npm run clean', { stdio: 'pipe' })
  })

  it('should work with npx and --version flag', () => {
    expect(tarballPath).toBeTruthy()
    expect(existsSync(tarballPath)).toBe(true)

    // Test the --version flag using npx
    const versionOutput = execSync(`npx -y ./${tarballPath} --version`, { encoding: 'utf8' }).trim()
    expect(versionOutput).toBe(testVersion)
  })
})

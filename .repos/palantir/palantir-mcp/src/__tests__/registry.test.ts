/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { describe, expect, it } from 'vitest'

import { buildNpmRegistryUrl, NPM_REGISTRY_PATH } from '../registry.js'

describe('registry', () => {
  describe('buildNpmRegistryUrl', () => {
    it('should build correct npm registry URL from foundry API URL', () => {
      const foundryApiUrl = new URL('https://example.palantirfoundry.com')
      const npmRegistry = buildNpmRegistryUrl(foundryApiUrl)

      expect(npmRegistry.toString()).toBe(`https://example.palantirfoundry.com${NPM_REGISTRY_PATH}`)
    })

    it('should preserve the host from the foundry API URL', () => {
      const foundryApiUrl = new URL('https://custom.palantirfoundry.com')
      const npmRegistry = buildNpmRegistryUrl(foundryApiUrl)

      expect(npmRegistry.host).toBe('custom.palantirfoundry.com')
    })
  })
})

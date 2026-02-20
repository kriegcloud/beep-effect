/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { InvalidArgumentError } from 'commander'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createProgram, parseArguments, parseUrl } from '../command.js'

describe('CLI', () => {
  describe('parseUrl', () => {
    it('should parse valid URLs', () => {
      const url = parseUrl('https://example.palantirfoundry.com')
      expect(url.toString()).toBe('https://example.palantirfoundry.com/')
      expect(url.protocol).toBe('https:')
      expect(url.host).toBe('example.palantirfoundry.com')
    })

    it('should throw InvalidArgumentError for invalid URLs', () => {
      expect(() => parseUrl('not-a-url')).toThrow(InvalidArgumentError)
      expect(() => parseUrl('not-a-url')).toThrow(
        'Invalid URL: not-a-url. It should be of the format https://<enrollment>.palantirfoundry.com',
      )
    })

    it('should handle URLs with paths', () => {
      const url = parseUrl('https://example.palantirfoundry.com/path/to/resource')
      expect(url.pathname).toBe('/path/to/resource')
    })
  })

  describe('createProgram', () => {
    it('should create a command with required options', () => {
      const program = createProgram()
      const options = program.options

      expect(options).toHaveLength(3)

      const versionOption = options.find((opt) => opt.name() === 'version')
      expect(versionOption).toBeDefined()
      expect(versionOption?.required).toBe(false)
      expect(versionOption?.description).toContain('version')

      const apiUrlOption = options.find((opt) => opt.name() === 'foundry-api-url')
      expect(apiUrlOption).toBeDefined()
      expect(apiUrlOption?.required).toBe(true)
      expect(apiUrlOption?.description).toContain('Your Foundry domain')

      const tokenOption = options.find((opt) => opt.name() === 'foundry-token')
      expect(tokenOption).toBeDefined()
      expect(tokenOption?.required).toBe(true)
      expect(tokenOption?.description).toContain('Foundry user token')
    })
  })

  describe('parseArguments', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
      delete process.env.FOUNDRY_TOKEN
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should parse command line arguments correctly', () => {
      const argv = [
        'node',
        'cli.js',
        '--foundry-api-url',
        'https://example.palantirfoundry.com',
        '--foundry-token',
        'test-token-123',
      ]

      const options = parseArguments(argv)

      expect(options.foundryApiUrl.toString()).toBe('https://example.palantirfoundry.com/')
      expect(options.foundryToken).toBe('test-token-123')
    })

    it('should use FOUNDRY_TOKEN environment variable when available', () => {
      process.env.FOUNDRY_TOKEN = 'env-token-456'

      const argv = ['node', 'cli.js', '--foundry-api-url', 'https://example.palantirfoundry.com']

      const options = parseArguments(argv)

      expect(options.foundryToken).toBe('env-token-456')
    })

    it('should prefer command line token over environment variable', () => {
      process.env.FOUNDRY_TOKEN = 'env-token-456'

      const argv = [
        'node',
        'cli.js',
        '--foundry-api-url',
        'https://example.palantirfoundry.com',
        '--foundry-token',
        'cli-token-789',
      ]

      const options = parseArguments(argv)

      expect(options.foundryToken).toBe('cli-token-789')
    })

    it('should throw error when required options are missing', () => {
      const argv = ['node', 'cli.js']

      expect(() => parseArguments(argv)).toThrow()
    })

    it('should handle extra arguments gracefully', () => {
      const argv = [
        'node',
        'cli.js',
        '--foundry-api-url',
        'https://example.palantirfoundry.com',
        '--foundry-token',
        'test-token',
        '--extra-arg',
        'value',
        'additional',
        'args',
      ]

      expect(() => parseArguments(argv)).not.toThrow()
    })
  })
})

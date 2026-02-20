/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { spawn } from 'child_process'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { spawnMcp } from '../spawn.js'

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

describe('spawn', () => {
  const mockSpawn = spawn as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('spawnMcp', () => {
    it('should spawn npx with correct arguments', () => {
      const mockChild = {
        kill: vi.fn(),
      }
      mockSpawn.mockReturnValue(mockChild)

      const options = {
        npmRegistry: new URL('https://example.com/npm/'),
        foundryToken: 'test-token',
        args: ['--help', '--verbose'],
      }

      spawnMcp(options)

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        ['-y', '@palantir/mcp@latest', '--help', '--verbose'],
        expect.objectContaining({
          stdio: 'inherit',
        }),
      )
    })

    it('should set correct environment variables', () => {
      const mockChild = {
        kill: vi.fn(),
      }
      mockSpawn.mockReturnValue(mockChild)

      const options = {
        npmRegistry: new URL('https://example.com/npm/'),
        foundryToken: 'test-token',
        args: [],
      }

      spawnMcp(options)

      const spawnCall = mockSpawn.mock.calls[0]
      const env = spawnCall[2].env

      expect(env.NPM_CONFIG_REGISTRY).toBe('https://example.com/npm/')
      expect(env['NPM_CONFIG_//example.com/npm/:_authToken']).toBe('test-token')
    })

    it('should preserve existing environment variables', () => {
      const mockChild = {
        kill: vi.fn(),
      }
      mockSpawn.mockReturnValue(mockChild)

      const originalEnv = process.env
      process.env.CUSTOM_VAR = 'custom-value'

      const options = {
        npmRegistry: new URL('https://example.com/npm/'),
        foundryToken: 'test-token',
        args: [],
      }

      spawnMcp(options)

      const spawnCall = mockSpawn.mock.calls[0]
      const env = spawnCall[2].env

      expect(env.CUSTOM_VAR).toBe('custom-value')

      process.env = originalEnv
    })

    it('should register SIGINT signal handler', () => {
      const mockChild = {
        kill: vi.fn(),
      }
      mockSpawn.mockReturnValue(mockChild)

      const originalListenerCount = process.listenerCount('SIGINT')

      const options = {
        npmRegistry: new URL('https://example.com/npm/'),
        foundryToken: 'test-token',
        args: [],
      }

      spawnMcp(options)

      expect(process.listenerCount('SIGINT')).toBe(originalListenerCount + 1)
    })

    it('should register SIGTERM signal handler', () => {
      const mockChild = {
        kill: vi.fn(),
      }
      mockSpawn.mockReturnValue(mockChild)

      const originalListenerCount = process.listenerCount('SIGTERM')

      const options = {
        npmRegistry: new URL('https://example.com/npm/'),
        foundryToken: 'test-token',
        args: [],
      }

      spawnMcp(options)

      expect(process.listenerCount('SIGTERM')).toBe(originalListenerCount + 1)
    })
  })
})

/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NetworkError, NodeVersionError, PackageFetchError } from '../errors.js'
import {
  checkNodeVersion,
  checkNetworkConnectivity,
  validateFoundryToken,
  checkPackageAvailability,
} from '../preflightChecks.js'
import { isTokenExpired } from '../utils/authTokenUtils.js'
import { TokenRefreshUtils } from '../utils/tokenRefreshUtils.js'

const mockGetTokenTimeToLiveInSeconds = vi.fn()
const mockRetrieveToken = vi.fn()

vi.mock('@api/multipassApi.js', () => ({
  MultipassApi: vi.fn().mockImplementation(() => ({
    getTokenTimeToLiveInSeconds: mockGetTokenTimeToLiveInSeconds,
  })),
}))

vi.mock('@api/authoringApi.js', () => ({
  AuthoringApi: vi.fn().mockImplementation(() => ({
    retrieveToken: mockRetrieveToken,
  })),
}))

vi.mock('../utils/authTokenUtils.js', () => ({
  isTokenExpired: vi.fn(),
  retrieveTokenFromSecret: vi.fn(),
}))

vi.mock('child_process', () => ({
  exec: vi.fn((_command, callback) => callback(null)),
}))

describe('preflightChecks', () => {
  const foundryApiUrl = new URL('https://example.palantirfoundry.com')
  const foundryToken = 'test-token'
  const npmRegistry = new URL('https://example.palantirfoundry.com/npm/')

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockGetTokenTimeToLiveInSeconds.mockClear()
    mockRetrieveToken.mockClear()
    delete process.env.FOUNDRY_TOKEN
  })

  describe('individual preflight checks', () => {
    it('should pass all preflight checks successfully', async () => {
      const nodeVersion = process.versions.node
      const majorVersion = parseInt(nodeVersion.split('.')[0])
      if (majorVersion < 18) {
        vi.spyOn(process.versions, 'node', 'get').mockReturnValue('18.0.0')
      }

      // Mock token not expired
      vi.mocked(isTokenExpired).mockResolvedValueOnce(false)
      ;(global.fetch as any).mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ ok: true })

      expect(() => checkNodeVersion()).not.toThrow()
      await expect(checkNetworkConnectivity(foundryApiUrl)).resolves.not.toThrow()
      const validatedToken = await validateFoundryToken(foundryApiUrl, foundryToken)
      expect(validatedToken).toBe(foundryToken)
      await expect(checkPackageAvailability(npmRegistry, validatedToken)).resolves.not.toThrow()
    })

    it('should throw NodeVersionError for Node version < 18', () => {
      vi.spyOn(process.versions, 'node', 'get').mockReturnValue('16.14.0')
      expect(() => checkNodeVersion()).toThrow(NodeVersionError)
    })

    it('should throw NetworkError when cannot reach Foundry API', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))
      await expect(checkNetworkConnectivity(foundryApiUrl)).rejects.toThrow(NetworkError)
    })

    it('should throw NetworkError when Foundry API returns non-OK status', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({ ok: false, status: 404 })
      await expect(checkNetworkConnectivity(foundryApiUrl)).rejects.toThrow(NetworkError)
    })

    it('should throw PackageFetchError when cannot fetch package', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Fetch failed'))
      await expect(checkPackageAvailability(npmRegistry, foundryToken)).rejects.toThrow(
        PackageFetchError,
      )
    })

    it('should throw PackageFetchError when package endpoint returns non-OK status', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
      await expect(checkPackageAvailability(npmRegistry, foundryToken)).rejects.toThrow(
        PackageFetchError,
      )
    })
  })

  describe('validateFoundryToken', () => {
    it('should return original token when token is not expired', async () => {
      vi.mocked(isTokenExpired).mockResolvedValueOnce(false)

      const result = await validateFoundryToken(foundryApiUrl, foundryToken)

      expect(result).toBe(foundryToken)
      expect(vi.mocked(isTokenExpired)).toHaveBeenCalled()
    })

    it('should refresh token when expired and return new token', async () => {
      const newToken = 'new-refreshed-token'

      // Mock successful token refresh flow - this will return the new token
      const mockRefreshTokenIfExpired = vi.fn().mockResolvedValue(newToken)
      vi.spyOn(TokenRefreshUtils.prototype, 'refreshTokenIfExpired').mockImplementation(
        mockRefreshTokenIfExpired,
      )

      const result = await validateFoundryToken(foundryApiUrl, foundryToken)

      expect(result).toBe(newToken)
      expect(mockRefreshTokenIfExpired).toHaveBeenCalled()
    })

    it('should refresh token when TTL check throws error', async () => {
      const newToken = 'new-refreshed-token'

      // Mock TTL check failure (treated as expired)
      vi.mocked(isTokenExpired).mockRejectedValueOnce(new Error('Token invalid'))

      // Mock successful token refresh
      const mockRefreshTokenIfExpired = vi.fn().mockResolvedValue(newToken)
      vi.spyOn(TokenRefreshUtils.prototype, 'refreshTokenIfExpired').mockImplementation(
        mockRefreshTokenIfExpired,
      )

      const result = await validateFoundryToken(foundryApiUrl, foundryToken)

      expect(result).toBe(newToken)
      expect(mockRefreshTokenIfExpired).toHaveBeenCalled()
    })

    it('should handle token refresh timeout gracefully', async () => {
      // Mock expired token
      vi.mocked(isTokenExpired).mockResolvedValueOnce(true)

      // Mock refreshTokenIfExpired to throw timeout error
      const mockRefreshTokenIfExpired = vi
        .fn()
        .mockRejectedValue(new Error('Token retrieval timed out'))
      vi.spyOn(TokenRefreshUtils.prototype, 'refreshTokenIfExpired').mockImplementation(
        mockRefreshTokenIfExpired,
      )

      await expect(validateFoundryToken(foundryApiUrl, foundryToken)).rejects.toThrow(
        'Token retrieval timed out',
      )
    })

    it('should handle browser opening failure during refresh', async () => {
      // Mock expired token
      vi.mocked(isTokenExpired).mockResolvedValueOnce(true)

      // Mock refreshTokenIfExpired to throw browser error
      const mockRefreshTokenIfExpired = vi
        .fn()
        .mockRejectedValue(new Error('Browser failed to open'))
      vi.spyOn(TokenRefreshUtils.prototype, 'refreshTokenIfExpired').mockImplementation(
        mockRefreshTokenIfExpired,
      )

      await expect(validateFoundryToken(foundryApiUrl, foundryToken)).rejects.toThrow(
        'Browser failed to open',
      )
    })
  })
})

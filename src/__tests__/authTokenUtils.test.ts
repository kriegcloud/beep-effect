/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { AuthoringApi } from '@api/authoringApi.js'
import { MultipassApi } from '@api/multipassApi.js'
import { ConjureError, ConjureErrorType } from 'conjure-client'
import { InvalidAuthTokenError } from 'src/errors.js'
import { isTokenExpired, retrieveTokenFromSecret } from 'src/utils/authTokenUtils.js'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock MultipassApi
vi.mock('@api/multipassApi.js')
// Mock AuthoringApi
vi.mock('@api/authoringApi.js')

// Helper functions to create proper ConjureError objects
function createInvalidJwtError(): ConjureError<any> {
  return new ConjureError(ConjureErrorType.Status, new Error('Invalid JWT'), 401, {
    errorCode: 'UNAUTHORIZED',
    parameters: {
      error: 'INVALID_JWT',
    },
  })
}

function createInvalidTokenSignatureError(): ConjureError<any> {
  return new ConjureError(ConjureErrorType.Status, new Error('Invalid token signature'), 401, {
    errorName: 'Authoring:InvalidTokenSignature',
  })
}

describe('authTokenUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isTokenExpired', () => {
    const mockMultipassApi = {
      getTokenTimeToLiveInSeconds: vi.fn(),
      context: {
        apiUrl: {
          hostname: 'test.palantirfoundry.com',
        },
      },
    } as unknown as MultipassApi

    it('should return false when token has sufficient time to live', async () => {
      vi.mocked(mockMultipassApi.getTokenTimeToLiveInSeconds).mockResolvedValue(3600)
      const minimumTimeToLive = 300

      const result = await isTokenExpired(mockMultipassApi, minimumTimeToLive)

      expect(result).toBe(false)
      expect(mockMultipassApi.getTokenTimeToLiveInSeconds).toHaveBeenCalledOnce()
    })

    it('should return true when token has insufficient time to live', async () => {
      vi.mocked(mockMultipassApi.getTokenTimeToLiveInSeconds).mockResolvedValue(100)
      const minimumTimeToLive = 300

      const result = await isTokenExpired(mockMultipassApi, minimumTimeToLive)

      expect(result).toBe(true)
      expect(mockMultipassApi.getTokenTimeToLiveInSeconds).toHaveBeenCalledOnce()
    })

    it('should throw InvalidAuthTokenError when JWT is invalid', async () => {
      const mockError = createInvalidJwtError()
      vi.mocked(mockMultipassApi.getTokenTimeToLiveInSeconds).mockRejectedValue(mockError)

      await expect(isTokenExpired(mockMultipassApi, 300)).rejects.toThrow(InvalidAuthTokenError)
    })

    it('should return true when token check fails for other reasons', async () => {
      const mockError = new Error('Network error')
      vi.mocked(mockMultipassApi.getTokenTimeToLiveInSeconds).mockRejectedValue(mockError)

      const result = await isTokenExpired(mockMultipassApi, 300)

      expect(result).toBe(true)
    })
  })

  describe('retrieveTokenFromSecret', () => {
    const mockAuthoringApi = {
      retrieveToken: vi.fn(),
      context: {
        apiUrl: {
          hostname: 'test.palantirfoundry.com',
        },
      },
    } as unknown as AuthoringApi

    it('should return token when retrieval is successful', async () => {
      const secret = 'test-secret'
      const expectedToken = 'test-token'
      vi.mocked(mockAuthoringApi.retrieveToken).mockResolvedValue(expectedToken)

      const result = await retrieveTokenFromSecret(secret, mockAuthoringApi)

      expect(result).toBe(expectedToken)
      expect(mockAuthoringApi.retrieveToken).toHaveBeenCalledWith(secret)
    })

    it('should throw InvalidAuthTokenError when token signature is invalid', async () => {
      const secret = 'test-secret'
      const mockError = createInvalidTokenSignatureError()
      vi.mocked(mockAuthoringApi.retrieveToken).mockRejectedValue(mockError)

      await expect(retrieveTokenFromSecret(secret, mockAuthoringApi)).rejects.toThrow(
        InvalidAuthTokenError,
      )
    })

    it('should return undefined when retrieval fails for other reasons', async () => {
      const secret = 'test-secret'
      const mockError = new Error('Network error')
      vi.mocked(mockAuthoringApi.retrieveToken).mockRejectedValue(mockError)

      const result = await retrieveTokenFromSecret(secret, mockAuthoringApi)

      expect(result).toBeUndefined()
    })

    it('should return undefined when retrieveToken returns undefined', async () => {
      const secret = 'test-secret'
      vi.mocked(mockAuthoringApi.retrieveToken).mockResolvedValue(undefined)

      const result = await retrieveTokenFromSecret(secret, mockAuthoringApi)

      expect(result).toBeUndefined()
      expect(mockAuthoringApi.retrieveToken).toHaveBeenCalledWith(secret)
    })
  })
})

/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { AuthoringApi } from '@api/authoringApi.js'
import { MultipassApi } from '@api/multipassApi.js'
import { InvalidAuthTokenError } from 'src/errors.js'
import { isInvalidAuthTokenSignature, isInvalidJwtError } from './conjureErrorUtils.js'

export async function isTokenExpired(
  multipassApi: MultipassApi,
  minimumTimeToLive: number,
): Promise<boolean> {
  try {
    const response = await multipassApi.getTokenTimeToLiveInSeconds()

    return response < minimumTimeToLive
  } catch (error: unknown) {
    // if we have an invalid JWT, we will not be able to refresh.
    if (isInvalidJwtError(error)) {
      throw new InvalidAuthTokenError(multipassApi.context.apiUrl.hostname)
    }

    return true
  }
}

export async function retrieveTokenFromSecret(
  secret: string,
  authoringApi: AuthoringApi,
): Promise<string | undefined> {
  try {
    const token: string | undefined = await authoringApi.retrieveToken(secret)
    return token
  } catch (error: unknown) {
    // if it is not an InvalidAuthTokenError, swallow it and keep trying
    if (isInvalidAuthTokenSignature(error)) {
      throw new InvalidAuthTokenError(authoringApi.context.apiUrl.hostname)
    }
  }
  return undefined
}

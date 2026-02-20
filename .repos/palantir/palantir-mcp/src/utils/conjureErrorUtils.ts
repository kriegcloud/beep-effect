/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { ConjureError, isConjureError } from 'conjure-client'

export function isInvalidAuthTokenSignature(error: unknown): boolean {
  if (isConjureError(error)) {
    const conjureError: ConjureError<any> = error

    if (typeof conjureError.body !== 'string') {
      const conjureErroName = conjureError.body?.errorName

      return conjureErroName === 'Authoring:InvalidTokenSignature'
    }
  }

  return false
}

export function isInvalidJwtError(error: unknown): boolean {
  if (isConjureError(error)) {
    const conjureError = error.body as any

    return (
      conjureError.errorCode === 'UNAUTHORIZED' && conjureError.parameters.error === 'INVALID_JWT'
    )
  }

  return false
}

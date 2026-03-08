import {
  toTurnFailureCodeFromUnknown,
  toTurnFailureIdentityFromUnknown,
  toTurnFailureMessageFromUnknown
} from "@template/domain/turnFailure"

export const toTurnFailureMessage = (error: unknown, fallback: string): string =>
  toTurnFailureMessageFromUnknown(error, fallback)

export const toTurnFailureCode = (error: unknown, message: string) =>
  toTurnFailureCodeFromUnknown(error, message)

export const toTurnFailureIdentity = (error: unknown): {
  readonly turnId: string
  readonly sessionId: string
} =>
  toTurnFailureIdentityFromUnknown(error)

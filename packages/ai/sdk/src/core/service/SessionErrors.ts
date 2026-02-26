import * as Schema from "effect/Schema"
import { SessionManagerError } from "../SessionManager.js"
import { SessionPoolError } from "../SessionPool.js"
import { SessionTenantAccessError } from "./TenantAccess.js"

export class SessionPoolUnavailableError extends Schema.TaggedErrorClass<SessionPoolUnavailableError>()(
  "SessionPoolUnavailableError",
  {
    message: Schema.String
  }
) {
  static readonly make = (params: Pick<SessionPoolUnavailableError, "message">) =>
    new SessionPoolUnavailableError(params)
}

export const SessionServiceError = Schema.Union([
  SessionManagerError,
  SessionPoolError,
  SessionTenantAccessError,
  SessionPoolUnavailableError
]).pipe(Schema.annotate({ identifier: "SessionServiceError" }))

export type SessionServiceError = typeof SessionServiceError.Type
export type SessionServiceErrorEncoded = typeof SessionServiceError.Encoded

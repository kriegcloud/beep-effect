import * as Schema from "effect/Schema";
import { SessionManagerError } from "../SessionManager.js";
import { SessionPoolError } from "../SessionPool.js";
import { SessionTenantAccessError } from "./TenantAccess.js";

/**
 * @since 0.0.0
 */
export class SessionPoolUnavailableError extends Schema.TaggedErrorClass<SessionPoolUnavailableError>()(
  "SessionPoolUnavailableError",
  {
    message: Schema.String,
  }
) {
  static readonly make = (params: Pick<SessionPoolUnavailableError, "message">) =>
    new SessionPoolUnavailableError(params);
}

/**
 * @since 0.0.0
 */
export const SessionServiceError = Schema.Union([
  SessionManagerError,
  SessionPoolError,
  SessionTenantAccessError,
  SessionPoolUnavailableError,
]).pipe(Schema.annotate({ identifier: "SessionServiceError" }));

/**
 * @since 0.0.0
 */
export type SessionServiceError = typeof SessionServiceError.Type;
/**
 * @since 0.0.0
 */
export type SessionServiceErrorEncoded = typeof SessionServiceError.Encoded;

import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";
import { SessionManagerError } from "../SessionManager.js";
import { SessionPoolError } from "../SessionPool.js";
import { SessionTenantAccessError } from "./TenantAccess.js";

/**
 * @since 0.0.0
 */
export class SessionPoolUnavailableError extends TaggedErrorClass<SessionPoolUnavailableError>()(
  "SessionPoolUnavailableError",
  {
    message: S.String,
  }
) {
  static readonly make = (params: Pick<SessionPoolUnavailableError, "message">) =>
    new SessionPoolUnavailableError(params);
}

/**
 * @since 0.0.0
 */
export const SessionServiceError = S.Union([
  SessionManagerError,
  SessionPoolError,
  SessionTenantAccessError,
  SessionPoolUnavailableError,
]).pipe(S.annotate({ identifier: "SessionServiceError" }));

/**
 * @since 0.0.0
 */
export type SessionServiceError = typeof SessionServiceError.Type;
/**
 * @since 0.0.0
 */
export type SessionServiceErrorEncoded = typeof SessionServiceError.Encoded;

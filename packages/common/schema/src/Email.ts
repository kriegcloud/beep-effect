import { Email as InternalEmail } from "./internal/email.ts";

/**
 * RFC 5322 compliant email address schema.
 *
 * Accepts a string, trims whitespace, lowercases, validates against RFC 5322,
 * and wraps the result in a `Redacted` to prevent accidental logging.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Email } from "@beep/schema"
 *
 * const decode = S.decodeUnknownSync(Email)
 *
 * const email = decode("Alice@Example.COM")
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Email = InternalEmail;

/**
 * Branded, redacted email address type extracted from {@link Email}.
 *
 * @since 0.0.0
 * @category models
 */
export type Email = typeof Email.Type;

/**
 * Public email address schema exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

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
 * @category constructors
 * @since 0.0.0
 */
export const Email = InternalEmail;

/**
 * Branded, redacted email address type extracted from {@link Email}.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Email, type Email as EmailValue } from "@beep/schema"
 *
 * const decode = S.decodeUnknownSync(Email)
 * const email: EmailValue = decode("admin@example.com")
 *
 * void email
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Email = typeof Email.Type;

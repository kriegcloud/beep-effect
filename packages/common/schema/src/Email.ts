import { Email as InternalEmail } from "./internal/email.js";

/**
 * RFC 5322 compliant email address schema.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Email = InternalEmail;

/**
 * Type for {@link Email}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Email = typeof Email.Type;

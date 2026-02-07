/**
 * @since 0.1.0
 * @module errors
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("services/EncryptionService/errors");

/**
 * Enum for the different phases of encryption
 * @since 0.1.0
 * @category errors
 */
export class EncryptionPhase extends BS.StringLiteralKit("key-import", "encrypt", "encode", {
  enumMapping: [
    ["key-import", "KEY_IMPORT"],
    ["encrypt", "ENCRYPT"],
    ["encode", "ENCODE"],
  ],
}) {}

/**
 * Enum for the different phases of decryption
 * @since 0.1.0
 * @category errors
 */
export class DecryptionPhase extends BS.StringLiteralKit("key-import", "decrypt", "decode", {
  enumMapping: [
    ["key-import", "KEY_IMPORT"],
    ["decrypt", "DECRYPT"],
    ["decode", "DECODE"],
  ],
}) {}

/**
 * Error thrown when encryption fails
 * @since 0.1.0
 * @category errors
 */
export class EncryptionError extends S.TaggedError<EncryptionError>($I`EncryptionError`)("EncryptionError", {
  message: S.String,
  cause: S.Defect,
  algorithm: S.optional(S.String),
  phase: S.optional(EncryptionPhase),
}) {}

/**
 * Error thrown when decryption fails
 * @since 0.1.0
 * @category errors
 */

export class DecryptionError extends S.TaggedError<DecryptionError>($I`DecryptionError`)("DecryptionError", {
  message: S.String,
  cause: S.Defect,
  algorithm: S.optional(S.String),
  phase: S.optional(DecryptionPhase),
}) {}

/**
 * Error thrown when key derivation fails
 * @since 0.1.0
 * @category errors
 */
export class KeyDerivationError extends S.TaggedError<KeyDerivationError>($I`KeyDerivationError`)(
  "KeyDerivationError",
  {
    message: S.String,
    cause: S.Defect,
    algorithm: S.optional(S.String),
  }
) {}

/**
 * Error thrown when hash computation fails
 * @since 0.1.0
 * @category errors
 */
export class HashError extends S.TaggedError<HashError>($I`HashError`)("HashError", {
  message: S.String,
  cause: S.Defect,
  algorithm: S.optional(S.String),
}) {}

/**
 * Enum for the different phases of HMAC signing or verification
 * @since 0.1.0
 * @category errors
 */
export class SigningPhase extends BS.StringLiteralKit("import-key", "sign", "verify", {
  enumMapping: [
    ["import-key", "IMPORT_KEY"],
    ["sign", "SIGN"],
    ["verify", "VERIFY"],
  ],
}) {}

/**
 * Error thrown when HMAC signing or verification fails
 * @since 0.1.0
 * @category errors
 */
export class SigningError extends S.TaggedError<SigningError>($I`SigningError`)("SigningError", {
  message: S.String,
  cause: S.Defect,
  algorithm: S.optional(S.String),
  phase: S.optional(SigningPhase),
}) {}

// ============================================================================
// Upload Signature Verification Errors
// ============================================================================

/**
 * Error thrown when HMAC signature verification fails.
 *
 * @since 0.1.0
 * @category Errors
 *
 * @remarks
 * This error indicates that the provided signature does not match the
 * expected signature for the given payload. This can occur due to:
 * - Payload tampering or modification
 * - Incorrect or rotated secret key
 * - Replay attacks with forged signatures
 * - Data corruption during transmission
 *
 * ## Security Considerations
 * - NEVER include the expected signature in error messages
 * - NEVER include the secret key or any key material
 * - Use generic messages like "Invalid signature" to prevent information leakage
 * - Log detailed information server-side for debugging, but sanitize client responses
 *
 * ## Usage Context
 * This error is typically thrown by:
 * - `Upload.Service.verifyUploadSignature` during upload completion
 * - `SignedPayload` schema encode (verification) transformations
 * - RPC handlers validating signed requests
 *
 * ## Implementation Guidance for Implementer
 * When throwing this error:
 * 1. Use a generic message that doesn't leak implementation details
 * 2. Log the actual failure reason server-side with appropriate log level
 * 3. Consider rate limiting to prevent brute-force attempts
 *
 * @example
 * // In upload verification handler
 * const isValid = yield* encryption.verifySignature(payload, signature, secret);
 * if (!isValid) {
 *   yield* Effect.logWarning("Signature verification failed", {
 *     fileKey: params.fileKey,
 *     // Never log the actual signatures!
 *   });
 *   return yield* Effect.fail(new InvalidSignatureError({
 *     message: "Invalid signature",
 *   }));
 * }
 *
 * @see SignatureExpiredError for expiration-specific failures
 * @see SignedPayload for schema-based signature handling
 */
export class InvalidSignatureError extends S.TaggedError<InvalidSignatureError>($I`InvalidSignatureError`)(
  "InvalidSignatureError",
  {
    /**
     * Human-readable error message.
     *
     * @remarks
     * Should be generic and not reveal implementation details.
     * Safe values: "Invalid signature", "Verification failed", "Authentication failed"
     */
    message: S.String,
  }
) {}

export declare namespace InvalidSignatureError {
  export type Type = typeof InvalidSignatureError.Type;
}

/**
 * Error thrown when a signed payload has expired.
 *
 * @since 0.1.0
 * @category Errors
 *
 * @remarks
 * This error indicates that the signature's timestamp has exceeded the
 * allowed time-to-live (TTL). This is a separate error from InvalidSignatureError
 * to enable different handling strategies:
 * - Expired signatures may prompt re-initiation of the upload flow
 * - Invalid signatures may trigger security alerts
 *
 * ## Timing Considerations
 * - Check expiration BEFORE signature verification (fail-fast pattern)
 * - This saves CPU cycles on cryptographic operations for expired data
 * - Prevents timing attacks that could leak signature validity
 *
 * ## Usage Context
 * This error is typically thrown by:
 * - `Upload.Service.verifyUploadSignature` when session has expired
 * - `SignedPayloadWithExpiration` schema verification
 * - Upload session cleanup checks
 *
 * ## Implementation Guidance for Implementer
 * When throwing this error:
 * 1. Include the expiration timestamp for client-side handling
 * 2. Consider providing guidance on re-initiating the flow
 * 3. Log with appropriate context for debugging
 *
 * @example
 * // In upload verification handler
 * const now = yield* DateTime.now;
 * if (DateTime.greaterThan(now, session.expiresAt)) {
 *   return yield* Effect.fail(new SignatureExpiredError({
 *     message: "Upload session has expired",
 *     expiresAt: session.expiresAt,
 *   }));
 * }
 *
 * @see InvalidSignatureError for signature mismatch failures
 * @see SignedPayloadWithExpiration for schema with expiration
 */
export class SignatureExpiredError extends S.TaggedError<SignatureExpiredError>($I`SignatureExpiredError`)(
  "SignatureExpiredError",
  {
    /**
     * Human-readable error message.
     *
     * @remarks
     * Can include expiration context since this is not security-sensitive.
     * Safe values: "Upload session has expired", "Token expired", "Signature expired"
     */
    message: S.String,

    /**
     * The UTC timestamp when the signature expired.
     *
     * @remarks
     * Included to help clients understand how long ago expiration occurred
     * and potentially adjust their timing for retry attempts.
     */
    expiresAt: BS.DateTimeUtcFromAllAcceptable,
  }
) {}

export declare namespace SignatureExpiredError {
  export type Type = typeof SignatureExpiredError.Type;
}

// ============================================================================
// Error Union Types
// ============================================================================

/**
 * Union of all signature-related verification errors.
 *
 * @since 0.1.0
 * @category Types
 *
 * @remarks
 * Use this union type when you need to handle any signature verification
 * failure, regardless of the specific cause.
 *
 * @example
 * // Type-safe error handling
 * const result = yield* verifyUpload(params).pipe(
 *   Effect.catchTag("InvalidSignatureError", (e) => {
 *     // Handle invalid signature
 *     return Effect.fail(new UnauthorizedError({ message: e.message }));
 *   }),
 *   Effect.catchTag("SignatureExpiredError", (e) => {
 *     // Prompt re-upload
 *     return Effect.fail(new SessionExpiredError({
 *       message: e.message,
 *       expiredAt: e.expiresAt,
 *     }));
 *   }),
 * );
 */
export type SignatureVerificationError = InvalidSignatureError | SignatureExpiredError;

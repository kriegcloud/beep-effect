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

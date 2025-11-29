/**
 * @since 1.0.0
 * @module errors
 */
import * as Data from "effect/Data";

/**
 * Error thrown when encryption fails
 * @since 1.0.0
 * @category errors
 */
export class EncryptionError extends Data.TaggedError("EncryptionError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly algorithm?: string | undefined;
  readonly phase?: "key-import" | "encrypt" | "encode" | undefined;
}> {}

/**
 * Error thrown when decryption fails
 * @since 1.0.0
 * @category errors
 */
export class DecryptionError extends Data.TaggedError("DecryptionError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly algorithm?: string | undefined;
  readonly phase?: "key-import" | "decrypt" | "decode" | undefined;
}> {}

/**
 * Error thrown when key derivation fails
 * @since 1.0.0
 * @category errors
 */
export class KeyDerivationError extends Data.TaggedError("KeyDerivationError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly algorithm?: string | undefined;
}> {}

/**
 * Error thrown when hash computation fails
 * @since 1.0.0
 * @category errors
 */
export class HashError extends Data.TaggedError("HashError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly algorithm?: string | undefined;
}> {}

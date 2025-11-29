/**
 * @since 1.0.0
 * @module schemas
 *
 * Provides Effect Schema definitions for encrypted payloads and
 * schema-based encryption/decryption transformations.
 */
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { DecryptionError, EncryptionError } from "./errors";

/**
 * The encryption algorithm identifier
 * @since 1.0.0
 * @category models
 */
export const EncryptionAlgorithm = S.Literal("AES-GCM");
export type EncryptionAlgorithm = typeof EncryptionAlgorithm.Type;

/**
 * Schema for encrypted payload stored as binary (internal use)
 * Uses Uint8Array for all binary data
 * @since 1.0.0
 * @category models
 */
export const EncryptedPayloadBinary = S.Struct({
  /** Initialization vector (96 bits / 12 bytes for AES-GCM) */
  iv: S.Uint8ArrayFromSelf,
  /** The encrypted ciphertext including GCM auth tag */
  ciphertext: S.Uint8ArrayFromSelf,
  /** Algorithm identifier for versioning */
  algorithm: EncryptionAlgorithm,
});
export type EncryptedPayloadBinary = typeof EncryptedPayloadBinary.Type;

/**
 * Schema for encrypted payload with Base64-encoded strings (for storage/transport)
 * This is the format stored in the database
 * @since 1.0.0
 * @category models
 */
export const EncryptedPayload = S.Struct({
  /** Base64-encoded initialization vector (96 bits) */
  iv: S.String,
  /** Base64-encoded encrypted data (includes GCM auth tag) */
  ciphertext: S.String,
  /** Algorithm identifier for versioning */
  algorithm: EncryptionAlgorithm,
});
export type EncryptedPayload = typeof EncryptedPayload.Type;

/**
 * Schema for encoding/decoding EncryptedPayload to/from JSON string
 * Useful for storing in a single text column
 * @since 1.0.0
 * @category models
 */
export const EncryptedPayloadFromString = S.transform(S.parseJson(EncryptedPayload), EncryptedPayload, {
  strict: true,
  decode: (json) => json,
  encode: (payload) => payload,
});

// ============================================================================
// Schema-based Encryption Transformations
// ============================================================================

// Import EncryptionService type for dependency injection
// Using dynamic import pattern to avoid circular dependencies
import type { EncryptionService as EncryptionServiceTag } from "./EncryptionService";

/**
 * Creates a schema that transforms plaintext strings to/from encrypted payloads.
 *
 * - **decode**: Encrypts a plaintext string into an EncryptedPayload
 * - **encode**: Decrypts an EncryptedPayload back to plaintext string
 *
 * The schema requires `EncryptionService` in its context, which must be provided
 * via `.pipe(Effect.provide(EncryptionService.layer))` when decoding/encoding.
 *
 * @since 1.0.0
 * @category transformations
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { EncryptionService } from "@beep/shared-domain/services"
 *
 * const schema = EncryptedStringFromPlaintext(key)
 *
 * // Encrypt a string
 * const encrypted = await Schema.decode(schema)("secret message").pipe(
 *   Effect.provide(EncryptionService.layer),
 *   Effect.runPromise
 * )
 *
 * // Decrypt back to string
 * const decrypted = await Schema.encode(schema)(encrypted).pipe(
 *   Effect.provide(EncryptionService.layer),
 *   Effect.runPromise
 * )
 * ```
 */
export const EncryptedStringFromPlaintext = (
  key: CryptoKey
): S.Schema<
  EncryptedPayload,
  string,
  EncryptionServiceTag
> => {
  // Lazy import to avoid circular dependency
  const { EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  return S.transformOrFail(S.String, EncryptedPayload, {
    strict: true,
    decode: (plaintext, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.encrypt(plaintext, key);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              plaintext,
              e instanceof EncryptionError ? e.message : "Encryption failed"
            )
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.decrypt(payload, key);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              payload,
              e instanceof DecryptionError ? e.message : "Decryption failed"
            )
        )
      ),
  });
};

/**
 * Creates a schema that transforms plaintext strings to/from encrypted binary payloads.
 *
 * - **decode**: Encrypts a plaintext string into an EncryptedPayloadBinary
 * - **encode**: Decrypts an EncryptedPayloadBinary back to plaintext string
 *
 * @since 1.0.0
 * @category transformations
 */
export const EncryptedBinaryFromPlaintext = (
  key: CryptoKey
): S.Schema<
  EncryptedPayloadBinary,
  string,
  EncryptionServiceTag
> => {
  const { EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  return S.transformOrFail(S.String, EncryptedPayloadBinary, {
    strict: true,
    decode: (plaintext, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.encryptBinary(plaintext, key);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              plaintext,
              e instanceof EncryptionError ? e.message : "Encryption failed"
            )
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        const bytes = yield* service.decryptBinary(payload, key);
        return new TextDecoder().decode(bytes);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              payload,
              e instanceof DecryptionError ? e.message : "Decryption failed"
            )
        )
      ),
  });
};

/**
 * Creates a schema that transforms Uint8Array binary data to/from encrypted payloads.
 *
 * - **decode**: Encrypts binary data into an EncryptedPayload (base64)
 * - **encode**: Decrypts an EncryptedPayload back to binary data
 *
 * @since 1.0.0
 * @category transformations
 */
export const EncryptedPayloadFromBytes = (
  key: CryptoKey
): S.Schema<
  EncryptedPayload,
  Uint8Array,
  EncryptionServiceTag
> => {
  const { EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  return S.transformOrFail(S.Uint8ArrayFromSelf, EncryptedPayload, {
    strict: true,
    decode: (bytes, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        // Need to ensure proper ArrayBuffer backing
        const buffer = new ArrayBuffer(bytes.length);
        const cryptoBytes = new Uint8Array(buffer);
        cryptoBytes.set(bytes);
        return yield* service.encrypt(cryptoBytes, key);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              bytes,
              e instanceof EncryptionError ? e.message : "Encryption failed"
            )
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.decryptToBytes(payload, key);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              payload,
              e instanceof DecryptionError ? e.message : "Decryption failed"
            )
        )
      ),
  });
};

/**
 * Creates a schema that transforms Uint8Array to/from encrypted binary payloads.
 *
 * - **decode**: Encrypts binary data into an EncryptedPayloadBinary
 * - **encode**: Decrypts an EncryptedPayloadBinary back to binary data
 *
 * @since 1.0.0
 * @category transformations
 */
export const EncryptedBinaryFromBytes = (
  key: CryptoKey
): S.Schema<
  EncryptedPayloadBinary,
  Uint8Array,
  EncryptionServiceTag
> => {
  const { EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  return S.transformOrFail(S.Uint8ArrayFromSelf, EncryptedPayloadBinary, {
    strict: true,
    decode: (bytes, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        // Need to ensure proper ArrayBuffer backing
        const buffer = new ArrayBuffer(bytes.length);
        const cryptoBytes = new Uint8Array(buffer);
        cryptoBytes.set(bytes);
        return yield* service.encryptBinary(cryptoBytes, key);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              bytes,
              e instanceof EncryptionError ? e.message : "Encryption failed"
            )
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.decryptBinary(payload, key);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              payload,
              e instanceof DecryptionError ? e.message : "Decryption failed"
            )
        )
      ),
  });
};

/**
 * Branded type for SHA-256 hash strings
 * @since 1.0.0
 * @category models
 */
export const Sha256Hash = S.String.pipe(S.brand("Sha256Hash"));
export type Sha256Hash = typeof Sha256Hash.Type;

/**
 * Creates a schema that hashes a string using SHA-256.
 *
 * - **decode**: Hashes a string to a hex-encoded SHA-256 digest
 * - **encode**: Forbidden (one-way transformation)
 *
 * @since 1.0.0
 * @category transformations
 */
export const Sha256HashFromString = (): S.Schema<
  Sha256Hash,
  string,
  EncryptionServiceTag
> => {
  const { EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  return S.transformOrFail(S.String, Sha256Hash, {
    strict: true,
    decode: (input, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return (yield* service.sha256(input));
      }).pipe(
        Effect.mapError(() => new ParseResult.Type(ast, input, "Hash computation failed"))
      ),
    encode: (hash, _, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(ast, hash, "Cannot reverse a SHA-256 hash")
      ),
  });
};
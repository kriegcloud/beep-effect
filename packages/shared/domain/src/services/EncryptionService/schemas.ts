/**
 * @since 0.1.0
 * @module schemas
 *
 * Provides Effect Schema definitions for encrypted payloads and
 * schema-based encryption/decryption transformations.
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import type * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
// Import EncryptionService type for dependency injection
// Using dynamic import pattern to avoid circular dependencies
import type { EncryptionService as EncryptionServiceTag } from "./EncryptionService";
import { DecryptionError, EncryptionError } from "./errors";

const $I = $SharedDomainId.create("services/EncryptionService/schemas");
/**
 * The encryption algorithm identifier
 * @since 0.1.0
 * @category models
 */
export const EncryptionAlgorithm = S.Literal("AES-GCM").annotations(
  $I.annotations("EncryptionAlgorithm", {
    description: "Supported encryption algorithm identifier for versioning",
  })
);
export type EncryptionAlgorithm = typeof EncryptionAlgorithm.Type;

/**
 * Schema for encrypted payload stored as binary (internal use)
 * Uses Uint8Array for all binary data
 * @since 0.1.0
 * @category models
 */
export const EncryptedPayloadBinary = S.Struct({
  /** Initialization vector (96 bits / 12 bytes for AES-GCM) */
  iv: S.Uint8ArrayFromSelf,
  /** The encrypted ciphertext including GCM auth tag */
  ciphertext: S.Uint8ArrayFromSelf,
  /** Algorithm identifier for versioning */
  algorithm: EncryptionAlgorithm,
}).annotations(
  $I.annotations("EncryptedPayloadBinary", {
    description: "Encrypted payload using binary Uint8Array format for internal processing",
  })
);
export type EncryptedPayloadBinary = typeof EncryptedPayloadBinary.Type;

/**
 * Schema for encrypted payload with Base64-encoded strings (for storage/transport)
 * This is the format stored in the database
 * @since 0.1.0
 * @category models
 */
export const EncryptedPayload = S.Struct({
  /** Base64-encoded initialization vector (96 bits) */
  iv: S.String,
  /** Base64-encoded encrypted data (includes GCM auth tag) */
  ciphertext: S.String,
  /** Algorithm identifier for versioning */
  algorithm: EncryptionAlgorithm,
}).annotations(
  $I.annotations("EncryptedPayload", {
    description: "Encrypted payload with Base64-encoded strings for storage and transport",
  })
);
export type EncryptedPayload = typeof EncryptedPayload.Type;

/**
 * Schema for encoding/decoding EncryptedPayload to/from JSON string
 * Useful for storing in a single text column
 * @since 0.1.0
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

/**
 * Creates a schema that transforms plaintext strings to/from encrypted payloads.
 *
 * - **decode**: Encrypts a plaintext string into an EncryptedPayload
 * - **encode**: Decrypts an EncryptedPayload back to plaintext string
 *
 * The schema requires `EncryptionService` in its context, which must be provided
 * via `.pipe(Effect.provide(EncryptionService.layer))` when decoding/encoding.
 *
 * @since 0.1.0
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
): S.Schema<EncryptedPayload, string, EncryptionServiceTag> => {
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
          (e) => new ParseResult.Type(ast, plaintext, e instanceof EncryptionError ? e.message : "Encryption failed")
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.decrypt(payload, key);
      }).pipe(
        Effect.mapError(
          (e) => new ParseResult.Type(ast, payload, e instanceof DecryptionError ? e.message : "Decryption failed")
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
 * @since 0.1.0
 * @category transformations
 */
export const EncryptedBinaryFromPlaintext = (
  key: CryptoKey
): S.Schema<EncryptedPayloadBinary, string, EncryptionServiceTag> => {
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
          (e) => new ParseResult.Type(ast, plaintext, e instanceof EncryptionError ? e.message : "Encryption failed")
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        const bytes = yield* service.decryptBinary(payload, key);
        return new TextDecoder().decode(bytes);
      }).pipe(
        Effect.mapError(
          (e) => new ParseResult.Type(ast, payload, e instanceof DecryptionError ? e.message : "Decryption failed")
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
 * @since 0.1.0
 * @category transformations
 */
export const EncryptedPayloadFromBytes = (
  key: CryptoKey
): S.Schema<EncryptedPayload, Uint8Array, EncryptionServiceTag> => {
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
          (e) => new ParseResult.Type(ast, bytes, e instanceof EncryptionError ? e.message : "Encryption failed")
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.decryptToBytes(payload, key);
      }).pipe(
        Effect.mapError(
          (e) => new ParseResult.Type(ast, payload, e instanceof DecryptionError ? e.message : "Decryption failed")
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
 * @since 0.1.0
 * @category transformations
 */
export const EncryptedBinaryFromBytes = (
  key: CryptoKey
): S.Schema<EncryptedPayloadBinary, Uint8Array, EncryptionServiceTag> => {
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
          (e) => new ParseResult.Type(ast, bytes, e instanceof EncryptionError ? e.message : "Encryption failed")
        )
      ),
    encode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.decryptBinary(payload, key);
      }).pipe(
        Effect.mapError(
          (e) => new ParseResult.Type(ast, payload, e instanceof DecryptionError ? e.message : "Decryption failed")
        )
      ),
  });
};

/**
 * Branded type for SHA-256 hash strings
 * @since 0.1.0
 * @category models
 */
export const Sha256Hash = S.String.pipe(S.brand("Sha256Hash"));
export type Sha256Hash = typeof Sha256Hash.Type;

// ============================================================================
// HMAC Signed Payload Schemas
// ============================================================================

/**
 * @fileoverview HMAC-SHA256 Signed Payload Schema Definitions
 * @module @beep/shared-domain/services/EncryptionService/schemas
 * @since 1.0.0
 *
 * ## Overview
 * Provides generic schema factories for signing and verifying arbitrary payloads
 * using HMAC-SHA256. The schemas use Effect's `S.transformOrFail` pattern to
 * integrate cryptographic operations into the Schema decode/encode pipeline.
 *
 * ## Design Pattern
 * The `SignedPayload` schema factory uses **inverted semantics**:
 * - **decode**: Takes a raw payload and SIGNS it, producing `SignedPayload<T>`
 * - **encode**: Takes a `SignedPayload<T>` and VERIFIES the signature, returning the original payload
 *
 * This inversion is intentional: when receiving data from untrusted sources (like HTTP requests),
 * you "decode" by verifying. When sending data to clients, you "encode" by signing.
 *
 * ## Implementation Notes
 * The implementation agent should:
 * 1. Use `EncryptionService.signPayload` for signing (returns `hmac-sha256=<hex>` format)
 * 2. Use `EncryptionService.verifySignature` for verification (constant-time comparison)
 * 3. Use `DateTime.now` for timestamps (never `new Date()`)
 * 4. Never expose signature comparison details in error messages
 * 5. Check expiration BEFORE signature verification (fail fast on expired data)
 *
 * ## Dependencies
 * - `EncryptionService` - HMAC signing/verification primitives
 * - `DateTime` from `effect/DateTime` - Immutable timestamp handling
 * - `Redacted` from `effect/Redacted` - Secret management (prevents logging)
 *
 * ## Usage Example
 * The following shows how to use SignedPayload for upload metadata:
 *
 * // Define the metadata schema
 * const UploadMetadata = S.Struct({
 *   fileKey: S.String,
 *   fileSize: S.NonNegativeInt,
 *   mimeType: S.String,
 * });
 *
 * // Create signed version with secret from config
 * const SignedUploadMetadata = SignedPayload(
 *   UploadMetadata,
 *   Redacted.make("your-256-bit-secret")
 * );
 *
 * // Sign metadata (decode direction)
 * const signed = yield* S.decode(SignedUploadMetadata)(metadata);
 * // Result: { payload: {...}, signature: "hmac-sha256=...", signedAt: DateTime.Utc }
 *
 * // Verify metadata (encode direction)
 * const verified = yield* S.encode(SignedUploadMetadata)(signed);
 * // Result: original metadata if valid, ParseError if signature invalid
 *
 * @see {@link EncryptionService} for HMAC primitives
 * @see {@link https://effect.website/docs/schema/transformations} for transformOrFail patterns
 */

/**
 * HMAC signature pattern for validation.
 *
 * @since 1.0.0
 * @category Constants
 *
 * @remarks
 * Matches the format `hmac-sha256=` followed by exactly 64 hexadecimal characters.
 * This is the standard format returned by `EncryptionService.signPayload`.
 */
export const HMAC_SIGNATURE_PATTERN = /^hmac-sha256=[a-f0-9]{64}$/;

/**
 * Schema for HMAC-SHA256 signature strings.
 *
 * @since 1.0.0
 * @category Schemas
 *
 * @remarks
 * Validates that a string matches the HMAC signature format: `hmac-sha256=<64-hex-chars>`.
 * Use this schema when you need to validate signature strings independently.
 *
 * @example
 * const sig = "hmac-sha256=abcd1234..."; // 64 hex chars
 * const validated = yield* S.decode(HmacSignature)(sig);
 */
export const HmacSignature = S.String.pipe(S.pattern(HMAC_SIGNATURE_PATTERN)).annotations(
  $I.annotations("HmacSignature", {
    description: "HMAC-SHA256 signature in format: hmac-sha256=<64-hex-chars>",
    examples: ["hmac-sha256=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"],
  })
);
export type HmacSignature = typeof HmacSignature.Type;

/**
 * Helper schema factory that creates a signed payload struct for any payload schema.
 *
 * @since 1.0.0
 * @category Schemas
 *
 * @remarks
 * This is the **output** schema for signed data. It wraps any payload schema with:
 * - `payload`: The original data being signed
 * - `signature`: The HMAC-SHA256 signature string
 * - `signedAt`: UTC timestamp when the signature was created
 *
 * This schema is used internally by `SignedPayload` but can also be used
 * directly when you need to define the signed structure without the transformation.
 *
 * @example
 * const MySignedStruct = SignedPayloadStruct(S.Struct({ id: S.String }));
 * // Produces: { payload: { id: string }, signature: string, signedAt: DateTime.Utc }
 *
 * @param payloadSchema - The Effect Schema for the payload to be signed
 * @returns A struct schema containing payload, signature, and signedAt fields
 *
 * @see SignedPayload for the full bidirectional transformation
 */
export const SignedPayloadStruct = <T extends S.Schema.Any>(payloadSchema: T) =>
  S.Struct({
    /** The original payload data that was signed */
    payload: payloadSchema,
    /** HMAC-SHA256 signature in format: hmac-sha256=<64-hex-chars> */
    signature: HmacSignature,
    /** UTC timestamp when the payload was signed */
    signedAt: BS.DateTimeUtcFromAllAcceptable,
  });

/**
 * Type alias for signed payload structure.
 *
 * @since 1.0.0
 * @category Types
 *
 * @remarks
 * Use this type when you need to reference a signed payload in function signatures
 * or type annotations without constructing the full schema.
 *
 * @typeParam T - The type of the payload being signed
 *
 * @example
 * function processSignedUpload(data: SignedPayload<UploadMetadata>): void {
 *   console.log(data.payload.fileKey);
 *   console.log(data.signedAt);
 * }
 */
export type SignedPayload<T> = {
  readonly payload: T;
  readonly signature: HmacSignature;
  readonly signedAt: DateTime.Utc;
};

/**
 * Creates a bidirectional schema for HMAC-SHA256 signing and verification.
 *
 * @since 1.0.0
 * @category Transformations
 *
 * @remarks
 * This is the primary schema factory for creating signed payloads. It uses
 * **inverted semantics** where:
 *
 * - **decode** (input -> signed): Takes raw payload and SIGNS it
 * - **encode** (signed -> output): Takes signed payload and VERIFIES it
 *
 * This inversion aligns with typical security workflows:
 * - Server receives unsigned data, needs to sign before sending response
 * - Server receives signed data, needs to verify before processing
 *
 * ## Security Considerations
 * - Uses constant-time signature comparison via `crypto.subtle.verify`
 * - Never exposes expected vs actual signature in error messages
 * - Secrets should be provided via `Redacted.Redacted<string>` to prevent logging
 * - Consider adding expiration checks in the consuming code
 *
 * ## Implementation Guidance for Implementer
 * The stub currently throws `Effect.die`. The implementer should:
 *
 * 1. In `decode` (signing):
 *    - Serialize payload to JSON string
 *    - Call `EncryptionService.signPayload(jsonString, secret)`
 *    - Get current timestamp via `DateTime.now`
 *    - Return `{ payload, signature, signedAt }`
 *
 * 2. In `encode` (verification):
 *    - Serialize payload to JSON string (same format as signing)
 *    - Call `EncryptionService.verifySignature(jsonString, signature, secret)`
 *    - If invalid, return `ParseResult.fail` with generic message
 *    - If valid, return the original payload
 *
 * @example
 * // Define your payload schema
 * const FileMetadata = S.Struct({
 *   fileKey: S.String,
 *   size: S.NonNegativeInt,
 *   mimeType: S.String,
 * });
 *
 * // Create signed version
 * const secret = yield* Config.redacted("UPLOAD_SIGNING_SECRET");
 * const SignedMetadata = SignedPayload(FileMetadata, secret);
 *
 * // SIGNING (decode direction)
 * // Use when creating data to send to client
 * const signed = yield* S.decode(SignedMetadata)({
 *   fileKey: "uploads/file123.pdf",
 *   size: 1024,
 *   mimeType: "application/pdf",
 * });
 * // signed.signature contains "hmac-sha256=..."
 * // signed.signedAt contains the signing timestamp
 *
 * // VERIFICATION (encode direction)
 * // Use when receiving data from client
 * const verified = yield* S.encode(SignedMetadata)(signedDataFromClient);
 * // If signature is valid: returns the original payload
 * // If signature is invalid: fails with ParseError
 *
 * @param payloadSchema - Effect Schema defining the structure of data to sign
 * @param _secret
 * @returns Schema that signs on decode and verifies on encode
 *
 * @throws {ParseResult.Type} When signing fails (decode) or verification fails (encode)
 *
 * @see HmacSignature for the signature format
 * @see SignedPayloadStruct for the output structure
 * @see EncryptionService for HMAC primitives
 */
export const SignedPayload = <A, I, R>(
  payloadSchema: S.Schema<A, I, R>,
  _secret: Redacted.Redacted<string>
): S.Schema<SignedPayload<A>, A, EncryptionServiceTag | R> => {
  // Lazy import to avoid circular dependency
  const { EncryptionService: _EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  // Use typeSchema to create a schema where both Type and Encoded are A
  // This allows the transform input (Encoded) to be A instead of I
  const PayloadTypeSchema = S.typeSchema(payloadSchema);

  // Create the signed struct schema using typeSchema for all fields
  // This ensures the transform works at the Type level (not Encoded level)
  const SignedStruct = S.Struct({
    payload: PayloadTypeSchema,
    signature: S.typeSchema(HmacSignature),
    signedAt: S.typeSchema(BS.DateTimeUtcFromAllAcceptable),
  });

  return S.transformOrFail(PayloadTypeSchema, SignedStruct, {
    strict: true,

    /**
     * decode: payload -> SignedPayload (signing)
     *
     * Takes a raw payload and signs it using HMAC-SHA256.
     * Returns the payload wrapped with signature and timestamp.
     */
    decode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* _EncryptionService;
        const payloadString = JSON.stringify(payload);
        const signature = yield* service.signPayload(payloadString, _secret);
        const signedAt = yield* DateTime.now;
        return { payload, signature, signedAt };
      }).pipe(
        Effect.mapError((e) => new ParseResult.Type(ast, payload, e instanceof Error ? e.message : "Signing failed"))
      ),

    /**
     * encode: SignedPayload -> payload (verification)
     *
     * Verifies the signature of a signed payload.
     * Returns the original payload if valid, fails if invalid.
     */
    encode: (signedPayload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* _EncryptionService;
        const payloadString = JSON.stringify(signedPayload.payload);
        const isValid = yield* service.verifySignature(payloadString, signedPayload.signature, _secret);

        if (!isValid) {
          return yield* Effect.fail(new ParseResult.Type(ast, signedPayload, "Invalid signature"));
        }
        return signedPayload.payload;
      }).pipe(
        Effect.mapError((e) =>
          e instanceof ParseResult.Type ? e : new ParseResult.Type(ast, signedPayload, "Verification failed")
        )
      ),
  });
};

/**
 * Creates a signed payload schema with expiration enforcement.
 *
 * @since 1.0.0
 * @category Transformations
 *
 * @remarks
 * Extends `SignedPayload` with automatic expiration checking during verification.
 * The expiration timestamp is embedded in the signed payload and checked before
 * signature verification (fail-fast pattern).
 *
 * ## Implementation Guidance for Implementer
 * The stub currently throws `Effect.die`. The implementer should:
 *
 * 1. In `decode` (signing):
 *    - Same as `SignedPayload.decode`
 *    - Additionally compute `expiresAt = DateTime.add(signedAt, ttl)`
 *    - Include `expiresAt` in the returned structure
 *
 * 2. In `encode` (verification):
 *    - First check: `if (DateTime.greaterThan(now, expiresAt))` -> fail with expiration error
 *    - Then verify signature as in `SignedPayload.encode`
 *
 * @example
 * import * as Duration from "effect/Duration";
 *
 * const SignedWithExpiry = SignedPayloadWithExpiration(
 *   UploadMetadata,
 *   secret,
 *   Duration.minutes(15)
 * );
 *
 * // Signing includes expiration
 * const signed = yield* S.decode(SignedWithExpiry)(metadata);
 * // signed.expiresAt is 15 minutes after signedAt
 *
 * // Verification checks expiration first
 * const result = yield* S.encode(SignedWithExpiry)(signed);
 * // Fails if expired, then verifies signature
 *
 * @param payloadSchema - Effect Schema for the payload
 * @param _secret
 * @param _ttl
 * @returns Schema with expiration enforcement
 *
 * @throws {ParseResult.Type} When expired or signature invalid
 *
 * @see SignedPayload for basic signing without expiration
 */
export const SignedPayloadWithExpiration = <A, I, R>(
  payloadSchema: S.Schema<A, I, R>,
  _secret: Redacted.Redacted<string>,
  _ttl: import("effect/Duration").Duration
): S.Schema<SignedPayload<A> & { readonly expiresAt: DateTime.Utc }, A, EncryptionServiceTag | R> => {
  // Lazy import to avoid circular dependency
  const { EncryptionService: _EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  // Use typeSchema to create a schema where both Type and Encoded are A
  // This allows the transform input (Encoded) to be A instead of I
  const PayloadTypeSchema = S.typeSchema(payloadSchema);

  // Create the signed struct with expiration using typeSchema for all fields
  // This ensures the transform works at the Type level (not Encoded level)
  const SignedStructWithExpiration = S.Struct({
    payload: PayloadTypeSchema,
    signature: S.typeSchema(HmacSignature),
    signedAt: S.typeSchema(BS.DateTimeUtcFromAllAcceptable),
    expiresAt: S.typeSchema(BS.DateTimeUtcFromAllAcceptable),
  });

  return S.transformOrFail(PayloadTypeSchema, SignedStructWithExpiration, {
    strict: true,

    /**
     * decode: payload -> SignedPayloadWithExpiration (signing with TTL)
     *
     * Takes a raw payload and signs it using HMAC-SHA256.
     * Returns the payload wrapped with signature, timestamp, and expiration.
     */
    decode: (input, __, ast) =>
      Effect.gen(function* () {
        const service = yield* _EncryptionService;
        const payloadString = JSON.stringify(input);
        const signature = yield* service.signPayload(payloadString, _secret);
        const signedAt = yield* DateTime.now;
        const expiresAt = DateTime.addDuration(signedAt, _ttl);
        return { payload: input, signature, signedAt, expiresAt };
      }).pipe(
        Effect.mapError((e) => new ParseResult.Type(ast, input, e instanceof Error ? e.message : "Signing failed"))
      ),

    /**
     * encode: SignedPayloadWithExpiration -> payload (verification with expiration check)
     *
     * Verifies the signature and checks expiration of a signed payload.
     * Returns the original payload if valid and not expired, fails otherwise.
     */
    encode: (signedPayload, __, ast) =>
      Effect.gen(function* () {
        // Check expiration first (fail-fast pattern)
        const now = yield* DateTime.now;
        if (DateTime.greaterThan(now, signedPayload.expiresAt)) {
          return yield* Effect.fail(new ParseResult.Type(ast, signedPayload, "Signature expired"));
        }

        // Then verify signature
        const service = yield* _EncryptionService;
        const payloadString = JSON.stringify(signedPayload.payload);
        const isValid = yield* service.verifySignature(payloadString, signedPayload.signature, _secret);

        if (!isValid) {
          return yield* Effect.fail(new ParseResult.Type(ast, signedPayload, "Invalid signature"));
        }
        return signedPayload.payload;
      }).pipe(
        Effect.mapError((e) =>
          e instanceof ParseResult.Type ? e : new ParseResult.Type(ast, signedPayload, "Verification failed")
        )
      ),
  });
};

/**
 * Creates a schema that hashes a string using SHA-256.
 *
 * - **decode**: Hashes a string to a hex-encoded SHA-256 digest
 * - **encode**: Forbidden (one-way transformation)
 *
 * @since 0.1.0
 * @category transformations
 */
export const Sha256HashFromString = (): S.Schema<Sha256Hash, string, EncryptionServiceTag> => {
  const { EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  return S.transformOrFail(S.String, Sha256Hash, {
    strict: true,
    decode: (input, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.sha256(input);
      }).pipe(Effect.mapError(() => new ParseResult.Type(ast, input, "Hash computation failed"))),
    encode: (hash, _, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, hash, "Cannot reverse a SHA-256 hash")),
  });
};

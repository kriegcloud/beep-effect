/**
 * @since 1.0.0
 * @module EncryptionService
 *
 * Provides AES-256-GCM encryption for client-side content encryption.
 * Uses Web Crypto API for all cryptographic operations.
 *
 * Note: Uses Uint8Array<ArrayBuffer> explicitly for TypeScript 5.9+ compatibility.
 * See: https://github.com/microsoft/typescript/issues/62168
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { DecryptionError, EncryptionError, HashError, KeyDerivationError } from "./errors";
import type { EncryptedPayload, EncryptedPayloadBinary } from "./schemas";

// ============================================================================
// Constants
// ============================================================================

/** AES-GCM initialization vector size in bytes (96 bits) */
const IV_LENGTH = 12;

/** AES-GCM auth tag length in bits */
const TAG_LENGTH = 128;

/** AES key size in bits for AES-256 */
const KEY_SIZE = 256;

// ============================================================================
// Type Definitions for TypeScript 5.9+ Compatibility
// ============================================================================

/**
 * Uint8Array backed by ArrayBuffer (not SharedArrayBuffer).
 * Required for Web Crypto API compatibility in TypeScript 5.9+.
 *
 * @since 1.0.0
 * @category types
 * @see https://github.com/microsoft/typescript/issues/62168
 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html
 */
export type CryptoUint8Array = Uint8Array<ArrayBuffer>;

// ============================================================================
// Service Definition
// ============================================================================

/**
 * EncryptionService provides cryptographic operations using AES-256-GCM
 *
 * @since 1.0.0
 * @category encryption
 */
export class EncryptionService extends Context.Tag("@beep/shared-domain/EncryptionService")<
  EncryptionService,
  {
    /**
     * Encrypt plaintext data using the provided key
     * Returns encrypted payload with IV for decryption
     */
    readonly encrypt: (
      plaintext: string | CryptoUint8Array,
      key: CryptoKey
    ) => Effect.Effect<EncryptedPayload, EncryptionError>;

    /**
     * Encrypt plaintext data, returning binary payload (for further processing)
     */
    readonly encryptBinary: (
      plaintext: string | CryptoUint8Array,
      key: CryptoKey
    ) => Effect.Effect<EncryptedPayloadBinary, EncryptionError>;

    /**
     * Decrypt an encrypted payload using the provided key
     * Returns the original plaintext as string
     */
    readonly decrypt: (payload: EncryptedPayload, key: CryptoKey) => Effect.Effect<string, DecryptionError>;

    /**
     * Decrypt an encrypted binary payload
     * Returns the original data as Uint8Array
     */
    readonly decryptBinary: (
      payload: EncryptedPayloadBinary,
      key: CryptoKey
    ) => Effect.Effect<CryptoUint8Array, DecryptionError>;

    /**
     * Decrypt an encrypted payload, returning binary data
     */
    readonly decryptToBytes: (
      payload: EncryptedPayload,
      key: CryptoKey
    ) => Effect.Effect<CryptoUint8Array, DecryptionError>;

    /**
     * Import a raw key (e.g., from a Redacted secret) for encryption/decryption
     */
    readonly importKey: (rawKey: Redacted.Redacted<CryptoUint8Array>) => Effect.Effect<CryptoKey, KeyDerivationError>;

    /**
     * Import a raw key from Base64-encoded string
     */
    readonly importKeyFromBase64: (
      base64Key: Redacted.Redacted<string>
    ) => Effect.Effect<CryptoKey, KeyDerivationError>;

    /**
     * Generate a new random encryption key
     */
    readonly generateKey: () => Effect.Effect<CryptoKey, KeyDerivationError>;

    /**
     * Export a CryptoKey to raw bytes (for storage)
     */
    readonly exportKey: (key: CryptoKey) => Effect.Effect<CryptoUint8Array, KeyDerivationError>;

    /**
     * Derive a space-specific key from a master key using HKDF
     */
    readonly deriveKey: (
      masterKey: CryptoKey,
      info: string,
      salt?: undefined | CryptoUint8Array
    ) => Effect.Effect<CryptoKey, KeyDerivationError>;

    /**
     * Compute SHA-256 hash of data, returning hex string
     */
    readonly sha256: (data: CryptoUint8Array | string) => Effect.Effect<string, HashError>;

    /**
     * Compute SHA-256 hash of data, returning raw bytes
     */
    readonly sha256Bytes: (data: CryptoUint8Array | string) => Effect.Effect<CryptoUint8Array, HashError>;
  }
>() {}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Create a fresh Uint8Array<ArrayBuffer> from any Uint8Array.
 * This is necessary because TypeScript 5.9+ distinguishes between
 * Uint8Array<ArrayBuffer> and Uint8Array<ArrayBufferLike>.
 *
 * @see https://github.com/microsoft/typescript/issues/62168
 */
const toCryptoUint8Array = (data: Uint8Array): CryptoUint8Array => {
  const buffer = new ArrayBuffer(data.length);
  const result = new Uint8Array(buffer);
  result.set(data);
  return result;
};

/**
 * Create the EncryptionService implementation using Web Crypto API
 *
 * @since 1.0.0
 * @category encryption
 */
export const makeEncryptionSubtle = (crypto: Crypto): Effect.Effect<typeof EncryptionService.Service> =>
  Effect.sync(() => {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    /**
     * Convert input to CryptoUint8Array (Uint8Array<ArrayBuffer>)
     */
    const toBytes = (input: string | CryptoUint8Array): CryptoUint8Array => {
      if (typeof input === "string") {
        // TextEncoder.encode returns Uint8Array backed by fresh ArrayBuffer
        return textEncoder.encode(input);
      }
      // Already a CryptoUint8Array, return as-is
      return input;
    };

    /**
     * Generate cryptographically random IV with proper ArrayBuffer backing
     */
    const generateIV = (): CryptoUint8Array => {
      const buffer = new ArrayBuffer(IV_LENGTH);
      const iv = new Uint8Array(buffer);
      crypto.getRandomValues(iv);
      return iv;
    };

    return EncryptionService.of({
      // ------------------------------------------------------------------
      // Encryption
      // ------------------------------------------------------------------

      encryptBinary: (plaintext, key) =>
        Effect.gen(function* () {
          const data = toBytes(plaintext);
          const iv = generateIV();

          const ciphertext = yield* Effect.tryPromise({
            try: () => crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: TAG_LENGTH }, key, data),
            catch: (cause) =>
              new EncryptionError({
                message: "Failed to encrypt data",
                cause,
                algorithm: "AES-GCM",
                phase: "encrypt",
              }),
          });

          return {
            iv,
            ciphertext: new Uint8Array(ciphertext),
            algorithm: "AES-GCM" as const,
          };
        }),

      encrypt: (plaintext, key) =>
        Effect.gen(function* () {
          const data = toBytes(plaintext);
          const iv = generateIV();

          const ciphertext = yield* Effect.tryPromise({
            try: () => crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: TAG_LENGTH }, key, data),
            catch: (cause) =>
              new EncryptionError({
                message: "Failed to encrypt data",
                cause,
                algorithm: "AES-GCM",
                phase: "encrypt",
              }),
          });

          // Encode to Base64 using Effect Encoding
          const ivBase64 = Encoding.encodeBase64(iv);
          const ciphertextBase64 = Encoding.encodeBase64(new Uint8Array(ciphertext));

          return {
            iv: ivBase64,
            ciphertext: ciphertextBase64,
            algorithm: "AES-GCM" as const,
          };
        }),

      // ------------------------------------------------------------------
      // Decryption
      // ------------------------------------------------------------------

      decryptBinary: (payload, key) =>
        Effect.gen(function* () {
          const iv = toCryptoUint8Array(payload.iv);
          const ciphertext = toCryptoUint8Array(payload.ciphertext);

          const plaintext = yield* Effect.tryPromise({
            try: () => crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: TAG_LENGTH }, key, ciphertext),
            catch: (cause) =>
              new DecryptionError({
                message: "Failed to decrypt data - invalid key or corrupted data",
                cause,
                algorithm: "AES-GCM",
                phase: "decrypt",
              }),
          });

          return new Uint8Array(plaintext);
        }),

      decrypt: (payload, key) =>
        Effect.gen(function* () {
          // Decode from Base64 using Effect Encoding
          const ivResult = Encoding.decodeBase64(payload.iv);
          const ciphertextResult = Encoding.decodeBase64(payload.ciphertext);

          if (ivResult._tag === "Left") {
            return yield* Effect.fail(
              new DecryptionError({
                message: "Failed to decode IV from Base64",
                cause: ivResult.left,
                algorithm: "AES-GCM",
                phase: "decode",
              })
            );
          }

          if (ciphertextResult._tag === "Left") {
            return yield* Effect.fail(
              new DecryptionError({
                message: "Failed to decode ciphertext from Base64",
                cause: ciphertextResult.left,
                algorithm: "AES-GCM",
                phase: "decode",
              })
            );
          }

          const iv = toCryptoUint8Array(ivResult.right);
          const ciphertext = toCryptoUint8Array(ciphertextResult.right);

          const plaintext = yield* Effect.tryPromise({
            try: () => crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: TAG_LENGTH }, key, ciphertext),
            catch: (cause) =>
              new DecryptionError({
                message: "Failed to decrypt data - invalid key or corrupted data",
                cause,
                algorithm: "AES-GCM",
                phase: "decrypt",
              }),
          });

          return textDecoder.decode(plaintext);
        }),

      decryptToBytes: (payload, key) =>
        Effect.gen(function* () {
          // Decode from Base64 using Effect Encoding
          const ivResult = Encoding.decodeBase64(payload.iv);
          const ciphertextResult = Encoding.decodeBase64(payload.ciphertext);

          if (ivResult._tag === "Left") {
            return yield* Effect.fail(
              new DecryptionError({
                message: "Failed to decode IV from Base64",
                cause: ivResult.left,
                algorithm: "AES-GCM",
                phase: "decode",
              })
            );
          }

          if (ciphertextResult._tag === "Left") {
            return yield* Effect.fail(
              new DecryptionError({
                message: "Failed to decode ciphertext from Base64",
                cause: ciphertextResult.left,
                algorithm: "AES-GCM",
                phase: "decode",
              })
            );
          }

          const iv = toCryptoUint8Array(ivResult.right);
          const ciphertext = toCryptoUint8Array(ciphertextResult.right);

          const plaintext = yield* Effect.tryPromise({
            try: () => crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: TAG_LENGTH }, key, ciphertext),
            catch: (cause) =>
              new DecryptionError({
                message: "Failed to decrypt data - invalid key or corrupted data",
                cause,
                algorithm: "AES-GCM",
                phase: "decrypt",
              }),
          });

          return new Uint8Array(plaintext);
        }),

      // ------------------------------------------------------------------
      // Key Management
      // ------------------------------------------------------------------

      importKey: (rawKey) =>
        Effect.gen(function* () {
          const keyBytes = toCryptoUint8Array(Redacted.value(rawKey));
          return yield* Effect.tryPromise({
            try: () => crypto.subtle.importKey("raw", keyBytes, "AES-GCM", true, ["encrypt", "decrypt"]),
            catch: (cause) =>
              new KeyDerivationError({
                message: "Failed to import encryption key",
                cause,
                algorithm: "AES-GCM",
              }),
          });
        }),

      importKeyFromBase64: (base64Key) =>
        Effect.gen(function* () {
          const keyString = Redacted.value(base64Key);
          const keyBytesResult = Encoding.decodeBase64(keyString);

          if (keyBytesResult._tag === "Left") {
            return yield* Effect.fail(
              new KeyDerivationError({
                message: "Failed to decode key from Base64",
                cause: keyBytesResult.left,
                algorithm: "AES-GCM",
              })
            );
          }

          const keyBytes = toCryptoUint8Array(keyBytesResult.right);
          return yield* Effect.tryPromise({
            try: () => crypto.subtle.importKey("raw", keyBytes, "AES-GCM", true, ["encrypt", "decrypt"]),
            catch: (cause) =>
              new KeyDerivationError({
                message: "Failed to import encryption key",
                cause,
                algorithm: "AES-GCM",
              }),
          });
        }),

      generateKey: () =>
        Effect.tryPromise({
          try: () => crypto.subtle.generateKey({ name: "AES-GCM", length: KEY_SIZE }, true, ["encrypt", "decrypt"]),
          catch: (cause) =>
            new KeyDerivationError({
              message: "Failed to generate encryption key",
              cause,
              algorithm: "AES-GCM",
            }),
        }),

      exportKey: (key) =>
        Effect.gen(function* () {
          const raw = yield* Effect.tryPromise({
            try: () => crypto.subtle.exportKey("raw", key),
            catch: (cause) =>
              new KeyDerivationError({
                message: "Failed to export encryption key",
                cause,
                algorithm: "AES-GCM",
              }),
          });
          return new Uint8Array(raw);
        }),

      deriveKey: (masterKey, info, salt) =>
        Effect.gen(function* () {
          // Export master key to derive new key material
          const masterKeyRaw = yield* Effect.tryPromise({
            try: () => crypto.subtle.exportKey("raw", masterKey),
            catch: (cause) =>
              new KeyDerivationError({
                message: "Failed to export master key for derivation",
                cause,
                algorithm: "HKDF",
              }),
          });

          // Import as HKDF key
          const hkdfKey = yield* Effect.tryPromise({
            try: () => crypto.subtle.importKey("raw", masterKeyRaw, "HKDF", false, ["deriveKey"]),
            catch: (cause) =>
              new KeyDerivationError({
                message: "Failed to import key for HKDF derivation",
                cause,
                algorithm: "HKDF",
              }),
          });

          // Prepare salt and info with proper ArrayBuffer backing
          const saltBuffer = new ArrayBuffer(salt ? salt.length : 32);
          const saltBytes = new Uint8Array(saltBuffer);
          if (salt) {
            saltBytes.set(salt);
          }

          const infoBytes = textEncoder.encode(info);

          // Derive the space-specific key
          return yield* Effect.tryPromise({
            try: () =>
              crypto.subtle.deriveKey(
                {
                  name: "HKDF",
                  hash: "SHA-256",
                  salt: saltBytes,
                  info: infoBytes,
                },
                hkdfKey,
                { name: "AES-GCM", length: KEY_SIZE },
                true,
                ["encrypt", "decrypt"]
              ),
            catch: (cause) =>
              new KeyDerivationError({
                message: `Failed to derive key for: ${info}`,
                cause,
                algorithm: "HKDF",
              }),
          });
        }),

      // ------------------------------------------------------------------
      // Hashing
      // ------------------------------------------------------------------

      sha256Bytes: (data) =>
        Effect.gen(function* () {
          const bytes = toBytes(data);

          const hash = yield* Effect.tryPromise({
            try: () => crypto.subtle.digest("SHA-256", bytes),
            catch: (cause) =>
              new HashError({
                message: "Failed to compute SHA-256 hash",
                cause,
                algorithm: "SHA-256",
              }),
          });

          return new Uint8Array(hash);
        }),

      sha256: (data) =>
        Effect.gen(function* () {
          const bytes = toBytes(data);

          const hash = yield* Effect.tryPromise({
            try: () => crypto.subtle.digest("SHA-256", bytes),
            catch: (cause) =>
              new HashError({
                message: "Failed to compute SHA-256 hash",
                cause,
                algorithm: "SHA-256",
              }),
          });

          // Convert to hex string using Effect Encoding
          return Encoding.encodeHex(new Uint8Array(hash));
        }),
    });
  });

// ============================================================================
// Layer
// ============================================================================

/**
 * Layer that provides EncryptionService using the global crypto object
 *
 * @since 1.0.0
 * @category encryption
 */
export const layer: Layer.Layer<EncryptionService> = Layer.suspend(() =>
  Layer.effect(EncryptionService, makeEncryptionSubtle(globalThis.crypto))
);

/**
 * Layer that provides EncryptionService using a custom Crypto instance
 *
 * @since 1.0.0
 * @category encryption
 */
export const layerWithCrypto = (crypto: Crypto): Layer.Layer<EncryptionService> =>
  Layer.effect(EncryptionService, makeEncryptionSubtle(crypto));

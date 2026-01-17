/**
 * @since 0.1.0
 * @module EncryptionService
 *
 * Provides AES-256-GCM encryption for client-side content encryption.
 * Uses Web Crypto API for all cryptographic operations.
 *
 * Note: Uses Uint8Array<ArrayBuffer> explicitly for TypeScript 5.9+ compatibility.
 * See: https://github.com/microsoft/typescript/issues/62168
 */
import { $SharedDomainId } from "@beep/identity/packages";
import SQIds, { defaultOptions } from "@beep/utils/sqids";
import { pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as Hash from "effect/Hash";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import { DecryptionError, EncryptionError, HashError, KeyDerivationError, SigningError } from "./errors";
import type { EncryptedPayload, EncryptedPayloadBinary } from "./schemas";

const $I = $SharedDomainId.create("services/EncryptionService");

// ============================================================================
// Constants
// ============================================================================

/** AES-GCM initialization vector size in bytes (96 bits) */
const IV_LENGTH = 12;

/** AES-GCM auth tag length in bits */
const TAG_LENGTH = 128;

/** AES key size in bits for AES-256 */
const KEY_SIZE = 256;

/** HMAC-SHA256 signature prefix */
const HMAC_SIGNATURE_PREFIX = "hmac-sha256=";

/** HMAC-SHA256 algorithm config */
const HMAC_ALGORITHM = { name: "HMAC", hash: "SHA-256" };

/** TextEncoder for HMAC operations */
const hmacEncoder = new TextEncoder();

// ============================================================================
// Type Definitions for TypeScript 5.9+ Compatibility
// ============================================================================

/**
 * Uint8Array backed by ArrayBuffer (not SharedArrayBuffer).
 * Required for Web Crypto API compatibility in TypeScript 5.9+.
 *
 * @since 0.1.0
 * @category types
 * @see https://github.com/microsoft/typescript/issues/62168
 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html
 */
export type CryptoUint8Array = Uint8Array<ArrayBuffer>;

/**
 * Properties of a file used for key generation
 * @since 0.1.0
 * @category types
 */
export interface FileProperties {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly lastModified?: number | undefined;
}

/**
 * Function type for extracting hash parts from file properties
 * @since 0.1.0
 * @category types
 */
export type ExtractHashPartsFn = (file: FileProperties) => (string | number | undefined | null | boolean)[];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Shuffle a string using a seed for deterministic randomization
 */
function shuffle(str: string, seed: string) {
  const chars = Str.split("")(str);
  const seedNum = Hash.string(seed);

  let temp: string;
  let j: number;
  for (let i = 0; i < chars.length; i++) {
    j = ((seedNum % (i + 1)) + i) % chars.length;
    temp = chars[i]!;
    chars[i] = chars[j]!;
    chars[j] = temp;
  }

  return pipe(chars, A.join(""));
}

// ============================================================================
// Service Definition
// ============================================================================

/**
 * EncryptionService provides cryptographic operations using AES-256-GCM
 *
 * @since 0.1.0
 * @category encryption
 */
export class EncryptionService extends Context.Tag($I`EncryptionService`)<
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

    // ------------------------------------------------------------------
    // HMAC Signing & Verification
    // ------------------------------------------------------------------

    /**
     * Sign a payload using HMAC-SHA256
     * Returns signature prefixed with "hmac-sha256="
     */
    readonly signPayload: (payload: string, secret: Redacted.Redacted<string>) => Effect.Effect<string, SigningError>;

    /**
     * Verify an HMAC-SHA256 signature
     * Returns true if signature is valid, false otherwise
     */
    readonly verifySignature: (
      payload: string,
      signature: string | null,
      secret: Redacted.Redacted<string>
    ) => Effect.Effect<boolean, never>;

    // ------------------------------------------------------------------
    // File Key Generation & Verification
    // ------------------------------------------------------------------

    /**
     * Generate a unique key for a file based on its properties and app ID
     * Uses SQIds for encoding with shuffled alphabet based on app ID
     */
    readonly generateFileKey: (
      file: FileProperties,
      appId: string,
      getHashParts?: ExtractHashPartsFn | undefined
    ) => Effect.Effect<string, never>;

    /**
     * Verify that a file key was generated for a specific app ID
     */
    readonly verifyFileKey: (key: string, appId: string) => Effect.Effect<boolean, never>;

    // ------------------------------------------------------------------
    // Signed URL Generation
    // ------------------------------------------------------------------

    /**
     * Generate a signed URL with expiration and optional data
     */
    readonly generateSignedURL: (
      url: string | URL,
      secretKey: Redacted.Redacted<string>,
      opts: {
        readonly ttlInSeconds?: Duration.Duration | undefined;
        readonly data?: Record<string, string | number | boolean | null | undefined> | undefined;
      }
    ) => Effect.Effect<string, SigningError>;
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
 * @since 0.1.0
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

      encryptBinary: Effect.fn(function* (plaintext, key) {
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

      encrypt: Effect.fn(function* (plaintext, key) {
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

      decryptBinary: Effect.fn(function* (payload, key) {
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

      decrypt: Effect.fn(function* (payload, key) {
        // Decode from Base64 using Effect Encoding
        const ivResult = Encoding.decodeBase64(payload.iv);
        const ciphertextResult = Encoding.decodeBase64(payload.ciphertext);

        if (ivResult._tag === "Left") {
          return yield* new DecryptionError({
            message: "Failed to decode IV from Base64",
            cause: ivResult.left,
            algorithm: "AES-GCM",
            phase: "decode",
          });
        }

        if (ciphertextResult._tag === "Left") {
          return yield* new DecryptionError({
            message: "Failed to decode ciphertext from Base64",
            cause: ciphertextResult.left,
            algorithm: "AES-GCM",
            phase: "decode",
          });
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

      decryptToBytes: Effect.fn(function* (payload, key) {
        // Decode from Base64 using Effect Encoding
        const ivResult = Encoding.decodeBase64(payload.iv);
        const ciphertextResult = Encoding.decodeBase64(payload.ciphertext);

        if (ivResult._tag === "Left") {
          return yield* new DecryptionError({
            message: "Failed to decode IV from Base64",
            cause: ivResult.left,
            algorithm: "AES-GCM",
            phase: "decode",
          });
        }

        if (ciphertextResult._tag === "Left") {
          return yield* new DecryptionError({
            message: "Failed to decode ciphertext from Base64",
            cause: ciphertextResult.left,
            algorithm: "AES-GCM",
            phase: "decode",
          });
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

      importKey: Effect.fn(function* (rawKey) {
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

      importKeyFromBase64: Effect.fn(function* (base64Key) {
        const keyString = Redacted.value(base64Key);
        const keyBytesResult = Encoding.decodeBase64(keyString);

        if (keyBytesResult._tag === "Left") {
          return yield* new KeyDerivationError({
            message: "Failed to decode key from Base64",
            cause: keyBytesResult.left,
            algorithm: "AES-GCM",
          });
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

      exportKey: Effect.fn(function* (key) {
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

      deriveKey: Effect.fn(function* (masterKey, info, salt) {
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

      sha256Bytes: Effect.fn(function* (data) {
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

      sha256: Effect.fn(function* (data) {
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

      // ------------------------------------------------------------------
      // HMAC Signing & Verification
      // ------------------------------------------------------------------

      signPayload: Effect.fn(function* (payload, secret) {
        const signingKey = yield* Effect.tryPromise({
          try: () =>
            crypto.subtle.importKey("raw", hmacEncoder.encode(Redacted.value(secret)), HMAC_ALGORITHM, false, ["sign"]),
          catch: (cause) =>
            new SigningError({
              message: "Invalid Signing Secret",
              cause,
              algorithm: "HMAC-SHA256",
              phase: "import-key",
            }),
        });

        const signature = yield* Effect.map(
          Effect.tryPromise({
            try: () => crypto.subtle.sign(HMAC_ALGORITHM, signingKey, hmacEncoder.encode(payload)),
            catch: (cause) =>
              new SigningError({
                message: "Failed to sign payload",
                cause,
                algorithm: "HMAC-SHA256",
                phase: "sign",
              }),
          }),
          (arrayBuffer) => Encoding.encodeHex(new Uint8Array(arrayBuffer))
        );

        return `${HMAC_SIGNATURE_PREFIX}${signature}`;
      }),

      verifySignature: Effect.fn(
        function* (payload, signature, secret) {
          const sigOpt = pipe(signature, O.fromNullable, O.map(Str.slice(HMAC_SIGNATURE_PREFIX.length)));

          if (O.isNone(sigOpt)) return false;

          const sig = sigOpt.value;
          const secretBytes = hmacEncoder.encode(Redacted.value(secret));
          const signingKey = yield* Effect.promise(() =>
            crypto.subtle.importKey("raw", secretBytes, HMAC_ALGORITHM, false, ["verify"])
          );

          const sigBytes = yield* Encoding.decodeHex(sig);
          const payloadBytes = hmacEncoder.encode(payload);
          return yield* Effect.promise(() =>
            crypto.subtle.verify(HMAC_ALGORITHM, signingKey, new Uint8Array(sigBytes), payloadBytes)
          );
        },
        Effect.orElseSucceed(() => false)
      ),

      // ------------------------------------------------------------------
      // File Key Generation & Verification
      // ------------------------------------------------------------------

      generateFileKey: (file, appId, getHashParts) =>
        Effect.sync(() => {
          // Get the parts of which we should hash to construct the key
          // This allows the user to customize the hashing algorithm
          // If they for example want to generate the same key for the
          // same file whenever it was uploaded
          const hashParts = JSON.stringify(
            getHashParts?.(file) ?? [file.name, file.size, file.type, file.lastModified, Date.now()]
          );

          // Hash and Encode the parts and appId as sqids
          const alphabet = shuffle(defaultOptions.alphabet, appId);
          const encodedFileSeed = new SQIds({ alphabet, minLength: 36 }).encode([Math.abs(Hash.string(hashParts))]);
          const encodedAppId = new SQIds({ alphabet, minLength: 12 }).encode([Math.abs(Hash.string(appId))]);

          // Concatenate them
          return encodedAppId + encodedFileSeed;
        }),

      verifyFileKey: (key, appId) =>
        Effect.sync(() => {
          const alphabet = shuffle(defaultOptions.alphabet, appId);
          const expectedPrefix = new SQIds({ alphabet, minLength: 12 }).encode([Math.abs(Hash.string(appId))]);

          return Str.startsWith(expectedPrefix)(key);
        }).pipe(Effect.orElseSucceed(() => false)),

      // ------------------------------------------------------------------
      // Signed URL Generation
      // ------------------------------------------------------------------

      generateSignedURL: Effect.fn(function* (url, secretKey, opts) {
        const parsedURL = new URL(url);
        const ttl = opts.ttlInSeconds ? Duration.toSeconds(opts.ttlInSeconds) : 60 * 60;

        const expirationTime = Date.now() + ttl * 1000;
        parsedURL.searchParams.append("expires", expirationTime.toString());

        if (opts.data) {
          A.forEach(Struct.entries(opts.data), ([key, value]) => {
            if (P.isNullable(value)) return;
            const encoded = encodeURIComponent(value);
            parsedURL.searchParams.append(key, encoded);
          });
        }

        const signingKey = yield* Effect.tryPromise({
          try: () =>
            crypto.subtle.importKey("raw", hmacEncoder.encode(Redacted.value(secretKey)), HMAC_ALGORITHM, false, [
              "sign",
            ]),
          catch: (cause) =>
            new SigningError({
              message: "Invalid Signing Secret",
              cause,
              algorithm: "HMAC-SHA256",
              phase: "import-key",
            }),
        });

        const signature = yield* Effect.map(
          Effect.tryPromise({
            try: () => crypto.subtle.sign(HMAC_ALGORITHM, signingKey, hmacEncoder.encode(parsedURL.toString())),
            catch: (cause) =>
              new SigningError({
                message: "Failed to sign URL",
                cause,
                algorithm: "HMAC-SHA256",
                phase: "sign",
              }),
          }),
          (arrayBuffer) => `${HMAC_SIGNATURE_PREFIX}${Encoding.encodeHex(new Uint8Array(arrayBuffer))}`
        );

        parsedURL.searchParams.append("signature", signature);

        return parsedURL.href;
      }),
    });
  });

// ============================================================================
// Layer
// ============================================================================

/**
 * Layer that provides EncryptionService using the global crypto object
 *
 * @since 0.1.0
 * @category encryption
 */
export const layer: Layer.Layer<EncryptionService> = Layer.suspend(() =>
  Layer.effect(EncryptionService, makeEncryptionSubtle(globalThis.crypto))
);

/**
 * Layer that provides EncryptionService using a custom Crypto instance
 *
 * @since 0.1.0
 * @category encryption
 */
export const layerWithCrypto = (crypto: Crypto): Layer.Layer<EncryptionService> =>
  Layer.effect(EncryptionService, makeEncryptionSubtle(crypto));

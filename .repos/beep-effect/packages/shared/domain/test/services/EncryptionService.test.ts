import { describe } from "bun:test";
import * as EncryptionService from "@beep/shared-domain/services/EncryptionService";
import { assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as Str from "effect/String";

/**
 * Test layer that provides EncryptionService using global crypto
 */
const TestLayer = EncryptionService.layer;

describe("EncryptionService", () => {
  layer(TestLayer)("encrypt and decrypt", (it) => {
    it.effect("should encrypt and decrypt a string correctly", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const plaintext = "Hello, World!";
        const encrypted = yield* service.encrypt(plaintext, key);
        const decrypted = yield* service.decrypt(encrypted, key);

        strictEqual(decrypted, plaintext);
      })
    );

    it.effect("should encrypt and decrypt binary data correctly", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const buffer = new ArrayBuffer(16);
        const plaintext = new Uint8Array(buffer);
        for (let i = 0; i < 16; i++) {
          plaintext[i] = i;
        }

        const encrypted = yield* service.encryptBinary(plaintext, key);
        const decrypted = yield* service.decryptBinary(encrypted, key);

        deepStrictEqual(Array.from(decrypted), Array.from(plaintext));
      })
    );

    it.effect("should produce different ciphertext for same plaintext (random IV)", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const plaintext = "Same plaintext";
        const encrypted1 = yield* service.encrypt(plaintext, key);
        const encrypted2 = yield* service.encrypt(plaintext, key);

        // IVs should be different
        assertTrue(encrypted1.iv !== encrypted2.iv);
        // Ciphertext should be different due to different IVs
        assertTrue(encrypted1.ciphertext !== encrypted2.ciphertext);

        // But both should decrypt to same plaintext
        const decrypted1 = yield* service.decrypt(encrypted1, key);
        const decrypted2 = yield* service.decrypt(encrypted2, key);

        strictEqual(decrypted1, plaintext);
        strictEqual(decrypted2, plaintext);
      })
    );

    it.effect("should fail to decrypt with wrong key", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key1 = yield* service.generateKey();
        const key2 = yield* service.generateKey();

        const plaintext = "Secret message";
        const encrypted = yield* service.encrypt(plaintext, key1);

        const result = yield* Effect.either(service.decrypt(encrypted, key2));

        strictEqual(result._tag, "Left");
        if (result._tag === "Left") {
          strictEqual(result.left._tag, "DecryptionError");
        }
      })
    );

    it.effect("should decrypt to bytes from base64 payload", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const plaintext = "Binary content test";
        const encrypted = yield* service.encrypt(plaintext, key);
        const decryptedBytes = yield* service.decryptToBytes(encrypted, key);

        // Convert bytes back to string for comparison
        const decoder = new TextDecoder();
        const decryptedString = decoder.decode(decryptedBytes);

        strictEqual(decryptedString, plaintext);
      })
    );

    it.effect("should handle empty string", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const plaintext = "";
        const encrypted = yield* service.encrypt(plaintext, key);
        const decrypted = yield* service.decrypt(encrypted, key);

        strictEqual(decrypted, plaintext);
      })
    );

    it.effect("should handle unicode content", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const plaintext = "Hello, \u4E16\u754C! \uD83D\uDE00 \u00E9\u00E8\u00EA";
        const encrypted = yield* service.encrypt(plaintext, key);
        const decrypted = yield* service.decrypt(encrypted, key);

        strictEqual(decrypted, plaintext);
      })
    );

    it.effect("should handle large content", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        // Create a large string (1MB)
        const plaintext = "x".repeat(1024 * 1024);
        const encrypted = yield* service.encrypt(plaintext, key);
        const decrypted = yield* service.decrypt(encrypted, key);

        strictEqual(decrypted.length, plaintext.length);
        strictEqual(decrypted, plaintext);
      })
    );
  });

  layer(TestLayer)("key management", (it) => {
    it.effect("should generate unique keys", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const key1 = yield* service.generateKey();
        const key2 = yield* service.generateKey();

        const exported1 = yield* service.exportKey(key1);
        const exported2 = yield* service.exportKey(key2);

        // Keys should be 256 bits (32 bytes)
        strictEqual(exported1.length, 32);
        strictEqual(exported2.length, 32);

        // Keys should be different
        assertTrue(Array.from(exported1).some((byte, i) => byte !== exported2[i]));
      })
    );

    it.effect("should import and export key correctly", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        // Generate a key
        const originalKey = yield* service.generateKey();
        const exported = yield* service.exportKey(originalKey);

        // Import it back
        const importedKey = yield* service.importKey(Redacted.make(exported));

        // Use both keys to encrypt/decrypt
        const plaintext = "Test import/export";
        const encrypted = yield* service.encrypt(plaintext, originalKey);
        const decrypted = yield* service.decrypt(encrypted, importedKey);

        strictEqual(decrypted, plaintext);
      })
    );

    it.effect("should import key from base64", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        // Generate a key and export
        const originalKey = yield* service.generateKey();
        const exported = yield* service.exportKey(originalKey);

        // Convert to base64
        const base64Key = Buffer.from(exported).toString("base64");

        // Import from base64
        const importedKey = yield* service.importKeyFromBase64(Redacted.make(base64Key));

        // Verify it works
        const plaintext = "Test base64 import";
        const encrypted = yield* service.encrypt(plaintext, originalKey);
        const decrypted = yield* service.decrypt(encrypted, importedKey);

        strictEqual(decrypted, plaintext);
      })
    );

    it.effect("should derive different keys for different info strings", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const masterKey = yield* service.generateKey();

        const derivedKey1 = yield* service.deriveKey(masterKey, "space-1");
        const derivedKey2 = yield* service.deriveKey(masterKey, "space-2");

        const exported1 = yield* service.exportKey(derivedKey1);
        const exported2 = yield* service.exportKey(derivedKey2);

        // Derived keys should be different
        assertTrue(Array.from(exported1).some((byte, i) => byte !== exported2[i]));

        // But both should work for encryption
        const plaintext = "Test derived keys";
        const encrypted1 = yield* service.encrypt(plaintext, derivedKey1);
        const encrypted2 = yield* service.encrypt(plaintext, derivedKey2);

        const decrypted1 = yield* service.decrypt(encrypted1, derivedKey1);
        const decrypted2 = yield* service.decrypt(encrypted2, derivedKey2);

        strictEqual(decrypted1, plaintext);
        strictEqual(decrypted2, plaintext);
      })
    );

    it.effect("should derive same key for same info and salt", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const masterKey = yield* service.generateKey();
        const buffer = new ArrayBuffer(32);
        const salt = new Uint8Array(buffer);
        crypto.getRandomValues(salt);

        const derivedKey1 = yield* service.deriveKey(masterKey, "same-info", salt);
        const derivedKey2 = yield* service.deriveKey(masterKey, "same-info", salt);

        const exported1 = yield* service.exportKey(derivedKey1);
        const exported2 = yield* service.exportKey(derivedKey2);

        // Same master key, info, and salt should produce same derived key
        deepStrictEqual(Array.from(exported1), Array.from(exported2));
      })
    );
  });

  layer(TestLayer)("hashing", (it) => {
    it.effect("should compute consistent SHA-256 hash", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const data = "Hello, World!";
        const hash1 = yield* service.sha256(data);
        const hash2 = yield* service.sha256(data);

        // Same input should produce same hash
        strictEqual(hash1, hash2);

        // Hash should be 64 hex characters (256 bits)
        strictEqual(hash1.length, 64);
      })
    );

    it.effect("should compute different hashes for different inputs", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const hash1 = yield* service.sha256("Hello");
        const hash2 = yield* service.sha256("World");

        assertTrue(hash1 !== hash2);
      })
    );

    it.effect("should compute sha256Bytes correctly", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const data = "Hello, World!";
        const hashHex = yield* service.sha256(data);
        const hashBytes = yield* service.sha256Bytes(data);

        // Hash bytes should be 32 bytes (256 bits)
        strictEqual(hashBytes.length, 32);

        // Convert bytes to hex and compare
        const hexFromBytes = Array.from(hashBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        strictEqual(hexFromBytes, hashHex);
      })
    );

    it.effect("should hash binary data", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const buffer = new ArrayBuffer(16);
        const binaryData = new Uint8Array(buffer);
        for (let i = 0; i < 16; i++) {
          binaryData[i] = i;
        }

        const hash = yield* service.sha256(binaryData);

        // Hash should be valid hex string
        strictEqual(hash.length, 64);
        assertTrue(/^[0-9a-f]+$/.test(hash));
      })
    );
  });

  layer(TestLayer)("error handling", (it) => {
    it.effect("should fail on invalid base64 IV", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const invalidPayload = {
          iv: "not-valid-base64!!!",
          ciphertext: "YWJjZGVm", // valid base64
          algorithm: "AES-GCM" as const,
        };

        const result = yield* Effect.either(service.decrypt(invalidPayload, key));

        strictEqual(result._tag, "Left");
        if (result._tag === "Left") {
          strictEqual(result.left._tag, "DecryptionError");
          strictEqual(result.left.phase, "decode");
        }
      })
    );

    it.effect("should fail on invalid base64 ciphertext", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const invalidPayload = {
          iv: "YWJjZGVmZ2hpamts", // valid base64
          ciphertext: "not-valid-base64!!!",
          algorithm: "AES-GCM" as const,
        };

        const result = yield* Effect.either(service.decrypt(invalidPayload, key));

        strictEqual(result._tag, "Left");
        if (result._tag === "Left") {
          strictEqual(result.left._tag, "DecryptionError");
          strictEqual(result.left.phase, "decode");
        }
      })
    );

    it.effect("should fail on corrupted ciphertext", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const plaintext = "Original message";
        const encrypted = yield* service.encrypt(plaintext, key);

        // Corrupt the ciphertext by modifying a character
        const corruptedPayload = {
          ...encrypted,
          ciphertext: `${Str.slice(0, -4)(encrypted.ciphertext)}XXXX`,
        };

        const result = yield* Effect.either(service.decrypt(corruptedPayload, key));

        strictEqual(result._tag, "Left");
        if (result._tag === "Left") {
          strictEqual(result.left._tag, "DecryptionError");
          strictEqual(result.left.phase, "decrypt");
        }
      })
    );

    it.effect("should fail to import invalid base64 key", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;

        const result = yield* Effect.either(service.importKeyFromBase64(Redacted.make("not-valid-base64!!!")));

        strictEqual(result._tag, "Left");
        if (result._tag === "Left") {
          strictEqual(result.left._tag, "KeyDerivationError");
        }
      })
    );
  });

  // ==========================================================================
  // Schema-based Encryption Transformations
  // ==========================================================================

  layer(TestLayer)("schema transformations - EncryptedStringFromPlaintext", (it) => {
    it.effect("should encrypt via Schema.decode and decrypt via Schema.encode", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const schema = EncryptionService.EncryptedStringFromPlaintext(key);
        const plaintext = "Hello, Schema!";

        // decode: plaintext -> encrypted
        const encrypted = yield* Schema.decode(schema)(plaintext);

        // Verify it's a valid EncryptedPayload
        strictEqual(encrypted.algorithm, "AES-GCM");
        assertTrue(encrypted.iv.length > 0);
        assertTrue(encrypted.ciphertext.length > 0);

        // encode: encrypted -> plaintext
        const decrypted = yield* Schema.encode(schema)(encrypted);

        strictEqual(decrypted, plaintext);
      })
    );

    it.effect("should produce different ciphertext for same plaintext (random IV)", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const schema = EncryptionService.EncryptedStringFromPlaintext(key);
        const plaintext = "Same message";

        const encrypted1 = yield* Schema.decode(schema)(plaintext);
        const encrypted2 = yield* Schema.decode(schema)(plaintext);

        // IVs should be different
        assertTrue(encrypted1.iv !== encrypted2.iv);

        // Both should decrypt to same plaintext
        const decrypted1 = yield* Schema.encode(schema)(encrypted1);
        const decrypted2 = yield* Schema.encode(schema)(encrypted2);

        strictEqual(decrypted1, plaintext);
        strictEqual(decrypted2, plaintext);
      })
    );

    it.effect("should fail to decrypt with wrong key schema", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key1 = yield* service.generateKey();
        const key2 = yield* service.generateKey();

        const schema1 = EncryptionService.EncryptedStringFromPlaintext(key1);
        const schema2 = EncryptionService.EncryptedStringFromPlaintext(key2);

        const plaintext = "Secret";
        const encrypted = yield* Schema.decode(schema1)(plaintext);

        // Try to decrypt with wrong key
        const result = yield* Effect.either(Schema.encode(schema2)(encrypted));

        strictEqual(result._tag, "Left");
      })
    );

    it.effect("should handle unicode content via schema", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const schema = EncryptionService.EncryptedStringFromPlaintext(key);
        const plaintext = "Hello, 世界! 🎉";

        const encrypted = yield* Schema.decode(schema)(plaintext);
        const decrypted = yield* Schema.encode(schema)(encrypted);

        strictEqual(decrypted, plaintext);
      })
    );
  });

  layer(TestLayer)("schema transformations - EncryptedBinaryFromPlaintext", (it) => {
    it.effect("should encrypt string to binary payload via schema", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const schema = EncryptionService.EncryptedBinaryFromPlaintext(key);
        const plaintext = "Binary test";

        const encrypted = yield* Schema.decode(schema)(plaintext);

        // Verify it's a valid binary payload
        strictEqual(encrypted.algorithm, "AES-GCM");
        assertTrue(encrypted.iv instanceof Uint8Array);
        assertTrue(encrypted.ciphertext instanceof Uint8Array);
        strictEqual(encrypted.iv.length, 12); // 96 bits

        const decrypted = yield* Schema.encode(schema)(encrypted);
        strictEqual(decrypted, plaintext);
      })
    );
  });

  layer(TestLayer)("schema transformations - EncryptedPayloadFromBytes", (it) => {
    it.effect("should encrypt bytes to base64 payload via schema", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const schema = EncryptionService.EncryptedPayloadFromBytes(key);
        const buffer = new ArrayBuffer(16);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < 16; i++) {
          bytes[i] = i;
        }

        const encrypted = yield* Schema.decode(schema)(bytes);

        // Verify it's a base64 payload
        strictEqual(encrypted.algorithm, "AES-GCM");
        strictEqual(typeof encrypted.iv, "string");
        strictEqual(typeof encrypted.ciphertext, "string");

        const decrypted = yield* Schema.encode(schema)(encrypted);
        deepStrictEqual(Array.from(decrypted), Array.from(bytes));
      })
    );
  });

  layer(TestLayer)("schema transformations - EncryptedBinaryFromBytes", (it) => {
    it.effect("should encrypt bytes to binary payload via schema", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService;
        const key = yield* service.generateKey();

        const schema = EncryptionService.EncryptedBinaryFromBytes(key);
        const buffer = new ArrayBuffer(8);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < 8; i++) {
          bytes[i] = i * 2;
        }

        const encrypted = yield* Schema.decode(schema)(bytes);

        // Verify binary payload
        assertTrue(encrypted.iv instanceof Uint8Array);
        assertTrue(encrypted.ciphertext instanceof Uint8Array);

        const decrypted = yield* Schema.encode(schema)(encrypted);
        deepStrictEqual(Array.from(decrypted), Array.from(bytes));
      })
    );
  });

  layer(TestLayer)("schema transformations - Sha256HashFromString", (it) => {
    it.effect("should hash string via schema decode", () =>
      Effect.gen(function* () {
        const schema = EncryptionService.Sha256HashFromString();
        const input = "Hello, World!";

        const hash = yield* Schema.decode(schema)(input);

        // Hash should be 64 hex characters
        strictEqual(hash.length, 64);
        assertTrue(/^[0-9a-f]+$/.test(hash));
      })
    );

    it.effect("should produce consistent hash for same input", () =>
      Effect.gen(function* () {
        const schema = EncryptionService.Sha256HashFromString();
        const input = "Consistent input";

        const hash1 = yield* Schema.decode(schema)(input);
        const hash2 = yield* Schema.decode(schema)(input);

        strictEqual(hash1, hash2);
      })
    );

    it.effect("should forbid encoding (one-way transformation)", () =>
      Effect.gen(function* () {
        const schema = EncryptionService.Sha256HashFromString();
        const input = "Test";

        const hash = yield* Schema.decode(schema)(input);
        const result = yield* Effect.either(Schema.encode(schema)(hash));

        strictEqual(result._tag, "Left");
      })
    );
  });
});

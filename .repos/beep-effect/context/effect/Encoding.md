# Encoding — Agent Context

> Quick reference for AI agents working with `effect/Encoding`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Encoding.encodeBase64` | Encode `Uint8Array` or `string` to base64 | `Encoding.encodeBase64(bytes)` |
| `Encoding.decodeBase64` | Decode base64 string to `Uint8Array` | `Encoding.decodeBase64(str)` (returns `Either`) |
| `Encoding.decodeBase64String` | Decode base64 to UTF-8 string | `Encoding.decodeBase64String(str)` |
| `Encoding.encodeBase64Url` | Encode to base64url (URL-safe) | `Encoding.encodeBase64Url(bytes)` |
| `Encoding.decodeBase64Url` | Decode base64url to `Uint8Array` | `Encoding.decodeBase64Url(str)` |
| `Encoding.encodeHex` | Encode to hexadecimal string | `Encoding.encodeHex(bytes)` |
| `Encoding.decodeHex` | Decode hex string to `Uint8Array` | `Encoding.decodeHex(hexStr)` |
| `Encoding.encodeUriComponent` | URI component encoding | `Encoding.encodeUriComponent(str)` |
| `Encoding.decodeUriComponent` | URI component decoding | `Encoding.decodeUriComponent(encoded)` |

## Import Convention

```typescript
import * as Encoding from "effect/Encoding";
```

## Codebase Patterns

### Pattern: Encryption Service Base64 Encoding

When encrypting data for storage/transmission, encode binary outputs to base64 strings:

```typescript
import * as Encoding from "effect/Encoding";
import * as Effect from "effect/Effect";

// From packages/shared/domain/src/services/EncryptionService/EncryptionService.ts
const encryptToBase64 = Effect.gen(function* () {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = yield* Effect.tryPromise({
    try: () => crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      data
    ),
    catch: (cause) => new EncryptionError({ /* ... */ }),
  });

  // Encode binary outputs to base64 for storage
  const ivBase64 = Encoding.encodeBase64(iv);
  const ciphertextBase64 = Encoding.encodeBase64(new Uint8Array(ciphertext));

  return {
    iv: ivBase64,
    ciphertext: ciphertextBase64,
    algorithm: "AES-GCM" as const,
  };
});
```

### Pattern: Decryption with Base64 Decoding + Error Handling

Decode base64 payloads before decryption, handling `Either` results:

```typescript
import * as Encoding from "effect/Encoding";
import * as Effect from "effect/Effect";

// From packages/shared/domain/src/services/EncryptionService/EncryptionService.ts
const decrypt = Effect.fn(function* (payload, key) {
  // Decode from Base64 - returns Either<Uint8Array, DecodeException>
  const ivResult = Encoding.decodeBase64(payload.iv);
  const ciphertextResult = Encoding.decodeBase64(payload.ciphertext);

  // Handle decode failures
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

  // Extract Uint8Array from Right
  const iv = ivResult.right;
  const ciphertext = ciphertextResult.right;

  // Proceed with decryption...
  const plaintext = yield* Effect.tryPromise({
    try: () => crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext),
    catch: (cause) => new DecryptionError({ /* ... */ }),
  });

  return new Uint8Array(plaintext);
});
```

### Pattern: Hex Encoding for Hashing Outputs

Use hex encoding for hash digests (SHA-256, HMAC):

```typescript
import * as Encoding from "effect/Encoding";
import * as Effect from "effect/Effect";

// From packages/shared/domain/src/services/EncryptionService/EncryptionService.ts
const computeHash = Effect.gen(function* () {
  const data = new TextEncoder().encode("sensitive data");

  const hashBuffer = yield* Effect.tryPromise({
    try: () => crypto.subtle.digest("SHA-256", data),
    catch: (cause) => new HashingError({ /* ... */ }),
  });

  // Encode hash as hex string for display/storage
  return Encoding.encodeHex(new Uint8Array(hashBuffer));
  // Result: "a3f12..." (64-character hex string)
});
```

### Pattern: Base64Url for URL-Safe Tokens

Use base64url encoding for tokens embedded in URLs (no padding, URL-safe characters):

```typescript
import * as Encoding from "effect/Encoding";

// From packages/shared/integrations/src/google/gmail/models/email.ts
const buildRawEmailMessage = (email: EmailMessage) => {
  const emailString = buildEmailString(email);

  // Base64url encoding for Gmail API (URL-safe, no padding)
  return Encoding.encodeBase64Url(emailString);
  // Standard base64: "ABC+/=="
  // Base64url:       "ABC-_"  (no padding, - instead of +, _ instead of /)
};
```

### Pattern: PostgreSQL Bytea Column Encoding

When storing binary data in PostgreSQL bytea columns, use base64 for wire format:

```typescript
import * as Encoding from "effect/Encoding";

// From packages/shared/tables/src/columns/bytea.ts
export const bytea = <TName extends string>(name: TName) =>
  pg.text(name).mapWith({
    // Decode from base64 string to Uint8Array
    mapFromDriverValue: (value: string) => {
      const decoded = Encoding.decodeBase64(value);
      if (decoded._tag === "Left") {
        throw new Error(`Failed to decode base64 bytea: ${decoded.left.message}`);
      }
      return decoded.right;
    },
    // Encode Uint8Array to base64 string for storage
    mapToDriverValue: (value: Uint8Array | ArrayBuffer) =>
      Encoding.encodeBase64(new Uint8Array(value)),
  });
```

### Pattern: Schema Integration with Base64

Integrate `Encoding` with Effect Schema for automatic encoding/decoding:

```typescript
import * as S from "effect/Schema";
import * as Encoding from "effect/Encoding";

// From .repos/effect/packages/effect/src/Schema.ts
const Base64Schema = S.transformOrFail(
  S.String,
  S.Uint8Array,
  {
    strict: true,
    decode: (str, _, ast) =>
      Encoding.decodeBase64(str).pipe(
        Either.mapLeft((error) =>
          new ParseResult.Type(ast, str, error.message)
        )
      ),
    encode: (bytes) =>
      Either.right(Encoding.encodeBase64(bytes)),
  }
);

// Usage in domain models
class EncryptedData extends S.Class<EncryptedData>("EncryptedData")({
  iv: Base64Schema,        // Stored as base64, decoded to Uint8Array
  ciphertext: Base64Schema,
}) {}
```

## Anti-Patterns

### NEVER: Ignore Either Results from Decode Functions

All decode functions (`decodeBase64`, `decodeHex`, `decodeUriComponent`) return `Either<T, Exception>`, not `T`:

```typescript
// FORBIDDEN - Assumes decode always succeeds
const bytes = Encoding.decodeBase64(payload.data);
crypto.subtle.decrypt(key, bytes, ...);  // Type error! bytes is Either, not Uint8Array

// CORRECT - Handle Either with pattern matching
const bytesResult = Encoding.decodeBase64(payload.data);
if (bytesResult._tag === "Left") {
  return yield* new DecodeError({ cause: bytesResult.left });
}
const bytes = bytesResult.right;
```

### NEVER: Use Native Base64 Encoding (atob/btoa)

Effect's `Encoding` module provides cross-platform base64 support that works in Node, Bun, and browsers:

```typescript
// FORBIDDEN - Platform-specific, only works in browsers
const encoded = btoa(String.fromCharCode(...bytes));
const decoded = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));

// CORRECT - Cross-platform Effect encoding
const encoded = Encoding.encodeBase64(bytes);
const decoded = Encoding.decodeBase64(encoded);
```

### NEVER: Mix Base64 and Base64Url Encodings

Base64 and Base64url are incompatible formats—do not mix them:

```typescript
// FORBIDDEN - Encoding with base64, decoding with base64url
const token = Encoding.encodeBase64(data);
const decoded = Encoding.decodeBase64Url(token);  // FAILS!

// CORRECT - Match encoding/decoding formats
const token = Encoding.encodeBase64Url(data);
const decoded = Encoding.decodeBase64Url(token);
```

### NEVER: Hex Decode Without Validation

Hex strings must have even length and contain only `[0-9a-fA-F]` characters:

```typescript
// FORBIDDEN - No validation before decoding
const bytes = Encoding.decodeHex(userInput);
// Odd-length or invalid chars cause cryptic errors

// CORRECT - Validate hex format first
const hexResult = Encoding.decodeHex(userInput);
if (hexResult._tag === "Left") {
  return yield* new ValidationError({
    message: "Invalid hex string format",
    cause: hexResult.left,
  });
}
const bytes = hexResult.right;
```

### NEVER: URI Component Encoding for Full URLs

`encodeUriComponent` is for single path/query components, not full URLs:

```typescript
// FORBIDDEN - Destroys URL structure
const url = "https://example.com/path?query=value";
const encoded = Encoding.encodeUriComponent(url);
// Result: "https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue" (useless)

// CORRECT - Encode only the component
const query = Encoding.encodeUriComponent("value with spaces");
const url = `https://example.com/path?query=${query}`;
```

## Related Modules

- [Schema](../effect/Schema.md) — Use `S.transformOrFail` with Encoding for schema-integrated encoding
- [Either](../effect/Either.md) — Decode functions return `Either<T, Exception>`

## Source Reference

[.repos/effect/packages/effect/src/Encoding.ts](../../.repos/effect/packages/effect/src/Encoding.ts)

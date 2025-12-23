# HMAC-SHA256 Upload Signing System Design

**Document Version:** 2.0
**Last Updated:** 2025-12-22
**Status:** Implementation Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Architecture Overview](#architecture-overview)
4. [Core Patterns & Implementation](#core-patterns--implementation)
5. [Security Considerations](#security-considerations)
6. [Database Schema](#database-schema)
7. [Environment Configuration](#environment-configuration)
8. [Trade-offs & Performance](#trade-offs--performance)
9. [Implementation Checklist](#implementation-checklist)
10. [References](#references)

---

## Executive Summary

This document specifies the implementation of HMAC-SHA256 signing and verification for the beep-effect S3 presigned URL upload system. The design leverages existing `EncryptionService` infrastructure and Effect Schema patterns to create a secure, type-safe upload workflow.

### Key Design Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Signing Algorithm** | HMAC-SHA256 | Already implemented in `EncryptionService`, industry standard |
| **Schema Pattern** | `S.transformOrFail` with service dependencies | Type-safe, composable, Effect-native validation |
| **Storage Strategy** | Database (`upload_sessions` table) | Audit trail, async verification, S3 event support |
| **File Integrity** | MD5 content hash | S3-compatible, existing `@beep/utils/md5` infrastructure |
| **Secret Management** | `Redacted.Redacted<string>` from Config | Prevents leakage in logs/errors/telemetry |

### Implementation Scope

- **Phase 1:** Core signing schemas (`SignedPayload`, `FileSignature`)
- **Phase 2:** Upload service integration with signature generation/verification
- **Phase 3:** Database persistence for upload sessions
- **Phase 4:** RPC contract updates and handler integration
- **Phase 5:** Comprehensive testing (unit, integration, security)

---

## Problem Statement

### Current Security Gaps

The existing S3 upload flow has several vulnerabilities:

1. **No Metadata Integrity** - Clients can modify file metadata (size, MIME type, filename) after receiving presigned URLs
2. **No Upload Attribution** - No cryptographic link between upload initiation and completion
3. **No Expiration Enforcement** - Presigned URLs expire, but metadata doesn't (race conditions possible)
4. **No Content Verification** - File content isn't validated against declared metadata (size mismatch, content-type spoofing)

### Security Requirements

- **Integrity:** Cryptographically sign upload metadata when generating presigned URLs
- **Authenticity:** Verify signatures on upload completion (client callback or S3 event)
- **Consistency:** Validate file content hash matches declared metadata
- **Auditability:** Store upload sessions for forensics and debugging
- **Integration:** Seamlessly integrate with Effect Schema and existing services

---

## Architecture Overview

### Upload Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UPLOAD INITIATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Client                          Server                                      │
│  ┌──────────────┐               ┌─────────────────────────────────────────┐ │
│  │ File Input   │               │ initiate-upload RPC Handler             │ │
│  │              │               │ (packages/shared/server/src/rpc/v1/     │ │
│  │              │               │  files/initiate-upload.ts)              │ │
│  │ ┌──────────┐ │   payload     │ ┌─────────────────────────────────────┐ │ │
│  │ │ Normalize│─┼──────────────▶│ │ 1. Validate payload                 │ │ │
│  │ │ + Hash   │ │   (metadata,  │ │ 2. Generate fileKey (SQIds)         │ │ │
│  │ │ content  │ │    orgId)     │ │ 3. Sign metadata (HMAC-SHA256)      │ │ │
│  │ └──────────┘ │               │ │ 4. Store upload_session (DB)        │ │ │
│  │      │       │               │ │ 5. Generate presigned URL (S3)      │ │ │
│  │      ▼       │               │ └─────────────────────────────────────┘ │ │
│  │ md5Hash      │               │                  │                       │ │
│  │ (computed)   │               └──────────────────┼───────────────────────┘ │
│  └──────────────┘                                  │                          │
│                                                    ▼                          │
│                                 ┌─────────────────────────────────────────┐  │
│                                 │ Response: {                             │  │
│                                 │   presignedUrl: BS.URLString.Type,      │  │
│                                 │   signature: "hmac-sha256=<hex>",       │  │
│                                 │   expiresAt: DateTime.Utc,              │  │
│                                 │   fileKey: string                       │  │
│                                 │ }                                       │  │
│                                 └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       UPLOAD COMPLETION & VERIFICATION                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Client                          Server                                      │
│  ┌──────────────┐               ┌─────────────────────────────────────────┐ │
│  │ 1. PUT to S3 │               │ complete-upload RPC Handler             │ │
│  │ presignedUrl │               │ (NEW - to be created)                   │ │
│  │              │               │                                         │ │
│  │ 2. Callback  │   {fileKey,   │ ┌─────────────────────────────────────┐ │ │
│  │ to server    │    signature} │ │ 1. Retrieve upload_session by key   │ │ │
│  │              │──────────────▶│ │ 2. Check expiration (expiresAt)     │ │ │
│  └──────────────┘               │ │ 3. Verify HMAC signature            │ │ │
│                                 │ │ 4. Verify S3 object exists (HEAD)   │ │ │
│                                 │ │ 5. Validate file size matches       │ │ │
│                                 │ │ 6. Create file record in DB         │ │ │
│                                 │ │ 7. Delete upload_session (cleanup)  │ │ │
│                                 │ └─────────────────────────────────────┘ │ │
│                                 │                  │                       │ │
│                                 │                  ▼                       │ │
│                                 │   ┌─────────────────────────────────┐   │ │
│                                 │   │ Success: { fileId, status }     │   │ │
│                                 │   └─────────────────────────────────┘   │ │
│                                 └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **SignedPayload Schema** | `packages/shared/domain/src/services/EncryptionService/schemas.ts` | Generic signing/verification schema factory |
| **FileSignature Schema** | `packages/common/schema/src/integrations/files/SignedFile.ts` | File content hash + signature metadata |
| **Upload Service** | `packages/shared/server/src/services/Upload.service.ts` | Signature generation, session storage, verification |
| **EncryptionService** | `packages/shared/domain/src/services/EncryptionService/` | HMAC-SHA256 primitives (already implemented) |
| **MD5 Hasher** | `packages/common/utils/src/md5/` | File content hashing (already implemented) |
| **RPC Handlers** | `packages/shared/server/src/rpc/v1/files/` | Initiate/complete upload endpoints |
| **Upload Sessions Table** | `packages/shared/tables/src/upload-sessions.table.ts` | Database persistence for verification |

---

## Core Patterns & Implementation

### 1. SignedPayload Schema Factory

**Purpose:** Generic schema for signing any payload with HMAC-SHA256, providing bidirectional encode/decode transformations.

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/services/EncryptionService/schemas.ts`

```typescript
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { EncryptionService as EncryptionServiceTag } from "./EncryptionService";

/**
 * Signed payload structure containing original data + signature + timestamp
 *
 * @since 1.0.0
 * @category Schemas
 */
export const SignedPayloadStruct = <T extends S.Schema.Any>(payloadSchema: T) =>
  S.Struct({
    payload: payloadSchema,
    signature: S.String.annotations({
      description: "HMAC-SHA256 signature (hmac-sha256=<hex>)",
      pattern: /^hmac-sha256=[a-f0-9]{64}$/
    }),
    signedAt: S.DateTimeUtc,
  });

export type SignedPayload<T> = {
  readonly payload: T;
  readonly signature: string;
  readonly signedAt: DateTime.Utc;
};

/**
 * Creates a bidirectional schema that:
 * - decode: Signs payload → SignedPayload
 * - encode: Verifies signature → original payload (throws on invalid signature)
 *
 * @example
 * ```typescript
 * import * as Redacted from "effect/Redacted";
 * import * as S from "effect/Schema";
 *
 * const SignedMetadata = SignedPayload(
 *   S.Struct({
 *     fileId: S.String,
 *     size: S.Number,
 *     mimeType: S.String,
 *   }),
 *   Redacted.make("your-secret-key")
 * );
 *
 * // Sign
 * const signed = yield* S.decode(SignedMetadata)(metadata);
 * // => { payload: {...}, signature: "hmac-sha256=...", signedAt: DateTime.Utc }
 *
 * // Verify
 * const verified = yield* S.encode(SignedMetadata)(signed);
 * // => {...} (original metadata if signature valid, error otherwise)
 * ```
 *
 * @param payloadSchema - Schema for the payload to sign
 * @param secret - Redacted secret for HMAC signing
 * @returns Schema that signs on decode, verifies on encode
 */
export const SignedPayload = <A, I, R>(
  payloadSchema: S.Schema<A, I, R>,
  secret: Redacted.Redacted<string>
): S.Schema<SignedPayload<A>, A, EncryptionServiceTag | R> => {
  const { EncryptionService } = require("./EncryptionService") as {
    EncryptionService: typeof EncryptionServiceTag;
  };

  const SignedStruct = SignedPayloadStruct(payloadSchema);

  return S.transformOrFail(payloadSchema, SignedStruct, {
    strict: true,

    // decode: payload → SignedPayload (signing)
    decode: (payload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        const payloadString = JSON.stringify(payload);
        const signature = yield* service.signPayload(payloadString, secret);
        const signedAt = yield* DateTime.now;
        return { payload, signature, signedAt };
      }).pipe(
        Effect.mapError((e) =>
          new ParseResult.Type(ast, payload, e instanceof Error ? e.message : "Signing failed")
        )
      ),

    // encode: SignedPayload → payload (verification)
    encode: (signedPayload, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        const payloadString = JSON.stringify(signedPayload.payload);
        const isValid = yield* service.verifySignature(
          payloadString,
          signedPayload.signature,
          secret
        );

        if (!isValid) {
          return yield* Effect.fail(
            new ParseResult.Type(ast, signedPayload, "Invalid signature")
          );
        }
        return signedPayload.payload;
      }).pipe(
        Effect.mapError((e) =>
          e instanceof ParseResult.Type
            ? e
            : new ParseResult.Type(ast, signedPayload, "Verification failed")
        )
      ),
  });
};
```

**Key Features:**
- **Bidirectional:** `decode` signs, `encode` verifies (inverted semantics for security)
- **Type-safe:** Preserves payload schema types through transformation
- **Service-injected:** Requires `EncryptionService` from Effect context
- **Immutable:** Uses `DateTime.Utc` for timestamp (no native Date)

---

### 2. Upload Service Extension

**Purpose:** Integrate signature generation/verification into the upload workflow.

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/src/services/Upload.service.ts`

**Changes Required:**

1. **Add EncryptionService dependency**
2. **Implement signature generation in `initiateUpload`**
3. **Create `verifyUploadSignature` method**
4. **Add session storage helpers**

```typescript
import { EncryptionService } from "@beep/shared-domain/services";
import * as Duration from "effect/Duration";
import * as Redacted from "effect/Redacted";
import * as DateTime from "effect/DateTime";

// Update service effect dependencies
type UploadServiceEffect = Effect.Effect<
  {
    readonly initiateUpload: GetPreSignedUrl;
    readonly deleteObject: DeleteObject;
    readonly verifyUploadSignature: VerifyUploadSignature; // NEW
  },
  never,
  S3Service | EncryptionService  // Added EncryptionService
>;

const serviceEffect: UploadServiceEffect = Effect.gen(function* () {
  const s3 = yield* S3Service;
  const encryption = yield* EncryptionService;  // NEW
  const Bucket = yield* Config.nonEmptyString("CLOUD_AWS_S3_BUCKET_NAME");
  const signingSecret = yield* Config.redacted("UPLOAD_SIGNING_SECRET");  // NEW

  const initiateUpload = Effect.fn("UploadService.initiateUpload")(function* ({
    organization,
    ...payload
  }) {
    const env = yield* S.Config("APP_ENV", EnvValue);
    const fileId = SharedEntityIds.FileId.create();

    // Generate S3 key
    const Key = yield* S.decode(File.UploadKey)({
      env,
      fileId,
      organizationType: organization.type,
      organizationId: organization.id,
      entityKind: payload.entityKind,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
      extension: payload.metadata.extension,
    });

    // Generate presigned URL
    const presignedUrl = yield* s3.putObject(
      { Bucket, Key, ContentType: payload.mimeType },
      { presigned: true }
    );

    // NEW: Generate signature for upload metadata
    const ttl = Duration.minutes(15);
    const expiresAt = yield* Effect.map(DateTime.now, (now) =>
      DateTime.add(now, { minutes: 15 })
    );

    const metadataPayload = {
      fileKey: Key,
      organizationId: organization.id,
      entityKind: payload.entityKind,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
      fileSize: payload.metadata.size,
      mimeType: payload.mimeType,
      expiresAt: DateTime.formatIso(expiresAt),
    };

    const metadataString = JSON.stringify(metadataPayload);
    const signature = yield* encryption.signPayload(metadataString, signingSecret);

    // Store upload session for verification
    yield* storeUploadSession({
      fileKey: Key,
      signature,
      metadata: metadataString,
      expiresAt,
      organizationId: organization.id,
    });

    return {
      presignedUrl: BS.URLString.make(presignedUrl),
      signature,
      expiresAt: DateTime.formatIso(expiresAt),
      fileKey: Key,
    };
  });

  // NEW: Verify upload signature
  const verifyUploadSignature = Effect.fn("UploadService.verifyUploadSignature")(
    function* (params: { fileKey: string; signature: string }) {
      const session = yield* getUploadSession(params.fileKey);

      if (!session) {
        return yield* Effect.fail(
          new InvalidSignatureError({ message: "Upload session not found" })
        );
      }

      const now = yield* DateTime.now;
      if (DateTime.greaterThan(now, session.expiresAt)) {
        return yield* Effect.fail(
          new SignatureExpiredError({ message: "Upload expired" })
        );
      }

      const isValid = yield* encryption.verifySignature(
        session.metadata,
        params.signature,
        signingSecret
      );

      if (!isValid) {
        return yield* Effect.fail(
          new InvalidSignatureError({ message: "Invalid signature" })
        );
      }

      return { verified: true, session };
    }
  );

  return { initiateUpload, deleteObject, verifyUploadSignature };
});

export class Service extends Effect.Service<Service>()($I`Service`, {
  effect: serviceEffect,
  accessors: true,
  dependencies: [S3Service.defaultLayer, EncryptionService.layer],  // Added EncryptionService
}) {}
```

**Session Storage Helpers (to be implemented):**

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as DateTime from "effect/DateTime";
import { Db } from "@beep/shared-server/services";
import type { DbError } from "@beep/shared-server/errors";
import { uploadSessionsTable } from "@beep/shared-tables";
import type { UploadSession } from "@beep/shared-tables";

// Helper: Store upload session
const storeUploadSession = (session: {
  fileKey: string;
  signature: string;
  metadata: string;
  expiresAt: DateTime.Utc;
  organizationId: string;
}): Effect.Effect<void, DbError, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;
    yield* db.insert(uploadSessionsTable, session);
  });

// Helper: Retrieve upload session
const getUploadSession = (
  fileKey: string
): Effect.Effect<UploadSession | null, DbError, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;
    const result = yield* db.select(uploadSessionsTable).where({ fileKey });
    return F.pipe(result, A.head, O.getOrNull);
  });

// Helper: Delete upload session (cleanup after verification)
const deleteUploadSession = (
  fileKey: string
): Effect.Effect<void, DbError, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;
    yield* db.delete(uploadSessionsTable).where({ fileKey });
  });
```

---

### 3. File Content Hash Signature

**Purpose:** Attach MD5 content hash to NormalizedFile for integrity verification.

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/files/SignedFile.ts` (NEW)

```typescript
import { hashBlob } from "@beep/utils/md5";
import { $SchemaId } from "@beep/identity/packages";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { NormalizedFile } from "./File";

const $I = $SchemaId.create("integrations/files/SignedFile");

/**
 * File signature with content hash for integrity verification
 *
 * @since 1.0.0
 * @category Schemas
 */
export class FileSignature extends S.Class<FileSignature>($I`FileSignature`)({
  contentHash: S.String.annotations({
    description: "MD5 hex digest of file contents",
    pattern: /^[a-f0-9]{32}$/i,
  }),
  signedAt: S.DateTimeUtc,
  uploadToken: S.OptionFromSelf(S.String),
}) {}

/**
 * Generic factory to attach file signatures to any schema with a `file` field
 *
 * @since 1.0.0
 * @category Factories
 *
 * @example
 * ```typescript
 * import * as F from "effect/Function";
 * import * as S from "effect/Schema";
 *
 * const SignedNormalizedFile = F.pipe(NormalizedFile, withFileSignature);
 * const signed = yield* S.decode(SignedNormalizedFile)(file);
 * // => NormalizedFile with `signature` field containing MD5 hash
 * ```
 */
export const withFileSignature = <A extends { file: File }, I, R>(
  schema: S.Schema<A, I, R>
): S.Schema<A & { signature: typeof FileSignature.Type }, I, R> =>
  S.attachPropertySignature(schema, "signature", FileSignature, {
    decode: (data) =>
      Effect.gen(function* () {
        const contentHash = yield* hashBlob(data.file).pipe(
          Effect.mapError((error) =>
            new ParseResult.Type(
              schema.ast,
              data,
              `Hash failed: ${error.message}`
            )
          )
        );
        return FileSignature.make({
          contentHash,
          signedAt: DateTime.unsafeNow(),
          uploadToken: O.none(),
        });
      }),
    encode: (data) => Effect.succeed(data),
  });

/**
 * NormalizedFile with attached content hash signature
 *
 * @since 1.0.0
 * @category Schemas
 */
export const SignedNormalizedFile = F.pipe(NormalizedFile, withFileSignature);

export declare namespace SignedNormalizedFile {
  export type Type = typeof SignedNormalizedFile.Type;
  export type Encoded = typeof SignedNormalizedFile.Encoded;
}

/**
 * Error thrown when file integrity check fails
 *
 * @since 1.0.0
 * @category Errors
 */
export class FileIntegrityError extends S.TaggedError<FileIntegrityError>()(
  "FileIntegrityError",
  {
    message: S.String,
    expected: S.String,
    actual: S.String,
  }
) {}
```

**Note:** The existing `NormalizedFile` schema already has an `md5Hash` field (initialized as `O.none()`). This pattern provides a separate, composable approach that can be applied to any file-containing schema.

---

### 4. Tagged Error Schemas

**Purpose:** Define typed errors for signature/verification failures.

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/services/EncryptionService/errors.ts` (extend existing)

```typescript
import * as S from "effect/Schema";
import * as DateTime from "effect/DateTime";

/**
 * Error thrown when signature verification fails
 *
 * @since 1.0.0
 * @category Errors
 */
export class InvalidSignatureError extends S.TaggedError<InvalidSignatureError>()(
  "InvalidSignatureError",
  {
    message: S.String,
  }
) {}

/**
 * Error thrown when signed data has expired
 *
 * @since 1.0.0
 * @category Errors
 */
export class SignatureExpiredError extends S.TaggedError<SignatureExpiredError>()(
  "SignatureExpiredError",
  {
    message: S.String,
    expiresAt: S.DateTimeUtc,
  }
) {}
```

---

### 5. Error Handling Patterns

**Context Preservation:**

```typescript
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";

// Enhanced error context for cryptographic operations
Effect.mapError((e) => {
  if (e instanceof EncryptionError) {
    const context = [
      e.algorithm && `algorithm=${e.algorithm}`,
      e.phase && `phase=${e.phase}`,
    ].filter(Boolean).join(", ");

    return new ParseResult.Type(
      ast,
      input,
      context ? `${e.message} (${context})` : e.message
    );
  }
  return new ParseResult.Type(ast, input, "Operation failed");
});
```

**One-way Transformations:**

```typescript
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

// Use ParseResult.Forbidden for irreversible operations (hashing)
export const Sha256HashFromString = (): S.Schema<Sha256Hash, string, EncryptionService> =>
  S.transformOrFail(S.String, Sha256Hash, {
    decode: (input, _, ast) =>
      Effect.gen(function* () {
        const service = yield* EncryptionService;
        return yield* service.sha256(input);
      }).pipe(Effect.mapError(() => new ParseResult.Type(ast, input, "Hash failed"))),

    // Cannot reverse a hash
    encode: (hash, _, ast) =>
      ParseResult.fail(new ParseResult.Forbidden(ast, hash, "Cannot reverse SHA-256 hash")),
  });
```

---

## Security Considerations

### 1. Timing-Safe Verification

The existing `EncryptionService.verifySignature` uses `crypto.subtle.verify`, which performs constant-time comparison:

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Redacted from "effect/Redacted";
import * as Encoding from "effect/Encoding";

// From EncryptionService.ts (already implemented)
verifySignature: (payload, signature, secret) =>
  Effect.gen(function* () {
    const sigOpt = F.pipe(
      signature,
      O.fromNullable,
      O.map(Str.slice(HMAC_SIGNATURE_PREFIX.length))
    );

    if (O.isNone(sigOpt)) return false;

    const sig = sigOpt.value;
    const secretBytes = hmacEncoder.encode(Redacted.value(secret));
    const signingKey = yield* Effect.promise(() =>
      crypto.subtle.importKey("raw", secretBytes, HMAC_ALGORITHM, false, ["verify"])
    );

    const sigBytes = yield* Encoding.decodeHex(sig);
    const payloadBytes = hmacEncoder.encode(payload);

    // crypto.subtle.verify performs constant-time comparison
    return yield* Effect.promise(() =>
      crypto.subtle.verify(HMAC_ALGORITHM, signingKey, new Uint8Array(sigBytes), payloadBytes)
    );
  }).pipe(Effect.orElseSucceed(() => false)),
```

**Why This Matters:** Prevents timing attacks where attackers measure response times to deduce signature validity.

---

### 2. Error Message Safety

**Safe to Expose:**

| Operation | Safe Message | Reason |
|-----------|-------------|--------|
| Signature verification | "Invalid signature" | Generic, no hints |
| Expiration check | "Token expired" | Expected failure mode |
| Algorithm name | "HMAC-SHA256" | Public information |

**NEVER Expose:**

| Data | Why Dangerous |
|------|---------------|
| Expected vs actual signature | Enables forgery attacks |
| Secret key material | Complete compromise |
| Internal error details | Information leakage |
| Payload content in errors | May contain sensitive data |

**Example:**

```typescript
import * as Effect from "effect/Effect";

// ✅ GOOD
if (!isValid) {
  return yield* Effect.fail(
    new InvalidSignatureError({ message: "Invalid signature" })
  );
}

// ❌ BAD - NEVER DO THIS
if (!isValid) {
  return yield* Effect.fail(
    new InvalidSignatureError({
      message: `Expected ${expectedSig}, got ${actualSig}` // NEVER DO THIS
    })
  );
}
```

---

### 3. Secret Management

**Always Use Redacted:**

```typescript
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

// ✅ GOOD - Prevents accidental logging
const signingSecret = yield* Config.redacted("UPLOAD_SIGNING_SECRET");

// Redacted values are automatically scrubbed from logs
Effect.logInfo("Signing payload").pipe(
  Effect.annotateLogs("payloadSize", payload.length)
  // Secret is NEVER logged, even if passed as annotation
);
```

**Generate Strong Secrets:**

```bash
# Generate 256-bit (32-byte) random key
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Store Securely:**

```bash
# .env (never commit!)
UPLOAD_SIGNING_SECRET=<base64-encoded-key>
UPLOAD_TOKEN_SECRET=<different-base64-key>

# Use different secrets for signing and tokens (defense in depth)
```

---

### 4. Expiration Enforcement

**Always Check Expiration:**

```typescript
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";

// ✅ GOOD - Check expiration BEFORE signature verification
const now = yield* DateTime.now;
if (DateTime.greaterThan(now, tokenData.expiresAt)) {
  return yield* Effect.fail(
    new SignatureExpiredError({
      message: "Token expired",
      expiresAt: tokenData.expiresAt,
    })
  );
}

// Then verify signature
const isValid = yield* encryption.verifySignature(payload, signature, secret);
```

**Why This Order?** Fail fast on expired tokens (cheaper check) before cryptographic operations.

---

### 5. Replay Attack Prevention

**Session-based storage prevents replay attacks:**

1. Client receives signature for upload
2. Server stores session in database with `fileKey` as primary key
3. On completion, server verifies signature and **deletes session**
4. Subsequent attempts with same signature fail (session not found)

**Implementation:**

```typescript
import * as Effect from "effect/Effect";

// After successful verification
yield* deleteUploadSession(params.fileKey);

// Future attempts with same signature
const session = yield* getUploadSession(params.fileKey);
if (!session) {
  return yield* Effect.fail(
    new InvalidSignatureError({ message: "Upload session not found" })
  );
}
```

---

## Database Schema

### Upload Sessions Table

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/tables/src/upload-sessions.table.ts` (NEW)

```typescript
import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

/**
 * Temporary storage for upload sessions awaiting completion
 *
 * @remarks
 * - Primary key: fileKey (unique S3 object key)
 * - TTL: Records expire after 15 minutes (cleanup job required)
 * - Cleanup: DELETE WHERE expiresAt < NOW()
 */
export const uploadSessionsTable = pgTable(
  "upload_sessions",
  {
    /** S3 object key (unique identifier) */
    fileKey: text("file_key").primaryKey(),

    /** HMAC-SHA256 signature (hmac-sha256=<hex>) */
    signature: text("signature").notNull(),

    /** Signed metadata payload (JSON string) */
    metadata: jsonb("metadata").notNull().$type<{
      fileKey: string;
      organizationId: string;
      entityKind: string;
      entityIdentifier: string;
      entityAttribute: string;
      fileSize: number;
      mimeType: string;
      expiresAt: string;
    }>(),

    /** Expiration timestamp (15 minutes from creation) */
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    /** Creation timestamp */
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    /** Organization ID (for multi-tenancy) */
    organizationId: text("organization_id").notNull(),
  },
  (table) => ({
    // Index for efficient cleanup queries
    expiresAtIdx: index("upload_sessions_expires_at_idx").on(table.expiresAt),

    // Index for organization queries
    organizationIdx: index("upload_sessions_organization_id_idx").on(table.organizationId),
  })
);

export type UploadSession = typeof uploadSessionsTable.$inferSelect;
export type UploadSessionInsert = typeof uploadSessionsTable.$inferInsert;
```

### Migration

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/_internal/db-admin/migrations/<timestamp>_add_upload_sessions.sql`

```sql
-- Create upload_sessions table
CREATE TABLE upload_sessions (
  file_key TEXT PRIMARY KEY,
  signature TEXT NOT NULL,
  metadata JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  organization_id TEXT NOT NULL
);

-- Index for cleanup queries (find expired sessions)
CREATE INDEX upload_sessions_expires_at_idx ON upload_sessions(expires_at);

-- Index for organization filtering
CREATE INDEX upload_sessions_organization_id_idx ON upload_sessions(organization_id);

-- Add comment
COMMENT ON TABLE upload_sessions IS 'Temporary storage for upload sessions awaiting verification';
```

### Cleanup Job

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/src/jobs/cleanup-upload-sessions.ts` (NEW)

```typescript
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as DateTime from "effect/DateTime";
import { sql } from "drizzle-orm";
import { Db } from "@beep/shared-server/services";
import { uploadSessionsTable } from "@beep/shared-tables";

/**
 * Cleanup expired upload sessions
 * Runs every 5 minutes, deletes sessions where expiresAt < NOW()
 */
export const cleanupUploadSessions = Effect.gen(function* () {
  const db = yield* Db;
  const now = yield* DateTime.now;

  const result = yield* db
    .delete(uploadSessionsTable)
    .where(sql`${uploadSessionsTable.expiresAt} < ${DateTime.formatIso(now)}`)
    .returning();

  yield* Effect.logInfo(`Cleaned up ${result.length} expired upload sessions`);
});

/**
 * Schedule: Run every 5 minutes
 */
export const cleanupSchedule = Schedule.fixed("5 minutes");

/**
 * Long-running cleanup effect
 */
export const cleanupService = cleanupUploadSessions.pipe(
  Effect.repeat(cleanupSchedule),
  Effect.provide(Db.layer)
);
```

---

## Environment Configuration

### Required Variables

```bash
# UPLOAD_SIGNING_SECRET
# - Purpose: Sign/verify upload metadata
# - Strength: 256-bit (32 bytes minimum)
# - Rotation: Every 90 days recommended
UPLOAD_SIGNING_SECRET=<base64-encoded-key>

# UPLOAD_TOKEN_SECRET (if implementing signed tokens)
# - Purpose: Sign/verify upload tokens
# - Strength: 256-bit (32 bytes minimum)
# - Different from UPLOAD_SIGNING_SECRET (defense in depth)
UPLOAD_TOKEN_SECRET=<different-base64-key>

# Existing (already configured)
CLOUD_AWS_S3_BUCKET_NAME=your-bucket
```

### Configuration Schema

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/src/config/upload.ts` (extend existing)

```typescript
import * as Config from "effect/Config";
import * as Redacted from "effect/Redacted";

export const UploadConfig = Config.all({
  signingSecret: Config.redacted("UPLOAD_SIGNING_SECRET"),
  tokenSecret: Config.redacted("UPLOAD_TOKEN_SECRET"),
  bucket: Config.nonEmptyString("CLOUD_AWS_S3_BUCKET_NAME"),
});

export type UploadConfig = Config.Config.Success<typeof UploadConfig>;
```

### Secret Rotation Strategy

1. **Generate new secret** (keep old secret)
2. **Update environment** with both secrets (comma-separated)
3. **Update verification** to try both secrets
4. **Wait grace period** (2x TTL = 30 minutes)
5. **Remove old secret** from environment
6. **Update signing** to use new secret only

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";

// Multi-secret verification (during rotation)
const secrets = [currentSecret, previousSecret];

for (const secret of secrets) {
  const isValid = yield* encryption.verifySignature(payload, signature, secret);
  if (isValid) return { verified: true, session };
}

return yield* Effect.fail(new InvalidSignatureError({ message: "Invalid signature" }));
```

---

## Trade-offs & Performance

### Approach Comparison

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Database Storage** | Audit trail, async verification, S3 events, replay protection | Extra table, cleanup needed | ✅ **Recommended** |
| **URL Encoding** | Stateless, simpler | No audit, limited to callbacks, vulnerable to replay | Fallback |
| **JWT Tokens** | Industry standard, self-contained | Extra dependency, not Effect-native, larger payloads | Avoid |
| **S3 Object Tags** | No extra storage | Race conditions, limited size (10 tags), eventual consistency | Avoid |

### Performance Benchmarks

| Operation | Typical Latency | Notes |
|-----------|-----------------|-------|
| HMAC-SHA256 sign | ~1-2ms | Web Crypto API |
| HMAC-SHA256 verify | ~1-2ms | Constant-time |
| MD5 hash (1MB file) | ~10ms | Streaming hash |
| MD5 hash (10MB file) | ~100ms | Streaming hash |
| Metadata extraction | ~200ms | EXIF + audio metadata |
| Database write (session) | ~5ms | Single row insert |
| Database read (session) | ~2ms | Primary key lookup |
| **Total overhead (10MB file)** | **~320ms** | Acceptable for UX |

### Storage Requirements

| Metric | Value | Calculation |
|--------|-------|-------------|
| Signature size | 79 bytes | `hmac-sha256=` (12) + hex (64) + null terminator |
| Metadata size | ~200 bytes | JSON payload |
| Session row size | ~350 bytes | Total per upload |
| Daily uploads | 10,000 | Example workload |
| Peak storage | ~3.5 MB | 10k sessions * 350 bytes |
| Cleanup frequency | 5 minutes | Negligible impact |

**Conclusion:** Storage overhead is minimal, performance impact is acceptable for improved security.

---

## Implementation Checklist

### Phase 1: Core Schemas

- [ ] **Create `SignedPayload` schema** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/services/EncryptionService/schemas.ts`
  - [ ] Implement `SignedPayloadStruct` helper
  - [ ] Implement `SignedPayload<T>` schema factory
  - [ ] Add JSDoc with usage examples
  - [ ] Export types (`SignedPayload<T>`)

- [ ] **Create `FileSignature` schema** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/files/SignedFile.ts`
  - [ ] Define `FileSignature` class schema
  - [ ] Implement `withFileSignature` factory
  - [ ] Create `SignedNormalizedFile` export
  - [ ] Add unit tests

- [ ] **Add tagged errors** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/services/EncryptionService/errors.ts`
  - [ ] `InvalidSignatureError` schema
  - [ ] `SignatureExpiredError` schema
  - [ ] `FileIntegrityError` schema (in SignedFile.ts)

---

### Phase 2: Upload Service

- [ ] **Update `Upload.Service`** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/src/services/Upload.service.ts`
  - [ ] Add `EncryptionService` to dependencies
  - [ ] Load `UPLOAD_SIGNING_SECRET` from config
  - [ ] Implement signature generation in `initiateUpload`
  - [ ] Implement `verifyUploadSignature` method
  - [ ] Update service type signatures
  - [ ] Update Layer dependencies

- [ ] **Create session storage helpers**
  - [ ] `storeUploadSession` function
  - [ ] `getUploadSession` function
  - [ ] `deleteUploadSession` function
  - [ ] Error handling for DB operations

---

### Phase 3: Database

- [ ] **Create `upload_sessions` table schema** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/tables/src/upload-sessions.table.ts`
  - [ ] Define table with Drizzle
  - [ ] Add indexes (expiresAt, organizationId)
  - [ ] Export types (`UploadSession`, `UploadSessionInsert`)

- [ ] **Generate migration** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/_internal/db-admin/migrations/`
  - [ ] Run `bun run db:generate`
  - [ ] Review generated SQL
  - [ ] Apply migration with `bun run db:migrate`
  - [ ] Verify schema in Drizzle Studio

- [ ] **Create cleanup job** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/src/jobs/cleanup-upload-sessions.ts`
  - [ ] Implement `cleanupUploadSessions` effect
  - [ ] Create `cleanupSchedule` (every 5 minutes)
  - [ ] Export `cleanupService` for runtime
  - [ ] Register in server startup

---

### Phase 4: RPC Contracts

- [ ] **Update `Files.InitiateUpload.Success`** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/rpc/v1/files/initiate-upload.ts`
  - [ ] Add `signature: S.String` field
  - [ ] Add `expiresAt: S.DateTimeUtc` field
  - [ ] Update JSDoc

- [ ] **Create `Files.CompleteUpload` contract** (NEW file)
  - [ ] Define payload schema (fileKey, signature)
  - [ ] Define success schema (fileId, status)
  - [ ] Define error unions
  - [ ] Export Contract

- [ ] **Update `initiate-upload` handler** in `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/src/rpc/v1/files/initiate-upload.ts`
  - [ ] Return signature and expiresAt in response
  - [ ] Test with client

- [ ] **Create `complete-upload` handler** (NEW file)
  - [ ] Implement verification logic
  - [ ] Call `Upload.Service.verifyUploadSignature`
  - [ ] Verify S3 object exists (HEAD request)
  - [ ] Create file record in DB
  - [ ] Delete upload session
  - [ ] Return success response

---

### Phase 5: Testing

- [ ] **Unit tests for `SignedPayload`**
  - [ ] Test signing (decode)
  - [ ] Test verification (encode)
  - [ ] Test invalid signature
  - [ ] Test expired signature

- [ ] **Unit tests for `withFileSignature`**
  - [ ] Test MD5 hash computation
  - [ ] Test signature attachment
  - [ ] Test error handling

- [ ] **Integration tests for upload flow**
  - [ ] Test full initiate → complete workflow
  - [ ] Test signature verification
  - [ ] Test expiration handling
  - [ ] Test replay attack prevention

- [ ] **Security tests**
  - [ ] Test timing-safe verification (no timing leaks)
  - [ ] Test secret exposure prevention (logs, errors)
  - [ ] Test signature forgery resistance
  - [ ] Test expired session handling

- [ ] **Performance tests**
  - [ ] Measure overhead for various file sizes
  - [ ] Verify cleanup job performance
  - [ ] Load test concurrent uploads

---

## References

### Effect Documentation

- [Schema Transformations](https://effect.website/docs/schema/transformations) - `S.transformOrFail` patterns
- [Managing Services](https://effect.website/docs/requirements-management/managing-services) - Service injection
- [DateTime](https://effect.website/docs/data-types/datetime) - Immutable timestamps
- [Redacted](https://effect.website/docs/data-types/redacted) - Secret management

### Codebase Files

- **EncryptionService:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/services/EncryptionService/EncryptionService.ts`
- **Upload Service:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/src/services/Upload.service.ts`
- **NormalizedFile:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/files/File.ts`
- **MD5 Utilities:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/utils/src/md5/` (md5.ts, md5-file-hasher.ts)
- **SharedEntityIds:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/entity-ids/shared`

### Security References

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [RFC 2104: HMAC](https://www.rfc-editor.org/rfc/rfc2104) - HMAC specification

### Related Design Documents

- **uploadthing Reference:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/uploadthing/packages/shared/src/crypto.ts` (inspiration for workflow)

---

## Appendix: Advanced Patterns (Optional)

### Signed Upload Token (Self-Contained)

**Use Case:** Stateless upload tokens that embed metadata + signature (no database lookup required).

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/entities/File/schemas/UploadToken.ts` (NEW, optional)

```typescript
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as ParseResult from "effect/ParseResult";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Config from "effect/Config";
import { EncryptionService } from "@beep/shared-domain/services";
import { SharedEntityIds } from "@beep/shared-domain";
import { MimeType } from "@beep/schema/integrations/files/mime-types";

/**
 * Token secret service
 */
export class TokenSecret extends Context.Tag("@beep/TokenSecret")<
  TokenSecret,
  Redacted.Redacted<string>
>() {
  static readonly fromConfig = Layer.effect(
    TokenSecret,
    Config.redacted("UPLOAD_TOKEN_SECRET").pipe(Effect.orDie)
  );
}

/**
 * Token data embedded in signed tokens
 */
export const UploadTokenData = S.Struct({
  fileId: SharedEntityIds.FileId,
  fileName: S.NonEmptyTrimmedString,
  fileSize: S.NonNegativeInt,
  mimeType: MimeType,
  organizationId: SharedEntityIds.OrganizationId,
  entityKind: S.String,
  entityIdentifier: S.String,
  entityAttribute: S.String,
  expiresAt: S.DateTimeUtc,
  appId: S.NonEmptyTrimmedString,
});

/**
 * URL-safe base64-encoded token
 */
export const SignedUploadTokenEncoded = S.String.pipe(
  S.pattern(/^[A-Za-z0-9_-]+$/),
  S.brand("SignedUploadTokenEncoded")
);

/**
 * Token validation error
 */
export class TokenValidationError extends S.TaggedError<TokenValidationError>()(
  "TokenValidationError",
  {
    message: S.String,
    reason: S.Literal("expired", "invalid-signature", "malformed"),
  }
) {}

/**
 * Bidirectional token transformation:
 * - decode: TokenData → SignedTokenEncoded (generate)
 * - encode: SignedTokenEncoded → TokenData (verify)
 */
export class SignedUploadToken extends S.transformOrFail(
  UploadTokenData,
  SignedUploadTokenEncoded,
  {
    strict: true,

    decode: (tokenData, _options, ast) =>
      Effect.gen(function* () {
        const encryption = yield* EncryptionService;
        const secret = yield* TokenSecret;

        const dataJson = JSON.stringify(yield* S.encode(UploadTokenData)(tokenData));
        const signature = yield* encryption.signPayload(dataJson, secret);

        const payload = JSON.stringify({ data: JSON.parse(dataJson), signature });
        const base64 = F.pipe(new TextEncoder().encode(payload), Encoding.encodeBase64Url);

        return yield* S.decode(SignedUploadTokenEncoded)(base64);
      }).pipe(
        Effect.mapError((e) => new ParseResult.Type(ast, tokenData, `Token generation failed: ${e}`))
      ),

    encode: (signedToken, _options, ast) =>
      Effect.gen(function* () {
        const encryption = yield* EncryptionService;
        const secret = yield* TokenSecret;
        const now = yield* DateTime.now;

        // Decode base64
        const payloadResult = Encoding.decodeBase64Url(signedToken);
        if (payloadResult._tag === "Left") {
          return yield* new TokenValidationError({ message: "Invalid format", reason: "malformed" });
        }

        // Parse JSON
        const payloadJson = new TextDecoder().decode(payloadResult.right);
        const payload = JSON.parse(payloadJson) as { data: unknown; signature: string };

        // Verify signature
        const dataJson = JSON.stringify(payload.data);
        const isValid = yield* encryption.verifySignature(dataJson, payload.signature, secret);

        if (!isValid) {
          return yield* new TokenValidationError({ message: "Invalid signature", reason: "invalid-signature" });
        }

        // Decode token data
        const tokenData = yield* S.decode(S.parseJson(UploadTokenData))(dataJson);

        // Check expiration
        if (DateTime.greaterThan(now, tokenData.expiresAt)) {
          return yield* new TokenValidationError({
            message: `Token expired at ${DateTime.formatIso(tokenData.expiresAt)}`,
            reason: "expired",
          });
        }

        return tokenData;
      }).pipe(
        Effect.catchTag("TokenValidationError", (e) =>
          Effect.fail(new ParseResult.Type(ast, signedToken, e.message))
        )
      ),
  }
) {}
```

**Trade-off:** Stateless (no database lookup) vs. larger payload size and no replay protection.

---

**End of Document**

# File & Upload Management Specification

This document provides a comprehensive specification for the file and upload management system in the beep-effect monorepo. It synthesizes patterns from the UploadThing architecture with the existing Effect-first implementation to create a unified, production-ready file handling pipeline.

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Core Principles](#core-principles)
- [Upload Pipeline Flow](#upload-pipeline-flow)
- [Domain Layer](#domain-layer)
- [Infrastructure Layer](#infrastructure-layer)
- [Client-Side Processing](#client-side-processing)
- [Cryptographic Security](#cryptographic-security)
- [Distributed Tracing](#distributed-tracing)
- [File Type Detection](#file-type-detection)
- [Metadata Extraction](#metadata-extraction)
- [Image Processing](#image-processing)
- [Observability](#observability)
- [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [Key Files Reference](#key-files-reference)

---

## Overview

The beep-effect file and upload management system implements a secure, resumable, type-safe file upload pipeline with the following characteristics:

| Feature              | Implementation                                            |
|----------------------|-----------------------------------------------------------|
| **Runtime**          | Effect 3 with `@effect/platform`                          |
| **Security**         | HMAC-SHA256 signed presigned URLs, AES-256-GCM encryption |
| **Resumability**     | HTTP Range headers for interrupted uploads                |
| **Tracing**          | W3C Trace Context (traceparent) and B3 headers            |
| **Streaming**        | JSONL for development callbacks                           |
| **Type Safety**      | Effect Schema validation end-to-end                       |
| **Storage**          | AWS S3 with deterministic sharding                        |
| **Validation**       | Magic byte signature detection, MIME type validation      |
| **Metadata**         | EXIF extraction, aspect ratio computation                 |
| **Image Conversion** | WebAssembly-based AVIF encoding via @jsquash              |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FILE UPLOAD PIPELINE                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────────┐      ┌─────────────────┐      ┌────────┐
│    CLIENT    │      │   YOUR SERVER    │      │   BEEP INFRA    │      │   S3   │
│  (Browser)   │      │   (API Route)    │      │   (Services)    │      │        │
└──────┬───────┘      └────────┬─────────┘      └────────┬────────┘      └───┬────┘
       │                       │                         │                   │
       │  1. Select Files      │                         │                   │
       │  ┌────────────────┐   │                         │                   │
       │  │ • Size check   │   │                         │                   │
       │  │ • Signature    │   │                         │                   │
       │  │   detection    │   │                         │                   │
       │  │ • MIME valid   │   │                         │                   │
       │  │ • EXIF extract │   │                         │                   │
       │  └────────────────┘   │                         │                   │
       │                       │                         │                   │
       │  2. Upload Request    │                         │                   │
       │  (files + metadata)   │                         │                   │
       │──────────────────────>│                         │                   │
       │                       │                         │                   │
       │                       │  3. Validate & Create   │                   │
       │                       │     File Model          │                   │
       │                       │  ┌─────────────────┐    │                   │
       │                       │  │ • Auth check    │    │                   │
       │                       │  │ • Generate ID   │    │                   │
       │                       │  │ • Compute shard │    │                   │
       │                       │  │ • Build path    │    │                   │
       │                       │  └─────────────────┘    │                   │
       │                       │                         │                   │
       │                       │  4. Request Presigned   │                   │
       │                       │     URL via Service     │                   │
       │                       │────────────────────────>│                   │
       │                       │                         │                   │
       │                       │                         │  5. Sign URL      │
       │                       │                         │────────────────────>
       │                       │                         │                   │
       │                       │  6. Return Signed URL   │                   │
       │                       │<────────────────────────│                   │
       │                       │                         │                   │
       │  7. Presigned URL     │                         │                   │
       │<──────────────────────│                         │                   │
       │                       │                         │                   │
       │  8. Direct Upload     │                         │                   │
       │  (PUT with Range)     │                         │                   │
       │─────────────────────────────────────────────────────────────────────>
       │                       │                         │                   │
       │  9. Upload Progress   │                         │                   │
       │  (XHR events)         │                         │                   │
       │  ┌────────────────┐   │                         │                   │
       │  │ loaded: 50%    │   │                         │                   │
       │  │ delta: 1024    │   │                         │                   │
       │  └────────────────┘   │                         │                   │
       │                       │                         │                   │
       │  10. Upload Complete  │                         │                   │
       │<─────────────────────────────────────────────────────────────────────
       │                       │                         │                   │
       │                       │  11. Callback           │                   │
       │                       │  (Webhook/Polling)      │                   │
       │                       │<────────────────────────│                   │
       │                       │                         │                   │
       │                       │  12. Insert File        │                   │
       │                       │      Record in DB       │                   │
       │                       │  ┌─────────────────┐    │                   │
       │                       │  │ • Process file  │    │                   │
       │                       │  │ • Store in DB   │    │                   │
       │                       │  │ • AI processing │    │                   │
       │                       │  │ • Return data   │    │                   │
       │                       │  └─────────────────┘    │                   │
       │                       │                         │                   │
       │  13. Server Data      │                         │                   │
       │<──────────────────────│                         │                   │
       │                       │                         │                   │
       ▼                       ▼                         ▼                   ▼
```

---

## Core Principles

### 1. Effect-First Development

All operations are modeled as `Effect<Success, Error, Requirements>`:

```typescript
// Every side effect is an Effect
const uploadFile: Effect<FileModel, UploadError, UploadService | S3Service> = ...

// Dependency injection via Layers
const UploadServiceLive = Layer.effect(UploadService, makeUploadService)

// No sneaky Promise or async/await in domain code
// Use Effect's built-in error handling, retries, and resource management
```

### 2. Bidirectional Schema Transformations

All file paths and metadata use bidirectional Effect Schema transformations:

```typescript
// Structured data ↔ S3 key string
class UploadPath extends S.transformOrFail(UploadPathDecoded, UploadPathEncoded, {
  decode: (structured) => generateS3Key(structured),  // Inject timestamp, shard
  encode: (s3Key) => parseS3Key(s3Key)                // Extract components
})

// Dimensions ↔ simplified ratio string
class AspectRatio extends S.transform({
  decode: ({ width, height }) => `${gcd(width, height)} / ${gcd}`,
  encode: (ratio) => parseDimensions(ratio)
})
```

### 3. Deterministic Operations

All routing and identification is deterministic and reproducible:

```typescript
// Same FileId always produces same shard
const shard = ShardPrefix.fromFileId(fileId)  // Hash-based, consistent

// Same file properties → same key (with custom hash parts)
const key = generateKey(file, appId, customHashParts)

// Filename is always `{fileId}.{extension}`
const filename = `${fileId}.${extension}` as const
```

### 4. Type-Safe Validation Pipeline

Every step validates against Effect Schema:

```typescript
// 1. Size validation
if (file.size > config.maxSizeBytes) yield* ValidationError

// 2. Signature detection (magic bytes)
const detected = fileTypeChecker.detectFile(chunk, { chunkSize: 64 })

// 3. MIME type schema validation
yield* S.decodeUnknown(MimeType)(detected?.mimeType)

// 4. Optional whitelist checking
if (!config.allowedMime.includes(candidate)) yield* ValidationError
```

---

## Upload Pipeline Flow

### Step 1-2: Client-Side File Processing

```typescript
// Client validates files before upload
const result = yield* UploadFileService.processFile({ file, config })

// Pipeline steps:
// 1. validateFile    - Size, signature, MIME
// 2. extractBasicMetadata - FileAttributes schema
// 3. extractExifMetadata  - EXIF for images (non-fatal)
```

### Step 3-4: Server Creates File Model

```typescript
// Server creates structured file model
const fileModel = yield* File.Model.create({
  file: nativeFileInstance,
  config: {
    env: "dev",
    bucketName: process.env.CLOUD_AWS_S3_BUCKET_NAME,
    organizationId,
    entityKind: "user",
    entityIdentifier: userId,
    entityAttribute: "avatar",
    organizationType: "individual",
    createdBy: userId,
  }
})

// Model creation:
// 1. Validates file via NativeFileInstance.validateFile()
// 2. Generates FileId with create()
// 3. Computes ShardPrefix from FileId (deterministic hash)
// 4. Constructs filename as `{fileId}.{extension}`
// 5. Encodes UploadPath (injects current timestamp)
// 6. Builds full HTTPS URL
```

### Step 5-7: Generate Presigned URL

```typescript
// Generate signed S3 URL
const presignedUrl = yield* UploadService.getPreSignedUrl(uploadParams)

// URL structure:
// https://{bucket}/{env}/tenants/{shard}/{orgType}/{orgId}/...
//   ?expires=1701532800000
//   &x-ut-identifier=app_xyz
//   &x-ut-file-name=photo.jpg
//   &signature=hmac-sha256=a1b2c3...
```

### Step 8-10: Direct Client Upload

```typescript
// Client uploads directly to S3 using presigned URL
// Uses XHR for progress tracking (fetch doesn't support upload progress)

const uploadWithProgress = (file, rangeStart, presigned, opts) =>
  Micro.async((resume) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", presigned.url, true)

    // Range header for resumable uploads
    xhr.setRequestHeader("Range", `bytes=${rangeStart}-`)

    // Progress tracking
    xhr.upload.addEventListener("progress", ({ loaded }) => {
      opts.onUploadProgress?.({
        loaded: rangeStart + loaded,
        delta: loaded - previousLoaded
      })
    })

    // Send only remaining portion for resume
    const formData = new FormData()
    formData.append("file", rangeStart > 0 ? file.slice(rangeStart) : file)
    xhr.send(formData)
  })
```

### Step 11-13: Server Callback & Persistence

```typescript
// After upload completes, persist file record
yield* UploadService.insertFile(fileModel.insert)

// Optional post-processing:
// - AI tagging/captioning (OpenAI CLIP)
// - Embedding generation for semantic search
// - Image optimization
// - Thumbnail generation
```

---

## Domain Layer

**Location:** `packages/shared/domain/src/entities/File/`

### File Model

The core file entity with comprehensive metadata:

```typescript
class Model extends M.Class<Model>("FileModel")(
  makeFields(SharedEntityIds.FileId, {
    // Ownership & Organization
    organizationId: SharedEntityIds.OrganizationId,
    organizationType: OrganizationType,  // individual, team, enterprise
    entityKind: EntityKind,               // user, team, organization
    entityIdentifier: AnyEntityId,
    entityAttribute: S.NonEmptyTrimmedString,  // avatar, logo, document

    // Storage
    key: UploadPath.to,           // S3 key (decoded)
    url: BS.URLString,            // Full HTTPS URL
    filename: Filename,           // {fileId}.{extension}
    originalFilename: OriginalFilename,
    environment: EnvValue,
    shardPrefix: ShardPrefix,     // 2-char hex for S3 distribution

    // File Properties
    extension: BS.FileExtension,
    mimeType: BS.MimeType,
    size: S.NonNegativeInt,
    sizeFormatted: S.String,
    fileType: FileType,           // image, video, audio, pdf, text, blob

    // Temporal
    uploadMonth: BS.MonthNumber,

    // Status
    status: FileStatus,           // PENDING, PROCESSING, FAILED, READY, DELETED
  })
) {
  static readonly create = Effect.fn("File.Model.create")(/* ... */)
}
```

### Upload Path Schema

Structured S3 path with bidirectional transformations:

```
Path Structure:
/{env}/tenants/{shard}/{orgType}/{orgId}/{entityKind}/{entityId}/{attribute}/{year}/{month}/{fileId}.{ext}

Example:
/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_789.jpg
```

**Components:**

| Component | Type | Description |
|-----------|------|-------------|
| `env` | EnvValue | dev, staging, prod |
| `shard` | ShardPrefix | 2-char hex for S3 load distribution |
| `orgType` | OrganizationType | individual, team, enterprise |
| `orgId` | OrganizationId | Organization UUID |
| `entityKind` | EntityKind | user, team, organization |
| `entityId` | AnyEntityId | Entity identifier |
| `attribute` | string | avatar, logo, document, etc. |
| `year` | number | 4-digit year (auto-generated) |
| `month` | string | 2-digit month (auto-generated) |
| `fileId` | FileId | Unique file identifier |
| `ext` | FileExtension | jpg, png, pdf, etc. |

**Shard Prefix Generation:**

```typescript
static readonly fromFileId = (fileId: FileId.Type) => {
  const hashValue = Hash.string(fileId)
  const hexString = Math.abs(hashValue).toString(16).slice(0, 2).padStart(2, "0")
  return S.decodeSync(ShardPrefix)(hexString)
}
```

### File Status Lifecycle

```
PENDING ──────► PROCESSING ──────► READY
    │                │
    │                ▼
    │            FAILED
    │
    ▼
PENDING_DELETION ──────► DELETED
```

---

## Infrastructure Layer

**Location:** `packages/shared/infra/src/internal/upload/`

### UploadService

High-level Effect Service for S3 operations:

```typescript
class UploadService extends Effect.Service<UploadService>()("UploadService", {
  effect: Effect.gen(function* () {
    const s3 = yield* S3Service
    const bucket = yield* Config.string("CLOUD_AWS_S3_BUCKET_NAME")

    return {
      // Generate presigned URL for browser upload
      getPreSignedUrl: (uploadParams: UploadPath.Encoded) =>
        s3.presignPutObject({ bucket, key: uploadParams }),

      // Delete file from S3
      deleteObject: (uploadParams: UploadPath.Encoded) =>
        s3.deleteObject({ bucket, key: uploadParams }),

      // Persist file record to database
      insertFile: (input: Model.insert.Type) =>
        Effect.gen(function* () { /* ... */ })
    }
  })
})
```

### Cryptographic Utilities

**Location:** `packages/shared/infra/src/internal/upload/crypto.ts`

#### Payload Signing (HMAC-SHA256)

```typescript
export const signPayload = Effect.fn("signPayload")(function* (
  payload: string,
  secret: Redacted<string>
) {
  const signingKey = yield* crypto.subtle.importKey(
    "raw",
    encoder.encode(Redacted.value(secret)),
    algorithm,
    false,
    ["sign"]
  )

  const signature = yield* crypto.subtle.sign(algorithm, signingKey, encoder.encode(payload))
  return `hmac-sha256=${Encoding.encodeHex(new Uint8Array(signature))}`
})
```

#### Signature Verification

```typescript
export const verifySignature = Effect.fn("verifySignature")(function* (
  payload: string,
  signature: string | null,
  secret: Redacted<string>
) {
  if (!signature) return false

  const sig = signature.slice("hmac-sha256=".length)
  const signingKey = yield* crypto.subtle.importKey(...)
  const sigBytes = yield* Encoding.decodeHex(sig)

  return yield* crypto.subtle.verify(algorithm, signingKey, sigBytes, encoder.encode(payload))
})
```

#### Key Generation (SQIDs)

```typescript
export const generateKey = (
  file: FileProperties,
  appId: string,
  getHashParts?: ExtractHashPartsFn
) =>
  Effect.sync(() => {
    // Customizable hash parts for deterministic key generation
    const hashParts = JSON.stringify(
      getHashParts?.(file) ?? [file.name, file.size, file.type, file.lastModified, Date.now()]
    )

    // App-specific alphabet shuffle
    const alphabet = shuffle(defaultOptions.alphabet, appId)

    // Generate SQID-encoded key
    const encodedFileSeed = new SQIds({ alphabet, minLength: 36 })
      .encode([Math.abs(Hash.string(hashParts))])
    const encodedAppId = new SQIds({ alphabet, minLength: 12 })
      .encode([Math.abs(Hash.string(appId))])

    return encodedAppId + encodedFileSeed
  })
```

#### Signed URL Generation

```typescript
export const generateSignedURL = Effect.fn("generateSignedURL")(function* (
  url: string | URL,
  secretKey: Redacted<string>,
  opts: {
    readonly ttlInSeconds?: Duration.Duration
    readonly data?: Record<string, string | number | boolean | null>
  }
) {
  const parsedURL = new URL(url)
  const ttl = opts.ttlInSeconds ? Duration.toSeconds(opts.ttlInSeconds) : 60 * 60

  // Add expiration
  parsedURL.searchParams.append("expires", (Date.now() + ttl * 1000).toString())

  // Add custom data
  if (opts.data) {
    for (const [key, value] of Object.entries(opts.data)) {
      if (value != null) parsedURL.searchParams.append(key, encodeURIComponent(value))
    }
  }

  // Sign and append signature
  const signature = yield* signPayload(parsedURL.toString(), secretKey)
  parsedURL.searchParams.append("signature", signature)

  return parsedURL.href
})
```

---

## Client-Side Processing

**Location:** `apps/web/src/features/upload/`

### UploadFileService

Effect Service for client-side file processing:

```typescript
class UploadFileService extends Effect.Service<UploadFileService>()("UploadFileService", {
  effect: Effect.gen(function* () {
    const processFile = Effect.fn("UploadFileService.processFile")(function* ({
      file,
      config,
    }) {
      const validated = yield* validateFile({ file, config })
      const basic = yield* extractBasicMetadata({ file, detected: validated.detected })
      const exif = yield* extractExifMetadata({ file, detected: basic.detected })

      return { file, validated, basic, exif } satisfies UploadResult
    })

    const processFiles = Effect.fn("UploadFileService.processFiles")(function* ({
      files,
      config,
    }) {
      const effects = files.map((file) => processFile({ file, config }))
      return yield* accumulateEffectsAndReport(effects, { concurrency: "unbounded" })
    })

    return { processFile, processFiles, validateFile, extractBasicMetadata, extractExifMetadata }
  })
})
```

### Pipeline Configuration

```typescript
interface PipelineConfig {
  maxSizeBytes?: number           // Max file size in bytes
  allowedMime?: string[]          // MIME type whitelist
  chunkSize?: number              // Signature detection chunk size (default: 64)
  excludeSimilarTypes?: boolean   // Filter similar MIME types
}

interface UploadResult {
  file: File
  validated: ValidateFileOutput
  basic: BasicMetadataOutput
  exif: ExifMetadataOutput
}
```

### Validation Pipeline

```typescript
export const validateFile = Effect.fn("upload.validateFile")(function* ({ file, config }) {
  // 1. Size check
  if (config?.maxSizeBytes && file.size > config.maxSizeBytes) {
    return yield* new ValidationError({ message: `File too large: ${actual} (max ${max})` })
  }

  // 2. Signature detection
  const buffer = yield* Effect.tryPromise(() => file.arrayBuffer())
  const chunk = getFileChunk(buffer, chunkSize)
  const detected = fileTypeChecker.detectFile(chunk, { chunkSize })

  if (!detected) {
    yield* Metric.increment(UploadMetrics.detectionFailedTotal)
    return yield* new DetectionError({ message: "Could not detect file type from signature" })
  }

  // 3. MIME type validation
  const candidate = detected.mimeType ?? file.type
  yield* S.decodeUnknown(MimeType)(candidate)

  // 4. Optional whitelist check
  if (config?.allowedMime && !config.allowedMime.includes(candidate)) {
    return yield* new ValidationError({ message: `Disallowed type: ${candidate}` })
  }

  return { detected, formattedSize: formatSize(file.size) }
})
```

---

## Cryptographic Security

### Encryption Service

**Location:** `packages/shared/domain/src/services/EncryptionService/`

AES-256-GCM encryption with Web Crypto API:

```typescript
class EncryptionService extends Context.Tag<EncryptionService>() {
  // Encryption
  readonly encrypt: (plaintext: string | Uint8Array, key: CryptoKey) => Effect<EncryptedPayload>
  readonly encryptBinary: (plaintext, key) => Effect<EncryptedPayloadBinary>

  // Decryption
  readonly decrypt: (payload: EncryptedPayload, key: CryptoKey) => Effect<string>
  readonly decryptBinary: (payload, key) => Effect<Uint8Array>
  readonly decryptToBytes: (payload, key) => Effect<Uint8Array>

  // Key Management
  readonly importKey: (rawKey: Redacted<Uint8Array>) => Effect<CryptoKey>
  readonly importKeyFromBase64: (base64Key: Redacted<string>) => Effect<CryptoKey>
  readonly generateKey: () => Effect<CryptoKey>
  readonly exportKey: (key: CryptoKey) => Effect<Uint8Array>
  readonly deriveKey: (masterKey, info, salt?) => Effect<CryptoKey>

  // Hashing
  readonly sha256: (data: Uint8Array | string) => Effect<string>
  readonly sha256Bytes: (data) => Effect<Uint8Array>
}
```

**Algorithm Constants:**

| Constant | Value | Purpose |
|----------|-------|---------|
| IV_LENGTH | 12 | 96-bit initialization vector |
| TAG_LENGTH | 128 | Authentication tag bits |
| KEY_SIZE | 256 | AES-256 key size |

**Encrypted Payload Format:**

```typescript
// Base64 for storage/transport
interface EncryptedPayload {
  iv: string           // Base64-encoded 12-byte IV
  ciphertext: string   // Base64-encoded ciphertext + auth tag
  algorithm: "AES-GCM"
}

// Binary for internal use
interface EncryptedPayloadBinary {
  iv: Uint8Array
  ciphertext: Uint8Array
  algorithm: "AES-GCM"
}
```

**Key Derivation (HKDF):**

```typescript
// Derive space-specific key from master key
deriveKey: (masterKey, info, salt?) =>
  Effect.gen(function* () {
    const hkdfKey = yield* crypto.subtle.importKey("raw", masterKeyRaw, "HKDF", false, ["deriveKey"])

    return yield* crypto.subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode(info) },
      hkdfKey,
      { name: "AES-GCM", length: KEY_SIZE },
      true,
      ["encrypt", "decrypt"]
    )
  })
```

---

## Distributed Tracing

**Location:** `packages/shared/infra/src/internal/upload/utils.ts`

### Trace Header Formats

```typescript
interface TraceHeaders {
  readonly b3: string        // Zipkin B3 format
  readonly traceparent: string  // W3C Trace Context
}

export const generateTraceHeaders = (): TraceHeaders => {
  const traceId = randomHexString(32)  // 32 hex chars = 16 bytes
  const spanId = randomHexString(16)   // 16 hex chars = 8 bytes
  const sampled = "01"                  // Always sampled

  return {
    b3: `${traceId}-${spanId}-${sampled}`,
    traceparent: `00-${traceId}-${spanId}-${sampled}`
  }
}
```

### Header Format Reference

```
W3C Trace Context (traceparent):
┌────────────────────────────────────────────────────────────────────┐
│  00-{traceId 32 hex}-{spanId 16 hex}-{flags 2 hex}                 │
│  00-a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4-1234567890abcdef-01           │
└────────────────────────────────────────────────────────────────────┘

Zipkin B3:
┌────────────────────────────────────────────────────────────────────┐
│  {traceId 32 hex}-{spanId 16 hex}-{sampled 2 hex}                  │
│  a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4-1234567890abcdef-01              │
└────────────────────────────────────────────────────────────────────┘
```

### Allowed Headers

```typescript
class AllowedHeaders extends BS.StringLiteralKit(
  "Content-Type",
  "Authorization",
  "B3",           // Zipkin B3 trace header
  "traceparent"   // W3C Trace Context header
)
```

---

## File Type Detection

**Location:** `packages/common/schema/src/integrations/files/file-types/`

### Detection Algorithm

```typescript
export function detectFile(
  file: Array<number> | ArrayBuffer | Uint8Array,
  options?: DetectFileOptions
): DetectedFileInfo | undefined {
  const fileChunk = getFileChunk(file, options?.chunkSize ?? 64)
  if (fileChunk.length === 0) return undefined

  const detectedFiles: DetectedFileInfo[] = []

  // Match against all registered signatures
  for (const type in FileTypes) {
    const signatures = FileTypes.getSignaturesByName(type)
    const matchedSignature = FileTypes.detectBySignatures(fileChunk, signatures)

    if (matchedSignature) {
      const fileType = FileTypes.getInfoByName(type)
      detectedFiles.push({
        extension: fileType.extension,
        mimeType: fileType.mimeType,
        description: fileType.description,
        signature: { ...matchedSignature, sequence: matchedSignature.sequence.map(n => n.toString(16)) }
      })
    }
  }

  // Handle ambiguous types (same signature)
  if (detectedFiles.length > 1) {
    const detectedType = FileTypes.detectTypeByAdditionalCheck(fileChunk, detectedFiles)
    return detectedFiles.find(df => df.extension === detectedType)
  }

  return detectedFiles[0]
}
```

### File Signature Schema

```typescript
class FileSignature extends S.Class<FileSignature>("FileSignature")({
  sequence: S.Array(S.Union(S.Number, S.NonEmptyString)),
  offset: S.optional(S.Int.pipe(S.greaterThan(0))),
  skippedBytes: S.optional(S.Array(S.Int.pipe(S.greaterThan(0)))),
  description: S.optional(S.NonEmptyString),
  compatibleExtensions: S.optional(S.NonEmptyArray(S.String)),
})
```

### Detected File Info

```typescript
interface DetectedFileInfo {
  extension: string      // e.g., "jpg"
  mimeType: string       // e.g., "image/jpeg"
  description: string
  signature: {
    sequence: string[]   // Hex representation of bytes
    offset?: number
    description?: string
  }
}
```

### Supported File Categories

| Category | Extensions |
|----------|------------|
| **Video** | mp4, mov, flv, mkv, webm, avi, m4v, ogg, swf |
| **Image** | jpg, png, gif, bmp, webp, ico, svg, heic, tiff, avif |
| **Audio** | mp3, wav, flac, aac, ogg, m4a, wma, opus |
| **Document** | pdf, doc, docx, xls, xlsx, ppt, pptx |
| **Text** | txt, json, xml, html, css, js, csv, yaml |
| **Archive** | zip, rar, 7z, tar, gzip |

---

## Metadata Extraction

### EXIF Metadata

**Location:** `packages/common/schema/src/integrations/files/exif-metadata/`

```typescript
class ExifMetadata extends ExpandedTags {
  // Static methods for data cleaning
  static readonly cleanExifData = cleanExifData
  static readonly omitKnownLargeFields = omitKnownLargeFields
  static readonly isLargeDataField = isLargeDataField
  static readonly isLargeDataValue = isLargeDataValue

  // Extract metadata from file
  static readonly extractMetadata = Effect.fn("extractMetadata")(function* (file: File) {
    const buffer = yield* readFileArrayBuffer(file)
    const raw = yield* Effect.try(() => ExifReader.load(buffer, { expanded: true }))
    const cleaned = cleanExifData(raw)
    return yield* S.decodeUnknown(ExifMetadata)(cleaned)
  })
}
```

**Large Data Fields (Automatically Cleaned):**

```typescript
const LARGE_DATA_FIELDS = [
  "base64", "image", "thumbnailImage", "preview", "previewImage",
  "rawImage", "blob", "buffer", "data", "binaryData",
  "iccProfile", "colorProfile", "embeddedImage", "makerNoteImage"
]
```

**Cleaning Strategy:**

1. Remove fields with binary data names
2. Filter values >1KB
3. Detect base64 patterns
4. Recursively process nested objects/arrays
5. Preserve container structure (e.g., thumbnail object, but cleaned)

### FileInstance Schema

```typescript
class FileInstance extends S.Class<FileInstance>("FileInstance")({
  size: S.NonNegativeInt,
  type: MimeType,
  lastModified: DateTimeUtcFromAllAcceptable,
  name: S.NonEmptyTrimmedString,
  webkitRelativePath: S.NonEmptyTrimmedString,
  width: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),
  height: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),
}) {
  get formattedSize() { return formatSize(this.size) }
  get fileExtension() { return extractExtension(this.name) }
  get mimeType() { return getTypes()[this.fileExtension] }
  get mediaType() { return extractMediaType(this.mimeType) }
  get aspectRatio(): Option<`${number} / ${number}`> { /* GCD calculation */ }
}
```

### Aspect Ratio Computation

```typescript
// Bidirectional transformation
class AspectRatio extends S.transform(
  S.Struct({ width: S.NonNegativeInt, height: S.NonNegativeInt }),
  S.TemplateLiteral(S.Number, S.Literal(" / "), S.Number),
  {
    decode: ({ width, height }) => {
      if (width === 0 || height === 0) return "0 / 0"
      const divisor = gcd(width, height)
      return `${width / divisor} / ${height / divisor}`
    },
    encode: (ratio) => parseDimensions(ratio)
  }
)

// Example: 1920x1080 → "16 / 9"
```

---

## Image Processing

**Location:** `tooling/repo-scripts/src/utils/convert-to-nextgen.ts`

### WebAssembly Image Conversion

Convert images to AVIF format using @jsquash:

```typescript
// Supported decoders
const DECODERS: Record<DecoderTag, DecoderConfig> = {
  jpg:  { label: "JPEG", init: initJpegDecode, decode: decodeJpeg },
  jpeg: { label: "JPEG", init: initJpegDecode, decode: decodeJpeg },
  png:  { label: "PNG",  init: initPngDecode,  decode: decodePng },
  webp: { label: "WebP", init: initWebpDecode, decode: decodeWebp },
}

// Conversion pipeline
export const convertDirectoryToNextgen = Effect.fn("convertDirectoryToNextgen")(function* (opts) {
  const { files, modsToLoad } = yield* collectConvertableFiles({ dir: opts.dir })

  // Initialize AVIF encoder
  const avifBinary = yield* loadWasmBinary(avifEncoderPath, "AVIF encoder")
  yield* initAvifEncode({ wasmBinary: avifBinary })

  // Initialize decoders for detected file types
  yield* initializeDecoders(modsToLoad)

  // Convert all files concurrently
  return yield* Effect.forEach(files, (file) => convertFile(file, opts.dir), {
    concurrency: "unbounded"
  })
})
```

### Conversion Process

```typescript
const convertFile = (file: Convertable, publicDir: string) =>
  Effect.gen(function* () {
    // 1. Read original file
    const original = yield* fs.readFile(file.path)

    // 2. Decode to ImageData
    const decoded = yield* decodeImage(file, toArrayBuffer(original))

    // 3. Encode to AVIF
    const encoded = yield* encodeImage(file, decoded)

    // 4. Write AVIF file
    const targetPath = path.join(publicDir, `${removeExt(relative)}.avif`)
    yield* fs.writeFile(targetPath, encoded)

    // 5. Remove original
    yield* fs.remove(file.path)

    return { source: file.path, target: targetPath }
  })
```

---

## Observability

**Location:** `apps/web/src/features/upload/observability.ts`

### Metrics

```typescript
export const UploadMetrics = {
  // Per-file lifecycle
  filesProcessedTotal: Metric.counter("upload.files_processed_total"),
  filesFailedTotal: Metric.counter("upload.files_failed_total"),

  // Detection & EXIF
  detectionFailedTotal: Metric.counter("upload.detection_failed_total"),
  exifParsedTotal: Metric.counter("upload.exif_parsed_total"),
  exifFailedTotal: Metric.counter("upload.exif_failed_total"),

  // Durations
  processFileDurationMs: Metric.histogram(
    "upload.process_file_duration_ms",
    MetricBoundaries.fromIterable([1, 5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 10_000])
  ),
}
```

### Annotations

```typescript
export const makeFileAnnotations = (file: File, extra?: UploadAnnotation): UploadAnnotation => ({
  service: "upload",
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size,
  ...extra,
})
```

### Instrumentation

```typescript
export const instrumentProcessFile = (annotations?: UploadAnnotation) =>
  <A, E, R>(self: Effect<A, E, R>) =>
    self.pipe(
      withLogContext({ service: "upload", ...annotations }),
      withRootSpan("upload.processFile"),
      withSpanAndMetrics(
        "upload.processFile",
        {
          successCounter: UploadMetrics.filesProcessedTotal,
          errorCounter: UploadMetrics.filesFailedTotal,
          durationHistogram: UploadMetrics.processFileDurationMs,
          durationUnit: "millis",
        },
        { service: "upload", ...annotations }
      )
    )
```

---

## Error Handling

### Error Types

```typescript
// Validation errors
class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string
  readonly cause?: unknown
  readonly fileName?: string
  readonly fileType?: string
  readonly fileSize?: number
  readonly candidateMime?: string
  readonly allowedMime?: ReadonlyArray<string>
}>

// Detection errors
class DetectionError extends Data.TaggedError("DetectionError")<{
  readonly message: string
  readonly cause?: unknown
  readonly fileName?: string
  readonly fileType?: string
  readonly fileSize?: number
  readonly chunkSize?: number
}>

// EXIF parse errors
class ExifParseError extends Data.TaggedError("ExifParseError")<{
  readonly message: string
  readonly cause?: unknown
  readonly fileName?: string
  readonly fileType?: string
  readonly fileSize?: number
  readonly phase: "read" | "parse" | "decode"
}>

// Upload infrastructure errors
class UploadError extends Data.TaggedError("UploadError")<{
  readonly message?: string
  readonly code: string
  readonly cause?: unknown
}>
```

### Error Codes

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid request format |
| `NOT_AVAILABLE_IN_BROWSER` | Server-only operation attempted in browser |
| `VALIDATION_FAILED` | File validation failed |
| `DETECTION_FAILED` | File type detection failed |
| `UPLOAD_FAILED` | Upload to storage failed |
| `SIGNING_FAILED` | Signature generation/verification failed |

---

## API Reference

### Upload Thing Integration Schemas

**Location:** `packages/shared/infra/src/internal/upload/_internal/shared-schemas.ts`

```typescript
// Token structure
class ParsedToken extends S.Struct({
  apiKey: S.Redacted(S.String.pipe(S.startsWith("sk_"))),
  appId: S.String,
  regions: S.NonEmptyArray(S.String),
  ingestHost: S.String.pipe(S.optionalWith({ default: () => "ingest.uploadthing.com" })),
})

// File upload data from client
class FileUploadData extends S.Class("FileUploadData")({
  name: S.String,
  size: S.Number,
  type: S.String,
  lastModified: S.Number.pipe(S.optional),
})

// Extended with custom ID
class FileUploadDataWithCustomId extends FileUploadData.extend({
  customId: S.NullOr(S.String),
})

// Uploaded file response
class UploadedFileData extends FileUploadDataWithCustomId.extend({
  key: S.String,
  url: S.String,        // Deprecated
  appUrl: S.String,     // Deprecated
  ufsUrl: S.String,     // Use this
  fileHash: S.String,
})

// Presigned URL response
class NewPresignedUrl extends S.Class("NewPresignedUrl")({
  url: S.String,
  key: S.String,
  customId: S.NullOr(S.String),
  name: S.String,
})

// Webhook payload
class MetadataFetchStreamPart extends S.Class("MetadataFetchStreamPart")({
  payload: S.String,
  signature: S.String,
  hook: S.Literal("callback", "error"),
})

// Upload action payload
class UploadActionPayload extends S.Class("UploadActionPayload")({
  files: S.Array(FileUploadData),
  input: S.Unknown,
})
```

---

## Key Files Reference

### Domain Layer

| File                                                             | Description             |
|------------------------------------------------------------------|-------------------------|
| `packages/shared/domain/src/entities/File/File.model.ts`         | Core file entity model  |
| `packages/shared/domain/src/entities/File/schemas/UploadPath.ts` | S3 path transformations |
| `packages/shared/domain/src/entities/File/schemas/FileStatus.ts` | File status states      |
| `packages/shared/domain/src/entities/File/schemas/Filename.ts`   | Filename schema         |
| `packages/shared/domain/src/services/EncryptionService/`         | AES-256-GCM encryption  |

### Infrastructure Layer

| File                                                                    | Description                  |
|-------------------------------------------------------------------------|------------------------------|
| `packages/shared/infra/src/internal/upload/crypto.ts`                   | HMAC signing, key generation |
| `packages/shared/infra/src/internal/upload/utils.ts`                    | Trace headers, utilities     |
| `packages/shared/infra/src/internal/upload/error.ts`                    | Upload error types           |
| `packages/shared/infra/src/internal/upload/_internal/shared-schemas.ts` | UploadThing schemas          |
| `packages/shared/infra/src/internal/upload/_internal/parser.ts`         | Multi-parser support         |

### Schema Layer

| File                                                            | Description           |
|-----------------------------------------------------------------|-----------------------|
| `packages/common/schema/src/integrations/files/FileInstance.ts` | File instance schemas |
| `packages/common/schema/src/integrations/files/file-types/`     | File type detection   |
| `packages/common/schema/src/integrations/files/exif-metadata/`  | EXIF extraction       |
| `packages/common/schema/src/integrations/files/mime-types/`     | MIME type system      |

### Client Features

| File | Description |
|------|-------------|
| `apps/web/src/features/upload/UploadFileService.ts` | Client upload service |
| `apps/web/src/features/upload/pipeline.ts` | Validation pipeline |
| `apps/web/src/features/upload/observability.ts` | Metrics and tracing |
| `apps/web/src/features/upload/errors.ts` | Error types |

### Tooling

| File                                                   | Description                  |
|--------------------------------------------------------|------------------------------|
| `tooling/repo-scripts/src/utils/convert-to-nextgen.ts` | WebAssembly image conversion |

---

## Future Enhancements

### Planned Features

1. **Resumable Uploads**
   - HTTP Range headers for interrupted uploads
   - HEAD request to check upload state
   - Resume from last successfully received byte

2. **WebGPU Processing**
   - GPU-accelerated image processing
   - Real-time format conversion
   - Hardware-accelerated encoding

3. **WebWorker Background Tasks**
   - `@effect/platform-browser/BrowserWorker` integration
   - Long-running async tasks in background
   - Non-blocking file processing

4. **AI Integration**
   - OpenAI CLIP for image tagging/captioning
   - Embedding generation for semantic search
   - Computer vision on supported MIME types

5. **S3 Lifecycle Management**
   - Automatic bucket pruning for deleted files
   - Intelligent storage class transitions
   - Cost optimization strategies

6. **Streaming Callbacks (JSONL)**
   - Real-time callback processing
   - Memory-efficient large file handling
   - Independent line failure handling

---

## Summary

The beep-effect file and upload management system provides:

- **Security**: HMAC-SHA256 signed URLs, AES-256-GCM encryption
- **Reliability**: Resumable uploads, deterministic operations
- **Performance**: Concurrent uploads, WebWorker processing
- **Type Safety**: End-to-end Effect Schema validation
- **Observability**: Distributed tracing, comprehensive metrics
- **Flexibility**: Bidirectional transformations, extensible pipeline

The architecture ensures files are processed securely on the client, uploaded directly to S3 via presigned URLs, while keeping the server in control of authentication, metadata, and post-upload processing.

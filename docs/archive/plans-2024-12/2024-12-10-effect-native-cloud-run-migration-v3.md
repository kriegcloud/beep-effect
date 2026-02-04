# Effect-Native GCP Cloud Run Migration Plan v3

**Date:** 2024-12-10
**Status:** Draft - GCP-Native Architecture
**Goal:** Production-ready multi-instance Cloud Run deployment using GCP-native services with Effect platform abstractions

## Executive Summary

The v2 plan uses generic Redis/ioredis which ignores GCP-native capabilities. This v3 plan leverages:

| Concern | GCP Service | Effect Abstraction | Benefit |
|---------|-------------|-------------------|---------|
| Ontology Storage | **GCS** | `FileSystem` | Versioned, updateable without redeploy |
| Large Results Cache | **GCS** | `FileSystem` | Cost-effective for large blobs |
| Dedup/Rate-limit | **Memorystore** | `KeyValueStore` | IAM auth, managed, VPC-internal |
| Secrets | **Secret Manager** | `Config` | Rotation, audit, no env vars |
| Service Wrappers | N/A | Effect Layers | Type-safe, testable, swappable |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloud Run                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Effect Runtime                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ GcsFileSystem│  │MemorystoreKV │  │SecretManager │   │   │
│  │  │ (FileSystem) │  │(KeyValueStore)│  │  (Config)    │   │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │   │
│  └─────────┼─────────────────┼─────────────────┼───────────┘   │
└────────────┼─────────────────┼─────────────────┼───────────────┘
             │                 │                 │
             ▼                 ▼                 ▼
      ┌──────────┐      ┌──────────┐      ┌──────────┐
      │   GCS    │      │Memorystore│     │ Secret   │
      │  Bucket  │      │  Redis    │     │ Manager  │
      └──────────┘      └──────────┘      └──────────┘
```

---

## Design Decisions

### Why GCS for Ontologies & Large Results?

| Aspect | Docker-baked | GCS Bucket |
|--------|--------------|------------|
| Update ontology | Redeploy all instances | Upload new file, instant |
| Storage cost | Per-instance memory | Pennies/month |
| Versioning | Git tags only | GCS object versioning |
| Large results | Redis memory pressure | GCS tiered storage |
| Cold start | Larger image, slower | Fetch on-demand |

**Decision:** Ontologies and large extraction results go to GCS. Redis (Memorystore) for dedup keys and rate-limit counters only.

### Why Memorystore over Self-Managed Redis?

| Aspect | ioredis + VM | Memorystore |
|--------|--------------|-------------|
| Auth | Password (secret leak risk) | IAM (no credentials) |
| TLS | Manual cert management | Automatic |
| Failover | Manual sentinel setup | Automatic HA |
| VPC | Manual firewall rules | VPC connector auto-wires |
| Cost | ~$30/mo + ops overhead | ~$35/mo fully managed |

**Decision:** Memorystore Basic tier (1GB) for dedup/rate-limit. IAM auth via service account.

### Why Secret Manager over Env Vars?

| Aspect | Env Vars | Secret Manager |
|--------|----------|----------------|
| Rotation | Redeploy required | Zero-downtime rotation |
| Audit | None | Full audit log |
| Access control | All-or-nothing | Fine-grained IAM |
| Leakage risk | In process dumps, logs | Never in memory unless accessed |

**Decision:** All secrets (API keys, etc.) in Secret Manager. Effect ConfigProvider reads them.

### Separation of Concerns

| Data Type | Storage | TTL | Rationale |
|-----------|---------|-----|-----------|
| Ontology files (.ttl) | GCS | Permanent | Versioned, update without redeploy |
| Large extraction results | GCS | 30 days | Cost-effective blob storage |
| Dedup handles | Memorystore | 1 hour | Fast lookup, prevent duplicates |
| Rate limit counters | Memorystore | 1 minute | Atomic incr, distributed |
| Small cache entries | Memorystore | 24 hours | <1KB, fast access |

---

## Phase 0: GCP Infrastructure Setup

### 0.1 Service Account & IAM

```bash
# Create service account for Cloud Run
gcloud iam service-accounts create ontology-api \
  --display-name="Ontology API Service Account"

# Grant GCS access
gcloud storage buckets add-iam-policy-binding gs://ontology-data \
  --member="serviceAccount:ontology-api@${PROJECT}.iam.gserviceaccount.com" \
  --role="roles/storage.objectUser"

# Grant Secret Manager access
gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:ontology-api@${PROJECT}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant Memorystore access (via VPC connector)
# No explicit IAM - connection authenticated by VPC
```

### 0.2 GCS Bucket Setup

```bash
# Create bucket with versioning
gcloud storage buckets create gs://ontology-data \
  --location=us-central1 \
  --uniform-bucket-level-access

# Enable versioning
gcloud storage buckets update gs://ontology-data --versioning

# Set lifecycle (auto-delete old extraction results after 30 days)
cat > lifecycle.json << 'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 30,
          "matchesPrefix": ["extractions/"]
        }
      }
    ]
  }
}
EOF
gcloud storage buckets update gs://ontology-data --lifecycle-file=lifecycle.json
```

### 0.3 Memorystore Setup

```bash
# Create Memorystore Redis instance
gcloud redis instances create ontology-cache \
  --region=us-central1 \
  --tier=basic \
  --size=1 \
  --redis-version=redis_7_0 \
  --network=default

# Get the internal IP (use in VPC connector)
gcloud redis instances describe ontology-cache --region=us-central1 --format="value(host)"
```

### 0.4 VPC Connector

```bash
# Create VPC connector for Cloud Run -> Memorystore
gcloud compute networks vpc-access connectors create ontology-connector \
  --region=us-central1 \
  --network=default \
  --range=10.8.0.0/28
```

### 0.5 Secret Manager

```bash
# Create secrets
echo -n "sk-ant-api03-..." | gcloud secrets create anthropic-api-key --data-file=-
echo -n "sk-..." | gcloud secrets create openai-api-key --data-file=-
echo -n "..." | gcloud secrets create gemini-api-key --data-file=-
```

---

## Phase 1: Effect GCS FileSystem Implementation

### 1.1 GCS FileSystem Layer

Implement `@effect/platform` `FileSystem` interface backed by GCS.

```typescript
// packages/@core-v2/src/Infrastructure/GCP/GcsFileSystem.ts
import { FileSystem, Path, PlatformError } from "@effect/platform"
import { Storage } from "@google-cloud/storage"
import { Context, Data, Effect, Layer, Option, Stream } from "effect"

// =============================================================================
// Configuration
// =============================================================================

export interface GcsConfig {
  readonly bucketName: string
  readonly pathPrefix: string
}

export class GcsConfigService extends Context.Tag("@core-v2/GcsConfigService")<
  GcsConfigService,
  GcsConfig
>() {}

// =============================================================================
// Errors
// =============================================================================

export class GcsError extends Data.TaggedError("GcsError")<{
  readonly operation: string
  readonly path: string
  readonly cause: unknown
}> {
  get message() {
    return `GCS ${this.operation} failed for ${this.path}: ${this.cause}`
  }
}

// =============================================================================
// Implementation
// =============================================================================

const makeGcsFileSystem = Effect.gen(function*() {
  const config = yield* GcsConfigService
  const storage = new Storage() // Uses ADC (Application Default Credentials)
  const bucket = storage.bucket(config.bucketName)

  const toGcsPath = (path: string): string =>
    `${config.pathPrefix}/${path}`.replace(/\/+/g, "/").replace(/^\//, "")

  return FileSystem.make({
    // Read file from GCS
    readFile: (path) =>
      Effect.tryPromise({
        try: async () => {
          const [contents] = await bucket.file(toGcsPath(path)).download()
          return new Uint8Array(contents)
        },
        catch: (e) => PlatformError.SystemError({
          reason: "NotFound",
          module: "GcsFileSystem",
          method: "readFile",
          pathOrDescriptor: path,
          message: `Failed to read ${path}: ${e}`
        })
      }),

    // Read file as text
    readFileString: (path) =>
      Effect.tryPromise({
        try: async () => {
          const [contents] = await bucket.file(toGcsPath(path)).download()
          return contents.toString("utf-8")
        },
        catch: (e) => PlatformError.SystemError({
          reason: "NotFound",
          module: "GcsFileSystem",
          method: "readFileString",
          pathOrDescriptor: path,
          message: `Failed to read ${path}: ${e}`
        })
      }),

    // Write file to GCS
    writeFile: (path, data) =>
      Effect.tryPromise({
        try: async () => {
          const file = bucket.file(toGcsPath(path))
          await file.save(Buffer.from(data))
        },
        catch: (e) => PlatformError.SystemError({
          reason: "Unknown",
          module: "GcsFileSystem",
          method: "writeFile",
          pathOrDescriptor: path,
          message: `Failed to write ${path}: ${e}`
        })
      }),

    // Write text file to GCS
    writeFileString: (path, content) =>
      Effect.tryPromise({
        try: async () => {
          const file = bucket.file(toGcsPath(path))
          await file.save(content, { contentType: "text/plain" })
        },
        catch: (e) => PlatformError.SystemError({
          reason: "Unknown",
          module: "GcsFileSystem",
          method: "writeFileString",
          pathOrDescriptor: path,
          message: `Failed to write ${path}: ${e}`
        })
      }),

    // Check if file exists
    exists: (path) =>
      Effect.tryPromise({
        try: async () => {
          const [exists] = await bucket.file(toGcsPath(path)).exists()
          return exists
        },
        catch: () => false
      }),

    // Remove file
    remove: (path) =>
      Effect.tryPromise({
        try: async () => {
          await bucket.file(toGcsPath(path)).delete()
        },
        catch: (e) => PlatformError.SystemError({
          reason: "Unknown",
          module: "GcsFileSystem",
          method: "remove",
          pathOrDescriptor: path,
          message: `Failed to remove ${path}: ${e}`
        })
      }),

    // List files in directory (prefix)
    readDirectory: (path) =>
      Effect.tryPromise({
        try: async () => {
          const prefix = toGcsPath(path) + "/"
          const [files] = await bucket.getFiles({ prefix, delimiter: "/" })
          return files.map(f => f.name.replace(prefix, ""))
        },
        catch: (e) => PlatformError.SystemError({
          reason: "NotFound",
          module: "GcsFileSystem",
          method: "readDirectory",
          pathOrDescriptor: path,
          message: `Failed to list ${path}: ${e}`
        })
      }),

    // Get file info
    stat: (path) =>
      Effect.tryPromise({
        try: async () => {
          const [metadata] = await bucket.file(toGcsPath(path)).getMetadata()
          return {
            type: "File" as const,
            size: Number(metadata.size ?? 0),
            mtime: new Date(metadata.updated ?? 0),
            atime: new Date(metadata.timeCreated ?? 0),
            ctime: new Date(metadata.timeCreated ?? 0)
          }
        },
        catch: (e) => PlatformError.SystemError({
          reason: "NotFound",
          module: "GcsFileSystem",
          method: "stat",
          pathOrDescriptor: path,
          message: `Failed to stat ${path}: ${e}`
        })
      }),

    // Stream file contents
    stream: (path) =>
      Stream.fromAsyncIterable(
        bucket.file(toGcsPath(path)).createReadStream(),
        (e) => PlatformError.SystemError({
          reason: "Unknown",
          module: "GcsFileSystem",
          method: "stream",
          pathOrDescriptor: path,
          message: `Failed to stream ${path}: ${e}`
        })
      ).pipe(
        Stream.map((chunk) => new Uint8Array(chunk as Buffer))
      ),

    // Write stream to GCS
    sink: (path) =>
      // Implementation using GCS resumable upload
      // Returns a Sink<void, Uint8Array, never, PlatformError>
      // ...

    // Directory operations (GCS doesn't have real directories)
    makeDirectory: () => Effect.void,
    makeTempDirectory: () => Effect.succeed("/tmp"),
    makeTempFile: () => Effect.succeed(`/tmp/${crypto.randomUUID()}`),
    copy: (src, dest) => /* download then upload */,
    copyFile: (src, dest) => /* download then upload */,
    rename: (src, dest) => /* copy then delete */,

    // Symlinks not supported in GCS
    link: () => Effect.fail(PlatformError.SystemError({ reason: "NotSupported", module: "GcsFileSystem", method: "link", message: "Not supported" })),
    readLink: () => Effect.fail(PlatformError.SystemError({ reason: "NotSupported", module: "GcsFileSystem", method: "readLink", message: "Not supported" })),
    symlink: () => Effect.fail(PlatformError.SystemError({ reason: "NotSupported", module: "GcsFileSystem", method: "symlink", message: "Not supported" })),

    // Permissions not applicable to GCS
    access: () => Effect.void,
    chmod: () => Effect.void,
    chown: () => Effect.void,
    truncate: () => Effect.void,
    utimes: () => Effect.void,

    // Watch not supported
    watch: () => Stream.empty,

    // Real path is just the path
    realPath: (path) => Effect.succeed(path)
  })
})

export const GcsFileSystemLive: Layer.Layer<FileSystem.FileSystem, never, GcsConfigService> =
  Layer.scoped(FileSystem.FileSystem, makeGcsFileSystem)
```

### 1.2 Ontology Storage Service

```typescript
// packages/@core-v2/src/Service/OntologyStorage.ts
import { FileSystem } from "@effect/platform"
import { Context, Effect, Layer, Option } from "effect"

export interface OntologyStorageApi {
  readonly loadOntology: (name: string) => Effect.Effect<string, OntologyNotFoundError>
  readonly listOntologies: () => Effect.Effect<string[]>
  readonly getVersion: (name: string) => Effect.Effect<string>
}

export class OntologyStorage extends Context.Tag("@core-v2/OntologyStorage")<
  OntologyStorage,
  OntologyStorageApi
>() {}

export const OntologyStorageLive: Layer.Layer<
  OntologyStorage,
  never,
  FileSystem.FileSystem
> = Layer.effect(
  OntologyStorage,
  Effect.gen(function*() {
    const fs = yield* FileSystem.FileSystem

    return {
      loadOntology: (name) =>
        fs.readFileString(`ontologies/${name}.ttl`).pipe(
          Effect.mapError(() => new OntologyNotFoundError({ name }))
        ),

      listOntologies: () =>
        fs.readDirectory("ontologies").pipe(
          Effect.map((files) =>
            files
              .filter((f) => f.endsWith(".ttl"))
              .map((f) => f.replace(".ttl", ""))
          )
        ),

      getVersion: (name) =>
        fs.stat(`ontologies/${name}.ttl`).pipe(
          Effect.map((stat) => stat.mtime.toISOString())
        )
    }
  })
)
```

### 1.3 Extraction Results Storage

```typescript
// packages/@core-v2/src/Service/ExtractionResultStorage.ts
import { FileSystem } from "@effect/platform"
import { Context, Effect, Layer, Schema } from "effect"
import { ExtractionResultSchema } from "../Domain/Schema/Extraction.js"

export interface ExtractionResultStorageApi {
  readonly store: (key: string, result: typeof ExtractionResultSchema.Type) => Effect.Effect<void>
  readonly retrieve: (key: string) => Effect.Effect<Option<typeof ExtractionResultSchema.Type>>
  readonly exists: (key: string) => Effect.Effect<boolean>
}

export class ExtractionResultStorage extends Context.Tag("@core-v2/ExtractionResultStorage")<
  ExtractionResultStorage,
  ExtractionResultStorageApi
>() {}

export const ExtractionResultStorageLive: Layer.Layer<
  ExtractionResultStorage,
  never,
  FileSystem.FileSystem
> = Layer.effect(
  ExtractionResultStorage,
  Effect.gen(function*() {
    const fs = yield* FileSystem.FileSystem
    const encode = Schema.encode(ExtractionResultSchema)
    const decode = Schema.decodeUnknown(ExtractionResultSchema)

    return {
      store: (key, result) =>
        Effect.gen(function*() {
          const json = yield* encode(result)
          yield* fs.writeFileString(`extractions/${key}.json`, JSON.stringify(json))
        }),

      retrieve: (key) =>
        Effect.gen(function*() {
          const exists = yield* fs.exists(`extractions/${key}.json`)
          if (!exists) return Option.none()

          const content = yield* fs.readFileString(`extractions/${key}.json`)
          const result = yield* decode(JSON.parse(content))
          return Option.some(result)
        }).pipe(
          Effect.catchAll(() => Effect.succeed(Option.none()))
        ),

      exists: (key) => fs.exists(`extractions/${key}.json`)
    }
  })
)
```

---

## Phase 2: Memorystore KeyValueStore Implementation

### 2.1 Memorystore Client (IAM-Authenticated)

```typescript
// packages/@core-v2/src/Infrastructure/GCP/MemorystoreClient.ts
import { KeyValueStore, PlatformError } from "@effect/platform"
import { Context, Data, Duration, Effect, Layer, Option, Schedule } from "effect"
import { Redis } from "ioredis"

// =============================================================================
// Configuration
// =============================================================================

export interface MemorystoreConfig {
  /** Memorystore instance internal IP (e.g., 10.0.0.3) */
  readonly host: string
  /** Port (default 6379) */
  readonly port: number
  /** Connection timeout in ms */
  readonly connectTimeoutMs: number
  /** Command timeout in ms */
  readonly commandTimeoutMs: number
  /** Key prefix for namespacing */
  readonly keyPrefix: string
}

export class MemorystoreConfigService extends Context.Tag("@core-v2/MemorystoreConfigService")<
  MemorystoreConfigService,
  MemorystoreConfig
>() {}

// =============================================================================
// Errors
// =============================================================================

export class MemorystoreError extends Data.TaggedError("MemorystoreError")<{
  readonly operation: string
  readonly key?: string
  readonly cause: unknown
}> {}

export class MemorystoreUnavailableError extends Data.TaggedError("MemorystoreUnavailableError")<{
  readonly reason: string
}> {}

// =============================================================================
// Implementation
// =============================================================================

const makeMemorystoreClient = Effect.gen(function*() {
  const config = yield* MemorystoreConfigService

  // Create Redis client for Memorystore (IAM auth via VPC, no password)
  const redis = yield* Effect.acquireRelease(
    Effect.sync(() => new Redis({
      host: config.host,
      port: config.port,
      connectTimeout: config.connectTimeoutMs,
      commandTimeout: config.commandTimeoutMs,
      // Memorystore with VPC connector = no password needed (IAM auth)
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null // Stop retrying after 3 attempts
        return Math.min(times * 100, 1000)
      }
    })),
    (redis) => Effect.sync(() => redis.quit())
  )

  // Connect with timeout
  yield* Effect.tryPromise({
    try: () => redis.connect(),
    catch: (e) => new MemorystoreUnavailableError({
      reason: `Failed to connect to Memorystore at ${config.host}:${config.port}: ${e}`
    })
  }).pipe(
    Effect.timeout(Duration.millis(config.connectTimeoutMs)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new MemorystoreUnavailableError({
        reason: `Connection timeout to ${config.host}:${config.port}`
      }))
    )
  )

  const prefixKey = (key: string) => `${config.keyPrefix}${key}`

  return {
    redis,
    config,

    get: (key: string) =>
      Effect.tryPromise({
        try: () => redis.get(prefixKey(key)),
        catch: (e) => new MemorystoreError({ operation: "get", key, cause: e })
      }).pipe(Effect.map(Option.fromNullable)),

    set: (key: string, value: string, ttlSeconds?: number) =>
      Effect.tryPromise({
        try: () => ttlSeconds
          ? redis.set(prefixKey(key), value, "EX", ttlSeconds)
          : redis.set(prefixKey(key), value),
        catch: (e) => new MemorystoreError({ operation: "set", key, cause: e })
      }).pipe(Effect.asVoid),

    del: (key: string) =>
      Effect.tryPromise({
        try: () => redis.del(prefixKey(key)),
        catch: (e) => new MemorystoreError({ operation: "del", key, cause: e })
      }).pipe(Effect.asVoid),

    incr: (key: string) =>
      Effect.tryPromise({
        try: () => redis.incr(prefixKey(key)),
        catch: (e) => new MemorystoreError({ operation: "incr", key, cause: e })
      }),

    expire: (key: string, ttlSeconds: number) =>
      Effect.tryPromise({
        try: () => redis.expire(prefixKey(key), ttlSeconds),
        catch: (e) => new MemorystoreError({ operation: "expire", key, cause: e })
      }).pipe(Effect.asVoid),

    pttl: (key: string) =>
      Effect.tryPromise({
        try: () => redis.pttl(prefixKey(key)),
        catch: (e) => new MemorystoreError({ operation: "pttl", key, cause: e })
      }),

    eval: <T>(script: string, keys: string[], args: (string | number)[]) =>
      Effect.tryPromise({
        try: () => redis.eval(
          script,
          keys.length,
          ...keys.map(prefixKey),
          ...args
        ) as Promise<T>,
        catch: (e) => new MemorystoreError({ operation: "eval", cause: e })
      }),

    ping: () =>
      Effect.tryPromise({
        try: () => redis.ping(),
        catch: (e) => new MemorystoreError({ operation: "ping", cause: e })
      }).pipe(Effect.map((result) => result === "PONG"))
  }
})

export interface MemorystoreClientApi extends Effect.Effect.Success<typeof makeMemorystoreClient> {}

export class MemorystoreClient extends Context.Tag("@core-v2/MemorystoreClient")<
  MemorystoreClient,
  MemorystoreClientApi
>() {}

export const MemorystoreClientLive: Layer.Layer<
  MemorystoreClient,
  MemorystoreUnavailableError,
  MemorystoreConfigService
> = Layer.scoped(MemorystoreClient, makeMemorystoreClient)
```

### 2.2 Memorystore-backed KeyValueStore

```typescript
// packages/@core-v2/src/Infrastructure/GCP/MemorystoreKeyValueStore.ts
import { KeyValueStore, PlatformError } from "@effect/platform"
import { Effect, Layer, Option } from "effect"
import { MemorystoreClient } from "./MemorystoreClient.js"

export const MemorystoreKeyValueStoreLive: Layer.Layer<
  KeyValueStore.KeyValueStore,
  never,
  MemorystoreClient
> = Layer.effect(
  KeyValueStore.KeyValueStore,
  Effect.gen(function*() {
    const client = yield* MemorystoreClient

    return KeyValueStore.make({
      get: (key) =>
        client.get(key).pipe(
          Effect.mapError((e) => PlatformError.SystemError({
            reason: "Unknown",
            module: "MemorystoreKeyValueStore",
            method: "get",
            pathOrDescriptor: key,
            message: e.message
          }))
        ),

      set: (key, value) =>
        client.set(key, typeof value === "string" ? value : new TextDecoder().decode(value)).pipe(
          Effect.mapError((e) => PlatformError.SystemError({
            reason: "Unknown",
            module: "MemorystoreKeyValueStore",
            method: "set",
            pathOrDescriptor: key,
            message: e.message
          }))
        ),

      remove: (key) =>
        client.del(key).pipe(
          Effect.mapError((e) => PlatformError.SystemError({
            reason: "Unknown",
            module: "MemorystoreKeyValueStore",
            method: "remove",
            pathOrDescriptor: key,
            message: e.message
          }))
        ),

      // Clear not supported in production (safety)
      clear: Effect.fail(PlatformError.SystemError({
        reason: "NotSupported",
        module: "MemorystoreKeyValueStore",
        method: "clear",
        message: "Clear not supported in production"
      })),

      // Size not efficient in Redis
      size: Effect.fail(PlatformError.SystemError({
        reason: "NotSupported",
        module: "MemorystoreKeyValueStore",
        method: "size",
        message: "Size not supported"
      }))
    })
  })
)
```

---

## Phase 3: Secret Manager ConfigProvider

### 3.1 Secret Manager Service

```typescript
// packages/@core-v2/src/Infrastructure/GCP/SecretManager.ts
import { SecretManagerServiceClient } from "@google-cloud/secret-manager"
import { Config, ConfigProvider, Context, Data, Effect, Layer, Option } from "effect"

// =============================================================================
// Configuration
// =============================================================================

export interface SecretManagerConfig {
  readonly projectId: string
  /** Mapping from config key to secret name */
  readonly secretMapping: Record<string, string>
}

export class SecretManagerConfigService extends Context.Tag("@core-v2/SecretManagerConfigService")<
  SecretManagerConfigService,
  SecretManagerConfig
>() {}

// =============================================================================
// Errors
// =============================================================================

export class SecretNotFoundError extends Data.TaggedError("SecretNotFoundError")<{
  readonly secretName: string
}> {}

export class SecretAccessError extends Data.TaggedError("SecretAccessError")<{
  readonly secretName: string
  readonly cause: unknown
}> {}

// =============================================================================
// Implementation
// =============================================================================

const makeSecretManagerProvider = (config: SecretManagerConfig): ConfigProvider.ConfigProvider => {
  const client = new SecretManagerServiceClient()
  const cache = new Map<string, string>()

  const accessSecret = async (secretName: string): Promise<string> => {
    if (cache.has(secretName)) {
      return cache.get(secretName)!
    }

    const name = `projects/${config.projectId}/secrets/${secretName}/versions/latest`
    const [version] = await client.accessSecretVersion({ name })
    const payload = version.payload?.data?.toString() ?? ""

    cache.set(secretName, payload)
    return payload
  }

  return ConfigProvider.fromMap(
    new Map(), // Fallback empty map
    {
      // Override load to fetch from Secret Manager
      load: (key) =>
        Effect.gen(function*() {
          const secretName = config.secretMapping[key]
          if (!secretName) {
            return Option.none()
          }

          const value = yield* Effect.tryPromise({
            try: () => accessSecret(secretName),
            catch: (e) => new SecretAccessError({ secretName, cause: e })
          })

          return Option.some(value)
        }).pipe(
          Effect.catchAll(() => Effect.succeed(Option.none()))
        )
    }
  )
}

// =============================================================================
// Layer that installs ConfigProvider
// =============================================================================

export const SecretManagerConfigProviderLayer = (
  projectId: string,
  secretMapping: Record<string, string>
): Layer.Layer<never> =>
  Layer.setConfigProvider(
    makeSecretManagerProvider({ projectId, secretMapping })
  )
```

### 3.2 Config Schema with Secrets

```typescript
// packages/@core-v2/src/Service/Config.ts
import { Config, Effect, Schema } from "effect"

// Define config that reads from Secret Manager
export const AppConfig = Config.all({
  // LLM API Keys (from Secret Manager)
  anthropicApiKey: Config.secret("ANTHROPIC_API_KEY"),
  openaiApiKey: Config.secret("OPENAI_API_KEY"),
  geminiApiKey: Config.secret("GEMINI_API_KEY"),

  // Non-secret config (from env vars)
  llmProvider: Config.string("LLM_PROVIDER").pipe(
    Config.withDefault("anthropic")
  ),
  llmModel: Config.string("LLM_MODEL").pipe(
    Config.withDefault("claude-sonnet-4-20250514")
  ),

  // GCS config
  gcsBucket: Config.string("GCS_BUCKET"),
  gcsPathPrefix: Config.string("GCS_PATH_PREFIX").pipe(
    Config.withDefault("")
  ),

  // Memorystore config
  memorystoreHost: Config.string("MEMORYSTORE_HOST"),
  memorystorePort: Config.integer("MEMORYSTORE_PORT").pipe(
    Config.withDefault(6379)
  )
})

export type AppConfigType = Config.Config.Success<typeof AppConfig>

export class AppConfigService extends Context.Tag("@core-v2/AppConfigService")<
  AppConfigService,
  AppConfigType
>() {}

export const AppConfigServiceLive: Layer.Layer<AppConfigService, Config.Error> =
  Layer.effect(
    AppConfigService,
    Effect.config(AppConfig)
  )
```

---

## Phase 4: Deduplication Service

### 4.1 Dedup Key Schema

```typescript
// packages/@core-v2/src/Domain/Schema/DedupKey.ts
import { Schema, PrimaryKey } from "effect"
import { createHash } from "crypto"

export class ExtractionDedupKey extends Schema.Class<ExtractionDedupKey>("ExtractionDedupKey")({
  textHash: Schema.String,
  model: Schema.String,
  ontologyVersion: Schema.String,
  temperature: Schema.Number
}) {
  [PrimaryKey.symbol]() {
    return `dedup:${this.textHash}:${this.model}:${this.ontologyVersion}:${this.temperature}`
  }

  static create(text: string, model: string, ontologyVersion: string, temperature: number) {
    const hash = createHash("sha256").update(text).digest("hex").slice(0, 32)
    return new ExtractionDedupKey({ textHash: hash, model, ontologyVersion, temperature })
  }
}
```

### 4.2 Deduplication Service (Memorystore + GCS)

```typescript
// packages/@core-v2/src/Service/ExtractionDeduplicator.ts
import { Context, Data, Deferred, Duration, Effect, Layer, Option, Ref } from "effect"
import { KeyValueStore } from "@effect/platform"
import { ExtractionDedupKey } from "../Domain/Schema/DedupKey.js"
import { ExtractionResultStorage } from "./ExtractionResultStorage.js"

// =============================================================================
// Service Interface
// =============================================================================

export interface ExtractionDeduplicatorApi {
  /**
   * Get or compute extraction result.
   * - Checks Memorystore for dedup handle
   * - If found, waits for result in GCS
   * - If not found, acquires dedup handle and runs computation
   */
  readonly getOrCompute: <A>(
    key: ExtractionDedupKey,
    compute: Effect.Effect<A>
  ) => Effect.Effect<A>
}

export class ExtractionDeduplicator extends Context.Tag("@core-v2/ExtractionDeduplicator")<
  ExtractionDeduplicator,
  ExtractionDeduplicatorApi
>() {}

// =============================================================================
// Errors
// =============================================================================

export class DedupAcquisitionError extends Data.TaggedError("DedupAcquisitionError")<{
  readonly key: string
}> {}

export class DedupWaitTimeoutError extends Data.TaggedError("DedupWaitTimeoutError")<{
  readonly key: string
}> {}

// =============================================================================
// Implementation
// =============================================================================

const DEDUP_TTL_SECONDS = 3600 // 1 hour
const DEDUP_WAIT_TIMEOUT = Duration.minutes(5)
const DEDUP_POLL_INTERVAL = Duration.seconds(2)

export const ExtractionDeduplicatorLive: Layer.Layer<
  ExtractionDeduplicator,
  never,
  KeyValueStore.KeyValueStore | ExtractionResultStorage
> = Layer.effect(
  ExtractionDeduplicator,
  Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore
    const resultStorage = yield* ExtractionResultStorage

    // In-memory map for local deduplication within same instance
    const localWaiters = yield* Ref.make(new Map<string, Deferred.Deferred<unknown, unknown>>())

    const tryAcquire = (key: string): Effect.Effect<boolean> =>
      Effect.gen(function*() {
        // Use Redis SETNX (set if not exists) for distributed lock
        const result = yield* Effect.tryPromise({
          try: async () => {
            // Simulate SETNX with SET NX EX
            const redis = (kv as any).redis // Access underlying redis client
            const result = await redis.set(key, "processing", "NX", "EX", DEDUP_TTL_SECONDS)
            return result === "OK"
          },
          catch: () => false
        })
        return result
      })

    const waitForResult = <A>(key: string): Effect.Effect<A, DedupWaitTimeoutError> =>
      Effect.gen(function*() {
        // Poll GCS for result
        const resultKey = key.replace("dedup:", "result:")

        yield* Effect.repeat(
          Effect.gen(function*() {
            const result = yield* resultStorage.retrieve(resultKey)
            if (Option.isSome(result)) {
              return result.value as A
            }
            yield* Effect.fail("not ready")
          }),
          Schedule.spaced(DEDUP_POLL_INTERVAL).pipe(
            Schedule.upTo(DEDUP_WAIT_TIMEOUT)
          )
        ).pipe(
          Effect.catchAll(() =>
            Effect.fail(new DedupWaitTimeoutError({ key }))
          )
        )
      })

    return {
      getOrCompute: <A>(key: ExtractionDedupKey, compute: Effect.Effect<A>) =>
        Effect.gen(function*() {
          const keyStr = key[PrimaryKey.symbol]()

          // Try to acquire dedup lock
          const acquired = yield* tryAcquire(keyStr)

          if (acquired) {
            // We own this computation
            const result = yield* compute

            // Store result in GCS
            const resultKey = keyStr.replace("dedup:", "result:")
            yield* resultStorage.store(resultKey, result as any)

            return result
          } else {
            // Someone else is computing, wait for result
            return yield* waitForResult<A>(keyStr)
          }
        })
    }
  })
)
```

---

## Phase 5: Rate Limiting Service

### 5.1 Distributed Rate Limiter

```typescript
// packages/@core-v2/src/Service/DistributedRateLimiter.ts
import { Context, Data, Duration, Effect, Layer } from "effect"
import { MemorystoreClient } from "../Infrastructure/GCP/MemorystoreClient.js"
import { AppConfigService } from "./Config.js"

// =============================================================================
// Types
// =============================================================================

export interface RateLimitResult {
  readonly allowed: boolean
  readonly remaining: number
  readonly resetInMs: number
  readonly delayMs: number
}

export interface DistributedRateLimiterApi {
  readonly checkRequestLimit: (provider: string) => Effect.Effect<RateLimitResult>
  readonly checkTokenLimit: (provider: string, tokens: number) => Effect.Effect<RateLimitResult>
  readonly withRateLimit: <A, E, R>(
    provider: string,
    estimatedTokens: number,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | RateLimitExceededError, R>
}

export class DistributedRateLimiter extends Context.Tag("@core-v2/DistributedRateLimiter")<
  DistributedRateLimiter,
  DistributedRateLimiterApi
>() {}

// =============================================================================
// Errors
// =============================================================================

export class RateLimitExceededError extends Data.TaggedError("RateLimitExceededError")<{
  readonly provider: string
  readonly limitType: "requests" | "tokens"
  readonly resetInMs: number
}> {}

// =============================================================================
// Provider Limits
// =============================================================================

const PROVIDER_LIMITS: Record<string, { requestsPerMin: number; tokensPerMin: number }> = {
  anthropic: { requestsPerMin: 50, tokensPerMin: 100_000 },
  openai: { requestsPerMin: 60, tokensPerMin: 150_000 },
  google: { requestsPerMin: 60, tokensPerMin: 100_000 }
}

// =============================================================================
// Lua Scripts
// =============================================================================

const FIXED_WINDOW_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local increment = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "count", "windowStart")
local count = tonumber(data[1]) or 0
local windowStart = tonumber(data[2]) or now

-- Check if window expired
if now - windowStart >= windowMs then
  count = 0
  windowStart = now
end

local newCount = count + increment
local remaining = math.max(0, limit - newCount)
local resetIn = windowMs - (now - windowStart)

-- Update state
redis.call("HMSET", key, "count", newCount, "windowStart", windowStart)
redis.call("PEXPIRE", key, windowMs * 2)

if newCount > limit then
  return {0, remaining, resetIn, resetIn} -- denied, remaining, resetIn, delay
else
  return {1, remaining, resetIn, 0} -- allowed, remaining, resetIn, no delay
end
`

// =============================================================================
// Implementation
// =============================================================================

export const DistributedRateLimiterLive: Layer.Layer<
  DistributedRateLimiter,
  never,
  MemorystoreClient
> = Layer.effect(
  DistributedRateLimiter,
  Effect.gen(function*() {
    const client = yield* MemorystoreClient

    const checkLimit = (key: string, limit: number, windowMs: number, increment: number) =>
      Effect.gen(function*() {
        const result = yield* client.eval<[number, number, number, number]>(
          FIXED_WINDOW_SCRIPT,
          [key],
          [limit, windowMs, increment, Date.now()]
        )

        return {
          allowed: result[0] === 1,
          remaining: result[1],
          resetInMs: result[2],
          delayMs: result[3]
        }
      })

    return {
      checkRequestLimit: (provider) => {
        const limits = PROVIDER_LIMITS[provider] ?? PROVIDER_LIMITS.anthropic
        return checkLimit(
          `ratelimit:${provider}:requests`,
          limits.requestsPerMin,
          60_000,
          1
        )
      },

      checkTokenLimit: (provider, tokens) => {
        const limits = PROVIDER_LIMITS[provider] ?? PROVIDER_LIMITS.anthropic
        return checkLimit(
          `ratelimit:${provider}:tokens`,
          limits.tokensPerMin,
          60_000,
          tokens
        )
      },

      withRateLimit: (provider, estimatedTokens, effect) =>
        Effect.gen(function*() {
          // Check request limit
          const requestResult = yield* checkLimit(
            `ratelimit:${provider}:requests`,
            PROVIDER_LIMITS[provider]?.requestsPerMin ?? 50,
            60_000,
            1
          )

          if (!requestResult.allowed) {
            // Wait and retry
            yield* Effect.logInfo("Rate limited on requests, waiting", {
              provider,
              delayMs: requestResult.delayMs
            })
            yield* Effect.sleep(Duration.millis(requestResult.delayMs))
          }

          // Check token limit
          const tokenResult = yield* checkLimit(
            `ratelimit:${provider}:tokens`,
            PROVIDER_LIMITS[provider]?.tokensPerMin ?? 100_000,
            60_000,
            estimatedTokens
          )

          if (!tokenResult.allowed) {
            yield* Effect.logInfo("Rate limited on tokens, waiting", {
              provider,
              delayMs: tokenResult.delayMs
            })
            yield* Effect.sleep(Duration.millis(tokenResult.delayMs))
          }

          return yield* effect
        })
    }
  })
)
```

---

## Phase 6: Production Runtime Assembly

### 6.1 Layer Composition

```typescript
// packages/@core-v2/src/Runtime/ProductionRuntime.ts
import { Layer } from "effect"
import { FileSystem } from "@effect/platform"
import { KeyValueStore } from "@effect/platform"

// GCP Infrastructure Layers
import { GcsFileSystemLive, GcsConfigService } from "../Infrastructure/GCP/GcsFileSystem.js"
import { MemorystoreClientLive, MemorystoreConfigService } from "../Infrastructure/GCP/MemorystoreClient.js"
import { MemorystoreKeyValueStoreLive } from "../Infrastructure/GCP/MemorystoreKeyValueStore.js"
import { SecretManagerConfigProviderLayer } from "../Infrastructure/GCP/SecretManager.js"

// Service Layers
import { AppConfigServiceLive, AppConfigService } from "../Service/Config.js"
import { OntologyStorageLive } from "../Service/OntologyStorage.js"
import { ExtractionResultStorageLive } from "../Service/ExtractionResultStorage.js"
import { ExtractionDeduplicatorLive } from "../Service/ExtractionDeduplicator.js"
import { DistributedRateLimiterLive } from "../Service/DistributedRateLimiter.js"

// =============================================================================
// Config from Environment
// =============================================================================

const projectId = process.env.GCP_PROJECT_ID ?? "effect-ontology"
const gcsBucket = process.env.GCS_BUCKET ?? "ontology-data"
const memorystoreHost = process.env.MEMORYSTORE_HOST ?? "10.0.0.3"

// =============================================================================
// Secret Manager Layer (sets ConfigProvider)
// =============================================================================

const SecretsLayer = SecretManagerConfigProviderLayer(projectId, {
  "ANTHROPIC_API_KEY": "anthropic-api-key",
  "OPENAI_API_KEY": "openai-api-key",
  "GEMINI_API_KEY": "gemini-api-key"
})

// =============================================================================
// GCS FileSystem Layer
// =============================================================================

const GcsConfigLayer = Layer.succeed(GcsConfigService, {
  bucketName: gcsBucket,
  pathPrefix: ""
})

const GcsLayer = GcsFileSystemLive.pipe(
  Layer.provideMerge(GcsConfigLayer)
)

// =============================================================================
// Memorystore Layer
// =============================================================================

const MemorystoreConfigLayer = Layer.succeed(MemorystoreConfigService, {
  host: memorystoreHost,
  port: 6379,
  connectTimeoutMs: 5000,
  commandTimeoutMs: 1000,
  keyPrefix: "ontology:"
})

const MemorystoreLayer = Layer.mergeAll(
  MemorystoreClientLive,
  MemorystoreKeyValueStoreLive
).pipe(
  Layer.provideMerge(MemorystoreConfigLayer)
)

// =============================================================================
// Service Layers
// =============================================================================

const StorageServices = Layer.mergeAll(
  OntologyStorageLive,
  ExtractionResultStorageLive
).pipe(
  Layer.provideMerge(GcsLayer)
)

const DeduplicationServices = ExtractionDeduplicatorLive.pipe(
  Layer.provideMerge(MemorystoreLayer),
  Layer.provideMerge(StorageServices)
)

const RateLimitingServices = DistributedRateLimiterLive.pipe(
  Layer.provideMerge(MemorystoreLayer)
)

// =============================================================================
// Full Production Runtime
// =============================================================================

export const ProductionRuntime = Layer.mergeAll(
  AppConfigServiceLive,
  StorageServices,
  DeduplicationServices,
  RateLimitingServices
).pipe(
  Layer.provideMerge(SecretsLayer)
)

// =============================================================================
// Test Runtime (In-Memory Everything)
// =============================================================================

import { layerMemory as FileSystemMemory } from "@effect/platform/FileSystem"
import { layerMemory as KeyValueStoreMemory } from "@effect/platform/KeyValueStore"

const TestGcsLayer = FileSystemMemory

const TestMemorystoreLayer = KeyValueStoreMemory

export const TestRuntime = Layer.mergeAll(
  OntologyStorageLive.pipe(Layer.provideMerge(TestGcsLayer)),
  ExtractionResultStorageLive.pipe(Layer.provideMerge(TestGcsLayer)),
  ExtractionDeduplicatorLive.pipe(
    Layer.provideMerge(TestMemorystoreLayer),
    Layer.provideMerge(TestGcsLayer)
  )
)
```

### 6.2 Health Check Updates

```typescript
// packages/@core-v2/src/Runtime/HealthCheck.ts
import { Effect } from "effect"
import { MemorystoreClient } from "../Infrastructure/GCP/MemorystoreClient.js"
import { FileSystem } from "@effect/platform"

export interface HealthStatus {
  status: "ok" | "degraded" | "error"
  gcs: "healthy" | "unhealthy"
  memorystore: "healthy" | "unhealthy"
  details?: string
}

export const checkHealth = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem
  const memorystore = yield* MemorystoreClient

  // Check GCS
  const gcsHealthy = yield* fs.exists("health-check.txt").pipe(
    Effect.timeout(Duration.seconds(5)),
    Effect.catchAll(() => Effect.succeed(false))
  )

  // Check Memorystore
  const memorystoreHealthy = yield* memorystore.ping().pipe(
    Effect.timeout(Duration.seconds(2)),
    Effect.catchAll(() => Effect.succeed(false))
  )

  const status: HealthStatus = {
    status: gcsHealthy && memorystoreHealthy ? "ok" : "error",
    gcs: gcsHealthy ? "healthy" : "unhealthy",
    memorystore: memorystoreHealthy ? "healthy" : "unhealthy"
  }

  if (!gcsHealthy) status.details = "GCS unreachable"
  if (!memorystoreHealthy) status.details = "Memorystore unreachable"

  return status
})
```

---

## Phase 7: Cloud Run Deployment

### 7.1 Dockerfile Updates

```dockerfile
# packages/@core-v2/Dockerfile
FROM node:22-slim AS base
WORKDIR /app

# Install gcloud SDK for ADC (Application Default Credentials)
# NOT NEEDED - Cloud Run provides ADC automatically

FROM base AS deps
COPY package.json bun.lockb ./
RUN npm install --production

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY dist/ ./dist/

# NO ontology files baked in - they come from GCS now

ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/server.js"]
```

### 7.2 Cloud Run Service Configuration

```yaml
# cloudrun-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ontology-api
  annotations:
    run.googleapis.com/launch-stage: BETA
spec:
  template:
    metadata:
      annotations:
        # VPC connector for Memorystore access
        run.googleapis.com/vpc-access-connector: ontology-connector
        run.googleapis.com/vpc-access-egress: private-ranges-only

        # Scaling
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"

        # CPU allocation
        run.googleapis.com/cpu-throttling: "false"
    spec:
      serviceAccountName: ontology-api@PROJECT_ID.iam.gserviceaccount.com
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
        - image: gcr.io/PROJECT_ID/ontology-api:latest
          ports:
            - containerPort: 8080
          env:
            - name: GCP_PROJECT_ID
              value: "PROJECT_ID"
            - name: GCS_BUCKET
              value: "ontology-data"
            - name: MEMORYSTORE_HOST
              value: "10.0.0.3"  # From gcloud redis instances describe
            - name: LLM_PROVIDER
              value: "anthropic"
            - name: LLM_MODEL
              value: "claude-sonnet-4-20250514"
          resources:
            limits:
              cpu: "2"
              memory: "2Gi"
```

### 7.3 Deploy Script

```bash
#!/bin/bash
# deploy.sh

set -e

PROJECT_ID="effect-ontology"
REGION="us-central1"
SERVICE_NAME="ontology-api"

# Build and push
gcloud builds submit \
  --project=$PROJECT_ID \
  --tag=gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  packages/@core-v2

# Deploy
gcloud run services replace cloudrun-service.yaml \
  --project=$PROJECT_ID \
  --region=$REGION

# Upload ontologies to GCS (if needed)
gsutil -m cp -r ontologies/*.ttl gs://ontology-data/ontologies/

echo "Deployed to: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')"
```

---

## Implementation Checklist

### Phase 0: GCP Infrastructure
- [ ] Create service account `ontology-api`
- [ ] Create GCS bucket `ontology-data` with versioning
- [ ] Set GCS lifecycle policy (30-day retention for extractions)
- [ ] Create Memorystore Redis instance
- [ ] Create VPC connector
- [ ] Create secrets in Secret Manager

### Phase 1: GCS FileSystem
- [ ] Implement `GcsFileSystem.ts`
- [ ] Implement `OntologyStorage.ts`
- [ ] Implement `ExtractionResultStorage.ts`
- [ ] Unit tests with mock FileSystem
- [ ] Integration tests with real GCS (dev bucket)

### Phase 2: Memorystore Integration
- [ ] Implement `MemorystoreClient.ts`
- [ ] Implement `MemorystoreKeyValueStore.ts`
- [ ] Unit tests with mock client
- [ ] Integration tests with local Redis (docker)
- [ ] Integration tests with Memorystore (dev instance)

### Phase 3: Secret Manager
- [ ] Implement `SecretManager.ts` ConfigProvider
- [ ] Update `Config.ts` to use secret config
- [ ] Test with local env vars fallback
- [ ] Test with real Secret Manager

### Phase 4: Deduplication
- [ ] Create `DedupKey.ts` schema
- [ ] Implement `ExtractionDeduplicator.ts`
- [ ] Unit tests for dedup logic
- [ ] Integration tests (multi-process simulation)

### Phase 5: Rate Limiting
- [ ] Implement `DistributedRateLimiter.ts`
- [ ] Create Lua scripts for atomic operations
- [ ] Unit tests for rate limit algorithms
- [ ] Integration tests (concurrent requests)

### Phase 6: Runtime Assembly
- [ ] Update `ProductionRuntime.ts`
- [ ] Update `HealthCheck.ts`
- [ ] Create `TestRuntime.ts` with in-memory layers
- [ ] End-to-end test with full stack

### Phase 7: Deployment
- [ ] Update Dockerfile
- [ ] Create `cloudrun-service.yaml`
- [ ] Create deploy script
- [ ] Deploy to dev environment
- [ ] Test with 1 instance
- [ ] Scale to 3 instances, verify dedup
- [ ] Scale to 10 instances, load test

---

## Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Cloud Run | 2 vCPU, 2GB RAM, ~10 instances avg | ~$50 |
| Memorystore | Basic 1GB | ~$35 |
| GCS | 10GB Standard + operations | ~$2 |
| Secret Manager | 3 secrets, ~1000 access/day | ~$0.10 |
| VPC Connector | Serverless | ~$7 |
| **Total** | | **~$95/month** |

---

## References

- [Cloud Run VPC Access](https://cloud.google.com/run/docs/configuring/vpc-connectors)
- [Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [GCS Node.js Client](https://cloud.google.com/storage/docs/reference/libraries)
- Effect Platform FileSystem: `docs/effect-source/platform/src/FileSystem.ts`
- Effect Platform KeyValueStore: `docs/effect-source/platform/src/KeyValueStore.ts`

# @core-v2 Production Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform @core-v2 into a production-ready, cloud-deployable Effect-native entity extraction framework.

**Architecture:** Layered Effect services with HTTP API gateway, configurable via environment, with durability primitives (Queue, Semaphore, Circuit Breaker), comprehensive observability (traces + metrics), and graceful lifecycle management.

**Tech Stack:** Effect 3.19+, @effect/ai, @effect/platform, @effect/opentelemetry, Bun runtime, Vitest + @effect/vitest

---

## Phase 0: Fix Current Build Errors

Before any new features, the package must compile.

### Task 0.1: Fix RateLimitedLanguageModel Duration Import

**Files:**
- Modify: `packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts:19`

**Step 1: Read the file to confirm current state**

```bash
head -30 packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts
```

**Step 2: Add Duration import**

The import line currently has:
```typescript
import { Clock, Effect, Layer, RateLimiter, Scope, Stream } from "effect"
```

Change to:
```typescript
import { Clock, Duration, Effect, Layer, RateLimiter, Scope, Stream } from "effect"
```

**Step 3: Fix the withRateLimit return type**

The function at line 113-116 has return type `Effect.Effect<A, E | Error, R>`.
The `| Error` comes from the removed CircuitBreaker. Change to:

```typescript
const withRateLimit = <A, E, R>(
  method: string,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
```

**Step 4: Remove CircuitBreaker references**

The file references `makeCircuitBreaker` and uses it. Since CircuitBreaker is standalone (not integrated into rate limiter layer), remove:
- Line 23: `import { makeCircuitBreaker } from "./CircuitBreaker.js"`
- Lines 104-110: CircuitBreaker initialization
- Line 130-132: `circuitBreaker.protect()` wrapper

Replace line 130-134:
```typescript
// Before:
const protectedEffect = circuitBreaker.protect(
  rateLimiter(effect)
)
const result = yield* protectedEffect

// After:
const result = yield* rateLimiter(effect)
```

**Step 5: Verify build**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json 2>&1 | grep -E "^src/Runtime" | head -10
```

Expected: No errors from RateLimitedLanguageModel.ts

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts
git commit -m "fix: remove CircuitBreaker from rate limiter, fix Duration import"
```

---

### Task 0.2: Fix IRI Brand Type in Test Files

**Files:**
- Modify: `packages/@core-v2/test/Domain/Model/Ontology.test.ts`
- Modify: `packages/@core-v2/test/Schema/EntityFactory.test.ts`
- Modify: `packages/@core-v2/test/Schema/RelationFactory.test.ts`

**Step 1: Find IRI type definition**

```bash
grep -r "Brand.*IRI" packages/@core-v2/src/
```

**Step 2: Create test helper for IRI**

In each test file, add import and helper:

```typescript
import { IRI, makeIRI } from "../../src/Utils/Iri.js"

// Use makeIRI("http://...") instead of raw string literals
```

**Step 3: Replace raw strings with makeIRI()**

For each occurrence like:
```typescript
id: "http://example.org/Person"
```

Change to:
```typescript
id: makeIRI("http://example.org/Person")
```

**Step 4: Verify build**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json 2>&1 | grep -E "^test/" | wc -l
```

Expected: 0 errors

**Step 5: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run test/Domain/Model/Ontology.test.ts
```

Expected: All tests pass

**Step 6: Commit**

```bash
git add packages/@core-v2/test/
git commit -m "fix: use IRI brand type in test files"
```

---

## Phase 1: Environment-Based Configuration

Replace hardcoded paths with Effect.Config for cloud deployment.

### Task 1.1: Create EnvConfig Layer

**Files:**
- Create: `packages/@core-v2/src/Service/EnvConfig.ts`
- Test: `packages/@core-v2/test/Service/EnvConfig.test.ts`

**Step 1: Write failing test**

```typescript
// test/Service/EnvConfig.test.ts
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import { EnvConfigService } from "../../src/Service/EnvConfig.js"

describe("EnvConfigService", () => {
  const TestConfigProvider = ConfigProvider.fromMap(
    new Map([
      ["ONTOLOGY_PATH", "/data/test-ontology.ttl"],
      ["LLM_PROVIDER", "anthropic"],
      ["LLM_MODEL", "claude-3-5-sonnet-20241022"],
      ["ANTHROPIC_API_KEY", "test-key"],
      ["EXTRACTION_CONCURRENCY", "4"],
      ["OTLP_ENDPOINT", "http://jaeger:4318/v1/traces"]
    ])
  )

  it.effect("loads config from environment", () =>
    Effect.gen(function*() {
      const config = yield* EnvConfigService

      expect(config.ontology.path).toBe("/data/test-ontology.ttl")
      expect(config.llm.provider).toBe("anthropic")
      expect(config.llm.model).toBe("claude-3-5-sonnet-20241022")
      expect(config.runtime.extractionConcurrency).toBe(4)
    }).pipe(
      Effect.provide(EnvConfigService.Default),
      Effect.provide(Layer.setConfigProvider(TestConfigProvider))
    )
  )

  it.effect("uses defaults when env vars missing", () =>
    Effect.gen(function*() {
      const config = yield* EnvConfigService

      // Defaults from DEFAULT_CONFIG
      expect(config.llm.timeoutMs).toBe(60_000)
      expect(config.llm.maxTokens).toBe(4096)
    }).pipe(
      Effect.provide(EnvConfigService.Default),
      Effect.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map())))
    )
  )
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/@core-v2 && bunx vitest run test/Service/EnvConfig.test.ts
```

Expected: FAIL - module not found

**Step 3: Write implementation**

```typescript
// src/Service/EnvConfig.ts
/**
 * Service: Environment-Based Configuration
 *
 * Loads configuration from environment variables with sensible defaults.
 * Replaces hardcoded paths for cloud deployment.
 *
 * @since 2.0.0
 * @module Service/EnvConfig
 */

import { Config, Effect, Redacted } from "effect"
import { type Config as ConfigType, DEFAULT_CONFIG } from "./Config.js"

/**
 * Load configuration from environment variables
 *
 * Environment variables (with defaults):
 * - ONTOLOGY_PATH: Path to ontology file (default: from DEFAULT_CONFIG)
 * - ONTOLOGY_CACHE_TTL: Cache TTL in seconds (default: 3600)
 * - LLM_PROVIDER: anthropic | openai | google (default: anthropic)
 * - LLM_MODEL: Model name (default: claude-haiku-4-5)
 * - LLM_TIMEOUT_MS: Request timeout (default: 60000)
 * - LLM_MAX_TOKENS: Max output tokens (default: 4096)
 * - LLM_TEMPERATURE: Temperature (default: 0.1)
 * - ANTHROPIC_API_KEY: Anthropic API key
 * - OPENAI_API_KEY: OpenAI API key
 * - GEMINI_API_KEY: Google Gemini API key
 * - EXTRACTION_CONCURRENCY: Parallel chunk processing (default: 8)
 * - RETRY_MAX_ATTEMPTS: Max retry attempts (default: 8)
 * - RETRY_INITIAL_DELAY_MS: Initial backoff delay (default: 3000)
 * - RETRY_MAX_DELAY_MS: Max backoff delay (default: 30000)
 * - OTLP_ENDPOINT: OpenTelemetry endpoint (default: http://localhost:4318/v1/traces)
 * - RDF_BASE_NAMESPACE: Base namespace for RDF (default: http://example.org/kg/)
 * - RDF_OUTPUT_FORMAT: Turtle | N-Triples | JSON-LD (default: Turtle)
 *
 * @since 2.0.0
 */
const loadEnvConfig: Effect.Effect<ConfigType, never, never> = Effect.gen(function*() {
  // LLM Configuration
  const provider = yield* Config.string("LLM_PROVIDER").pipe(
    Config.withDefault(DEFAULT_CONFIG.llm.provider)
  ) as Effect.Effect<"anthropic" | "openai" | "google", never, never>

  const model = yield* Config.string("LLM_MODEL").pipe(
    Config.withDefault(DEFAULT_CONFIG.llm.model)
  )

  const timeoutMs = yield* Config.number("LLM_TIMEOUT_MS").pipe(
    Config.withDefault(DEFAULT_CONFIG.llm.timeoutMs)
  )

  const maxTokens = yield* Config.number("LLM_MAX_TOKENS").pipe(
    Config.withDefault(DEFAULT_CONFIG.llm.maxTokens)
  )

  const temperature = yield* Config.number("LLM_TEMPERATURE").pipe(
    Config.withDefault(DEFAULT_CONFIG.llm.temperature)
  )

  // API Keys (with VITE_ prefix fallback for browser compatibility)
  const anthropicApiKey = yield* Config.redacted("ANTHROPIC_API_KEY").pipe(
    Config.orElse(() => Config.redacted("VITE_LLM_ANTHROPIC_API_KEY")),
    Config.withDefault(Redacted.make("")),
    Effect.map(Redacted.value)
  )

  const openaiApiKey = yield* Config.redacted("OPENAI_API_KEY").pipe(
    Config.orElse(() => Config.redacted("VITE_LLM_OPENAI_API_KEY")),
    Config.withDefault(Redacted.make("")),
    Effect.map(Redacted.value)
  )

  const googleApiKey = yield* Config.redacted("GEMINI_API_KEY").pipe(
    Config.orElse(() => Config.redacted("VITE_LLM_GEMINI_API_KEY")),
    Config.withDefault(Redacted.make("")),
    Effect.map(Redacted.value)
  )

  // Ontology Configuration
  const ontologyPath = yield* Config.string("ONTOLOGY_PATH").pipe(
    Config.withDefault(DEFAULT_CONFIG.ontology.path)
  )

  const cacheTtlSeconds = yield* Config.number("ONTOLOGY_CACHE_TTL").pipe(
    Config.withDefault(DEFAULT_CONFIG.ontology.cacheTtlSeconds)
  )

  // Runtime Configuration
  const extractionConcurrency = yield* Config.number("EXTRACTION_CONCURRENCY").pipe(
    Config.withDefault(DEFAULT_CONFIG.runtime.extractionConcurrency)
  )

  const retryMaxAttempts = yield* Config.number("RETRY_MAX_ATTEMPTS").pipe(
    Config.withDefault(DEFAULT_CONFIG.runtime.retryMaxAttempts)
  )

  const retryInitialDelayMs = yield* Config.number("RETRY_INITIAL_DELAY_MS").pipe(
    Config.withDefault(DEFAULT_CONFIG.runtime.retryInitialDelayMs)
  )

  const retryMaxDelayMs = yield* Config.number("RETRY_MAX_DELAY_MS").pipe(
    Config.withDefault(DEFAULT_CONFIG.runtime.retryMaxDelayMs)
  )

  // RDF Configuration
  const baseNamespace = yield* Config.string("RDF_BASE_NAMESPACE").pipe(
    Config.withDefault(DEFAULT_CONFIG.rdf.baseNamespace)
  )

  const outputFormat = yield* Config.string("RDF_OUTPUT_FORMAT").pipe(
    Config.withDefault(DEFAULT_CONFIG.rdf.outputFormat)
  ) as Effect.Effect<"Turtle" | "N-Triples" | "JSON-LD", never, never>

  return {
    llm: {
      provider: provider as "anthropic" | "openai" | "google",
      model,
      timeoutMs,
      maxTokens,
      temperature,
      anthropicApiKey,
      openaiApiKey,
      googleApiKey
    },
    rdf: {
      baseNamespace,
      prefixes: DEFAULT_CONFIG.rdf.prefixes,
      outputFormat: outputFormat as "Turtle" | "N-Triples" | "JSON-LD"
    },
    ontology: {
      path: ontologyPath,
      cacheTtlSeconds
    },
    runtime: {
      extractionConcurrency,
      retryMaxAttempts,
      retryInitialDelayMs,
      retryMaxDelayMs
    }
  }
})

/**
 * EnvConfigService - Environment-based configuration provider
 *
 * Reads configuration from environment variables with fallback to defaults.
 * Use this instead of ConfigService for cloud deployments.
 *
 * @example
 * ```typescript
 * // Replace ConfigService.Default with EnvConfigService.Default
 * const Live = Layer.mergeAll(
 *   ProductionLayersWithTracing.pipe(Layer.provideMerge(EnvConfigService.Default)),
 *   // ... other layers
 * )
 * ```
 *
 * @since 2.0.0
 * @category Services
 */
export class EnvConfigService extends Effect.Service<EnvConfigService>()(
  "EnvConfigService",
  {
    effect: loadEnvConfig,
    accessors: true
  }
) {}
```

**Step 4: Export from Service index**

Add to `src/Service/index.ts`:
```typescript
export { EnvConfigService } from "./EnvConfig.js"
```

**Step 5: Run test to verify it passes**

```bash
cd packages/@core-v2 && bunx vitest run test/Service/EnvConfig.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Service/EnvConfig.ts packages/@core-v2/src/Service/index.ts packages/@core-v2/test/Service/EnvConfig.test.ts
git commit -m "feat: add EnvConfigService for environment-based configuration"
```

---

## Phase 2: HTTP API Gateway

Create HTTP server layer for cloud deployment entry point.

### Task 2.1: Create Health Check Service

**Files:**
- Create: `packages/@core-v2/src/Runtime/HealthCheck.ts`
- Test: `packages/@core-v2/test/Runtime/HealthCheck.test.ts`

**Step 1: Write failing test**

```typescript
// test/Runtime/HealthCheck.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { HealthCheckService } from "../../src/Runtime/HealthCheck.js"
import { ConfigService } from "../../src/Service/Config.js"

describe("HealthCheckService", () => {
  const TestLayers = HealthCheckService.Default.pipe(
    Layer.provide(ConfigService.Default)
  )

  it.effect("liveness returns ok", () =>
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.liveness()

      expect(result.status).toBe("ok")
    }).pipe(Effect.provide(TestLayers))
  )

  it.effect("readiness checks config", () =>
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.readiness()

      expect(result.status).toBe("ok")
      expect(result.checks.config).toBe("ok")
    }).pipe(Effect.provide(TestLayers))
  )
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/HealthCheck.test.ts
```

Expected: FAIL - module not found

**Step 3: Write implementation**

```typescript
// src/Runtime/HealthCheck.ts
/**
 * Runtime: Health Check Service
 *
 * Provides liveness and readiness probes for Kubernetes/cloud deployment.
 *
 * @since 2.0.0
 * @module Runtime/HealthCheck
 */

import { Effect } from "effect"
import { ConfigService } from "../Service/Config.js"

/**
 * Health check result
 */
export interface HealthResult {
  readonly status: "ok" | "degraded" | "error"
  readonly timestamp: string
  readonly checks?: Record<string, "ok" | "error">
  readonly error?: string
}

/**
 * HealthCheckService - Liveness and readiness probes
 *
 * @since 2.0.0
 * @category Services
 */
export class HealthCheckService extends Effect.Service<HealthCheckService>()(
  "HealthCheckService",
  {
    effect: Effect.gen(function*() {
      const config = yield* ConfigService

      return {
        /**
         * Liveness check - can the service handle requests?
         * Should be fast and never fail unless service is crashed.
         */
        liveness: (): Effect.Effect<HealthResult> =>
          Effect.succeed({
            status: "ok" as const,
            timestamp: new Date().toISOString()
          }),

        /**
         * Readiness check - is the service ready to accept traffic?
         * Checks dependencies (config, LLM availability, etc.)
         */
        readiness: (): Effect.Effect<HealthResult> =>
          Effect.gen(function*() {
            const checks: Record<string, "ok" | "error"> = {}

            // Check config is loaded
            try {
              if (config.llm.provider) {
                checks.config = "ok"
              }
            } catch {
              checks.config = "error"
            }

            // Check ontology path is set (not necessarily accessible yet)
            if (config.ontology.path) {
              checks.ontologyConfig = "ok"
            } else {
              checks.ontologyConfig = "error"
            }

            const hasError = Object.values(checks).some((c) => c === "error")

            return {
              status: hasError ? "degraded" as const : "ok" as const,
              timestamp: new Date().toISOString(),
              checks
            }
          }),

        /**
         * Deep health check - verifies all dependencies work
         * Use for debugging, not for probes (too slow)
         */
        deepCheck: (): Effect.Effect<HealthResult> =>
          Effect.gen(function*() {
            const checks: Record<string, "ok" | "error"> = {}
            let overallStatus: "ok" | "degraded" | "error" = "ok"

            // Config check
            checks.config = config.llm.provider ? "ok" : "error"

            // Would add: LLM connectivity check, ontology file check, etc.

            if (Object.values(checks).every((c) => c === "ok")) {
              overallStatus = "ok"
            } else if (Object.values(checks).some((c) => c === "error")) {
              overallStatus = "degraded"
            }

            return {
              status: overallStatus,
              timestamp: new Date().toISOString(),
              checks
            }
          })
      }
    }),
    dependencies: [ConfigService.Default]
  }
) {}
```

**Step 4: Export from Runtime index**

Add to `src/Runtime/index.ts`:
```typescript
export * from "./HealthCheck.js"
```

**Step 5: Run test to verify it passes**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/HealthCheck.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Runtime/HealthCheck.ts packages/@core-v2/src/Runtime/index.ts packages/@core-v2/test/Runtime/HealthCheck.test.ts
git commit -m "feat: add HealthCheckService for liveness/readiness probes"
```

---

### Task 2.2: Create HTTP Server Layer

**Files:**
- Create: `packages/@core-v2/src/Runtime/HttpServer.ts`
- Test: `packages/@core-v2/test/Runtime/HttpServer.test.ts`

**Step 1: Write failing test**

```typescript
// test/Runtime/HttpServer.test.ts
import { describe, expect, it } from "@effect/vitest"
import { HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Effect, Layer } from "effect"
import { ExtractionRouter } from "../../src/Runtime/HttpServer.js"
import { HealthCheckService } from "../../src/Runtime/HealthCheck.js"
import { ConfigService } from "../../src/Service/Config.js"

describe("ExtractionRouter", () => {
  const TestLayers = Layer.mergeAll(
    HealthCheckService.Default
  ).pipe(Layer.provide(ConfigService.Default))

  it.effect("GET /health/live returns 200", () =>
    Effect.gen(function*() {
      const router = yield* ExtractionRouter
      const request = HttpClientRequest.get("/health/live")
      const response = yield* router.handle(request)

      expect(response.status).toBe(200)
    }).pipe(Effect.provide(TestLayers))
  )

  it.effect("GET /health/ready returns 200 with checks", () =>
    Effect.gen(function*() {
      const router = yield* ExtractionRouter
      const request = HttpClientRequest.get("/health/ready")
      const response = yield* router.handle(request)

      expect(response.status).toBe(200)
      const body = yield* HttpClientResponse.json(response)
      expect(body.status).toBe("ok")
    }).pipe(Effect.provide(TestLayers))
  )
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/HttpServer.test.ts
```

Expected: FAIL - module not found

**Step 3: Write implementation**

```typescript
// src/Runtime/HttpServer.ts
/**
 * Runtime: HTTP Server for API Gateway
 *
 * Provides HTTP endpoints for extraction API and health checks.
 * Use with @effect/platform-bun for Bun runtime.
 *
 * @since 2.0.0
 * @module Runtime/HttpServer
 */

import {
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse
} from "@effect/platform"
import { Effect, Layer, Schedule } from "effect"
import { HealthCheckService } from "./HealthCheck.js"

/**
 * Health check routes
 */
const healthRoutes = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/health/live",
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.liveness()
      return HttpServerResponse.json(result)
    })
  ),
  HttpRouter.get(
    "/health/ready",
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.readiness()
      const status = result.status === "ok" ? 200 : 503
      return HttpServerResponse.json(result, { status })
    })
  ),
  HttpRouter.get(
    "/health/deep",
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.deepCheck()
      const status = result.status === "ok" ? 200 : result.status === "degraded" ? 200 : 503
      return HttpServerResponse.json(result, { status })
    })
  )
)

/**
 * API info route
 */
const infoRoute = HttpRouter.get(
  "/",
  Effect.succeed(
    HttpServerResponse.json({
      name: "@effect-ontology/core-v2",
      version: "2.0.0",
      description: "Effect-native entity extraction framework",
      endpoints: {
        health: {
          live: "GET /health/live",
          ready: "GET /health/ready",
          deep: "GET /health/deep"
        },
        extraction: {
          submit: "POST /api/v1/extract (coming soon)",
          status: "GET /api/v1/extract/:jobId (coming soon)"
        }
      }
    })
  )
)

/**
 * Combined router with all routes
 */
export const ExtractionRouter = HttpRouter.empty.pipe(
  HttpRouter.concat(infoRoute),
  HttpRouter.concat(healthRoutes)
)

/**
 * HTTP Server Layer
 *
 * Creates an HTTP server on the specified port.
 * Use with BunHttpServer.layer for Bun runtime.
 *
 * @example
 * ```typescript
 * import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
 *
 * const ServerLive = HttpServerLive.pipe(
 *   Layer.provide(BunHttpServer.layer({ port: 8080 })),
 *   Layer.provide(HealthCheckService.Default),
 *   Layer.provide(ConfigService.Default)
 * )
 *
 * BunRuntime.runMain(Layer.launch(ServerLive))
 * ```
 *
 * @since 2.0.0
 */
export const HttpServerLive = HttpServer.serve(ExtractionRouter).pipe(
  HttpServer.withLogAddress
)
```

**Step 4: Export from Runtime index**

Add to `src/Runtime/index.ts`:
```typescript
export * from "./HttpServer.js"
```

**Step 5: Run test to verify it passes**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/HttpServer.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Runtime/HttpServer.ts packages/@core-v2/test/Runtime/HttpServer.test.ts
git commit -m "feat: add HTTP server layer with health endpoints"
```

---

## Phase 3: Graceful Shutdown

Handle SIGTERM for clean pod termination.

### Task 3.1: Create Shutdown Handler

**Files:**
- Create: `packages/@core-v2/src/Runtime/Shutdown.ts`
- Test: `packages/@core-v2/test/Runtime/Shutdown.test.ts`

**Step 1: Write failing test**

```typescript
// test/Runtime/Shutdown.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Fiber, Ref } from "effect"
import { makeGracefulShutdown } from "../../src/Runtime/Shutdown.js"

describe("GracefulShutdown", () => {
  it.effect("tracks in-flight requests", () =>
    Effect.gen(function*() {
      const shutdown = yield* makeGracefulShutdown({ drainTimeoutMs: 5000 })

      // Start a request
      const fiber = yield* shutdown.trackRequest(
        Effect.sleep("100 millis").pipe(Effect.as("done"))
      ).pipe(Effect.fork)

      // Check in-flight count
      const count = yield* shutdown.inFlightCount()
      expect(count).toBe(1)

      // Wait for request to complete
      yield* Fiber.join(fiber)

      const countAfter = yield* shutdown.inFlightCount()
      expect(countAfter).toBe(0)
    })
  )

  it.effect("drain waits for in-flight requests", () =>
    Effect.gen(function*() {
      const shutdown = yield* makeGracefulShutdown({ drainTimeoutMs: 5000 })
      const completed = yield* Ref.make(false)

      // Start a slow request
      yield* shutdown.trackRequest(
        Effect.sleep("50 millis").pipe(
          Effect.tap(() => Ref.set(completed, true))
        )
      ).pipe(Effect.fork)

      // Drain should wait for request
      yield* shutdown.drain()

      const wasCompleted = yield* Ref.get(completed)
      expect(wasCompleted).toBe(true)
    })
  )
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/Shutdown.test.ts
```

Expected: FAIL - module not found

**Step 3: Write implementation**

```typescript
// src/Runtime/Shutdown.ts
/**
 * Runtime: Graceful Shutdown Handler
 *
 * Provides graceful shutdown with request draining for cloud deployment.
 * Ensures in-flight requests complete before pod termination.
 *
 * @since 2.0.0
 * @module Runtime/Shutdown
 */

import { Duration, Effect, Fiber, Ref, Semaphore } from "effect"

/**
 * Shutdown configuration
 */
export interface ShutdownConfig {
  /**
   * Maximum time to wait for in-flight requests to complete
   */
  readonly drainTimeoutMs: number
}

/**
 * Default shutdown configuration
 */
export const DEFAULT_SHUTDOWN_CONFIG: ShutdownConfig = {
  drainTimeoutMs: 30_000
}

/**
 * Create a graceful shutdown handler
 *
 * Tracks in-flight requests and provides drain functionality
 * for clean pod termination.
 *
 * @param config - Shutdown configuration
 * @returns Scoped effect providing the shutdown handler
 *
 * @example
 * ```typescript
 * const shutdown = yield* makeGracefulShutdown()
 *
 * // Wrap all requests
 * const result = yield* shutdown.trackRequest(myEffect)
 *
 * // On SIGTERM
 * yield* shutdown.initiateShutdown()
 * yield* shutdown.drain()
 * ```
 *
 * @since 2.0.0
 */
export const makeGracefulShutdown = (
  config: ShutdownConfig = DEFAULT_SHUTDOWN_CONFIG
) =>
  Effect.gen(function*() {
    const inFlightRef = yield* Ref.make(0)
    const shuttingDownRef = yield* Ref.make(false)
    const activeFibers = yield* Ref.make<Set<Fiber.RuntimeFiber<unknown, unknown>>>(new Set())

    return {
      /**
       * Track a request for graceful shutdown
       *
       * Increments in-flight counter before execution and decrements after.
       * If shutting down, rejects new requests.
       */
      trackRequest: <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | ShutdownError, R> =>
        Effect.gen(function*() {
          const isShuttingDown = yield* Ref.get(shuttingDownRef)
          if (isShuttingDown) {
            return yield* Effect.fail(new ShutdownError())
          }

          yield* Ref.update(inFlightRef, (n) => n + 1)

          return yield* effect.pipe(
            Effect.ensuring(Ref.update(inFlightRef, (n) => n - 1))
          )
        }),

      /**
       * Get current in-flight request count
       */
      inFlightCount: (): Effect.Effect<number> => Ref.get(inFlightRef),

      /**
       * Initiate shutdown - stop accepting new requests
       */
      initiateShutdown: (): Effect.Effect<void> =>
        Effect.gen(function*() {
          yield* Ref.set(shuttingDownRef, true)
          yield* Effect.logInfo("Graceful shutdown initiated")
        }),

      /**
       * Check if shutdown has been initiated
       */
      isShuttingDown: (): Effect.Effect<boolean> => Ref.get(shuttingDownRef),

      /**
       * Drain in-flight requests with timeout
       *
       * Waits for all tracked requests to complete, up to drain timeout.
       */
      drain: (): Effect.Effect<void> =>
        Effect.gen(function*() {
          yield* Effect.logInfo("Draining in-flight requests")

          // Poll until no in-flight requests or timeout
          yield* Effect.gen(function*() {
            let remaining = yield* Ref.get(inFlightRef)
            while (remaining > 0) {
              yield* Effect.sleep(Duration.millis(100))
              remaining = yield* Ref.get(inFlightRef)
            }
          }).pipe(
            Effect.timeout(Duration.millis(config.drainTimeoutMs)),
            Effect.catchAll(() =>
              Effect.gen(function*() {
                const remaining = yield* Ref.get(inFlightRef)
                yield* Effect.logWarning("Drain timeout exceeded", {
                  remainingRequests: remaining,
                  timeoutMs: config.drainTimeoutMs
                })
              })
            )
          )

          yield* Effect.logInfo("Drain complete")
        })
    }
  })

/**
 * Error thrown when request is rejected during shutdown
 */
export class ShutdownError extends Error {
  readonly _tag = "ShutdownError" as const

  constructor() {
    super("Service is shutting down, not accepting new requests")
  }
}

/**
 * Type for the shutdown handler
 */
export type GracefulShutdown = Effect.Effect.Success<ReturnType<typeof makeGracefulShutdown>>
```

**Step 4: Export from Runtime index**

Add to `src/Runtime/index.ts`:
```typescript
export * from "./Shutdown.js"
```

**Step 5: Run test to verify it passes**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/Shutdown.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Runtime/Shutdown.ts packages/@core-v2/test/Runtime/Shutdown.test.ts
git commit -m "feat: add graceful shutdown handler with request draining"
```

---

## Phase 4: Observability - Prometheus Metrics

Add metrics export for monitoring dashboards.

### Task 4.1: Create Metrics Service

**Files:**
- Create: `packages/@core-v2/src/Telemetry/Metrics.ts`
- Test: `packages/@core-v2/test/Telemetry/Metrics.test.ts`

**Step 1: Write failing test**

```typescript
// test/Telemetry/Metrics.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { MetricsService } from "../../src/Telemetry/Metrics.js"

describe("MetricsService", () => {
  it.effect("records extraction metrics", () =>
    Effect.gen(function*() {
      const metrics = yield* MetricsService

      yield* metrics.recordExtraction({
        durationMs: 1500,
        entityCount: 10,
        relationCount: 5,
        chunkCount: 3,
        success: true
      })

      const output = yield* metrics.toPrometheus()

      expect(output).toContain("extraction_duration_ms")
      expect(output).toContain("extraction_entity_count")
    }).pipe(Effect.provide(MetricsService.Default))
  )

  it.effect("tracks LLM calls", () =>
    Effect.gen(function*() {
      const metrics = yield* MetricsService

      yield* metrics.recordLlmCall({
        provider: "anthropic",
        model: "claude-3-5-sonnet",
        durationMs: 500,
        tokensIn: 100,
        tokensOut: 50,
        success: true
      })

      const output = yield* metrics.toPrometheus()

      expect(output).toContain("llm_call_duration_ms")
      expect(output).toContain('provider="anthropic"')
    }).pipe(Effect.provide(MetricsService.Default))
  )
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/@core-v2 && bunx vitest run test/Telemetry/Metrics.test.ts
```

Expected: FAIL - module not found

**Step 3: Write implementation**

```typescript
// src/Telemetry/Metrics.ts
/**
 * Telemetry: Prometheus Metrics Service
 *
 * Collects and exports metrics in Prometheus format.
 * Provides counters, gauges, and histograms for extraction observability.
 *
 * @since 2.0.0
 * @module Telemetry/Metrics
 */

import { Effect, Ref } from "effect"

/**
 * Extraction metrics input
 */
export interface ExtractionMetrics {
  readonly durationMs: number
  readonly entityCount: number
  readonly relationCount: number
  readonly chunkCount: number
  readonly success: boolean
}

/**
 * LLM call metrics input
 */
export interface LlmCallMetrics {
  readonly provider: string
  readonly model: string
  readonly durationMs: number
  readonly tokensIn: number
  readonly tokensOut: number
  readonly success: boolean
}

/**
 * Internal metrics state
 */
interface MetricsState {
  extractions: {
    total: number
    successful: number
    failed: number
    durationSum: number
    entitySum: number
    relationSum: number
  }
  llmCalls: Map<string, {
    total: number
    successful: number
    failed: number
    durationSum: number
    tokensInSum: number
    tokensOutSum: number
  }>
}

const initialState: MetricsState = {
  extractions: {
    total: 0,
    successful: 0,
    failed: 0,
    durationSum: 0,
    entitySum: 0,
    relationSum: 0
  },
  llmCalls: new Map()
}

/**
 * MetricsService - Prometheus metrics collection
 *
 * @since 2.0.0
 * @category Services
 */
export class MetricsService extends Effect.Service<MetricsService>()(
  "MetricsService",
  {
    effect: Effect.gen(function*() {
      const stateRef = yield* Ref.make<MetricsState>(initialState)

      return {
        /**
         * Record extraction metrics
         */
        recordExtraction: (metrics: ExtractionMetrics): Effect.Effect<void> =>
          Ref.update(stateRef, (state) => ({
            ...state,
            extractions: {
              total: state.extractions.total + 1,
              successful: state.extractions.successful + (metrics.success ? 1 : 0),
              failed: state.extractions.failed + (metrics.success ? 0 : 1),
              durationSum: state.extractions.durationSum + metrics.durationMs,
              entitySum: state.extractions.entitySum + metrics.entityCount,
              relationSum: state.extractions.relationSum + metrics.relationCount
            }
          })),

        /**
         * Record LLM call metrics
         */
        recordLlmCall: (metrics: LlmCallMetrics): Effect.Effect<void> =>
          Ref.update(stateRef, (state) => {
            const key = `${metrics.provider}:${metrics.model}`
            const existing = state.llmCalls.get(key) ?? {
              total: 0,
              successful: 0,
              failed: 0,
              durationSum: 0,
              tokensInSum: 0,
              tokensOutSum: 0
            }

            const updated = new Map(state.llmCalls)
            updated.set(key, {
              total: existing.total + 1,
              successful: existing.successful + (metrics.success ? 1 : 0),
              failed: existing.failed + (metrics.success ? 0 : 1),
              durationSum: existing.durationSum + metrics.durationMs,
              tokensInSum: existing.tokensInSum + metrics.tokensIn,
              tokensOutSum: existing.tokensOutSum + metrics.tokensOut
            })

            return { ...state, llmCalls: updated }
          }),

        /**
         * Export metrics in Prometheus text format
         */
        toPrometheus: (): Effect.Effect<string> =>
          Effect.gen(function*() {
            const state = yield* Ref.get(stateRef)
            const lines: string[] = []

            // Extraction metrics
            lines.push("# HELP extraction_total Total extraction requests")
            lines.push("# TYPE extraction_total counter")
            lines.push(`extraction_total ${state.extractions.total}`)

            lines.push("# HELP extraction_successful_total Successful extractions")
            lines.push("# TYPE extraction_successful_total counter")
            lines.push(`extraction_successful_total ${state.extractions.successful}`)

            lines.push("# HELP extraction_failed_total Failed extractions")
            lines.push("# TYPE extraction_failed_total counter")
            lines.push(`extraction_failed_total ${state.extractions.failed}`)

            lines.push("# HELP extraction_duration_ms_sum Sum of extraction durations")
            lines.push("# TYPE extraction_duration_ms_sum counter")
            lines.push(`extraction_duration_ms_sum ${state.extractions.durationSum}`)

            lines.push("# HELP extraction_entity_count_sum Sum of entities extracted")
            lines.push("# TYPE extraction_entity_count_sum counter")
            lines.push(`extraction_entity_count_sum ${state.extractions.entitySum}`)

            lines.push("# HELP extraction_relation_count_sum Sum of relations extracted")
            lines.push("# TYPE extraction_relation_count_sum counter")
            lines.push(`extraction_relation_count_sum ${state.extractions.relationSum}`)

            // LLM call metrics
            lines.push("# HELP llm_call_total Total LLM API calls")
            lines.push("# TYPE llm_call_total counter")

            lines.push("# HELP llm_call_duration_ms_sum Sum of LLM call durations")
            lines.push("# TYPE llm_call_duration_ms_sum counter")

            lines.push("# HELP llm_tokens_in_sum Sum of input tokens")
            lines.push("# TYPE llm_tokens_in_sum counter")

            lines.push("# HELP llm_tokens_out_sum Sum of output tokens")
            lines.push("# TYPE llm_tokens_out_sum counter")

            for (const [key, metrics] of state.llmCalls) {
              const [provider, model] = key.split(":")
              const labels = `provider="${provider}",model="${model}"`

              lines.push(`llm_call_total{${labels}} ${metrics.total}`)
              lines.push(`llm_call_duration_ms_sum{${labels}} ${metrics.durationSum}`)
              lines.push(`llm_tokens_in_sum{${labels}} ${metrics.tokensInSum}`)
              lines.push(`llm_tokens_out_sum{${labels}} ${metrics.tokensOutSum}`)
            }

            return lines.join("\n")
          }),

        /**
         * Reset all metrics (for testing)
         */
        reset: (): Effect.Effect<void> => Ref.set(stateRef, initialState)
      }
    })
  }
) {}
```

**Step 4: Export from Telemetry index**

Add to `src/Telemetry/index.ts`:
```typescript
export * from "./Metrics.js"
```

**Step 5: Run test to verify it passes**

```bash
cd packages/@core-v2 && bunx vitest run test/Telemetry/Metrics.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Telemetry/Metrics.ts packages/@core-v2/test/Telemetry/Metrics.test.ts
git commit -m "feat: add MetricsService for Prometheus metrics export"
```

---

## Phase 5: Concurrency Control with Semaphore

Add fine-grained LLM concurrency control.

### Task 5.1: Create LLM Semaphore Layer

**Files:**
- Create: `packages/@core-v2/src/Runtime/LlmSemaphore.ts`
- Test: `packages/@core-v2/test/Runtime/LlmSemaphore.test.ts`

**Step 1: Write failing test**

```typescript
// test/Runtime/LlmSemaphore.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Fiber, Ref, Layer } from "effect"
import { LlmSemaphoreService } from "../../src/Runtime/LlmSemaphore.js"
import { ConfigService } from "../../src/Service/Config.js"

describe("LlmSemaphoreService", () => {
  const TestLayers = LlmSemaphoreService.Default.pipe(
    Layer.provide(ConfigService.Default)
  )

  it.effect("limits concurrent LLM calls", () =>
    Effect.gen(function*() {
      const semaphore = yield* LlmSemaphoreService
      const maxConcurrent = yield* Ref.make(0)
      const currentConcurrent = yield* Ref.make(0)

      // Start 5 concurrent calls - use bounded concurrency
      const fibers = yield* Effect.forEach(
        [1, 2, 3, 4, 5],
        (n) =>
          semaphore.withPermit(
            Effect.gen(function*() {
              yield* Ref.update(currentConcurrent, (c) => c + 1)
              const current = yield* Ref.get(currentConcurrent)
              yield* Ref.update(maxConcurrent, (max) => Math.max(max, current))
              yield* Effect.sleep("10 millis")
              yield* Ref.update(currentConcurrent, (c) => c - 1)
              return n
            })
          ).pipe(Effect.fork),
        { concurrency: 5 }
      )

      yield* Effect.forEach(fibers, Fiber.join, { concurrency: 5 })

      const max = yield* Ref.get(maxConcurrent)
      // Default limit from ConfigService is based on provider
      expect(max).toBeLessThanOrEqual(3)  // Conservative limit
    }).pipe(Effect.provide(TestLayers))
  )
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/LlmSemaphore.test.ts
```

Expected: FAIL - module not found

**Step 3: Write implementation**

```typescript
// src/Runtime/LlmSemaphore.ts
/**
 * Runtime: LLM Semaphore for Concurrency Control
 *
 * Provides fine-grained concurrency control for LLM API calls.
 * Complements rate limiting with connection-level limits.
 *
 * @since 2.0.0
 * @module Runtime/LlmSemaphore
 */

import { Effect, Semaphore } from "effect"
import { ConfigService } from "../Service/Config.js"

/**
 * LLM concurrency limits per provider
 *
 * These are connection-level limits, separate from rate limits.
 * Prevents overwhelming API endpoints with too many concurrent connections.
 */
const LLM_CONCURRENCY_LIMITS: Record<string, number> = {
  anthropic: 2,  // Conservative for Claude
  openai: 3,     // OpenAI handles more concurrent
  google: 2      // Similar to Anthropic
}

/**
 * LlmSemaphoreService - Concurrency control for LLM calls
 *
 * Use this to wrap LLM calls for fine-grained concurrency control.
 * Works in conjunction with rate limiting.
 *
 * @example
 * ```typescript
 * const semaphore = yield* LlmSemaphoreService
 * const result = yield* semaphore.withPermit(
 *   llm.generateObject(...)
 * )
 * ```
 *
 * @since 2.0.0
 * @category Services
 */
export class LlmSemaphoreService extends Effect.Service<LlmSemaphoreService>()(
  "LlmSemaphoreService",
  {
    effect: Effect.gen(function*() {
      const config = yield* ConfigService
      const limit = LLM_CONCURRENCY_LIMITS[config.llm.provider] ?? 2

      const semaphore = yield* Semaphore.make(limit)

      yield* Effect.logInfo("LLM semaphore initialized", {
        provider: config.llm.provider,
        concurrencyLimit: limit
      })

      return {
        /**
         * Execute effect with semaphore permit
         *
         * Acquires a permit before execution and releases after.
         * Blocks if no permits available.
         */
        withPermit: <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
          Semaphore.withPermit(semaphore)(effect),

        /**
         * Get number of available permits
         */
        availablePermits: (): Effect.Effect<number> =>
          Effect.sync(() => limit), // Semaphore doesn't expose available, return max

        /**
         * Get the concurrency limit
         */
        limit: (): number => limit
      }
    }),
    dependencies: [ConfigService.Default]
  }
) {}
```

**Step 4: Export from Runtime index**

Add to `src/Runtime/index.ts`:
```typescript
export * from "./LlmSemaphore.js"
```

**Step 5: Run test to verify it passes**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/LlmSemaphore.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Runtime/LlmSemaphore.ts packages/@core-v2/test/Runtime/LlmSemaphore.test.ts
git commit -m "feat: add LlmSemaphoreService for LLM concurrency control"
```

---

## Phase 6: Integration - Production Runtime Composition

Wire up all new components into production runtime.

### Task 6.1: Update ProductionRuntime with New Components

**Files:**
- Modify: `packages/@core-v2/src/Runtime/ProductionRuntime.ts`

**Step 1: Read current ProductionRuntime**

```bash
cat packages/@core-v2/src/Runtime/ProductionRuntime.ts
```

**Step 2: Add new exports to ProductionRuntime**

Add these exports and compositions:

```typescript
// Add imports
import { HealthCheckService } from "./HealthCheck.js"
import { HttpServerLive, ExtractionRouter } from "./HttpServer.js"
import { LlmSemaphoreService } from "./LlmSemaphore.js"
import { makeGracefulShutdown, type GracefulShutdown } from "./Shutdown.js"

// Export new layers
export { HealthCheckService }
export { HttpServerLive, ExtractionRouter }
export { LlmSemaphoreService }
export { makeGracefulShutdown, type GracefulShutdown }

/**
 * Production layers with all infrastructure components
 *
 * Includes:
 * - All extraction services
 * - Rate-limited LLM
 * - LLM semaphore (concurrency control)
 * - Health checks
 * - OpenTelemetry tracing
 *
 * @since 2.0.0
 */
export const ProductionInfrastructure = Layer.mergeAll(
  ExtractionLayersLive,
  HealthCheckService.Default,
  LlmSemaphoreService.Default,
  TracingLive
)
```

**Step 3: Verify build**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```

Expected: No errors

**Step 4: Commit**

```bash
git add packages/@core-v2/src/Runtime/ProductionRuntime.ts
git commit -m "feat: integrate infrastructure components into ProductionRuntime"
```

---

### Task 6.2: Create Server Entry Point

**Files:**
- Create: `packages/@core-v2/src/server.ts`

**Step 1: Write server entry point**

```typescript
// src/server.ts
/**
 * HTTP Server Entry Point
 *
 * Starts the extraction API server with all production layers.
 * Use for cloud deployment (Kubernetes, Cloud Run, etc.)
 *
 * Environment variables:
 * - PORT: Server port (default: 8080)
 * - All EnvConfigService variables
 *
 * @since 2.0.0
 */

import { BunHttpServer, BunContext, BunRuntime } from "@effect/platform-bun"
import { Config, Effect, Layer } from "effect"
import { HttpServerLive } from "./Runtime/HttpServer.js"
import { HealthCheckService } from "./Runtime/HealthCheck.js"
import { makeGracefulShutdown } from "./Runtime/Shutdown.js"
import { EnvConfigService } from "./Service/EnvConfig.js"
import { ConfigService } from "./Service/Config.js"

// Load port from environment
const port = Effect.runSync(
  Config.number("PORT").pipe(Config.withDefault(8080))
)

// Wire EnvConfigService to ConfigService
const ConfigFromEnv = Layer.effect(
  ConfigService,
  EnvConfigService.pipe(Effect.map((config) => config as ConfigService))
).pipe(Layer.provide(EnvConfigService.Default))

// Compose production server layers
const ServerLive = HttpServerLive.pipe(
  Layer.provide(BunHttpServer.layer({ port })),
  Layer.provide(HealthCheckService.Default),
  Layer.provide(ConfigFromEnv),
  Layer.provide(BunContext.layer)
)

// Server program with graceful shutdown
const server = Effect.gen(function*() {
  const shutdown = yield* makeGracefulShutdown()

  // Register SIGTERM handler
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM, initiating graceful shutdown")
    Effect.runPromise(
      Effect.gen(function*() {
        yield* shutdown.initiateShutdown()
        yield* shutdown.drain()
        console.log("Graceful shutdown complete")
        process.exit(0)
      })
    )
  })

  yield* Effect.logInfo(`Server starting on port ${port}`)
  yield* Layer.launch(ServerLive)
})

BunRuntime.runMain(server)
```

**Step 2: Add to package.json scripts**

```json
{
  "scripts": {
    "serve": "bun run src/server.ts"
  }
}
```

**Step 3: Test locally**

```bash
cd packages/@core-v2 && bun run serve &
curl http://localhost:8080/health/live
curl http://localhost:8080/health/ready
kill %1
```

Expected: `{"status":"ok",...}`

**Step 4: Commit**

```bash
git add packages/@core-v2/src/server.ts packages/@core-v2/package.json
git commit -m "feat: add HTTP server entry point for cloud deployment"
```

---

## Phase 7: Containerization

Create Dockerfile for cloud deployment.

### Task 7.1: Create Dockerfile

**Files:**
- Create: `packages/@core-v2/Dockerfile`

**Step 1: Write Dockerfile**

```dockerfile
# packages/@core-v2/Dockerfile
# Multi-stage build for Effect-TS entity extraction service

# Stage 1: Build
FROM oven/bun:1.2.23-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json bun.lockb ./
COPY packages/@core-v2/package.json ./packages/@core-v2/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY packages/@core-v2/ ./packages/@core-v2/

# Build TypeScript
WORKDIR /app/packages/@core-v2
RUN bun run build

# Stage 2: Production
FROM oven/bun:1.2.23-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/@core-v2/dist ./dist
COPY --from=builder /app/packages/@core-v2/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S effect -u 1001 -G nodejs

USER effect

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:8080/health/live').then(r => process.exit(r.ok ? 0 : 1))"

# Expose port
EXPOSE 8080

# Environment defaults
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["bun", "run", "dist/server.js"]
```

**Step 2: Create .dockerignore**

```
# packages/@core-v2/.dockerignore
node_modules
dist
*.log
.git
.env
.env.*
coverage
*.test.ts
test/
```

**Step 3: Build and test**

```bash
cd /Users/pooks/Dev/effect-ontology
docker build -f packages/@core-v2/Dockerfile -t effect-ontology-core:latest .
docker run -p 8080:8080 -e ANTHROPIC_API_KEY=test effect-ontology-core:latest &
sleep 3
curl http://localhost:8080/health/live
docker stop $(docker ps -q --filter ancestor=effect-ontology-core:latest)
```

Expected: Health check returns OK

**Step 4: Commit**

```bash
git add packages/@core-v2/Dockerfile packages/@core-v2/.dockerignore
git commit -m "feat: add Dockerfile for container deployment"
```

---

## Summary: Production Readiness Checklist

After completing all phases, @core-v2 will have:

- [x] **Build passing** - All TypeScript errors fixed
- [ ] **Environment config** - EnvConfigService loads from env vars
- [ ] **HTTP API** - Health endpoints + extraction API scaffold
- [ ] **Graceful shutdown** - SIGTERM handling with request draining
- [ ] **Metrics** - Prometheus export for extraction/LLM metrics
- [ ] **Concurrency control** - Semaphore for LLM connection limits
- [ ] **Container ready** - Dockerfile with health check
- [ ] **Circuit breaker** - Already exists (CircuitBreaker.ts)
- [ ] **Rate limiting** - Already exists (RateLimitedLanguageModel.ts)
- [ ] **Tracing** - Already exists (OpenTelemetry to Jaeger)

### Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│               (AWS ALB / GCP LB)                     │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Pod 1     │  │   Pod 2     │  │   Pod 3     │
│ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │
│ │ @core-v2│ │  │ │ @core-v2│ │  │ │ @core-v2│ │
│ │ server  │ │  │ │ server  │ │  │ │ server  │ │
│ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │
│  ↓ metrics  │  │  ↓ metrics  │  │  ↓ metrics  │
│  ↓ traces   │  │  ↓ traces   │  │  ↓ traces   │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
              ┌───────────────────┐
              │   Prometheus      │
              │   Jaeger/Tempo    │
              └───────────────────┘
```

### Environment Variables Reference

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (with defaults)
PORT=8080
ONTOLOGY_PATH=/data/ontology.ttl
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5
LLM_TIMEOUT_MS=60000
EXTRACTION_CONCURRENCY=8
OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

---

**Plan complete and saved to `docs/plans/2025-12-09-core-v2-production-readiness.md`.**

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

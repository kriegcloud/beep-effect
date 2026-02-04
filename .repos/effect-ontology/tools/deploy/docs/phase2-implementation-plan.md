# Deploy CLI Phase 2: Refinements Implementation Plan

Based on [deploy-cli-refinements.md](./deploy-cli-refinements.md) analysis and Effect best practices for error handling.

---

## Architectural Foundation: Cause & Exit for Clean Error Contracts

### Why Cause & Exit Matter

Effect's `Cause<E>` captures the **full error context**:
- **Fail**: Expected errors (typed `E`)
- **Die**: Unexpected defects (uncaught exceptions)
- **Interrupt**: Fiber interruptions
- **Sequential/Parallel**: Combined causes from composed effects

Using these properly gives us:
1. **Predictable error contracts** - Commands explicitly declare their error types
2. **Clean output** - `Cause.pretty` for human-readable errors
3. **Full context** - Stack traces, nested causes, stderr captured
4. **Pattern matching** - Handle different failure modes distinctly

### Current Problem

```typescript
// TerraformError captures stderr but doesn't surface it well
new TerraformError({
  message: `terraform apply failed with exit code ${exitCode}`,
  command: cmdString,
  exitCode,
  stderr  // ← This exists but isn't shown to user!
})
```

### Solution Architecture

```typescript
// 1. Use Schema.TaggedError with cause chain
export class TerraformError extends Schema.TaggedError<TerraformError>()(
  "TerraformError",
  {
    message: Schema.String,
    command: Schema.String,
    exitCode: Schema.Number,
    stderr: Schema.optional(Schema.String),
    cause: Schema.optional(Schema.Unknown)
  },
  // Enable pretty printing with cause chain
  { hasResult: true }
) {
  // Pretty print for CLI output
  toDisplayString(): string {
    const lines = [`✗ ${this.message}`]
    if (this.stderr) {
      lines.push(`  └─ ${this.stderr.slice(0, 500)}`)
    }
    return lines.join('\n')
  }
}

// 2. Exit-aware command execution
const runCommand = (cmd: string) => 
  Effect.gen(function* () {
    // ... run command
  }).pipe(
    // Convert to Exit for inspection
    Effect.exit,
    Effect.flatMap((exit) =>
      Exit.match(exit, {
        onSuccess: (result) => Effect.succeed(result),
        onFailure: (cause) => {
          // Pretty print the cause for CLI output
          yield* Console.error(Cause.pretty(cause))
          return Effect.failCause(cause)
        }
      })
    )
  )

// 3. Command contracts with explicit error types
type InitCommand = Effect<void, TerraformError | ConfigError>
type PlanCommand = Effect<PlanResult, TerraformError | ConfigError>
type ApplyCommand = Effect<ApplyResult, TerraformError | HealthCheckError>
```

---

## Phase 2.1: Error Visibility (Priority 1) - Immediate

### 2.1.1 Enhanced Error Display Module

Create a dedicated error formatting module:

```typescript
// src/Errors/Display.ts
import { Cause, Effect, Exit, Match } from "effect"

/**
 * Format any deploy error for CLI display
 */
export const formatError = <E extends { _tag: string }>(cause: Cause.Cause<E>): string =>
  Cause.match(cause, {
    onEmpty: "No error",
    onFail: (error) => formatTaggedError(error),
    onDie: (defect) => `Unexpected error: ${String(defect)}`,
    onInterrupt: (fiberId) => `Operation interrupted (fiber: ${fiberId})`,
    onSequential: (left, right) => `${left}\n${right}`,
    onParallel: (left, right) => `${left}\n${right}`
  })

/**
 * Pretty print tagged errors based on their _tag
 */
const formatTaggedError = Match.type<DeployError>().pipe(
  Match.tag("TerraformError", (e) => [
    `✗ Terraform ${e.command} failed (exit ${e.exitCode})`,
    e.stderr ? `  └─ ${truncate(e.stderr, 500)}` : null,
    e.cause ? `  └─ Cause: ${String(e.cause)}` : null
  ].filter(Boolean).join('\n')),
  
  Match.tag("DockerError", (e) => [
    `✗ Docker ${e.command} failed (exit ${e.exitCode})`,
    e.stderr ? `  └─ ${truncate(e.stderr, 300)}` : null
  ].filter(Boolean).join('\n')),
  
  Match.tag("HealthCheckError", (e) => [
    `✗ Health check failed: ${e.url}`,
    `  └─ Expected: ${e.expected}, Got: ${e.actual}`,
    `  └─ Logs: ${e.logsUrl}`
  ].filter(Boolean).join('\n')),
  
  Match.orElse((e) => `✗ ${e._tag}: ${JSON.stringify(e)}`)
)
```

### 2.1.2 CLI Error Handler Wrapper

Wrap all commands with consistent error handling:

```typescript
// src/Cli/ErrorHandler.ts
export const withErrorHandler = <A, E extends DeployError>(
  effect: Effect.Effect<A, E, DeployContext>
): Effect.Effect<A, never, DeployContext> =>
  effect.pipe(
    Effect.tapErrorCause((cause) =>
      Console.error(formatError(cause))
    ),
    Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        // Log full cause for debugging
        yield* Effect.logError("Command failed", { cause: Cause.pretty(cause) })
        
        // Exit with appropriate code
        const exitCode = Cause.match(cause, {
          onEmpty: 0,
          onFail: (e) => e._tag === "TerraformError" ? e.exitCode : 1,
          onDie: () => 2,
          onInterrupt: () => 130,
          onSequential: () => 1,
          onParallel: () => 1
        })
        
        return yield* Effect.die(new ProcessExit(exitCode))
      })
    )
  )
```

### 2.1.3 Update TerraformRunner Stderr Surfacing

```typescript
// In TerraformRunner.ts
const runCommand = (subcommand: string, args: ReadonlyArray<string>, opts: TerraformOptions) =>
  Effect.gen(function* () {
    // ... existing code ...
    
    if (exitCode !== 0) {
      // Include stderr in error AND in cause chain
      return yield* Effect.fail(
        new TerraformError({
          message: `terraform ${subcommand} failed with exit code ${exitCode}`,
          command: cmdString,
          exitCode,
          stderr: stderr.trim() || undefined,
          // Annotate with helpful context
          cause: stderr.includes("state lock") 
            ? "Another terraform process may be running"
            : stderr.includes("PORT=8080")
            ? "Container failed to start - check Cloud Run logs"
            : undefined
        })
      )
    }
  })
```

### 2.1.4 Verbose Flag for Streaming Output

```typescript
// Add to cli.ts
const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDefault(false),
  Options.withDescription("Show full terraform output")
)

// In plan command
const planCommand = Command.make(
  "plan",
  { env: envOption, verbose: verboseOption },
  ({ env, verbose }) =>
    Effect.gen(function* () {
      if (verbose) {
        // Use inherited stdout/stderr for real-time output
        yield* tf.planInteractive(opts)
      } else {
        // Capture and summarize
        const result = yield* tf.plan(opts)
        yield* Console.log(summarizePlan(result.stdout))
      }
    })
)
```

---

## Phase 2.2: Health Verification (Priority 1)

### 2.2.1 HealthCheckError Type

```typescript
// src/Domain/Error.ts
export class HealthCheckError extends Schema.TaggedError<HealthCheckError>()(
  "HealthCheckError",
  {
    message: Schema.String,
    url: Schema.String,
    expected: Schema.Number,
    actual: Schema.optional(Schema.Number),
    responseBody: Schema.optional(Schema.String),
    logsUrl: Schema.optional(Schema.String)
  }
) {}
```

### 2.2.2 HealthChecker Service

```typescript
// src/Service/HealthChecker.ts
import { HttpClient } from "@effect/platform"

export class HealthChecker extends Effect.Service<HealthChecker>()(
  "@deploy/HealthChecker",
  {
    effect: Effect.gen(function* () {
      const http = yield* HttpClient.HttpClient

      const check = (serviceUrl: string, path = "/health/live") =>
        Effect.gen(function* () {
          const url = `${serviceUrl}${path}`
          yield* Effect.logInfo(`Checking health: ${url}`)

          const response = yield* http.get(url).pipe(
            Effect.timeout("30 seconds"),
            Effect.mapError((e) =>
              new HealthCheckError({
                message: `Health check request failed: ${e}`,
                url,
                expected: 200
              })
            )
          )

          if (response.status !== 200) {
            const body = yield* response.text.pipe(Effect.orElseSucceed(() => ""))
            return yield* Effect.fail(
              new HealthCheckError({
                message: `Health check returned ${response.status}`,
                url,
                expected: 200,
                actual: response.status,
                responseBody: body.slice(0, 500)
              })
            )
          }

          return { url, status: response.status }
        })

      const checkWithRetry = (serviceUrl: string, path?: string) =>
        check(serviceUrl, path).pipe(
          Effect.retry({
            schedule: Schedule.exponential("2 seconds").pipe(
              Schedule.jittered,
              Schedule.intersect(Schedule.recurs(10))
            ),
            while: (e) => e.actual === undefined || e.actual >= 500
          })
        )

      return { check, checkWithRetry }
    }),
    accessors: true
  }
) {}
```

### 2.2.3 Verify Command

```typescript
// Add to cli.ts
const verifyCommand = Command.make(
  "verify",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function* () {
      yield* Console.log(`Verifying deployment health for ${env}...`)
      
      const config = yield* ConfigLoader.load(env)
      const outputs = yield* TerraformRunner.output({ cwd: config.infraDir })
      
      if (!outputs.service_url) {
        return yield* Effect.fail(
          new HealthCheckError({
            message: "No service URL in terraform outputs",
            url: "unknown",
            expected: 200
          })
        )
      }

      yield* HealthChecker.checkWithRetry(outputs.service_url)
      yield* Console.log(`✓ Service healthy at ${outputs.service_url}`)
    }).pipe(withErrorHandler)
)
```

### 2.2.4 Integrate into full-deploy

```typescript
// Update full-deploy command
const fullDeployCommand = Command.make(
  "full-deploy",
  { env: envOption, autoApprove: autoApproveOption, skipVerify: skipVerifyOption },
  ({ env, autoApprove, skipVerify }) =>
    Effect.gen(function* () {
      // ... existing build, push, apply steps ...

      // Post-deploy verification
      if (!skipVerify) {
        yield* Console.log("\nVerifying deployment...")
        yield* HealthChecker.checkWithRetry(outputs.service_url)
        yield* Console.log(`✓ Deployment verified at ${outputs.service_url}`)
      }
    })
)
```

---

## Phase 2.3: Logs Command (Priority 2)

### 2.3.1 Add to GcloudRunner

```typescript
// In GcloudRunner.ts
getLogs: (serviceName: string, region: string, tail: number = 100) =>
  runAndCapture(
    [
      "logging", "read",
      `resource.type="cloud_run_revision" AND resource.labels.service_name="${serviceName}"`,
      "--limit", String(tail),
      "--format", "value(textPayload)"
    ],
    `Getting logs for ${serviceName}`
  ),

streamLogs: (serviceName: string, region: string) => {
  // Return a Stream that follows logs
  const cmd = Command.make("gcloud", 
    "logging", "tail",
    `resource.type="cloud_run_revision" AND resource.labels.service_name="${serviceName}"`,
    "--format", "value(textPayload)"
  ).pipe(Command.stdout("inherit"))
  
  return Command.exitCode(cmd)
}
```

### 2.3.2 Logs Command

```typescript
const logsCommand = Command.make(
  "logs",
  {
    env: envOption,
    follow: Options.boolean("follow").pipe(Options.withAlias("f"), Options.withDefault(false)),
    tail: Options.integer("tail").pipe(Options.withDefault(100))
  },
  ({ env, follow, tail }) =>
    Effect.gen(function* () {
      const serviceName = `effect-ontology-core-${env}`
      const config = yield* ConfigLoader.load(env)

      if (follow) {
        yield* Console.log(`Following logs for ${serviceName}...`)
        yield* GcloudRunner.streamLogs(serviceName, config.region)
      } else {
        const logs = yield* GcloudRunner.getLogs(serviceName, config.region, tail)
        yield* Console.log(logs)
      }
    }).pipe(withErrorHandler)
)
```

---

## Phase 2.4: Prerequisites Check (Priority 2)

### 2.4.1 PrereqChecker Service

```typescript
// src/Service/PrereqChecker.ts
interface PrereqResult {
  name: string
  passed: boolean
  message?: string
}

export class PrereqChecker extends Effect.Service<PrereqChecker>()(
  "@deploy/PrereqChecker",
  {
    effect: Effect.sync(() => ({
      checkTerraform: () =>
        Effect.gen(function* () {
          const result = yield* Command.make("terraform", "version").pipe(
            Command.exitCode,
            Effect.map((code) => code === 0),
            Effect.orElseSucceed(() => false)
          )
          return { name: "Terraform", passed: result }
        }),

      checkDocker: () =>
        Effect.gen(function* () {
          const result = yield* Command.make("docker", "info").pipe(
            Command.exitCode,
            Effect.map((code) => code === 0),
            Effect.orElseSucceed(() => false)
          )
          return { name: "Docker", passed: result }
        }),

      checkGcloudAuth: () =>
        Effect.gen(function* () {
          const result = yield* GcloudRunner.checkAuth()
          return { name: "GCloud Auth", passed: result }
        }),

      checkAll: () =>
        Effect.all([
          checkTerraform(),
          checkDocker(),
          checkGcloudAuth()
        ], { concurrency: "unbounded" })
    })),
    accessors: true
  }
) {}
```

### 2.4.2 Prereqs Command

```typescript
const prereqsCommand = Command.make("prereqs", {}, () =>
  Effect.gen(function* () {
    yield* Console.log("Checking prerequisites...\n")
    
    const results = yield* PrereqChecker.checkAll()
    
    for (const result of results) {
      const icon = result.passed ? "✓" : "✗"
      yield* Console.log(`${icon} ${result.name}${result.message ? `: ${result.message}` : ""}`)
    }

    const failed = results.filter((r) => !r.passed)
    if (failed.length > 0) {
      yield* Console.log(`\n${failed.length} prerequisite(s) failed`)
      return yield* Effect.fail(
        new PrereqError({ message: "Prerequisites check failed", failed })
      )
    }

    yield* Console.log("\n✓ All prerequisites satisfied")
  }).pipe(withErrorHandler)
)
```

---

## Implementation Order

### Week 1: Error Visibility
1. [ ] Create `src/Errors/Display.ts` with `formatError` using `Cause.match`
2. [ ] Create `src/Cli/ErrorHandler.ts` with `withErrorHandler`
3. [ ] Update all error classes with `toDisplayString()` method
4. [ ] Update TerraformRunner to include stderr in error messages
5. [ ] Add `--verbose` flag to plan/apply commands
6. [ ] Wrap all CLI commands with `withErrorHandler`

### Week 2: Health Verification
1. [ ] Create `HealthCheckError` type
2. [ ] Create `src/Service/HealthChecker.ts`
3. [ ] Add `verify` command
4. [ ] Integrate health check into `full-deploy`
5. [ ] Add `--skip-verify` option

### Week 3: Operations Commands
1. [ ] Add `getLogs` and `streamLogs` to GcloudRunner
2. [ ] Create `logs` command with `-f` and `--tail`
3. [ ] Create PrereqChecker service
4. [ ] Create `prereqs` command

---

## Testing Strategy

### Error Display Tests
```typescript
describe("Error Display", () => {
  it("formats TerraformError with stderr", () => {
    const cause = Cause.fail(new TerraformError({
      message: "apply failed",
      command: "terraform apply",
      exitCode: 1,
      stderr: "PORT=8080 not listening"
    }))
    
    const display = formatError(cause)
    expect(display).toContain("✗ Terraform terraform apply failed")
    expect(display).toContain("PORT=8080 not listening")
  })
  
  it("handles cause chains", () => {
    const cause = Cause.sequential(
      Cause.fail(new TerraformError({ ... })),
      Cause.fail(new HealthCheckError({ ... }))
    )
    
    const display = formatError(cause)
    expect(display).toContain("Terraform")
    expect(display).toContain("Health check")
  })
})
```

---

## Summary

This plan focuses on:

1. **Error Visibility** - Using `Cause.match` and `Cause.pretty` for structured, readable error output
2. **Clean Contracts** - Each command has explicit typed errors in its signature
3. **Exit Handling** - Proper exit codes based on error types
4. **Health Verification** - Post-deploy checks with retry logic
5. **Operations** - Logs and prereqs commands for debugging

The key architectural insight is using Effect's `Cause` module for full error context and `Exit` for predictable command outcomes.

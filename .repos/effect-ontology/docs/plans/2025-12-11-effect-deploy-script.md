# Effect-Based Terraform Deploy Script: Implementation Plan

> **Created:** 2025-12-11
> **Status:** Draft

## Executive Summary

This plan describes an Effect-based deploy script for the effect-ontology project that wraps Terraform CLI execution using `@effect/platform` Command APIs and `@effect/cli` for the CLI interface. The design keeps existing `.tf` files but provides type-safe orchestration, validated configuration, and structured output parsing.

## Research Findings

### Terraform TypeScript SDK Options

**Option 1: CDKTF (Terraform CDK for TypeScript)**
- Can wrap existing `.tf` files via `TerraformHclModule`
- Requires significant migration to CDKTF constructs
- Adds complexity: synthesizes JSON then runs terraform
- **Not recommended** for this use case - we want to keep `.tf` files as-is

**Option 2: Node.js Terraform Wrappers**
Based on research, several npm packages exist:
- [@jahed/terraform](https://www.npmjs.com/package/@jahed/terraform) - Downloads and runs Terraform locally
- [js-terraform](https://www.npmjs.com/package/js-terraform) - Promise-based wrapper
- [@terraform-js/terraform-js](https://www.npmjs.com/package/@terraform-js/terraform-js) - Lightweight TypeScript wrapper

**Option 3: @effect/platform Command APIs (Recommended)**
The `@effect/platform` package provides `Command.make` for subprocess execution with:
- Type-safe command construction
- Environment variable injection via `Command.env`
- Output capture via `Command.string`, `Command.lines`, `Command.stream`
- Exit code handling via `Command.exitCode`
- Process streaming via `Command.start`

**Recommendation**: Use `@effect/platform` Command APIs directly. This gives full Effect integration without third-party dependencies and matches existing project patterns.

### Architecture Approach

The deploy script will:
1. Use `@effect/cli` for CLI argument parsing (existing in project: `@effect/cli@0.72.1`)
2. Use `@effect/platform` Command module for Terraform subprocess execution
3. Use Effect `Schema` for tfvars and output validation (matches existing patterns)
4. Use Effect `Config` for environment-based configuration
5. Provide Effect services for composable, testable operations

## File Structure

```
/Users/pooks/Dev/effect-ontology/
├── tools/                              # New tooling directory
│   └── deploy/
│       ├── src/
│       │   ├── cli.ts                  # Entry point (@effect/cli Command)
│       │   ├── Domain/
│       │   │   ├── Error.ts            # TerraformError, ConfigError, etc.
│       │   │   ├── Schema/
│       │   │   │   ├── TfVars.ts       # Schema for dev.tfvars, prod.tfvars
│       │   │   │   ├── TfOutputs.ts    # Schema for terraform output JSON
│       │   │   │   └── TfState.ts      # Schema for state inspection
│       │   │   └── Identity.ts         # Environment, ProjectId branded types
│       │   ├── Service/
│       │   │   ├── ConfigLoader.ts     # Load and validate tfvars + secrets
│       │   │   ├── TerraformRunner.ts  # Execute terraform commands
│       │   │   ├── GcloudRunner.ts     # Execute gcloud commands
│       │   │   ├── DockerRunner.ts     # Docker build + push
│       │   │   └── StateManager.ts     # Terraform state operations
│       │   └── Workflow/
│       │       ├── Init.ts             # terraform init workflow
│       │       ├── Plan.ts             # terraform plan workflow
│       │       ├── Apply.ts            # terraform apply workflow
│       │       ├── Destroy.ts          # terraform destroy workflow
│       │       └── FullDeploy.ts       # Build + push + apply orchestration
│       ├── package.json
│       └── tsconfig.json
└── infra/                              # Existing (unchanged)
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── modules/
    └── environments/
        ├── dev.tfvars
        └── prod.tfvars
```

## Domain Model

### Branded Types (Domain/Identity.ts)

```typescript
import { Schema } from "effect"

// Environment identifier
export const Environment = Schema.Literal("dev", "prod")
export type Environment = typeof Environment.Type

// GCP Project ID
export const ProjectId = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/),
  Schema.brand("ProjectId")
)
export type ProjectId = typeof ProjectId.Type

// GCP Region
export const Region = Schema.String.pipe(
  Schema.pattern(/^[a-z]+-[a-z]+\d+$/),
  Schema.brand("Region")
)
export type Region = typeof Region.Type

// Docker image reference
export const DockerImage = Schema.String.pipe(
  Schema.pattern(/^(gcr\.io|us-docker\.pkg\.dev)\/[a-z0-9-]+\/[a-z0-9-\/]+:[a-z0-9._-]+$/),
  Schema.brand("DockerImage")
)
export type DockerImage = typeof DockerImage.Type

// Terraform workspace
export const TerraformWorkspace = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]*$/),
  Schema.brand("TerraformWorkspace")
)
export type TerraformWorkspace = typeof TerraformWorkspace.Type
```

### TfVars Schema (Domain/Schema/TfVars.ts)

```typescript
import { Schema } from "effect"
import { DockerImage, Environment, ProjectId, Region } from "../Identity.js"

// Matches existing infra/variables.tf structure
export const TfVars = Schema.Struct({
  project_id: ProjectId,
  region: Region,
  environment: Environment,
  image: DockerImage,
  allow_unauthenticated: Schema.Boolean.pipe(Schema.optional),
  enable_postgres: Schema.Boolean.pipe(Schema.optional)
})
export type TfVars = typeof TfVars.Type

// Parse .tfvars content (HCL key = value format)
export const parseTfVars = (content: string): Effect.Effect<TfVars, ParseError> =>
  Effect.gen(function*() {
    const parsed = {} as Record<string, unknown>
    for (const line of content.split("\n")) {
      const match = line.match(/^(\w+)\s*=\s*"?([^"]*)"?\s*$/)
      if (match) {
        const [, key, value] = match
        parsed[key] = value === "true" ? true : value === "false" ? false : value
      }
    }
    return yield* Schema.decodeUnknown(TfVars)(parsed)
  })
```

### TfOutputs Schema (Domain/Schema/TfOutputs.ts)

```typescript
import { Schema } from "effect"

// Matches existing infra/outputs.tf
export const TfOutputs = Schema.Struct({
  service_url: Schema.String.annotations({
    description: "Cloud Run service URL"
  }),
  bucket_name: Schema.String,
  postgres_connection_string: Schema.NullOr(Schema.String).pipe(
    Schema.annotations({ description: "PostgreSQL connection (sensitive)" })
  ),
  postgres_internal_ip: Schema.NullOr(Schema.String),
  vpc_connector_name: Schema.NullOr(Schema.String)
})
export type TfOutputs = typeof TfOutputs.Type

// Parse terraform output -json result
export const parseTfOutputsJson = (json: string) =>
  Effect.gen(function*() {
    const raw = JSON.parse(json)
    const flattened = Object.fromEntries(
      Object.entries(raw).map(([k, v]: [string, any]) => [k, v.value])
    )
    return yield* Schema.decodeUnknown(TfOutputs)(flattened)
  })
```

### Error Types (Domain/Error.ts)

```typescript
import { Schema } from "effect"

export class TerraformError extends Schema.TaggedError<TerraformError>()(
  "TerraformError",
  {
    message: Schema.String,
    command: Schema.String,
    exitCode: Schema.Number,
    stderr: Schema.String.pipe(Schema.optional),
    cause: Schema.optional(Schema.Unknown)
  }
) {}

export class ConfigValidationError extends Schema.TaggedError<ConfigValidationError>()(
  "ConfigValidationError",
  {
    message: Schema.String,
    field: Schema.String,
    expected: Schema.String,
    received: Schema.String.pipe(Schema.optional)
  }
) {}

export class TfVarsParseError extends Schema.TaggedError<TfVarsParseError>()(
  "TfVarsParseError",
  {
    message: Schema.String,
    filePath: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

export class DockerError extends Schema.TaggedError<DockerError>()(
  "DockerError",
  {
    message: Schema.String,
    command: Schema.String,
    exitCode: Schema.Number,
    stderr: Schema.String.pipe(Schema.optional)
  }
) {}

export class GcloudError extends Schema.TaggedError<GcloudError>()(
  "GcloudError",
  {
    message: Schema.String,
    command: Schema.String,
    exitCode: Schema.Number
  }
) {}

export class StateError extends Schema.TaggedError<StateError>()(
  "StateError",
  {
    message: Schema.String,
    operation: Schema.Literal("lock", "unlock", "pull", "push"),
    cause: Schema.optional(Schema.Unknown)
  }
) {}
```

## Service Interfaces

### ConfigLoader Service

```typescript
import { Config, Effect, Layer, Option } from "effect"
import { FileSystem } from "@effect/platform"
import { TfVars, parseTfVars } from "../Domain/Schema/TfVars.js"
import { Environment, ProjectId, Region } from "../Domain/Identity.js"

// Runtime config from environment
const DeployConfig = Config.all({
  infraDir: Config.string("INFRA_DIR").pipe(Config.withDefault("./infra")),
  gcpProject: Config.option(Config.string("GCP_PROJECT")),
  terraformBin: Config.string("TERRAFORM_BIN").pipe(Config.withDefault("terraform")),
  dryRun: Config.boolean("DRY_RUN").pipe(Config.withDefault(false)),
  autoApprove: Config.boolean("AUTO_APPROVE").pipe(Config.withDefault(false))
})

export interface LoadedConfig {
  readonly tfVars: TfVars
  readonly environment: Environment
  readonly projectId: ProjectId
  readonly region: Region
  readonly infraDir: string
  readonly terraformBin: string
  readonly dryRun: boolean
  readonly autoApprove: boolean
}

export class ConfigLoader extends Effect.Service<ConfigLoader>()(
  "@deploy/ConfigLoader",
  {
    effect: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const runtimeConfig = yield* DeployConfig

      return {
        load: (env: Environment): Effect.Effect<LoadedConfig, ConfigValidationError | TfVarsParseError> =>
          Effect.gen(function*() {
            const varsPath = `${runtimeConfig.infraDir}/environments/${env}.tfvars`
            const content = yield* fs.readFileString(varsPath).pipe(
              Effect.mapError((e) => new TfVarsParseError({
                message: `Failed to read ${varsPath}`,
                filePath: varsPath,
                cause: e
              }))
            )
            const tfVars = yield* parseTfVars(content)

            return {
              tfVars,
              environment: env,
              projectId: tfVars.project_id,
              region: tfVars.region,
              infraDir: runtimeConfig.infraDir,
              terraformBin: runtimeConfig.terraformBin,
              dryRun: runtimeConfig.dryRun,
              autoApprove: runtimeConfig.autoApprove
            }
          }),

        getSecret: (secretId: string) =>
          Effect.gen(function*() {
            // Use gcloud to fetch secret at runtime
            // or read from environment
            return yield* Config.redacted(secretId.toUpperCase())
          })
      }
    }),
    accessors: true,
    dependencies: [FileSystem.layer]
  }
) {}
```

### TerraformRunner Service

```typescript
import { Command } from "@effect/platform"
import { Effect, Schedule, Stream } from "effect"
import { TerraformError } from "../Domain/Error.js"
import { TfOutputs, parseTfOutputsJson } from "../Domain/Schema/TfOutputs.js"

export interface TerraformOptions {
  readonly cwd: string
  readonly env?: Record<string, string>
  readonly varFile?: string
  readonly vars?: Record<string, string>
  readonly target?: string[]
  readonly autoApprove?: boolean
  readonly timeout?: number // ms
}

export class TerraformRunner extends Effect.Service<TerraformRunner>()(
  "@deploy/TerraformRunner",
  {
    effect: Effect.gen(function*() {
      const buildArgs = (opts: TerraformOptions, baseArgs: string[]) => {
        const args = [...baseArgs]
        if (opts.varFile) args.push("-var-file", opts.varFile)
        if (opts.vars) {
          for (const [k, v] of Object.entries(opts.vars)) {
            args.push("-var", `${k}=${v}`)
          }
        }
        if (opts.target) {
          for (const t of opts.target) args.push("-target", t)
        }
        return args
      }

      const runCommand = (
        subcommand: string,
        args: string[],
        opts: TerraformOptions
      ) =>
        Effect.gen(function*() {
          const cmd = Command.make("terraform", subcommand, ...args).pipe(
            Command.workingDirectory(opts.cwd),
            opts.env ? Command.env(opts.env) : (c) => c
          )

          yield* Effect.logInfo(`Running: terraform ${subcommand} ${args.join(" ")}`)

          const [exitCode, stdout, stderr] = yield* Effect.scoped(
            Command.start(cmd).pipe(
              Effect.flatMap((process) =>
                Effect.all([
                  process.exitCode,
                  Stream.runCollect(process.stdout).pipe(
                    Effect.map((chunks) => Buffer.concat([...chunks]).toString())
                  ),
                  Stream.runCollect(process.stderr).pipe(
                    Effect.map((chunks) => Buffer.concat([...chunks]).toString())
                  )
                ], { concurrency: 3 })
              )
            )
          )

          if (exitCode !== 0) {
            return yield* Effect.fail(
              new TerraformError({
                message: `terraform ${subcommand} failed`,
                command: `terraform ${subcommand} ${args.join(" ")}`,
                exitCode,
                stderr
              })
            )
          }

          return { stdout, stderr }
        }).pipe(
          Effect.timeout(opts.timeout ?? 600_000), // 10 min default
          Effect.retry(
            Schedule.exponential("1 second").pipe(
              Schedule.intersect(Schedule.recurs(2)),
              Schedule.jittered
            )
          )
        )

      return {
        init: (opts: TerraformOptions) =>
          runCommand("init", ["-input=false"], opts).pipe(
            Effect.tap(() => Effect.logInfo("Terraform initialized"))
          ),

        validate: (opts: TerraformOptions) =>
          runCommand("validate", [], opts).pipe(
            Effect.tap(() => Effect.logInfo("Terraform configuration valid"))
          ),

        plan: (opts: TerraformOptions) =>
          runCommand("plan", buildArgs(opts, ["-input=false", "-out=tfplan"]), opts).pipe(
            Effect.tap(({ stdout }) => Effect.logInfo("Plan created", { changes: stdout.includes("Plan:") }))
          ),

        apply: (opts: TerraformOptions) =>
          runCommand(
            "apply",
            opts.autoApprove ? ["-auto-approve", "tfplan"] : ["tfplan"],
            opts
          ).pipe(
            Effect.tap(() => Effect.logInfo("Apply complete"))
          ),

        destroy: (opts: TerraformOptions) =>
          runCommand(
            "destroy",
            buildArgs(opts, opts.autoApprove ? ["-auto-approve"] : []),
            opts
          ),

        output: (opts: TerraformOptions): Effect.Effect<TfOutputs, TerraformError> =>
          runCommand("output", ["-json"], opts).pipe(
            Effect.flatMap(({ stdout }) => parseTfOutputsJson(stdout)),
            Effect.mapError((e) =>
              e instanceof TerraformError ? e : new TerraformError({
                message: "Failed to parse terraform outputs",
                command: "terraform output -json",
                exitCode: 0,
                cause: e
              })
            )
          ),

        showState: (opts: TerraformOptions) =>
          runCommand("show", ["-json"], opts)
      }
    }),
    accessors: true
  }
) {}
```

### DockerRunner Service

```typescript
import { Command } from "@effect/platform"
import { Effect } from "effect"
import { DockerError } from "../Domain/Error.js"
import { DockerImage } from "../Domain/Identity.js"

export class DockerRunner extends Effect.Service<DockerRunner>()(
  "@deploy/DockerRunner",
  {
    effect: Effect.gen(function*() {
      const run = (args: string[], description: string) =>
        Effect.gen(function*() {
          yield* Effect.logInfo(description, { command: `docker ${args.join(" ")}` })

          const exitCode = yield* Command.make("docker", ...args).pipe(
            Command.stdout("inherit"),
            Command.stderr("inherit"),
            Command.exitCode
          )

          if (exitCode !== 0) {
            return yield* Effect.fail(new DockerError({
              message: `Docker command failed: ${description}`,
              command: `docker ${args.join(" ")}`,
              exitCode
            }))
          }
        })

      return {
        build: (opts: {
          tag: DockerImage
          dockerfile: string
          context: string
          platform?: string
        }) =>
          run([
            "build",
            "--platform", opts.platform ?? "linux/amd64",
            "-t", opts.tag,
            "-f", opts.dockerfile,
            opts.context
          ], `Building image ${opts.tag}`),

        push: (tag: DockerImage) =>
          run(["push", tag], `Pushing image ${tag}`),

        configureGcr: () =>
          Command.make("gcloud", "auth", "configure-docker", "--quiet").pipe(
            Command.exitCode,
            Effect.tap((code) =>
              code === 0
                ? Effect.logInfo("Docker configured for GCR")
                : Effect.fail(new DockerError({
                    message: "Failed to configure Docker for GCR",
                    command: "gcloud auth configure-docker",
                    exitCode: code
                  }))
            )
          )
      }
    }),
    accessors: true
  }
) {}
```

### GcloudRunner Service

```typescript
import { Command } from "@effect/platform"
import { Effect } from "effect"
import { GcloudError } from "../Domain/Error.js"

export class GcloudRunner extends Effect.Service<GcloudRunner>()(
  "@deploy/GcloudRunner",
  {
    effect: Effect.gen(function*() {
      return {
        getProject: () =>
          Command.make("gcloud", "config", "get-value", "project").pipe(
            Command.string,
            Effect.map((s) => s.trim())
          ),

        updateCloudRunImage: (serviceName: string, image: string, region: string) =>
          Command.make(
            "gcloud", "run", "services", "update", serviceName,
            "--image", image,
            "--region", region
          ).pipe(
            Command.exitCode,
            Effect.flatMap((code) =>
              code === 0
                ? Effect.succeed(void 0)
                : Effect.fail(new GcloudError({
                    message: `Failed to update Cloud Run service ${serviceName}`,
                    command: `gcloud run services update ${serviceName}`,
                    exitCode: code
                  }))
            )
          ),

        getServiceUrl: (serviceName: string, region: string) =>
          Command.make(
            "gcloud", "run", "services", "describe", serviceName,
            "--region", region,
            "--format", "value(status.url)"
          ).pipe(
            Command.string,
            Effect.map((s) => s.trim())
          )
      }
    }),
    accessors: true
  }
) {}
```

## CLI Design

### Entry Point (cli.ts)

```typescript
import { Args, Command, Options } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Console, Effect, Layer } from "effect"
import { ConfigLoader } from "./Service/ConfigLoader.js"
import { TerraformRunner } from "./Service/TerraformRunner.js"
import { DockerRunner } from "./Service/DockerRunner.js"
import { GcloudRunner } from "./Service/GcloudRunner.js"
import { Environment } from "./Domain/Identity.js"

// Global options
const envOption = Options.choice("env", ["dev", "prod"] as const).pipe(
  Options.withAlias("e"),
  Options.withDefault("dev" as const),
  Options.withDescription("Target environment")
)

const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Show what would be done without making changes")
)

const autoApproveOption = Options.boolean("auto-approve").pipe(
  Options.withAlias("y"),
  Options.withDefault(false),
  Options.withDescription("Skip interactive approval")
)

// Subcommands
const initCommand = Command.make("init", { env: envOption }, ({ env }) =>
  Effect.gen(function*() {
    const config = yield* ConfigLoader.load(env)
    const tf = yield* TerraformRunner
    yield* tf.init({ cwd: config.infraDir, varFile: `environments/${env}.tfvars` })
    yield* Console.log(`Terraform initialized for ${env}`)
  })
)

const planCommand = Command.make("plan", { env: envOption, dryRun: dryRunOption }, ({ env }) =>
  Effect.gen(function*() {
    const config = yield* ConfigLoader.load(env)
    const tf = yield* TerraformRunner
    yield* tf.init({ cwd: config.infraDir })
    yield* tf.plan({ cwd: config.infraDir, varFile: `environments/${env}.tfvars` })
    yield* Console.log(`Plan complete for ${env}`)
  })
)

const applyCommand = Command.make(
  "apply",
  { env: envOption, autoApprove: autoApproveOption },
  ({ autoApprove, env }) =>
    Effect.gen(function*() {
      const config = yield* ConfigLoader.load(env)
      const tf = yield* TerraformRunner
      yield* tf.init({ cwd: config.infraDir })
      yield* tf.plan({ cwd: config.infraDir, varFile: `environments/${env}.tfvars` })
      yield* tf.apply({ cwd: config.infraDir, autoApprove })
      const outputs = yield* tf.output({ cwd: config.infraDir })
      yield* Console.log("Apply complete!")
      yield* Console.log(`Service URL: ${outputs.service_url}`)
      yield* Console.log(`Bucket: ${outputs.bucket_name}`)
    })
)

const deployCommand = Command.make(
  "deploy",
  { env: envOption, autoApprove: autoApproveOption },
  ({ autoApprove, env }) =>
    Effect.gen(function*() {
      const config = yield* ConfigLoader.load(env)
      const docker = yield* DockerRunner
      const tf = yield* TerraformRunner
      const gcloud = yield* GcloudRunner

      // 1. Build and push image
      yield* docker.configureGcr()
      yield* docker.build({
        tag: config.tfVars.image,
        dockerfile: "packages/@core-v2/Dockerfile",
        context: ".",
        platform: "linux/amd64"
      })
      yield* docker.push(config.tfVars.image)

      // 2. Apply infrastructure
      yield* tf.init({ cwd: config.infraDir })
      yield* tf.plan({ cwd: config.infraDir, varFile: `environments/${env}.tfvars` })
      yield* tf.apply({ cwd: config.infraDir, autoApprove })

      // 3. Get outputs
      const outputs = yield* tf.output({ cwd: config.infraDir })
      yield* Console.log("Deployment complete!")
      yield* Console.log(`Service URL: ${outputs.service_url}`)
    })
)

const outputCommand = Command.make("output", { env: envOption }, ({ env }) =>
  Effect.gen(function*() {
    const config = yield* ConfigLoader.load(env)
    const tf = yield* TerraformRunner
    const outputs = yield* tf.output({ cwd: config.infraDir })
    yield* Console.log(JSON.stringify(outputs, null, 2))
  })
)

const destroyCommand = Command.make(
  "destroy",
  { env: envOption, autoApprove: autoApproveOption },
  ({ autoApprove, env }) =>
    Effect.gen(function*() {
      if (env === "prod" && !autoApprove) {
        yield* Console.error("WARNING: Destroying production requires --auto-approve flag")
        return yield* Effect.fail(new Error("Refusing to destroy prod without explicit approval"))
      }
      const config = yield* ConfigLoader.load(env)
      const tf = yield* TerraformRunner
      yield* tf.destroy({ cwd: config.infraDir, varFile: `environments/${env}.tfvars`, autoApprove })
    })
)

// Root command with subcommands
const rootCommand = Command.make("deploy").pipe(
  Command.withSubcommands([
    initCommand,
    planCommand,
    applyCommand,
    deployCommand,
    outputCommand,
    destroyCommand
  ])
)

// Build CLI app
const cli = Command.run(rootCommand, {
  name: "effect-ontology-deploy",
  version: "1.0.0"
})

// Layer composition
const DeployLive = Layer.mergeAll(
  ConfigLoader.Default,
  TerraformRunner.Default,
  DockerRunner.Default,
  GcloudRunner.Default
)

// Run
cli(process.argv).pipe(
  Effect.provide(DeployLive),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
```

## Error Handling and Recovery

### Error Hierarchy

```
DeployError (union type via Schema.Union)
├── TerraformError        - terraform command failed
│   ├── InitFailed        - terraform init failure
│   ├── PlanFailed        - plan/validation failure
│   ├── ApplyFailed       - apply failure (may need rollback)
│   └── StateLockError    - state is locked
├── ConfigValidationError - invalid tfvars/config
├── TfVarsParseError      - malformed .tfvars file
├── DockerError           - build/push failure
├── GcloudError           - gcloud command failure
└── StateError            - state management issues
```

### Recovery Strategies

| Error Type | Recovery Strategy |
|------------|-------------------|
| `TerraformError.InitFailed` | Retry with `-reconfigure`, check backend connectivity |
| `TerraformError.StateLockError` | Wait and retry, or `terraform force-unlock` with user confirmation |
| `TerraformError.ApplyFailed` | Log partial state, suggest `terraform plan` to inspect |
| `DockerError` | Retry build, check Dockerfile syntax |
| `ConfigValidationError` | Fail fast with clear field-level error messages |

### Retry Policy

```typescript
const terraformRetryPolicy = Schedule.exponential("2 seconds").pipe(
  Schedule.jittered,
  Schedule.compose(Schedule.recurs(3)),
  Schedule.whileInput((error: TerraformError) =>
    // Only retry transient errors
    error.exitCode !== 0 &&
    (error.stderr?.includes("Error acquiring the state lock") ||
     error.stderr?.includes("connection refused"))
  )
)
```

## Testing Strategy

### Unit Tests

```typescript
import { describe, it, layer } from "@effect/vitest"
import { Effect, Layer, TestContext } from "effect"

describe("TerraformRunner", () => {
  // Mock Command execution
  const MockCommandLayer = Layer.succeed(/* ... */)

  it.layer(MockCommandLayer)("init creates proper command", () =>
    Effect.gen(function*() {
      const tf = yield* TerraformRunner
      const result = yield* tf.init({ cwd: "/tmp/test" })
      // Assert command structure
    })
  )
})
```

### Integration Tests

```typescript
describe("ConfigLoader", () => {
  it("parses dev.tfvars correctly", () =>
    Effect.gen(function*() {
      const loader = yield* ConfigLoader
      const config = yield* loader.load("dev")

      expect(config.environment).toBe("dev")
      expect(config.projectId).toMatch(/^[a-z][a-z0-9-]+$/)
    }).pipe(Effect.provide(ConfigLoader.Default))
  )
})
```

## Implementation Sequence

### Phase 1: Core Services
1. Create `tools/deploy/` package structure
2. Implement Domain types (Identity, Errors, Schemas)
3. Implement `TerraformRunner` service with Command APIs
4. Add unit tests for command construction

### Phase 2: Refinements (Polishing & Production Readiness)
- [x] **Phase 2.1: Enhance Error Handling**
  - Implement `Domain/Error.ts` with branded errors (TerraformError, GcloudError, etc.).
  - Integrate error handling into all runners.
  - Add `Cli/ErrorHandler.ts` for user-friendly error display (colors, suggestions).
- [x] **Phase 2.2: Add Health Checks**
  - Create `Service/HealthChecker.ts` using `@effect/platform` HttpClient.
  - Implement `waitForHealthy` loop to verify service after deployment.
  - Add `verify` command to manually check health endpoints.
- [x] **Phase 2.3: Add Operational Commands**
  - Implement `logs` command (stream logs from Cloud Run).
  - Implement `prereqs` command (verify terraform, gcloud, docker, auth).
- [x] **Phase 2.4: Wizard Mode & Completions**
  - Enable built-in wizard (`--wizard`) and completions (`--completions`).
  - Ensure interactive experience is polished.
- [x] **Phase 2.5: Final Polish**
  - Review all messages and prompts.
  - Ensure clear headers and success messages.
  - Verify `init` checks prerequisites.
2. Add state inspection commands
3. Improve error messages and recovery hints
4. Document usage in README

## Dependencies

Add to `tools/deploy/package.json`:
```json
{
  "name": "@effect-ontology/deploy",
  "type": "module",
  "dependencies": {
    "@effect/cli": "^0.72.1",
    "@effect/platform": "^0.93.3",
    "@effect/platform-node": "^0.84.0",
    "effect": "^3.19.6"
  },
  "devDependencies": {
    "@effect/vitest": "^0.25.1",
    "typescript": "^5.6.2",
    "vitest": "^3.2.0"
  }
}
```

---

## Critical Files Reference

- `/Users/pooks/Dev/effect-ontology/infra/variables.tf` - Source of truth for Terraform variable definitions; the TfVars schema must match these exactly
- `/Users/pooks/Dev/effect-ontology/infra/outputs.tf` - Defines output structure; TfOutputs schema must parse the terraform output JSON
- `/Users/pooks/Dev/effect-ontology/packages/@core-v2/src/Service/Config.ts` - Pattern to follow for Effect.Service with Config.nested
- `/Users/pooks/Dev/effect-ontology/packages/@core-v2/src/Domain/Identity.ts` - Pattern to follow for branded Schema types with validation

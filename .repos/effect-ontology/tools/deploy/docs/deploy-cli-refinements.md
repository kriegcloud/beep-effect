# Deploy CLI Refinements & Feature Needs

Analysis of the deployment experience and identified gaps for production-grade tooling.

## Deployment Experience Analysis

### What Went Well
1. **Workspace management** - Automatic workspace creation/selection worked cleanly
2. **Structured logging** - Effect.logInfo provided visibility into each step
3. **Retry logic** - TerraformRunner retries transient failures (state lock, timeouts)
4. **Typed errors** - Schema.TaggedError provides good error classification
5. **Environment isolation** - dev/prod workspaces prevent cross-environment issues

### Pain Points Encountered

#### 1. **Poor Error Diagnostics**
- **Issue**: When terraform apply failed, we only saw "exit code 1" with no stderr
- **Root cause**: TerraformRunner captures stderr but doesn't surface it in error messages
- **Impact**: Had to manually run terraform commands to see actual Cloud Run startup errors

#### 2. **No Health Check Verification**
- **Issue**: Deployment "succeeded" (terraform apply completed) but service was crashing
- **Root cause**: No post-deploy health verification step
- **Impact**: Had to manually curl the health endpoint to discover the LLM_API_KEY misconfiguration

#### 3. **No Cloud Build Integration**
- **Issue**: Local Docker build failed with network timeout (sharp download)
- **Root cause**: full-deploy only supports local docker build, not Cloud Build
- **Impact**: Had to manually run `gcloud builds submit`

#### 4. **No Log Streaming**
- **Issue**: When service failed to start, had to manually check Cloud Run logs
- **Root cause**: CLI has no integration with `gcloud logging read`
- **Impact**: Debugging loop required switching between CLI and manual gcloud commands

#### 5. **Verbose TfPlan Output Not Shown**
- **Issue**: Could see "Plan created" but not the actual changes being made
- **Root cause**: Plan output captured but not displayed to user
- **Impact**: Less confidence about what terraform will do

#### 6. **No Rollback Capability**
- **Issue**: If deployment breaks production, no quick way to revert
- **Root cause**: No revision tracking or rollback commands
- **Impact**: Manual intervention required for recovery

---

## Refinements Needed

### Priority 1: Critical for Production

#### 1.1 Surface Terraform Stderr in Errors
```typescript
// Current: Generic message
TerraformError: terraform apply failed with exit code 1

// Needed: Include stderr content
TerraformError: terraform apply failed with exit code 1
  → The user-provided container failed to start and listen on PORT=8080
  → Logs URL: https://console.cloud.google.com/logs/...
```

**Implementation**: Modify `TerraformRunner.runCommand` to include truncated stderr in error message.

#### 1.2 Post-Deploy Health Verification
```typescript
// New command or integrated into apply/full-deploy
const verifyCommand = Command.make("verify", { env: envOption }, ({ env }) =>
  Effect.gen(function*() {
    const outputs = yield* tf.output({ cwd: config.infraDir })
    const serviceUrl = outputs.service_url?.value

    yield* Effect.retry(
      HttpClient.get(`${serviceUrl}/health/live`).pipe(
        Effect.flatMap(response =>
          response.status === 200
            ? Effect.succeed(true)
            : Effect.fail(new HealthCheckError({ status: response.status }))
        )
      ),
      Schedule.exponential("2 seconds").pipe(Schedule.intersect(Schedule.recurs(10)))
    )

    yield* Console.log(`✓ Service healthy at ${serviceUrl}`)
  })
)
```

#### 1.3 Cloud Build Integration
```typescript
// New CloudBuildRunner service
export class CloudBuildRunner extends Effect.Service<CloudBuildRunner>()(...) {
  submit: (configPath: string, timeout?: Duration) => Effect<BuildResult, CloudBuildError>
  logs: (buildId: string) => Stream<string, CloudBuildError>
  status: (buildId: string) => Effect<BuildStatus, CloudBuildError>
}

// Add --build-strategy option to full-deploy
const buildStrategyOption = Options.choice("build-strategy", ["local", "cloud-build"] as const)
```

#### 1.4 Streaming Terraform Output
```typescript
// Option to show terraform plan output
const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDefault(false)
)

// In plan command:
if (verbose) {
  yield* tf.planInteractive({ cwd, varFile }) // Shows plan in real-time
} else {
  yield* tf.plan({ cwd, varFile })
}
```

### Priority 2: High Value

#### 2.1 Log Streaming Command
```typescript
const logsCommand = Command.make(
  "logs",
  {
    env: envOption,
    follow: Options.boolean("follow").pipe(Options.withAlias("f"), Options.withDefault(false)),
    tail: Options.integer("tail").pipe(Options.withDefault(100))
  },
  ({ env, follow, tail }) =>
    Effect.gen(function*() {
      const serviceName = `effect-ontology-core-${env}`
      const gcloud = yield* GcloudRunner

      if (follow) {
        yield* gcloud.streamLogs(serviceName, config.region)
      } else {
        const logs = yield* gcloud.getLogs(serviceName, config.region, tail)
        yield* Console.log(logs)
      }
    })
)
```

#### 2.2 Rollback Command
```typescript
const rollbackCommand = Command.make(
  "rollback",
  { env: envOption, revision: Options.optional(Options.text("revision")) },
  ({ env, revision }) =>
    Effect.gen(function*() {
      const gcloud = yield* GcloudRunner
      const serviceName = `effect-ontology-core-${env}`

      // List recent revisions if none specified
      if (Option.isNone(revision)) {
        const revisions = yield* gcloud.listRevisions(serviceName, config.region)
        // Interactive selection or show list
      }

      yield* gcloud.updateTraffic(serviceName, revision, 100, config.region)
      yield* Console.log(`✓ Traffic shifted to revision ${revision}`)
    })
)
```

#### 2.3 Diff Command (Pre-Apply Preview)
```typescript
const diffCommand = Command.make(
  "diff",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      // Generate plan and show human-readable diff
      yield* tf.plan({ cwd, varFile })
      const planJson = yield* tf.showPlan({ cwd }) // terraform show -json tfplan

      // Parse and display in colored diff format
      yield* displayPlanDiff(planJson)
    })
)
```

#### 2.4 Prerequisites Check Command
```typescript
const prereqCommand = Command.make("prereqs", {}, () =>
  Effect.gen(function*() {
    const checks = yield* Effect.all([
      checkTerraformInstalled(),
      checkDockerRunning(),
      checkGcloudAuth(),
      checkRequiredSecrets(["ANTHROPIC_API_KEY"]),
      checkRequiredAPIs(["run.googleapis.com", "cloudbuild.googleapis.com"])
    ], { concurrency: "unbounded" })

    // Display checklist with ✓ or ✗
    for (const check of checks) {
      yield* Console.log(`${check.passed ? "✓" : "✗"} ${check.name}`)
    }
  })
)
```

### Priority 3: Nice to Have

#### 3.1 Cost Estimation
```typescript
// Use terraform plan JSON to estimate costs
const costCommand = Command.make("cost", { env: envOption }, ({ env }) =>
  Effect.gen(function*() {
    const planJson = yield* tf.planJson({ cwd, varFile })
    const estimate = yield* estimateCost(planJson) // Use Infracost API or similar
    yield* Console.log(formatCostEstimate(estimate))
  })
)
```

#### 3.2 Interactive Mode
```typescript
// Guided deployment wizard
const wizardCommand = Command.make("wizard", {}, () =>
  Effect.gen(function*() {
    const env = yield* prompt.select("Select environment", ["dev", "prod"])
    const strategy = yield* prompt.select("Build strategy", ["local", "cloud-build"])
    const autoApprove = yield* prompt.confirm("Auto-approve changes?")

    // Run deployment with selections
  })
)
```

#### 3.3 Deployment History
```typescript
// Track deployments in GCS or local file
const historyCommand = Command.make("history", { env: envOption }, ({ env }) =>
  Effect.gen(function*() {
    const history = yield* DeploymentHistory.list(env)
    yield* Console.table(history.map(h => ({
      timestamp: h.timestamp,
      image: h.imageTag,
      status: h.status,
      duration: h.duration
    })))
  })
)
```

#### 3.4 Secrets Sync Command
```typescript
// Sync secrets from .env to GCP Secret Manager
const secretsSyncCommand = Command.make(
  "secrets-sync",
  { env: envOption, source: Options.file("source").pipe(Options.withDefault(".env")) },
  ({ env, source }) =>
    Effect.gen(function*() {
      const secrets = yield* parseEnvFile(source)
      for (const [key, value] of Object.entries(secrets)) {
        yield* gcloud.setSecretVersion(key, value)
        yield* Console.log(`✓ Synced ${key}`)
      }
    })
)
```

---

## Architectural Improvements

### 1. Better Service Composition
```typescript
// Create a DeploymentOrchestrator that composes all services
export class DeploymentOrchestrator extends Effect.Service<DeploymentOrchestrator>()(...) {
  deploy: (env: Environment, opts: DeployOptions) => Effect<DeployResult, DeployError>
  verify: (env: Environment) => Effect<HealthStatus, VerifyError>
  rollback: (env: Environment, revision?: string) => Effect<void, RollbackError>
}
```

### 2. Event-Driven Progress Reporting
```typescript
// Emit events for each deployment stage
type DeployEvent =
  | { _tag: "BuildStarted"; image: string }
  | { _tag: "BuildComplete"; digest: string; duration: Duration }
  | { _tag: "PlanCreated"; changes: number }
  | { _tag: "ApplyStarted" }
  | { _tag: "ApplyComplete"; outputs: TfOutputs }
  | { _tag: "HealthCheckPassed"; url: string }
  | { _tag: "Error"; error: DeployError }

// Stream events to UI or webhook
const deploy = (env: Environment): Stream<DeployEvent, DeployError> => ...
```

### 3. Configuration Validation Schema
```typescript
// Validate tfvars against expected Cloud Run config
const CloudRunConfigSchema = Schema.Struct({
  LLM_API_KEY: Schema.String, // Required
  LLM_PROVIDER: Schema.Literal("anthropic", "openai", "google"),
  LLM_MODEL: Schema.String,
  STORAGE_TYPE: Schema.Literal("local", "gcs", "memory"),
  STORAGE_BUCKET: Schema.optional(Schema.String),
  ONTOLOGY_PATH: Schema.String
})

// Pre-flight check that env vars match what service expects
const validateConfig = (tfVars: TfVars, env: Environment) =>
  Effect.gen(function*() {
    // Check secrets exist in Secret Manager
    // Check env vars match what @core-v2 ConfigService expects
  })
```

### 4. Structured Logging with Spans
```typescript
// Use Effect tracing for observability
const deploy = (env: Environment) =>
  Effect.gen(function*() {
    yield* Effect.annotateCurrentSpan("environment", env)

    yield* Effect.withSpan("docker.build")(docker.build(...))
    yield* Effect.withSpan("terraform.apply")(tf.apply(...))
    yield* Effect.withSpan("health.verify")(verifyHealth(...))
  }).pipe(Effect.withSpan("deploy"))
```

---

## Implementation Roadmap

### Phase 1: Error Visibility (Immediate)
- [ ] Surface stderr in TerraformError messages
- [ ] Add `--verbose` flag for streaming output
- [ ] Improve error formatting with context

### Phase 2: Reliability (Next)
- [ ] Add post-deploy health verification
- [ ] Add `prereqs` command
- [ ] Add `logs` command with streaming

### Phase 3: Cloud Build (Then)
- [ ] Add CloudBuildRunner service
- [ ] Add `--build-strategy` option
- [ ] Add build status polling

### Phase 4: Operations (Later)
- [ ] Add `rollback` command
- [ ] Add `diff` command
- [ ] Add deployment history tracking

### Phase 5: DX Polish (Eventually)
- [ ] Interactive wizard mode
- [ ] Cost estimation
- [ ] Secrets sync

---

## Summary

The current CLI provides a solid foundation but lacks production-critical features:

1. **Error visibility** - Errors don't show root cause, requiring manual debugging
2. **Health verification** - No confirmation that deployment actually works
3. **Build flexibility** - Only local Docker, no Cloud Build fallback
4. **Operations** - No rollback, logs, or revision management

Priority focus should be on **error diagnostics** and **health verification** as these directly impacted the deployment experience and are table-stakes for production tooling.

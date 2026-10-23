# Always / Never — Resilience + Recovery (Examples 18-23)

Loaded on demand from `effect-first-development/SKILL.md`. Repository laws win on conflict.

## Table of Contents

- [18) Retry + timeout modeling](#18-retry--timeout-modeling)
- [19) Structured concurrency + bounded parallelism](#19-structured-concurrency--bounded-parallelism)
- [20) Config + secret redaction](#20-config--secret-redaction)
- [21) Precise recovery by tag](#21-precise-recovery-by-tag)
- [22) Expected failures vs defects](#22-expected-failures-vs-defects)
- [23) Layer isolation when sharing is unsafe](#23-layer-isolation-when-sharing-is-unsafe)

### 18) Retry + timeout modeling

```ts
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
declare const task: Effect.Effect<string, string>;
const resilient = task.pipe(
  Effect.retry(Schedule.recurs(3)),
  Effect.timeoutOption(Duration.seconds(5))
)
```

### 19) Structured concurrency + bounded parallelism

```ts
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
type Job = { readonly id: string };
declare const backgroundHeartbeat: Effect.Effect<void>;
declare const runJob: (job: Job) => Effect.Effect<string>;
const runWorkers = Effect.fn("Workers.run")(function* (jobs: ReadonlyArray<Job>) {
  const fiber = yield* Effect.forkChild(backgroundHeartbeat)
  const results = yield* Effect.forEach(jobs, runJob, { concurrency: 8 })
  yield* Fiber.interrupt(fiber)
  return results
})
```

### 20) Config + secret redaction

```ts
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
const loadSettings = Effect.fn("Settings.load")(function* () {
  const port = yield* Config.Port("PORT")
  const apiKey = yield* Config.Redacted("API_KEY")

  yield* Effect.logInfo(`port=${port}`)
  yield* Effect.logDebug(`apiKey=${String(apiKey)}`)

  return { port, apiKey }
})
```

### 21) Precise recovery by tag

```ts
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as O from "effect/Option"
class UserNotFoundError extends S.TaggedError<UserNotFoundError, { readonly brand: unique symbol }>()("UserNotFoundError", { id: S.String }) {}
declare const findUser: (id: string) => Effect.Effect<{ readonly id: string }, UserNotFoundError>;

const findUserOptional = (id: string) =>
  findUser(id).pipe(
    Effect.map(O.some),
    Effect.catchTag("UserNotFoundError", () => Effect.succeed(O.none()))
  )
```

### 22) Expected failures vs defects

```ts
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
type Input = { readonly value: string };
class ValidationError extends S.TaggedError<ValidationError, { readonly brand: unique symbol }>()("ValidationError", { message: S.String }) {}
const process = Effect.fn("Process.run")(function* (input: Input) {
  if (input.value.length === 0) {
    return yield* Effect.fail(new ValidationError({ message: "value must be non-empty" }))
  }

  if (input.value === "__impossible__") {
    return yield* Effect.die("unreachable state")
  }

  return input.value
})
```

### 23) Layer isolation when sharing is unsafe

```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
class AppService extends Context.Service<AppService, { readonly value: string }>()("example/AppService") {}
const program = AppService.use((service) => Effect.succeed(service.value));
const AppLayer = Layer.effect(AppService, Effect.sync(() => ({ value: "isolated instance" })));
const isolatedProgram = program.pipe(
  Effect.provide(Layer.fresh(AppLayer), { local: true })
)
```

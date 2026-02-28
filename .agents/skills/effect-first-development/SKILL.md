---
name: effect-first-development
description: >
  Canonical Effect-first development guide for this repo. Trigger on: new features,
  refactors, bug fixes, API boundaries, typed errors, Option usage, schema decoding,
  service wiring, and test authoring.
version: 0.1.0
status: active
---

# Effect-First Development (Canonical)

Use this skill when implementing or reviewing production code in this repository.
If there is any conflict, repository laws win.

## Zero-Fail Memory Rule

Before writing code, run this checklist:

1. Can it fail? Model failure in `Effect` and use a typed tagged error.
2. Can it be missing? Model absence with `Option`.
3. Is input external? Decode with `Schema` at the boundary.
4. Am I touching arrays/objects/strings? Use Effect modules, not native methods.
5. Am I branching on shape/type? Use `Predicate` and `Match`.
6. Am I defining services? Use `ServiceMap.Service` + `Layer` + Identity composer.
7. Am I defining object schemas? Prefer `S.Class` (avoid `S.Struct` by default).
8. For non-class schemas, did I export the runtime type alias with the same identifier name?
9. Did I annotate schemas with canonical `$I.annote(...)` metadata?
10. Is this a discriminated union schema? Prefer `S.TaggedUnion` or `S.toTaggedUnion`.
11. Is this a reusable domain function returning an `Effect`? Use `Effect.fn` or `Effect.fnUntraced`.
12. Is this effect observable? Add logs, span annotations, and metrics where relevant.
13. Am I expressing durations/time windows? Use `effect/Duration`.
14. Am I mapping nullable/nullish schema values to `Option`? Use `S.OptionFrom*` helpers.
15. Am I creating an exported helper API? Prefer dual data-first/data-last with `dual`.
16. Am I parsing/stringifying JSON? Use schema JSON codecs, never `JSON.parse` / `JSON.stringify`.
17. Am I executing an effect? Keep `Effect.run*` calls at app/test runtime boundaries only.
18. Am I wrapping Promise-based APIs at boundaries with `Effect.tryPromise`?
19. Am I acquiring resources? Use `Effect.acquireUseRelease` / `Effect.scoped` so release is guaranteed.
20. Am I retrying work? Use `Effect.retry` with `Schedule`, never manual retry loops.
21. Am I modeling timeout outcomes? Prefer `Effect.timeoutOption` or `Effect.timeoutOrElse`.
22. Am I forking? Prefer `Effect.forkChild`; use `Effect.forkDetach` only for explicit daemon behavior.
23. Am I running fan-out work? Set explicit concurrency for `Effect.forEach` / `Effect.all` where appropriate.
24. Am I reading config? Use `Config` / `ConfigProvider`, not direct `process.env` in domain code.
25. Am I handling secrets? Use `Config.redacted` / `Redacted` so values stay protected in logs.
26. Am I recovering errors? Prefer `Effect.catchTag` / `Effect.catchFilter` over broad catch-all recovery.
27. Am I encoding expected failure vs invariant defect correctly (`fail` vs `die`)?
28. Am I providing layers where isolation matters? Use `Effect.provide(..., { local: true })` or `Layer.fresh(...)`.
29. Am I about to write a plain `type` / `interface` that can be expressed as `Schema`? If yes, make Schema the source of truth.

## Non-Negotiable Laws

1. Canonical aliases are mandatory:
   - `effect/Array` as `A`
   - `effect/Option` as `O`
   - `effect/Predicate` as `P`
   - `effect/Record` as `R`
   - `effect/Schema` as `S`
2. For other stable modules, prefer root imports from `"effect"`.
3. No `any`, type assertions, `@ts-ignore`, or non-null assertions.
4. No plain `throw`, `new Error`, or untyped error channels in production logic.
5. No nullish leak in domain logic; convert nullish to `Option` at boundaries.
6. No direct `typeof` checks when `effect/Predicate` covers the case.
7. No native `Object/Map/Set/Date/String` helpers in domain logic.
8. For tooling source, use `S.TaggedErrorClass` typed errors.
9. Exported APIs need JSDoc and docgen-clean examples.
10. Do not finish with failing `check`, `lint`, `test`, or `docgen`.
11. Do not suffix schema constants with `Schema`; use the domain name.
12. For non-class schemas, export runtime type aliases with the same name: `export type X = typeof X.Type`.
13. Do not use native `switch`; use `effect/Match`.
14. All new schemas must be meaningfully annotated with `$I.annote("Name", { description })`.
15. Service identifiers must use package composer `.create(...)` and `$I\`MyService\``.
16. Discriminated union schemas should prefer `S.TaggedUnion`; use `S.toTaggedUnion` for non-`_tag` unions.
17. Reusable domain functions returning `Effect` should use `Effect.fn` (or `Effect.fnUntraced` for hot/internal paths). Combinator helpers and schema-derived constructors may return `Effect` directly.
18. Effect workflows should be observable with logging, spans, and metrics (`effect/Metric` + `Effect.track*`).
19. Durations and time windows should use `effect/Duration`, not ad-hoc number literals.
20. For nullable/nullish/optional schema-to-`Option` conversions, use `S.OptionFromNullOr`, `S.OptionFromNullishOr`, `S.OptionFromOptionalKey`, or `S.OptionFromOptional`.
21. Exported helper utilities should expose dual data-first/data-last forms via `dual` from `effect/Function`.
22. Never use `JSON.parse` / `JSON.stringify` in Effect-first code; use `S.UnknownFromJsonString` / `S.fromJsonString` + `S.decodeUnknown*` / `S.encode*`.
23. Prefer `S.Class` over `S.Struct` for domain object schemas; use `S.Struct` only when a concrete boundary exception is required.
24. Only runtime boundaries (app entrypoints/tests) may call `Effect.runSync` / `Effect.runPromise` / `Effect.runFork`; libraries return `Effect`.
25. Promise-returning APIs must be lifted with `Effect.tryPromise` at boundaries.
26. Resource lifetimes must be explicit with `Effect.acquireUseRelease` or `Effect.scoped`.
27. Retries must be expressed via `Effect.retry` and `Schedule`, not manual retry loops.
28. Timeout behavior should be modeled with `Effect.timeoutOption` / `Effect.timeoutOrElse` instead of ad-hoc timers.
29. Forking defaults to `Effect.forkChild`; `Effect.forkDetach` requires explicit daemon intent.
30. Parallel fan-out should set explicit concurrency for `Effect.forEach` / `Effect.all` / `Effect.validate` when load is non-trivial.
31. Config should be modeled via `Config` and `ConfigProvider`, not direct `process.env` access in domain services.
32. Secrets must be represented as `Redacted` values (`Config.redacted` / `Redacted.make`) and never logged raw.
33. Error recovery should be precise (`catchTag` / `catchFilter`) instead of blanket recovery that hides unrelated failures.
34. Use `Effect.fail` for expected business errors and reserve `Effect.die` / `Effect.orDie` for invariants and impossible states.
35. When layer memoization sharing is unsafe, force isolation with `Effect.provide(..., { local: true })` or `Layer.fresh`.
36. Schema-first development: if a data model can be represented as `Schema`, define the `Schema` first and derive runtime types from it; avoid plain `type` / `interface` for domain data shapes.

## Always / Never Examples

### 1) Absence handling

```ts
import { pipe } from "effect"
import * as A from "effect/Array"
import * as O from "effect/Option"

// NEVER: User | undefined
// const user = users.find((u) => u.id === id)

// ALWAYS: Option<User>
const user = pipe(
  users,
  A.findFirst((u) => u.id === id)
)

const name = pipe(
  user,
  O.map((u) => u.name),
  O.getOrElse(() => "anonymous")
)
```

### 2) Typed error boundary

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { $PackageNameId } from "@beep/identity/packages"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

class JsonParseError extends S.TaggedErrorClass<JsonParseError>($I`JsonParseError`)(
  "JsonParseError",
  { message: S.String, input: S.String },
  $I.annote("JsonParseError", { description: "Invalid JSON payload" })
) {}

const parseJson = (raw: string) =>
  S.decodeUnknownEffect(S.UnknownFromJsonString)(raw).pipe(
    Effect.mapError((cause) => new JsonParseError({ message: cause.message, input: raw }))
  )
```

### 3) Schema naming + annotation

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

// NEVER: export const UserSchema = S.Struct(...)
// NEVER: export interface User { readonly id: string; readonly name: string }
// ALWAYS: prefer S.Class for object schemas.
export class User extends S.Class<User>($I`User`)(
  {
    id: S.String,
    name: S.String
  },
  $I.annote("User", {
    description: "Application user payload."
  })
) {}

const decodeUser = S.decodeUnknownEffect(User)
```

### 4) Type checks

```ts
import * as P from "effect/Predicate"

// NEVER: typeof value === "string"
// ALWAYS:
const isStringValue = P.isString(value)
```

### 5) Match over switch

```ts
import * as Match from "effect/Match"

type Status = "queued" | "running" | "failed"

// NEVER:
// switch (status) {
//   case "queued": return "queued"
//   case "running": return "running"
//   case "failed": return "failed"
// }

// ALWAYS:
const toLabel = (status: Status) =>
  Match.value(status).pipe(
    Match.when("queued", () => "queued"),
    Match.when("running", () => "running"),
    Match.when("failed", () => "failed"),
    Match.exhaustive
  )
```

### 6) Tagged unions and exhaustive branching

```ts
import { Data } from "effect";

export type JobState = Data.TaggedEnum<{
  readonly Queued: {};
  readonly Running: { readonly workerId: string };
  readonly Failed: { readonly reason: string };
}>;

export const JobState = Data.taggedEnum<JobState>();

export const render = JobState.$match({
  Queued: () => "queued",
  Running: ({ workerId }) => `running:${workerId}`,
  Failed: ({ reason }) => `failed:${reason}`,
});
```

### 7) Service identity via package composer

```ts
import { $PackageNameId } from "@beep/identity/packages"
import { ServiceMap } from "effect"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class MyService extends ServiceMap.Service<MyService, {
  readonly ping: () => string
}>()($I`MyService`) {}
```

### 8) Discriminated union schemas

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

// Preferred when the discriminant is `_tag`.
export const TaskEvent = S.TaggedUnion({
  Created: { id: S.String },
  Completed: { id: S.String, at: S.String }
})

// Use toTaggedUnion for external unions or non-standard discriminants.
export class ExternalTaskCreated extends S.Class<ExternalTaskCreated>($I`ExternalTaskCreated`)({
  kind: S.tag("created"),
  id: S.String
}) {}

export class ExternalTaskCompleted extends S.Class<ExternalTaskCompleted>($I`ExternalTaskCompleted`)({
  kind: S.tag("completed"),
  id: S.String,
  at: S.String
}) {}

export const ExternalTaskEvent = S.Union([
  ExternalTaskCreated,
  ExternalTaskCompleted
]).pipe(S.toTaggedUnion("kind"))
```

### 9) Effect-returning functions

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"

// Public or reusable flow: traced.
export const fetchProfile = Effect.fn("Profile.fetch")(function* (userId: string) {
  yield* Effect.logDebug("fetch profile", userId)
  return { userId }
})

// Internal hot-path flow: untraced.
const parseSmallPayload = Effect.fnUntraced(function* (raw: string) {
  return yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(raw)
})
```

### 10) Observability and metrics

```ts
import { Effect } from "effect"
import * as Metric from "effect/Metric"

const latency = Metric.histogram("operation_duration_ms", {
  boundaries: Metric.boundariesFromIterable([10, 50, 100, 250, 500, 1000])
})
const errors = Metric.counter("operation_errors_total")

const runOperation = Effect.fn("Operation.run")(function* (id: string) {
  yield* Effect.annotateCurrentSpan("operationId", id)
  yield* Effect.logInfo("operation started")
  return "ok"
}).pipe(
  Effect.withLogSpan("operation.run"),
  Effect.annotateLogs({ service: "beep-effect" }),
  Effect.trackDuration(latency),
  Effect.trackErrors(errors)
)
```

### 11) Duration values

```ts
import { Duration, Effect } from "effect"

const requestTimeout = Duration.seconds(30)
const retryWindow = Duration.minutes(5)

const program = Effect.sleep(retryWindow).pipe(
  Effect.timeout(requestTimeout)
)
```

### 12) Nullish schemas to Option

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class ProfileInput extends S.Class<ProfileInput>($I`ProfileInput`)({
  nickname: S.OptionFromNullishOr(S.String),
  email: S.OptionFromOptionalKey(S.String),
  backupEmail: S.OptionFromOptional(S.String),
  avatarUrl: S.OptionFromNullOr(S.String)
}) {}
```

### 13) Dual helper APIs

```ts
import { dual } from "effect/Function"
import { pipe } from "effect"

export const prefixTag: {
  (tag: string): (self: string) => string
  (self: string, tag: string): string
} = dual(2, (self: string, tag: string) => `[${tag}] ${self}`)

const dataFirst = prefixTag("hello", "info")
const dataLast = pipe("hello", prefixTag("info"))
```

### 14) JSON parse / stringify with Schema

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class User extends S.Class<User>($I`User`)({
  id: S.String,
  name: S.String
}) {}

const UserJson = S.fromJsonString(User)

const decodeUserJson = S.decodeUnknownEffect(UserJson)
const encodeUserJson = S.encodeUnknownEffect(UserJson)

const decodeUnknownJson = S.decodeUnknownEffect(S.UnknownFromJsonString)
const encodeUnknownJson = S.encodeUnknownEffect(S.UnknownFromJsonString)
```

### 15) Runtime boundary for running effects

```ts
import { Effect } from "effect"

// Library export: return Effect, do not run it here.
export const generateReport = Effect.fn("Report.generate")(function* () {
  return "report"
})

// App/test boundary only:
// Effect.runPromise(generateReport())
```

### 16) Promise boundaries with `Effect.tryPromise`

```ts
import { Effect } from "effect"

const fetchBody = (url: string) =>
  Effect.tryPromise({
    try: () => fetch(url).then((response) => response.text()),
    catch: (cause) => new HttpRequestError({ url, message: String(cause) })
  })
```

### 17) Scoped resource safety

```ts
import { Effect } from "effect"

const withConnection = <A, E, R>(
  use: (conn: Connection) => Effect.Effect<A, E, R>
) =>
  Effect.acquireUseRelease(
    openConnection,
    use,
    closeConnection
  )
```

### 18) Retry + timeout modeling

```ts
import { Duration, Effect, Schedule } from "effect"

const resilient = task.pipe(
  Effect.retry(Schedule.recurs(3)),
  Effect.timeoutOption(Duration.seconds(5))
)
```

### 19) Structured concurrency + bounded parallelism

```ts
import { Effect, Fiber } from "effect"

const runWorkers = Effect.fn("Workers.run")(function* (jobs: ReadonlyArray<Job>) {
  const fiber = yield* Effect.forkChild(backgroundHeartbeat)
  const results = yield* Effect.forEach(jobs, runJob, { concurrency: 8 })
  yield* Fiber.interrupt(fiber)
  return results
})
```

### 20) Config + secret redaction

```ts
import { Config, Effect } from "effect"

const loadSettings = Effect.fn("Settings.load")(function* () {
  const port = yield* Config.int("PORT")
  const apiKey = yield* Config.redacted("API_KEY")

  yield* Effect.logInfo(`port=${port}`)
  yield* Effect.logDebug(`apiKey=${String(apiKey)}`)

  return { port, apiKey }
})
```

## Source of Truth References

- [Effect LLMS guide](../../../.repos/effect-smol/LLMS.md)
- [Effect ai-docs index](../../../.repos/effect-smol/ai-docs/src/index.md)
- [Effect migration notes](../../../.repos/effect-smol/MIGRATION.md)
- [Effect Schema docs](../../../.repos/effect-smol/packages/effect/SCHEMA.md)
- [Effect core API source](../../../.repos/effect-smol/packages/effect/src/Effect.ts)
- [Effect Config source](../../../.repos/effect-smol/packages/effect/src/Config.ts)
- [Effect Fiber source](../../../.repos/effect-smol/packages/effect/src/Fiber.ts)

### 21) Precise recovery by tag

```ts
import { Effect } from "effect"
import * as O from "effect/Option"

const findUserOptional = (id: string) =>
  findUser(id).pipe(
    Effect.map(O.some),
    Effect.catchTag("UserNotFoundError", () => Effect.succeed(O.none()))
  )
```

### 22) Expected failures vs defects

```ts
import { Effect } from "effect"

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
import { Effect, Layer } from "effect"

const isolatedProgram = program.pipe(
  Effect.provide(Layer.fresh(AppLayer), { local: true })
)
```

## Verify

1. `rg -n " as |@ts-ignore|!\\.|\\bany\\b" apps packages tooling`
2. `rg -n "new Error\\(|throw " apps packages tooling`
3. `rg -n "typeof " apps packages tooling`
4. `rg -n "\\bswitch\\s*\\(" apps packages tooling`
5. `rg -n "export const [A-Za-z0-9_]+Schema\\b" apps packages tooling`
6. `rg -n ":\\s*Effect\\.Effect<|=>\\s*Effect\\.Effect<|=>\\s*Effect\\.[A-Za-z]+" apps packages tooling`
7. `rg -n "Date\\.now\\(|Math\\.random\\(|setTimeout\\(|setInterval\\(" apps packages tooling`
8. `rg -n "\\.split\\(|\\.trim\\(|\\.toLowerCase\\(|\\.toUpperCase\\(|\\.replace\\(" apps packages tooling`
9. `rg -n "S\\.Struct\\(" apps packages tooling`
10. `rg -n "^export interface [A-Za-z0-9_]+" apps packages tooling`
11. `rg -n "^export type [A-Za-z0-9_]+\\s*=\\s*\\{" apps packages tooling`
12. `rg -n "JSON\\.parse\\(|JSON\\.stringify\\(" apps packages tooling`
13. `rg -n "Effect\\.run(Sync|Promise|Fork)\\(" apps packages tooling infra`
14. `rg -n "process\\.env" apps packages tooling infra`
15. `rg -n "forkDetach\\(" apps packages tooling`
16. `rg -n "catchAll\\(|Effect\\.catch\\(" apps packages tooling`
17. `rg -n "Redacted\\.value\\(" apps packages tooling`
18. `rg -n "Effect\\.die\\(|Effect\\.orDie\\(" apps packages tooling`
19. `rg -n "Effect\\.provide\\(.*local:\\s*true|Layer\\.fresh\\(" apps packages tooling`
20. `bun run check`
21. `bun run lint`
22. `bun run test`
23. `bun run docgen`

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
5. Am I branching on shape/type/array emptiness? Use `Predicate`, `Match`, and `A.match`.
6. Am I defining services? Use `ServiceMap.Service` + `Layer` + Identity composer.
7. Am I defining object schemas? Prefer `S.Class` (avoid `S.Struct` by default).
8. For non-class schemas, did I export the runtime type alias with the same identifier name?
9. Did I annotate schemas with canonical `$I.annote(...)` metadata?
10. Is this a discriminated union or literal-union schema? Prefer `LiteralKit` + `.mapMembers` + `Tuple.evolve` + `S.toTaggedUnion` (or `S.TaggedUnion` for `_tag` cases).
11. Is this a reusable function returning an `Effect`? Use named `Effect.fn("Namespace.name")` or `Effect.fnUntraced`.
12. Is this a zero-arg effect value rather than a reusable function? Prefer `Effect.gen(...).pipe(Effect.withSpan("Name"))` over immediate `Effect.fn` IIFEs.
13. Is this effect observable? Add spans and structured logs from the start; add metrics where the path is materially important.
14. Am I expressing durations/time windows? Use `effect/Duration`.
15. Am I mapping nullable/nullish schema values to `Option`? Use `S.OptionFrom*` helpers.
16. Am I creating an exported helper API? Prefer dual data-first/data-last with `dual`.
17. Am I parsing/stringifying JSON? Use schema JSON codecs, never `JSON.parse` / `JSON.stringify`.
18. Am I in test code? The same JSON rule still applies there; test fixtures and request bodies should use schema codecs too.
19. Am I executing an effect? Keep `Effect.run*` calls at app/test runtime boundaries only.
20. Am I wrapping Promise-based APIs at boundaries with `Effect.tryPromise`?
21. Am I acquiring resources? Use `Effect.acquireUseRelease` / `Effect.scoped` so release is guaranteed.
22. Am I retrying work? Use `Effect.retry` with `Schedule`, never manual retry loops.
23. Am I modeling timeout outcomes? Prefer `Effect.timeoutOption` or `Effect.timeoutOrElse`.
24. Am I forking? Prefer `Effect.forkChild`; use `Effect.forkDetach` only for explicit daemon behavior.
25. Am I running fan-out work? Set explicit concurrency for `Effect.forEach` / `Effect.all` where appropriate.
26. Am I reading config? Use `Config` / `ConfigProvider`, not direct `process.env` in domain code.
27. Am I handling secrets? Use `Config.redacted` / `Redacted` so values stay protected in logs.
28. Am I recovering errors? Prefer `Effect.catchTag` / `Effect.catchFilter` inside the domain, and `Effect.catchCause` / `Effect.matchCauseEffect` at recovery boundaries.
29. Am I rendering or logging failure detail? Use `Cause.pretty` / `Cause.prettyErrors`, not ad-hoc stringification.
30. Am I encoding expected failure vs invariant defect correctly (`fail` vs `die`)?
31. Am I providing layers where isolation matters? Use `Effect.provide(..., { local: true })` or `Layer.fresh(...)`.
32. Am I about to write a plain `type` / `interface` that can be expressed as `Schema`? If yes, make Schema the source of truth.
33. Am I adding fallback objects in handlers/services? Move defaults into schemas with `S.withConstructorDefault` and `S.withDecodingDefault*`.
34. Am I writing a guard helper for strings/paths/tags? Prefer branded schemas + `S.is(...)` or `P.isTagged(...)` over ad-hoc predicate helpers.
35. Am I comparing schema-modeled domain values? Prefer `S.toEquivalence(...)` over direct `===` / `!==`.
36. Is this deterministic conversion between string/domain representations? Model it as `S.decodeTo(..., SchemaTransformation.transform(...))`.
37. Am I sorting values? Use `A.sort` with an explicit `Order`, never native `.sort()`.
38. Am I coercing unknown/scalar values to strings? Prefer schema transformations over ad-hoc `String(...)` coercion.
39. Am I matching on a plain boolean? Prefer the flattest equivalent form first; reach for `Bool.match(...)` only when both branches are doing meaningful work or it is clearly more readable than direct boolean selection.
40. Am I directly returning a matcher or extracting a reusable matcher? Prefer `Match.type<T>().pipe(...)` or `Match.tags(...)` over `Match.value(...)`.
41. Before I keep an `O.match(...)`, have I checked whether `O.map(...)`, `O.flatMap(...)`, `O.liftPredicate(...)`, and `O.getOrElse(...)` would express the same control flow more flatly?
42. Am I inside a callback-only API (schema transform, parser callback, etc.) that still needs a service? Use `ServiceMap.Service.use(...)` there.
43. Am I manipulating filesystem paths? Use `yield* Path.Path` and its helpers, not `node:path`.
44. Am I doing HTTP I/O? Use `effect/unstable/http` `HttpClient` (no native `fetch`), and provide runtime client layers explicitly (Bun: `@effect/platform-bun/BunHttpClient.layer`).
45. Is a named or reused domain constraint hiding inside predicate helpers? Model it as a schema first, then derive guards with `S.is(...)`.
46. Can a reusable check be expressed with built-in schema constructors/checks before `S.makeFilter`? Prefer that order.
47. Is this an internal literal domain that needs `.is`, `.thunk`, `$match`, or annotation-bearing schema values? Use `LiteralKit`.
48. Is this a reusable schema check or filter group? Give it `identifier`, `title`, and `description`.
49. Am I designing a service or test helper? Keep `FileSystem`, `Path`, and `SqlClient` inside the layer/service unless they are the explicit domain boundary.
50. Am I writing tests for platform/runtime semantics? Prefer `@effect/vitest` for supporting tests, but spawn the real runtime when the assertion is about platform lifecycle behavior.
51. Am I wrapping a helper in a trivial lambda or passthrough `pipe(...)` callback? Prefer direct helper refs, `flow(...)`, and shared thunk helpers when behavior is unchanged.

## Non-Negotiable Laws

1. Canonical aliases are mandatory:
   - `effect/Array` as `A`
   - `effect/Option` as `O`
   - `effect/Predicate` as `P`
   - `effect/Record` as `R`
   - `effect/Schema` as `S`
2. For other stable helper/data modules, prefer dedicated namespace imports (`effect/String` as `Str`, `effect/Equal` as `Eq`, `effect/Boolean` as `Bool`, etc.); reserve root `effect` imports for core combinators/types such as `Effect`, `Match`, `pipe`, and `flow`.
3. No `any`, type assertions, `@ts-ignore`, or non-null assertions.
4. No plain `throw`, `new Error`, or untyped error channels in production logic.
5. No nullish leak in domain logic; convert nullish to `Option` at boundaries.
6. No direct `typeof` checks when `effect/Predicate` covers the case.
7. No native `Object/Map/Set/Date/String` helpers in domain logic.
8. For tooling source, use `TaggedErrorClass` from `@beep/schema`.
9. Exported APIs need JSDoc and docgen-clean examples.
10. Do not finish with failing `check`, `lint`, `test`, or `docgen`.
11. Do not suffix schema constants with `Schema`; use the domain name.
12. For non-class schemas, export runtime type aliases with the same name: `export type X = typeof X.Type`.
13. Do not use native `switch`; use `Match`. For empty/non-empty array branching, prefer `A.match` over manual length checks.
14. All new schemas must be meaningfully annotated with `$I.annote("Name", { description })`.
15. Service identifiers must use package composer `.create(...)` and `$I\`MyService\``.
16. If a schema has properties that are a union of literal strings, it should be a tagged union composed via `LiteralKit`, `.mapMembers`, and `Tuple.evolve`, then finalized with `S.toTaggedUnion`. Use `S.TaggedUnion` only for canonical `_tag` object-union construction.
17. Reusable functions returning `Effect` should use named `Effect.fn("Namespace.name")` (or `Effect.fnUntraced` for hot/internal paths). Zero-arg effect values may stay `Effect.gen(...).pipe(Effect.withSpan("Name"))` when there is no exported/reused function to expose.
18. Effect workflows should be observable with spans and structured logs from the start; add metrics (`effect/Metric` + `Effect.track*`) where the path is important enough to measure.
19. Durations and time windows should use `effect/Duration`, not ad-hoc number literals.
20. For nullable/nullish/optional schema-to-`Option` conversions, use `S.OptionFromNullOr`, `S.OptionFromNullishOr`, `S.OptionFromOptionalKey`, or `S.OptionFromOptional`.
21. Exported helper utilities should expose dual data-first/data-last forms via `dual` from `effect/Function`.
22. Never use `JSON.parse` / `JSON.stringify` in Effect-first code; use `S.UnknownFromJsonString` / `S.fromJsonString` + `S.decodeUnknown*` / `S.encode*`.
23. This JSON rule applies in tests and fixtures too; do not introduce native JSON helpers just because the file is under `test/`.
24. Prefer `S.Class` over `S.Struct` for domain object schemas; use `S.Struct` only when a concrete boundary exception is required.
25. Only runtime boundaries (app entrypoints/tests) may call `Effect.runSync` / `Effect.runPromise` / `Effect.runFork`; libraries return `Effect`.
26. Promise-returning APIs must be lifted with `Effect.tryPromise` at boundaries.
27. Resource lifetimes must be explicit with `Effect.acquireUseRelease` or `Effect.scoped`.
28. Retries must be expressed via `Effect.retry` and `Schedule`, not manual retry loops.
29. Timeout behavior should be modeled with `Effect.timeoutOption` / `Effect.timeoutOrElse` instead of ad-hoc timers.
30. Forking defaults to `Effect.forkChild`; `Effect.forkDetach` requires explicit daemon intent.
31. Parallel fan-out should set explicit concurrency for `Effect.forEach` / `Effect.all` / `Effect.validate` when load is non-trivial.
32. Config should be modeled via `Config` and `ConfigProvider`, not direct `process.env` access in domain services.
33. Secrets must be represented as `Redacted` values (`Config.redacted` / `Redacted.make`) and never logged raw.
34. Error recovery should be precise (`catchTag` / `catchFilter`) instead of blanket recovery that hides unrelated failures; at outer HTTP/process boundaries prefer `Effect.catchCause` / `Effect.matchCauseEffect`.
35. Use `Effect.fail` for expected business errors and reserve `Effect.die` / `Effect.orDie` for invariants and impossible states.
36. When layer memoization sharing is unsafe, force isolation with `Effect.provide(..., { local: true })` or `Layer.fresh`.
37. Schema-first development: if a data model can be represented as `Schema`, define the `Schema` first and derive runtime types from it; avoid plain `type` / `interface` for domain data shapes.
38. Service contracts may stay interfaces, but row shapes, wire payloads, and persisted models should not.
39. Prefer schema-level defaults (`S.withConstructorDefault`, `S.withDecodingDefault`, `S.withDecodingDefaultKey`) instead of ad-hoc runtime fallback object literals.
38. Guard predicates for domain strings/paths/tags should come from branded schemas via `S.is(...)`, not ad-hoc `regex.test(...)` helpers.
39. For schema-modeled domain comparisons, prefer `S.toEquivalence(schema)` over manual `===` / `!==` checks.
40. For deterministic format conversions, prefer schema transformations (`S.decodeTo` + `SchemaTransformation.transform`) over ad-hoc string conversion helpers.
41. Never use native `Array.prototype.sort`; use `A.sort(values, order)` with explicit `Order` instances.
42. Avoid ad-hoc `String(...)` coercion in domain logic; model unknown-to-string normalization with schema transformations and compare via schema equivalence.
43. When branching on boolean values, prefer the flattest equivalent form first; use `Bool.match` when both branches do real work or when it is materially clearer than direct boolean selection.
44. Before keeping `O.match(...)`, check whether `O.map(...)`, `O.flatMap(...)`, `O.liftPredicate(...)`, and `O.getOrElse(...)` express the same control flow more flatly.
45. In callback-only contexts where `yield*` is unavailable (for example `SchemaTransformation.transform*`), consume services with `ServiceMap.Service.use(...)`.
46. Do not import `node:path` in production/tooling source. Use `Path.Path` service (`yield* Path.Path`) for `join`, `resolve`, `relative`, `basename`, etc.
47. Do not use native `fetch` in production/tooling source. Use `HttpClient` from `effect/unstable/http` and provide platform client layers (Bun: `BunHttpClient.layer`).
48. Named or reused domain constraints must be modeled as schemas first; prefer built-in schema constructors/checks before `S.makeFilter`, then derive guards with `S.is(...)`.
49. Reusable `S.makeFilter`, `S.makeFilterGroup`, and reusable built-in check blocks must include `identifier`, `title`, and `description`; `message` stays user-facing.
50. Use `LiteralKit` for internal literal domains when `.is`, `.thunk`, `$match`, or annotation-bearing schema values are part of the design.
51. Prefer `P.isTagged("Tag")` over manual `_tag` guard helpers built from `P.hasProperty`, `P.isObject`, or inline `_tag` string checks.
52. When a matcher is the function body or a reusable helper, prefer `Match.type<T>().pipe(...)` / `Match.tags(...)` over `Match.value(...)`.
53. At logging/recovery boundaries, render causes with `Cause.pretty(...)` or `Cause.prettyErrors(...)` instead of ad-hoc `String(error)` fallback chains.
54. Prefer the tersest equivalent helper form when behavior is unchanged: direct helper refs over trivial wrapper lambdas, `flow(...)` for passthrough `pipe(...)` callbacks, and shared thunk helpers when already in scope.

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
import { TaggedErrorClass } from "@beep/schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

class JsonParseError extends TaggedErrorClass<JsonParseError>($I`JsonParseError`)(
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

### 4b) Schema-backed guards + internal modeling

```ts
import { LiteralKit } from "@beep/schema"
import { $PackageNameId } from "@beep/identity/packages"
import { Match, pipe } from "effect"
import * as A from "effect/Array"
import * as P from "effect/Predicate"
import * as S from "effect/Schema"
import * as Str from "effect/String"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

const TopicKind = LiteralKit(["plain", "scoped"] as const)

const ContainsScopeSeparator = S.String.check(
  S.isIncludes(":", {
    identifier: $I`ContainsScopeSeparatorCheck`,
    title: "Contains Scope Separator",
    description: "A string that contains `:`.",
    message: "Topic text must contain :"
  })
).pipe(
  S.brand("ContainsScopeSeparator"),
  S.annotate($I.annote("ContainsScopeSeparator", {
    description: "A string containing the topic scope separator `:`."
  }))
)

const isContainsScopeSeparator = S.is(ContainsScopeSeparator)

const TopicSegment = S.NonEmptyString.check(
  S.makeFilter(P.not(isContainsScopeSeparator), {
    identifier: $I`TopicSegmentNoSeparatorCheck`,
    title: "Topic Segment No Separator",
    description: "A topic segment that does not contain `:`.",
    message: "Topic segments must not contain :"
  })
).pipe(
  S.brand("TopicSegment"),
  S.annotate($I.annote("TopicSegment", {
    description: "A non-empty topic segment without the scope separator."
  }))
)

const isTopicSegment = S.is(TopicSegment)

const splitNonEmpty =
  (separator: string | RegExp) =>
  (value: string): ReadonlyArray<string> =>
    pipe(Str.split(separator)(value), A.filter(Str.isNonEmpty))

const classifyTopicKind = Match.type<string>().pipe(
  Match.when(isContainsScopeSeparator, TopicKind.thunk.scoped),
  Match.orElse(TopicKind.thunk.plain)
)

export const TopicName = S.NonEmptyString.check(
  S.makeFilterGroup(
    [
      S.makeFilter(P.not(Str.endsWith(":")), {
        identifier: $I`TopicNameNoTrailingSeparatorCheck`,
        title: "Topic Name No Trailing Separator",
        description: "A topic name that does not end with `:`.",
        message: "Topic names must not end with :"
      }),
      S.makeFilter((value: string) =>
        pipe(
          value,
          classifyTopicKind,
          TopicKind.$match({
            plain: isTopicSegment,
            scoped: () => pipe(value, splitNonEmpty(":"), A.every(isTopicSegment))
          })
        ), {
        identifier: $I`TopicNameSegmentsCheck`,
        title: "Topic Name Segments",
        description: "A topic name whose segments are valid topic segments.",
        message: "Topic names must contain only valid segments"
      })
    ],
    {
      identifier: $I`TopicNameChecks`,
      title: "Topic Name",
      description: "Checks for a plain or scoped topic name."
    })
  )
).pipe(
  S.brand("TopicName"),
  S.annotate($I.annote("TopicName", {
    description: "A topic name composed from valid plain or scoped segments."
  }))
)
```

// NEVER: build forests of regex/predicate helpers when the named concepts can be schemas.

### 5) Match over switch

```ts
import { Match } from "effect"
import * as A from "effect/Array"

type Status = "queued" | "running" | "failed"

// NEVER:
// switch (status) {
//   case "queued": return "queued"
//   case "running": return "running"
//   case "failed": return "failed"
// }

// ALWAYS:
const toLabel = Match.type<Status>().pipe(
  Match.when("queued", () => "queued"),
  Match.when("running", () => "running"),
  Match.when("failed", () => "failed"),
  Match.exhaustive
)

const summarize = (items: ReadonlyArray<string>) =>
  A.match(items, {
    onEmpty: () => "none",
    onNonEmpty: (values) => `count:${A.length(values)}`
  })
```

### 6) Tagged unions and exhaustive branching

```ts
import { LiteralKit } from "@beep/schema"
import { $PackageNameId } from "@beep/identity/packages"
import { Tuple } from "effect"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

const JobStateTag = LiteralKit(["queued", "running", "failed"] as const)

export class JobQueued extends S.Class<JobQueued>($I`JobQueued`)(
  { state: S.tag("queued") },
  $I.annote("JobQueued", { description: "Queued job state." })
) {}

export class JobRunning extends S.Class<JobRunning>($I`JobRunning`)(
  { state: S.tag("running"), workerId: S.String },
  $I.annote("JobRunning", { description: "Running job state." })
) {}

export class JobFailed extends S.Class<JobFailed>($I`JobFailed`)(
  { state: S.tag("failed"), reason: S.String },
  $I.annote("JobFailed", { description: "Failed job state." })
) {}

export const JobState = JobStateTag
  .mapMembers(Tuple.evolve([
    () => JobQueued,
    () => JobRunning,
    () => JobFailed
  ]))
  .pipe(S.toTaggedUnion("state"))
  .annotate($I.annote("JobState", { description: "Job lifecycle state union." }))

export type JobState = typeof JobState.Type

export const render = (state: JobState) =>
  JobState.match(state, {
    queued: () => "queued",
    running: ({ workerId }) => `running:${workerId}`,
    failed: ({ reason }) => `failed:${reason}`
  })
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
import { LiteralKit } from "@beep/schema"
import { $PackageNameId } from "@beep/identity/packages"
import { Tuple } from "effect"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

// Preferred when the discriminant is `_tag`.
export const TaskEvent = S.TaggedUnion({
  Created: { id: S.String },
  Completed: { id: S.String, at: S.String }
}).annotate($I.annote("TaskEvent", {
  description: "Canonical internal event union discriminated by `_tag`."
}))

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

const ExternalTaskKind = LiteralKit(["created", "completed"] as const)

export const ExternalTaskEvent = ExternalTaskKind
  .mapMembers(Tuple.evolve([
    () => ExternalTaskCreated,
    () => ExternalTaskCompleted
  ]))
  .pipe(S.toTaggedUnion("kind"))
  .annotate($I.annote("ExternalTaskEvent", {
    description: "External task events discriminated by `kind`."
  }))
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

// Zero-arg reusable values can stay as effects instead of immediate Effect.fn() invocation.
const loadAppConfig = Effect.gen(function* () {
  return yield* S.decodeUnknownEffect(S.Struct({ port: S.Number }))({ port: 8787 })
}).pipe(Effect.withSpan("AppConfig.load"))
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

### 10b) Boundary logging with Cause

```ts
import { Cause, Effect } from "effect"

const respond = <A>(effect: Effect.Effect<A, DomainError>) =>
  effect.pipe(
    Effect.catchCause((cause) => {
      const error = Cause.squash(cause)
      return Effect.logError({
        message: "request failed",
        cause: Cause.pretty(cause)
      }).pipe(
        Effect.zipRight(Effect.fail(error))
      )
    })
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

- [Effect LLMS guide](../../../.repos/effect-v4/LLMS.md)
- [Effect ai-docs index](../../../.repos/effect-v4/ai-docs/src/index.md)
- [Effect migration notes](../../../.repos/effect-v4/MIGRATION.md)
- [Effect Schema docs](../../../.repos/effect-v4/packages/effect/SCHEMA.md)
- [Effect core API source](../../../.repos/effect-v4/packages/effect/src/Effect.ts)
- [Effect Config source](../../../.repos/effect-v4/packages/effect/src/Config.ts)
- [Effect Fiber source](../../../.repos/effect-v4/packages/effect/src/Fiber.ts)

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
20. `rg -n "const hasTag|P\\.hasProperty\\(.*_tag|P\\.isObject\\(.*_tag|Match\\.value\\(" apps packages tooling`
21. `rg -n "Effect\\.fn\\(function\\*|=\\s*Effect\\.gen\\(function\\*" apps packages tooling`
22. `rg -n "Cause\\.pretty\\(|Cause\\.prettyErrors\\(|Effect\\.catchCause\\(|Effect\\.matchCauseEffect\\(" apps packages tooling`
23. `bun run check`
24. `bun run lint`
25. `bun run test`
26. `bun run docgen`

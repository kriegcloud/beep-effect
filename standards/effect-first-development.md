# Effect-First Development

This document defines the working model behind Effect-first code in this repository.
Treat it as the long-form companion to `standards/effect-laws-v1.md`.

## Definition

Effect-first development means domain code is written in Effect-native constructs first, and native JavaScript/TypeScript patterns only at explicit boundaries.

The goal is to make failure, absence, decoding, and dependency wiring explicit and typed.

## Operating Model

Use three layers:

1. Boundary layer:
   - Parse and decode unknown input with `S.decodeUnknown*`.
   - Convert nullish values to `Option`.
   - Convert throwable/rejecting APIs to typed Effect failures.
2. Domain layer:
   - Use Effect modules (`A`, `O`, `R`, `Str`, `HashMap`, `HashSet`) and typed services.
   - Keep business logic pure, explicit, and exhaustive.
3. Runtime layer:
   - Compose layers and run effects.
   - Keep platform concerns (process, filesystem, env, network) outside core domain logic.

## Laws and Conventions

### EF-1: Errors are data, not side effects

- If logic can fail, return `Effect.Effect<A, E, R>` with a typed error `E`.
- Use `S.TaggedErrorClass` for public or cross-module failures.
- Do not `throw` or use `new Error(...)` in production domain logic.

Example:

```ts
import { Effect } from "effect"
import * as O from "effect/Option"
import * as S from "effect/Schema"
import { $PackageNameId } from "@beep/identity/packages"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

class MissingConfigError extends S.TaggedErrorClass<MissingConfigError>($I`MissingConfigError`)(
  "MissingConfigError",
  { key: S.String },
  $I.annote("MissingConfigError", { description: "Required configuration key is missing" })
) {}

const requireEnv = (key: string) =>
  Effect.sync(() => process.env[key]).pipe(
    Effect.flatMap((value) =>
      O.match(O.fromNullishOr(value), {
        onNone: () => Effect.fail(new MissingConfigError({ key })),
        onSome: Effect.succeed
      })
    )
  )
```

### EF-2: Absence is `Option`

- Inside domain code, avoid `| null` and `| undefined`.
- Convert nullable values at boundaries via `O.fromNullishOr`.
- Consume via `O.map`, `O.flatMap`, `O.match`, `O.getOrElse`.

Example:

```ts
import { pipe } from "effect"
import * as O from "effect/Option"

const toDisplayName = (rawName: string | null | undefined) =>
  pipe(
    O.fromNullishOr(rawName),
    O.map((name) => name.trim()),
    O.filter((name) => name.length > 0),
    O.getOrElse(() => "anonymous")
  )
```

### EF-3: Decode unknown input with `Schema`

- Unknown or external data must be decoded at the boundary.
- Prefer `S.decodeUnknownEffect` for effectful paths and `S.decodeUnknownSync` only where sync failure handling is explicit.
- Never use `JSON.parse` / `JSON.stringify`; use schema JSON codecs (`S.UnknownFromJsonString`, `S.fromJsonString`, `S.decodeUnknown*`, `S.encode*`).
- Prefer `S.Class` over `S.Struct` for object/domain schemas.
- Do not name schemas with a `Schema` suffix; schema constants should be named after the domain type.
- For non-class schemas, export type aliases with the same identifier name as the schema value.

Example:

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class CreateTaskInput extends S.Class<CreateTaskInput>($I`CreateTaskInput`)({
  id: S.String,
  title: S.String,
  priority: S.Int
}) {}

export const decodeCreateTaskInput = S.decodeUnknownEffect(CreateTaskInput)
```

### EF-4: Canonical imports

- Required aliases:
  - `import * as A from "effect/Array"`
  - `import * as O from "effect/Option"`
  - `import * as P from "effect/Predicate"`
  - `import * as R from "effect/Record"`
  - `import * as S from "effect/Schema"`
- For other stable modules, prefer root imports from `"effect"`.
- Keep unstable imports deliberate and local.

### EF-5: Effect modules over native collection helpers

- Use `A`, `R`, `Str`, `HashMap`, `HashSet`, `MutableHashMap`, `MutableHashSet`.
- Avoid domain usage of native `Object`, `Map`, `Set`, `Date`.

Example:

```ts
import { pipe } from "effect"
import * as A from "effect/Array"
import * as O from "effect/Option"

const findActiveEmail = (users: ReadonlyArray<{ readonly active: boolean; readonly email: string }>) =>
  pipe(
    users,
    A.findFirst((user) => user.active),
    O.map((user) => user.email)
  )
```

### EF-6: Predicate checks over raw runtime checks

- Prefer `P.isString`, `P.isNumber`, `P.isObject`, and predicate composition.
- Avoid raw `typeof`/ad-hoc runtime checks when a Predicate helper exists.

### EF-7: Branch with `Match`; model states with `Data.TaggedEnum`

- For multi-branch domain states, use tagged unions and exhaustive matching.
- Replace brittle if/else ladders with `Match`.
- Do not use native `switch` statements for domain branching.

Example:

```ts
import { Data } from "effect"
import * as Match from "effect/Match"

type SyncState = Data.TaggedEnum<{
  Idle: {}
  Running: { readonly attempt: number }
  Failed: { readonly reason: string }
}>

const SyncState = Data.taggedEnum<SyncState>()

const stateLabel = Match.type<SyncState>().pipe(
  Match.tags({
    Idle: () => "idle",
    Running: ({ attempt }) => `running:${attempt}`,
    Failed: ({ reason }) => `failed:${reason}`
  }),
  Match.exhaustive
)
```

### EF-8: Services use `ServiceMap.Service` + `Layer`

- Service identity comes from `@beep/identity` composer keys.
- Service constructors are explicit and layered.
- Dependency wiring happens in Layer composition, not hidden global state.
- Service identity must use package-specific composer `.create("path")` and the tagged template key form `$I\`ServiceName\``.

Example:

```ts
import { $PackageNameId } from "@beep/identity/packages"
import { ServiceMap } from "effect"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class MyService extends ServiceMap.Service<MyService, {
  readonly ping: () => string
}>()($I`MyService`) {}
```

### EF-9: Time/randomness should be effectful

- Prefer Effect runtime services such as `Clock` and `Random`.
- Avoid direct `Date.now()` and `Math.random()` in domain logic.

### EF-10: Tests stay effect-native

- Use `@effect/vitest` and `it.effect(...)` for effectful tests.
- Keep fixtures typed and schema-validated where useful.

### EF-11: Public APIs are documented

- Exported APIs in package/tooling source require JSDoc.
- Examples must remain docgen-clean.

### EF-12: Schema annotation is required

- New schemas must include meaningful annotation metadata via canonical `$I.annote(...)`.
- Annotation descriptions should encode intent, not repeat the symbol name.

Example:

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export const Tenant = S.String.annotate(
  $I.annote("Tenant", {
    description: "Logical tenant identifier used for request and storage partitioning."
  })
)

export type Tenant = typeof Tenant.Type
```

### EF-13: Discriminated union schemas

- Prefer `S.TaggedUnion` when using `_tag`-based variants.
- Use `S.toTaggedUnion("fieldName")` for unions with non-`_tag` discriminants or external union sources.
- Reference: [effect-smol schema docs](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/SCHEMA.md:1891) and [toTaggedUnion notes](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/SCHEMA.md:1934).

Example:

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export const JobEvent = S.TaggedUnion({
  Created: { id: S.String },
  Completed: { id: S.String, at: S.String }
})

export type JobEvent = typeof JobEvent.Type

export class ExternalJobEventCreated extends S.Class<ExternalJobEventCreated>($I`ExternalJobEventCreated`)({
  kind: S.tag("created"),
  id: S.String
}) {}

export class ExternalJobEventCompleted extends S.Class<ExternalJobEventCompleted>($I`ExternalJobEventCompleted`)({
  kind: S.tag("completed"),
  id: S.String,
  at: S.String
}) {}

export const ExternalJobEvent = S.Union([
  ExternalJobEventCreated,
  ExternalJobEventCompleted
]).pipe(S.toTaggedUnion("kind"))

export type ExternalJobEvent = typeof ExternalJobEvent.Type
```

### EF-14: Effect-returning functions use `Effect.fn` or `Effect.fnUntraced`

- Prefer `Effect.fn("Name")(...)` for reusable/public effectful functions.
- Use `Effect.fnUntraced(...)` for internal hot paths where tracing overhead is unnecessary.
- Reference: [Effect.fn docs](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/Effect.ts:12850) and [Effect.fnUntraced docs](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/Effect.ts:12821).

Example:

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"

export const loadUser = Effect.fn("User.load")(function* (userId: string) {
  yield* Effect.logDebug("loading user", userId)
  return { userId }
})

const parseInternal = Effect.fnUntraced(function* (input: string) {
  return yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(input)
})
```

### EF-15: Effects must be observable

- Instrument key workflows with logs, log annotations, spans, and metrics.
- Prefer built-in helpers:
  - Logging: `Effect.logWithLevel`, `Effect.log`, `Effect.logFatal`, `Effect.logWarning`, `Effect.logError`, `Effect.logInfo`, `Effect.logDebug`, `Effect.logTrace`
  - Logger/context: `Effect.withLogger`, `Effect.annotateLogs`, `Effect.annotateLogsScoped`, `Effect.withLogSpan`
  - Metrics/tracking: `Effect.track`, `Effect.trackSuccesses`, `Effect.trackErrors`, `Effect.trackDefects`, `Effect.trackDuration`
  - Tracing: `Effect.annotateSpans`, `Effect.annotateCurrentSpan`

Example:

```ts
import { Effect } from "effect"
import * as Metric from "effect/Metric"

const durationMs = Metric.histogram("workflow_duration_ms", {
  boundaries: Metric.boundariesFromIterable([10, 50, 100, 250, 500, 1000])
})
const failures = Metric.counter("workflow_failures_total")

const workflow = Effect.fn("Workflow.run")(function* (requestId: string) {
  yield* Effect.annotateCurrentSpan("requestId", requestId)
  yield* Effect.logInfo("workflow started")
  return "ok"
}).pipe(
  Effect.withLogSpan("workflow.run"),
  Effect.annotateLogs({ service: "beep-effect" }),
  Effect.trackDuration(durationMs),
  Effect.trackErrors(failures)
)
```

### EF-16: Durations and windows use `effect/Duration`

- Model timeouts, intervals, and windows with `Duration`.
- Avoid magic number time values in domain logic.

Example:

```ts
import { Duration, Effect } from "effect"

const timeout = Duration.seconds(30)
const pollInterval = Duration.millis(250)

const program = Effect.sleep(pollInterval).pipe(Effect.timeout(timeout))
```

### EF-17: Nullable/nullish schema fields should decode to `Option`

- Use dedicated schema helpers for optional/null conversions:
  - `S.OptionFromNullOr`
  - `S.OptionFromNullishOr`
  - `S.OptionFromOptionalKey`
  - `S.OptionFromOptional`
- Reference: [Schema Option helpers](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/Schema.ts:5422) and [Schema optional field docs](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/SCHEMA.md:636).

Example:

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class AccountInput extends S.Class<AccountInput>($I`AccountInput`)({
  nickname: S.OptionFromNullishOr(S.String),
  bio: S.OptionFromNullOr(S.String),
  phone: S.OptionFromOptionalKey(S.String),
  timezone: S.OptionFromOptional(S.String)
}) {}
```

### EF-18: Exported helper APIs should be dual

- For reusable helper combinators, support both styles:
  - Data-first: `fn(self, arg)`
  - Data-last: `pipe(self, fn(arg))`
- Build these helpers with `dual` from `effect/Function`.
- Reference: [dual API](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/Function.ts:106).

Example:

```ts
import { dual } from "effect/Function"
import { pipe } from "effect"

export const addPrefix: {
  (prefix: string): (self: string) => string
  (self: string, prefix: string): string
} = dual(2, (self: string, prefix: string) => `${prefix}${self}`)

const a = addPrefix("value", "p:")
const b = pipe("value", addPrefix("p:"))
```

### EF-19: JSON parse/stringify must use Schema

- Use `S.UnknownFromJsonString` for unknown JSON payloads.
- Use `S.fromJsonString(MySchema)` for typed JSON string boundaries.
- Avoid direct `JSON.parse` / `JSON.stringify` in Effect-first code.
- Reference: [UnknownFromJsonString](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/SCHEMA.md:4011) and [fromJsonString](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/SCHEMA.md:4028).

Example:

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
```

### EF-20: Completion gate is strict

You are not done if these fail:

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`

If agent instruction surfaces changed, also run:

- `bun run agents:pathless:check`

## Copy-Paste Templates

### Template: Tagged error with Identity composer

```ts
import * as S from "effect/Schema"
import { $PackageNameId } from "@beep/identity/packages"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

class DomainError extends S.TaggedErrorClass<DomainError>($I`DomainError`)(
  "DomainError",
  {
    message: S.String
  },
  $I.annote("DomainError", { description: "Domain failure" })
) {}
```

### Template: Safe nullable boundary conversion

```ts
import { pipe } from "effect"
import * as O from "effect/Option"

const fromNullableName = (name: string | null | undefined) =>
  pipe(
    O.fromNullishOr(name),
    O.filter((value) => value.length > 0)
  )
```

### Template: Decode unknown at API edge

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class Payload extends S.Class<Payload>($I`Payload`)({
  query: S.String
}) {}

const decodePayload = S.decodeUnknownEffect(Payload)
```

### Template: Schema naming + type alias (no `Schema` suffix)

```ts
import * as S from "effect/Schema"

export const OrderId = S.String
export type OrderId = typeof OrderId.Type
```

### Template: Match over switch

```ts
import * as Match from "effect/Match"

type Phase = "draft" | "running" | "done"

const phaseLabel = (phase: Phase) =>
  Match.value(phase).pipe(
    Match.when("draft", () => "draft"),
    Match.when("running", () => "running"),
    Match.when("done", () => "done"),
    Match.exhaustive
  )
```

### Template: Effect-returning function constructor

```ts
import { Effect } from "effect"

export const runTask = Effect.fn("Task.run")(function* (taskId: string) {
  yield* Effect.logInfo("run task", taskId)
  return taskId
})
```

### Template: Option schema from nullish/optional

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class Input extends S.Class<Input>($I`Input`)({
  maybeName: S.OptionFromNullishOr(S.String),
  maybeEmail: S.OptionFromOptionalKey(S.String)
}) {}
```

### Template: Dual helper (data-first + data-last)

```ts
import { dual } from "effect/Function"

export const rename: {
  (to: string): (self: { readonly name: string }) => { readonly name: string }
  (self: { readonly name: string }, to: string): { readonly name: string }
} = dual(2, (self, to) => ({ ...self, name: to }))
```

### Template: JSON boundary without native JSON APIs

```ts
import { $PackageNameId } from "@beep/identity/packages"
import * as S from "effect/Schema"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")

export class Payload extends S.Class<Payload>($I`Payload`)({
  query: S.String
}) {}

const PayloadJson = S.fromJsonString(Payload)

export const decodePayloadJson = S.decodeUnknownEffect(PayloadJson)
export const encodePayloadJson = S.encodeUnknownEffect(PayloadJson)
```

## LLM Review Checklist

Use this before submitting code:

1. No `any`, no type assertions, no `@ts-ignore`, no non-null assertions.
2. No untyped error throwing in domain logic.
3. Nullish converted to `Option` at boundaries.
4. Unknown input decoded with `Schema`.
5. `A/O/P/R/S` aliases present and used.
6. No native `Object/Map/Set/Date` in domain logic.
7. Branching logic is exhaustive where appropriate (`Match.exhaustive`).
8. No new schema constants end with `Schema`.
9. For non-class schemas, new schema constants expose `export type X = typeof X.Type`.
10. New schemas are annotated using `$I.annote(...)`.
11. `Effect`-returning reusable functions are created with `Effect.fn`/`Effect.fnUntraced`.
12. Critical flows include logs/spans/metrics instrumentation.
13. Durations/time windows use `Duration` values.
14. Nullish schema fields use `S.OptionFrom*` helpers when representing absence as `Option`.
15. Exported helper combinators support dual API via `dual`.
16. No `JSON.parse` / `JSON.stringify` in Effect-first domain paths.
17. Prefer `S.Class` over `S.Struct` for new object schemas.
18. Required verification commands are green.

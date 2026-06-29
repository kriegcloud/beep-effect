## Effect

- Effectful wrappers must use `Effect.fnUntraced` unless spans are required. Use `Effect.fn` when spans are needed. Do not write `(...args) => Effect.gen(function* () { ... })`.
- An `Effect.fnUntraced` that only does `return yield* effect` is not allowed. Write the direct effect expression instead of wrapping it in a generator.
- Outside generators, yieldables must be converted with `.asEffect()` before piping.
- All streaming implementations, including SSE and WebSockets, must use Effect `Stream`. SSE must use `effect/unstable/encoding/Sse` for framing. WebSockets must use first party Effect socket abstractions.
- Final live layers (`Rpc.toLayer`, service layers, middleware layers) must be typed as `Layer.Layer<ProvidedServices>`. Intermediate and test-exported layers must infer naturally. Use `Layer.orDie` only on final live compositions whose remaining errors are truly unrecoverable.
- Never use `Effect.orDie`. Handle typed errors explicitly with `Effect.catchTag` or `Effect.catchTags`, then `Effect.die` only when the failure is genuinely unrecoverable.
- Do not use the global `Error` class in app code. Use `Schema.TaggedError` with a `_tag` discriminator. Reuse an existing tagged error when one already fits.
- Do not probe errors with checks like `if ("_tag" in error)`. That is an anti pattern. All app errors must already be `Schema.TaggedError` values with a typed `_tag`, so match on the typed error channel instead.
- Yield services from context inside effect bodies. Do not pass service instances as function arguments.
- Services must expose typed errors, not defects.
- Services must expose typed errors only for actionable failures that callers can handle. If a tagged error has a `reason` field, it must use `Schema.Literals(...)` with PascalCase values.
- Non actionable failures must not be exposed as typed errors. Catch them at the service definition with `Effect.catchTag` or `Effect.catchTags` and `Effect.die`, or let existing defects propagate naturally.
- Do not invent generic typed errors like `XFailed`, `InternalError`, or `UnknownError`. When a failure is actionable, define a specific `Schema.TaggedError` for it.
- Do not erase error channels with `unknown` in `Effect<A, unknown>`, `Cause<unknown>`, or `Exit<A, unknown>`. Keep expected errors precisely typed so callers can safely pattern match on `_tag`.
- When turning Effect causes into user visible or event payload text, use `Cause.pretty(...)`. Do not add bespoke `xFailureToMessage` style helpers. If an error needs a better message than its `_tag` or existing fields provide, define that message on the tagged error itself.
- Do not use `Schema.Unknown` in app code or AI output schemas. Use explicit `Schema.Struct` shapes or `Schema.Json`.

## Architecture

- Prefer referentially transparent and pure functions.
- Immutability is required unless code is truly performance critical, which is rare.
- Default props, params, and collections to readonly shapes such as `readonly` properties and `ReadonlyArray`.
- Prefer Effect collection modules such as `Array` for immutable collection transforms.
- For repeated or complex nested immutable updates, use Effect `Optic`.
- Prefer flat directory structures. Each module should have its own directory with its files directly inside it instead of extra nesting layers.
- Follow DDD style colocation. Define domain modules inside the directory for that domain, export them there, and import them from that domain location instead of creating global shared domain modules.
- With TanStack Router, keep each route's file and its page specific code colocated in that route directory.
- Put non route page files in a nested directory whose name starts with `-` so TanStack Router ignores it recursively.
- When working on dashboard page layout, tables, or app shell UI, read `knowledge/rules/dashboard-ui.md` first and follow it.
- Entity IDs are branded with `Schema.brand` in the owning RPC module. Construct branded IDs with `EntityId.makeUnsafe()`. Never cast with `as EntityId`.
- No barrel `index.ts` files. Import from the defining module.
- Navigation actions must use real links, not buttons. Preserve normal link semantics like middle click, open in a new tab, and copy link target. When a destination should open in a new tab, use a real link with `target="_blank"`.
- Do not use optional properties when every consumer passes the value. Reserve them for generic primitive level modules.
- Pipeable values must use `.pipe(...)`. Non pipeable values must use Effect `pipe()` and `flow()`. Do not write nested application like `f(g(x))`.
- Named schemas must add `.annotate({ identifier: "MySchemaName" })`.

## Frontend State

- When working with Effect Atom or Effect Form state, read `knowledge/rules/effect-atom.md` first and follow it.

## Forms

- When working on forms or validation UX, read `knowledge/rules/form-validation-message.md` first and follow it.
- All forms that can lose in progress user input must opt into unsaved change protection with the existing form blocking abstractions.
- For dialog forms, use `FormDialog` with `isDirty` wired correctly, or `FormBlocker` when the flow does not use `FormDialog`.
- For page or route forms, use `useFormNavigationBlocker` or an equivalent existing blocker abstraction.
- The only exception is when the draft is preserved in external storage or another durable state mechanism, so leaving does not lose user work.

## Notifications

- Do not use toast notifications.
- When a task involves notifications, alerts, banners, or other user messages that might otherwise become a toast, read `knowledge/rules/accessible-notifications-and-messages.md` first and follow it.

## Observability

- Do not add manual logging or log annotations for error paths. OTEL spans already capture failures and context.
- Tracing must use `Effect.withSpan` or `Effect.fn`.
- Logging is only for domain level informational events like startup or sync progress.

## Testing

- Non autogenerated code must maintain at least 80 percent test coverage.
- Coverage is a floor, not a goal. Write high value tests only, and do not add low value, redundant, or superfluous tests just to increase coverage.
- Tests use production composition. Mock only true external boundaries by swapping the boundary layer.
- Prefer regression tests, user path tests, and business logic tests that prevent future breakage.
- For bug fixes, add a regression test when practical.
- Prefer behavior and contract tests over implementation detail tests.
- Tests must be deterministic. Do not rely on arbitrary sleeps, timing races, or uncontrolled external state.
- For time dependent Effect tests, use `TestClock` and advance logical time with `TestClock.adjust(...)` or `TestClock.setTime(...)` instead of waiting on wall clock time.
- Use live time only for true external timing boundaries that `TestClock` cannot control.
- Do not test what TypeScript already proves, such as simple invalid argument types, unless the code relies on complex type level behavior in reusable library style code.
- Do not test behavior that third party libraries already guarantee unless the repo adds meaningful integration logic on top.

## Commit And PR Writing

- Do not use conventional prefixes.
- Keep commit messages and PR titles lowercase, concise, and direct.
- Keep PR descriptions short and focused.
- Do not add commit bodies, extra PR sections, or AI attribution unless strictly necessary.

# Better Auth Handler Helper Plan

## Context
- `iam-client` and other SDK clients repeat the same pattern for each Better Auth call: schema encode, `Effect.tryPromise`, manual error guard, `withToast`, `Effect.catchAll`, `Effect.asVoid` (e.g. `signInEmail` in `packages/iam/sdk/src/clients/iam-client.ts:25`-47 and `verifyTotp` in `packages/iam/sdk/src/clients/iam-client.ts:288`-310).
- `sign-in` client mirrors the same flow, demonstrating the duplication problem when we add new plugins (`packages/iam/sdk/src/clients/sign-in/sign-in.client.ts:16`-107).
- Toast plumbing lives in `packages/ui/src/common/with-toast.ts:13`-34 and error conversion sits in `packages/iam/sdk/src/errors.ts:6`-34; both will remain the shared utilities the helpers compose around.
- All Better Auth client functions return `{ data, error }` responses (context7 lookup `/better-auth/better-auth`, snippet "Handle Better Auth Client Sign-in Errors Directly"), so every handler needs identical error normalization.

## Requirements Recap
1. Every handler must validate/encode inputs with `effect/Schema` and respect redacted values.
2. The Better Auth client call must be inside `Effect.tryPromise`, mapping thrown errors and returned `{ error }` values to `IamError` (possibly enriching with Better Auth error metadata).
3. Toast UX wraps handlers through `withToast`; we need ergonomic helpers for the three messages and to dedupe `withToast(...).pipe(...)` wiring.
4. Handlers swallow failures (`Effect.catchAll(() => Effect.succeed(undefined))`).
5. Public handlers return `void`.
6. Handlers must emit spans/log annotations (`Effect.fn` already adds spans when named, per `effect_docs#Effect.fn`), but we still need standard `Effect.withSpan`/`Effect.annotateLogs` usage for downstream tooling.
7. Future-proof error analysis should surface `Cause`/`Exit` details and reuse the utilities in `packages/common/errors/src/{client,shared}.ts`.
8. Provide configurable retry/backoff using `Effect.retry` and schedules like `Schedule.exponential` for transient Better Auth failures (e.g. 5xx).
9. Allow per-call timeout guards via `Effect.timeout` with friendly fallback messaging.
10. Capture latency/volume metrics for every handler using `Effect.timed` + `Metric.histogram`, integrating with `withSpanAndMetrics`.
11. Propagate request metadata through `FiberRef`s and guard client submissions with a shared `Semaphore` to prevent double execution.

## Better Auth Error Shape (validated)
- Better Auth wraps server-side failures in a `better-call` `APIError`, exposing `status`, `statusText`, `headers`, and a JSON body with at least `message` plus optional `code` & `cause` (`packages/iam/infra/node_modules/better-call/dist/index.js:106`-125, `packages/iam/infra/node_modules/better-call/dist/router-DcqXHY8X.d.ts:66`-87).
- The browser client uses `@better-fetch/fetch`, which resolves errors as `{ data: null, error: { status, statusText, ...body } }` (type `BetterFetchResponse`, `node_modules/.pnpm/@better-fetch+fetch@1.1.18/node_modules/@better-fetch/fetch/dist/index.d.ts:562`-575).
- Plugin implementations confirm `error.code`, `error.message`, `error.status`, `error.statusText` in practice (e.g. passkey client, `packages/iam/infra/node_modules/better-auth/dist/client/plugins/index.cjs:226`-265`).
- `BetterAuthError` (the SDK wrapper we already rethrow) only carries `message` and optional `cause` (`packages/iam/infra/node_modules/better-auth/dist/shared/better-auth.DdzSJf-n.mjs:1`-9); richer context lives in the API error payload.
- Action item: extend `IamError` (and `normalizeAuthError`) to store these fields so nothing is lost when we repackage errors.

## Proposed Helper Toolkit

### 1. `normalizeAuthError`
- Accepts the raw Better Auth error payload + contextual metadata (plugin, method, default message).
- Returns an `IamError`, storing `code`, `status`, `statusText`, and raw cause; extend `IamError` to accept optional metadata while keeping backwards compatibility (`packages/iam/sdk/src/errors.ts`).
- Used both when `Effect.tryPromise` throws (`catch: IamError.match`) and when `{ error }` is present.

### 2. `callAuth`
- Signature: `callAuth<A>(ctx, exec) => Effect.Effect<A, IamError>` where `exec` is the Better Auth client invocation. `ctx` bundles plugin/method identifiers plus telemetry knobs (`annotations`, `metrics`) and resilience options (`retry`, `timeout`, `fiberContext`, `semaphoreKey`).
- Internals:
  1. Wrap `exec` in `Effect.tryPromise` (doc `effect_docs#Effect.tryPromise`).
  2. If the handler config defines `timeout`, apply `Effect.timeout` before retry semantics so hung requests surface as a typed `TimeoutException`.
  3. If a retry policy is configured, wrap the call with `Effect.retry` and a `Schedule.exponential` backoff (doc `effect_docs#Effect.retry`, `effect_docs#Schedule.exponential`), short-circuiting on non-retryable error codes.
  4. Pattern-match `{ data, error }`; on error call `normalizeAuthError` and `Effect.fail`.
  5. On success, `Effect.succeed(data)`.
  6. Use `Effect.timed` to measure latency; push the duration into a histogram/counters via `Metric.update` / `Metric.increment` when the handler supplies metric keys.
  7. Add `Effect.tapErrorCause` to log `Cause.pretty(cause)` and structured metadata (plugin/method/requestId) using utilities from `packages/common/errors/src/shared.ts:59`-119.
  8. Apply `Effect.annotateLogs` (doc `effect_docs#Effect.annotateLogs`) to tag logs with `iam-sdk`, plugin, method, and any request context.
  9. Wrap with `Effect.withSpan(`${ctx.spanNamespace}.${ctx.plugin}.${ctx.method}`)` (doc `effect_docs#Effect.withSpan`) so traces are explicit even when `Effect.fnUntraced` paths are needed.
  10. Optionally expose an `Exit` via `Effect.exit` for advanced analysis: collect `exit = yield* Effect.exit(...)`, pass failures into `accumulateEffectsAndReport` when batching multiple calls.

### 3. `decodeInput`
- Optional helper taking an `Effect.Schema` plus pre-processing effect: `decodeInput(schema, inputProcessor?)` returning `Effect.Effect<Encoded, SchemaError>`.
- Ensure redacted values remain redacted by relying on the schema’s encoded type (`Password` / `Email`) before we pass to Better Auth.
- For flows like reset-password token resolution or passkey context, allow `inputProcessor` to compose additional steps before the schema encode.

### 4. `createToastDecorator`
- Factory producing the `withToast` pipeline: `createToastDecorator(defaultMessages)` -> `(effect, args) => withToast({...})(effect, ...args)`.
- Provide defaults (fall back to generic "Action"/"Success"/"Failure") but allow overrides per handler.
- Encourage reuse of `O.match` patterns by accepting either `string` or `(Option<IamError>, args) => string`.

### 5. `finalizeHandler`
- Compose common suffix: `.pipe(createToastDecorator(...), Effect.catchAll(() => Effect.succeed(undefined)), Effect.asVoid)` (doc `effect_docs#Effect.catchAll`, `effect_docs#Effect.asVoid`).
- Expose as `finalizeHandler(effect, options)` so new handlers only provide the core effect.

### 6. `createAuthHandler`
- Primary factory returning an `Effect.fn` handler.
- Config shape:
  ```ts
  interface AuthHandlerConfig<Input, Encoded, Output, ExtraArgs extends ReadonlyArray<unknown> = []> {
    name: string;                      // span + Effect.fn label
    plugin: string;                    // instrumentation key
    method: string;                    // instrumentation key
    schema?: S.Schema<Input, Encoded>; // optional encode step
    prepare?: (input: Input) => Effect.Effect<Encoded, IamError>; // custom pre-processing like grabbing query token
    run: (encoded: Encoded, signal: AbortSignal) => Promise<BetterAuthResult<Output>>; // Better Auth call
    toast?: ToastOverrides<Output, IamError, ExtraArgs>; // partial override for messages
    onSuccess?: (output: Output, input: Input) => Effect.Effect<unknown, never>; // optional post-hook (e.g. router push)
    retry?: RetryPolicyConfig;         // map to Effect.retry + Schedule.exponential
    timeout?: Duration.DurationInput;  // maps to Effect.timeout
    metrics?: SpanMetricsConfig;       // success/error counters + latency histogram
    annotations?: Record<string, unknown>; // additional log context
    tracing?: "traced" | "untraced"; // rare escape hatch for browser-only flows
    semaphoreKey?: string;             // optional key to serialize submissions per resource
    fiberContext?: FiberAnnotations;   // entries to push into a handler FiberRef
  }
  ```
- `RetryPolicyConfig` captures `maxAttempts`, `baseDelay`, `factor`, and an optional `(error: IamError) => boolean` predicate that gates retries.
- `FiberAnnotations` is a simple record of metadata (e.g. `userId`, `locale`, `formId`) merged into a FiberRef before invoking Better Auth so logs/metrics share consistent context.

- Implementation steps inside the factory:
  1. Build the core generator with `Effect.fn` by default; switch to `Effect.fnUntraced` only when `tracing === "untraced"`.
  2. Inside the generator, `yield* decodeInput` (or fallback to identity) and then `yield* callAuth({ plugin, method, annotations, retry: config.retry, timeout: config.timeout, metrics: config.metrics, fiberContext: config.fiberContext, semaphoreKey: config.semaphoreKey }, (signal) => config.run(encoded, signal))`.
  3. If `config.onSuccess`, `yield* Effect.tap` before returning.
  4. `Effect.annotateLogs` and `Effect.withSpan` happen inside `callAuth`, so nothing extra here.
  5. Pipe through `finalizeHandler` with merged toast options.

### 7. Handler Registry
- Define a central registry describing every Better Auth client method we expose. Example:
  ```ts
  const authHandlers = {
    signIn: {
      email: AuthHandler.make({
        name: "signInEmail",
        plugin: "signIn",
        method: "email",
        schema: SignInEmailContract,
        run: AuthHandler.map(client.signIn.email),
        toast: defaultSignInToast,
      }),
      passkey: AuthHandler.make({
        name: "signInPasskey",
        plugin: "signIn",
        method: "passkey",
        prepare: passkeyPrepareEffect,
        run: AuthHandler.map((input, { signal } = {}) => {
    let capturedError: unknown;

    return client.signIn
      .passkey({
        fetchOptions: {
          signal,
          onSuccess: input.onSuccess,
          onError(context) {
            capturedError = context.error;
            throw context.error;
          },
        },
      })
          .catch((error) => {
            throw capturedError ?? error;
          });
        }),
        toast: passkeyToast,
        onSuccess: ({ redirect }) => routerEffect,
      }),
    },
    twoFactor: {
      verifyOtp: AuthHandler.make({ ... }),
    },
  } as const;
  ```
- Map this registry onto the exported shape (`iam.signIn.email`, etc.) so all handlers are generated from consistent configs.
- For plugin-specific peculiarities (passkey, organization, stripe) provide dedicated `prepare`/`onSuccess` functions rather than inlined ad-hoc logic.

## Resilience & Telemetry Details
- **Retry policy wiring**: `RetryPolicyConfig` maps to `Effect.retry` (`effect_docs#Effect.retry`) with `Schedule.exponential` (`effect_docs#Schedule.exponential`). We'll allow configuration of max attempts, base delay, factor, and optional retryable code predicates so form submissions are safe by default yet resilient to 5xx/429 responses.
- **Timeout guard**: when `timeout` is supplied we wrap the Better Auth invocation with `Effect.timeout` (`effect_docs#Effect.timeout`) and convert resulting `TimeoutException`s into `IamError` instances carrying an actionable message.
- **Latency + counters**: the `metrics` field reuses `SpanMetricsConfig` from `packages/common/errors/src/shared.ts:150` so success/error counters and a histogram defined in `@beep/errors` (similar to `apps/web/src/features/upload/observability.ts:12`-50) are updated after every call. Latencies come from `Effect.timed` (`effect_docs#Effect.timed`).
- **FiberRef context**: `fiberContext` defines annotations pushed into a dedicated `FiberRef` so `callAuth` can enrich logs/metrics with consistent metadata (doc `effect_docs#FiberRef.FiberRef`). This keeps request/user IDs available without threading parameters everywhere.
- **Submission guard**: when `semaphoreKey` is provided we look up (or lazily create) a `Semaphore` (`effect_docs#Effect.Semaphore`) to serialize concurrent executions per logical resource, preventing accidental double submits while keeping unrelated handlers concurrent.

## Architecture

### Module layout
```
src/
  auth-wrapper/
    index.ts
    config/
      handler-options.schema.ts
      defaults.ts
    context/
      fiber-refs.ts
      request-context.ts
    concurrency/
      semaphore-registry.ts
    errors/
      iam-error-metadata.ts
      normalize-auth-error.ts
    handler/
      call-auth.ts
      handler-factory.ts
      toast.ts
      index.ts
    instrumentation/
      annotations.ts
      metrics.ts
      tracing.ts
clients/
  iam-client.ts
  sign-in/
    sign-in.client.ts
test/
  auth-wrapper/
    call-auth.test.ts
    handler-factory.test.ts
```

### Responsibility slices
- `config/`: Owns handler option schemas, redaction flags, and defaults so clients can provide strongly typed overrides once. The module exports `HandlerOptionsSchema` (Effect `Schema` struct) plus helpers for merging per-call overrides with global config.
- `context/`: Builds and manages `FiberRef` state used to propagate request metadata, aligning with the Effect `FiberRef` API so annotations stay consistent across nested handlers.
- `concurrency/`: Hosts a keyed `Semaphore` registry; each handler grabs a semaphore via `Effect.Semaphore.withPermits` to enforce per-resource serialization without blocking unrelated flows.
- `errors/`: Extends `IamError` with Better Auth metadata and houses `normalizeAuthError`. It consumes the `{ data, error }` response shape highlighted in the Better Auth client docs so helpers can normalize both thrown exceptions and structured payloads.
- `handler/`: Implements the execution pipeline (`callAuth`, handler factory, toast glue). It wires together timeout, retry, and toast behavior while returning the shared `Effect.Effect<void, never>` façade required by downstream clients.
- `instrumentation/`: Centralizes observability utilities—`Effect.withSpan`, `Effect.annotateLogs`, metrics (`Metric.histogram`, `Metric.timer`), and logging/exit taps—so every handler emits consistent span names, log annotations, and latency counters.

### Assembly flow
1. Callers import `createAuthHandler` from `auth-wrapper/handler` and pass the typed config bundle.
2. The factory composes the pipeline: schema validation, semaphore guard, toast wrapping, telemetry, timeout, retry, and Better Auth invocation.
3. `callAuth` returns the raw effect; the factory applies `Effect.catchAll` to swallow failures and enforce the `void` return signature while preserving log/metric side effects.
4. Clients (e.g., `iam-client` and `sign-in`) re-export thin wrappers that supply handler-specific config (copy, retry schedule, timeout budgets) without duplicating pipeline logic.

### Extension points
- **Metrics**: `instrumentation/metrics.ts` exposes helper factories so we can register histograms and counters once and reuse them across handlers. Tagging is additive via `Effect.tagMetrics` when a caller wants extra dimensions.
- **Telemetry context**: `context/` exposes `withRequestContext` utilities to attach user/request identifiers through the `FiberRef` so child effects inherit annotations automatically.
- **Concurrency guards**: `concurrency/` exports `withSubmissionGuard(key, effect)` to encapsulate semaphore acquisition/release and share the registry across browser sessions.
- **Toast adapters**: `handler/toast.ts` keeps integration with `packages/ui/src/common/with-toast.ts` isolated, letting future UI stacks swap toast implementations without touching the rest of the pipeline.

### Testing strategy
- Unit-test the `callAuth` pipeline in `test/auth-wrapper/call-auth.test.ts` with fixtures covering success, structured errors, thrown errors, timeout, and retry behavior.
- Add contract-level tests per public factory to guarantee schema validation, toast messages, semaphore guarding, and telemetry annotations remain wired as expected.
- Provide smoke tests in existing `clients/` specs that assert a handler created via the factory still triggers the Better Auth stub and resolves with `void`.

### Migration notes
- Incrementally move existing client functions (`signInEmail`, `verifyTotp`, etc.) onto the shared handler by replacing inline pipelines with factory invocations. Keep legacy code in place until each handler is migrated to reduce risk.
- Export the new helper entry points from `src/index.ts` so app surfaces can adopt them without reaching into deep paths.
- Document standard handler naming (`Effect.fn("auth:<plugin>.<action>")`) in the factory to preserve span naming once clients migrate.

## Observability & Error Analysis Enhancements
- `Effect.fn` already opens a span when given a string name (doc `effect_docs#Effect.fn`), but we reinforce observability by:
  - Calling `Effect.annotateLogs` with `{ source: "iam-sdk", plugin, method }` inside `callAuth`.
  - `Effect.withSpan` inside `callAuth` ensures even `Effect.fnUntraced` paths emit spans.
  - Use `Effect.tapErrorCause((cause) => Effect.logError("auth handler failure", { cause: Cause.pretty(cause) }))` relying on `Cause.pretty` (doc `effect_docs#Cause`).
  - Optionally, expose a helper `logExit` using `Effect.exit` -> `Exit.match` (doc `effect_docs#Exit`) to feed richer analytics or metrics wrappers in `packages/common/errors` when we orchestrate multi-call flows.

## Internationalized Error Messages
- We ship the community `better-auth-localization` plugin via `packages/iam/infra/src/adapters/better-auth/plugins/localization/localization.plugin.ts`. It mounts an after-hook that rewrites Better Auth error payloads with translated messages and preserves the original `error.code`.
- Our adapter config wires `getLocale` to `detectLanguage` from `@beep/ui/i18n/server`, decodes the result through `LangValueToAdapterLocale`, and falls back to the plugin's `"default"` bundle on failure. That keeps backend and frontend locale resolution perfectly aligned (same cookie/header precedence).
- Plugin options (`packages/iam/infra/src/adapters/better-auth/plugins/localization/plugin-options.ts` and the community `SPEC.md`) support overriding built-in translations or registering custom locales. When we add organization-specific copy, extend the `translations` object and rely on TypeScript to ensure every error code is covered.
- When localization is active the handlers will always receive a translated `error.message`; therefore `normalizeAuthError` must retain that message verbatim and only fall back to translation keys if the plugin is disabled or a translation is missing. Toast helpers should prefer the localized string by default.
- Implementation note: keep `defaultLocale`/`fallbackLocale` synced with `fallbackLang` and `SupportedLangValue` in `@beep/ui/i18n/constants.ts`. If we add new UI locales, update the adapter locale map so Better Auth inherits them automatically.



## Decisions & Next Steps
- **Toast copy**: Keep handler-specific copy explicit so it can flow through the existing i18next setup (`packages/ui/src/i18n`). The helper can accept an optional `toastKey`/`messages` object for teams that want to route through translation keys, but we should not attempt to auto-derive text from verbs because the current product copy varies per handler. When the localization plugin is enabled, reuse the translated `error.message` directly.
- **Tracing mode**: Default every handler to `Effect.fn` (traced). Allow an opt-in `tracing: "untraced"` flag for rare cases that interact with browser globals during registration while still wrapping the inner effect with `Effect.withSpan` so span naming stays consistent.
- **Retry & timeout**: Ship first-class config knobs so handlers can specify retry policies (base delay, max attempts, retryable codes) and timeout durations. `callAuth` is responsible for enforcing them.
- **Metrics & telemetry**: Define an `IamSdkMetrics` module (modeled after `apps/web/src/features/upload/observability.ts`) and ensure every handler pipes latency/counter data through `withSpanAndMetrics`.
- **Context & concurrency hygiene**: Implement a shared `FiberRef` registry for annotations and a keyed `Semaphore` map to prevent double submissions per logical resource.
- **Error accumulation helpers**: `callAuth` will expose an `Effect.exit` hook so future composite flows can feed into `accumulateEffectsAndReport` (`packages/common/errors/src/client.ts:11`-43). For the initial single-call handlers this extra machinery isn’t required; we’ll defer wiring until a batch orchestration surfaces.
- **Auto-generated handler configs**: Today the Better Auth plugins surface actions via runtime `getActions` functions, so we can’t statically derive handler metadata. We’ll continue to codify configs manually and revisit automation once Better Auth exposes a typed route manifest or similar metadata.
- **Internationalized errors**: Adopt the `better-auth-localization` plugin in the infra adapter layer, aligning its locale detection with `@beep/ui/i18n`. This keeps server error messages localized and lets the client simply surface `IamError.customMessage` without additional translation lookups.

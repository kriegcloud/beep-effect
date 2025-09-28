# Better Auth Handler Implementation TODO

> Canonical tracking list derived from `SPEC.md`. Tasks are grouped by milestone
> so we can land scaffolding, shared utilities, and client migrations incrementally.
> Each item calls out key files and integration points to keep implementation focused.

## Milestone 0 — Housekeeping & Foundations
- [x] Verify scaffolding layout matches `SPEC.md` (config/context/concurrency/errors/handler/instrumentation/test).
  - Review `src/better-auth/**`, `src/index.ts`, `test/better-auth/**`.
- [x] Add package entry docs/README snippet describing new helper surface (export list, usage outline).
- [x] Ensure `tsconfig` paths (if any) include `src/better-auth` for editor support.

## Milestone 1 — Error Model & Normalization
- [x] Extend `IamError` to carry Better Auth metadata (status, statusText, code, cause) per SPEC.
  - Update `packages/iam/sdk/src/errors.ts` with optional metadata fields + constructor overloads.
- [x] Flesh out `normalizeBetterAuthError` to map `{ data, error }` payloads and thrown errors.
  - Input: `BetterAuthErrorPayload` + context info; Output: enriched `IamError`.
  - Reference Better Auth docs for error shapes (`context7` snippets).
- [x] Add unit tests for `normalizeBetterAuthError` covering: thrown `BetterAuthError`, structured `{ error }`, missing message fallback.

## Milestone 2 — Core Pipeline (`callBetterAuth`)
- [x] Implement `callBetterAuth` per SPEC (schema redaction respected upstream).
  - Steps: tryPromise, timeout guard, retry, `{ data, error }` handling, log annotations, span handling, metric hooks, exit logging.
  - Integrate with `instrumentation/*` helpers once available.
- [x] Hook in `withRequestContext` + `handlerFiberRef` to propagate annotations.
- [x] Support semaphore guard via `withSubmissionGuard` when context supplies `semaphoreKey`.
- [x] Add tests in `test/better-auth/call-better-auth.test.ts`:
  - success path returns data
  - `{ error }` path hits normalize
  - thrown errors map to `IamError`
  - timeout surfaces friendly error
  - retry respects predicate (stub schedules).

## Milestone 3 — Instrumentation Helpers
- [x] Implement `instrumentation/annotations.ts` to wrap `Effect.annotateLogs` consistently.
- [x] Implement `instrumentation/tracing.ts` using `Effect.withSpan` and standard span naming (`better-auth:<plugin>.<method>`).
- [x] Implement `instrumentation/metrics.ts` to integrate with metric registry (`Metric.histogram`, counters, tag propagation).
- [x] Extend tests (could be integration-style) ensuring helpers attach annotations/tags when composed with `callBetterAuth`.

## Milestone 4 — Concurrency & Context
- [x] Replace placeholder registry with real semaphore acquisition logic.
  - Manage lazily-created semaphores keyed by string; expose `withSubmissionGuard` wrapper returning effect with permit management.
- [x] Implement actual `HandlerFiberRef` creation (`FiberRef.make`) and utilities to merge annotations.
- [x] Finalize `withRequestContext` to set FiberRef + log annotations + metric tags.
- [x] Add tests verifying semaphore prevents parallel execution for same key and allows different keys.

## Milestone 5 — Handler Factory & Toast Decorator
- [x] Complete `createBetterAuthHandler` implementation:
  - Schema decoding (`Schema.encode`), optional `prepare`, `onSuccess` tap, final `catchAll` swallow, proper return type.
  - Wire `tracing` flag (default traced, allow `untraced`).
  - Integrate toast decorator + telemetry wrappers.
- [x] Build `decorateWithToast` to compose with existing `withToast` helper and allow overrides per SPEC.
- [x] Provide utility to merge default toast copy with handler-specific messages (localized error message usage).
- [x] Tests in `test/better-auth/handler-factory.test.ts` covering schema validation failure, toast integration (spy), `onSuccess` invocation, error swallow to void.

## Milestone 6 — Config & Defaults
- [x] Flesh out `handler-options.schema.ts` with concrete schema reflecting retry/timeout/metrics/fiberContext fields.
- [x] Implement merge helpers (global defaults + per-handler overrides).
- [x] Provide typed config builder for common handler knobs (retry policy objects, timeouts, etc.).
- [x] Document usage in README/TODO for easy adoption by clients.

## Milestone 7 — Clients Migration
- [ ] Incrementally refactor `iam-client.ts` handlers to use factory.
  - Start with `signInEmail`, `signInSocial`, `signInPasskey`. Replace inline effect chains with `createBetterAuthHandler`.
  - Ensure redaction/schemas reused from existing contracts.
- [ ] Migrate `sign-in` client module to same helper.
- [ ] Verify each migration retains existing toasts, retries, metrics.
- [ ] Add smoke/spec regression tests per client to assert effect resolves `void` and triggers Better Auth stub.

## Milestone 8 — Integration & Observability
- [ ] Connect metric outputs to shared observability layer (`packages/common/errors`, `withSpanAndMetrics`).
- [ ] Ensure `FiberRef` annotations flow into existing logging infrastructure (verify log output structure).
- [ ] Validate timeout + retry interplay with real scheduler via integration tests (maybe e2e using mocked delays).
- [ ] Audit for clean-up (no unused placeholders, remove TODO scaffolding, confirm spans show expected naming).

## Milestone 9 — Documentation & Rollout
- [ ] Update `SPEC.md` to mark completed sections (if desired) or move status to TODO log.
- [ ] Draft migration guide for downstream teams: how to register new handlers, configure toasts, metrics, concurrency guards.
- [ ] Coordinate cut-over plan (feature flags? staged rollout) with infra + UI teams.
- [ ] Once migrations complete, delete legacy duplicated handler code.

---

### Notes for future self
- Keep `context7` and `effect_docs` references handy for retry/timeout API nuances.
- When implementing metrics, cross-check `apps/web/src/features/upload/observability.ts` per SPEC callout.
- Watch for tree-shaking/side-effects when editing `src/index.ts` exports.
- Prioritize writing tests alongside implementation; TODO entries assume test coverage at each milestone.
- Run type checks with `pnpm check --filter=@beep/iam-sdk` after each completed task to catch regressions early.
- Never and I mean ABSOLUTELY NEVER use type assertions unless you have permission from the user.
- Prefer Immutable operations avoiding things like Array.push
- Make sure to run `pnpm check --filter=@beep/iam-sdk` before writing or making changes to tests.

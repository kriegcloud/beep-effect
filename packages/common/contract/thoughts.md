# @beep/contract – notes and ideas

## What is working well
- Prototype surface is cohesive: `Contract.make` + annotations + continuation + `ContractKit` give a consistent lifecycle (define → implement → lift).
- Continuation metadata (title/domain/method/supportsAbort) is being used in IAM clients to propagate context into errors and to wire abort signals through Better Auth fetch helpers.
- `ContractKit.handle` enforces payload/result validation, and `lift` covers the `failureMode` return path with hooks for success/failure/defect.

## Usage observations from `packages/iam/client/src/clients/*`
- Implementations almost always call `continuation.run` → `continuation.raiseResult` → `Contract.decodeUnknownSuccess`. The Better Auth client returns `{ data, error }`, so we repeatedly map that shape manually and fail fast on `error`.
- Abort support is opted in via `Contract.SupportsAbort` and propagated to fetch options; this works but requires ad-hoc helpers (`withFetchOptions`, `addFetchOptions`).
- Failure modes are effectively always `"error"` in production clients; `"return"` is only covered in tests, so runtime consumers rarely exercise `Contract.handleOutcome`.
- Implementations repeatedly `requireData` and manually normalize shapes before decoding, which leaves room for drift and inconsistent error messages.
- No generated documentation or discovery surface exists for contracts/annotations; consumers rely on AGENTS.md + manual reading.

## Ideas to consider
- **Result-shaped continuation helper**: add `continuation.decodeResult` (or `runDecode`) that accepts the common `{ data, error }` shape, auto-runs `raiseResult`, then decodes success/failure via the contract schemas. This removes repetitive boilerplate across IAM clients and guarantees schema-safe failure decoding when `failureMode === "return"`.
- **Fetch/HTTP bridge**: provide a `Contract.continuation.fetchJson` (or similar) that wraps Better Fetch/Bun fetch with built-in `HttpRequestError`/`HttpResponseError` normalization, attaches abort signals, redacts headers, and maps status codes to `failureSchema` when provided. This would centralize the onError wiring currently copied in `_internal/client-method-helpers.ts`.
- **Optional failure decoding**: add a helper to map transport failures into the declared `failureSchema` (e.g., decode JSON error payloads) before raising, so `"error"` mode can still yield typed domain failures instead of only `UnknownError`.
- **ContractKit client lift**: a `ContractKit.liftClient` (mirrors `liftService`) that builds typed client call functions returning `HandleOutcome` or success, with pluggable transport (fetch/rpc). This would eliminate per-client boilerplate and make `"return"` mode ergonomic.
- **Doc/export surface**: generate a JSON/markdown manifest from contracts (`name`, `domain`, `method`, schemas, annotations, failureMode, supportsAbort). Could be wired into repo docs or a devtools panel, helping UI/SDK authors discover capabilities without reading source.
- **Test/mocking helpers**: add a tiny `ContractKit.mock` utility that builds layers from stubs and ensures schema validation on the stubbed outputs. This reduces hand-rolled mocks in app-layer tests and keeps schemas in play.
- **Annotation extensions**: consider `Contract.Visibility` (public/internal), `Contract.RateLimitKey`, or `Contract.Audience` to guide gateway/rbac layers and documentation grouping. These would simply be new Context tags.
- **Telemetry hooks**: `Contract.implement` already annotates spans with `contract` and `failureMode`; add optional hook to set span names (`${domain}.${method}`) and attach `metadata.extra` automatically when present.
- **FailureMode ergonomics**: add a small helper `Contract.toResult` that projects an implementation result into `{ success | failure }` using `FailureMode.matchOutcome`, so callers of `"return"` mode don’t need to use `handleOutcome` manually when they just want a discriminated union.
- **Schema ergonomics**: provide a `Contract.makeStruct` overload for the common case of struct payloads/success/failure to trim `S.Struct` noise and keep annotation chaining intact.

## Follow-ups worth validating
- Add a regression test that exercises `"return"` mode end-to-end with `ContractKit.liftService({ mode: "result" })` to ensure consumers can branch on returned failures.
- Measure whether adding `runDecode` materially reduces duplication in IAM clients (passkey/admin/sign-in) and avoids repeated `requireData`/normalization code paths.

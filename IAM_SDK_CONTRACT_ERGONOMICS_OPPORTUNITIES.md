# IAM SDK Contract Ergonomics Opportunities

This note documents additional opportunities to cut boilerplate across `@beep/iam-sdk/src/clients/*` while respecting
that `@beep/contract` must remain general-purpose (usable for wrapping any third-party API, not just Better Auth). Each
idea below explicitly calls out whether it belongs in the core contract package or in the IAM-specific helper layer
(`packages/iam/sdk/src/clients/_internal`).

## 1. Derive metadata & failure continuations from contracts (General-purpose)

- Files such as `packages/iam/sdk/src/clients/session/session.implementations.ts:14-82` and
  `packages/iam/sdk/src/clients/passkey/passkey.implementations.ts:19-116` repeat the same pattern:
  1. Instantiate `new MetadataFactory("<domain>")`
  2. Create one constant per method (`metadataFactory.make("getSession")`, …)
  3. Call `makeFailureContinuation({ contract: Contract.name, metadata: thatConstant })`
- The domain + method strings already live on every contract via `Contract.Domain` / `Contract.Method` annotations, so we
  can expose `contract.metadata(extra?)` and `contract.failureContinuation(options?)` helpers in `@beep/contract`.
- Proposed API:
  ```ts
  const continuation = contract.failureContinuation({
    supportsAbort: true,
    overrideMetadata: { method: "listUserPasskeys" }, // optional
  });
  ```
  That would eliminate the entire metadata factory boilerplate in session, passkey, organization, sign-in, admin, etc.
- `_internal/MetadataFactory` could then wrap the generic helper (or even disappear) without coupling `@beep/contract`
  to Better Auth specifics.

## 2. Provide a one-liner “invoke Better Auth” helper (IAM-specific)

- Almost every handler contains the same sequence (`session.implementations.ts:24-83`,
  `passkey.implementations.ts:39-116`, `organization.implementations.ts:67-176`, …):
  ```ts
  const continuation = makeFailureContinuation(...);
  const result = yield* continuation.run((handlers) => client.<plugin>.<method>(...withFetchOptions(handlers)...));
  yield* continuation.raiseResult(result);
  return yield* Contract.decodeUnknownSuccess(result.data);
  ```
- We should capture this in `_internal` (not `@beep/contract`, to keep the core package agnostic). Responsibilities:
  - Create the continuation (leveraging opportunity #1).
  - Run the provided `call` lambda with fetch handlers.
  - Optionally ensure `result.data` exists (`requireData` is only used in a few files today).
  - Automatically decode/encode through the contract’s helper methods (success/failure/payload).
  - Surface hooks for mutations (e.g., `onSuccess: () => client.$store.notify("$sessionSignal")`).
- Sketch:
  ```ts
  const PasskeyListHandler = PasskeyListContract.invoke({
    supportsAbort: true,
    call: (handlers) => client.passkey.listUserPasskeys(undefined, withFetchOptions(handlers)),
    decode: PasskeyListContract.decodeUnknownSuccess, // default if omitted
  });
  ```
- This change would shrink each handler to just the HTTP call payload, greatly reducing the lines per contract, while
  keeping `@beep/contract` unaware of Better Auth.

## 3. Session signal notifications as annotations/hooks (IAM-specific)

- Multiple clients manually emit `client.$store.notify("$sessionSignal")` after successful mutations:
  - Sign-in (`packages/iam/sdk/src/clients/sign-in/sign-in.implementations.ts:73-178`)
  - Organization (`packages/iam/sdk/src/clients/organization/organization.implementations.ts:92,171,254,285,654`)
  - Admin (`packages/iam/sdk/src/clients/admin/admin.implementations.ts:311,351`)
  - Multi-session (`packages/iam/sdk/src/clients/multi-session/multi-session.implementations.ts:72,105`)
- Rather than baking this into `@beep/contract`, add a thin adapter in `_internal` (or a decorator around
  `contract.implement`) that checks for an IAM-only annotation (e.g., `Contract.SessionMutation`) and issues the
  notification via existing hooks.
- Benefits:
  - Removes repeated conditional logic (`if (result.error == null) client.$store.notify(...)`).
  - Makes it obvious (from the contract definition) which operations mutate session state.

## 4. Result normalization & “expect data” helpers (IAM-specific, backed by generic primitives)

- Admin handlers normalize raw structures from the Better Auth client before decoding:
  `packages/iam/sdk/src/clients/admin/admin.implementations.ts:70-175` repeatedly checks whether the response already has
  a `user` key and wraps it if not.
- Passkey + organization handlers also guard against `result.data == null` and hand-roll `IamError`s
  (`passkey.implementations.ts:79-116`, `organization.implementations.ts:109-165`).
- We can fold these checks into the helper from opportunity #2 and/or expose tiny generic primitives in
  `@beep/contract` (e.g., `contract.expectData(result, errorFactory)`) that IAM helpers compose. That keeps the contract
  package reusable while still reducing duplication.
  - Option `expectData: true` ⇒ automatically fail with `IamError` referencing the contract metadata.
  - Option `normalize: (data) => normalizedData` ⇒ run before decoding.
  - Shipped as `contract.expectData(result)` and `contract.normalizeResult(fn)` building blocks for ad-hoc cases.
- This lifts “shape repair” logic out of each handler, clarifying what’s specific to that API call.

## 5. Request builders for fetch options, redacted headers, and compaction (IAM-specific)

- Sign-in & sign-up handlers (`sign-in.implementations.ts:45-120`, `sign-up.implementations.ts:18-54`) spend many lines
  building request objects that mix payload fields, `Redacted.value(...)`, captcha headers, optional `rememberMe`, and
  `withFetchOptions` results.
- Organization + passkey handlers do similar work with `addFetchOptions` and `compact` utilities
  (`organization.implementations.ts:67-120`, `passkey.implementations.ts:87-115`).
- A fluent request builder in `_internal` could encapsulate the common steps:
  ```ts
  const request = RequestBuilder.for(contract)
    .payload(payload)
    .redact({ email: payload.email, password: payload.password })
    .captcha(payload.captchaResponse)
    .fetchOptions(handlers, { supportsAbort: true })
    .build();
  ```
- That keeps handlers focused on business parameters instead of boilerplate merging, and makes it easier to audit that
  sensitive values are always redacted and optional fields are stripped when `undefined`, without tying `@beep/contract`
  to Better Auth’s fetch layer.

---

Adopting these helpers would make the new `Contract.implement` / `ContractKit.liftService` experience consistent across
all IAM clients, trim hundreds of lines of repetitive glue, and push the remaining code towards “just describe the HTTP
call”. Happy to prototype any of the above if we want to validate the approach in one client first.

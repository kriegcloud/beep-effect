# PACER API POC — Effect `httpapi` + `http`

A schema-first, Effect-native proof of concept for the two PACER developer APIs,
built for the [`solo-firm-docketing`](../../explorations/solo-firm-docketing)
exploration (PACER is the litigation/court-order event source). Throwaway code
in the `@beep/scratchpad` workspace — **not product code** — but structured to
foreshadow a future `packages/drivers/pacer` driver.

## The two APIs, and why the modules are split

PACER has two APIs with **fundamentally different error models**, so the POC
uses a different Effect HTTP module for each — deliberately, as a "when to reach
for which" demonstration:

| API | Host (QA) | Error model | Module used |
| --- | --- | --- | --- |
| **Authentication** (`/services/cso-auth`, `/services/cso-logout`) | `qa-login.uscourts.gov` | failures come back as **HTTP 200** with a body `loginResult` code (`"0"` ok, `"1"` redaction-flag missing, `"13"` bad creds/OTP) and empty `nextGenCSO` | **`effect/unstable/http`** (`HttpClient`) — decode the 200 body, branch on `loginResult` |
| **Case Locator / PCL** (`/cases/find`, `/parties/find`) | `qa-pcl.uscourts.gov` | real HTTP status codes (`401/406/429/500`); token in the `X-NEXT-GEN-CSO` header | **`effect/unstable/httpapi`** — declare the surface, derive a typed client via `HttpApiClient.make` |

## Layout

```
Pacer.tokens.ts        NextGenCsoToken brand; LoginResult / JurisdictionType / PacerEnvironment kits
Pacer.errors.ts        TaggedErrorClass: PacerAuthError (loginResult), PacerPclError (status), PacerConfigError
Pacer.config.ts        base URLs + Config.redacted secret reads (+ mockPacerConfig)
auth/CsoAuth.models.ts S.Class request/response for cso-auth + cso-logout
auth/PacerAuth.service.ts  PacerAuth (login/logout over HttpClient) + PacerSession (scoped: login→Ref→logout)
pcl/Pcl.models.ts      S.Class CourtCaseSearchDto / PartySearchDto / Receipt / PageInfo / Case/Party + envelopes + ReportInfoType
pcl/Pcl.api.ts         HttpApi.make + group: find{Cases,Parties} + batch start/status/results endpoints
pcl/PclClient.service.ts  HttpApiClient.make(PclApi) + token inject/refresh + pagination Stream + batch download workflow
transport/Arbitraries.ts  schema-derived bodies (Schema.toArbitrary + FastCheck.sample, not hardcoded JSON)
transport/Mock.ts      deterministic HttpClient layer serving the schema-derived bodies
transport/Layers.ts    composes PacerAuth + PacerSession + PclClient over a chosen transport
Demo.ts                shared search demo (paginated /cases/find + /parties/find + batch download)
run-mock.ts            default entrypoint (mock transport)
run-live.ts            live entrypoint (QA, real creds + OTP)
Pacer.test.ts          property-based (it.prop over Schema arbitraries) + e2e (it.layer) tests
```

## Run it

### Mock (default — no network, no credentials)

```sh
bun scratchpad/pacer/run-mock.ts
```

Prints the happy path (scoped login → paginated `/cases/find` → `/parties/find`
→ batch download lifecycle → logout on scope close) plus the two typed error
paths (auth `loginResult 13` and PCL `406`).

```sh
bunx vitest run --config scratchpad/vitest.config.ts scratchpad/pacer/Pacer.test.ts
bunx tsgo -p scratchpad/tsconfig.json --noEmit   # repo's @effect/tsgo type+lint pass
```

### Live (PACER QA — non-billable test data)

1. **Add the password secret** to 1Password (none exists yet):
   `op://BEEP_SECRETS/BEEP_SECRETS/LEGAL_QA_PACER_PASSWORD`.
2. Copy the env template and resolve it via 1Password:
   ```sh
   cp scratchpad/pacer/pacer.env.example scratchpad/pacer/pacer.env
   op run --env-file scratchpad/pacer/pacer.env -- \
     bun scratchpad/pacer/run-live.ts --otp 123456
   ```
   The QA account is **MFA-enrolled (authenticator-app only)**, so pass the
   current 6-digit code via `--otp` (or `PACER_OTP`); it expires in ~30s, so run
   immediately after reading it. (To go fully headless later, store the Base32
   TOTP secret from *Manage My Account* and generate the code programmatically.)

### Secret mapping (from the PAA manual)

| 1Password ref | env var | PACER use |
| --- | --- | --- |
| `LEGAL_PACER_USERNAME` | `LEGAL_QA_PACER_USERNAME` | login `loginId` (confirm the QA account login — QA is a separate account) |
| `LEGAL_QA_PACER_PASSWORD` *(add this)* | `LEGAL_QA_PACER_PASSWORD` | login `password` |
| `LEGAL_QA_PACER_CLIENT_CODE` | `LEGAL_QA_PACER_CLIENT_CODE` | `clientCode` + `X-CLIENT-CODE` (billing/matter tag) |
| `LEGAL_*_PACER_ACCOUNT_NUMBER` | — | 7-digit billing identifier; **not** an auth field, not used by the POC |

## Design notes

- **Schema-first everywhere** — every request/response is an `S.Class` with
  `$ScratchpadId` identity annotations; response fields use `S.optionalKey` and
  permissive unions so a live QA payload never fails to decode (effect/Schema
  drops unmodeled excess keys).
- **Generated data, not fixtures** — mock bodies and tests are derived from the
  schemas via `Schema.toArbitrary` + `FastCheck.sample`, and `Pacer.test.ts`
  property-tests the schema round-trips and error mappings with `it.prop`. This
  forces the schemas' checks/refinements to hold for any generated value.
  `CaseNumberFull` carries a custom `toArbitrary` annotation so generated case
  numbers are realistic.
- **Reused HTTP primitives** — `PacerPclError.fromStatus` classifies via the
  `@beep/schema/HttpStatus` named codes (`Unauthorized`, `NotAcceptable`, …)
  instead of magic numbers.
- **Layering** — services depend only on `HttpClient`; layers are composed once
  per entry point (`makePacerLayer`) and provided at the top (runners) or via the
  `it.layer` test harness, satisfying the repo's `effect(strictEffectProvide)`.
- **Secrets stay redacted** — credentials are `Redacted` via `Config.redacted`
  and only unwrapped with `Redacted.value` at the HTTP boundary.
- **Token plumbing** — `PacerSession` is a scoped layer: it logs in on acquire,
  stores the token in a `Ref<Redacted<NextGenCsoToken>>`, and logs out on
  release. `PclClient` injects the token per request via
  `HttpClient.mapRequestEffect` (reading the Ref) and writes back any rotated
  `X-NEXT-GEN-CSO` response header via `HttpClient.transformResponse`. `429`s
  retry with `HttpClient.retryTransient`.
- **Batch lifecycle** — `downloadCases` starts a job (`POST /cases/download`),
  polls `/download/status/{id}` until `COMPLETED`/`FAILED` (bounded manual
  recursion), downloads the results, and **always deletes** the stored report via
  `Effect.ensuring` (PACER caps stored jobs). `httpapi` has no DELETE constructor
  in this beta, so the delete goes through the same token-injecting `HttpClient` —
  another spot where the hybrid `httpapi` + `http` split is forced by the surface.
- **Typed errors at the boundary** — auth failures map the body `loginResult`
  to `PacerAuthError`; PCL failures map the HTTP status to `PacerPclError`
  (PACER's error bodies are not a stable schema, so they are intentionally not
  modeled as HttpApi `error` shapes).
- **Transport-agnostic** — `PacerAuth` and `PclClient` depend only on
  `HttpClient`, so the mock and live runs differ by exactly one layer.
- **Resilience** (hardened after an adversarial review pass) — every live request
  carries a 30s `Effect.timeout`; pagination is hard-capped against a server that
  never sets `pageInfo.last`; a batch `reportId` is validated as an integer before
  it is spliced into a URL; and a `PacerConfig.isFiler` flag drives the `redactFlag`
  the Authentication API requires for e-filing accounts.

## Out of scope (future work)

Party batch downloads (only case batch is wired); XML content negotiation;
headless TOTP; production host; graduation to `packages/drivers/pacer`; the
docketing rules engine / approval gate.

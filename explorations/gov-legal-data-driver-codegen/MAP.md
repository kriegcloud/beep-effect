# gov-legal-data-driver-codegen — Map

<!--
Stage 5 (DECOMPOSE). Every major component below cites an existing in-tree
capability (verified via rg/ls 2026-06-29) or is marked NET-NEW. Decisions
Q1–Q8 are all resolved (see DECISIONS.md). This wedge graduates as ONE cohesive
multi-phase goal `goals/gov-legal-data-driver-codegen` — the phases below are
its sequenced internal slices, not separate goal packets.
-->

## Candidate goals

This wedge does **not** fan out into multiple goal packets. The substrate bet is
one cohesive, multi-phase goal so the shared transformer, codegen tiering, and
determinism gate are designed once and proven across two reference verticals
before any breadth.

| Goal | Scope | Graduates as |
| --- | --- | --- |
| `gov-legal-data-driver-codegen` | OpenAPI→Effect-SDK codegen substrate (Schema value models + operation descriptors only) + one shared hand-authored auth/retry/cache/rate-limit transport, proven on `govinfo` (keyed) + one keyless driver, with CourtListener/DOL last on the proven rails. | ONE goal packet, four sequenced phases (P0–P3). |

### Phases (sequenced slices inside the one goal)

| Phase | Slice | Delivers | Gate to start | Cites |
| --- | --- | --- | --- | --- |
| **P0** | govinfo-finish + transformer-incubate | Repair `@beep/govinfo` manifest (`@beep/identity` + `@beep/schema` deps); add hand-authored client/config/auth/retry/cache/rate-limit **service** layer on top of the existing `Search` HttpApi contract + value models; **incubate the shared transformer inside govinfo** applied via `HttpApiClient.make`'s `transformClient`; api.data.gov `api_key` query-param auth via `Config.redacted("GOVINFO_API_KEY")`. | none (first slice) | runpod `Runpod.service.ts`/`Runpod.config.ts` split; govinfo `Search.http.ts`/`Search.contract.ts` + value models; `HttpClient.withRateLimiter`/`retryTransient`; `Cache.makeWith`; `HttpApiClient.transformClient`; `Config.redacted` |
| **P1** | keyless driver (eCFR or FedReg) + generator spike | Build the **2nd** driver on the raw-client (`HttpClient.mapRequest`) path with **zero auth surface**, consuming the incubated transformer (this makes it the 2nd consumer that unlocks promotion); run the `@effect/openapi-generator` Swagger-2.0 normalization spike on eCFR's `api/v1.json`, recording dialect warnings; per-driver `scripts/generate.ts` + committed spec + package-private `src/_generated/*`. | P0 green | acp `generate.ts` (`@effect/openapi-generator/JsonSchemaGenerator` → `src/_generated/`); runpod `openapi.json` + `scripts/generate.ts` bespoke renderer; box `.d.ts` parser (3rd fallback); `HttpClient.mapRequest` |
| **P2** | CourtListener + DOL authed drivers | Token-header (`Authorization: Token <key>`) and agency-native `X-API-KEY` auth families branched in the now-shared transformer; CourtListener caching **in-process/ephemeral only**; third-party legal content **excluded from committed fixtures**. | **GATED** on the data/source-terms matrix (required pre-shape research item, default-deny per Q8) + the metadata/auth-enforcement spike | shared transformer (from P0/P1); runpod/uspto `Config.redacted` secret precedent; per-driver raw-request escape hatch (runpod `RunpodRawRequest`) |
| **P3** | verify + promote | Per-package generate-first audit + CI `git diff --exit-code` drift check; pin exact versions in each codegen template; **promote the transformer to `foundation/capability/<name>`** with a README promotion record naming ≥2 current consumers (govinfo + the keyless driver). | ≥2 named importers actually consuming the transformer (the `07-non-slice-families` gate) | `standards/architecture/07-non-slice-families.md` gate; `foundation/capability/*` home convention (nlp-processing, file-processing, observability) |

## Named follow-on goals (deferred, not v1)

These are explicitly out of the v1 graduation slice and become their own named
goals later:

| Follow-on goal | Trigger / gate | Cites |
| --- | --- | --- |
| `gov-legal-mcp` sibling server | Gated behind **≥2 proven drivers** (Q3). New `packages/drivers/gov-legal-mcp` package; carries the mandatory generated-tool-name collision contract (driver-prefixed stable names, `^[a-zA-Z0-9_-]+$` normalization + length cap, duplicate detection with a checked-in collision report, integration tests against the Effect MCP JSON schemas). | `m365-mcp` + `nlp-mcp` sibling-package precedent (both exist) |
| transformer `foundation/capability` promotion record | Authored at P3 once the 2nd driver imports the incubated transformer; the formal README promotion record naming both consumers. | `standards/architecture/07-non-slice-families.md`; existing `foundation/capability/*` packages |

## First vertical slice

**P0 — govinfo-finish + transformer-incubate.** Lowest-risk first slice: the
hardest unknowns (a clean official-source contract, the value models, the single
`transformClient` generalization seam) are already half-built in `@beep/govinfo`.
Finish — do **not** restart. Concretely:

1. Repair `packages/drivers/govinfo/package.json` — it declares only `effect` but
   `src/**` already imports `@beep/identity` (10 files) and `@beep/schema`
   (multiple); add both deps. **(manifest bug, confirmed)**
2. Add a hand-authored `Govinfo.service.ts` / `Govinfo.config.ts` (NET-NEW —
   govinfo currently has **no** transport, only `domain/`) mirroring the runpod
   `*.service.ts`/`*.config.ts` split, on top of the existing `Search` contract.
3. Incubate the shared transformer inside govinfo and apply it through
   `HttpApiClient.make(api, { transformClient })`; wire `withRateLimiter` (reads
   live `X-RateLimit-*`), `retryTransient` (`Schedule.exponential` ⊕ jittered),
   `Cache.makeWith({ timeToLive })` (+10% TTL jitter), and
   `Config.redacted("GOVINFO_API_KEY")` api.data.gov auth.

Verify: a live `Search` round-trip decodes through the existing value models with
auth attached, rate-limit headers honored, and a cache hit on repeat — proving the
`transformClient` seam end-to-end on the official legal-edition source.

## Capability check

Every major component cites an existing in-tree brick (path-verified 2026-06-29)
or is marked **NET-NEW**.

### Existing bricks (reuse — verified)

- **Bespoke renderer over a checked-in spec** — `packages/drivers/runpod/openapi.json`
  (151 KB) + `packages/drivers/runpod/scripts/generate.ts` (27 KB). The Q1 tier-2 /
  CourtListener-DOL path.
- **Generated vs hand-authored transport split** —
  `packages/drivers/runpod/src/_generated/Runpod.generated.ts` vs
  `packages/drivers/runpod/src/Runpod.service.ts` + `Runpod.config.ts`. The Q2
  boundary precedent; govinfo P0 mirrors it.
- **Raw-request escape hatch** — `RunpodRawRequest` in
  `packages/drivers/runpod/src/Runpod.service.ts`. The Q7 spec-drift hatch.
- **`@effect/openapi-generator` codegen path** — `packages/drivers/acp/scripts/generate.ts`
  imports `@effect/openapi-generator/JsonSchemaGenerator` and emits into
  `src/_generated/`. Pinned `@effect/openapi-generator` `4.0.0-beta.91` (root
  `package.json:157` catalog; acp consumes `catalog:`). The Q1 tier-1 path
  (GovInfo / eCFR-behind-spike).
- **`.d.ts`-parser fallback generator** — `packages/drivers/box/scripts/generate.ts`
  parses `lib/client.d.ts`, `.d.ts` files, and `lib/managers/*.d.ts`. The Q1
  tier-3 fallback.
- **Native Effect v4 transport primitives** (`effect@4.0.0-beta.91`) —
  `HttpClient.withRateLimiter` (`node_modules/effect/dist/unstable/http/HttpClient.d.ts:743`),
  `HttpClient.retryTransient` (`:602`), `Cache.makeWith({ timeToLive })`
  (`node_modules/effect/dist/Cache.d.ts:155`), `HttpApiClient` `transformClient`
  option (`node_modules/effect/dist/unstable/httpapi/HttpApiClient.d.ts:135,176`),
  `Config.redacted` (`node_modules/effect/dist/Config.d.ts:1095`; in-driver
  precedent: runpod + uspto `*.service.ts`). The Q5 substrate — composition, not
  reimplementation.
- **Existing govinfo `Search` HttpApi contract + value models** —
  `packages/drivers/govinfo/src/domain/contracts/Search/Search.http.ts`
  (`HttpApiEndpoint.post("search", "/search")`), `Search.contract.ts` (status-coded
  `Success`/`Failure*`), and 10 value models under `domain/values/*`
  (CollectionContainer, CollectionSummary, GranuleContainer, GranuleMetadata,
  PackageInfo, SearchBody, SearchResponse, SearchResult, Sort, SummaryItem). The
  Q4 "finish, don't restart" base.
- **Bare driver skeletons (build targets)** — `packages/drivers/{courtlistener,ecfr,dol,federal-register}/src/index.ts`
  (each a single `index.ts`).
- **Promotion home + gate** — `packages/foundation/capability/*` (chalk, colors,
  file-processing, langextract, nlp-processing, observability, semantic-web) governed
  by `standards/architecture/07-non-slice-families.md` (≥2-named-consumers rule).
- **MCP sibling precedent** — `packages/drivers/m365-mcp` + `packages/drivers/nlp-mcp`
  (the deferred `gov-legal-mcp` template).

### NET-NEW (no existing brick)

- **The shared auth+retry+cache+rate-limit transformer module** — a *composition*
  of the native primitives above, but the module itself does not exist yet.
  Incubated in govinfo (P0), promoted at P3. NET-NEW.
- **govinfo transport layer** — `Govinfo.service.ts` / `Govinfo.config.ts`;
  govinfo today has `domain/` only, no client/auth/transport. NET-NEW.
- **Committable GovInfo `openapi.json` spec artifact** — flagged unproven in Q1;
  govinfo's value models are hand-authored, not generated. Producing a committed
  spec for the generator path is a gate spike. NET-NEW.
- **eCFR Swagger-2.0 normalization via `@effect/openapi-generator`** — claimed but
  unproven; P1 spike with recorded dialect warnings; fall back to the bespoke
  renderer if lossy (and watch open bug #1978 lossy `httpclient` format). NET-NEW.
- **Raw-client drivers** (`HttpClient.mapRequest`) for eCFR/FedReg/CourtListener/DOL.
  NET-NEW.
- **Per-upstream data/source-terms matrix** — required pre-shape research artifact
  gating P2 (default-deny). NET-NEW.
- **CI `git diff --exit-code` codegen-drift check** — the per-package determinism
  gate wiring (no global `build → codegen` turbo edge in v1, Q7). NET-NEW.
- **`gov-legal-mcp` server** and the **transformer promotion record** — deferred
  follow-ons (above). NET-NEW.

## Open risks inherited from the brief

- eCFR Swagger-2.0 normalization is unproven — run the P1 spike, record dialect
  warnings, fall back to the bespoke renderer if lossy.
- `@effect/openapi-generator` lossy `httpclient` format (open bug #1978) — validate
  any endpoint returning both `application/problem+json` and `application/json` on
  one status; this is why the bespoke renderer stays in the toolkit.
- CourtListener data-terms matrix is a required pre-shape research item — P2 stays
  default-deny (ephemeral-only cache, no committed third-party fixtures) until it
  exists.
- No `drivers/_shared` convention exists — the transformer must incubate in govinfo
  and only promote to `foundation/capability/<name>` at ≥2 named consumers.

# Gov/Legal Data Drivers + OpenAPI Codegen — Decisions

<!--
Stage 2 (ALIGN) seed, pre-drafted 2026-06-29 from RESEARCH.md + CAPTURE.md.
Each block poses ONE branch-closing question with a RECOMMENDED answer and
rationale. NONE are resolved here — the user resolves them one at a time via
`/grill-with-docs gov-legal-data-driver-codegen`, logging each resolution and
syncing `ops/manifest.json` openQuestions as they close.
-->

## Q1: Codegen engine — one generator for all five drivers, or a tiered per-driver strategy keyed on spec availability?

**Recommended:** A tiered strategy, not one global generator. Use first-party
MIT `@effect/openapi-generator` (already a repo dep, pinned `4.0.0-beta.91`,
`package.json:32`; consumed by `@beep/acp`) wherever a clean machine-readable
contract exists — GovInfo (US-Gov public-domain spec) and eCFR (its
`api/v1.json` is **Swagger 2.0**, which the generator header claims to
normalize, but that path is *unproven* and must pass a generator spike that
records dialect warnings before adoption). Fall back to the runpod-style
bespoke renderer over a checked-in spec
(`packages/drivers/runpod/scripts/generate.ts`) for CourtListener and DOL, which
publish **no clean OpenAPI** — seeded from a metadata spike (CourtListener DRF
API-root/`OPTIONS`, DOL v4 `/v4/get/<agency>/<endpoint>/json/metadata`) rather
than hand-freezing field sets. The Box `.d.ts`-driven generator
(`packages/drivers/box/scripts/generate.ts`) is the third fallback if either
exposes a typed client surface instead. Explicitly **do NOT** introduce
Orval/axios/Zod (standing repo law; donor value is the pipeline pattern, not the
runtime) and **AVOID** vendoring MPL-2.0 `fortanix/openapi-to-effect`.

**Rationale:** RESEARCH establishes three Effect-native codegen styles already
shipping in-tree (runpod bespoke renderer, acp `@effect/openapi-generator`, box
`.d.ts` parser) and that the five upstreams have *heterogeneous* spec
availability — so a single global generator is a false economy. The
`@effect/openapi-generator` keeps the license surface MIT and rides the Effect
release train; runpod's renderer is the proven no-library-dep path for
partial/non-conformant upstreams. The eCFR Swagger-2.0 normalization and the
GovInfo committable-`openapi.json` artifact are both flagged `NOT FOUND`/unproven
and gate spikes, so committing to one engine before those spikes resolve would be
premature. The lossy `httpclient` format (open bug #1978) further argues for
keeping the bespoke renderer in the toolkit, not betting everything on the
generator.

**Status:** open (for /grill-with-docs)

## Q2: Codegen boundary — where does generated output stop and hand-authored code begin?

**Recommended:** Codegen emits **only** effect/Schema value models + operation
descriptors (the runpod boundary: `S.Class` models, `LiteralKit` enums,
per-operation request DTOs, an operation-specs table) into package-private
`src/_generated/*`. Everything transport — auth, retry, cache, rate-limit, and
`Context.Service` wiring — stays **hand-authored** on `effect/unstable/http`,
exactly as runpod splits `Runpod.generated.ts` from the hand-written
`Runpod.service.ts`/`Runpod.config.ts`. In v1 this packet does **NOT** build a
first-party OpenAPI→MCP-`Toolkit` generator (RESEARCH: `NOT FOUND` — the
generator emits SDK formats only). MCP toolkits are hand-authored per the
`nlp-mcp`/`m365-mcp` precedent, or at most a *small second pass* over the same
parsed operations once the driver layer is proven.

**Rationale:** RESEARCH names "hand-written transport is the boundary codegen
does NOT cross" as the load-bearing repo invariant and shows every in-tree
generator honoring it. Auth/retry/cache vary per upstream (three auth families,
per-source rate limits, TTL-jitter policy) and resist clean derivation from a
spec, so generating them would invert the proven precedent. Deferring the
MCP-toolkit generator avoids building net-new tooling against an unproven target
and keeps v1 scoped to the driver/client substrate the five skeletons actually
need.

**Status:** open (for /grill-with-docs)

## Q3: MCP target — does this packet ship a new `gov-legal-mcp` server, attach toolkits to an existing server, or stay patterns-only?

**Recommended:** Ship **one new `packages/drivers/gov-legal-mcp` sibling
package** (following the `m365` → `m365-mcp` sibling precedent and the `nlp-mcp`
template), built as `Layer.mergeAll(<keyless toolkits>, <Layer.unwrap
key-gated toolkits>)` over a single `McpServer.layerStdio` — but treat the
server as a **thin follow-on slice gated behind the driver/client slices**, not
the v1 critical path. The generated-tool-name contract is mandatory before any
toolkit merges: driver-prefixed stable names (the `m365_` precedent),
safe-character normalization (`^[a-zA-Z0-9_-]+$`, ~64–128 char cap),
duplicate-detection with a checked-in collision report, and integration tests
against the Effect MCP JSON schemas plus at least one MCP client/provider
constraint. Raw `operationId` is metadata/description, not necessarily the wire
name.

**Rationale:** RESEARCH confirms `nlp-mcp` already proves the N-toolkits→one-
server merge via `Layer.mergeAll(...)` over one `layerStdio`, so a gov-legal
server is "purely additive," and the routing record's "MCP target is patterns,
not a 3rd server" is explicitly logged as an *align-stage decision*, not settled.
The `m365`/`m365-mcp` sibling split is the in-repo packaging precedent. Merging
five drivers into one server raises cross-driver tool-name collision risk, which
is why the generated-name contract and gating mechanics
(`Config.option(Config.redacted(...))` + `Layer.unwrap(... ? toolkit :
Layer.empty)` — NOT `McpSchema.EnabledWhen`, which is discovery-shaping, not
credential gating) are preconditions rather than afterthoughts.

**Status:** open (for /grill-with-docs)

## Q4: First slice — which driver is the reference vertical that proves the substrate end-to-end?

**Recommended:** **Finish `@beep/govinfo` first** (do NOT restart — it already
has a `Search` HttpApi contract + value models scaffolded), as slice 1: it proves
the shared transformer on the `HttpApiClient.make(api, { transformClient })` seam
plus api.data.gov `api_key` auth, cache, and rate-limit reading live
`X-RateLimit-*` headers — on the *official legal-edition* source. Slice 2 is a
**keyless driver (eCFR or FedReg)** to prove the raw-client
(`HttpClient.mapRequest`) path and exercise the generator spike with zero auth
surface. CourtListener and DOL come **last** — they are blocked on the metadata
spike, live auth-enforcement probes, and (CourtListener) the open
data/source-terms question. The govinfo finish work must also repair the package
manifest: its `src/**` already imports `@beep/identity` (11 hits) and
`@beep/schema` (4 hits) but `package.json` declares only `effect`.

**Rationale:** RESEARCH marks govinfo PARTIAL (domain-only, no transport) and the
other four as bare VERSION-only skeletons, and the routing record locks "finish
govinfo, do not restart." govinfo is the lowest-risk first slice because the
hardest unknowns (a clean public-domain spec, an official-source contract, the
single transformer generalization seam) are already half-built. A keyless driver
de-risks the generator/raw-client path without auth confounds. CourtListener/DOL
carry the most unresolved blockers (no clean spec, disputed `anonymous=401`
enforcement, the 2026-05-07 rate cliff, unanswered data-use terms), so
sequencing them last keeps the reference vertical clean.

**Status:** open (for /grill-with-docs)

## Q5: Shared client layer — one transformer parameterized over three auth families, or per-driver bespoke clients?

**Recommended:** **One shared auth+retry+cache+rate-limit transformer**,
parameterized over the **three** auth families (Token-header for CourtListener
— literal `Authorization: Token <key>`, NOT Bearer; api.data.gov `api_key` query
param for GovInfo; agency-native `X-API-KEY` for DOL), applied via
`HttpApiClient.make(api, { transformClient })` for the govinfo HttpApi-client
driver and `HttpClient.mapRequest` for the raw-client drivers. Build it on the
native `effect@4.0.0-beta.91` primitives RESEARCH inventoried —
`HttpClient.withRateLimiter` (honors `Retry-After` in both RFC 9110 forms,
auto-retries 429, reads `RateLimit-*` headers), `HttpClient.retryTransient`
(`Schedule.exponential` ⊕ `jittered`), `Cache.makeWith({ timeToLive })` for the
+10% TTL-jitter and shorter negative-cache TTLs. Secrets via
`Config.redacted("ENV")` per driver (`COURTLISTENER_API_TOKEN`, `DOL_API_KEY`,
`GOVINFO_API_KEY`), never logged (runpod/uspto `RedactedFromValue` precedent);
absent key → omit auth gracefully (keyless eCFR/FedReg always-on).

**Rationale:** RESEARCH identifies `transformClient` as "the single
generalization point that lets one shared transformer serve both raw-client
drivers and the govinfo HttpApi-client driver," and confirms the donor's
hand-rolled auth/cache/retry/rate-limiter machinery is now largely native in
Effect v4 — so the work is composition, not reimplementation. CAPTURE's two-auth-
family model is corrected to three (DOL is agency-native `X-API-KEY`, NOT
conflated with api.data.gov), which the single transformer must branch on. A
shared transformer also concentrates the per-source rate-limit policy (esp. the
CourtListener 50/hr cliff and citation-lookup per-token charging) in one
auditable place.

**Status:** open (for /grill-with-docs)

## Q6: Package placement — where do the shared transformer, the codegen scripts, and the MCP bin live?

**Recommended:** Three distinct homes. (1) The shared HTTP-client transformer
goes in a **new dedicated shared package** — recommended under
`packages/foundation/capability/` (where cross-driver capabilities already live:
nlp, file-processing, observability), consumed by each driver; there is currently
no `packages/drivers/_shared` convention, so this is net-new and the exact home
(foundation/capability vs a new drivers-level shared package) is the sub-fork to
settle. (2) Codegen stays **per-driver** as `scripts/generate.ts` with a
committed spec + package-private `src/_generated/*` artifact (runpod/acp
precedent, `"./_generated/*": null` export). (3) The MCP server is its **own
sibling package** `packages/drivers/gov-legal-mcp` (per Q3, mirroring
`m365-mcp`/`nlp-mcp`).

**Rationale:** RESEARCH/repo inspection confirms no shared drivers package exists
today (`packages/drivers/` has no `_*` entries) and that cross-driver capabilities
already live under `packages/foundation/capability/*`, making it the natural home
for a reused transformer. Keeping `generate.ts` per-driver matches every in-tree
generator and preserves the offline-build law (download is codegen-only; committed
spec + `_generated/` make build/check network-free, per
`packages/drivers/acp/AGENTS.md`). The MCP-bin-as-sibling split is the established
`m365`/`m365-mcp` packaging pattern.

**Status:** open (for /grill-with-docs)

## Q7: Determinism gate — wire a repo-wide `build → codegen` turbo edge, or keep per-package generate-first audit + a `git diff` drift check?

**Recommended:** **Keep the per-package convention** — generate-first audit + a
CI `git diff --exit-code` drift check on re-running `generate` — and do **NOT**
wire a global `build → codegen` turbo edge in v1. Pin exact versions in each
codegen template (both `effect` and `@effect/openapi-generator` at
`4.0.0-beta.91`, plus the upstream spec release, exactly as the acp generator
already does). Plan a per-driver raw-request escape hatch (runpod
`RunpodRawRequest`) for spec drift.

**Rationale:** RESEARCH marks the repo-wide `build → codegen` edge `NOT FOUND`
(`turbo.json` `build` dependsOn is `["^build"]` only; a `codegen` task exists but
is not a `build` dependency, `turbo.json:30-34,143-147`) and notes determinism is
*currently* enforced per-package via the generate-first audit + committed
`_generated/` artifact. Matching the existing convention is lower-risk than
introducing a global edge that re-shapes every package's build graph; the
`git diff` drift check catches the same staleness the turbo edge would, without
the blast radius. Turbo requires deterministic codegen, which the committed-spec
approach already guarantees.

**Status:** open (for /grill-with-docs)

## Q8: Data/source-terms gate — ship CourtListener caching/fixtures now under a default policy, or block until a per-upstream data-terms matrix exists?

**Recommended:** **Default-deny until the matrix exists.** Until a per-upstream
data/source-terms matrix is produced (data license, API terms of use,
commercial-use limits, caching/retention permission, redistribution/fixture
rules, attribution, and source-of-authority caveat), CourtListener caching is
**in-process/ephemeral only** and third-party legal content is **excluded from
committed fixtures**. FedReg-derived outputs must preserve source/status metadata
and reconcile to GovInfo when legal authority matters (FedReg is a keyless
official-site API but carries a prototype "Legal Status" caveat; GovInfo is the
official legal edition). Building the matrix is a **required pre-shape research
item**, not a shape-stage afterthought.

**Rationale:** RESEARCH is explicit that code/spec licensing (both donor repos
MIT; US-Gov specs public-domain) is *cleared* but data/API-use terms are *open* —
CourtListener is not a US-Gov publisher, may expose PACER/RECAP-sourced content,
and the proposed shared client *adds caching*, so whether cached opinions,
dockets, documents, or citation-lookup results may be stored/redistributed/shipped
is unanswered. A conservative default unblocks the engineering slices (govinfo,
eCFR, FedReg are all public-domain/keyless) while keeping the one upstream with
real legal-content risk behind an ephemeral-only policy until Legal-grade answers
exist.

**Status:** open (for /grill-with-docs)

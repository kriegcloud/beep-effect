# extend-in-place-architecture-and-codegen

Scope: confirm the module decomposition for extending the hand-rolled 5-file `@beep/uspto`, the two net-new sibling drivers, the hand-rolled-over-codegen decision (runpod precedent), the credential-gated MCP tool-registration pattern, and the AGPL-licensed docket-normalization prompt + eval-fixture integration into `@beep/langextract` / `nlp-mcp`.

## Findings

### A. Current `@beep/uspto` surface (filesystem-grounded baseline)

- The driver is exactly **5 source files** — `index.ts`, `Uspto.config.ts`, `Uspto.errors.ts`, `Uspto.models.ts`, `Uspto.service.ts` — and is hand-rolled with **no `scripts/generate.ts`, no `openapi.json`, no `_generated/`** (`/home/elpresidank/YeeBois/projects/beep-effect/packages/drivers/uspto/src/`; `package.json` has no `generate` script and deps are only `@beep/identity`, `@beep/schema`, `@beep/utils`, `effect` — no Orval/axios/Zod). This confirms the CAPTURE routing premise (extend-in-place, not restart).
- The service already speaks ODP `api.uspto.gov` for five operations: `getApplication`, `getContinuity`, `getDocuments`, `downloadDocument`, `searchApplications` — and search is a **GET** `…/api/v1/patent/applications/search?q=` call (`Uspto.service.ts:330-340`). The structured POST body (filters/rangeFilters/sort) is *not* yet implemented — net-new.
- The driver projects a **thin curated model**: `UsptoApplicationMetadata` picks ~11 fields out of the raw `patentFileWrapperDataBag` → `applicationMetaData` envelope via a hand-written `metadataFromWrapper` transform (`Uspto.service.ts:135-156`, `Uspto.models.ts:154-171`). This is a deliberate projection, not a generated 1:1 type mirror.
- Security-critical bespoke logic already lives in the service and **cannot be codegen'd**: `assertAllowedRemoteUrl` SSRF guard (loopback/link-local/metadata fail-closed), same-origin `X-API-KEY` credential scoping (`isSameUsptoHost`), and same-origin enforcement on document downloads (`Uspto.service.ts:218-298`). This is the strongest single argument for staying hand-rolled.
- The error model (`UsptoErrorReason` LiteralKit: `config`/`not-found`/`rate-limited`/`response-decoding`/`response-status`/`transport`) and config (`USPTO_API_URL = "https://api.uspto.gov"`, redacted `USPTO_API_KEY` via `Config.option`) are already in place and reusable (`Uspto.errors.ts:29-40`, `Uspto.config.ts:26`, `Uspto.service.ts:395-408`).

### B. The runpod codegen precedent — why it does NOT generalize to uspto

- runpod is `openapi.json` (151 KB checked-in spec) + `scripts/generate.ts` (27.7 KB Effect/Schema OpenAPI→TS generator) → `src/_generated/Runpod.generated.ts` (98.7 KB), with `"generate": "bun run scripts/generate.ts && bunx biome check --write src/_generated/Runpod.generated.ts"` and `beep:audit` running `generate` first (`/home/elpresidank/YeeBois/projects/beep-effect/packages/drivers/runpod/package.json`, `scripts/generate.ts`). The generated module is **export-blocked** (`"./_generated/*": null`) and AGENTS.md flags it "do not hand-edit".
- The generator consumes a **subset JSON-Schema/OpenAPI model** (`JsonSchema`, `OpenApiParameter`, `OpenApiOperation`, `OpenApiPathItem`, `OpenApiComponents`) defined with `S.Class` + `$RunpodId` identity composers (`scripts/generate.ts:15-120`). It is the repo's own Effect-native codegen path — the precedent the CAPTURE cites against introducing Orval/axios/Zod.
- Decision rationale (synthesis): runpod codegen pays off because Runpod publishes a clean, broad OpenAPI 3 spec and the driver wants near-full coverage of a stable REST surface. `@beep/uspto` is the opposite case: it wants a **narrow, curated, security-hardened projection** of a multi-envelope API, with bespoke SSRF/credential logic and hand-written envelope-unwrapping that codegen cannot express. ODP *does* publish OpenAPI/swagger (per ODP docs at data.uspto.gov), so codegen is *possible* — but generating hundreds of types to then re-project ~11 fields is net-negative. **Recommendation: extend in place; do NOT add `generate.ts`/`openapi.json`.** (Verified: existing uspto package layout vs runpod package layout, above.)

### C. ODP API current state, structured search body, auth, deprecations

- **Auth + base URL:** `X-API-Key` header against base `https://api.uspto.gov` (default), API key from data.uspto.gov — confirmed by the patent-dev/uspto-odp Go client and matches the existing driver's config (https://github.com/patent-dev/uspto-odp).
- **ODP 3.0 launched 2025-11-21** with **38 total endpoints**: 13 Patent Application, 3 Bulk Data, 3 Petition, **19 PTAB** (new in 3.0) (https://patent.dev/uspto-open-data-portal-3-0-ptab/). PTAB trial types covered: **IPR, PGR, CBM, and derivation (DER)** — confirms nugget us-gov-open-data-mcp#7.
- **13 Patent Application endpoints** (Go client method names, https://github.com/patent-dev/uspto-odp): search, get-by-number, meta-data, **adjustment (patent-term-adjustment), continuity, documents, assignment, associated-documents, attorney, foreign-priority, transactions**, search-download, status-codes. This is the exact extend-toward surface the CAPTURE lists (`patents-mcp#6`, `us-gov-open-data-mcp#7`). The existing driver covers only meta-data/continuity/documents/download — the other 6+ are net-new endpoints.
- **Structured search POST body shape (canonical, to model with effect/Schema)** — from the official ODP-API-Query-Spec and api-syntax-examples (https://data.uspto.gov/apis/api-syntax-examples, https://data.uspto.gov/documents/documents/ODP-API-Query-Spec.pdf):
  ```json
  {
    "q": "Nanobody",
    "filters":      [{ "name": "applicationTypeLabelName", "value": ["Utility"] }],
    "rangeFilters": [{ "field": "filingDate", "valueFrom": "2022-01-01", "valueTo": "2023-12-31" }],
    "pagination":   { "offset": 0, "limit": 25 },
    "sort":         [{ "field": "filingDate", "order": "Desc" }],
    "fields":       []
  }
  ```
  Shape gotcha: **`filters` use `name`/`value[]`, while `rangeFilters` and `sort` use `field`** — asymmetric, model both exactly. All keys optional. The PTAB analogue is `POST /api/v1/patent/trials/proceedings/search` with `{"q":"trialMetaData.trialTypeCode:IPR"}` (https://patent.dev/uspto-open-data-portal-3-0-ptab/).
- **Query syntax engine is OpenSearch/Solr-style, not raw Lucene.** The patent_client docs describe the `q` syntax as **OpenSearch query syntax** with `field:value`, boolean `AND`, nested fields (e.g. `inventionTitle:Ball AND filingDate:2024-01-01`) (https://patent-client.readthedocs.io/en/latest/user_guide/open_data_portal.html). Implication for the escaping nugget (uspto_pfw_mcp#2): OpenSearch `query_string` parses **Lucene syntax under the hood**, so the documented Lucene metacharacter escape policy still applies, but label the helper "OpenSearch/Lucene query_string escaping," not "Lucene" — and the canonical reserved-character list should be verified against the OpenSearch `query_string` reserved set (`+ - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /`), which is broader than the partial set in the nugget snippet.

### D. NEVER-PatentsView caution — verified and date-pinned

- Legacy PatentsView API **support ended February 2025** ("Support for Legacy API to End in February 2025", https://patentsview.org/data-in-action/support-legacy-api-end-february-2025-switch-patentsearch-api-now).
- PatentsView **migrates to ODP on 2026-03-20**; previously-issued **PatentSearch API keys are NOT compatible with ODP** (must re-register for ODP keys); `search.patentsview.org/api` faces interruption with no committed ODP relaunch date (https://www.uspto.gov/subscription-center/2026/patentsview-migrating-uspto-open-data-portal-march-20, https://data.uspto.gov/support/transition-guide/patentsview). `api.patentsview.org` was independently observed dead (301 → data.uspto.gov) circa 2026-05. This pins the CAPTURE caution: port the PatentsView `_or/_and/_text_any` DSL **shape** but retarget to the ODP filters/rangeFilters body above — never the dead endpoint.
- **Access tightening dates** (new, beyond CAPTURE): ODP requires a signed-in USPTO.gov account **from 2026-06-18**, and **from 2026-08-18** requires four additional profile fields under an "Open Data Portal" section (https://data.uspto.gov/support). Plan the live integration-test gating around these (account-bound key issuance).

### E. ppubs full-text tier — ADVERSARIAL DOWNGRADE: likely already dead

- The CAPTURE nuggets patents-mcp#1/#2 (ppubs session handshake + `searchWithBeFamily`) are **reverse-engineered undocumented endpoints that are now actively blocked** (direct POSTs to `/dirsearch-public/searches/searchWithBeFamily` and the session endpoint return 404/403). The canonical Python USPTO library **`parkerhancock/patent_client` was archived (read-only) on 2026-04-24** (`gh api repos/parkerhancock/patent_client` → `"archived": true`, `"pushed_at": "2026-04-24T15:24:41Z"`), with the maintainer citing exactly this PPS-endpoint blocking (https://github.com/parkerhancock/patent_client/issues/63). Two independent web searches corroborate.
- Recommendation refinement: the ppubs modules (`Uspto.ppubs.service.ts` / `Uspto.ppubs.models.ts`) should be **DEFERRED / de-scoped to a clearly-marked best-effort experiment**, not built into the P2 wave. The graceful 403→source-document fallback (patents-mcp-server#4) is the durable pattern; the ppubs full-text tier itself is fragile-to-dead as of mid-2026. (UNVERIFIED nuance: whether *any* ppubs JSON path still works in 2026 — primary endpoints are JS-app-gated; treat as unavailable absent a fresh working capture.)

### F. EPO OPS sibling driver — current state (net-new `packages/drivers/epo`)

- EPO OPS is at **v3.2**: base `https://ops.epo.org/3.2/rest-services`, OAuth2 **client-credentials** token endpoint `https://ops.epo.org/3.2/auth/accesstoken`, **access tokens expire after ~20 minutes**, free tier **4 GB/week**, throttling via `X-Throttling-Control` with `black` → throttle (https://patent.dev/epo-ops-v3-2-go-client-library/, https://pkg.go.dev/github.com/patent-dev/epo-ops, https://pypi.org/project/python-epo-ops-client/). This corroborates nugget patents-mcp-server#2 (the nugget's "19-min cached token (1-min buffer)" = a 20-min token cached for 19 min) and the force-array XML parsing for family-member/classification/applicant/inventor/priority/legal nodes. Gate behind 1Password (OAuth2 consumer key/secret) per CAPTURE caution.

### G. The two net-new sibling drivers (decomposition)

- `packages/drivers/epo` (EPO OPS OAuth2, §F) — ABSENT today (confirmed by tree-snapshot); fully net-new.
- `packages/drivers/google-patents-bigquery` (BigQuery `patents-public-data`, mandatory dry-run cost gate, `UNNEST` localized claims/description) — net-new; GCP creds + billing, out of the offline/privilege-safe default scope (CAPTURE cautions; nuggets patents-mcp-server#10, patents-mcp#3). A third candidate, `packages/drivers/google-patents` (SerpApi), is lower-priority. **Open question:** the task says "the two net-new sibling drivers" — the most defensible pair is `epo` + `google-patents-bigquery`; if the BigQuery/GCP dependency is deferred, the pair becomes `epo` + `google-patents` (SerpApi). Flag for the align stage.

### H. Proposed module decomposition for `@beep/uspto` extension

Keep the existing 5 files; add cohesive modules (each a thin curated projection, all reusing `UsptoError`/`$UsptoId`/`@beep/schema`):
- `Uspto.search.ts` — OpenSearch/Lucene `query_string` escaping helper (anti-injection, length cap), friendly→nested-API field map (`patentNumber:` → `applicationMetaData.patentNumber:`), structured POST body builder (`filters`/`rangeFilters`/`sort`/`pagination`/`fields`), identifier disambiguation (app vs patent vs publication + confidence), and `SearchParameters` parameter-object validation (art_unit/examiner/customer_number/date ranges) as effect/Schema models (nuggets uspto_pfw_mcp#1/#2/#3/#14, mcp-uspto#5, uspto-patents-mcp#1).
- `Uspto.prosecution.ts` — `/transactions` timeline model (`statusCodeBag` → status/date/description), `/assignment`, `/adjustment`, `/attorney`, `/foreign-priority`, `/associated-documents` endpoints (nuggets mcp-uspto#4, patents-mcp#6, us-gov-open-data-mcp#7).
- `Uspto.ptab.ts` — PTAB trials/decisions/documents/appeals/interference search over the 19 PTAB endpoints (IPR/PGR/CBM/DER) (nugget us-gov-open-data-mcp#7).
- `Uspto.vocab.ts` — status-code→lifecycle dictionary and document-code litigation-importance tiers; these are **public-domain US-government facts**, license-safe to encode directly (nuggets patents-mcp-server#8, uspto_pfw_mcp#7).
- `Uspto.ppubs.*` — DEFERRED (§E).
- Extend `Uspto.errors.ts` with `UsptoEndpointSunset` and richer `errorCode`/`errorDetails` variants (nuggets uspto-patents-mcp#3, patents-mcp#7). The existing `searchApplications` GET stays; add a `searchStructured` POST path.

### I. Credential-gated MCP tool registration pattern

- The repo's MCP composition is **static layer merge**: `Layer.mergeAll(McpServer.toolkit(NlpToolkit).pipe(Layer.provide(WinkNlpToolkitLive)), McpServer.toolkit(StreamingToolkit).pipe(Layer.provide(StreamingToolkitHandlersLive)))` over `McpServer.layerStdio` (`/home/elpresidank/YeeBois/projects/beep-effect/packages/drivers/nlp-mcp/src/Server.ts:101-107`). Registration is a build-time layer concern, not a per-request runtime gate.
- The credential-gating primitive already exists in this repo: `Config.redacted("USPTO_API_KEY").pipe(Config.option)` yields `O.Option<Redacted>` (`Uspto.service.ts:398`). Canonical pattern (NET-NEW for MCP): read each driver's credential via `Config.option`, then **conditionally include that driver's `McpServer.toolkit(...)` layer** — present-credential → real toolkit layer, absent → `Layer.empty` — composed with `Layer.unwrapEffect`/`Layer.mergeAll`. This keeps EPO (OAuth2) and BigQuery (GCP) tools out of the advertised tool list when their secrets are unconfigured, matching the existing same-origin `X-API-KEY` scoping ethos in `@beep/uspto`. This is the `mcp-auth-gated-registration` exploration's substrate; no in-repo example of conditional MCP registration exists yet (mark NET-NEW).

### J. Docket/serial-number normalization prompt — LICENSE BLOCKER (the #1 finding)

- **CourtListener is AGPL-3.0.** `LICENSE.txt` is verbatim the **GNU Affero General Public License v3** ("Copyright 2010, Brian Carver and Michael Lissner … under the terms of the GNU Affero General Public License … version 3"). The GitHub API reports `spdx_id: "NOASSERTION"` / name `"Other"` **only because the file prepends a custom copyright line before the AGPL body** — it is unambiguously AGPL-3.0 (`gh api repos/freelawproject/courtlistener/license`; `gh api …/contents/LICENSE.txt`).
- The target `@beep/langextract` is **Apache-2.0** (`package.json` `"license": "Apache-2.0"`). **AGPL-3.0 source cannot be relicensed into an Apache-2.0 package**, and AGPL's §13 network-use copyleft would attempt to impose AGPL on the consuming runtime. **Do NOT verbatim-port `cl/search/llm_prompts.py`.**
- What `llm_prompts.py` actually contains (8.5 KB, AGPL): `F_GENERAL_GUIDELINES` (9 numbered court-docket cleaning rules — "Misc."/"Orig." suffixes, mid-string "Docket" exclusion, BIA/agency formats), `F_EXAMPLES` (**54** input→output docket-string pairs), `OUTPUT_FORMAT` (JSON array keyed by `unique_id` with `cleaned_nums`), `F_PROMPT` (guidelines+format+examples), `F_TIE_BREAKER` (adjudicates two prior attempts) (`gh api …/contents/cl/search/llm_prompts.py`).
- **Two licensing layers:** (1) the **prompt prose + guideline wording + curated/ordered example selection** is copyrightable AGPL expression — reimplement clean-room; (2) the **raw docket strings** are uncopyrightable facts — but they are **court** dockets, not USPTO application/serial numbers, so they are the wrong corpus anyway.
- **Recommendation:** clean-room reimplement the *pattern* (few-shot + tie-breaker + JSON-keyed-by-id output) on `@beep/langextract`'s **existing** primitives — `ExtractionExample`/`ExtractionExampleItem`/`ExtractionTarget` and `buildPrompt` already render few-shot examples (`/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/capability/langextract/src/Target/index.ts`, `…/Service/index.ts:56-97`). Author a **fresh USPTO-specific** guideline set + example corpus (8-digit series+serial, `US` prefix, kind codes, OCR'd office-action noise), and reuse the existing deterministic `normalizeUsptoApplicationNumber`/`normalizeUsptoPatentNumber` regex helpers (`Uspto.models.ts:109-139`) for well-formed inputs — the LLM tier is only for messy free-text. The eval-fixture corpus is then originally-authored, license-clean, and domain-correct.

## Sources

- `@beep/uspto` source (filesystem): `/home/elpresidank/YeeBois/projects/beep-effect/packages/drivers/uspto/src/{index,Uspto.config,Uspto.errors,Uspto.models,Uspto.service}.ts`
- runpod codegen (filesystem): `/home/elpresidank/YeeBois/projects/beep-effect/packages/drivers/runpod/{package.json,openapi.json,scripts/generate.ts,src/_generated/Runpod.generated.ts,AGENTS.md}`
- nlp-mcp server (filesystem): `/home/elpresidank/YeeBois/projects/beep-effect/packages/drivers/nlp-mcp/src/Server.ts`
- langextract (filesystem): `/home/elpresidank/YeeBois/projects/beep-effect/packages/foundation/capability/langextract/{package.json,src/Target/index.ts,src/Service/index.ts}`
- USPTO ODP 3.0 / PTAB: https://patent.dev/uspto-open-data-portal-3-0-ptab/
- USPTO ODP Go client (endpoint surface + auth): https://github.com/patent-dev/uspto-odp
- ODP query/search syntax spec (PDF): https://data.uspto.gov/documents/documents/ODP-API-Query-Spec.pdf
- ODP API syntax examples (structured POST body): https://data.uspto.gov/apis/api-syntax-examples
- ODP support / access-tightening dates: https://data.uspto.gov/support
- PatentsView → ODP transition guide: https://data.uspto.gov/support/transition-guide/patentsview
- PatentsView migrating 2026-03-20: https://www.uspto.gov/subscription-center/2026/patentsview-migrating-uspto-open-data-portal-march-20
- PatentsView legacy API ends Feb 2025: https://patentsview.org/data-in-action/support-legacy-api-end-february-2025-switch-patentsearch-api-now
- patent_client ODP query syntax + PEDS status: https://patent-client.readthedocs.io/en/latest/user_guide/open_data_portal.html
- patent_client archived (ppubs dead): `gh api repos/parkerhancock/patent_client` (archived=true, pushed_at 2026-04-24); https://github.com/parkerhancock/patent_client/issues/63
- EPO OPS v3.2: https://patent.dev/epo-ops-v3-2-go-client-library/ ; https://pkg.go.dev/github.com/patent-dev/epo-ops ; https://pypi.org/project/python-epo-ops-client/
- CourtListener AGPL license + llm_prompts.py: `gh api repos/freelawproject/courtlistener/{license,contents/LICENSE.txt,contents/cl/search/llm_prompts.py}`; https://github.com/freelawproject/courtlistener

## Open / Unverified

- **Which two net-new sibling drivers** the task means is a routing decision: most defensible = `epo` + `google-patents-bigquery`; if GCP/billing is deferred, `epo` + `google-patents` (SerpApi). Resolve at align (§G).
- **ODP escaping reserved-character set:** the exact verbatim list from ODP-API-Query-Spec.pdf could not be fetched (data.uspto.gov is JS-rendered; PDF returned empty to the fetcher). Verified the engine is OpenSearch/Lucene-`query_string`-based via patent_client docs, so the OpenSearch `query_string` reserved set applies — but confirm against the PDF (or a captured request) before finalizing the escape helper. The nugget's partial set (`\ + & | ! ( ) { } ^ ~`) is narrower than OpenSearch's full set.
- **ppubs liveness in 2026:** marked likely-dead from two corroborating searches + the patent_client archival; not directly re-tested against a live ppubs request. If a working capture surfaces, the ppubs tier could be revived as best-effort — but do not plan on it.
- **Whether ODP search accepts POST as well as GET** on `…/applications/search`: the structured body is documented for ODP search generally and confirmed for PTAB `…/proceedings/search`; confirm the patent-applications search endpoint specifically accepts the same POST body before wiring `searchStructured`.
- **Licenses of the other pattern-source MCP repos** (uspto_pfw_mcp, mcp-uspto, patents-mcp, patents-mcp-server, uspto-patents-mcp, google-patents-mcp) were not individually verified; the nuggets are pattern/clean-room adoption (escaping policy, field maps, DSL shape, public-domain USPTO status-code/doc-code dictionaries), not verbatim ports, so risk is low — but confirm before copying any non-trivial verbatim code. The dominant, confirmed blocker is the AGPL CourtListener prompt (§J).

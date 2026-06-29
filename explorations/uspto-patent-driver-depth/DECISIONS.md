# USPTO Patent Driver Depth — Decisions

<!--
Stage 2 (ALIGN seed). Branch-closing questions with a RECOMMENDED answer
first, posed but NOT resolved. The human resolves each via
`/grill-with-docs uspto-patent-driver-depth`, then this file becomes the
resolution log (one entry per closed branch). Until then every question below
is `Status: open` and mirrored in ops/manifest.json `openQuestions`.

These forks are grounded in RESEARCH.md (synthesis + Unresolved) and the
folded Codex research-gate critique (reviews/2026-06-29-codex-research.md:
3 blocking + 5 advisory).
-->

## Q1: Driver-wave scope — in-place `@beep/uspto` depth only, or fan out to net-new sibling drivers in this packet?

**Recommended:** Graduate this exploration as an **in-place `@beep/uspto` depth goal first**, and split the three net-new sibling drivers (`epo`, `google-patents-bigquery`, `google-patents`) into **separate follow-on goal packets** rather than one mega-goal. When the credentialed tiers do graduate, the defensible default pair is **`epo` + `google-patents-bigquery`**; if GCP billing is deferred, fall back to **`epo` + `google-patents` (SerpApi)**. ppubs stays **DEFERRED** to a clearly-marked best-effort experiment.

**Rationale:** Extend-in-place is zero-new-package, zero-credential, and privilege-safe by default — it can land and prove the depth pattern without any secret/billing surface (RESEARCH "Locked decisions": extend-in-place, not restart). Each net-new driver carries its own auth/secret/billing/license gravity (EPO OAuth2, GCP billing + CC BY 4.0 attribution, SerpApi paid-scraping/ToS risk), so folding all four into one goal balloons the appetite and couples a clean in-place win to credential governance it doesn't need. `epo` leads the credentialed pair because it has a free registered fair-use tier (~4 GB/week, no billing); `google-patents-bigquery` is the *sanctioned* dataset vs SerpApi's scraping risk (RESEARCH §4). ppubs reference impls are archived/fragile (`patent_client` archived 2026-04-24; split `/api/` vs `/dirsearch-public/` base) — the durable pattern is the 403→source-document fallback, not a full-text tier in this wave (RESEARCH §3).

**Status:** open (for /grill-with-docs)

## Q2: First vertical slice — what is the smallest end-to-end proof that graduates first?

**Recommended:** The **ODP query surface on the existing `@beep/uspto` driver**: injection-safe literal-term escaping (full modern OpenSearch reserved set, strip `<>`, ~1000-char cap) + friendly→API nested field map (always emit fully-qualified dotted paths) + identifier disambiguation (app/patent/publication with a **confidence score**, never a hard guess), all feeding the **existing GET `searchApplications`**. No new packages, no credentials, no MCP gating. Verify with fixtures over the escaping/field-map/disambiguation helpers plus a live-probe checklist for the grammar features.

**Rationale:** This is pure extend-in-place onto the five hand-rolled files, privilege-safe, and has no secret/billing/license dependency — the fastest path to a graded, testable depth win. Codex confirmed-sound that GET `searchApplications` is the existing compatibility path and the structured POST is "the gap" (review: confirmed-sound #2). It de-risks the highest-traffic surface (query construction) before any prosecution-vocab or credentialed-tier work, and the escaping/disambiguation logic is the load-bearing security boundary (anti-injection + confidence-scored identifiers) that everything downstream depends on.

**Status:** open (for /grill-with-docs)

## Q3: `searchStructured` (POST structured body) — ship it in this packet, or keep it behind a spike?

**Recommended:** **Keep `searchStructured` behind a documented spike.** Do NOT wire the POST `filters`/`rangeFilters`/`sort` body until a **real-browser Swagger read or a key-authenticated probe** confirms `POST /api/v1/patent/applications/search` accepts the structured body. The existing GET `searchApplications?q=` remains the compatibility path; model the `filters` (`name`/`value[]`) vs `rangeFilters`/`sort` (`field`) asymmetry only once the endpoint is proven.

**Rationale:** This is the Codex **release-blocker** (review: blocking #1) — the synthesis stated the POST as confirmed in the exec summary but marked the *same* applications-search POST as Unresolved. The structured-body acceptance is confirmed only for PTAB `/proceedings/search`, **unverified for `applications/search`** (RESEARCH §1 + Unresolved). Building `searchStructured` against an assumed method/body combination risks shipping a method the target endpoint rejects; the WAF/Swagger gate must be cleared in a real browser first.

**Status:** open (for /grill-with-docs)

## Q4: Status-code vocabulary — versioned generated artifact, or runtime `/status-codes` cache?

**Recommended:** **(a) A versioned generated artifact** `Uspto.vocab.generated.ts`, built from the PatEx/ODP `/status-codes` table (canonical **225 codes**, keyed by integer `applicationStatusCode`) with an embedded **source date + checksum + a refresh command**, export-blocked like the runpod `_generated/*: null` precedent. Do NOT port either hand-curated MCP status-code map (both are corrupted — 4-of-5 wrong). Anchor the document-tier vocab to `documentCode` (the IFW spreadsheet, namespace-collision guard for `RCEX/EXIN/CTAV/CTNF/CTFR`), and decode `/transactions` as `eventDataBag`, not `statusCodeBag`.

**Rationale:** Codex advisory — "sync" is not an implementation verb without owner, cadence, and proof gate (review: advisory #5). Option (b) runtime cache **couples vocab decode to secret availability** (the `/status-codes` endpoint is key-authenticated), breaking offline/privilege-safe decode; (a) is offline-safe, deterministic, and proof-gated via checksum (RESEARCH "Locked decisions"). USPTO status/event/document dictionaries are US-government **public-domain facts**, so embedding them in `Uspto.vocab.ts` is license-safe (RESEARCH Constraints).

**Status:** open (for /grill-with-docs)

## Q5: Package placement — where do net-new drivers and the prosecution-phase overlay live?

**Recommended:** Net-new drivers go under **`packages/drivers/{epo,google-patents-bigquery,google-patents}`**, mirroring `@beep/uspto`'s Redacted-secret config pattern and reusing the shared `assertAllowedRemoteUrl` SSRF guard from `@beep/schema`. Hold the **vocabulary-ownership boundary**: `@beep/uspto` owns USPTO-native vocab as **faithfully-decoded data** (codes-as-strings + native categories, zero interpretation) in `Uspto.vocab.ts`; the **opinionated overlays** — litigation-importance tiers, a **NEW `ProsecutionPhase`/`PatentAssetStatus`** value, OA→rejection semantics — live in **`@beep/law-practice-domain`**, with driver→domain translation in `law-practice/use-cases` `OfficeActionReview`. Reuse the existing XML stack (`@beep/schema/Xml` + cataloged `fast-xml-parser`) with an EPO force-array hook — do NOT add a new parser. **Do NOT overload the shared-kernel `ClaimLifecycle`.**

**Rationale:** Codex advisory — `ClaimLifecycle` is an **admission-state** axis already reused by law-practice `Distinction.lifecycleState`; prosecution **phase** is a different axis and needs its own value (review: advisory #4). The vocab-ownership split keeps native facts in the driver and legal/strategic judgment in the domain — the moment a mapping encodes litigation importance it crosses into `OfficeActionReview` (RESEARCH "Vocabulary-ownership boundary"). Reusing `@beep/schema/Xml` avoids a parallel XML layer the repo already has (review: advisory #3); port EPO throttle/auth logic from the **Apache-2.0** `ip-tools/python-epo-ops-client`, not the license-unverified TS source.

**Status:** open (for /grill-with-docs)

## Q6: Source/consent matrix — how is the privilege-safe boundary encoded across all sources?

**Recommended:** Encode a **source-policy axis** in the driver/MCP auth matrix that **separates "official/public-source" from "privilege-safe."** Default pre-filing/privileged matters to **offline-local or public-identifier-only** lookups (a known application/patent number, not free-text disclosure language). Require **explicit matter-level consent for ANY external free-text search** — **ODP and ppubs included**, alongside the three credentialed tiers. Make the opt-in **structural, not a runtime flag**: absence of a Redacted secret → the driver `Layer` fails fast / is not constructed, and its MCP toolkit layer resolves to `Layer.empty`. Govern EPO/GCP/SerpApi secrets as `op://` references via the 1Password skill; never commit. Keep the two distinct 403 behaviors separate (ppubs session-expiry re-handshake vs ODP structured-endpoint reroute-to-PDF).

**Rationale:** Codex **blocking #3** — the draft drew the consent boundary around EPO/BigQuery/SerpApi but treated ODP/ppubs as privilege-safe defaults. Both ODP search and ppubs **transmit free-text query text to external USPTO systems**; for pre-filing invention disclosures, confidentiality risk is **not** eliminated by an endpoint being official or no-key (RESEARCH "Auth / secret / offline boundaries"). Only offline/local search and public-identifier-only lookups are truly privilege-safe by default. The structural gate (missing secret → `Layer.empty`) makes the policy enforceable rather than advisory.

**Status:** open (for /grill-with-docs)

## Q7: MCP credential gating — which registration shape, and do we depend on `mcp-auth-gated-registration`?

**Recommended:** Treat credential-gated MCP registration as a **dependency on the active `explorations/mcp-auth-gated-registration` packet**, not net-new design space. Import its shapes: **build-time conditional mounting (Shapes A/B)** as the default — read each driver credential via `Config.option`, conditionally include its `McpServer.toolkit(...)` layer (present→real, absent→`Layer.empty`) so EPO/BigQuery tools **disappear from the advertised list** when unconfigured — reserving **Shape C** (always-register + handler-time `api_key_required` guard) only where a tool must advertise. Use the **v4 `Layer.unwrap`/`Layer.catch`** APIs with a `layers.reduce((acc, l) => Layer.merge(acc, l), Layer.empty)` fold, and land a **dtslint spike before committing to dynamic layer folding**. Do NOT re-derive these shapes here.

**Rationale:** Codex **blocking #2** — the design is not net-new; the active packet already shapes Shapes A/B/C, the `api_key_required` helper, and the `McpServer.registerToolkit` `isError` wire-encoding gotcha. Critically, **`Layer.unwrapEffect` is not an Effect v4 API** (`effect/src/Layer.ts` exports `unwrap`; `Layer.orElse` was removed → use `Layer.catch`), and a dynamically-built `Array<Layer>` cannot satisfy `Layer.mergeAll`'s non-empty tuple — the reduce-fold is required (RESEARCH §5). Build-time disappearance is the structural complement to Q6's missing-secret→`Layer.empty` gate.

**Status:** open (for /grill-with-docs)

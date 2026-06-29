# Codex research-gate critique — gov-legal-data-driver-codegen (2026-06-29)

## Blocking

**Finding 1: Federal Register legal-status correction is wrong**

Claim: `RESEARCH.md:135-143` says eCFR and Federal Register are "keyless and always-on" and then asserts: "multiple reports found NO support for CAPTURE's 'FedReg is an unofficial prototype' — current docs present it as an official NARA/GPO service; only the keyless fact is load-bearing."

Why it blocks: The current Federal Register API docs themselves include a "Legal Status" caveat that the site is a prototype and not the official legal edition (https://www.federalregister.gov/developers/documentation/api/v1). The research conflates "hosted by official federalregister.gov / NARA / GPO" with "official legal source." That would mislead align/shape into treating Federal Register API data as legally authoritative in the same way as GovInfo. Keyless access is sound; the legal-source posture is not.

Fix: Replace the correction with a three-part statement: Federal Register API is a current official-site API and keyless; FederalRegister.gov still carries an unofficial/prototype legal-status caveat; GovInfo remains the official legal-edition source for authoritative documents. Add an implementation constraint that FedReg-derived outputs must preserve source/status metadata and should link or reconcile to GovInfo when legal authority matters.

**Finding 2: No-spec APIs skip metadata-driven codegen alternatives**

Claim: `RESEARCH.md:126-127` says "No machine-readable OpenAPI is published — the SDK path needs a hand-authored spec subset or a hand-written HttpApi." `RESEARCH.md:128-134` says DOL has "No clean machine-readable OpenAPI surfaced." `RESEARCH.md:261-263` repeats that CourtListener and DOL "need a hand-authored spec subset or a hand-written HttpApi."

Why it blocks: That makes the choice look binary: clean OpenAPI or hand-author everything. It misses likely lower-maintenance discovery sources. CourtListener is Django REST Framework-backed and its own docs point users at API root / `OPTIONS` style endpoint metadata (https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview); DOL v4 exposes dataset metadata endpoints in the backing research (`research/upstream-api-contract-matrix.md:52`). These may not yield a full OpenAPI document, but they are prior art for generating a first schema/endpoint inventory instead of manually freezing field sets. Shape would badly underestimate maintenance if it commits to hand-authored specs without a metadata spike.

Fix: Add a required research item before align: prototype metadata extraction for CourtListener API root/`OPTIONS` and DOL v4 dataset metadata, compare emitted fields/statuses/pagination/auth to a hand-authored subset, and decide whether the generator consumes OpenAPI, Swagger 2.0, DRF metadata, DOL metadata, or a normalized intermediate operation model.

**Finding 3: Existing-rails thesis understates net-new infrastructure**

Claim: `RESEARCH.md:151-153` says: "The repo already owns the entire substrate this wedge composes — the work is 'implement five drivers on existing rails,' not 'build new rails.'" But `RESEARCH.md:250-260` also says there is no first-party OpenAPI-to-MCP `Toolkit` generator and no repo-wide `build -> codegen` Turbo edge.

Why it blocks: The synthesis contradicts itself in the part downstream planning will remember. The repo has good primitives and precedents, not the whole substrate. At least three rails are still net-new or unsettled: a shared gov/legal HTTP-client transformer, an operation-to-MCP-toolkit generator or manual toolkit policy, and a CI/codegen drift gate. If align/shape inherits "existing rails," appetite and sequencing will be too small.

Fix: Rewrite the inventory thesis to: "existing primitives and precedents cover schema generation, Effect HTTP, MCP server hosting, and package-private generated output; this packet still owns the shared client layer, MCP toolkit generation strategy, and codegen drift/check integration." Put those three decisions in the align-stage open-question list.

**Finding 4: OperationId-to-tool-name policy omits sanitization, namespacing, and collision handling**

Claim: `RESEARCH.md:90-96` says `registerToolkit` emits `tool.name` 1:1, so `operationId -> Tool.make(operationId, ...)` lands the Orval naming pattern, and the MCP spec defines `name` only as a "unique identifier" with no published regex. `RESEARCH.md:220-225` then treats existing MCP naming examples as sufficient precedent for the gov/legal server.

Why it blocks: "No regex in the prose spec" is not enough for generated tools. OpenAPI operationIds can be absent, duplicated, long, mixed-case, or contain characters that downstream clients/providers reject even if Effect accepts them. Merging five drivers also creates cross-driver collision risk. The backing report already had this as open/unverified (`research/conditional-mcp-registration-and-auth-gating.md:78`), but the synthesis drops it.

Fix: Add a generated-name contract: driver-prefixed stable names, safe-character normalization, max-length policy, duplicate detection with a checked-in collision report, and integration tests against Effect MCP JSON schemas plus at least one MCP client/provider constraint. Treat raw operationId as metadata/description, not necessarily the wire name.

**Finding 5: Licensing section resolves code/spec licenses but misses data and API-use terms**

Claim: `RESEARCH.md:318-333` concludes that donor repos are MIT and GovInfo/eCFR/Federal Register/DOL specs are US-Gov/public-domain, while CourtListener/DOL have no committable OpenAPI so hand-authored specs are original repo work. `RESEARCH.md:56-58` and `RESEARCH.md:187-188` also assume a shared auth/retry/cache layer.

Why it blocks: That is a code/spec licensing analysis, not a data/API-use analysis. CourtListener is not a U.S.-government publisher, the API may expose PACER/RECAP or other sourced content, and the proposed client layer includes caching. The research does not answer whether cached CourtListener content, citation lookup results, opinions, docket entries, or documents can be stored, redistributed, used commercially, or shipped in fixtures. Downstream shape could accidentally bake in persistence/redistribution behavior that violates terms even if the code is MIT.

Fix: Add a data/source terms matrix per upstream: data license, API terms, commercial-use limits, caching/retention permissions, redistribution/fixture rules, attribution requirements, and source-of-authority caveats. Until verified, mark CourtListener caching as in-process/ephemeral by default and exclude third-party legal content from committed fixtures.

## Advisory

**Finding 6: Box generator is missed prior art**

Claim: `RESEARCH.md:155-171` says there are "two distinct Effect-native styles already shipping" and lists only runpod and acp.

Why it blocks: Non-blocking, but `packages/drivers/box/scripts/generate.ts` is a third relevant in-repo generator. It parses `box-node-sdk` `.d.ts` files, emits package-private `src/_generated/Box.models.gen.ts` and `Box.operations.gen.ts`, builds generated operation groups, and feeds a hand-written service runner (`packages/drivers/box/src/Box.service.ts`). This is materially different from both runpod and acp: it is SDK/type-declaration-driven codegen rather than OpenAPI-driven codegen. It may be the closest precedent if CourtListener or DOL expose metadata or typed client surfaces but not clean OpenAPI.

Fix: Add Box to the codegen-precedent inventory as a third style: "typed SDK / declaration driven generator -> Effect schemas + operation wrappers." Note why it is or is not applicable to the no-spec gov APIs.

**Finding 7: eCFR spec format/version is not pinned**

Claim: `RESEARCH.md:135-137` says eCFR's machine-readable spec is at `https://www.ecfr.gov/developers/documentation/api/v1.json`. `RESEARCH.md:166-171` frames the acp path as the lowest-LOC route "where a clean OpenAPI 3.x spec exists."

Why it blocks: Non-blocking, but the eCFR URL is real, and it is not enough to say "machine-readable spec" without pinning the spec dialect and generator behavior. My browser check of `https://www.ecfr.gov/developers/documentation/api/v1.json` showed the eCFR document is Swagger 2.0, while the installed `@effect/openapi-generator` does say it normalizes Swagger 2.0 input (`node_modules/@effect/openapi-generator/dist/OpenApiGenerator.d.ts`). That makes this a missing constraint rather than a stop-ship error: the generator must be exercised and warnings captured for the eCFR dialect.

Fix: Update the eCFR row to say "Swagger 2.0 JSON at `/v1.json`; `@effect/openapi-generator` claims Swagger 2.0 normalization; run a spike and record warnings before choosing the acp-style path."

**Finding 8: GovInfo quota is presented as universal instead of key-specific**

Claim: `RESEARCH.md:112` lists GovInfo rate limit as "36,000/hr elevated tier, `X-RateLimit-*` headers." `RESEARCH.md:144-147` similarly says GovInfo has an "elevated 36,000/hr tier."

Why it blocks: Non-blocking, but the backing research admits this should be verified against the live issued key (`research/upstream-api-contract-matrix.md:131`). A documented GPO/api.data.gov tier is useful, but per-key limits can differ and `DEMO_KEY` is much lower. Hard-coding 36,000/hr into the shape would be fragile.

Fix: Phrase this as "documented GovInfo elevated tier; confirm from live `X-RateLimit-Limit` for the configured key." The shared client should learn from response headers and expose conservative defaults rather than assuming 36,000/hr.

**Finding 9: GovInfo package dependency repair is missing from the finish plan**

Claim: `RESEARCH.md:196-206` says govinfo is "PARTIAL — domain-only, 27 src files, no transport" and says "Finish govinfo" means tightening annotations plus adding client/config/auth/retry/cache.

Why it blocks: Non-blocking, but the source already imports `@beep/identity` and `@beep/schema` in `packages/drivers/govinfo/src/domain/**`, while `packages/drivers/govinfo/package.json` currently declares only `effect` under dependencies. This is a local integration gap the inventory missed. Any implementation that only adds transport will still need package manifest repair for direct dependencies.

Fix: Add "repair govinfo package dependencies for existing domain imports" to the govinfo work list: at least `@beep/identity` and `@beep/schema`, plus any transport/client dependencies introduced by the driver layer.

**Finding 10: Supporting-kit claim overstates govinfo usage**

Claim: `RESEARCH.md:242-246` says `@beep/identity`, `@beep/schema`, and `@beep/utils` are "all already consumed by the runpod generator ... and govinfo contracts."

Why it blocks: Non-blocking, but the runpod generator consumes all three, while govinfo source imports `@beep/identity` and `@beep/schema`; I found no `@beep/utils` import in `packages/drivers/govinfo/src`. This is small, but it is exactly the kind of inventory wording that leads to cargo-cult imports.

Fix: Split the statement: runpod uses identity/schema/utils; govinfo currently uses identity/schema and may or may not need utils during transport implementation.

**Finding 11: MPL language is legally imprecise**

Claim: `RESEARCH.md:327-328` says "AVOID vendoring MPL-2.0 `fortanix/openapi-to-effect` source — weak copyleft would taint the MIT surface."

Why it blocks: Non-blocking, but avoiding MPL source may be the right repo-policy decision, and "taint the MIT surface" overstates MPL-2.0. MPL is file-level weak copyleft; using a package, vendoring unmodified files, modifying MPL files, and copying snippets have different obligations. The conclusion can stay conservative, but the legal rationale should be precise.

Fix: Rephrase as "avoid vendoring or copying MPL-2.0 source unless Legal accepts file-level MPL obligations; dependency or CLI use needs separate review." Keep `@effect/openapi-generator` as preferred MIT path.

**Finding 12: "All ACTIVE" is docs-verified, not runtime-verified**

Claim: `RESEARCH.md:102-104` labels the upstream contract matrix "verified 2026-06-29" and says all five upstreams are "ACTIVE."

Why it blocks: Non-blocking, but the research has strong docs evidence and should not imply live runtime proof for every API path. In this review session, shell DNS resolution for external hosts was blocked, so I could not reproduce live `curl` probes from the workspace. This matters for DOL and CourtListener especially, where auth enforcement and current endpoint behavior affect MCP gating.

Fix: Change the status language to "docs indicate active; runtime probes pending." Add a build-out proof checklist: unauthenticated and authenticated CourtListener sample request, DOL catalog and keyed dataset request, GovInfo `DEMO_KEY` or real-key request with rate-limit headers, eCFR spec fetch, FedReg keyless request.

## Confirmed sound

- The claimed local package paths for `runpod`, `acp`, `courtlistener`, `ecfr`, `dol`, `federal-register`, `govinfo`, `uspto`, `nlp-mcp`, `m365-mcp`, `@beep/identity`, `@beep/schema`, and `@beep/utils` exist; I did not find falsely cited `@beep/*` package aliases in `RESEARCH.md`.
- `packages/drivers/courtlistener`, `packages/drivers/ecfr`, `packages/drivers/dol`, and `packages/drivers/federal-register` are VERSION-only skeletons.
- `packages/drivers/govinfo/src` has 27 TypeScript source files and no `*.service.ts`, `*.config.ts`, or `*.client.ts`; it is domain/contract-only today.
- `packages/drivers/runpod/openapi.json`, `packages/drivers/runpod/scripts/generate.ts`, and package-private `_generated` exports exist; runpod is a valid bespoke-generator precedent.
- `packages/drivers/acp/scripts/generate.ts` uses `@effect/openapi-generator/JsonSchemaGenerator`, pins `CURRENT_SCHEMA_RELEASE = "v0.11.3"`, and has the offline build/check rule in `packages/drivers/acp/AGENTS.md`.
- Root `package.json` pins both `effect` and `@effect/openapi-generator` at `4.0.0-beta.91`; the installed openapi-generator package is MIT and supports `httpclient`, `httpclient-type-only`, and `httpapi` formats.
- `rg` over `packages` / `apps` package manifests found no production Orval/axios/Zod dependency; the only `zod` hit was a repo-utils test fixture.
- `turbo.json` has a `codegen` task, but `build.dependsOn` is only `["^build"]`; the "no build -> codegen edge" finding is correct.
- `packages/drivers/uspto/src/Uspto.service.ts` uses redacted `X-API-KEY` header auth and is a sound auth/error precedent for gov drivers.
- `packages/drivers/nlp-mcp` and `packages/drivers/m365-mcp` are real Effect-native MCP servers; `m365-mcp` already uses driver-prefixed snake-case tool names and readonly/destructive annotations.

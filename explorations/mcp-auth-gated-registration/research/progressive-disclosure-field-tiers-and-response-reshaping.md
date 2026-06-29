# Progressive disclosure: field tiers + server-side response reshaping

Scope: quantify token-reduction tactics (named field tiers, columnar/outline reshaping, fetchable handles, code-mode) and split which belong in the `@beep/uspto` driver response layer vs the MCP tool surface.

## Findings

### 0. The hard constraint that makes reshaping mandatory, not optional

- **Claude Code rejects any single MCP tool output above 25,000 tokens by default** (`MAX_MCP_OUTPUT_TOKENS`), erroring with "MCP tool response exceeds maximum allowed tokens (25000)" and advising pagination/filtering. The cap is per-tool-output, separate from the session context window. Source: <https://help.xpoz.ai/en/articles/12681842-claude-code-mcp-tool-exceeds-maximum-allowed-tokens-25000>. Corroborated by the open bug stream (image responses, file reads tripping the same 25k limit): <https://github.com/anthropics/claude-code/issues/9152>, <https://github.com/anthropics/claude-code/issues/4002>. → A raw USPTO PFW search that includes `documentBag` (see §1) trivially blows past 25k and the tool call simply fails. Reshaping is a correctness requirement for the USPTO surface, not a nicety.
- **Tool *definitions* themselves are an upfront token tax paid before the agent sees the user request.** Anthropic's example workflow (Google Drive → Salesforce) consumed **150,000 tokens just on tool definitions + intermediate results** under direct tool-calling. Source (PRIMARY, Anthropic Engineering, 2025-11-04): <https://www.anthropic.com/engineering/code-execution-with-mcp>. The widely-cited "50,000–66,000 tokens to load a dozen MCP servers" figure is from secondary coverage, not the Anthropic post — treat as illustrative: <https://medium.com/@meshuggah22/weve-been-using-mcp-wrong-how-anthropic-reduced-ai-agent-costs-by-98-7-7c102fc22589>.

### 1. Named field tiers — the canonical `uspto_pfw` `field_configs.yaml` pattern (PRIMARY, MIT)

- The canonical source `john-walkoe/uspto_pfw_mcp` (license **MIT**, verified via GitHub API `/license` → `spdx_id: MIT`) defines predefined field sets in `field_configs.yaml`. Verbatim tiers (fetched from `raw.githubusercontent.com/.../master/field_configs.yaml`):
  - `applications_minimal` — *"Ultra-minimal fields for application searches (95-99% context reduction)"* — 14 active dotted-path fields: `applicationNumberText`, `applicationMetaData.inventionTitle`, `applicationMetaData.inventorBag`, `applicationMetaData.firstApplicantName`, `applicationMetaData.uspcSymbolText`, `applicationMetaData.cpcClassificationBag`, `applicationMetaData.patentNumber`, `parentPatentNumber`, `associatedDocuments`, `applicationMetaData.examinerNameText`, `applicationMetaData.groupArtUnitNumber`, `applicationMetaData.filingDate`, `applicationMetaData.grantDate`, `applicationMetaData.customerNumber`, `applicationMetaData.applicationStatusCode`.
  - `applications_balanced` — *"Key fields for application searches (85-95% context reduction)"* — minimal **plus** `applicationMetaData.applicantBag`, `assignmentBag`, `applicationMetaData.applicationStatusDescriptionText`.
  - `inventor_minimal` / `inventor_balanced` — same field shapes, inventor-focused.
  - **The `documentBag` field is commented out with a WARNING: "Can cause 100x token increase - use pfw_get_application_documents instead."** Source: <https://github.com/john-walkoe/uspto_pfw_mcp>.
- `CUSTOMIZATION.md` documents a three-rung progressive ladder with explicit percentages: **ultra-minimal (2–3 fields) → "99% context reduction"; preset minimal (15 fields) → "95% reduction"; preset balanced (18 fields) → "85–90% reduction."** The `fields` param "overrides the YAML configuration for this specific search." Source: <https://github.com/john-walkoe/uspto_pfw_mcp/blob/master/CUSTOMIZATION.md>.
- **Adversarial check against the live repo:** the field names are real USPTO ODP PFW fields. `@beep/uspto/src/Uspto.service.ts` already decodes the exact envelope keys (`patentFileWrapperDataBag`, `applicationMetaData`, `documentBag`, `childContinuityBag`, `parentContinuityBag`, `downloadOptionBag`) and `Uspto.models.ts:UsptoApplicationMetadata` already projects an implicit "minimal" tier of **11 fields** (`inventionTitle`, `firstInventorName`, `filingDate`, `patentNumber`, …). So the tier pattern is a *generalization of what the driver already does*, not a new concept — and `documentBag` is already absent from the driver's metadata projection (it lives behind `getDocuments`, mirroring the `pfw_get_application_documents` split). The 100x-blowup warning is the verified justification for keeping documents on a separate tool.

### 2. USPTO ODP supports server-side field projection at the API (load-bearing for the split)

- The USPTO ODP PFW `POST /applications/search` request body parameters `q`, `filters`, `rangeFilters`, `fields`, `facets`, `pagination` are **all optional**; `fields` is described by USPTO as selecting which fields come back ("invalid field names ignored and only valid fields included"). Sources: <https://data.uspto.gov/apis/patent-file-wrapper/search>, data.gov catalog mirror <https://catalog.data.gov/dataset/open-data-portal-odp-patent-file-wrapper-pfw-api-search-application-data-continuity-docume>, query DSL spec <https://data.uspto.gov/documents/documents/ODP-API-Query-Spec.pdf>.
- **Adversarial check — conflict found:** one summary glossed `fields` as "sort data set based on specified fields," and the community `patent-client` docs surface no `fields`/sparse-fieldset parameter at all (<https://patent-client.readthedocs.io/en/latest/user_guide/open_data_portal.html>). So whether `fields` *projects the response body* vs *selects sortable fields* is not cleanly settled from secondary sources (the authoritative `ODP-API-Query-Spec.pdf` did not render in fetch). Marked Open/Unverified. The `uspto_pfw_mcp` CUSTOMIZATION language ("override … for this specific search") *implies it filters client-side after retrieval* — i.e. even the canonical reference may not be pushing projection to the wire.

### 3. Server-side reshaping formats — screenpipe (prose, license NOASSERTION → reimplement)

- `screenpipe`'s own skill doc confirms the reshaping levers and quantifies them: *"Use `&format=csv` or `&format=outline` to cut tokens (~70–91% reduction)"*; for the elements endpoint *"Use `format=outline` for a text tree of UI structure (reduces tokens ~91%)"*; and *"Use `&fields=a,b,c` to return only specific columns."* Source (PRIMARY, repo skill file): <https://raw.githubusercontent.com/screenpipe/screenpipe/main/.claude/skills/screenpipe-api/SKILL.md>.
- **License caution:** `screenpipe` resolves to `spdx_id: NOASSERTION` ("Other") via GitHub API — i.e. **not a clean OSS grant; reimplement the conventions (format/fields params), do not copy code.** The CAPTURE snippet additionally claims `max_content_length` middle-truncation and dotted-path `fields` (e.g. `content.text`); the *current* SKILL.md I fetched confirms the flat `fields=a,b,c` whitelist and the csv/outline formats but **does not show `max_content_length` or dotted paths** — those are Open/Unverified against the live file (likely drifted or live in the API handler, not the skill doc).
- **Adversarial cross-check on the CSV %:** independent MCP-optimization write-ups put CSV at **40–60% reduction on tabular data** (eliminates repeated keys/braces/quotes) and field-whitelisting (50 fields → 3–5) at **80–90%** — lower than screenpipe's blended "~70–91%." The numbers are workload-dependent (column count, string lengths); treat 40–90% as the defensible band. Sources: <https://stackademic.com/blog/reducing-mcp-response-sizes-for-llm-context-limits>, <https://www.mindstudio.ai/blog/reduce-token-usage-ai-agents-mcp-optimization>.

### 4. Columnar envelope + null-stripping + trend stats — `us-gov-open-data-mcp` (PRIMARY, MIT)

- `lzinga/us-gov-open-data-mcp` (license **MIT**, verified) `src/shared/response.ts` defines five envelope kinds — `timeseries`, `table`, `record`, `list`, `empty` — and the helpers:
  - `toColumnar(objects, columnOrder?, maxRows = 10_000)` → `{ columns: [...], rows: [[...], ...] }` (array-of-objects → columnar; column names emitted once).
  - `stripNulls` — recursively prunes null/undefined and empty branches (prune null columns/keys).
  - `detectTrend` — linear regression: `increasing`/`decreasing` by slope sign, `stable` when `|relSlope| < 0.01`, **`volatile` when `r2 < 0.3`**, `null` when fewer than 3 points.
  - Safety caps: `DEFAULT_MAX_ROWS = 10_000` (table/timeseries), `DEFAULT_MAX_ITEMS = 1_000` (list).
  Source (raw repo file): <https://raw.githubusercontent.com/lzinga/us-gov-open-data-mcp/main/src/shared/response.ts> · <https://github.com/lzinga/us-gov-open-data-mcp>.

### 5. Metadata → snippet → read tool ladder

- The "cheap call returns counts/metadata only; then keyword-anchored snippet; then full text by id" ladder is corroborated three ways: (a) screenpipe's own recommended workflow — `activity-summary` ("what was I doing?") before `search` before fetching `frames` ("Never fetch more than 2–3 frames per query"): <https://raw.githubusercontent.com/screenpipe/screenpipe/main/.claude/skills/screenpipe-api/SKILL.md>; (b) Anthropic's progressive-disclosure framing — "load only the definitions it needs," intermediate data "stays in the execution environment": <https://www.anthropic.com/engineering/code-execution-with-mcp>; (c) the CAPTURE `mike#2` nugget (CourtListener `get_cases` "returns metadata/counts only … then call find_in_case / read_case", **find capped at 3 calls/turn**) — but `mike` is **unknown-license → reimplement, do not copy**. The ladder is a tool-surface decomposition, not a driver concern.

### 6. UUID+TTL fetchable resource handles vs inline payloads

- The MCP spec (2025-06-18) gives the canonical mechanism: **Resources** identified by URI, discovered via `resources/list`/`resources/templates/list`, fetched via `resources/read`; content is `text` or base64 `blob`; templates use RFC 6570 URI templates; the spec recommends `https://` URIs **only** when the client can fetch directly, otherwise a custom scheme served via the MCP server. Servers **MUST** validate all resource URIs. Source (PRIMARY): <https://modelcontextprotocol.io/specification/2025-06-18/server/resources>.
- The CAPTURE `patents-mcp-server#3` nugget operationalizes this for large PDFs: a transient `FileStore{ ttlSeconds; put(buf,ext); getPath(id); sweep() }` whose `odp-download-document` returns `{ url, mimeType, expiresInSeconds }` instead of bytes, with `UUID_V4 = /^[0-9a-f]{8}-...-4[0-9a-f]{3}-[89ab].../` strictly gating filesystem access (no path interpolation → no traversal). That TS repo (`patents-mcp-server`) is flagged **MIT/portable** in CAPTURE; the sibling Python `riemannzeta/patent_mcp_server` is also MIT (verified). → In `@beep/uspto`, `downloadDocument` already returns `Uint8Array` — that byte payload is exactly what must **never** be returned inline; it should be put behind a TTL handle/Resource at the MCP layer.

### 7. Unified-tool-with-method-enum tradeoff

- The CAPTURE `patents-mcp#5` nugget (`openpharma-org/patents-mcp` `patents.py`) collapses ~25 tools into one `uspto_patents(method, query, …)` that routes internally with per-method required-arg guards — **reduces tool-definition token cost but the giant union arg signature hurts schema clarity and per-method validation.** The modern resolution of the same goal is the **2-tool `search` + `execute` code-mode** shape (Cloudflare, FortiManager `code-mode-mcp`: "2 tools instead of 590+ individual API tools"): <https://github.com/jmpijll/fortimanager-code-mode-mcp>. → For beep's Effect `Toolkit`, schema validation is free and discrete tools are cheap to define, so the method-enum mega-tool is the **wrong** axis to optimize; collapse tool *count* only if tool-def tokens dominate, and prefer response reshaping (§1–4) to solve the 25k cap.

### 8. WASM code-mode sandboxing — the frontier option (defer for stdio servers)

- `us-gov-open-data-mcp` `src/shared/sandbox.ts` (MIT) `executeInSandbox(data, script)`: **QuickJS WASM** singleton, fresh context per call; input cap `MAX_DATA_BYTES = 10 * 1024 * 1024` (10 MB); **memory `runtime.setMemoryLimit(64 * 1024 * 1024)` (64 MB)**; **`TIMEOUT_MS = 10_000` via `shouldInterruptAfterDeadline`**; `DATA` injected as a global string via `vm.setProp`; sandbox blocks fs/network/imports/Node APIs and leaks no state; captures only `console.log` → `stdout`; returns `{ stdout, beforeBytes, afterBytes, reductionPct }` with `reductionPct = (1 - afterBytes/beforeBytes) * 100`. Repo claims **"WASM-sandboxed JavaScript execution reduces context window usage by 98–100% for large responses."** Source: <https://raw.githubusercontent.com/lzinga/us-gov-open-data-mcp/main/src/shared/sandbox.ts> · <https://github.com/lzinga/us-gov-open-data-mcp>.
- Cloudflare **Code Mode** is the same idea on V8 isolates + Dynamic Worker Loader: original framing post 2025-09-26 (<https://blog.cloudflare.com/code-mode/>), and the quantified follow-up (2026-02-20) states **"For a large API like the Cloudflare API, Code Mode reduces the number of input tokens used by 99.9%. An equivalent MCP server without Code Mode would consume 1.17 million tokens"** across **2,500+ endpoints → ~1,000 tokens**: <https://blog.cloudflare.com/code-mode-mcp/>. Anthropic's parallel finding: **150,000 → 2,000 tokens (98.7%)**: <https://www.anthropic.com/engineering/code-execution-with-mcp>.
- **Assessment:** code-mode is a *server-wide* capability (wrap any tool) with heavyweight infra (QuickJS-WASM or V8-isolate sandbox, deadline/memory governors). It is **out of scope for the stdio Effect servers** in v1: field tiers + columnar reshaping + MCP Resources already capture 95–99% of the win without shipping a sandbox. Note it as the frontier escalation if/when a single agent must compose many USPTO/CourtListener calls in one turn.

### 9. Quantified token-reduction summary (verified numbers)

| Tactic | Claimed reduction | Source tier | Citation |
| --- | --- | --- | --- |
| Field tier `minimal` (≈11–15 fields) | 95–99% | PRIMARY, MIT | uspto_pfw `field_configs.yaml` |
| Field tier `balanced` (≈18 fields) | 85–95% (CUST: 85–90%) | PRIMARY, MIT | uspto_pfw CUSTOMIZATION.md |
| Omitting `documentBag` | avoids ~**100×** blowup | PRIMARY, MIT | uspto_pfw `field_configs.yaml` |
| `format=csv` (tabular) | ~40–70% | repo skill + secondary | screenpipe SKILL / Stackademic |
| `format=outline\|tree` | ~91% | PRIMARY (repo skill, NOASSERTION) | screenpipe SKILL |
| `fields=` whitelist (50→3-5) | 80–90% | secondary | MindStudio / Stackademic |
| Code-mode (compose many calls) | 98.7% / 99.9% / 98–100% | PRIMARY ×3 | Anthropic / Cloudflare / us-gov-mcp |

### 10. Recommendation — driver response layer vs MCP tool surface

**`@beep/uspto` driver response layer SHOULD own (deterministic, schema-shaped, testable):**
- **Named field-tier projection as the primary lever.** Generalize the existing implicit 11-field `UsptoApplicationMetadata` into named tiers (`minimal`/`balanced`/`complete`) as `effect/Schema` variants or pure projection functions. This is a *schema* concern and belongs next to the models, not in the tool. The `documentBag`/`getDocuments` split already correctly lives at the driver boundary.
- **IF** ODP `fields` truly projects the response (Open question §2), push the tier's field set into the `POST /applications/search` request body so the bytes never cross the wire (the driver currently fetches the full envelope then projects client-side — a missed transport-cost win). Otherwise project client-side in the decode step as today.
- **Pure reshaping helpers** — `toColumnar` + `stripNulls` over typed results (port the MIT `us-gov-open-data-mcp` shapes). Format serialization is deterministic and unit-testable; it sits naturally beside the schema.

**MCP tool surface SHOULD own (transport/agent-routing concerns):**
- The **metadata → snippet → read tool ladder** (discrete tools, per-turn caps), the `format=csv|outline|json` and `tier=` param exposure (delegating to driver helpers), and the **`max_content_length` final-truncation guard** before emitting content blocks (the explicit defense against the 25k cap, §0).
- **UUID+TTL fetchable handles / MCP Resources** for `downloadDocument` bytes — never inline the `Uint8Array`; serve via `resources/read` (or `{url, mimeType, expiresInSeconds}`) with a strict UUID regex gating fs access.
- **Routing prose** in tool descriptions ("documentBag is 100×; use get_documents"), and the unified-tool-vs-discrete-tool decision (§7) — **prefer discrete typed tools**; do not build a method-enum mega-tool.
- **Code-mode/WASM sandbox: out of scope** for v1 stdio servers (§8); revisit as a server-wide capability only if multi-call composition dominates.

### 11. Licensing for porting (verified via GitHub API)
- `uspto_pfw_mcp` → **MIT** (field-tier pattern portable; tier names/percentages/field lists are facts, reimplement in Schema cleanly).
- `us-gov-open-data-mcp` → **MIT** (columnar envelope + sandbox shapes portable).
- `riemannzeta/patent_mcp_server` → **MIT**; CAPTURE flags the TS `patents-mcp-server` (UUID+TTL store) as MIT too.
- `screenpipe` → **NOASSERTION / "Other"** — reimplement the format/fields conventions, do not copy code.
- `mike` (CourtListener ladder) → **unknown-license** — reimplement, do not copy.

## Sources
- Anthropic Engineering, "Code execution with MCP" (2025-11-04, PRIMARY): <https://www.anthropic.com/engineering/code-execution-with-mcp>
- Cloudflare, "Code Mode: the better way to use MCP" (2025-09-26, PRIMARY): <https://blog.cloudflare.com/code-mode/>
- Cloudflare, "Code Mode: give agents an entire API in 1,000 tokens" (2026-02-20, PRIMARY, the 1.17M→1k/99.9% number): <https://blog.cloudflare.com/code-mode-mcp/>
- MCP Specification 2025-06-18 — Resources (PRIMARY): <https://modelcontextprotocol.io/specification/2025-06-18/server/resources>
- `john-walkoe/uspto_pfw_mcp` (MIT) — repo + `field_configs.yaml` + `CUSTOMIZATION.md`: <https://github.com/john-walkoe/uspto_pfw_mcp> · <https://github.com/john-walkoe/uspto_pfw_mcp/blob/master/CUSTOMIZATION.md>
- `lzinga/us-gov-open-data-mcp` (MIT) — `src/shared/sandbox.ts`, `src/shared/response.ts`: <https://github.com/lzinga/us-gov-open-data-mcp> · <https://raw.githubusercontent.com/lzinga/us-gov-open-data-mcp/main/src/shared/sandbox.ts> · <https://raw.githubusercontent.com/lzinga/us-gov-open-data-mcp/main/src/shared/response.ts>
- `screenpipe/screenpipe` (NOASSERTION) — `.claude/skills/screenpipe-api/SKILL.md`: <https://raw.githubusercontent.com/screenpipe/screenpipe/main/.claude/skills/screenpipe-api/SKILL.md>
- USPTO ODP PFW search API + query DSL spec: <https://data.uspto.gov/apis/patent-file-wrapper/search> · <https://data.uspto.gov/documents/documents/ODP-API-Query-Spec.pdf> · <https://catalog.data.gov/dataset/open-data-portal-odp-patent-file-wrapper-pfw-api-search-application-data-continuity-docume>
- `patent-client` ODP docs (community): <https://patent-client.readthedocs.io/en/latest/user_guide/open_data_portal.html>
- Claude Code 25k MCP output cap: <https://help.xpoz.ai/en/articles/12681842-claude-code-mcp-tool-exceeds-maximum-allowed-tokens-25000> · <https://github.com/anthropics/claude-code/issues/9152>
- MCP optimization secondary (CSV %, field-whitelist %): <https://stackademic.com/blog/reducing-mcp-response-sizes-for-llm-context-limits> · <https://www.mindstudio.ai/blog/reduce-token-usage-ai-agents-mcp-optimization>
- FortiManager code-mode (2-tools-vs-590): <https://github.com/jmpijll/fortimanager-code-mode-mcp>
- In-repo ground truth: `packages/drivers/uspto/src/Uspto.service.ts`, `packages/drivers/uspto/src/Uspto.models.ts`

## Open / Unverified
- **USPTO ODP `fields` semantics (load-bearing).** Whether `fields` projects the response body (sparse fieldset → push tier to the wire) or only selects sortable fields is unsettled: USPTO/data.gov list it as field selection, but one summary called it "sort," and `patent-client` docs omit it entirely. The authoritative `ODP-API-Query-Spec.pdf` did not render in fetch. Verify directly before deciding API-side vs client-side projection.
- **`max_content_length` + dotted-path `fields` in screenpipe.** The CAPTURE snippet claims both; the live `SKILL.md` I fetched shows only flat `fields=a,b,c` and `format=csv|outline`. Likely drifted or implemented in the API handler rather than the skill doc — unverified against current source.
- **screenpipe CSV/outline percentages** ("~70–91%") are the repo's self-reported, non-independently-audited figures; independent MCP guidance puts CSV lower (40–60%). Real reduction is workload-dependent.
- **`patents-mcp-server` (TypeScript, UUID+TTL store) license** is taken from CAPTURE's "MIT/portable" note; I verified the *Python* `riemannzeta/patent_mcp_server` as MIT but did not independently re-resolve the specific TS repo's LICENSE this session.
- **us-gov-open-data-mcp tool/API counts** vary across its own marketing surface (250+/300+ tools, 40+ APIs) — cosmetic, not load-bearing.
</content>
</invoke>

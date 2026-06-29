# patent-search-mcp-server  `[T2]`

- **Purpose:** MCP server exposing 26 tools over a hosted USPTO-data API for US patent intelligence (dossiers, prosecution, claims, citations, family, CPC, examiner stats, AI Office-Action analysis, PTAB challenges, litigation, legal status, chain of title, term, and a one-shot AI risk profile).
- **Stack:** TypeScript, MCP SDK, fetch REST client
- **Size / shape:** ~2.0k LOC TS across src/index.ts + 26 one-tool-per-file modules in src/tools/ + a single API client; an MCP server (not a library). Plus a SKILL.md agent workflow guide.
- **License:** MIT
- **Maturity:** Last commit 2026-06-07; actively maintained, v0.5.0

**Notes:** This is a thin MCP wrapper over a proprietary hosted API (a Cloud Function behind an API key minted from a Chrome extension) — it does NOT call USPTO/PatentsView directly, so there is no reusable USPTO auth/ingestion code (beep already has a USPTO driver skeleton anyway). The genuine gold is (a) the legal/IP domain data models embedded in the tool I/O typescript interfaces (PTAB challenge, claim chart element->cited-art, office-action rejection grounds, risk verdict signals), which map cleanly onto beep's law-practice and epistemic slices, and (b) the MCP tool-registration + agent-workflow patterns. The candidate-vs-proof wall in beep is well-served by the explicit not-legal-advice disclaimer/"interpret don't dump" guidance in SKILL.md, which is a governance pattern worth lifting.

## Web enrichment
- **Status:** patent-search-mcp-server fronts a hosted USPTO-data API. The biggest external risk is upstream USPTO data-source churn, not the MCP code itself. USPTO has consolidated everything onto the Open Data Portal (data.uspto.gov): the legacy Developer Hub (developer.uspto.gov) was decommissioned June 5, 2026, and PatentsView (patentsview.org / search.patentsview.org/api) is migrating into ODP on March 20, 2026 with expected temporary interruptions. Any underlying client still pointed at developer.uspto.gov endpoints or PatentsView PatentSearch keys is now broken. ODP requires new ODP-issued API keys (old PatentSearch/Developer Hub keys are NOT compatible), and effective Aug 18, 2026 USPTO requires four additional account-profile fields for continued API access. PPUBS (ppubs.uspto.gov) remains the live human search UI; programmatic patent search/bulk now lives under data.uspto.gov bulk-data search + patent-file-wrapper APIs. FastMCP (TS, punkpeye) is current and is the canonical convention source for the repo's "const tool + run() + annotations + dual content/structuredContent" nugget — its addTool({name,description,parameters:zod,annotations,execute}) shape and the MCP 2025-03-26/2025-06-18 annotation hints (readOnlyHint/openWorldHint/title) directly validate that pattern. eyecite (Free Law Project) is the canonical citation-parsing dependency for any litigation/citation linkage, and CourtListener REST v4 is the live API for PTAB/litigation/citation data. No evidence the repo itself is deprecated; the cautions are all about the upstream USPTO data plane it proxies.</statusNotes>
<parameter name="deprecations">["USPTO legacy Developer Hub (developer.uspto.gov) DECOMMISSIONED June 5, 2026 — any client hitting those endpoints is dead; migrate to data.uspto.gov ODP APIs.","PatentsView legacy API retired Feb 2025; PatentsView site + PatentSearch API (search.patentsview.org/api) migrating into ODP on March 20, 2026 with expected temporary interruptions — do not treat PatentsView as a stable independent backend.","ODP API keys are NOT backward-compatible with old PatentSearch/Developer Hub keys — new keys must be minted via data.uspto.gov 'Getting Started'.","Effective Aug 18, 2026 USPTO requires four additional account-profile fields under the 'Open Data Portal' account section; missing fields can interrupt API access.","ODP bulk search/download caps: up to 100 application numbers per custom zip request — relevant for any batch dossier/family tool.","If the hosted API still claims PatentsView/Developer Hub as upstream, that is a stale citation; the canonical current source is data.uspto.gov."]
- **Upstream docs:**
  - https://data.uspto.gov/apis — USPTO Open Data Portal — current canonical home for all programmatic patent data (patent-file-wrapper, bulk search, datasets).
  - https://data.uspto.gov/support/transition-guide/patentsview — Official PatentsView->ODP transition guide; endpoint/key migration mapping.
  - https://www.uspto.gov/subscription-center/2026/patentsview-migrating-uspto-open-data-portal-march-20 — Confirms PatentsView migration date (Mar 20, 2026) and interruption notice.
  - https://github.com/punkpeye/fastmcp — FastMCP TS framework — canonical addTool/annotations/execute conventions matching the repo's tool-definition nugget.
  - https://github.com/freelawproject/eyecite — eyecite citation parser — canonical dependency for citation/litigation linkage; powers CourtListener.
  - https://www.courtlistener.com/help/api/rest/citations/ — CourtListener REST v4 citation/litigation APIs (eyecite-powered) — live source for PTAB/litigation cross-refs.
- **Corrections:**
  - *Status-code humanization + typed API error mapping for client-facing MCP errors*: Ensure the error map explicitly handles the now-current USPTO ODP failure modes: 401/403 from incompatible legacy PatentSearch/Developer-Hub keys (require re-issuing ODP keys), and 403 tied to the Aug 18 2026 mandatory profile fields. Treat developer.uspto.gov endpoints as permanently gone (decommissioned June 5 2026), not transient — they should map to a hard 'upstream-decommissioned' typed error, not a retryable network error.
  - *MCP tool definition convention: paired const tool + run() with annotations and dual content/structuredContent*: This matches FastMCP (TS) conventions; align annotations to the MCP 2025-06-18 spec hints (readOnlyHint, openWorldHint=true for these external-API tools, destructiveHint=false, title). Read-only USPTO query tools should set readOnlyHint:true + openWorldHint:true so clients/LLMs gate them correctly.
  - *PTAB validity-challenge record schema (IPR/PGR/CBM, petitioner/owner, outcome)*: If sourcing PTAB/litigation data, the durable upstream is USPTO PTAB Open Data (now under data.uspto.gov) plus CourtListener REST v4 (eyecite-powered) for district-court litigation linkage — not PatentsView, which does not carry PTAB trial records and is mid-migration.
  - *Claim-chart data model: claim decomposed into elements mapped to cited prior art*: Prior-art/citation linkage that needs case-law citations should normalize via eyecite (Free Law Project) rather than ad-hoc regex; eyecite is the tested canonical parser (50M+ citations) and aligns the model with CourtListener's citation graph for evidence linkage.

## Gold nuggets (7)

### 1. Office-Action analysis output model (rejection grounds + cited art + suggested arguments)
`ip-domain-models` · relevance: **direct** · verified

oa_analyze tool returns an analysis object decomposed into rejections (102/103/112), citedArt, and suggestedArguments. This is exactly the shape beep needs for OfficeAction/Rejection candidate extraction — treat each as a CandidateClaim with provenance back into the OA document before the human gate. Note: extraction here is opaque (server-side AI), so beep would re-implement with span-grounded langextract, but the field taxonomy (rejection statute grounds, cited references, response arguments) is directly reusable.

- **Source:** `src/tools/oaAnalyze.ts:71-82`
- **beep-target:** law-practice OfficeAction/Rejection; epistemic CandidateClaim from OA extraction

```
  const rejections = (analysis as { rejections?: unknown[] }).rejections ?? [];
  const citedArt = (analysis as { citedArt?: unknown[] }).citedArt ?? [];
  const args_ = (analysis as { suggestedArguments?: unknown[] }).suggestedArguments ?? [];
```

### 2. Claim-chart data model: claim decomposed into elements mapped to cited prior art
`ip-domain-models` · relevance: **direct** · verified

ClaimChartElement/ClaimChartItem interfaces model a per-claim element chart: each independent claim split into labeled elements, each element carrying citedReferences {patentNumber, rejectionStatute, examinerReasoning}, plus claim status/statusReasoning and dependsOn for dependency graph. A near-ideal target schema for beep's PatentAsset claim modeling and for grounding claim elements to PriorArtReference evidence — element-level provenance is exactly the granularity beep's GroundedExtraction.span wants.

- **Source:** `src/tools/claimChart.ts:47-64`
- **beep-target:** law-practice PatentAsset claims + PriorArtReference; epistemic Evidence linkage

```
interface ClaimChartElement {
  label: string;
  text: string;
  citedReferences: Array<{
    patentNumber: string;
    rejectionStatute: string;
    examinerReasoning: string;
  }>;
}
interface ClaimChartItem {
  claimNumber: number;
  isIndependent: boolean;
  dependsOn?: number;
  elements: ClaimChartElement[];
```

### 3. PTAB validity-challenge record schema (IPR/PGR/CBM, petitioner/owner, outcome)
`ip-domain-models` · relevance: **adjacent** · verified

ChallengesResponse models a PTAB trial record: trialNumber, type, petitioner, patentOwner, petitionFilingDate, status, outcome. A compact, reusable controlled vocabulary for beep's IP litigation/validity domain models — outcome and challenge-type values can seed an ontology individual set or Drizzle table.

- **Source:** `src/tools/challenges.ts:34-41`
- **beep-target:** law-practice PTAB challenge entity / validity-challenge taxonomy

```
interface ChallengesResponse {
  patentNumber?: string;
  challengeCount?: number;
  challenges?: Array<{
    trialNumber: string; type: string; petitioner: string; patentOwner: string;
    petitionFilingDate: string; status: string; outcome: string;
  }>;
}
```

### 4. Risk-verdict signal aggregation pattern (Low/Moderate/High + derived signals)
`ip-domain-models` · relevance: **adjacent** · verified

risk_profile aggregates a legal bundle into a verdict {riskLabel, rationale, signals{inForce, expirationDate, challengeCount, litigationCount, currentAssignee}} plus a disclaimer. A clean example of a derived, explainable composite assessment that cites its underlying signals — useful for beep where a proposed conclusion (fallible AI-written rationale) must remain separable from the sound underlying facts (signals/bundle), matching the retrieval-vs-logic wall.

- **Source:** `src/tools/riskProfile.ts:42-47`
- **beep-target:** epistemic candidate verdict separated from sound signals; risk/FTO assessment model

```
  verdict?: {
    riskLabel?: string;
    rationale?: string;
    signals?: { inForce?: boolean | null; expirationDate?: string; challengeCount?: number; litigationCount?: number; currentAssignee?: string };
  };
  disclaimer?: string;
```

### 5. MCP tool definition convention: paired const tool + run() with annotations and dual content/structuredContent
`mcp-design` · relevance: **direct** · verified

Every tool is a self-contained module exporting a tool const (name, description, inputSchema, outputSchema, annotations{readOnlyHint, openWorldHint, idempotentHint}) and a runX(api,args) that returns BOTH human-readable content[] and machine structuredContent. Clean, low-magic pattern for beep's MCP servers; annotations (readOnly/idempotent hints) are directly reusable for conditional-tool/governance metadata.

- **Source:** `src/tools/claimChart.ts:39-45`
- **beep-target:** @beep/nlp-mcp tool registration + annotations convention

```
  annotations: {
    title: "Claim Chart",
    readOnlyHint: true,
    openWorldHint: true,
    idempotentHint: false,
  },
} as const;
```

### 6. Status-code humanization + typed API error mapping for client-facing MCP errors
`effect-ts` · relevance: **adjacent** · verified

codeForStatus maps HTTP status to a stable code enum (unauthenticated/payment_required/permission_denied/rate_limited/...) and humanizeError turns 401/402/429 into actionable operator messages. A small reusable auth/error pattern for beep's API-client drivers — beep would model these as Effect typed errors (Schema.TaggedError) but the status->code->message mapping table transfers directly.

- **Source:** `src/api/client.ts:78-106`
- **beep-target:** driver API-client typed-error mapping (Schema.TaggedError variants)

```
function codeForStatus(status: number): string {
  switch (status) {
    case 401:
      return "unauthenticated";
    case 402:
      return "payment_required";
    case 403:
      return "permission_denied";
    case 404:
      return "not_found";
    case 429:
      return "rate_limited";
    default:
      return status >= 500 ? "server_error" : "bad_request";
```

### 7. Agent SKILL.md: cost-aware tool-ordering workflow + mandatory not-legal-advice gate
`governance-ops` · relevance: **direct** · verified

The patent-research-workflow SKILL encodes a progressive-disclosure / cost-tiered strategy (cheapest sufficient tool first, dossier for depth, expensive risk_profile last with a cost warning), interpretation rules for legal outcomes (PTAB 'survived' vs unpatentable; litigation dataset coverage caveats), and a hard closing rule: always end with the not-legal-advice disclaimer. Directly relevant to beep's agent-memory/governance: a template for solo-attorney agent skills with built-in ethical-wall/disclaimer governance and cost-tiered tool routing.

- **Source:** `skills/patent-research-workflow/SKILL.md:56-83`
- **beep-target:** agents Skill definitions; progressive-disclosure tool routing + disclaimer governance gate

```
5. **Interpret, don't dump.**
   - PTAB outcomes: "Institution Denied" / "terminated without adverse
     finding" → the patent survived that challenge; a Final Written Decision
     finding claims unpatentable is the serious one.
...
Always close patent legal questions with the standard caveat: this is factual
public-record reporting and machine-generated summary — not legal advice
```

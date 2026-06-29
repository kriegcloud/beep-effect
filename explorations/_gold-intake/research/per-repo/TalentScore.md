# TalentScore  `[T1]`

- **Purpose:** Effect-based full-stack demo that uses structured LLM (BAML) extraction to turn unstructured resumes (PDF) into typed data, then runs a deterministic, explainable scoring algorithm over it.
- **Stack:** TypeScript, Effect 3.19, effect/Schema, @effect/rpc (WebSocket+NDJSON), @effect/sql + PostgreSQL, BAML (Boundary) for LLM extraction, @effect-atom/atom-react, React 19 + TanStack Router + Tailwind v4, OpenTelemetry/Jaeger, pnpm workspaces, Bun (baml gen)
- **Size / shape:** ~8,470 LOC across ~70 TS/TSX/BAML source files; pnpm monorepo (domain / server / client) = contract-first RPC web app + Node RPC server
- **License:** MIT
- **Maturity:** Last commit 2025-12-15; actively developed, modern Effect 3.19 / RPC 0.72 pins

**Notes:** No LICENSE file present; README explicitly states MIT. This is a demo/reference app (resume scoring, not legal), but its core thesis — "use LLMs to turn messy documents into typed data, then model deterministically/explainably for regulated industries" — is essentially beep's RETRIEVAL-vs-LOGIC wall, making the architecture highly transferable even though the domain is not. No RDF/OWL/SHACL, no MCP, no Tauri, no provenance spans here.

## Web enrichment
- **Status:** All core tech in TalentScore is live and current as of 2026-06. BAML (BoundaryML) is actively developed (weekly releases), generates type-safe TS/Python/Ruby/Go clients, and its streaming model — Schema-Aligned Parsing (SAP) emitting "semantically valid partial objects" with explicit @stream attributes — directly underpins the repo's Partial(candidate)/Complete(authoritative) gate. Effect is past 3.19 and @effect/rpc is at ~0.75.x; the repo's WebSocket+NDJSON transport uses canonical APIs (RpcSerialization.layerNdjson + layerProtocolWebsocket / RpcClient.layerProtocolSocket), so those nuggets are accurate and stable. The repo itself has no external-API decommission risk for its demo path (LLM providers only). The deprecation/auth cautions below apply only to the cross-cutting beep targets the nuggets point at (USPTO/PatentSearch, CourtListener), not to TalentScore's own runtime.</statusNotes>
<corrections>[{"nuggetTitle":"Partial(candidate) vs Complete(authoritative) streaming gate via tagged ParseEvent","correction":"This pattern is the application-level mirror of BAML's first-class streaming semantics. BAML natively distinguishes partial vs final via @stream attributes: @stream.done (don't surface a field/type until fully parsed), @stream.not_null (don't emit the container until a value exists), and @stream.with_state (attach an is-complete flag per field). Strengthen the nugget by noting the candidate->authoritative boundary can be pushed down into the BAML schema itself rather than only reconstructed in the tagged ParseEvent, giving SAP-guaranteed semantic validity on every partial."},{"nuggetTitle":"Schema-first partial-vs-final models (Schema.optionalWith for streaming)","correction":"Effect's Schema.optionalWith partial model is the consumer side of BAML's generated partial types. BAML already emits a Partial<T> variant of every class for streaming; the canonical mapping is BAML partial type -> effect/Schema optionalWith, so the partial schema should be derived from the BAML-generated partial rather than hand-maintained to avoid drift."},{"nuggetTitle":"Contract-first RPC server: WebSocket+NDJSON transport, OTLP tracing, wrap-middleware logger","correction":"Confirmed canonical: @effect/rpc (~0.75.x) exposes RpcSerialization.layerNdjson and server layerProtocolWebsocket / client RpcClient.layerProtocolSocket. The NDJSON+WebSocket combo in the repo is the upstream-recommended transport pairing, not a bespoke choice."},{"nuggetTitle":"Effect HttpClient API-wrapper with versioned base URL + Redacted auth header + retry","correction":"Caution for the beep target (USPTO/CourtListener drivers): the legacy PatentsView/PatentSearch API (search.patentsview.org) is being retired into the USPTO Open Data Portal (data.uspto.gov); legacy Developer Hub was decommissioned 2026-06-05 and old API keys are NOT compatible with ODP — new ODP keys are required. CourtListener lowered default (unauthenticated) API rate limits on 2026-05-07, so the Redacted auth header + retry pattern must now treat 429s as expected and key membership-tier rate limits per host. Versioned base URL should target CourtListener REST v4 (current v4.4)."}]</corrections>
<deprecations>["PatentsView legacy API (search.patentsview.org/api) and the USPTO legacy Developer Hub (developer.uspto.gov) are decommissioned/migrated to the Open Data Portal (data.uspto.gov) as of 2026; legacy API keys do NOT work against ODP — obtain new ODP keys.","USPTO Enriched Citation API v2 scheduled for decommission 2026-01-30 (already past); use ODP equivalents.","CourtListener default unauthenticated API rate was lowered 2026-05-07 — auth (membership token) now effectively required for non-trivial throughput; design retries around 429.","No deprecation affects TalentScore's own runtime; risks listed apply only to the data-ingestion beep targets the nuggets map onto."]</deprecations>
<upstreamDocs>[{"url":"https://docs.boundaryml.com/guide/baml-basics/streaming","note":"Canonical BAML streaming semantics: @stream.done / @stream.not_null / @stream.with_state and semantically-valid partial objects (SAP)."},{"url":"https://github.com/Effect-TS/effect/blob/main/packages/rpc/README.md","note":"Canonical @effect/rpc transport: layerProtocolWebsocket, RpcSerialization.layerNdjson, RpcClient.layerProtocolSocket — matches repo's WS+NDJSON."},{"url":"https://data.uspto.gov/support/transition-guide/patentsview","note":"USPTO transition guide for PatentsView->Open Data Portal migration and new API-key requirements."},{"url":"https://www.courtlistener.com/help/api/rest/citation-lookup/","note":"CourtListener Citation Lookup/Verification API (powered by eyecite) — current v4 reference for legal-citation parsing beep targets."},{"url":"https://free.law/2026/05/07/api-included-in-memberships/","note":"FLP: API access bundled with membership and reduced default rate limits (2026-05-07) — affects auth/retry design."}]</upstreamDocs>
</invoke>


## Gold nuggets (11)

### 1. BAML 'LLM as pure OCR' extraction schema + anti-inference prompt
`legal-nlp` · relevance: **direct** · verified

A complete BAML schema (enums + nested classes + extraction function) that constrains the LLM to extract fields EXACTLY as written with an explicit 'DO NOT infer, reason, or add information' instruction. This is the canonical RETRIEVAL-side discipline beep needs: a fallible LLM proposes typed candidate fields and is told never to fabricate. Directly reusable as a prompt-template + schema pattern for @beep/langextract span-grounded extraction and CandidateClaim generation; the field-by-field class breakdown (Experience/Education/Skill/Certification) is a model for office-action / claim element extraction.

- **Source:** `packages/server/baml_src/resume.baml:131-147`
- **beep-target:** @beep/langextract span-grounded extraction; epistemic.CandidateClaim

```
function ExtractResume(document: pdf) -> Resume {
  client CustomGPT5
  prompt #"
    You are a document data extractor. Extract information EXACTLY as written.
    DO NOT infer, reason, or add information not explicitly present.
    If a field is not found, leave it empty or null.

    {{ _.role("user") }}
    {{ document }}

    Extract all information matching the schema.
    {{ ctx.output_format }}
  "#
}
```

### 2. Multi-provider LLM client config with fallback / round-robin / retry policies
`mcp-design` · relevance: **adjacent** · verified

BAML client declarations covering OpenAI (responses + chat), Anthropic Opus/Sonnet/Haiku, plus commented Gemini/Bedrock/Azure/Vertex/Ollama, then composite clients: round-robin strategy, ordered fallback strategy, and named retry policies (constant + exponential backoff). This is a clean declarative template for beep's Anthropic/OpenAI/xAI driver layer: per-model api_key env wiring, media handling (PDF base64), and resilience strategies. beep already has provider drivers skeletoned, so this is a config-pattern reference rather than net-new code.

- **Source:** `packages/server/baml_src/clients.baml:112-146`
- **beep-target:** Anthropic/OpenAI/xAI provider drivers; multi-provider fallback layer

```
client<llm> OpenaiFallback {
  provider fallback
  options {
    strategy [CustomGPT5Mini, CustomGPT5]
  }
}

retry_policy Exponential {
  max_retries 2
  strategy {
    type exponential_backoff
    delay_ms 300
    multiplier 1.5
    max_delay_ms 10000
  }
}
```

### 3. Partial(candidate) vs Complete(authoritative) streaming gate via tagged ParseEvent
`provenance-evidence` · relevance: **direct** · verified

The parse RPC streams a discriminated union: many `Partial` events (in-progress, fallible extraction) and a single terminal `Complete` event that carries the persisted, scored ResumeAnalysis. Only the Complete payload is written to the DB. This is exactly beep's candidate->approved boundary modeled as an Effect Stream: fallible partial candidates surface to the UI, but only the finalized object crosses into authority. Reusable shape for ClaimLifecycle streaming where partial extractions are shown but only proven/approved claims persist.

- **Source:** `packages/domain/src/api/resume/resume-rpc.ts:153-193`
- **beep-target:** epistemic.ClaimLifecycle / ClaimGate streaming; Candidate->approved boundary

```
export const ParseEvent = Schema.Union(
  Schema.TaggedStruct("Partial", {
    data: PartialResumeData,
  }),
  Schema.TaggedStruct("Complete", {
    analysis: ResumeAnalysis,
  }),
);

export class ParseResumeRpc extends Rpc.make("parse", {
  payload: Schema.Struct({ fileId: UploadedFileId }),
  stream: true,
  success: ParseEvent,
  error: Schema.Union(LimitExceededError, FileNotFoundError, ParsingFailedError),
}) {}
```

### 4. Schema-first partial-vs-final models (Schema.optionalWith for streaming)
`effect-ts` · relevance: **direct** · verified

Two parallel effect/Schema models: a strict `ResumeData` Schema.Class (all fields required) for the authoritative record, and `PartialResumeData` where every scalar is `Schema.optionalWith(NullOr(...), { exact: true })` to validate progressively-filling streaming chunks. This is a directly reusable pattern for beep where a GroundedExtraction arrives incrementally as candidate fields and must validate even when half-empty, while the approved fact uses the strict schema. Includes branded IDs (ResumeId = UUID.brand).

- **Source:** `packages/domain/src/api/resume/resume-rpc.ts:109-140`
- **beep-target:** @beep/epistemic GroundedExtraction partial schema; effect/Schema model conventions

```
export class ResumeData extends Schema.Class<ResumeData>("ResumeData")({
  name: Schema.String,
  ...
}) {}

export const PartialResumeData = Schema.Struct({
  name: Schema.optionalWith(Schema.NullOr(Schema.String), { exact: true }),
  email: Schema.optionalWith(Schema.NullOr(Schema.String), { exact: true }),
  ...
  experience: Schema.Array(Experience),
});
```

### 5. Deterministic weighted scoring over LLM-extracted typed data (RETRIEVAL/LOGIC split)
`serendipity` · relevance: **serendipitous** · verified

scoring-logic.ts is the deterministic LOGIC tier acting on the fallible-but-typed extraction: it normalizes dimensions to 0-1, applies position x company weight matrices, computes an explainable 0-1000 score, and emits a full ScoringMatrix plus rule-based 'dealbreaker' detection. This is a near-perfect analog of beep's thesis — once messy prose is typed, all judgement is deterministic and auditable. The weight-matrix-by-context design and the dealbreaker rules (e.g. ENTERPRISE requires certifications) are a reusable template for deterministic, explainable rule evaluation over extracted facts before reasoning.

- **Source:** `packages/server/src/public/resume/scoring-logic.ts:204-234`
- **beep-target:** ClaimGate deterministic rules; explainable scoring over extracted facts

```
export const detectDealbreakers = (
  dimensions: RawDimensions,
  position: PositionType,
  company: CompanyProfile
): string[] => {
  const dealbreakers: string[] = [];
  if (company === "ENTERPRISE" && dimensions.certifications < 0.2) {
    dealbreakers.push("missing_certification");
  }
  if (position === "TECH_LEAD" && dimensions.leadershipSignals < 0.5) {
    dealbreakers.push("no_leadership_experience");
  }
  return dealbreakers;
};
```

### 6. BAML->domain mapper layer with separate partial-stream mappers
`legal-nlp` · relevance: **direct** · verified

resume-rpc-live.ts shows the boundary code between the LLM library's loose types and the strict domain schema: dedicated mapper functions for each entity, AND a parallel set of mapPartial* functions that default every missing field so half-streamed candidates are renderable. The whole stream is wrapped in `Stream.async` driving an async generator (`for await (const partial of bamlStream)`), then `getFinalResponse()` triggers scoring + persist + a single Complete emit. This adapter+gate skeleton is directly reusable for wrapping any extraction library into Effect with a candidate-then-finalize flow.

- **Source:** `packages/server/src/public/resume/resume-rpc-live.ts:209-264`
- **beep-target:** @beep/langextract adapter; epistemic extraction->finalize stream

```
return Stream.async<ParseEvent, ...>(
  (emit) => {
    (async () => {
      try {
        for await (const partial of bamlStream) {
          emit.single({ _tag: "Partial", data: mapPartialResume(partial) });
        }
        const finalResult = await bamlStream.getFinalResponse();
        const scoringMatrix = calculateMatrix(finalResult);
        ...
        emit.single({ _tag: "Complete", analysis });
        emit.end();
      } catch (error) { emit.fail(new ParsingFailedError({ ... })); }
    })();
  });
```

### 7. Effect HttpClient API-wrapper with versioned base URL + Redacted auth header + retry
`data-ingestion` · relevance: **adjacent** · verified

UploadThingApi wraps @effect/platform HttpClient with mapRequest to prepend a version-pinned base URL, inject a Redacted API key header (secret never logged), filterStatusOk, custom response-error logging, and retryTransient with exponential schedule — exposing the whole thing as an Effect.Service. This is a clean, copyable template for beep's external data-source drivers (USPTO/CourtListener/etc.): how to do auth headers via Redacted, per-version client variants (v7Client/v6Client), schema-validated response bodies, and tracing spans. beep already has those drivers, so value is the wrapper/auth pattern.

- **Source:** `packages/server/src/public/files/upload-thing-api.ts:70-102`
- **beep-target:** shared HttpClient driver base (USPTO/CourtListener/eCFR auth + retry)

```
const v7Client = baseClient.pipe(
  HttpClient.mapRequest((req) =>
    req.pipe(
      HttpClientRequest.prependUrl("https://api.uploadthing.com/v7"),
      HttpClientRequest.setHeader(
        "x-uploadthing-api-key",
        Redacted.value(envVars.UPLOADTHING_API_KEY),
      ),
    ),
  ),
  HttpClient.filterStatusOk,
  withResponseErrorLogging,
  HttpClient.retryTransient({ times: 3, schedule: Schedule.exponential("250 millis", 1.5) }),
);
```

### 8. @effect/sql repo storing typed extraction as JSONB with parseJson schema round-trip
`effect-ts` · relevance: **direct** · verified

ResumeRepo persists the structured extraction into a Postgres JSONB column and, critically, reads it back through `Schema.parseJson(ResumeData)` so the authoritative record is re-validated against the domain schema on every load. SqlSchema.single gives typed Request/Result. Directly reusable for beep's PGlite-as-authority layer: store candidate/approved claim payloads as JSONB but never trust them on read without schema re-validation; per-user (user_id) row scoping for matter isolation.

- **Source:** `packages/server/src/public/resume/resume-repo.ts:12-21`
- **beep-target:** PGlite authority repo; schema-validated JSONB read for claim payloads

```
// Schema for parsing JSONB data field from database
// The JSONB comes as a string due to identity type parser
const ResumeAnalysisFromDb = Schema.Struct({
  id: ResumeId,
  fileId: UploadedFileId,
  fileName: Schema.String,
  data: Schema.parseJson(ResumeData),
  score: Schema.Number,
  createdAt: Schema.DateTimeUtc,
});
```

### 9. RpcMiddleware-provided CurrentUser identity for per-tenant isolation (ethical-wall seed)
`governance-ops` · relevance: **adjacent** · verified

policy.ts defines a branded UserId, a Context.Tag CurrentUser, and an RpcMiddleware.Tag that fails with Unauthorized and `provides: CurrentUser` to every handler. Every RPC group attaches `.middleware(CurrentUserRpcMiddleware)`, and repos filter all queries by user_id. This is the foundation beep needs for matter-level isolation / conflict-of-interest ethical walls: DI-injected identity enforced at the RPC boundary, with a single place to swap in real auth.

- **Source:** `packages/domain/src/policy.ts:9-22`
- **beep-target:** @beep/identity; matter/client isolation + ethical-wall middleware

```
export class CurrentUser extends Context.Tag("CurrentUser")<
  CurrentUser,
  { readonly userId: UserId }
>() {}

export class CurrentUserRpcMiddleware extends RpcMiddleware.Tag<CurrentUserRpcMiddleware>()(
  "CurrentUserRpcMiddleware",
  {
    failure: HttpApiError.Unauthorized,
    provides: CurrentUser,
  },
) {}
```

### 10. Per-user live connection hub for local-first real-time projection sync
`desktop-portal` · relevance: **adjacent** · verified

EventStreamHub is a scoped Effect.Service holding a SynchronizedRef<MutableHashMap<UserId, ActiveConnection[]>> of Mailboxes, with register/unregister/notifyUser/notifyCurrentUser. It fan-outs typed events to all of a user's live WebSocket connections and prunes dead mailboxes. This is a strong template for beep's local-first desktop: pushing graph/claim mutation events to open workspace windows/threads so projections (FalkorDB/UI) stay in sync after authority writes, without polling.

- **Source:** `packages/server/src/public/event-stream/event-stream-hub.ts:83-118`
- **beep-target:** Workspace/Thread live event sync; projection refresh after authority write

```
const notifyUser = (userId: UserId, event: EventStreamEvents): Effect.Effect<void> =>
  SynchronizedRef.updateEffect(connections, (map) =>
    Clock.currentTimeMillis.pipe(
      Effect.flatMap((now) => {
        const userConnections = MutableHashMap.get(map, userId).pipe(
          Option.getOrElse(() => Arr.empty<ActiveConnection>()),
        );
        ...
        return Effect.forEach(userConnections, (conn) =>
          conn.mailbox.offer(event)..., { discard: true }).pipe(Effect.as(map));
```

### 11. Contract-first RPC server: WebSocket+NDJSON transport, OTLP tracing, wrap-middleware logger
`effect-ts` · relevance: **adjacent** · verified

server.ts wires the merged DomainRpc group onto an HTTP router as a WebSocket endpoint with NDJSON serialization, an RpcMiddleware (RpcLogger) that intercepts every RPC to log failures with rpc.method/clientId annotations, plus CORS and a health route. Reusable as beep's deterministic, observable RPC backbone: how to compose RpcServer.layerHttpRouter, attach cross-cutting wrap-middleware for audit logging, and stream over WebSocket — relevant for the MCP/RPC surface and provenance/audit trails.

- **Source:** `packages/server/src/server.ts:114-124`
- **beep-target:** @effect-rpc server backbone; audit/log wrap-middleware + tracing

```
const RpcRouter = RpcServer.layerHttpRouter({
  group: DomainRpc.middleware(RpcLogger),
  path: "/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(Layer.mergeAll(EventStreamRpcLive, FilesRpcLive, ResumeRpcLive, RpcLoggerLive)),
  Layer.provide(CurrentUserRpcMiddlewareLive),
  Layer.provide(RpcSerialization.layerNdjson),
);
```

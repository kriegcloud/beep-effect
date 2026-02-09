# TODOX Knowledge Base UI Plan (Demo-First)

## Intent Check and Gaps Found
- The request does not specify where the Knowledge Base UI should live (route, layout, or whether it replaces the existing demo pages). I assume a new App Router route is acceptable, but this is not stated.
- “Meeting prep view” is not present in the current codebase. There are references to meetings only inside sample demo data, not in UI or API. This requires new UI and new server/RPC shapes.

## Audit Summary (Relevant Existing Pieces)

### Graph Visualization (Canvas + Effect Simulation)
- `apps/todox/src/features/knowledge-graph/viz/model.ts`
  - Converts `KnowledgeGraph` into `VizGraph` with `nodes`, `links`, and `literalsBySubjectId`, plus stats like `droppedLinkCount`.
  - Maintains a Graph model for neighbor/degree queries, and filtering/hops.
- `apps/todox/src/features/knowledge-graph/viz/render.ts`
  - Canvas renderer with link labels, node labels, selection/hover, and color by type.
- `apps/todox/src/features/knowledge-graph/viz/simulation.ts`
  - Effect-managed force simulation + input handlers, with API for pick, highlight, resize, wheel zoom, pointer drag.
- `apps/todox/src/features/knowledge-graph/viz/color.ts`
  - Stable HSL fallback color by type and schema.org palette.

### Demo Page for Graph Viz
- `apps/todox/src/app/2d-force-graph/page.tsx`
  - Full 3-column layout: left control panel (filters, seed, stats), center canvas graph, right inspector.
  - Inspector shows attributes, incoming/outgoing neighbors, literal relations.
  - Uses `KnowledgeGraph` arbitrary data, not server data.

### Knowledge Demo Page (Extraction + GraphRAG)
- `apps/todox/src/app/knowledge-demo/page.tsx`
  - Extraction flow (text → entities/relations) with `ResultsTabs` for entities/relations/source.
  - Entity resolution panel for multi-extraction merges.
  - GraphRAG query panel with config (topK/maxHops) and context output.
- Key UI blocks:
  - `GraphRAGQueryPanel` → `QueryResultDisplay` (entities/relations/context).
  - `EntityDetailDrawer` (entity inspector with attributes/relations and evidence jump).
  - `SourceTextPanel` highlighting evidence spans.
- Server actions in `apps/todox/src/app/knowledge-demo/actions.ts` are mock data and do not reflect production RPC shapes.

## Minimal UI Components for Knowledge Base (Demo-First)

The goal is to reuse the **graph canvas** and **demo panels** with minimal new surface area. The components below are the minimal set to ship a usable MVP.

### 1) Graph Panel (Primary View)
**Purpose:** Show entity/relationship topology with hover, selection, and quick filter.

**Build with:**
- Canvas rendering and simulation from `apps/todox/src/features/knowledge-graph/viz/*`.
- UI layout from `apps/todox/src/app/2d-force-graph/page.tsx` (center panel structure and pointer interactions).

**Minimal UI elements:**
- Canvas viewport (zoom/pan + node drag).
- Search input (filters highlight by label).
- Type filter (schema.org + custom).
- Toggle for link labels.
- Stats summary (entity/relations counts, dropped edges).

**State required (client):**
- `VizGraph` + derived `EffectGraphModel`.
- `selectedId`, `hoveredId`, `highlightIds`.
- `showLinkLabels`, `typeFilter`, `search`.

### 2) Entity Inspector (Right Rail)
**Purpose:** Fast drill-down on a selected node.

**Build with:**
- Right-side inspector layout from `apps/todox/src/app/2d-force-graph/page.tsx`.
- `EntityDetailDrawer` behavior for relation list + evidence actions.

**Minimal UI elements:**
- Entity header: display name, type, confidence, degree.
- Attributes list.
- Neighbors: incoming/outgoing lists (top N, click to select).
- Literal relations grouped by predicate.

**Extras that are easy to include (reuse):**
- Evidence link button from `EntityDetailDrawer` logic.

### 3) Evidence Panel (Source/Provenance)
**Purpose:** Provide textual grounding for relations and literal values.

**Build with:**
- `SourceTextPanel` from knowledge demo.

**Minimal UI elements:**
- Source text display with highlighted spans.
- Click-to-scroll for evidence spans.

**Notes:** This panel can be a tab inside inspector or a bottom drawer. It requires a server source payload with `sourceText` + spans.

### 4) GraphRAG Query Panel
**Purpose:** Natural-language query + fetch graph context.

**Build with:**
- `GraphRAGQueryPanel` + `QueryResultDisplay` from knowledge demo.

**Minimal UI elements:**
- Query input.
- Config (topK, maxHops).
- Results tabs: entities, relations, context.

### 5) Meeting Prep View (New)
**Purpose:** Produce meeting-focused synthesis with entity/relations + suggested agenda.

**Proposal (minimal):**
- A `MeetingPrepPanel` with:
  - Inputs: `meeting title`, `participants`, `time window`, `objective`.
  - Quick chips to insert participants from selected entities.
  - Output sections: `Attendee context`, `Open issues`, `Risks`, `Suggested agenda`, `Source evidence`.
- Keep this as a right-side tab next to GraphRAG query results.

**Why this is new:** No existing meeting prep UI or API. Only sample email data references meetings.

## Minimal Layout Proposal (Single Route)

A demo-first Knowledge Base screen should not require multiple pages. The minimal layout is:

- **Left rail**: Query + meeting prep (tabbed).
- **Center**: Graph canvas (main view).
- **Right rail**: Entity inspector + evidence (tabbed or stacked).

This structure mirrors the visual balance of `2d-force-graph/page.tsx` while integrating query and evidence UI from knowledge demo.

## API / RPC Shapes (Required for MVP)

Below are the minimum server-facing shapes to wire the UI. These align with `packages/knowledge/server/src/Extraction/GraphAssembler.ts` and the demo types in `apps/todox/src/app/knowledge-demo/types.ts`, but add the fields missing from the mock demo (e.g., evidence ranges).

### 1) Graph Fetch for Graph Panel
**Goal:** Provide a `KnowledgeGraph` and source references.

```ts
export type KnowledgeGraphStats = {
  entityCount: number;
  relationCount: number;
  unresolvedSubjects: number;
  unresolvedObjects: number;
};

export type AssembledEntity = {
  id: string;
  mention: string;
  primaryType: string;
  types: string[];
  attributes: Record<string, string | number | boolean>;
  confidence: number;
  canonicalName?: string;
};

export type AssembledRelation = {
  id: string;
  subjectId: string;
  predicate: string;
  objectId?: string;
  literalValue?: string;
  literalType?: string;
  confidence: number;
  evidence?: string; // raw span text
  evidenceStartChar?: number;
  evidenceEndChar?: number;
  sourceId?: string; // required for evidence panel
};

export type KnowledgeGraph = {
  entities: AssembledEntity[];
  relations: AssembledRelation[];
  entityIndex: Record<string, string>;
  stats: KnowledgeGraphStats;
};

export type KnowledgeGraphSource = {
  id: string;
  title?: string;
  sourceText: string; // for evidence panel
};

export type KnowledgeGraphResponse = {
  graph: KnowledgeGraph;
  sources: KnowledgeGraphSource[]; // used by evidence panel
};
```

### 2) GraphRAG Query
**Goal:** Drive `GraphRAGQueryPanel` and `QueryResultDisplay`.

```ts
export type GraphRAGConfig = {
  topK: number;
  maxHops: number;
};

export type GraphRAGStats = {
  seedEntityCount: number;
  totalEntityCount: number;
  totalRelationCount: number;
  hopsTraversed: number;
  estimatedTokens: number;
  truncated: boolean;
};

export type GraphRAGResult = {
  entities: AssembledEntity[];
  relations: AssembledRelation[];
  seeds: AssembledEntity[];
  context: string;
  scores: Record<string, number>;
  stats: GraphRAGStats;
};

export type GraphRAGRequest = {
  query: string;
  config: GraphRAGConfig;
};
```

### 3) Entity Evidence Fetch
**Goal:** Provide evidence spans for entity selection.

```ts
export type EvidenceSpan = {
  sourceId: string;
  text: string;
  startChar: number;
  endChar: number;
  confidence?: number;
};

export type EntityEvidenceResponse = {
  entityId: string;
  spans: EvidenceSpan[];
};
```

### 4) Meeting Prep View
**Goal:** Summarized meeting prep linked to KG evidence.

```ts
export type MeetingPrepRequest = {
  title: string;
  participants: string[]; // entity ids
  objective?: string;
  timeWindow?: { start: string; end: string }; // ISO
  config?: { topK?: number; maxHops?: number };
};

export type MeetingPrepSection = {
  title: string;
  bullets: string[];
  evidence: EvidenceSpan[];
};

export type MeetingPrepResponse = {
  summary: string;
  sections: MeetingPrepSection[]; // agenda, risks, open questions
  relatedEntities: AssembledEntity[];
  relatedRelations: AssembledRelation[];
};
```

## UI Integration Steps (Minimal)

1. Create a new Knowledge Base route (or replace the demo route) that composes:
   - Left rail: `GraphRAGQueryPanel` + `MeetingPrepPanel` (new).
   - Center: Graph canvas with `ForceGraphSimulation`.
   - Right rail: Inspector + Evidence panel (tabbed).
2. Replace demo `knowledge-demo/actions.ts` with RPC calls using the types above.
3. Map GraphRAG results to graph highlight (seed entities + top relations).
4. On entity select, request evidence spans and update the evidence panel.

## Demo-First Constraints
- Retain the existing `GraphRAGQueryPanel` and `QueryResultDisplay` UI logic to minimize new UI work.
- Use `viz/fromKnowledgeGraph` as the only graph transformation pipeline.
- Keep meeting prep output as static sections, generated from server, not client LLM logic.

## Open Questions (Need Answers)
- Which route should host the Knowledge Base UI (new route vs. replace `/knowledge-demo` or `/2d-force-graph`)?
- Should the evidence panel support multiple sources or a single aggregated text blob?
- Should GraphRAG and meeting prep use the same graph snapshot, or should meeting prep fetch its own graph slice?

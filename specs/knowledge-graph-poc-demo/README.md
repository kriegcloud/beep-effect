# Knowledge Graph POC Demo

> Interactive demonstration page showcasing knowledge graph extraction and retrieval capabilities.

---

## Quick Navigation

| Document | Purpose | Target Audience |
|----------|---------|-----------------|
| **[QUICK_START.md](./QUICK_START.md)** | 5-minute triage | All contributors |
| **[MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)** | Full workflow | Orchestrator agents |
| **[AGENT_PROMPTS.md](./AGENT_PROMPTS.md)** | Sub-agent templates | Agent delegation |
| **[RUBRICS.md](./RUBRICS.md)** | Quality scoring | Reviewers |
| **[REFLECTION_LOG.md](./REFLECTION_LOG.md)** | Lessons learned | Future iterations |
| **[sample-data/emails.md](./sample-data/emails.md)** | Test data | Implementation |
| **[handoffs/](./handoffs/)** | Phase handoff docs | Session continuity |

---

## Overview

This specification guides the implementation of a proof-of-concept demonstration page in the todox app (`/knowledge-demo`) that showcases the knowledge-graph-integration capabilities implemented in Phase 5 of `specs/knowledge-graph-integration/`.

### Purpose

- Demonstrate extraction pipeline: text input to structured entities and relations
- Visualize extracted knowledge graphs with entity types and evidence
- Enable GraphRAG queries against extracted data
- Show entity resolution and deduplication across multiple extractions

### Location

- Route: `apps/todox/src/app/knowledge-demo/page.tsx`
- Components: `apps/todox/src/app/knowledge-demo/components/`
- Hooks: `apps/todox/src/app/knowledge-demo/hooks/`

### Current State

The knowledge graph services are **fully implemented** in `packages/knowledge/*`:

| Service | Package | Status |
|---------|---------|--------|
| `ExtractionPipeline` | `@beep/knowledge-server` | Complete |
| `EmbeddingService` | `@beep/knowledge-server` | Complete |
| `GroundingService` | `@beep/knowledge-server` | Complete |
| `EntityResolutionService` | `@beep/knowledge-server` | Complete |
| `GraphRAGService` | `@beep/knowledge-server` | Complete |
| `OntologyService` | `@beep/knowledge-server` | Complete |

This spec creates the **client-side demo UI** to exercise these services.

---

## User Stories

### US-1: Email Input
**As a developer**, I can paste email text into a textarea and trigger extraction, **so that** I can see the extraction pipeline in action.

**Acceptance Criteria:**
- [ ] Textarea accepts arbitrary email text
- [ ] Dropdown to select from 5 sample emails
- [ ] "Extract" button triggers pipeline
- [ ] Loading state shows during extraction

### US-2: Entity Visualization
**As a developer**, I can view extracted entities with their ontology types, **so that** I understand what the system extracted.

**Acceptance Criteria:**
- [ ] Entity cards display: name, types, confidence
- [ ] Attributes shown as key-value pairs
- [ ] Click entity to see evidence spans highlighted in source
- [ ] Filter entities by type

### US-3: Relation Visualization
**As a developer**, I can view extracted relations between entities, **so that** I understand the knowledge graph structure.

**Acceptance Criteria:**
- [ ] Relations shown as subject-predicate-object triples
- [ ] Click relation to see evidence span in source
- [ ] Visual graph view (optional: force-directed layout)
- [ ] Filter relations by predicate

### US-4: GraphRAG Queries
**As a developer**, I can run natural language queries against extracted data, **so that** I can test retrieval-augmented generation.

**Acceptance Criteria:**
- [ ] Text input for natural language queries
- [ ] Query returns relevant entities and relations
- [ ] Formatted context shown for LLM consumption
- [ ] k and hops parameters configurable

### US-5: Entity Resolution Demo
**As a developer**, I can see entity resolution results across multiple extractions, **so that** I understand deduplication behavior.

**Acceptance Criteria:**
- [ ] Extract from multiple emails sequentially
- [ ] Show entity clusters after resolution
- [ ] Display owl:sameAs links with provenance
- [ ] Statistics: original count vs resolved count

---

## Dummy Data Strategy

### Sample Ontology

A minimal demo ontology covering common email entities:

```turtle
@prefix schema: <http://schema.org/> .
@prefix demo: <http://demo.beep.dev/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# Classes
schema:Person a rdfs:Class ;
  rdfs:label "Person" .

schema:Organization a rdfs:Class ;
  rdfs:label "Organization" .

demo:Project a rdfs:Class ;
  rdfs:label "Project" .

demo:Meeting a rdfs:Class ;
  rdfs:label "Meeting" .

schema:Date a rdfs:Class ;
  rdfs:label "Date" .

# Properties
schema:worksFor a rdf:Property ;
  rdfs:domain schema:Person ;
  rdfs:range schema:Organization .

demo:leadsProject a rdf:Property ;
  rdfs:domain schema:Person ;
  rdfs:range demo:Project .

demo:hasDeadline a rdf:Property ;
  rdfs:domain demo:Project ;
  rdfs:range schema:Date .

demo:attendedBy a rdf:Property ;
  rdfs:domain demo:Meeting ;
  rdfs:range schema:Person .

demo:discusses a rdf:Property ;
  rdfs:domain demo:Meeting ;
  rdfs:range demo:Project .
```

### Sample Emails

5 emails demonstrating cross-document entity overlap:

| Email | Key Entities | Purpose |
|-------|--------------|---------|
| 1 | John Smith, Acme Corp, Q4 Release | Introduce main entities |
| 2 | Sarah Chen, Acme Corp, Q4 Release | Show entity overlap (Acme, Q4 Release) |
| 3 | John Smith, Tech Review Meeting | Different context for same person |
| 4 | Sarah Chen, Budget Review, Q4 Release | Connect multiple projects |
| 5 | Meeting Summary: John, Sarah, Mike | Test multi-person extraction |

See `sample-data/emails.md` for full email content.

---

## UI Components

### Component Hierarchy

```
KnowledgeDemoPage
├── EmailInputPanel
│   ├── SampleEmailSelector (dropdown)
│   ├── EmailTextarea
│   └── ExtractButton
├── ExtractionProgressPanel
│   ├── StageIndicator (chunking, mentions, entities, relations, assembly)
│   └── StageStats (counts, timing)
├── ResultsTabs
│   ├── EntitiesTab
│   │   ├── EntityFilterBar
│   │   ├── EntityCardList
│   │   └── EntityDetailDrawer
│   ├── RelationsTab
│   │   ├── RelationFilterBar
│   │   ├── RelationTable
│   │   └── GraphVisualization (optional)
│   └── EvidenceTab
│       ├── SourceTextDisplay (with highlighting)
│       └── EvidenceSpanList
├── GraphRAGQueryPanel
│   ├── QueryInput
│   ├── QueryConfigForm (topK, hops)
│   └── QueryResultDisplay
└── EntityResolutionPanel
    ├── ResolutionStats
    ├── ClusterList
    └── SameAsLinkTable
```

### Component Details

#### EmailInputPanel
- Textarea: 10 rows, full width, monospace font
- Sample selector: Dropdown with 5 sample emails
- Extract button: Primary action, disabled during extraction
- Clear button: Reset all state

#### ExtractionProgressPanel
- Pipeline stages: NLP Chunking > Mention Extraction > Entity Classification > Relation Extraction > Graph Assembly
- Each stage shows: status (pending/running/complete/error), count, duration
- Progress bar across all stages

#### EntityInspector (EntityDetailDrawer)
- Entity name and canonical form
- Types as badges with ontology IRIs
- Attributes in key-value table
- Confidence score with visual indicator
- Evidence spans with "Jump to source" links
- Related relations (as subject or object)

#### RelationBrowser
- Table view: Subject | Predicate | Object | Confidence
- Click row to expand evidence
- Predicate filtering dropdown
- Optional: Force-directed graph visualization using D3

#### GraphRAGQueryPanel
- Query input: Natural language text field
- Config: topK slider (1-50, default 10), hops selector (0-3, default 1)
- Results: Entity cards, relation list, formatted context preview
- Stats: seed count, total entities, hops traversed, token estimate

#### EntityResolutionPanel
- Trigger: "Resolve Entities" button (appears after 2+ extractions)
- Stats display: original vs resolved counts, cluster count, merge count
- Cluster list: Expandable groups showing member entities
- SameAs links: Table with canonical ID, alias ID, confidence, reason

---

## Technical Implementation

### Layer Composition

The demo page requires these services:

```typescript
import { ExtractionPipeline } from "@beep/knowledge-server/Extraction";
import { GraphRAGService } from "@beep/knowledge-server/GraphRAG";
import { EntityResolutionService } from "@beep/knowledge-server/EntityResolution";
import { EmbeddingService } from "@beep/knowledge-server/Embedding";
import { OntologyService } from "@beep/knowledge-server/Ontology";
```

Layer stack for the demo:

```typescript
const DemoLive = Layer.mergeAll(
  ExtractionPipeline.Default,
  GraphRAGService.Default,
  EntityResolutionService.Default,
  // LLM provider for extraction
  LlmLayers.AnthropicLive,
  // Embedding provider (mock for demo)
  MockEmbeddingProvider.Default,
);
```

### State Management

Use Effect Atom for reactive state:

```typescript
// Core state atoms
const emailTextAtom = Atom.of("");
const extractionResultAtom = Atom.of<Option<ExtractionResult>>(Option.none());
const graphsAtom = Atom.of<KnowledgeGraph[]>([]);
const queryResultAtom = Atom.of<Option<GraphRAGResult>>(Option.none());
const resolutionResultAtom = Atom.of<Option<ResolutionResult>>(Option.none());

// Derived state
const entitiesAtom = Atom.derived(extractionResultAtom, (result) =>
  pipe(result, Option.map((r) => r.graph.entities), Option.getOrElse(() => []))
);
```

### API Integration

Server actions or API routes calling knowledge services:

```typescript
// app/knowledge-demo/actions.ts
"use server";

import { ExtractionPipeline } from "@beep/knowledge-server/Extraction";
import * as Effect from "effect/Effect";

export const extractFromText = async (
  text: string,
  ontologyContent: string,
  config: ExtractionPipelineConfig
) => {
  const program = Effect.gen(function* () {
    const pipeline = yield* ExtractionPipeline;
    return yield* pipeline.run(text, ontologyContent, config);
  });

  return Effect.runPromise(
    program.pipe(Effect.provide(DemoLive))
  );
};
```

### Mock Embedding Provider

For the demo, use a mock embedding provider to avoid external API calls:

```typescript
const MockEmbeddingProvider = Effect.Service<EmbeddingProvider>()(
  "MockEmbeddingProvider",
  {
    effect: Effect.succeed({
      embed: (text) => Effect.succeed(generateDeterministicVector(text)),
      batchEmbed: (texts) => Effect.succeed(texts.map(generateDeterministicVector)),
    }),
  }
);
```

---

## Phase Overview

| Phase | Focus | Sessions | Key Outputs |
|-------|-------|----------|-------------|
| **P1** | Basic extraction UI | 1 | EmailInputPanel, basic entity display |
| **P2** | Evidence and relations | 1 | Source highlighting, relation table |
| **P3** | GraphRAG query UI | 1 | Query panel, result display |
| **P4** | Entity resolution | 1 | Multi-extraction, cluster visualization |
| **P5** | Polish and demo-ready | 1 | Styling, error states, documentation |

### Phase 1: Basic Extraction UI

**Goal:** Input email text, trigger extraction, display entities.

**Tasks:**
1. Create page route at `/knowledge-demo`
2. Implement `EmailInputPanel` with sample selector
3. Create server action for extraction
4. Display entities in card grid
5. Basic loading and error states

**Verification:**
```bash
bun run check --filter @beep/todox
bun run dev # Navigate to /knowledge-demo
```

### Phase 2: Relations and Evidence

**Goal:** Show relations and link evidence to source text.

**Tasks:**
1. Implement `RelationTable` component
2. Add evidence highlighting in source text
3. Create `EntityDetailDrawer` with full details
4. Connect evidence spans to source highlighting

**Verification:**
- Click entity shows drawer with evidence
- Click relation shows evidence span
- Source text highlights correctly

### Phase 3: GraphRAG Query Interface

**Goal:** Enable natural language queries against extracted graph.

**Tasks:**
1. Implement `GraphRAGQueryPanel`
2. Create query server action
3. Display query results (entities, relations, context)
4. Add config controls (topK, hops)

**Verification:**
- Query "Who works at Acme?" returns relevant entities
- Context is formatted for LLM consumption
- Stats show traversal information

### Phase 4: Entity Resolution Visualization

**Goal:** Demonstrate deduplication across multiple extractions.

**Tasks:**
1. Support multiple sequential extractions
2. Implement "Resolve Entities" action
3. Create `ClusterList` component
4. Display `SameAsLink` provenance

**Verification:**
- Extract from 3+ emails
- Resolve shows merged entity count
- Clusters display member entities
- SameAs links show reasoning

### Phase 5: Polish and Demo-Ready

**Goal:** Production-quality demo experience.

**Tasks:**
1. Add comprehensive error handling
2. Improve visual design (consistent with todox)
3. Add demo walkthrough/tutorial hints
4. Write component documentation
5. Performance optimization (loading states, suspense)

**Verification:**
- No console errors
- Responsive on desktop/tablet
- All error states handled gracefully

---

## Success Metrics

### Must-Have Targets

| Metric | Target | Verification | Pass/Fail |
|--------|--------|--------------|-----------|
| **Entity Extraction** | ≥10 unique entities from 5 sample emails | Manual count in UI | ≥10 = PASS |
| **Entity Types** | 5 ontology types used (Person, Organization, Project, Meeting, Date) | Check entity badges | All 5 present = PASS |
| **Relations Extracted** | ≥8 relations across all emails | Count in Relations tab | ≥8 = PASS |
| **Entity Deduplication** | "John Smith"/"J. Smith"/"John" resolved to 1 entity | Check cluster count | Merged = PASS |
| **GraphRAG Query** | Query returns ≥3 relevant entities | Test query: "Who works at Acme?" | ≥3 entities = PASS |
| **Evidence Linking** | 100% of entities have source evidence | Click each entity | All have spans = PASS |
| **TypeScript** | 0 type errors | `bun run check --filter @beep/todox` | Exit code 0 = PASS |
| **Lint** | 0 lint errors | `bun run lint --filter @beep/todox` | Exit code 0 = PASS |

### Nice-to-Have Targets

| Metric | Target | Verification | Notes |
|--------|--------|--------------|-------|
| **Render Performance** | Graph visualization <2s | Browser DevTools | Force-directed layout |
| **Test Coverage** | ≥80% for new components | `bun run test --coverage` | Unit tests for hooks |
| **Bundle Size** | <50KB additional JS | Build output analysis | Excluding D3 if used |
| **Accessibility** | WCAG 2.1 AA compliant | Axe DevTools audit | Focus states, ARIA |

### Phase-Specific Verification

| Phase | Must Pass Before Next Phase | Verification Command |
|-------|----------------------------|---------------------|
| **P1: Basic Extraction** | ≥1 entity displays from sample email | Navigate to `/knowledge-demo`, click Extract |
| **P2: Relations & Evidence** | Relations table renders, evidence highlights | Click relation → source highlights |
| **P3: GraphRAG Query** | Query returns formatted context | Enter query → results display |
| **P4: Entity Resolution** | Cluster count < original entity count | Extract 3 emails → Resolve → check stats |
| **P5: Polish** | No console errors, all states handled | Browser console clean after full workflow |

### Sample Data Expected Outcomes

From the 5 sample emails, expect these entities to be extracted:

| Entity Name | Type | Expected In Emails |
|-------------|------|-------------------|
| John Smith / J. Smith / John | Person | 1, 3, 5 (should dedupe) |
| Sarah Chen | Person | 2, 4, 5 |
| Mike Wilson | Person | 5 |
| Alex Rodriguez | Person | 5 (if present) |
| Lisa Park | Person | 5 (if present) |
| Acme Corp | Organization | 1, 2 |
| Q4 Release | Project | 1, 2, 4 |
| Tech Review Meeting | Meeting | 3 |
| Budget Review | Project | 4 |

**Deduplication Test:** After entity resolution, "John Smith", "J. Smith", and "John" MUST resolve to a single canonical entity.

---

## Out of Scope

The following are explicitly **NOT** part of this POC:

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| **Production authentication** | Demo page only | Phase 6+ if productionizing |
| **Persistent storage** | In-memory for demo | Database integration exists in knowledge-server |
| **Real embedding API calls** | Uses mock embeddings | Can swap to real provider |
| **Multi-user support** | Single-user demo | Not needed for POC |
| **Mobile responsive design** | Desktop/tablet only | Nice-to-have target |
| **i18n/l10n** | English only | Not scoped |
| **Performance optimization beyond MVP** | <2s is nice-to-have | Production would need more |
| **Comprehensive error recovery** | Basic error states only | Retry logic, offline support |
| **Graph database export** | No Neo4j/RDF export | Could add later |
| **Custom ontology upload** | Uses fixed demo ontology | Ontology editor is separate feature |

---

## Success Criteria (Checklist)

### Functional

- [ ] Can extract entities from 5 sample emails
- [ ] Can view entity types, attributes, and confidence
- [ ] Can view relations with evidence spans
- [ ] Can query using GraphRAG and see formatted context
- [ ] Entity deduplication works across multiple extractions
- [ ] Evidence highlighting links to source text

### Technical

- [ ] Effect patterns used throughout (Effect.gen, services, layers)
- [ ] No TypeScript errors (`bun run check`)
- [ ] No lint errors (`bun run lint`)
- [ ] Path aliases used (`@beep/*`)
- [ ] Namespace imports for Effect modules

### Demo Quality

- [ ] Clear visual hierarchy
- [ ] Responsive loading states
- [ ] Helpful error messages
- [ ] Sample data demonstrates all features

---

## Complexity Assessment

```
Phase Count:       5 phases    x 2 = 10
Agent Diversity:   4 agents    x 3 = 12
Cross-Package:     2 (todox)   x 4 =  8
External Deps:     1 (AI)      x 3 =  3
Uncertainty:       2 (low)     x 5 = 10
Research Required: 1 (minimal) x 2 =  2
----------------------------------------
Total Score:                      45 -> High Complexity
```

**Recommendation:** Use orchestration structure with per-phase handoffs.

---

## Agent Delegation Matrix

| Task Type | Agent | Capability |
|-----------|-------|------------|
| Codebase exploration | `codebase-researcher` | read-only |
| Effect documentation | `mcp-researcher` | read-only |
| Source code writing | Orchestrator (simple) or `effect-code-writer` | write-files |
| Test writing | `test-writer` | write-files |
| UI component review | `code-reviewer` | write-reports |

---

## Getting Started

**Start Phase 1 by reading:**

```
specs/knowledge-graph-poc-demo/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

**Reference sample data:**

```
specs/knowledge-graph-poc-demo/sample-data/emails.md
```

---

## Related Documentation

- [Knowledge Graph Integration Spec](../knowledge-graph-integration/README.md) - Source services
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Required patterns
- [Spec Guide](../_guide/README.md) - Spec methodology

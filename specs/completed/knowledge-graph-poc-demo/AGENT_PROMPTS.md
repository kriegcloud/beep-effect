# Agent Prompts: Knowledge Graph POC Demo

> Ready-to-use prompts for specialized agents working on the todox knowledge graph demonstration.

---

## Agent Selection Matrix

| Phase | Primary Agent | Secondary Agent | Research Agent |
|-------|---------------|-----------------|----------------|
| **P1: Basic Extraction UI** | `effect-code-writer` | `codebase-researcher` | - |
| **P2: Relations & Evidence UI** | `effect-code-writer` | `test-writer` | - |
| **P3: GraphRAG Query Interface** | `effect-code-writer` | `mcp-researcher` | `web-researcher` |
| **P4: Entity Resolution UI** | `effect-code-writer` | `test-writer` | - |
| **P5: Polish & Integration** | `code-reviewer` | `doc-writer` | - |

### Agent Capabilities Reference

| Agent | Capability | Output |
|-------|------------|--------|
| `codebase-researcher` | read-only | Informs orchestrator |
| `mcp-researcher` | read-only | Effect documentation |
| `web-researcher` | read-only | External best practices |
| `effect-code-writer` | write-files | `.ts`/`.tsx` source files |
| `test-writer` | write-files | `*.test.ts` files |
| `code-reviewer` | write-reports | `outputs/review.md` |
| `doc-writer` | write-files | Documentation files |

---

## Phase 1: Basic Extraction UI

### Primary Agent: effect-code-writer

```markdown
## Task: Create Knowledge Demo Page Structure

You are implementing Phase 1 of the Knowledge Graph POC Demo spec.

### Mission

Create the foundational UI for the knowledge graph demo at `/knowledge-demo` in the todox app.

### Files to Create

1. `apps/todox/src/app/knowledge-demo/page.tsx`
   - Server component page entry point
   - Simple layout with title and client component

2. `apps/todox/src/app/knowledge-demo/components/KnowledgeDemoClient.tsx`
   - "use client" directive
   - State management for email text, results, loading, error
   - Orchestrates EmailInputPanel and EntityCardList

3. `apps/todox/src/app/knowledge-demo/components/EmailInputPanel.tsx`
   - "use client" directive
   - Textarea for email input (min-h-[200px], font-mono)
   - Sample email dropdown selector
   - Extract and Clear buttons
   - Uses @beep/ui components (Button, Textarea, Select)

4. `apps/todox/src/app/knowledge-demo/components/EntityCardList.tsx`
   - "use client" directive
   - Grid display of entity cards
   - Shows: mention, types (as badges), confidence
   - Empty state message

5. `apps/todox/src/app/knowledge-demo/data/sample-emails.ts`
   - SAMPLE_EMAILS array with 5 emails from specs/knowledge-graph-poc-demo/sample-data/emails.md
   - DEMO_ONTOLOGY constant (Turtle format)
   - Each email: { key, title, content }

6. `apps/todox/src/app/knowledge-demo/actions.ts`
   - "use server" directive
   - extractFromText server action
   - Uses ExtractionPipeline from @beep/knowledge-server
   - Returns ExtractionResult

### Critical Patterns

#### Effect Namespace Imports (REQUIRED)

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as A from "effect/Array";
```

#### Server Action Pattern

```typescript
"use server";

import { ExtractionPipeline } from "@beep/knowledge-server/Extraction";
import * as Effect from "effect/Effect";

export async function extractFromText(text: string): Promise<ExtractionResult> {
  const program = Effect.gen(function* () {
    const pipeline = yield* ExtractionPipeline;
    return yield* pipeline.run(text, DEMO_ONTOLOGY, config);
  });

  return Effect.runPromise(program.pipe(Effect.provide(DemoLive)));
}
```

#### UI Component Imports

```typescript
import { Button } from "@beep/ui/components/button";
import { Textarea } from "@beep/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@beep/ui/components/card";
import { Badge } from "@beep/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@beep/ui/components/select";
```

### FORBIDDEN Patterns

- NO `async/await` inside Effect.gen
- NO direct imports like `import { Effect } from "effect"`
- NO relative imports to packages (`../../../packages`)
- NO native array methods - use `A.map`, `A.filter` from "effect/Array"

### Sample Data Reference

Read the sample emails from: `specs/knowledge-graph-poc-demo/sample-data/emails.md`

### Verification

After implementation, run:

```bash
bun run check --filter @beep/todox
bun run lint:fix --filter @beep/todox
bun run dev
# Navigate to http://localhost:3000/knowledge-demo
```

### Success Criteria

- [ ] Page renders at /knowledge-demo
- [ ] Can select from 5 sample emails via dropdown
- [ ] "Extract" button triggers extraction
- [ ] Entities display in card grid
- [ ] Loading spinner during extraction
- [ ] Error message on failure
```

### Secondary Agent: codebase-researcher

```markdown
## Task: Analyze Todox App Patterns

Research existing patterns in apps/todox for consistent implementation.

### Research Questions

1. **Page Structure**
   - How are other pages structured in apps/todox/src/app/?
   - What layout components are used?
   - How is metadata defined?

2. **Client Component Patterns**
   - How do existing client components manage state?
   - Are there existing loading/error patterns?
   - What state management approach is used?

3. **UI Component Usage**
   - Which @beep/ui components are commonly used?
   - How are forms typically structured?
   - What styling patterns (Tailwind classes) are standard?

4. **Server Actions**
   - Are there existing server actions in apps/todox?
   - How is Effect integrated with server actions?
   - How are errors handled?

### Files to Examine

- `apps/todox/src/app/page.tsx`
- `apps/todox/src/app/layout.tsx`
- `apps/todox/src/components/**/*.tsx`
- `apps/todox/src/app/**/actions.ts` (if any exist)

### Output Format

Provide a summary of:
1. Page structure template
2. State management patterns
3. UI component inventory
4. Server action patterns (if found)
```

---

## Phase 2: Relations & Evidence UI

### Primary Agent: effect-code-writer

```markdown
## Task: Implement Relations and Evidence Display

You are implementing Phase 2 of the Knowledge Graph POC Demo spec.

### Mission

Add relation visualization and evidence highlighting to the knowledge demo.

### Files to Create

1. `apps/todox/src/app/knowledge-demo/components/RelationTable.tsx`
   - "use client" directive
   - Table displaying: Subject | Predicate | Object | Confidence
   - Click row to expand evidence
   - Filter dropdown for predicates
   - Uses @beep/ui Table components

2. `apps/todox/src/app/knowledge-demo/components/EntityDetailDrawer.tsx`
   - "use client" directive
   - Sheet/Drawer showing full entity details
   - Sections: Types, Attributes, Evidence Spans, Related Relations
   - "Jump to source" links for evidence

3. `apps/todox/src/app/knowledge-demo/components/SourceTextDisplay.tsx`
   - "use client" directive
   - Displays original email text
   - Highlights evidence spans with colored backgrounds
   - Accepts highlightSpans prop with character offsets

4. `apps/todox/src/app/knowledge-demo/components/ResultsTabs.tsx`
   - "use client" directive
   - Tabs: Entities | Relations | Evidence
   - Contains EntityCardList, RelationTable, SourceTextDisplay

### Component Interface Patterns

#### RelationTable

```typescript
interface RelationTableProps {
  relations: readonly Relation.Model[];
  entities: readonly Entity.Model[];
  onRelationClick: (relation: Relation.Model) => void;
}
```

#### EntityDetailDrawer

```typescript
interface EntityDetailDrawerProps {
  entity: Entity.Model | null;
  relations: readonly Relation.Model[];
  onClose: () => void;
  onJumpToEvidence: (span: EvidenceSpan) => void;
}
```

#### SourceTextDisplay

```typescript
interface HighlightSpan {
  start: number;
  end: number;
  color: 'yellow' | 'green' | 'blue';
  label?: string;
}

interface SourceTextDisplayProps {
  text: string;
  highlights: readonly HighlightSpan[];
}
```

### UI Components to Use

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@beep/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/ui/components/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@beep/ui/components/sheet";
```

### Evidence Highlighting Pattern

```typescript
function SourceTextDisplay({ text, highlights }: SourceTextDisplayProps) {
  // Sort highlights by start position
  const sortedHighlights = A.sort(highlights, Order.mapInput(
    Order.number,
    (h) => h.start
  ));

  // Build segments with highlighting
  const segments = React.useMemo(() => {
    const result: Array<{ text: string; highlight?: HighlightSpan }> = [];
    let lastEnd = 0;

    for (const highlight of sortedHighlights) {
      if (highlight.start > lastEnd) {
        result.push({ text: text.slice(lastEnd, highlight.start) });
      }
      result.push({
        text: text.slice(highlight.start, highlight.end),
        highlight,
      });
      lastEnd = highlight.end;
    }

    if (lastEnd < text.length) {
      result.push({ text: text.slice(lastEnd) });
    }

    return result;
  }, [text, sortedHighlights]);

  return (
    <div className="font-mono text-sm whitespace-pre-wrap">
      {segments.map((segment, i) => (
        <span
          key={i}
          className={segment.highlight ? `bg-${segment.highlight.color}-200` : ""}
        >
          {segment.text}
        </span>
      ))}
    </div>
  );
}
```

### Verification

```bash
bun run check --filter @beep/todox
# Test: Click entity shows drawer with evidence
# Test: Click relation shows evidence span
# Test: Source text highlights correctly
```

### Success Criteria

- [ ] Relations display in table format
- [ ] Clicking entity opens detail drawer
- [ ] Evidence spans highlight in source text
- [ ] "Jump to evidence" scrolls to highlighted span
- [ ] Filter relations by predicate type
```

### Secondary Agent: test-writer

```markdown
## Task: Create Component Tests for Phase 2

Create tests for the Phase 2 UI components.

### Test Files to Create

1. `apps/todox/src/app/knowledge-demo/components/__tests__/RelationTable.test.tsx`
2. `apps/todox/src/app/knowledge-demo/components/__tests__/SourceTextDisplay.test.tsx`

### Testing Patterns

```typescript
import { describe, it, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { RelationTable } from "../RelationTable";

describe("RelationTable", () => {
  const mockRelations = [
    {
      id: "rel_1",
      subjectId: "entity_1",
      predicate: "schema:worksFor",
      objectId: "entity_2",
      groundingConfidence: 0.95,
    },
  ];

  const mockEntities = [
    { id: "entity_1", mention: "John Smith", types: ["schema:Person"] },
    { id: "entity_2", mention: "Acme Corp", types: ["schema:Organization"] },
  ];

  it("displays relation as subject-predicate-object", () => {
    render(
      <RelationTable
        relations={mockRelations}
        entities={mockEntities}
        onRelationClick={() => {}}
      />
    );

    expect(screen.getByText("John Smith")).toBeTruthy();
    expect(screen.getByText("worksFor")).toBeTruthy();
    expect(screen.getByText("Acme Corp")).toBeTruthy();
  });

  it("calls onRelationClick when row clicked", () => {
    const handleClick = vi.fn();
    render(
      <RelationTable
        relations={mockRelations}
        entities={mockEntities}
        onRelationClick={handleClick}
      />
    );

    fireEvent.click(screen.getByText("John Smith"));
    expect(handleClick).toHaveBeenCalledWith(mockRelations[0]);
  });
});
```

### SourceTextDisplay Test

```typescript
describe("SourceTextDisplay", () => {
  it("highlights evidence spans correctly", () => {
    const text = "John Smith works at Acme Corp.";
    const highlights = [
      { start: 0, end: 10, color: "yellow" as const },
      { start: 20, end: 29, color: "blue" as const },
    ];

    render(<SourceTextDisplay text={text} highlights={highlights} />);

    // Verify segments are rendered
    expect(screen.getByText("John Smith")).toBeTruthy();
    expect(screen.getByText("Acme Corp")).toBeTruthy();
  });

  it("handles overlapping highlights", () => {
    // Test edge case
  });
});
```

### Verification

```bash
bun run test --filter @beep/todox
```
```

---

## Phase 3: GraphRAG Query Interface

### Primary Agent: effect-code-writer

```markdown
## Task: Implement GraphRAG Query Panel

You are implementing Phase 3 of the Knowledge Graph POC Demo spec.

### Mission

Create a natural language query interface for the extracted knowledge graph.

### Files to Create

1. `apps/todox/src/app/knowledge-demo/components/GraphRAGQueryPanel.tsx`
   - "use client" directive
   - Text input for natural language queries
   - Config controls: topK slider (1-50), hops selector (0-3)
   - Query button with loading state
   - Results display section

2. `apps/todox/src/app/knowledge-demo/components/QueryResultDisplay.tsx`
   - "use client" directive
   - Shows retrieved entities with relevance scores
   - Shows related relations
   - Displays formatted context for LLM

3. `apps/todox/src/app/knowledge-demo/components/QueryConfigForm.tsx`
   - "use client" directive
   - topK slider with label
   - hops dropdown (0, 1, 2, 3)
   - Collapsible advanced options

4. `apps/todox/src/app/knowledge-demo/actions.ts` (extend)
   - Add queryGraph server action
   - Uses GraphRAGService from @beep/knowledge-server

### GraphRAG Service Integration

```typescript
// Add to actions.ts
import { GraphRAGService } from "@beep/knowledge-server/GraphRAG";

interface QueryOptions {
  query: string;
  topK: number;
  hops: number;
}

export async function queryGraph(options: QueryOptions): Promise<GraphRAGResult> {
  const program = Effect.gen(function* () {
    const service = yield* GraphRAGService;
    return yield* service.query({
      query: options.query,
      topK: options.topK,
      hops: options.hops,
    });
  });

  return Effect.runPromise(program.pipe(Effect.provide(DemoLive)));
}
```

### Component Interface

```typescript
interface GraphRAGQueryPanelProps {
  graph: KnowledgeGraph;  // The extracted graph to query
}

interface QueryResultDisplayProps {
  result: GraphRAGResult | null;
  isLoading: boolean;
}

interface GraphRAGResult {
  entities: readonly Entity.Model[];
  relations: readonly Relation.Model[];
  scores: ReadonlyMap<string, number>;
  context: string;  // Formatted for LLM consumption
  stats: {
    seedCount: number;
    totalEntities: number;
    hopsTraversed: number;
    tokenEstimate: number;
  };
}
```

### UI Pattern

```typescript
export function GraphRAGQueryPanel({ graph }: GraphRAGQueryPanelProps) {
  const [query, setQuery] = React.useState("");
  const [topK, setTopK] = React.useState(10);
  const [hops, setHops] = React.useState(1);
  const [result, setResult] = React.useState<GraphRAGResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const queryResult = await queryGraph({ query, topK, hops });
      setResult(queryResult);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">GraphRAG Query</h2>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about the extracted data..."
          className="flex-1"
        />
        <Button onClick={handleQuery} disabled={isLoading || !query.trim()}>
          {isLoading ? "Querying..." : "Query"}
        </Button>
      </div>

      <QueryConfigForm
        topK={topK}
        setTopK={setTopK}
        hops={hops}
        setHops={setHops}
      />

      <QueryResultDisplay result={result} isLoading={isLoading} />
    </div>
  );
}
```

### Test Queries (from sample-data/emails.md)

1. "Who works at Acme Corp?" - Expected: John Smith, Sarah Chen, Mike Wilson, etc.
2. "What projects is John Smith working on?" - Expected: Q4 Release
3. "What was discussed in the Tech Review Meeting?" - Expected: Q4 Release, architecture
4. "What are the upcoming deadlines?" - Expected: December 15, November 30
5. "How are Q4 Release and Budget Review connected?" - Expected: shared people

### Verification

```bash
bun run check --filter @beep/todox
# Test: Query "Who works at Acme?" returns expected entities
# Test: Context is formatted for LLM
# Test: Stats show traversal information
```

### Success Criteria

- [ ] Query input accepts natural language
- [ ] topK and hops configurable
- [ ] Results show relevant entities with scores
- [ ] Formatted context displayed
- [ ] Stats section shows seed count, total entities, hops, tokens
```

### Research Agent: mcp-researcher

```markdown
## Task: Research GraphRAG Service API

Research the GraphRAGService implementation in @beep/knowledge-server.

### Topics to Research

1. **GraphRAGService Interface**
   - What methods does it expose?
   - What are the input/output types?
   - What dependencies does it have?

2. **Query Configuration**
   - What options are supported?
   - Default values for topK, hops
   - Any filtering capabilities?

3. **Result Structure**
   - What fields are in GraphRAGResult?
   - How is the context string formatted?
   - How are scores computed?

### Files to Examine

- `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`
- `packages/knowledge/server/src/GraphRAG/index.ts`
- `packages/knowledge/domain/src/` for type definitions

### Output Format

Document the API for integration:

```typescript
// GraphRAGService interface
interface GraphRAGService {
  query: (options: QueryOptions) => Effect<GraphRAGResult, GraphRAGError>;
}

// QueryOptions
interface QueryOptions {
  // ...discovered fields
}

// GraphRAGResult
interface GraphRAGResult {
  // ...discovered fields
}
```
```

### Research Agent: web-researcher

```markdown
## Task: Research GraphRAG UI Best Practices

Research best practices for GraphRAG query interfaces.

### Topics to Research

1. **Query Interface Design**
   - How do similar tools present query interfaces?
   - What configuration options are exposed to users?
   - How are results displayed?

2. **Result Visualization**
   - How are relevance scores displayed?
   - What context preview patterns exist?
   - How are graph traversal paths shown?

3. **User Experience**
   - What feedback during query execution?
   - How to explain k-NN and hop parameters?
   - How to show provenance/citations?

### Sources to Check

- LangChain GraphRAG documentation
- LlamaIndex knowledge graph demos
- Microsoft GraphRAG UI patterns
- RAG system UI examples

### Output Format

Provide:
1. UI pattern recommendations
2. Configuration UX best practices
3. Result display patterns
4. User guidance text suggestions
```

---

## Phase 4: Entity Resolution UI

### Primary Agent: effect-code-writer

```markdown
## Task: Implement Entity Resolution Visualization

You are implementing Phase 4 of the Knowledge Graph POC Demo spec.

### Mission

Create UI for demonstrating entity resolution across multiple extractions.

### Files to Create

1. `apps/todox/src/app/knowledge-demo/components/EntityResolutionPanel.tsx`
   - "use client" directive
   - "Resolve Entities" button (appears after 2+ extractions)
   - Stats: original vs resolved counts, cluster count
   - Loading state during resolution

2. `apps/todox/src/app/knowledge-demo/components/ClusterList.tsx`
   - "use client" directive
   - Expandable accordion groups
   - Shows canonical entity and aliases
   - Confidence score for cluster

3. `apps/todox/src/app/knowledge-demo/components/SameAsLinkTable.tsx`
   - "use client" directive
   - Table: Canonical | Alias | Confidence | Reason
   - Sort by confidence
   - Filter by entity type

4. `apps/todox/src/app/knowledge-demo/components/ExtractionHistory.tsx`
   - "use client" directive
   - List of previous extractions
   - Shows email source, entity count, timestamp
   - Select/deselect for resolution

5. `apps/todox/src/app/knowledge-demo/actions.ts` (extend)
   - Add resolveEntities server action
   - Uses EntityResolutionService from @beep/knowledge-server

### Multi-Extraction State Management

```typescript
// In KnowledgeDemoClient.tsx
interface ExtractionHistoryItem {
  id: string;
  emailKey: string;
  timestamp: Date;
  graph: KnowledgeGraph;
  stats: ExtractionStats;
}

const [extractionHistory, setExtractionHistory] = React.useState<ExtractionHistoryItem[]>([]);
const [resolutionResult, setResolutionResult] = React.useState<ResolutionResult | null>(null);

const handleExtract = async () => {
  // ... extraction logic
  setExtractionHistory((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      emailKey: selectedEmailKey,
      timestamp: new Date(),
      graph: result.graph,
      stats: result.stats,
    },
  ]);
};
```

### Entity Resolution Action

```typescript
// Add to actions.ts
import { EntityResolutionService } from "@beep/knowledge-server/EntityResolution";

export async function resolveEntities(
  graphs: readonly KnowledgeGraph[]
): Promise<ResolutionResult> {
  const program = Effect.gen(function* () {
    const service = yield* EntityResolutionService;
    // Collect all entities from all graphs
    const allEntities = A.flatMap(graphs, (g) => g.entities);
    return yield* service.resolve(allEntities);
  });

  return Effect.runPromise(program.pipe(Effect.provide(DemoLive)));
}
```

### Resolution Result Types

```typescript
interface ResolutionResult {
  clusters: readonly EntityCluster[];
  sameAsLinks: readonly SameAsLink[];
  stats: {
    originalCount: number;
    resolvedCount: number;
    clusterCount: number;
    mergeCount: number;
  };
}

interface EntityCluster {
  id: string;
  canonicalEntity: Entity.Model;
  members: readonly Entity.Model[];
  confidence: number;
}

interface SameAsLink {
  canonicalId: string;
  aliasId: string;
  confidence: number;
  reason: string;  // e.g., "Name similarity: 0.92"
}
```

### Cluster Visualization Pattern

```typescript
function ClusterList({ clusters }: { clusters: readonly EntityCluster[] }) {
  return (
    <Accordion type="multiple" className="space-y-2">
      {clusters.map((cluster) => (
        <AccordionItem key={cluster.id} value={cluster.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium">{cluster.canonicalEntity.mention}</span>
              <Badge variant="outline">{cluster.members.length} members</Badge>
              <span className="text-sm text-muted-foreground">
                {(cluster.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pl-4">
              {cluster.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 text-sm">
                  <span>{member.mention}</span>
                  {member.id === cluster.canonicalEntity.id && (
                    <Badge variant="secondary">Canonical</Badge>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

### Expected Resolution Results (from sample data)

| Canonical Entity | Aliases | Cluster Size |
|------------------|---------|--------------|
| John Smith | J. Smith, John | 3 |
| Sarah Chen | Sarah | 2 |
| Mike Wilson | Mike | 2 |
| Alex Rodriguez | Alex | 2 |
| Lisa Park | Lisa | 2 |

### Verification

```bash
bun run check --filter @beep/todox
# Test: Extract from 3+ emails
# Test: Resolve shows merged counts
# Test: Clusters display correctly
# Test: SameAs links show reasoning
```

### Success Criteria

- [ ] Multiple extractions stored in history
- [ ] "Resolve Entities" button appears after 2+ extractions
- [ ] Resolution stats show original vs resolved counts
- [ ] Clusters displayed in expandable list
- [ ] SameAs links show confidence and reasoning
```

### Secondary Agent: test-writer

```markdown
## Task: Create Tests for Entity Resolution Components

Create tests for Phase 4 components.

### Test Files to Create

1. `apps/todox/src/app/knowledge-demo/components/__tests__/EntityResolutionPanel.test.tsx`
2. `apps/todox/src/app/knowledge-demo/components/__tests__/ClusterList.test.tsx`

### Test Patterns

```typescript
import { describe, it, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClusterList } from "../ClusterList";

describe("ClusterList", () => {
  const mockClusters = [
    {
      id: "cluster_1",
      canonicalEntity: {
        id: "entity_1",
        mention: "John Smith",
        types: ["schema:Person"],
      },
      members: [
        { id: "entity_1", mention: "John Smith", types: ["schema:Person"] },
        { id: "entity_2", mention: "J. Smith", types: ["schema:Person"] },
        { id: "entity_3", mention: "John", types: ["schema:Person"] },
      ],
      confidence: 0.95,
    },
  ];

  it("displays cluster with member count", () => {
    render(<ClusterList clusters={mockClusters} />);

    expect(screen.getByText("John Smith")).toBeTruthy();
    expect(screen.getByText("3 members")).toBeTruthy();
  });

  it("expands to show all members", () => {
    render(<ClusterList clusters={mockClusters} />);

    // Click to expand
    fireEvent.click(screen.getByText("John Smith"));

    expect(screen.getByText("J. Smith")).toBeTruthy();
    expect(screen.getByText("John")).toBeTruthy();
  });

  it("marks canonical entity", () => {
    render(<ClusterList clusters={mockClusters} />);
    fireEvent.click(screen.getByText("John Smith"));

    expect(screen.getByText("Canonical")).toBeTruthy();
  });
});
```

### Verification

```bash
bun run test --filter @beep/todox
```
```

---

## Phase 5: Polish & Integration

### Primary Agent: code-reviewer

```markdown
## Task: Review Knowledge Demo Implementation

Conduct a comprehensive review of the knowledge-demo implementation.

### Review Areas

#### 1. Effect Patterns Compliance

Check all files for:
- [ ] Namespace imports (`import * as Effect from "effect/Effect"`)
- [ ] Single-letter aliases for common modules (`A`, `O`, `S`)
- [ ] No native array methods (use Effect/Array)
- [ ] Effect.gen for async operations (no async/await in Effect)
- [ ] Proper error handling with TaggedError

#### 2. Path Alias Usage

- [ ] All imports use `@beep/*` aliases
- [ ] No relative imports crossing package boundaries
- [ ] Correct package references

#### 3. Component Quality

- [ ] "use client" directives where needed
- [ ] Proper TypeScript types (no `any`)
- [ ] Consistent prop interfaces
- [ ] Loading and error states
- [ ] Accessibility (aria labels, keyboard navigation)

#### 4. UI Consistency

- [ ] Uses @beep/ui components consistently
- [ ] Consistent spacing (Tailwind classes)
- [ ] Responsive design
- [ ] Dark mode support (if applicable)

#### 5. Server Action Safety

- [ ] Server actions have "use server" directive
- [ ] Proper input validation
- [ ] Error handling and serialization
- [ ] No sensitive data exposure

### Output Format

Create `outputs/p5-code-review.md` with:

```markdown
# Phase 5 Code Review

## Summary
- Files reviewed: X
- Issues found: Y
- Critical issues: Z

## Effect Patterns
| File | Issue | Severity | Line |
|------|-------|----------|------|
| ... | ... | ... | ... |

## Path Aliases
| File | Issue | Correct Import |
|------|-------|----------------|
| ... | ... | ... |

## Component Issues
...

## Recommendations
1. ...
2. ...

## Verification Commands
...
```
```

### Secondary Agent: doc-writer

```markdown
## Task: Create Demo Documentation

Create documentation for the knowledge graph demo.

### Files to Create

1. `apps/todox/src/app/knowledge-demo/README.md`
   - Overview of the demo page
   - How to use each feature
   - Sample data explanation
   - Troubleshooting

2. `apps/todox/src/app/knowledge-demo/components/README.md`
   - Component inventory
   - Props documentation
   - Usage examples

### README.md Template

```markdown
# Knowledge Graph Demo

Interactive demonstration of knowledge extraction and retrieval capabilities.

## Features

### 1. Email Input
Paste email text or select from sample emails to extract knowledge.

### 2. Entity Extraction
View extracted entities with:
- Ontology types (Person, Organization, Project, etc.)
- Confidence scores
- Evidence spans from source text

### 3. Relation Visualization
Explore relationships between entities:
- Subject-predicate-object triples
- Evidence highlighting
- Filter by predicate type

### 4. GraphRAG Queries
Ask natural language questions:
- k-NN similarity search
- Multi-hop graph traversal
- Formatted context for LLM

### 5. Entity Resolution
See deduplication across multiple extractions:
- Cluster visualization
- SameAs links with reasoning
- Before/after statistics

## Sample Data

The demo includes 5 sample emails demonstrating:
- Entity overlap across documents
- Name variations (John Smith, J. Smith, John)
- Multiple entity types
- Various relationship predicates

## Troubleshooting

### Extraction fails
- Check that the knowledge server is running
- Verify LLM API key is configured

### No entities extracted
- Ensure email text is not empty
- Check ontology covers expected entity types

### GraphRAG returns no results
- Extract at least one email first
- Try simpler queries
```

### Component Documentation

Document each component with:
- Purpose
- Props interface
- Usage example
- Dependencies
```

---

## Cross-Phase Agents

### reflector: Phase Synthesis

```markdown
## Task: Analyze Phase Learnings

Synthesize learnings from the completed phase.

### Input

- Current REFLECTION_LOG.md entries
- Phase implementation artifacts
- Any issues encountered

### Analysis Areas

1. **What Worked Well**
   - Effective patterns discovered
   - Smooth integrations
   - Time-saving approaches

2. **What Was Challenging**
   - Unexpected issues
   - Documentation gaps
   - Integration difficulties

3. **Pattern Candidates**
   - Reusable approaches
   - Worth promoting to skills
   - Scoring against quality rubric

4. **Next Phase Improvements**
   - Prompt refinements needed
   - Process changes
   - Research gaps

### Output Format

Update `REFLECTION_LOG.md`:

```markdown
## Phase [N]: [Name]

**Date**: YYYY-MM-DD

### What Worked
- Pattern 1: [description]
- Pattern 2: [description]

### What Could Improve
- Issue 1: [description] -> [solution]
- Issue 2: [description] -> [solution]

### Pattern Candidates

| Pattern | Score | Description |
|---------|-------|-------------|
| Server action with Effect | 75 | Clean integration of Effect in Next.js server actions |
| Evidence highlighting | 70 | Character offset highlighting in React |

### Key Decisions
1. [Decision]: [Rationale]
2. [Decision]: [Rationale]

### Handoff Notes for Next Phase
- [Note 1]
- [Note 2]
```
```

### Handoff Writer: Phase Transition

```markdown
## Task: Create Handoff Documents

Create BOTH files for the next phase transition.

### HANDOFF_P[N+1].md

Full context document containing:

1. **Previous Phase Summary**
   - What was accomplished
   - Files created/modified
   - Key patterns established

2. **Phase [N+1] Objectives**
   - Main goals
   - Task list

3. **Files to Create**
   - Full paths
   - Purpose
   - Implementation notes

4. **Files to Modify**
   - Full paths
   - What changes needed

5. **Critical Patterns**
   - Code examples
   - Gotchas to avoid

6. **Verification**
   - Commands to run
   - Expected outcomes

7. **Success Criteria**
   - Checklist items

### P[N+1]_ORCHESTRATOR_PROMPT.md

Concise, copy-paste ready prompt:

```markdown
# Phase [N+1] Orchestrator Prompt

You are implementing Phase [N+1] of the Knowledge Graph POC Demo spec.

## Context
[1-2 sentences on what was completed]

## Mission
[What this phase accomplishes]

## Tasks
1. [Task with agent to delegate to]
2. [Task with agent to delegate to]

## Critical Patterns
[Key code patterns with examples]

## Reference Files
- specs/knowledge-graph-poc-demo/README.md
- specs/knowledge-graph-poc-demo/sample-data/emails.md
- specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P[N+1].md

## Verification
[Commands to run]

## Success Criteria
- [ ] [Item 1]
- [ ] [Item 2]
```
```

---

## Usage Notes

### Launching Agents

Use the Task tool with appropriate subagent_type:

```
Task tool:
  subagent_type: "effect-code-writer"
  prompt: [paste prompt from above]
```

### Agent Output Handling

| Agent Type | Handle Output |
|------------|---------------|
| `codebase-researcher` | Review findings, inform implementation |
| `mcp-researcher` | Extract API patterns for implementation |
| `effect-code-writer` | Verify files created, run type check |
| `test-writer` | Run tests, verify coverage |
| `code-reviewer` | Address issues in `outputs/` |
| `doc-writer` | Review generated documentation |

### Parallel Execution Rules

**Safe to parallelize:**
- `codebase-researcher` + `mcp-researcher` + `web-researcher`
- Multiple `test-writer` tasks (different files)

**Must be sequential:**
- `effect-code-writer` BEFORE `test-writer`
- Implementation BEFORE `code-reviewer`
- All phases BEFORE `doc-writer` (final docs)

### Sample Data Reference

All sample emails and expected extraction results are in:
```
specs/knowledge-graph-poc-demo/sample-data/emails.md
```

Key entities across all emails:
- **People**: John Smith, Sarah Chen, Mike Wilson, Alex Rodriguez, Lisa Park
- **Organizations**: Acme Corp, Engineering team, Platform team
- **Projects**: Q4 Release, Budget Review
- **Meetings**: Project Sync, Tech Review, Leadership Meeting, Board Meeting

### Service Layer Reference

Services from `@beep/knowledge-server`:

| Service | Import Path | Purpose |
|---------|-------------|---------|
| `ExtractionPipeline` | `@beep/knowledge-server/Extraction` | Extract entities/relations |
| `GraphRAGService` | `@beep/knowledge-server/GraphRAG` | Query knowledge graph |
| `EntityResolutionService` | `@beep/knowledge-server/EntityResolution` | Deduplicate entities |
| `EmbeddingService` | `@beep/knowledge-server/Embedding` | Vector embeddings |
| `OntologyService` | `@beep/knowledge-server/Ontology` | OWL class hierarchy |
| `GroundingService` | `@beep/knowledge-server/Grounding` | Ontology grounding |

### Output Locations

| Type | Location |
|------|----------|
| Phase outputs | `specs/knowledge-graph-poc-demo/outputs/` |
| Handoffs | `specs/knowledge-graph-poc-demo/handoffs/` |
| Demo components | `apps/todox/src/app/knowledge-demo/components/` |
| Server actions | `apps/todox/src/app/knowledge-demo/actions.ts` |
| Sample data | `apps/todox/src/app/knowledge-demo/data/sample-emails.ts` |

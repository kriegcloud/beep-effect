# Codex Prompt: Codebase Knowledge Graph Explorer — Next.js Integration

## Objective

Build an interactive codebase knowledge graph visualization page in `apps/web` (Next.js) that renders the output of our ts-morph-based graph extractor. The visualization is a force-directed D3 graph with filtering, search, hover highlighting, click-to-inspect, and a depth slider for controlling detail level. The graph data comes from a JSON file produced by the extractor, served via an API route that reads from the local cache.

## Context

We have a TypeScript monorepo (`beep-effect3`) using Turborepo, Effect-TS, and pnpm workspaces. We've built a ts-morph extractor (`extract-graph-v2.ts`) that parses the full codebase and outputs a JSON graph with typed nodes and edges. The existing `bun run beep kg index` command (in `tooling/cli/src/commands/kg.ts`) handles indexing. We want to visualize this graph in our Next.js app.

## Graph Data Schema

The extractor outputs JSON matching this TypeScript interface:

```typescript
type NodeKind =
  | "package" | "file" | "namespace" | "class" | "interface"
  | "type_alias" | "enum" | "enum_member" | "function" | "method"
  | "constructor" | "getter" | "setter" | "property" | "parameter"
  | "variable" | "decorator" | "jsx_component" | "module_declaration";

type EdgeKind =
  | "imports" | "re_exports" | "exports" | "calls" | "conditional_calls"
  | "instantiates" | "extends" | "implements" | "overrides"
  | "contains" | "has_method" | "has_constructor" | "has_property"
  | "has_getter" | "has_setter" | "has_parameter" | "has_member"
  | "type_reference" | "return_type" | "generic_constraint"
  | "reads_property" | "writes_property" | "decorates" | "throws"
  | "test_covers" | "uses_type";

interface GraphNode {
  id: string;        // e.g. "class::src/services/user-service.ts::UserService"
  label: string;     // e.g. "UserService"
  kind: NodeKind;
  filePath: string;  // relative path
  line: number;
  endLine: number;
  exported: boolean;
  meta?: Record<string, unknown>;  // kind-specific metadata
}

interface GraphEdge {
  source: string;    // node id
  target: string;    // node id
  kind: EdgeKind;
  label?: string;
  meta?: Record<string, unknown>;
}

interface CodebaseGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: {
    extractedAt: string;
    fileCount: number;
    nodeCount: number;
    edgeCount: number;
    rootDir: string;
    nodeKinds: Record<string, number>;
    edgeKinds: Record<string, number>;
  };
}
```

A sample graph for a small project has ~114 nodes and ~205 edges. A full monorepo graph could have 5,000-15,000 nodes and 20,000-60,000 edges.

## Architecture

### File Structure

```
apps/web/
  src/
    app/
      kg/                              # Route group for knowledge graph
        page.tsx                       # Main page — server component
        layout.tsx                     # Layout with metadata
    components/
      kg/
        GraphExplorer.tsx              # Main client component — orchestrates everything
        GraphCanvas.tsx                # D3 force simulation + SVG rendering
        FilterPanel.tsx                # Node/edge kind toggle filters
        DepthSlider.tsx                # Detail level control (1-5)
        SearchBar.tsx                  # Symbol search with / hotkey
        NodeInspector.tsx              # Click-to-inspect detail panel
        StatsBar.tsx                   # Bottom-left node/edge counts
        UploadOverlay.tsx              # Initial upload/load screen
        graph-config.ts                # Color maps, size maps, edge groups, depth presets
    lib/
      kg/
        types.ts                       # GraphNode, GraphEdge, CodebaseGraph types
        loader.ts                      # Functions to load graph from API or file upload
    api/
      kg/
        graph/
          route.ts                     # GET — returns the latest cached graph JSON
        index/
          route.ts                     # POST — triggers re-index (calls extract-graph)
```

### Component Architecture

```
page.tsx (server)
  └─ GraphExplorer.tsx (client, "use client")
       ├─ UploadOverlay.tsx          — shown when no graph loaded
       ├─ GraphCanvas.tsx            — D3 force sim, SVG, zoom/pan
       │    ├─ <line> elements       — edges with color/opacity/markers per kind
       │    ├─ <circle> elements     — nodes with color/size per kind
       │    └─ <text> elements       — labels
       ├─ FilterPanel.tsx            — left sidebar with node/edge toggles
       │    ├─ DepthSlider.tsx       — quick detail level control
       │    ├─ Node kind filters     — colored dots + labels + counts
       │    └─ Edge kind filters     — grouped by category
       ├─ SearchBar.tsx              — top-right, / hotkey, Esc to clear
       ├─ NodeInspector.tsx          — bottom-right panel on node click
       └─ StatsBar.tsx               — bottom-left visible/total counts
```

## Design Specifications

### Visual Design

Use a dark theme matching this palette:

```typescript
// graph-config.ts
export const theme = {
  bg: '#08090d',
  surface: '#101318',
  surface2: '#181c24',
  border: '#232a38',
  borderAccent: '#2e3a4e',
  text: '#bec8d8',
  textMuted: '#5c687e',
  accent: '#4c9aff',
};
```

Use `JetBrains Mono` for all code/technical text, `DM Sans` for UI labels.

### Node Colors & Sizes

```typescript
export const nodeColors: Record<NodeKind, string> = {
  package: '#ff9f43',
  file: '#e77f34',
  namespace: '#d4a055',
  class: '#c07cf8',
  interface: '#4c9aff',
  type_alias: '#36c5d0',
  enum: '#f76ea3',
  enum_member: '#e8619a',
  function: '#3dbd5d',
  method: '#6fe09a',
  constructor: '#a78bfa',
  getter: '#5cd8a0',
  setter: '#4bc88e',
  property: '#8aa0c0',
  parameter: '#637590',
  variable: '#cba6ff',
  decorator: '#fbbf24',
  jsx_component: '#61dafb',
  module_declaration: '#cc8844',
};

export const nodeRadii: Record<NodeKind, number> = {
  package: 12, file: 8, namespace: 7,
  class: 7, interface: 6, type_alias: 5, enum: 5, enum_member: 3,
  function: 5, method: 4, constructor: 5, getter: 4, setter: 4,
  property: 3, parameter: 2.5, variable: 4, decorator: 3.5,
  jsx_component: 6, module_declaration: 6,
};
```

### Edge Colors, Opacity & Grouping

```typescript
export const edgeColors: Record<EdgeKind, string> = {
  imports: '#4c9aff',
  re_exports: '#e77f34',
  exports: '#e77f34',
  calls: '#f09030',
  conditional_calls: '#f0903088',
  instantiates: '#c07cf8',
  extends: '#c07cf8',
  implements: '#36c5d0',
  overrides: '#a78bfa',
  contains: '#ffffff',
  has_method: '#ffffff',
  has_constructor: '#ffffff',
  has_property: '#ffffff',
  has_getter: '#ffffff',
  has_setter: '#ffffff',
  has_parameter: '#ffffff',
  has_member: '#ffffff',
  type_reference: '#36c5d0',
  return_type: '#3dbd5d',
  generic_constraint: '#f76ea3',
  reads_property: '#8aa0c0',
  writes_property: '#ff6b6b',
  decorates: '#fbbf24',
  throws: '#ff6b6b',
  test_covers: '#3dbd5d',
  uses_type: '#36c5d0',
};

export const edgeOpacity: Record<EdgeKind, number> = {
  imports: 0.25, re_exports: 0.3, exports: 0.2,
  calls: 0.4, conditional_calls: 0.3, instantiates: 0.45,
  extends: 0.5, implements: 0.45, overrides: 0.4,
  contains: 0.04, has_method: 0.04, has_constructor: 0.04,
  has_property: 0.04, has_getter: 0.04, has_setter: 0.04,
  has_parameter: 0.03, has_member: 0.04,
  type_reference: 0.2, return_type: 0.2, generic_constraint: 0.35,
  reads_property: 0.25, writes_property: 0.3,
  decorates: 0.4, throws: 0.35, test_covers: 0.2,
  uses_type: 0.2,
};

// Group edges by category for the filter panel legend
export const edgeGroups: Record<string, EdgeKind[]> = {
  'Structure': ['contains','has_method','has_constructor','has_property','has_getter','has_setter','has_parameter','has_member'],
  'Dependencies': ['imports','re_exports','exports'],
  'Invocation': ['calls','conditional_calls','instantiates'],
  'Inheritance': ['extends','implements','overrides'],
  'Types': ['type_reference','return_type','generic_constraint','uses_type'],
  'Access': ['reads_property','writes_property'],
  'Other': ['decorates','throws','test_covers'],
};
```

### Depth Slider Presets

The depth slider (1-5) controls which node kinds are visible. This is the primary UX for managing visual complexity:

```typescript
export const depthPresets: (NodeKind[] | null)[] = [
  [],  // unused (1-indexed)
  ['package', 'file'],
  ['package', 'file', 'class', 'interface', 'function', 'enum', 'jsx_component', 'variable', 'namespace', 'module_declaration'],
  ['package', 'file', 'class', 'interface', 'function', 'enum', 'jsx_component', 'variable', 'namespace', 'module_declaration', 'method', 'constructor', 'type_alias', 'getter', 'setter', 'decorator'],
  ['package', 'file', 'class', 'interface', 'function', 'enum', 'jsx_component', 'variable', 'namespace', 'module_declaration', 'method', 'constructor', 'type_alias', 'getter', 'setter', 'decorator', 'property', 'enum_member'],
  null, // show everything
];

export const depthLabels = ['', 'Files only', 'Symbols', 'Balanced', 'Detailed', 'Everything'];
```

Default depth should be 3 ("Balanced").

### D3 Force Simulation Configuration

```typescript
// Force link configuration
const linkForce = d3.forceLink(edges)
  .id(d => d.id)
  .distance(d => {
    if (isStructural(d.kind)) return d.kind === 'has_parameter' ? 20 : 25;
    if (d.kind === 'calls' || d.kind === 'conditional_calls') return 90;
    if (d.kind === 'extends' || d.kind === 'implements') return 50;
    return 100;
  })
  .strength(d => {
    if (isStructural(d.kind)) return d.kind === 'has_parameter' ? 0.9 : 0.7;
    if (d.kind === 'extends' || d.kind === 'implements') return 0.4;
    return 0.1;
  });

// Charge force — repulsion varies by kind
const chargeForce = d3.forceManyBody()
  .strength(d => {
    if (d.kind === 'package') return -500;
    if (d.kind === 'file') return -200;
    if (d.kind === 'parameter' || d.kind === 'enum_member') return -10;
    if (d.kind === 'property') return -20;
    return -60;
  });

// Center + collision
d3.forceCenter(width / 2, height / 2);
d3.forceCollide().radius(d => nodeRadii[d.kind] + 2);
```

Structural edges (`contains`, `has_method`, `has_constructor`, `has_property`, etc.) use strong short-distance forces to cluster child symbols near their parent. Cross-cutting edges (`calls`, `imports`, `type_reference`) use weak long-distance forces.

### Interaction Behaviors

1. **Hover on node**: Highlight the node and all its 1-hop neighbors. Dim everything else to 0.05 opacity. Edges connected to the hovered node get opacity 0.7 and stroke-width 2.

2. **Click on node**: Open the NodeInspector panel showing:
   - Kind badge (colored)
   - Symbol name (large, white)
   - File path + line number
   - All metadata key/value pairs from `meta`
   - Inbound edges list (max 10, with "...+N more" overflow)
   - Outbound edges list (max 10, with "...+N more" overflow)
   - Each edge shows a colored kind badge + connected node label

3. **Click on empty SVG**: Close the NodeInspector panel.

4. **Search (/ hotkey)**: Focus the search input. Matching nodes stay at full opacity, non-matching dim to 0.05. Esc clears search and blurs input.

5. **Drag nodes**: Standard D3 drag behavior — pin node on drag start, release on drag end.

6. **Zoom/pan**: D3 zoom with scale extent [0.05, 8].

7. **Auto-fit on load**: After 2.5s of simulation, compute bounding box and transition-zoom to fit the graph with 80% scale factor.

### Edge Rendering Details

- Structural edges (`contains`, `has_*`): Render as thin (0.3px) lines with NO arrowheads. These are visual clustering aids, not directional relationships.
- `conditional_calls`: Dashed line (`stroke-dasharray: 4,3`)
- `throws`: Dashed line (`stroke-dasharray: 2,2`)
- All other edges: Render with small arrowhead markers (viewBox `0 -4 8 8`, path `M0,-4L8,0L0,4`, markerWidth/Height 3.5, refX 16)
- Arrow markers colored per edge kind

### Filter Panel

Left sidebar, scrollable, with these sections:

1. **Title bar**: "Codebase Graph" + "{nodeCount} nodes · {edgeCount} edges"
2. **Depth Slider**: Range input 1-5, labels "Files" / current preset name / "All"
3. **Node Filters**: One row per node kind present in the graph. Each row has:
   - Colored dot (8px circle, matches node color)
   - Kind label (replace underscores with spaces)
   - Count (right-aligned)
   - Click toggles visibility (dot dims to 0.12 opacity, label to 0.25 when off)
4. **Edge Filters**: Grouped by category (Structure, Dependencies, Invocation, Inheritance, Types, Access, Other). Each group has a section label. Each row has:
   - Colored line (14px wide, 2px tall; dashed for structural edges)
   - Kind label
   - Count
   - Click toggles visibility

When depth slider changes, it overrides node filter state. Individual filter clicks still work independently after that.

## Performance Requirements

For large graphs (10K+ nodes):
- Use D3's force simulation with `alphaDecay(0.02)` to converge faster
- Only render labels for nodes within the current viewport (check against SVG transform)
- Consider WebGL rendering via `d3-force` + `pixi.js` if D3 SVG becomes too slow — but start with SVG
- Debounce filter changes by 16ms (one frame)
- Use `requestAnimationFrame` for simulation ticks, not D3's default timer

## API Routes

### GET /api/kg/graph

Returns the latest cached graph JSON. Reads from `tooling/ast-kg/.cache/snapshots/` to reconstruct the full graph, or from a pre-built `codebase-graph.json` in the cache directory.

```typescript
// apps/web/src/app/api/kg/graph/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  // Read from the cache location where the extractor writes
  const cachePath = join(process.cwd(), '../../tooling/ast-kg/.cache/codebase-graph.json');
  try {
    const data = await readFile(cachePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'No graph available. Run: bun run beep kg index --mode full' }, { status: 404 });
  }
}
```

### POST /api/kg/index (optional, stretch goal)

Triggers a re-index by spawning the extractor process. This is a stretch goal — the primary workflow is running the CLI separately.

## Testing

Write component tests for:
- `FilterPanel` renders correct counts and toggles visibility
- `DepthSlider` updates visible node kinds correctly
- `SearchBar` filters nodes by label substring match
- `NodeInspector` displays correct metadata and edge lists
- `graph-config.ts` has entries for every NodeKind and EdgeKind

## Implementation Notes

- Use `"use client"` for all interactive components. The page.tsx server component just renders the client boundary.
- D3 should be used for force simulation and zoom/pan. React manages the DOM for filter panel, inspector, search, etc. The SVG rendering can be either:
  - (A) D3 manages SVG elements directly via refs (simpler, matches the reference implementation)
  - (B) React renders SVG elements from D3 simulation state (more React-idiomatic but trickier with force sim)
  - Recommend approach (A) for the initial implementation since it matches the working reference exactly.
- Import D3 as `import * as d3 from 'd3'` — it's tree-shakeable.
- The graph data flow: `page.tsx` → `GraphExplorer` fetches from `/api/kg/graph` on mount OR accepts file upload → passes `CodebaseGraph` to `GraphCanvas` → D3 renders.
- All style values should use CSS custom properties matching the theme object for consistency.
- Font imports: Add Google Fonts for JetBrains Mono and DM Sans in layout.tsx or via next/font.

## Reference

The working reference implementation is in `visualize-v2.html` — a single-file D3 visualization that implements all of the above in ~500 lines. The Codex agent should decompose this into the React component architecture described above while preserving all visual and interaction behaviors exactly.

## Acceptance Criteria

1. Navigating to `/kg` shows either the upload overlay (if no cached graph) or the graph visualization
2. All 19 node kinds render with correct colors and sizes
3. All 26 edge kinds render with correct colors, opacity, and arrow markers
4. Depth slider transitions between 5 detail levels smoothly
5. Node/edge filter toggles work independently
6. Hover highlights 1-hop neighborhood
7. Click opens inspector with metadata + edge lists
8. Search filters by label with `/` hotkey and `Esc` to clear
9. Zoom/pan works smoothly
10. Auto-fit zoom after initial simulation settles
11. Works with the sample graph (114 nodes, 205 edges) and scales to 5K+ nodes without freezing

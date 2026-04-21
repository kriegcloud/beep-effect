# UI Architecture

## Thesis

The knowledge workspace UI is a three-zone resizable layout that composes existing primitives -- Cytoscape graph rendering, Lexical editing, resizable panels, sidebar navigation -- into a unified surface. The architecture decomposes the existing 1831-line `RepoMemoryDesktop.tsx` monolith into focused components with clear boundaries.

All state flows through Effect Atoms. All services are `Context.Service` classes provided via `Layer` to an `Atom.runtime`. React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef` for state) are banned. The UI toolkit is shadcn v3 base-nova with `@base-ui/react` primitives and `@phosphor-icons/react`. Interop with `@mui-treasury` registry components enables pigment-css alongside Tailwind v4 oklch.

This document specifies the layout structure, frontend service architecture, runtime construction, graph rendering strategy, state management, detail panel design, query visualization, navigation, and the decomposition plan.

## 1. Layout: Three-Zone Resizable Shell

```
+-------------------------------------------------------------------+
| Titlebar (breadcrumb / mode: Graph | Editor | Split)              |
+------+--------------------------------------------+---------------+
|      |                                            |               |
| NAV  |         PRIMARY CANVAS                     |  DETAIL       |
|      |         (Graph | Editor | Split)           |  PANEL        |
| Repos|                                            |               |
| Pages|                                            | Node detail   |
|      |                                            | Backlinks     |
|      |                                            | Citations     |
|      |                                            |               |
|      |--------------------------------------------| Query stage   |
|      |  QUERY DRAWER (slides up)                  | trace         |
|      |  Input / Stream events / Stage trace       |               |
+------+--------------------------------------------+---------------+
```

### Primitives

| Zone             | Component                | Source                                          |
|------------------|--------------------------|-------------------------------------------------|
| Outer shell      | `ResizablePanelGroup`    | `@beep/ui` resizable components (`react-resizable-panels`) |
| Navigation       | `SidebarProvider` + `Sidebar` | `@beep/ui` sidebar components (base-nova)  |
| Panel dividers   | `ResizableHandle`        | `@beep/ui` resizable components                 |
| Mode tabs        | `Tabs` / `TabsList`      | `@beep/ui` tabs components                      |
| Breadcrumb       | `Breadcrumb`             | `@beep/ui` breadcrumb components                |
| Command palette  | `Command`                | `@beep/ui` command components                   |
| Icons            | `@phosphor-icons/react`  | Phosphor icon library (project standard)        |
| Extended widgets | `@mui-treasury` registry | pigment-css interop for complex layout widgets  |

### Panel sizing defaults

| Panel      | Default | Min  | Max  | Collapsible |
|------------|---------|------|------|-------------|
| Navigation | 240px   | 180px | 400px | Yes (collapse to icon rail) |
| Canvas     | flex    | 400px | none | No          |
| Detail     | 320px   | 240px | 500px | Yes (collapse to hidden) |

### Navigation sidebar

The sidebar has two sections, toggled by tabs at the top:

**Repos tab:**
- List of registered repos (from sidecar connection).
- Each repo expands to show a tree: files and nested symbols.
- File nodes show `@phosphor-icons/react` icon by extension. Symbol nodes show icon by kind (function, class, type, const).
- Click a file or symbol: focus it in the graph canvas and open its detail in the detail panel.
- Search input at top filters the tree.

**Pages tab:**
- List of knowledge documents (markdown pages from the vault).
- Flat list with search input.
- Shows page title, last modified date, outbound link count.
- Click a page: open it in the editor canvas and highlight its node in the graph.
- "New Page" button at top (Phosphor `PlusIcon`).

## 2. Frontend Service Architecture

Every capability the workspace UI needs is modeled as a `Context.Service` class with an implementation `Layer`. Services are never instantiated manually. React components never call `Effect.runSync`, `Effect.runPromise`, or `Effect.runFork` -- atoms handle execution.

### Service inventory

| Service              | Responsibility                                         |
|----------------------|--------------------------------------------------------|
| `CytoscapeService`   | Graph instance lifecycle, layout, animation, style switching |
| `KnowledgeGraphApi`  | Graph data fetching: nodes, edges, search (frontend RPC client wrapping the backend `KnowledgeGraph` facade) |
| `EventStreamService` | Live graph event subscription, replay cursor           |
| `EditorService`      | Lexical editor session, page load/save                 |
| `SidecarConnection`  | Health check, reconnect, base URL management           |

### Canonical service definition

```ts
const $I = $KnowledgeWorkspaceId.create("ui/CytoscapeService")

/**
 * Graph rendering lifecycle service.
 *
 * @since 0.1.0
 * @category services
 */
class CytoscapeService extends Context.Service<CytoscapeService, {
  /**
   * Initialize a Cytoscape instance on the given container element.
   *
   * @since 0.1.0
   * @category lifecycle
   */
  readonly initialize: (
    container: HTMLDivElement
  ) => Effect.Effect<void>

  /**
   * Destroy the current instance and release canvas resources.
   *
   * @since 0.1.0
   * @category lifecycle
   */
  readonly destroy: Effect.Effect<void>

  /**
   * Diff-apply elements without recreating the instance.
   *
   * @since 0.1.0
   * @category rendering
   */
  readonly applyElements: (
    elements: ReadonlyArray<ElementDefinition>
  ) => Effect.Effect<void>

  /**
   * Run a layout algorithm. Auto-selects by node count when
   * `options` is omitted.
   *
   * @since 0.1.0
   * @category layout
   */
  readonly runLayout: (
    options: undefined | LayoutOptions
  ) => Effect.Effect<void>

  /**
   * Switch stylesheet between `graphStyles` and `graphStylesFast`
   * based on node count threshold.
   *
   * @since 0.1.0
   * @category rendering
   */
  readonly switchStylesheet: (
    nodeCount: number
  ) => Effect.Effect<void>

  /**
   * Animate an element by ID.
   *
   * @since 0.1.0
   * @category animation
   */
  readonly animateElement: (
    id: string,
    style: Record<string, unknown>,
    duration: number
  ) => Effect.Effect<void>

  /**
   * Apply a CSS class to elements for temporal animation.
   *
   * @since 0.1.0
   * @category animation
   */
  readonly applyClass: (
    selector: string,
    className: string,
    durationMs: number
  ) => Effect.Effect<void>

  /**
   * Fit the viewport to all elements.
   *
   * @since 0.1.0
   * @category viewport
   */
  readonly fit: Effect.Effect<void>

  /**
   * Export the canvas as a PNG data URL.
   *
   * @since 0.1.0
   * @category export
   */
  readonly exportPng: Effect.Effect<string>

  /**
   * Subscribe to graph interaction events.
   *
   * @since 0.1.0
   * @category events
   */
  readonly onTap: Stream.Stream<CytoscapeEvent>
  readonly onSelect: Stream.Stream<ReadonlyArray<ElementDefinition>>
}>()($I`CytoscapeService`) {}
```

### Layer implementation pattern

```ts
/**
 * Live implementation of CytoscapeService backed by a mutable Cytoscape.Core ref.
 *
 * @since 0.1.0
 * @category layers
 * @example
 *   import { CytoscapeServiceLive } from "@beep/knowledge-workspace-ui/services"
 *
 *   const runtime = Atom.runtime(CytoscapeServiceLive)
 */
const CytoscapeServiceLive = Layer.effect(CytoscapeService, Effect.gen(function*() {
  const cyRef = yield* Ref.make<Option.Option<Core>>(Option.none())

  return CytoscapeService.of({
    initialize: (container) => Effect.gen(function*() {
      const existing = yield* Ref.get(cyRef)
      if (Option.isSome(existing)) yield* Effect.sync(() => existing.value.destroy())
      const cy = yield* Effect.sync(() => cytoscape({ container }))
      yield* Ref.set(cyRef, Option.some(cy))
    }).pipe(Effect.withSpan("CytoscapeService.initialize")),

    destroy: Effect.gen(function*() {
      const current = yield* Ref.get(cyRef)
      if (Option.isSome(current)) {
        yield* Effect.sync(() => current.value.destroy())
        yield* Ref.set(cyRef, Option.none())
      }
    }).pipe(Effect.withSpan("CytoscapeService.destroy")),

    applyElements: (elements) => Effect.gen(function*() {
      const current = yield* Ref.get(cyRef).pipe(Effect.flatMap(Effect.fromOption))
      yield* Effect.sync(() => {
        const cy = current
        const existing = new Set(cy.elements().map((el) => el.id()))
        const incoming = new Set(elements.map((el) => el.data.id))

        // Remove elements no longer present
        cy.elements().forEach((el) => {
          if (!incoming.has(el.id())) el.remove()
        })

        // Add or update
        for (const el of elements) {
          if (existing.has(el.data.id)) {
            cy.getElementById(el.data.id!).data(el.data)
          } else {
            cy.add(el)
          }
        }
      })
    }).pipe(Effect.withSpan("CytoscapeService.applyElements")),

    // ... remaining methods follow the same pattern
  })
}))
```

## 3. WorkspaceRuntime

The `WorkspaceRuntime` is the single `AtomRuntime` that bridges all services into the atom world. It is defined at module scope, never inside a component body.

### Construction

```ts
import { Atom } from "effect/unstable/reactivity"
import { Layer } from "effect"

/**
 * Shared factory with cross-runtime service memoization.
 *
 * @since 0.1.0
 * @category runtime
 */
const factory = Atom.context({ memoMap: Layer.makeMemoMapUnsafe() })

/**
 * Inject logging and tracing into all runtimes created from this factory.
 *
 * @since 0.1.0
 * @category runtime
 */
factory.addGlobalLayer(LoggingLayer)
factory.addGlobalLayer(TracingLayer)

/**
 * The workspace runtime. Provides CytoscapeService, KnowledgeGraphApi,
 * EventStreamService, EditorService, and SidecarConnection to all atoms.
 *
 * @since 0.1.0
 * @category runtime
 * @example
 *   import { workspaceRuntime } from "@beep/knowledge-workspace-ui/runtime"
 *
 *   const nodesAtom = workspaceRuntime.atom(
 *     KnowledgeGraphApi.use((_) => _.listNodes)
 *   )
 */
const workspaceRuntime = factory(
  CytoscapeServiceLive.pipe(
    Layer.merge(KnowledgeGraphApiLive),
    Layer.merge(EventStreamServiceLive),
    Layer.merge(EditorServiceLive),
    Layer.merge(SidecarConnectionLive)
  )
)
```

### Why a factory

The factory pattern (`Atom.context`) provides:

1. **Shared `MemoMap`**: services are instantiated once and shared across all runtimes created from the same factory. If a future feature adds a second runtime (e.g., for an isolated preview pane), services like `SidecarConnection` are not duplicated.
2. **Global layers**: `factory.addGlobalLayer(LoggingLayer)` injects observability into every runtime without passing it to each `Layer.merge` chain.
3. **Reactivity key attachment**: `factory.withReactivity(keys)` can be piped onto any atom for key-based invalidation.

## 4. CytoscapeService

### Why a service, not a hook

The `useCytoscape` hook pattern from the previous spec version is replaced by `CytoscapeService` as a `Context.Service` for these reasons:

| Concern              | Hook (`useCytoscape`)           | Service (`CytoscapeService`)          |
|----------------------|---------------------------------|---------------------------------------|
| Lifecycle            | Tied to component mount/unmount | Managed by `Layer.scoped` + `Scope`   |
| Testability          | Requires rendering a component  | `Layer.succeed` with test double      |
| Access from atoms    | Impossible (hooks are React-only) | `CytoscapeService.use(...)` in any atom |
| Resource cleanup     | `useEffect` return              | `Effect.acquireRelease`               |
| Observability        | Manual                          | `Effect.withSpan` on every operation  |
| Composition          | Ad-hoc ref passing              | Layer composition with other services |

### Layout strategy

| Graph size    | Layout algorithm | Configuration                          |
|---------------|------------------|----------------------------------------|
| < 50 nodes    | `cose`           | Default spring-embedded                |
| 50-300 nodes  | `cose-bilkent`   | Compound-aware, ideal edge length 120  |
| 300+ nodes    | `fcose`          | Fast compound spring embedder          |
| File tree     | `dagre`          | Hierarchical top-down for file trees   |

Layout algorithm is selected automatically by `CytoscapeService.runLayout` based on node count and graph structure. Users can override via the layout selector dropdown in the toolbar.

### Stylesheet switching

When `elements.length > 300`, `CytoscapeService.switchStylesheet` applies `graphStylesFast` (with `min-zoomed-font-size` optimization). Otherwise it applies `graphStyles`. The switch happens dynamically when the threshold is crossed, without destroying the instance.

## 5. Graph Visualization: Cytoscape.js

### Why Cytoscape

| Criterion                   | Cytoscape.js               | D3 (existing)         | react-force-graph-2d  |
|-----------------------------|----------------------------|-----------------------|-----------------------|
| Already in catalog          | Yes (v3.33.2)              | Yes                   | No                    |
| Existing style system       | 948 lines, 17 node types   | None                  | None                  |
| Rendering backend           | Canvas                     | SVG                   | Canvas                |
| Performance at 500+ nodes   | Good (canvas)              | Poor (SVG DOM)        | Good                  |
| Compound nodes              | Built-in                   | Manual                | No                    |
| Batch style selectors       | CSS-like (`.faded`, etc.)  | Manual                | No                    |
| `animate()` API             | Built-in                   | d3-transition         | No                    |
| Performance variant          | `graphStylesFast` exists   | N/A                   | N/A                   |

Decision: Cytoscape is the primary graph renderer. The existing D3 `knowledge-graph.tsx` component remains as a fallback for simple, small, non-interactive graph previews. `react-force-graph-2d` is not adopted -- Cytoscape already covers the use case without adding a new dependency.

### Existing style assets

The 948-line stylesheet in `packages/common/ui/.../codegraph/styles/graph-styles.tsx` already defines:

- 17 node types: `function`, `class`, `interface`, `type-alias`, `enum`, `const`, `variable`, `method`, `property`, `constructor`, `getter`, `setter`, `namespace`, `module`, `file`, `directory`, `unknown`.
- 9 edge types: `IMPORTS`, `EXPORTS`, `EXTENDS`, `IMPLEMENTS`, `CONTAINS`, `CALLS`, `REFERENCES`, `DEPENDS_ON`, `TYPE_OF`.
- Interaction classes: `.search-match`, `.faded`, `.impact-source`, `.impact-target`.
- Performance variant: `graphStylesFast` with `min-zoomed-font-size` for 300+ node graphs.

### New node type: Page

```ts
{
  selector: 'node[kind = "page"]',
  style: {
    shape: "round-rectangle",
    "background-color": "#7c3aed",        // purple -- distinct from code nodes
    label: "data(displayLabel)",
    "font-size": 12,
    "text-wrap": "ellipsis",
    "text-max-width": 120
  }
}
```

### New edge type: `LINKS_TO`

```ts
{
  selector: 'edge[kind = "LINKS_TO"]',
  style: {
    "line-color": "#7c3aed",
    "target-arrow-color": "#7c3aed",
    "curve-style": "bezier",
    "line-style": "solid",
    width: 1.5
  }
}
```

### Certainty-based edge styling

> See `02-real-time-and-replay.md` section "Filters During Replay" for the canonical filter specification.


```ts
// Deterministic edges (certainty = 1.0): solid stroke
{
  selector: 'edge[certainty = 1]',
  style: { "line-style": "solid" }
}

// Inferred edges (certainty < 1.0): dashed stroke, opacity scales with certainty
{
  selector: 'edge[certainty < 1]',
  style: {
    "line-style": "dashed",
    "line-dash-pattern": [6, 3],
    opacity: "mapData(certainty, 0, 1, 0.3, 1)"
  }
}
```

### Temporal animation classes

```ts
{
  selector: ".entering",
  style: {
    "border-width": 3,
    "border-color": "#facc15",           // gold glow
    "border-opacity": 0.8
  }
}

{
  selector: ".exiting",
  style: { opacity: 0.2 }
}

{
  selector: ".highlighting",
  style: {
    "border-width": 2,
    "border-color": "#38bdf8",           // sky blue flash
    "overlay-opacity": 0.1
  }
}

{
  selector: ".live-glow",
  style: {
    "border-width": 4,
    "border-color": "#22c55e",           // green pulse for live events
    "border-opacity": 0.6
  }
}
```

## 6. State Management

All state is managed through Effect Atoms. No `useState`, `useEffect`, `useCallback`, `useMemo`, or `useRef`-for-state.

### State category decision tree

```
Is this state...
  |
  +-- From the server? (graph API, event stream, sidecar)
  |     |
  |     +-- One-shot fetch? --> workspaceRuntime.atom(effect)
  |     +-- Mutation? -------> workspaceRuntime.fn<Arg>()(effect, { reactivityKeys })
  |     +-- Realtime stream? -> workspaceRuntime.atom(stream) or workspaceRuntime.pull(stream)
  |
  +-- Client-only? (UI toggles, panel state, local filters)
  |     |
  |     +-- Simple value? ---> Atom.make(initialValue)
  |     +-- Derived? --------> Atom.readable(get => ...) or Atom.map(atom, fn)
  |     +-- Per-key? --------> Atom.family(key => Atom.make(value))
  |
  +-- URL search param? -----> Atom.searchParam("key", { schema? })
  |
  +-- Persisted to storage? -> Atom.kvs({ runtime, key, schema, defaultValue })
  |
  +-- Component-scoped? -----> ScopedAtom.make(() => Atom.make(value))
```

### Graph elements atom (server state)

```ts
/**
 * All graph nodes and edges, fetched via KnowledgeGraphApi.
 * Wraps the response in `AsyncResult` for lifecycle rendering.
 *
 * @since 0.1.0
 * @category atoms
 * @example
 *   import { graphElementsAtom } from "@beep/knowledge-workspace-ui/atoms"
 *
 *   function GraphCanvas() {
 *     const result = useAtomValue(graphElementsAtom)
 *     return AsyncResult.match(result, { ... })
 *   }
 */
const graphElementsAtom = workspaceRuntime.atom(
  Effect.gen(function*() {
    const api = yield* KnowledgeGraphApi
    const nodes = yield* api.listNodes
    const edges = yield* api.listEdges
    return toCytoscapeElements(nodes, edges)
  })
)
```

### Mutation atoms (server state)

```ts
/**
 * Create a new wiki_link edge between two nodes.
 * Invalidates the "graph" reactivity key so graphElementsAtom re-fetches.
 *
 * @since 0.1.0
 * @category atoms
 * @example
 *   import { createEdgeFn } from "@beep/knowledge-workspace-ui/atoms"
 *
 *   const [result, createEdge] = useAtom(createEdgeFn)
 *   createEdge({ sourceNodeId, targetNodeId, kind: "wiki_link" })
 */
const createEdgeFn = workspaceRuntime.fn<{
  readonly sourceNodeId: string
  readonly targetNodeId: string
  readonly kind: string
}>()(
  (args) => KnowledgeGraphApi.use((_) => _.createEdge(args)),
  { reactivityKeys: ["graph:nodes", "graph:edges"] }
)
```

### Client-only atoms

```ts
/**
 * Whether the detail panel is collapsed.
 *
 * @since 0.1.0
 * @category atoms
 */
const detailPanelCollapsedAtom = Atom.make(false)

/**
 * Active search query in the navigation sidebar tree filter.
 *
 * @since 0.1.0
 * @category atoms
 */
const navSearchQueryAtom = Atom.make("")

/**
 * Debounced variant of the nav search query for filtering.
 *
 * @since 0.1.0
 * @category atoms
 */
const debouncedNavSearchAtom = Atom.debounce(navSearchQueryAtom, Duration.millis(300))

/**
 * Expanded node IDs in the repo file tree.
 *
 * @since 0.1.0
 * @category atoms
 */
const expandedTreeNodesAtom = Atom.make<ReadonlySet<string>>(new Set())
```

### URL param atoms

```ts
/**
 * Canvas mode synced to `?mode=graph|editor|split`.
 *
 * @since 0.1.0
 * @category atoms
 */
const canvasModeAtom = Atom.searchParam("mode", {
  schema: CanvasMode
})

/**
 * Active page slug synced to `?page=`.
 *
 * @since 0.1.0
 * @category atoms
 */
const activePageAtom = Atom.searchParam("page")

/**
 * Focused symbol identifier synced to `?symbol=`.
 *
 * @since 0.1.0
 * @category atoms
 */
const focusedSymbolAtom = Atom.searchParam("symbol")

/**
 * Active repo identifier synced to `?repo=`.
 *
 * @since 0.1.0
 * @category atoms
 */
const activeRepoAtom = Atom.searchParam("repo")

/**
 * Certainty filter threshold synced to `?certainty=`.
 *
 * @since 0.1.0
 * @category atoms
 */
const certaintyFilterAtom = Atom.searchParam("certainty", {
  schema: S.NumberFromString
})
```

### Derived atoms

```ts
/**
 * Graph elements filtered by the current certainty threshold.
 * See 02-real-time-and-replay.md section "Filters During Replay" for the canonical filter specification.
 *
 * @since 0.1.0
 * @category atoms
 */
const filteredElementsAtom = Atom.readable((get) => {
  const result = get(graphElementsAtom)
  const threshold = get(certaintyFilterAtom)
  return AsyncResult.map(result, (elements) =>
    Option.match(threshold, {
      onNone: () => elements,
      onSome: (t) => elements.filter((el) =>
        el.data.certainty === undefined || el.data.certainty >= t
      )
    })
  )
})

/**
 * The currently selected element, derived from URL params and graph data.
 *
 * @since 0.1.0
 * @category atoms
 */
const selectedElementAtom = Atom.readable((get) => {
  const symbol = get(focusedSymbolAtom)
  const page = get(activePageAtom)
  const result = get(graphElementsAtom)
  return AsyncResult.flatMap(result, (elements) => {
    if (Option.isSome(symbol)) {
      return findElementById(elements, symbol.value)
    }
    if (Option.isSome(page)) {
      return findElementById(elements, `beep:page/${page.value}`)
    }
    return Option.none()
  })
})
```

### Live event stream atom

```ts
/**
 * Live graph event stream. Each new event triggers graph element updates
 * via CytoscapeService.
 *
 * @since 0.1.0
 * @category atoms
 */
const liveEventsAtom = workspaceRuntime.atom(
  Effect.gen(function*() {
    const stream = yield* EventStreamService.use((_) => _.subscribe)
    const cyto = yield* CytoscapeService
    return yield* Stream.runForEach(stream, (event) =>
      Effect.gen(function*() {
        const elements = graphEventToElements(event)
        yield* cyto.applyElements(elements)
        yield* cyto.applyClass(
          `#${event.primaryKey}`,
          "entering",
          1200
        )
      })
    )
  })
)
```

### React integration

```tsx
import { useAtomValue, useAtom, useAtomSuspense, useAtomSubscribe } from "@effect/atom-react"
import { AsyncResult } from "effect/unstable/reactivity"

/**
 * Graph canvas component. Reads graph elements and renders via CytoscapeService.
 *
 * @since 0.1.0
 * @category components
 */
function GraphCanvas() {
  const result = useAtomValue(graphElementsAtom)

  return AsyncResult.match(result, {
    onInitial: () => <GraphSkeleton />,
    onFailure: (r) => <GraphError cause={r.cause} />,
    onSuccess: (r) => <CytoscapeContainer elements={r.value} />
  })
}

/**
 * Suspense-aware variant for use within a Suspense boundary.
 *
 * @since 0.1.0
 * @category components
 */
function GraphCanvasSuspense() {
  const result = useAtomSuspense(graphElementsAtom)
  // result is guaranteed Success here
  return <CytoscapeContainer elements={result.value} />
}
```

## 7. Polymorphic Detail Panel

The detail panel renders content based on the selected node or edge type. It uses `S.toTaggedUnion` for exhaustive pattern matching via `.match`.

### SelectedElement schema

```ts
import * as S from "effect/Schema"

const $I = $KnowledgeWorkspaceUiId.create("schemas/SelectedElement")

/**
 * @since 0.1.0
 * @category schemas
 */
class SymbolNode extends S.TaggedClass<SymbolNode>($I`SymbolNode`)("SymbolNode", {
  nodeId: S.String,
  name: S.NonEmptyTrimmedString,
  kind: S.String,
  filePath: S.String,
  startLine: S.Number,
  endLine: S.Number,
  signature: S.String,
  jsdoc: S.String,
  importers: S.Array(S.String),
  dependents: S.Array(S.String),
}, $I.annote("SymbolNode", { description: "A code symbol node in the graph." })) {}

/**
 * @since 0.1.0
 * @category schemas
 */
class FileNode extends S.TaggedClass<FileNode>($I`FileNode`)("FileNode", {
  nodeId: S.String,
  filePath: S.String,
  exports: S.Array(S.String),
  imports: S.Array(S.String),
  importedBy: S.Array(S.String),
}, $I.annote("FileNode", { description: "A code file node in the graph." })) {}

/**
 * @since 0.1.0
 * @category schemas
 */
class DocumentNode extends S.TaggedClass<DocumentNode>($I`DocumentNode`)("DocumentNode", {
  nodeId: S.String,
  title: S.NonEmptyTrimmedString,
  lastModified: S.DateTimeUtc,
  excerpt: S.String,
  outboundLinks: S.Array(S.String),
  backlinks: S.Array(S.String),
}, $I.annote("DocumentNode", { description: "A document/page node in the graph." })) {}

/**
 * @since 0.1.0
 * @category schemas
 */
class ImportEdge extends S.TaggedClass<ImportEdge>($I`ImportEdge`)("ImportEdge", {
  importerFile: S.String,
  importerLine: S.Number,
  specifier: S.String,
  resolvedTarget: S.String,
  importKind: S.String,
}, $I.annote("ImportEdge", { description: "An import edge in the graph." })) {}

/**
 * Discriminated union of all selectable elements in the graph.
 * Uses `S.toTaggedUnion` for exhaustive `.match` dispatch.
 *
 * @since 0.1.0
 * @category schemas
 */
const SelectedElement = S.Union([SymbolNode, FileNode, DocumentNode, ImportEdge]).pipe(
  S.toTaggedUnion("_tag")
)
type SelectedElement = typeof SelectedElement.Type
```

### Match dispatch

```tsx
/**
 * Polymorphic detail panel. Dispatches on SelectedElement._tag
 * using the `.match` method from S.toTaggedUnion.
 *
 * @since 0.1.0
 * @category components
 * @example
 *   <DetailPanel />
 */
function DetailPanel() {
  const result = useAtomValue(selectedElementAtom)

  return Option.match(result, {
    onNone: () => <EmptyDetailPlaceholder />,
    onSome: (element) => SelectedElement.match(element, {
      SymbolNode: (node) => <SymbolDetail node={node} />,
      FileNode: (node) => <FileDetail node={node} />,
      DocumentNode: (node) => <DocumentDetail node={node} />,
      ImportEdge: (edge) => <ImportEdgeDetail edge={edge} />,
    })
  })
}
```

### Symbol node detail

```
+--- Symbol: parseConfig --------------------+
|                                           |
|  Kind:      function                      |
|  File:      packages/core/src/Config.ts   |
|  Lines:     42-67                         |
|                                           |
|  Signature:                               |
|  (path: string) => Effect<Config, Error>  |
|                                           |
|  JSDoc:                                   |
|  Parse a TOML config file and return a    |
|  validated Config object.                 |
|                                           |
|  -- Importers (3) ----------------------  |
|  * App.tsx:5                              |
|  * Server.ts:12                           |
|  * CLI.ts:8                               |
|                                           |
|  -- Dependents (2) ---------------------  |
|  * validateConfig (same file)             |
|  * loadDefaults (Defaults.ts:20)          |
|                                           |
|  [Focus in Graph]  [Open File]            |
+-------------------------------------------+
```

### File node detail

- File path and Phosphor extension icon.
- Exports list (symbols exported from this file).
- Imports list (specifiers this file imports).
- Imported-by list (files that import this file).
- Actions: "Focus in Graph" (`CrosshairSimpleIcon`), "Expand Symbols" (`TreeStructureIcon`).

### Document node detail

- Page title and last modified.
- Excerpt (first 200 characters).
- Outbound links (wiki_links from this page).
- Backlinks (other pages/nodes that link to this page).
- Actions: "Open in Editor" (`PencilSimpleIcon`), "Focus in Graph" (`CrosshairSimpleIcon`).

### Import edge detail

- Importer file and line number.
- Import specifier (e.g., `@beep/ui`).
- Resolved target file.
- Import kind: named, default, namespace, side-effect.

## 8. Three Canvas Modes

Canvas mode is persisted via `Atom.searchParam("mode")` and reflected in URL search params as `?mode=graph|editor|split`.

### Canvas mode schema

```ts
const $I = $KnowledgeWorkspaceUiId.create("schemas/CanvasMode")

/**
 * @since 0.1.0
 * @category schemas
 */
const CanvasMode = LiteralKit(["graph", "editor", "split"] as const)
```

### Graph mode (`Cmd+Shift+G`)

- Full Cytoscape canvas occupying the entire primary zone, managed by `CytoscapeService`.
- Real-time event feed active (live streaming or replay scrubber visible).
- Toolbar: layout selector, zoom controls, fit-to-screen (`ArrowsOutIcon`), export PNG (`ExportIcon`), filter toggles, replay controls.
- Click a node: populate the detail panel via URL param update.
- Double-click a document node: switch to split mode with that page in the editor.

### Editor mode (`Cmd+Shift+E`)

- Full Lexical editor occupying the entire primary zone.
- Active document determined by URL param `?page=` or last selected document node.
- Editor surface from `packages/editor/lexical/src/EditorSurface.tsx` extended with `WikiLinkNode` (specified in `04-lexical-integration.md`).
- `[[wiki_link]]` clicks: navigate to the linked page, update URL params.
- Toolbar: text formatting, heading levels, link insertion (`LinkIcon`), page metadata.

### Split mode (`Cmd+Shift+S`)

- Graph canvas on the left, editor on the right, separated by a `ResizableHandle`.
- Default split: 50/50. User-adjustable.
- Bidirectional sync:
  - Click a document node in the graph: opens that page in the editor pane.
  - Type a `[[wiki_link]]` in the editor: the linked node highlights in the graph with `.search-match` class via `CytoscapeService.applyClass`.
  - Save a page: graph updates in real time via the event stream.

## 9. Query Visualization

Query visualization is decomposed from the inline state management in `RepoMemoryDesktop.tsx` into dedicated atoms and components.

### QueryBar

Always-visible input bar at the bottom of the canvas zone.

```
+------------------------------------------------------------------+
|  MagnifyingGlassIcon  Ask about your code...    [repo-memory v]  |
+------------------------------------------------------------------+
```

- Input field with repo dropdown selector.
- Submit triggers a query run via `RepoRunRpcGroup`.
- While a query is active, the bar expands to show the stage trace below.

### Query atoms

```ts
/**
 * The query input text.
 *
 * @since 0.1.0
 * @category atoms
 */
const queryInputAtom = Atom.make("")

/**
 * Active query run. Fires the RPC and tracks the active run lifecycle.
 *
 * @since 0.1.0
 * @category atoms
 */
const submitQueryFn = workspaceRuntime.fn<{
  readonly query: string
  readonly repoId: string
}>()(
  (args) => KnowledgeGraphApi.use((_) => _.submitQuery(args)),
  { reactivityKeys: ["query-run"] }
)

/**
 * Stage statuses for the active query run.
 *
 * @since 0.1.0
 * @category atoms
 */
const stageStatusesAtom = workspaceRuntime.atom(
  (get) => Effect.gen(function*() {
    const run = get(submitQueryFn)
    return AsyncResult.map(run, (r) => r.stages)
  })
)
```

### StageTrace

Horizontal pipeline showing query progress through the four canonical stages:

```
[Grounding check] --> [Retrieval check] --> [Packet circle] --> [Answer circle-open]
```

- Reuses existing stage vocabulary from `queryStages.ts`:
  - `queryStageEntries` for the ordered stage list.
  - `formatQueryStageLabel` for display names.
  - `formatQueryStageStatusTone` for status-to-color mapping.
- Status pills: `CircleIcon` pending, `CircleDashedIcon` active (animated pulse), `CheckCircleIcon` complete, `XCircleIcon` failed.
- Click a stage pill to expand its detail in the detail panel (grounding notes, retrieval candidates, packet contents).

### Citation overlay

When a query answer is rendered:

1. Cited nodes (symbols, files referenced in the answer) receive the `.search-match` Cytoscape class via `CytoscapeService.applyClass`.
2. Non-cited nodes receive the `.faded` Cytoscape class.
3. The graph visually highlights exactly what evidence the answer is built on.
4. Clicking a citation in the answer text focuses the corresponding node in the graph and scrolls the detail panel to its source preview.

### Source preview

In the detail panel, when a citation is selected:

- Code block with syntax highlighting.
- Highlighted line span from `startLine` to `endLine` (from `CitationSpan`).
- File path and commit reference above the code block.
- "Open in Editor" action (`PencilSimpleIcon`) to jump to that file in the editor canvas.

## 10. Navigation

### URL search params (via `Atom.searchParam`)

| Param       | Schema                  | Description                              |
|-------------|-------------------------|------------------------------------------|
| `repo`      | `S.String`              | Active repo identifier                   |
| `page`      | `S.String`              | Active document page slug                |
| `symbol`    | `S.String`              | Focused symbol identifier                |
| `mode`      | `CanvasMode`            | `graph`, `editor`, `split`               |
| `query`     | `S.String`              | Active query text                        |
| `source`    | `S.String`              | Filter: event source                     |
| `certainty` | `S.NumberFromString`    | Filter: certainty threshold              |
| `actor`     | `S.String`              | Filter: actor type                       |

All URL params are managed through `Atom.searchParam`, not through TanStack Router's `useSearch` or manual `URLSearchParams`. Each param atom provides two-way binding: reading the atom returns the current URL value, writing to the atom updates the URL.

### Navigation flows

| User action                      | Effect                                              |
|----------------------------------|-----------------------------------------------------|
| Click graph node                 | Update detail panel + `?symbol=` or `?page=` param via `Atom.set(focusedSymbolAtom, ...)` |
| Click wiki_link in editor        | Navigate editor to linked page + highlight graph node via `CytoscapeService.applyClass` |
| Click breadcrumb segment         | Navigate to that scope level                         |
| `Cmd+K` or `/`                   | Open command palette (universal search)              |
| `Escape`                         | Close detail panel or exit full-screen mode          |
| Browser back/forward             | Atom.searchParam restores previous URL state         |

### Universal search (`Cmd+K`)

Uses the existing `Command` component from `@beep/ui` (base-nova):

- Searches across symbols, pages, and files.
- Results grouped by type with Phosphor icons (`FunctionIcon`, `FileIcon`, `NoteIcon`).
- Select a result: navigate to it (focus in graph, open in editor, or both in split mode).
- Recent searches shown when input is empty.

### Breadcrumb trail

Uses the existing `Breadcrumb` component:

```
Knowledge Workspace / repo-memory / packages/core / src / Config.ts / parseConfig
```

Each segment is clickable and navigates to that scope level in both the graph and the detail panel by updating the appropriate `Atom.searchParam`.

## 11. RepoMemoryDesktop Decomposition

The 1831-line `RepoMemoryDesktop.tsx` in `apps/desktop/src/` is decomposed into focused components. Each component reads its state from atoms -- no prop drilling, no hook-based state.

### Component inventory

| New Component              | Responsibility                                | Lines (est.) |
|----------------------------|-----------------------------------------------|--------------|
| `WorkspaceLayout.tsx`      | Three-zone shell: `ResizablePanelGroup` with nav, canvas, detail | 80 |
| `GraphCanvas.tsx`          | Cytoscape container, reads `graphElementsAtom`, toolbar | 150 |
| `DetailPanel.tsx`          | Polymorphic node/edge detail view with `SelectedElement.match` | 250 |
| `QueryBar.tsx`             | Query input, stage trace, citation overlay atoms | 150 |
| `ConnectionManager.tsx`    | Sidecar connection lifecycle: health atom, reconnect, status | 100 |
| `NavigationSidebar.tsx`    | Repos tree + pages list with search, tab switching | 150 |

### Extraction strategy

1. **ConnectionManager first** -- extract all sidecar connection state into a `SidecarConnection` service with its own atoms. This is the least coupled extraction.
2. **NavigationSidebar second** -- extract the repo list and file tree rendering. Uses `navSearchQueryAtom`, `expandedTreeNodesAtom`.
3. **DetailPanel third** -- extract the node detail rendering. Uses `SelectedElement.match` dispatch.
4. **QueryBar fourth** -- extract query input, stage trace, and citation logic. Uses `queryInputAtom`, `submitQueryFn`, `stageStatusesAtom`.
5. **GraphCanvas fifth** -- extract the Cytoscape container. Reads `graphElementsAtom`, delegates to `CytoscapeService` for rendering.
6. **WorkspaceLayout last** -- compose the above components into the three-zone shell with `ResizablePanelGroup`. This is the new top-level component that replaces `RepoMemoryDesktop.tsx`.

### State boundaries

Each extracted component reads from module-level atoms -- no local `useState`:

| Component              | Atom dependencies                                                         |
|------------------------|---------------------------------------------------------------------------|
| `ConnectionManager`    | `connectionStatusAtom`, `baseUrlAtom` (via `SidecarConnection` service)   |
| `NavigationSidebar`    | `navSearchQueryAtom`, `expandedTreeNodesAtom`, `activeRepoAtom`, `activePageAtom` |
| `DetailPanel`          | `selectedElementAtom` (derived from URL params + graph data)              |
| `QueryBar`             | `queryInputAtom`, `submitQueryFn`, `stageStatusesAtom`                    |
| `GraphCanvas`          | `graphElementsAtom`, `filteredElementsAtom`, `canvasModeAtom`             |
| `WorkspaceLayout`      | `canvasModeAtom`, `detailPanelCollapsedAtom`                              |

Cross-component coordination flows through URL search params (via `Atom.searchParam`) and shared atoms -- not prop drilling. For example, clicking a node in `GraphCanvas` updates `Atom.set(focusedSymbolAtom, id)`, which updates `?symbol=` in the URL, which `selectedElementAtom` observes to derive the selected element for `DetailPanel`.

## 12. Provider Setup

The workspace mounts a single `RegistryProvider` at the app shell level. All atoms share the same registry.

```tsx
import { RegistryProvider } from "@effect/atom-react"

/**
 * @since 0.1.0
 * @category providers
 */
function KnowledgeWorkspaceApp() {
  return (
    <RegistryProvider>
      <WorkspaceLayout />
    </RegistryProvider>
  )
}
```

`RegistryProvider` options used:

| Option             | Value  | Rationale                                       |
|--------------------|--------|-------------------------------------------------|
| `defaultIdleTTL`   | `1000` | Keep atoms alive slightly longer for tab switching |

## 13. Responsive Behavior

### Desktop (Tauri): full three-zone layout

- All three zones visible with resizable handles.
- Sidebar collapsible to icon rail (48px).
- Detail panel collapsible to hidden.
- Keyboard shortcuts active.
- Minimum window size: 1024x768.

### Narrow viewport (below 768px)

- Single-zone layout: only the canvas is visible at a time.
- Bottom tab navigation: Graph (`GraphIcon`), Editor (`PencilSimpleIcon`), Search (`MagnifyingGlassIcon`), Detail (`InfoIcon`).
- Sidebar rendered as a sheet overlay using the existing `SidebarProvider` mobile behavior (it already handles the 768px breakpoint).
- Detail panel rendered as a bottom sheet.
- Mobile detection via an `Atom.readable` that subscribes to a `matchMedia` listener (not `useEffect`):

```ts
/**
 * Reactive mobile breakpoint atom. Replaces the legacy useIsMobile hook.
 *
 * @since 0.1.0
 * @category atoms
 */
const isMobileAtom = Atom.readable((get) => {
  let isMobile = false
  if (typeof window !== "undefined") {
    const mql = window.matchMedia("(max-width: 767px)")
    isMobile = mql.matches
    get.subscribe(Atom.make(undefined), () => {
      // Re-evaluate when matchMedia changes
    })
    get.addFinalizer(() => {
      // Cleanup handled by atom disposal
    })
  }
  return isMobile
})
```

### Breakpoint summary

| Breakpoint | Layout                        | Navigation          | Detail panel      |
|------------|-------------------------------|---------------------|-------------------|
| >= 1280px  | Three zones, all visible      | Sidebar             | Side panel        |
| 768-1279px | Two zones, detail collapsed   | Sidebar (narrow)    | Overlay on demand |
| < 768px    | Single zone                   | Bottom tabs + sheet | Bottom sheet      |

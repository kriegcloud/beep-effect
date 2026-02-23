# Handoff P4: Graph UI + Atom Client

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,800 | OK |
| Episodic | 1,000 | ~500 | OK |
| Semantic | 500 | ~450 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 4 Goal
Build the frontend: react-force-graph-2d visualization, chat interface, and atom-based reactive state connecting both to the API routes from P2-P3.

### Deliverables
1. `apps/web/src/components/graph/ForceGraph.tsx` — react-force-graph-2d wrapper with custom rendering
2. `apps/web/src/components/graph/GraphPanel.tsx` — Graph page with search, controls, node detail
3. `apps/web/src/components/graph/NodeDetail.tsx` — Selected node detail sidebar
4. `apps/web/src/components/chat/ChatPanel.tsx` — Chat message list + input
5. `apps/web/src/components/chat/MessageBubble.tsx` — Individual message rendering
6. `apps/web/src/components/chat/ToolCallTrace.tsx` — Tool call visualization
7. `apps/web/src/state/graph.atoms.ts` — Graph data atoms
8. `apps/web/src/state/chat.atoms.ts` — Chat conversation atoms
9. `apps/web/src/state/registry.tsx` — AtomRegistry provider
10. `apps/web/src/app/(app)/page.tsx` — Combined workspace: graph (left) + chat (right)
12. `apps/web/src/app/api/graph/search/route.ts` — Graph search passthrough API

### Success Criteria
- [ ] react-force-graph-2d component renders nodes/edges from Graphiti search results
- [ ] Initial load fetches a seed subgraph (50-200 nodes) from `/api/graph/search`
- [ ] Node click triggers neighbor search, expanding the graph incrementally
- [ ] Node detail panel shows label, type, summary, and related facts
- [ ] Chat panel sends messages and displays responses with tool call traces
- [ ] Graph snippet from chat response highlights relevant nodes in the graph
- [ ] All state managed via `@effect/atom-react` atoms (no useState for API data)
- [ ] Only tested atom APIs used: `Atom.make`, computed, `Atom.fn`, `useAtomValue`, `useAtom` (no `AtomHttpApi`)
- [ ] `RegistryProvider` wraps the app at root level
- [ ] Loading and error states handled via `AsyncResult`
- [ ] Incremental graph expansion works smoothly (no full simulation restart)
- [ ] Auth-gated: unauthenticated users redirected to sign-in

### Implementation Notes

**react-force-graph-2d installation:**
```bash
npm install react-force-graph-2d
```

**Graph atoms:**
```ts
import { Atom } from "effect/unstable/reactivity"
import { AsyncResult } from "effect/unstable/reactivity"

// Search query state
const searchQuery = Atom.make("")

// Graph data (async, driven by search)
const graphData = Atom.make((get) => {
  const query = get(searchQuery)
  return fetchGraphData(query) // returns Effect -> AsyncResult
})

// Selected node
const selectedNode = Atom.make<Option<GraphNode>>(O.none())

// Mutation: expand node (fetch neighbors)
const expandNode = Atom.fn<string>()(
  (nodeId, get) => fetchNodeNeighbors(nodeId)
)
```

**Chat atoms:**
```ts
// Message history
const messages = Atom.make<Array<ChatMessage>>([])

// Send message mutation
const sendMessage = Atom.fn<string>()(
  (content, get) => {
    const history = get(messages)
    return postChatMessage([...history, { role: "user", content }])
  },
  { initialValue: AsyncResult.initial() }
)
```

**RegistryProvider setup:**
```tsx
// state/registry.tsx
import { RegistryProvider } from "@effect/atom-react"
import { Duration } from "effect"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RegistryProvider defaultIdleTTL={Duration.seconds(30)}>
      {children}
    </RegistryProvider>
  )
}
```

**Graph search API route (passthrough):**
```ts
// app/api/graph/search/route.ts
// Thin wrapper calling GraphitiService.searchNodes and mapping to react-force-graph-2d format
// Uses same GraphitiService + mappers from P2
```

**Incremental graph updates:**
react-force-graph-2d supports incremental node/link addition without full simulation restart. New nodes/links can be appended to the existing `graphData` object and the simulation adjusts smoothly. No debouncing needed for basic expansion, but batch updates when expanding multiple neighbors at once.

**Graphiti -> react-force-graph-2d data mapping (from `mappers.ts`):**
```
Graphiti EntityNode.uuid         -> Node.id
Graphiti EntityNode.name         -> Node.name (displayed as label)
Graphiti EntityNode.labels[0]    -> Node.type (for color coding)
Graphiti EntityNode.summary      -> Node.summary (tooltip/detail)
Graphiti Fact.source_node_uuid   -> Link.source
Graphiti Fact.target_node_uuid   -> Link.target
Graphiti Fact.name               -> Link.label
```

### UX Design Notes

**Combined workspace layout (single page):**
- **Left panel (~60%):** Graph visualization with search input at top; node detail panel slides in from left on click (~350px overlay)
- **Right panel (~40%):** Chat message list + input; streaming tokens appear in real-time; tool call traces shown inline
- **Integration:** Chat answers that return graph snippets automatically highlight relevant nodes in the left panel; clicking a highlighted node in the graph populates context in the chat
- **Responsive:** On narrow viewports, panels stack vertically (graph on top, chat below)

## Episodic Memory

### From P0-P3
- Auth working with better-auth magic link + email allowlist
- FalkorDB VPS deployed and verified
- KnowledgeGraphToolkit defined and tested
- Chat endpoint at `/api/chat` returning grounded answers

## Semantic Memory

### Atom + React Patterns
```ts
// Read atom value
const value = useAtomValue(myAtom)

// Read + write
const [value, setValue] = useAtom(writableAtom)

// Mutation setter
const trigger = useAtomSet(mutationAtom)

// Refresh async atom
const refresh = useAtomRefresh(asyncAtom)
```

### AsyncResult States
```ts
AsyncResult.initial()   // not yet loaded
AsyncResult.loading()   // in progress
AsyncResult.success(v)  // loaded successfully
AsyncResult.failure(e)  // failed
```

### react-force-graph-2d Component API
```tsx
<ForceGraph2D
  graphData={{ nodes, links }}
  nodeLabel="name"
  nodeColor={(node) => colorByType(node.type)}
  nodeVal={(node) => node.val ?? 1}
  linkLabel="label"
  onNodeClick={(node) => selectNode(node)}
  onNodeHover={(node) => setHoveredNode(node)}
  width={containerWidth}
  height={containerHeight}
/>
```

## Procedural Memory

### References
- Atom source: `.repos/effect-smol/packages/effect/src/unstable/reactivity/`
- Atom React source: `.repos/effect-smol/packages/ai/atom-react/`
- react-force-graph-2d docs: https://github.com/vasturiano/react-force-graph
- Research notes: `outputs/research.md` sections 3, 6, 8

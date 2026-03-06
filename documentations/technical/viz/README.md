# @nomik/viz

Visualization dashboard for NOMIK. React application to interactively explore the knowledge graph in 2D and 3D.

## Features

- **2D Graph**: Cytoscape.js with force-directed layout, progressive streaming, level-of-detail zoom
- **3D Graph**: 3d-force-graph (Three.js) with adaptive quality levels, auto-rotation
- **2D/3D Toggle**: Switch between rendering modes
- **4 Layouts**: Force (cose), Tree (breadthfirst), Radial (concentric), Circle
- **Search bar**: Ranked search with focus/fit-all modes, next/prev navigation
- **Filters**: Toggle by node type (17 types), edge type (10 types), and directory layer — only non-empty types shown
- **Impact Overlay**: Click any node to highlight all connected edges/nodes (downstream amber, upstream blue, source red)
- **Detail panel**: Side panel with properties, calls, called by, extends, listens to, depends on, uses env, calls external, security issues, contains
- **Edge labels on hover**: Hovering an edge shows its type
- **Help Modal**: `? Help` button with complete guide for all node/edge types
- **Stats Panel**: Full node type breakdown, expandable health sections (dead code, god objects, god files, duplicates), composite health score
- **Query caching**: 60-second TTL cache on all Neo4j queries, auto-invalidated on project switch
- **Dark theme**: Professional dark mode
- **Project filtering**: All queries scoped by `projectId`

## Components

| Component | File | Role |
|---|---|---|
| `GraphViewer` | `components/GraphViewer.tsx` | 2D Cytoscape graph, progressive loading, LOD, impact overlay |
| `Graph3DViewer` | `components/Graph3DViewer.tsx` | 3D Three.js graph, adaptive quality, auto-rotation |
| `SearchBar` | `components/SearchBar.tsx` | Ranked search with focus/fit-all modes, next/prev navigation |
| `FilterPanel` | `components/FilterPanel.tsx` | Toggle filters by 17 node types, 10 edge types, directory layers |
| `NodeDetail` | `components/NodeDetail.tsx` | Detail panel for selected node — all 10+ edge types rendered |
| `HelpModal` | `components/HelpModal.tsx` | Interactive help popup — documents all node/edge types |
| `LayoutSelector` | `components/LayoutSelector.tsx` | Layout selector (Modules/Flow/Hub) |
| `StatsPanel` | `components/StatsPanel.tsx` | Health stats: all node type counts, dead code, god objects, god files, duplicates, health score |
| `ProjectSelector` | `components/ProjectSelector.tsx` | Project dropdown (defaults to NOMIK/GENOME) |

## Neo4j Queries (`neo4j.ts`)

All queries connect directly to Neo4j via `neo4j-driver` (Bolt) and are filtered by `projectId`.

| Function | Description |
|---|---|
| `fetchGraphOverview(projectId?)` | Files + DEPENDS_ON edges only (fast for large projects) |
| `fetchGraphData(projectId?)` | Full graph — all nodes and edges |
| `fetchGraphDataPaginated(projectId?, limit)` | Top N files by function count + their children |
| `fetchHealthStats(projectId?)` | All node type counts, dead code, god objects, god files, duplicates |
| `fetchProjects()` | Lists available projects |
| `invalidateCache()` | Clears the 60s TTL query cache |

## Node Types (17)

All 17 node types are rendered with distinct shapes and colors in both 2D and 3D.

| Node Type | Color | Shape (2D) | Description |
|---|---|---|---|
| `File` | Cyan `#06b6d4` | Round rectangle | Source file |
| `Function` | Emerald `#10b981` | Circle | Function, method, arrow function |
| `Class` | Purple `#a855f7` | Diamond | Class, interface, struct, trait |
| `Route` | Amber `#f59e0b` | Hexagon | API endpoint / route handler |
| `Variable` | Blue `#60a5fa` | Round tag | Module-level variable |
| `Event` | Purple `#c084fc` | Star | Event listener or emitter |
| `EnvVar` | Slate `#a1a1aa` | Round rectangle | Environment variable |
| `Module` | Cyan `#22d3ee` | Round rectangle | Logical module |
| `DBTable` | Orange `#fb923c` | Barrel | Database table |
| `DBColumn` | Orange `#f97316` | Circle | Database column |
| `ExternalAPI` | Indigo `#818cf8` | Pentagon | External API endpoint |
| `CronJob` | Lime `#a3e635` | Octagon | Scheduled job |
| `QueueJob` | Fuchsia `#e879f9` | Rhomboid | Queue consumer/producer |
| `Metric` | Teal `#2dd4bf` | Triangle | Observability metric |
| `Span` | Sky `#38bdf8` | Round rectangle | Tracing span |
| `Topic` | Violet `#a78bfa` | Concave hexagon | Message topic |
| `SecurityIssue` | Red `#ef4444` | Vee | Security vulnerability |

## Edge Types (10)

All 10 edge types are rendered with distinct colors and line styles.

| Edge Type | Color | Line Style | Description |
|---|---|---|---|
| `CONTAINS` | Slate `#334155` | Solid | File contains a symbol |
| `CALLS` | Amber `#fbbf24` | Solid | Function invocation |
| `DEPENDS_ON` | Sky `#38bdf8` | Dashed | Inter-file dependency |
| `IMPORTS` | Indigo `#6366f1` | Dashed | File-to-file import |
| `EXPORTS` | Violet `#8b5cf6` | Dotted | Module export |
| `LISTENS_TO` | Purple `#c084fc` | Solid | Event subscription |
| `EXTENDS` | Purple `#a855f7` | Solid (backcurve arrow) | Class inheritance |
| `USES_ENV` | Slate `#a1a1aa` | Dotted | Env variable reference |
| `HAS_SECURITY_ISSUE` | Red `#ef4444` | Solid (thick) | Security vulnerability |
| `CALLS_EXTERNAL` | Indigo `#818cf8` | Solid | External API call |

## Impact Overlay (click a node)

| Glow Color | Meaning |
|---|---|
| Red | Selected node (impact source) |
| Amber | Downstream — nodes called/contained/depended on by source |
| Blue | Upstream — nodes that call/contain/depend on source |
| Faded | Not directly related to the selected node |

## Health Score Formula

The StatsPanel computes a composite health score (0–100%) based on:

| Factor | Penalty | Cap |
|---|---|---|
| Dead code | -1 per % of dead functions | -25 |
| God objects | -5 per god object | -20 |
| God files | -3 per god file (>10 functions) | -15 |
| Duplicates | -2 per duplicate group | -10 |
| Security issues | -10 per issue | -30 |

## Performance Optimizations

- **Query cache**: 60-second TTL on all Neo4j queries, invalidated on project switch
- **Progressive streaming**: 2D graph loads in phases (loading → computing → streaming → ready)
- **Adaptive fast styles**: Large graphs (>300 nodes) use `graphStylesFast` — smaller nodes, hidden labels when zoomed out, reduced opacity
- **Adaptive fast layout**: Large graphs use `fastCoseLayout` — 300 iterations instead of 2000
- **Level-of-detail (LOD)**: When zoomed out below 0.6x, all non-File nodes and non-DEPENDS_ON edges are hidden
- **3D adaptive quality**: Node count thresholds (300/800/1500) control resolution, arrow visibility, particle count

## Tech Stack

- **React** + **Vite** (fast build)
- **Cytoscape.js** (2D graph rendering)
- **3d-force-graph** / **Three.js** (3D graph rendering)
- **TailwindCSS** (styling)
- **neo4j-driver** (direct Bolt connection)

## Setup

```bash
cd packages/viz
pnpm dev
```

Dashboard at **http://localhost:3000**.

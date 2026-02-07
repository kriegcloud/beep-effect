# Page Scout Report: Stats

## Metadata
- **URL**: https://open-ontology.com/databases/lively-birch-keeping-autumn
- **Full Viewport Screenshot**: `scout-stats-full-viewport.png`
- **Element Screenshots**:
  - `aside` (sidebar) -> `scout-stats-sidebar.png`
  - `header` (banner) -> `scout-stats-header.png`
  - `main` (content) -> `scout-stats-main.png`
  - `.react-flow` (graph canvas) -> `scout-stats-react-flow.png`
- **Viewport**: 1920x1080
- **Scrollable**: No (total height: 1080px = viewport height)
- **Total Interactive Elements**: 45 (6 header, 19 sidebar nav links, 20 main content)

## Layout Summary

The Stats page uses a three-region layout: a narrow left sidebar (~140px) with 19 navigation links, a persistent top header bar spanning full width, and a main content area consuming the remaining space. The main content is divided into a help banner at top, a statistics summary row showing five aggregate metrics (499 Triples, 72 Entities, 3 Object Types, 4 Link Types, 44 Attributes), a left summary panel (~280px) listing Object Types and Link Types in collapsible accordion sections, and a large React Flow graph visualization (~1500px) rendering the ontology schema as a directed graph with customizable layout controls in a toolbar strip above the graph.

## Component Inventory

> **Note**: CSS selectors are provided for each component so downstream agents
> can locate elements reliably using Playwright's selector engine.

### Header (banner)

| # | Component | Type | CSS Selector | Section | Label/Content | Has Children | Interaction Type |
|---|-----------|------|-------------|---------|---------------|--------------|-----------------|
| 1 | Open Ontology logo link | link | `header a[href="/databases"]` | Header | "Open Ontology" | no | click (navigates to /databases) |
| 2 | Database selector | combobox | `header button[role="combobox"]:has-text("lively-birch")` | Header | "lively-birch-keeping-autumn" | yes (dropdown) | click/select |
| 3 | User role selector | combobox | `header button[role="combobox"]:has-text("Admin")` | Header | "Admin" | yes (dropdown) | click/select |
| 4 | API Docs link | link | `header a[href="/api/docs"]` | Header | "API Docs" | no | click (navigates to /api/docs) |
| 5 | Help toggle | button | `button:has-text("Hide help")` | Header | "Hide help" | no | click (toggles help banner) |
| 6 | Theme toggle | button | `button[aria-label="Switch to dark mode"]` | Header | "Switch to dark mode" | no | click (toggles theme) |

### Sidebar Navigation (complementary)

| # | Component | Type | CSS Selector | Section | Label/Content | Has Children | Interaction Type |
|---|-----------|------|-------------|---------|---------------|--------------|-----------------|
| 7 | Stats (active) | link | `aside a[href="/databases/lively-birch-keeping-autumn"]` | Sidebar | "Stats" | yes (icon + text) | click |
| 8 | Schema | link | `aside a[href$="/schema"]` | Sidebar | "Schema" | yes | click |
| 9 | Explorer | link | `aside a[href$="/explorer"]` | Sidebar | "Explorer" | yes | click |
| 10 | Builder | link | `aside a[href$="/ontology-builder"]` | Sidebar | "Builder" | yes | click |
| 11 | Attributes | link | `aside a[href$="/attributes"]` | Sidebar | "Attributes" | yes | click |
| 12 | Objects | link | `aside a[href$="/objects"]` | Sidebar | "Objects" | yes | click |
| 13 | Links | link | `aside a[href$="/links"]` | Sidebar | "Links" | yes | click |
| 14 | Actions | link | `aside a[href$="/actions"]` | Sidebar | "Actions" | yes | click |
| 15 | Rules | link | `aside a[href$="/rules"]` | Sidebar | "Rules" | yes | click |
| 16 | Violations | link | `aside a[href$="/violations"]` | Sidebar | "Violations" | yes | click |
| 17 | Tasks | link | `aside a[href$="/tasks"]` | Sidebar | "Tasks" | yes | click |
| 18 | Workflows | link | `aside a[href$="/workflows"]` | Sidebar | "Workflows" | yes | click |
| 19 | Forms | link | `aside a[href$="/forms"]` | Sidebar | "Forms" | yes | click |
| 20 | Views | link | `aside a[href$="/views"]` | Sidebar | "Views" | yes | click |
| 21 | Files | link | `aside a[href$="/files"]` | Sidebar | "Files" | yes | click |
| 22 | Inbox | link | `aside a[href$="/inbox"]` | Sidebar | "Inbox" | yes | click |
| 23 | Queries | link | `aside a[href$="/queries"]` | Sidebar | "Queries" | yes | click |
| 24 | Console | link | `aside a[href$="/console"]` | Sidebar | "Console" | yes | click |
| 25 | Chat | link | `aside a[href$="/chat"]` | Sidebar | "Chat" | yes | click |
| 26 | Settings | link | `aside a[href$="/settings"]` | Sidebar | "Settings" | yes | click |

### Main Content - Help Banner & Stats

| # | Component | Type | CSS Selector | Section | Label/Content | Has Children | Interaction Type |
|---|-----------|------|-------------|---------|---------------|--------------|-----------------|
| 27 | Help mode toggle | button | `main button:has-text("Simple (ELI5)")` | Help Banner | "Simple (ELI5)" | no | click (likely toggles explanation complexity) |
| 28 | Stats: Triples | display | `main >> text="499"` | Stats Row | "499 Triples" | no | display-only |
| 29 | Stats: Entities | display | `main >> text="72"` | Stats Row | "72 Entities" | no | display-only |
| 30 | Stats: Object Types | display | `main >> text="3"` (in stats row) | Stats Row | "3 Object Types" | no | display-only |
| 31 | Stats: Link Types | display | `main >> text="4"` (in stats row) | Stats Row | "4 Link Types" | no | display-only |
| 32 | Stats: Attributes | display | `main >> text="44"` | Stats Row | "44 Attributes" | no | display-only |

### Main Content - Summary Panel

| # | Component | Type | CSS Selector | Section | Label/Content | Has Children | Interaction Type |
|---|-----------|------|-------------|---------|---------------|--------------|-----------------|
| 33 | Object Types accordion | button (collapsible) | `main button:has-text("Object Types")` | Summary Panel | "Object Types 3" (expanded) | yes | click (collapse/expand) |
| 34 | Department type | button | `main button:has-text("Department")` | Summary Panel | "Department v1" | yes | click |
| 35 | Employee type | button | `main button:has-text("Employee")` | Summary Panel | "Employee v1" | yes | click |
| 36 | Project type | button | `main button:has-text("Project")` | Summary Panel | "Project v1" | yes | click |
| 37 | Link Types accordion | button (collapsible) | `main button:has-text("Link Types")` | Summary Panel | "Link Types 4" (expanded) | yes | click (collapse/expand) |
| 38 | collaborates-on link | button | `main button:has-text("collaborates-on")` | Summary Panel | "collaborates-on Employee -> Project" | yes | click |
| 39 | leads-initiative link | button | `main button:has-text("leads-initiative")` | Summary Panel | "leads-initiative Employee -> Department" | yes | click |
| 40 | mentors link | button | `main button:has-text("mentors")` | Summary Panel | "mentors Employee -> Employee" | yes | click |
| 41 | reports-to link | button | `main button:has-text("reports-to")` | Summary Panel | "reports-to Employee -> Employee" | yes | click |

### Main Content - React Flow Graph Controls

| # | Component | Type | CSS Selector | Section | Label/Content | Has Children | Interaction Type |
|---|-----------|------|-------------|---------|---------------|--------------|-----------------|
| 42 | Zoom In | button | `button[aria-label="Zoom In"]` | Graph / Control Panel | "Zoom In" | no | click |
| 43 | Zoom Out | button | `button[aria-label="Zoom Out"]` | Graph / Control Panel | "Zoom Out" | no | click |
| 44 | Fit View | button | `button[aria-label="Fit View"]` | Graph / Control Panel | "Fit View" | no | click |
| 45 | React Flow attribution | link | `a[aria-label="React Flow attribution"]` | Graph | "React Flow" | no | click (external link) |

### Main Content - Graph Toolbar

| # | Component | Type | CSS Selector | Section | Label/Content | Has Children | Interaction Type |
|---|-----------|------|-------------|---------|---------------|--------------|-----------------|
| 46 | 3D View toggle | button | `main button:has-text("3D View")` | Graph Toolbar | "3D View" | no | click |
| 47 | Schema toggle | button | `main button:has-text("Schema")` (in toolbar) | Graph Toolbar | "Schema" | no | click |
| 48 | Layout algorithm selector | combobox | `main button[role="combobox"]:has-text("Dagre")` | Graph Toolbar | "Dagre (Hierarchical)" | yes (dropdown) | click/select |
| 49 | Direction toggle | button | `main button:has-text("Top-Down")` | Graph Toolbar | "Top-Down" | no | click |
| 50 | Edge style toggle | button | `main button:has-text("Curved")` | Graph Toolbar | "Curved" | no | click |
| 51 | Spacing toggle | button | `main button:has-text("Spacious")` | Graph Toolbar | "Spacious" | no | click |

### React Flow Graph Nodes

| # | Node ID | Type | CSS Selector | Label | Category |
|---|---------|------|-------------|-------|----------|
| N1 | obj-Department | Object Type node | `.react-flow__node[data-id="obj-Department"]` | "Department v1" | Object Type |
| N2 | obj-Employee | Object Type node | `.react-flow__node[data-id="obj-Employee"]` | "Employee v1" | Object Type |
| N3 | obj-Project | Object Type node | `.react-flow__node[data-id="obj-Project"]` | "Project v1" | Object Type |
| N4 | link-collaborates-on | Link Type node | `.react-flow__node[data-id="link-collaborates-on"]` | "collaborates-on" | Forward Link |
| N5 | link-has-collaborator-inv | Link Type node | `.react-flow__node[data-id="link-has-collaborator-inv"]` | "has-collaborator" (inverse) | Inverse Link |
| N6 | link-leads-initiative | Link Type node | `.react-flow__node[data-id="link-leads-initiative"]` | "leads-initiative" | Forward Link |
| N7 | link-initiative-led-by-inv | Link Type node | `.react-flow__node[data-id="link-initiative-led-by-inv"]` | "initiative-led-by" (inverse) | Inverse Link |
| N8 | link-mentors | Link Type node | `.react-flow__node[data-id="link-mentors"]` | "mentors" | Forward Link |
| N9 | link-mentored-by-inv | Link Type node | `.react-flow__node[data-id="link-mentored-by-inv"]` | "mentored-by" (inverse) | Inverse Link |
| N10 | link-reports-to | Link Type node | `.react-flow__node[data-id="link-reports-to"]` | "reports-to" | Forward Link |
| N11 | link-manages-inv | Link Type node | `.react-flow__node[data-id="link-manages-inv"]` | "manages" (inverse) | Inverse Link |

### React Flow Graph Edges

| # | Edge Label | Source | Target |
|---|------------|--------|--------|
| E1 | Edge from obj-Employee to link-collaborates-on | Employee | collaborates-on |
| E2 | Edge from link-collaborates-on to obj-Project | collaborates-on | Project |
| E3 | Edge from obj-Project to link-has-collaborator-inv | Project | has-collaborator |
| E4 | Edge from link-has-collaborator-inv to obj-Employee | has-collaborator | Employee |
| E5 | Edge from obj-Employee to link-leads-initiative | Employee | leads-initiative |
| E6 | Edge from link-leads-initiative to obj-Department | leads-initiative | Department |
| E7 | Edge from obj-Department to link-initiative-led-by-inv | Department | initiative-led-by |
| E8 | Edge from link-initiative-led-by-inv to obj-Employee | initiative-led-by | Employee |
| E9 | Edge from obj-Employee to link-mentors | Employee | mentors |
| E10 | Edge from link-mentors to obj-Employee | mentors | Employee |
| E11 | Edge from obj-Employee to link-mentored-by-inv | Employee | mentored-by |
| E12 | Edge from link-mentored-by-inv to obj-Employee | mentored-by | Employee |
| E13 | Edge from obj-Employee to link-reports-to | Employee | reports-to |
| E14 | Edge from link-reports-to to obj-Employee | reports-to | Employee |
| E15 | Edge from obj-Employee to link-manages-inv | Employee | manages |
| E16 | Edge from link-manages-inv to obj-Employee | manages | Employee |

## Data Model

| Metric | Value |
|--------|-------|
| Triples | 499 |
| Entities | 72 |
| Object Types | 3 |
| Link Types | 4 |
| Attributes | 44 |

### Object Types

| Name | Version |
|------|---------|
| Department | v1 |
| Employee | v1 |
| Project | v1 |

### Link Types

| Name | Direction | Source | Target |
|------|-----------|--------|--------|
| collaborates-on | forward | Employee | Project |
| leads-initiative | forward | Employee | Department |
| mentors | forward | Employee | Employee |
| reports-to | forward | Employee | Employee |

## Sections Map

```
Page: Stats (https://open-ontology.com/databases/lively-birch-keeping-autumn)
+-- Header (banner)
|   +-- Logo link: "Open Ontology" -> /databases
|   +-- Database selector combobox -> "lively-birch-keeping-autumn" (data-state="closed")
|   +-- User role combobox -> "Admin" (data-state="closed")
|   +-- API Docs link -> /api/docs
|   +-- Help toggle button -> "Hide help"
|   +-- Theme toggle button -> "Switch to dark mode"
|
+-- Sidebar (complementary > nav)
|   +-- Stats (ACTIVE - highlighted bg)
|   +-- Schema
|   +-- Explorer
|   +-- Builder
|   +-- [separator]
|   +-- Attributes
|   +-- Objects
|   +-- Links
|   +-- Actions
|   +-- [separator]
|   +-- Rules
|   +-- Violations
|   +-- Tasks
|   +-- Workflows
|   +-- Forms
|   +-- Views
|   +-- Files
|   +-- Inbox
|   +-- [separator]
|   +-- Queries
|   +-- Console
|   +-- Chat
|   +-- Settings
|
+-- Main Content (main)
    +-- Help Banner (top strip, light orange background)
    |   +-- Explanation text (ELI5 description of Stats page)
    |   +-- Help mode button: "Simple (ELI5)" (top-right of banner, data-state="closed")
    |
    +-- Stats Summary Row (large numbers)
    |   +-- 499 Triples
    |   +-- 72 Entities
    |   +-- 3 Object Types
    |   +-- 4 Link Types
    |   +-- 44 Attributes
    |
    +-- Split Panel Layout
        +-- Left: Summary Panel (~280px)
        |   +-- Object Types section (collapsible, expanded, count: 3)
        |   |   +-- Department v1 (button)
        |   |   +-- Employee v1 (button)
        |   |   +-- Project v1 (button)
        |   +-- Link Types section (collapsible, expanded, count: 4)
        |       +-- collaborates-on / Employee -> Project (button)
        |       +-- leads-initiative / Employee -> Department (button)
        |       +-- mentors / Employee -> Employee (button)
        |       +-- reports-to / Employee -> Employee (button)
        |
        +-- Separator (vertical divider)
        |
        +-- Right: React Flow Graph (~1500px)
            +-- Graph Canvas (application role, .react-flow)
            |   +-- 3 Object Type nodes (Department, Employee, Project)
            |   +-- 8 Link Type nodes (4 forward + 4 inverse)
            |   +-- 16 directed edges connecting nodes
            |   +-- Mini Map (bottom-right)
            |   +-- Control Panel (bottom-left)
            |   |   +-- Zoom In button
            |   |   +-- Zoom Out button
            |   |   +-- Fit View button
            |   +-- React Flow attribution link
            |
            +-- Graph Toolbar (above graph, right-aligned)
                +-- 3D View button
                +-- Schema button
                +-- Layout algorithm combobox -> "Dagre (Hierarchical)"
                +-- Direction button -> "Top-Down"
                +-- Edge style button -> "Curved"
                +-- Spacing button -> "Spacious"
```

## Notable Observations

- The page uses a **light theme by default** (the toggle button reads "Switch to dark mode"), indicating a toggleable dark/light mode.
- The **help banner** is visible by default with a "Simple (ELI5)" mode active. The header contains a "Hide help" button to toggle banner visibility. The "Simple (ELI5)" button itself has `data-state="closed"` suggesting it is a popover/dropdown that may offer alternative explanation complexity levels (e.g., Technical).
- The **stats summary row** (499 Triples, 72 Entities, 3 Object Types, 4 Link Types, 44 Attributes) shows live database metrics. These are display-only values, not interactive elements.
- The **React Flow graph renders both forward and inverse link types** as separate nodes. Each directed relationship pair is shown bidirectionally: "collaborates-on" / "has-collaborator", "reports-to" / "manages", "mentors" / "mentored-by", "leads-initiative" / "initiative-led-by".
- **Object Type nodes** (Department, Employee, Project) display with a "v1" version badge in rectangular gray/white cards.
- **Link Type nodes** have colored borders -- purple/violet for forward links, orange for inverse links -- visually distinguishing directionality.
- The **graph toolbar** provides 6 controls: 3D View toggle, Schema overlay toggle, layout algorithm combobox, direction toggle, edge style toggle, and spacing toggle. These represent significant configurable state.
- The **sidebar navigation** contains 19 page links grouped by spacing into four clusters: core views (Stats through Actions), governance (Rules through Inbox), developer tools (Queries through Chat), and meta (Settings).
- The **Mini Map** component is rendered in the bottom-right of the React Flow canvas, showing a thumbnail overview of the graph.
- Both comboboxes in the header (database selector and role selector) have `data-state="closed"`, confirming they are Radix UI Select components that will open dropdown menus on click.
- **No scrolling is required** -- the entire page content fits within the 1920x1080 viewport.

## Shared vs. Page-Specific Components

| Component | Classification | Notes |
|-----------|---------------|-------|
| Header bar | Shared | Appears on all pages with same structure |
| Open Ontology logo link | Shared | Always navigates to /databases |
| Database selector combobox | Shared | Global database selection |
| User role selector combobox | Shared | Global role/permission selection |
| API Docs link | Shared | Always visible in header |
| Help toggle button | Shared | Global help visibility toggle |
| Theme toggle button | Shared | Global dark/light mode toggle |
| Sidebar navigation (19 links) | Shared | Same links on all database pages |
| Help banner with ELI5 | Page-specific* | Content varies per page, mechanism shared |
| Stats summary row | Page-specific | Unique to Stats page |
| Object Types / Link Types summary panel | Page-specific | Unique to Stats page |
| React Flow graph visualization | Page-specific* | Graph canvas reused in Builder/Schema, but Stats has unique node/toolbar config |
| Graph toolbar (3D View, Schema, layout, etc.) | Page-specific | Controls specific to Stats graph view |
| React Flow controls (zoom, fit) | Shared (within graph views) | Standard React Flow controls |
| Mini Map | Shared (within graph views) | Standard React Flow mini map |

## Downstream Hints

- **For Reference Builder**: The Stats page is the primary ontology dashboard. Key features to map: (1) aggregate metric display (5 stat cards: triples, entities, object types, link types, attributes), (2) type-and-link inventory panel with collapsible accordion sections showing object types with version badges and link types with source/target descriptions, (3) React Flow ontology graph visualization with 11 nodes (3 object types + 8 link types including inverses) and 16 edges, (4) customizable graph layout via 6 toolbar controls. Header components (database selector, role selector, theme toggle, help toggle) are global/shared and will recur on every page. For TodoX package mapping: the graph visualization maps to a "schema-graph" or "ontology-viewer" feature; the stats row maps to a "dashboard-metrics" feature; the summary panel maps to a "type-inventory" feature.

- **For State Capturer**: The following components have interesting multi-state behavior. Recommended CSS selectors for each interaction:
  1. **Help banner toggle** (`button:has-text("Hide help")`) -- show/hide the explanation banner
  2. **Help complexity mode** (`main button:has-text("Simple (ELI5)")`) -- may be a popover/dropdown with alternative modes (data-state="closed")
  3. **Theme toggle** (`button[aria-label="Switch to dark mode"]`) -- light to dark mode transition (high visual impact, full-page repaint)
  4. **Database selector combobox** (`header button[role="combobox"]:has-text("lively-birch")`) -- open state showing available databases
  5. **Admin role combobox** (`header button[role="combobox"]:has-text("Admin")`) -- open state showing available roles
  6. **Object Types accordion collapse** (`main button:has-text("Object Types")`) -- toggle collapsed vs expanded (data-state="open" currently)
  7. **Link Types accordion collapse** (`main button:has-text("Link Types")`) -- toggle collapsed vs expanded (data-state="open" currently)
  8. **Individual object type buttons** (`main button:has-text("Department")`, etc.) -- click may navigate or highlight graph node
  9. **Individual link type buttons** (`main button:has-text("collaborates-on")`, etc.) -- click may navigate or highlight graph node
  10. **Layout algorithm combobox** (`main button[role="combobox"]:has-text("Dagre")`) -- dropdown showing alternative layout algorithms (ELK Force, Cola, etc.)
  11. **Direction toggle** (`main button:has-text("Top-Down")`) -- may cycle to "Left-Right" or other directions
  12. **Edge style toggle** (`main button:has-text("Curved")`) -- may cycle to "Straight" or "Step"
  13. **Spacing toggle** (`main button:has-text("Spacious")`) -- may cycle to "Compact"
  14. **3D View button** (`main button:has-text("3D View")`) -- may switch to a WebGL 3D visualization (high visual impact)
  15. **Schema button** (`main button:has-text("Schema")` in toolbar) -- may toggle a schema overlay on the graph
  16. **Graph node click** (`.react-flow__node[data-id="obj-Employee"]`, etc.) -- clicking may highlight, select, or show detail
  17. **Fit View control** (`button[aria-label="Fit View"]`) -- resets graph zoom/position

  **Estimated screenshot count**: 17-22 state captures (many toggles, 3 comboboxes, theme change, accordion states, graph interactions)

## Quality Checklist
- [x] Every visible interactive element has an inventory row (51 components + 11 graph nodes)
- [x] CSS selectors are recorded for each component (for downstream Playwright use)
- [x] Layout summary describes the page structure with specific dimensions and regions
- [x] Full viewport screenshot captured the default view (`scout-stats-full-viewport.png`)
- [x] Element-level screenshots captured for major sections (aside, header, main, .react-flow)
- [x] Scrollable content noted (page is NOT scrollable at 1920x1080)
- [x] Output written to the correct file path

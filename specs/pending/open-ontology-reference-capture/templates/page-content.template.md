# Page Content Template

> This is the template for the Notion page body of each Web Reference entry.
> Replace `{placeholders}` with actual content. Use Notion-flavored markdown.
> Use standard markdown syntax. Notion auto-converts tables, headers, bold, and bullet points.

---

## Template

```markdown
## Overview

{1-3 sentences describing what this page does, its primary purpose, and why it matters for a wealth management platform. Focus on the capability, not just the UI.}

## Layout

{Describe the page structure: sidebar placement, main content areas, panel arrangement, responsive behavior if observable. Include approximate proportions (e.g., "left sidebar 250px, main content fills remaining width").}

## Feature Mapping

| Open Ontology Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|---|---|---|---|---|
| {Feature name} | {TodoX feature or "New"} | {e.g., @beep/knowledge-ui} | {P0-P3} | {Brief note} |
| ... | ... | ... | ... | ... |

## Implementation Notes

- **Technology**: {Relevant tech observations - charting library, state management patterns, API patterns}
- **Similar Patterns**: {References to existing beep-effect codebase patterns}
- **Dependencies**: {What needs to exist before this can be built}
- **Complexity**: {Low/Medium/High estimate with brief rationale}
```

---

## Example (Stats Page)

```markdown
## Overview

The Stats page serves as the main dashboard for a knowledge graph database, showing aggregate counts (triples, entities, object types, link types, attributes) and a visual schema graph showing object types and their relationships. This is the landing page and first impression of the database.

## Layout

Full-width main content area with no secondary sidebar. Top section shows metric cards in a horizontal row. Below that, clickable expandable sections for "Object Types" and "Link Types" listing items with type signatures. Bottom half contains a large React Flow graph visualization with a floating control panel (zoom, fit) and layout configuration toolbar below.

## Feature Mapping

| Open Ontology Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|---|---|---|---|---|
| Triple/entity/type counts | Knowledge graph stats dashboard | @beep/knowledge-ui | P1 | Use Effect RPC for live counts |
| Object type list with expand | Ontology class browser | @beep/knowledge-ui | P1 | Reuse existing entity list patterns |
| Link type list with signatures | Relation type browser | @beep/knowledge-ui | P1 | Show domain→range signatures |
| React Flow schema graph | Schema visualization | @beep/knowledge-ui/GraphViewer | P0 | Already have React Flow dep |
| Graph layout options (Dagre, ELK) | Graph layout switcher | @beep/knowledge-ui/GraphViewer | P1 | Dagre already used in codebase |
| 3D view toggle | 3D graph visualization | @beep/knowledge-ui | P3 | Nice-to-have, not MVP |

## Implementation Notes

- **Technology**: React Flow for graph visualization, appears to use Dagre and ELK layout algorithms. Cards are likely simple div-based, not a charting library.
- **Similar Patterns**: `packages/knowledge/ui/` already has GraphViewer stub. React Flow is a dependency.
- **Dependencies**: Knowledge graph stats RPC endpoint, ontology class/property list endpoints
- **Complexity**: Medium - graph visualization is the complex part, stats cards are straightforward
```

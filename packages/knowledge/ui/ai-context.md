---
path: packages/knowledge/ui
summary: React components for knowledge graphs - graph viewer, entity inspector, search interface
tags: [knowledge, ui, react, components, visualization, graph]
---

# @beep/knowledge-ui

React components for knowledge graph visualization and interaction. Provides GraphViewer, EntityInspector, and search interface components that consume `@beep/knowledge-client` for data fetching with Effect-atom state management.

## Architecture

```
|-------------------|     |-------------------|
|    Components     | --> |      Hooks        |
| (React UI)        |     | (Effect-atom)     |
|-------------------|     |-------------------|
         |                         |
         v                         v
|-------------------|     |-------------------|
|  @beep/ui-core    |     |@beep/knowledge-   |
| (Base components) |     |     client        |
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `components/GraphViewer` | Interactive knowledge graph visualization |
| `components/EntityInspector` | Entity detail panel with attributes and relations |
| `components/SearchInterface` | Knowledge graph search with filters |
| `hooks/` | Effect-atom hooks for graph state management |

## Usage Patterns

### Graph Viewer Component

```tsx
import * as React from "react";
import { KnowledgeGraphViewer } from "@beep/knowledge-ui";

export const KnowledgeDashboard: React.FC = () => {
  return (
    <KnowledgeGraphViewer
      ontologyId={selectedOntology}
      onEntitySelect={(entity) => console.log("Selected:", entity.id)}
      onRelationSelect={(relation) => console.log("Relation:", relation.id)}
    />
  );
};
```

### Entity Inspector

```tsx
import * as React from "react";
import { EntityInspector } from "@beep/knowledge-ui";

export const EntityPanel: React.FC<{ entityId: string }> = ({ entityId }) => {
  return (
    <EntityInspector
      entityId={entityId}
      showRelations
      onNavigate={(targetId) => setSelectedEntity(targetId)}
    />
  );
};
```

### Search Interface

```tsx
import * as React from "react";
import { KnowledgeSearch } from "@beep/knowledge-ui";

export const SearchPanel: React.FC = () => {
  return (
    <KnowledgeSearch
      ontologyId={ontologyId}
      onResultSelect={(result) => navigateToEntity(result.entityId)}
      placeholder="Search entities and relations..."
    />
  );
};
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect-atom state | Consistent with monorepo state management patterns |
| MUI theming | Visual consistency across application |
| Client-only data fetching | Components delegate to @beep/knowledge-client |
| Accessibility-first | ARIA attributes required on all interactive elements |

## Dependencies

**Internal**: `@beep/knowledge-client`, `@beep/ui`, `@beep/ui-core`

**External**: `effect`, `react`, `@mui/material`

## Related

- **AGENTS.md** - Detailed contributor guidance
- **@beep/knowledge-client** - Data fetching layer consumed by components
- **@beep/ui-core** - Base component patterns and theming

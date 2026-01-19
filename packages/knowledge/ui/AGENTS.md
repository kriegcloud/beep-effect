# @beep/knowledge-ui — Agent Guide

## Purpose & Fit
- React components for knowledge graph visualization and interaction.
- Provides GraphViewer, EntityInspector, and search interface components.
- Consumes `@beep/knowledge-client` for data fetching.
- Part of the knowledge vertical's UI layer.

## Surface Map
- **Index (`src/index.ts`)** — Main barrel export for UI components.
- **Components** — React components for knowledge graph display and interaction.

## Usage Snapshots
- `apps/web/` — Imports knowledge UI components for dashboard views.
- `apps/todox/` — May integrate knowledge graph features in task context.

## Authoring Guardrails
- ALWAYS use `@beep/ui` and `@beep/ui-core` for base component patterns.
- Components MUST follow Effect-atom patterns for state management.
- NEVER use native fetch; use Effect-based data fetching via client contracts.
- Styling MUST use MUI theming system for consistency.

## Quick Recipes
```tsx
import * as React from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { KnowledgeGraphViewer } from "@beep/knowledge-ui";

export const KnowledgeDashboard: React.FC = () => {
  return (
    <KnowledgeGraphViewer
      onEntitySelect={(entity) => console.log("Selected:", entity.id)}
    />
  );
};
```

## Verifications
- `bun run check --filter @beep/knowledge-ui`
- `bun run lint --filter @beep/knowledge-ui`
- `bun run test --filter @beep/knowledge-ui`

## Contributor Checklist
- [ ] Components use Effect-atom for state management.
- [ ] Accessibility attributes included (aria-labels, roles).
- [ ] MUI theme tokens used for colors and spacing.

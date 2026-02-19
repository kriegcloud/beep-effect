# @beep/knowledge-ui

React components for knowledge graph visualization and interaction.

## Overview

This package provides UI components for the knowledge graph vertical:
- Graph visualization components
- Entity inspection interfaces
- Search and query interfaces

## Installation

```bash
bun add @beep/knowledge-ui
```

## Key Exports

| Export | Description |
|--------|-------------|
| Components | React components for knowledge graph display |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-client` | Client contracts for data fetching |
| `@beep/ui` | Base UI component library |
| `@beep/ui-core` | Core UI utilities |
| `react` | React framework |

## Usage

```tsx
import * as React from "react";
import { KnowledgeGraphViewer } from "@beep/knowledge-ui";

export const KnowledgePage: React.FC = () => {
  return (
    <KnowledgeGraphViewer
      onEntitySelect={(entity) => console.log("Selected:", entity)}
    />
  );
};
```

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain models |
| `@beep/knowledge-client` | Client contracts |
| `@beep/ui` | Base components |

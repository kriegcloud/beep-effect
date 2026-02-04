---
path: apps/todox
summary: Showcase Next.js app - MUI theming, shadcn/ui, multi-panel layout, mail/editor features
tags: [app, nextjs, mui, shadcn, showcase, effect]
---

# @beep/todox

Next.js 16 showcase application demonstrating MUI theming with shadcn/ui components, multi-panel layouts, and Effect patterns.

## Architecture

```
|----------------------|
|     GlobalProviders  |
| BeepProvider > I18n  |
| > Settings > Theme   |
| > IAM                |
|----------------------|
          |
          v
|----------------------|     |----------------------|
|    Multi-Panel UI    | --> |      Features        |
| MiniSidebar|Sidebar  |     | Mail | Editor | Chat |
| Navbar | SidePanel   |     |----------------------|
|----------------------|
          |
          v
|----------------------|
|   shadcn/ui + MUI    |
|   49 components      |
|----------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/app/` | Next.js App Router pages |
| `src/components/ui/` | 49 shadcn/ui components |
| `src/components/mini-sidebar/` | App selection sidebar |
| `src/components/sidebar/` | Main content navigation |
| `src/components/navbar/` | Top navbar (search, notifications) |
| `src/components/side-panel/` | Resizable contextual panel |
| `src/features/mail/` | Mail application feature |
| `src/features/editor/` | Tiptap rich text editor |
| `src/theme/` | MUI theme configuration |
| `src/global-providers.tsx` | Provider composition |

## Usage Patterns

### Effect-First Transformations

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

// REQUIRED - Effect utilities
const names = F.pipe(items, A.map(x => x.name));

// FORBIDDEN - native methods
// const names = items.map(x => x.name);
```

### Component Creation

```tsx
import * as F from "effect/Function";
import * as A from "effect/Array";
import { cn } from "@beep/todox/lib/utils";

export function ItemList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {F.pipe(items, A.map(item => (
        <Button key={item}>{item}</Button>
      )))}
    </div>
  );
}
```

### Feature-Based Organization

```
features/[feature-name]/
  components/       # Feature-specific components
  provider/         # State management (React Context)
  view/             # Top-level views
  [feature].tsx     # Main component
  index.ts          # Public exports
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| MUI + shadcn/ui | MUI for theming/complex components, shadcn for lightweight primitives |
| Multi-panel layout | Flexible workspace with mini sidebar, main sidebar, content, side panel |
| Effect utilities only | Consistent with monorepo patterns, no native array/string methods |
| Feature-based folders | Encapsulation of feature concerns |

## Dependencies

**Internal**: `@beep/shared-env`, `@beep/schema`, `@beep/ui`, `@beep/ui-core`, `@beep/iam-ui`, `@beep/runtime-client`, plus all vertical slice clients/ui packages

**External**: `next`, `react`, `@mui/material`, `shadcn`, `@tiptap/*`, `effect`, Lexical, Liveblocks

## Related

- **AGENTS.md** - Detailed contributor guidance (comprehensive)
- **src/theme/** - MUI theme customization
- **src/components/ui/** - shadcn/ui component library

# @beep/customization-ui

React UI components for the customization slice, providing user preference management interfaces.

## Purpose

The customization UI package provides React components for all user preference and personalization features in the beep-effect application. It includes theme selectors, hotkey configuration panels, layout customization controls, and other preference management interfaces. Components integrate with `@beep/customization-client` contracts via TanStack Query hooks for data fetching and use Effect's client runtime for type-safe operations. The package follows MUI and Tailwind patterns from `@beep/ui-core` for consistent styling across the application.

This package is currently a minimal scaffold awaiting component implementations as the customization feature set expands.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/customization-ui": "workspace:*"
```

## Key Exports

This package is currently in scaffold state with a placeholder `beep` export. Future exports will include:

| Export | Description |
|--------|-------------|
| `ThemeSelector` | Theme and color scheme picker component |
| `HotkeySettings` | Keyboard shortcut configuration panel |
| `LayoutPreferences` | Layout and UI density customization |
| `PreferencePanel` | General preference management interface |
| `AppearanceSettings` | Appearance customization (fonts, spacing, etc.) |

## Usage

### Theme Selector (Future)

```typescript
"use client";
import { ThemeSelector } from "@beep/customization-ui";
import * as Effect from "effect/Effect";

export function SettingsPage({ userId }: { userId: string }) {
  return (
    <div>
      <h2>Appearance</h2>
      <ThemeSelector userId={userId} />
    </div>
  );
}
```

### Hotkey Configuration (Future)

```typescript
"use client";
import { HotkeySettings } from "@beep/customization-ui";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export function KeyboardShortcutsPage({ userId }: { userId: string }) {
  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <HotkeySettings
        userId={userId}
        onSave={(hotkeys) => {
          console.log("Hotkeys saved", hotkeys);
        }}
      />
    </div>
  );
}
```

### With TanStack Query Integration (Future)

```typescript
"use client";
import { PreferencePanel } from "@beep/customization-ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as PreferenceContracts from "@beep/customization-client";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { Atom } from "@effect-atom/atom-react";
import * as F from "effect/Function";

const runtime = Atom.runtime(clientRuntimeLayer);

export function PreferencesPage({ userId }: { userId: string }) {
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["preferences", userId],
    queryFn: () => runtime.runPromise(
      PreferenceContracts.Get.implement({ userId })
    )
  });

  const updatePreferences = useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      runtime.runPromise(
        PreferenceContracts.Update.implement({ userId, ...updates })
      )
  });

  if (isLoading) return <div>Loading preferences...</div>;

  return (
    <PreferencePanel
      preferences={preferences}
      onUpdate={updatePreferences.mutate}
    />
  );
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `react` | React library for UI components |
| `react-dom` | React DOM rendering |
| `@beep/customization-client` | Customization contracts for data fetching |
| `@beep/ui-core` | Design tokens, MUI theme, settings types, and utilities |
| `@beep/runtime-client` | Client-side Effect runtime |
| `@tanstack/react-query` | Data fetching and caching |
| `@mui/material` | Material UI components |
| `@mui/icons-material` | Material UI icons |
| `effect` | Effect runtime for utilities in components |

## Integration

- **Client Layer**: Consumes contracts from `@beep/customization-client` for data operations
- **UI System**: Uses MUI components, design tokens, theme system, and settings types from `@beep/ui-core` (accessed via `@beep/ui-core/theme/*`, `@beep/ui-core/settings/*`, `@beep/ui-core/utils/*`)
- **Runtime**: Integrates with `@beep/runtime-client` for Effect-based operations
- **Query Layer**: Uses TanStack Query for data fetching, caching, and optimistic updates

## Development

```bash
# Type check
bun run --filter @beep/customization-ui check

# Lint
bun run --filter @beep/customization-ui lint

# Lint and auto-fix
bun run --filter @beep/customization-ui lint:fix

# Build
bun run --filter @beep/customization-ui build

# Run tests
bun run --filter @beep/customization-ui test

# Test with coverage
bun run --filter @beep/customization-ui coverage

# Watch mode for development
bun run --filter @beep/customization-ui dev
```

## Notes

### Component Authoring Guidelines

When implementing components, follow these patterns:

- Use `"use client"` directive for interactive components requiring client-side interactivity
- Follow MUI and Tailwind patterns from `@beep/ui-core` for consistent styling
- Use Effect namespace imports (`Effect`, `A`, `F`, `O`, `Str`) when using Effect utilities
- Keep components focused on presentation - business logic should live in contracts or domain layer
- Use React 19 patterns and avoid deprecated lifecycle methods

### Accessibility (a11y)

Ensure components are accessible:

- Add proper ARIA labels for preference controls
- Support keyboard navigation for all interactive elements
- Provide clear visual feedback for state changes
- Use semantic HTML elements for form controls
- Ensure color contrast meets WCAG standards

### State Management

For preference state management:

- Use TanStack Query for server state synchronization
- Implement optimistic updates for better UX
- Cache preferences locally for offline access
- Provide immediate feedback on preference changes
- Handle conflicts between local and server state gracefully

### Styling

- Use MUI components from `@mui/material` as building blocks
- Apply Tailwind utilities for custom spacing and layout
- Follow design tokens from `@beep/ui-core` for colors, typography, and spacing
- Ensure components work in both light and dark modes
- Use responsive design patterns for mobile and desktop
- Preview theme changes live before saving

### Validation

- Validate hotkey combinations for conflicts
- Ensure color values meet accessibility standards
- Validate layout preferences for feasibility
- Provide helpful error messages for invalid inputs
- Use Effect Schema for input validation

### Testing

- Create Storybook stories for visual component testing
- Test component rendering with different preference states
- Verify accessibility with automated a11y testing tools
- Test integration with TanStack Query hooks
- Mock customization contracts for isolated component testing
- Test preference persistence and synchronization
- Use `@beep/testkit` for Effect-based test utilities

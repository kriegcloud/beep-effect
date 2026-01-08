# @beep/comms-ui

React UI components for the communications slice, providing notification displays, messaging interfaces, and communication preference management.

## Purpose

The communications UI package provides React components for all communications-related features in the beep-effect application. It includes notification bells, toast messages, inbox views, email preference forms, and messaging interfaces. Components integrate with `@beep/comms-client` contracts via TanStack Query hooks for data fetching and use Effect's client runtime for type-safe operations. The package follows MUI and Tailwind patterns from `@beep/ui-core` for consistent styling across the application.

This package is currently a minimal scaffold awaiting component implementations as the communications feature set expands.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/comms-ui": "workspace:*"
```

## Key Exports

This package is currently in scaffold state with no exported components yet. Future exports will include:

| Export | Description |
|--------|-------------|
| `NotificationBell` | Header notification indicator with dropdown |
| `NotificationList` | Paginated list of user notifications |
| `ToastProvider` | Context provider for toast notifications |
| `InboxView` | Messaging inbox component |
| `EmailPreferences` | Email notification settings form |
| `MessageThread` | Real-time messaging thread component |

## Usage

### Notification Bell (Future)

```typescript
"use client";
import { NotificationBell } from "@beep/comms-ui";
import * as Effect from "effect/Effect";

export function AppHeader({ userId }: { userId: string }) {
  return (
    <header>
      <h1>My App</h1>
      <NotificationBell userId={userId} />
    </header>
  );
}
```

### Toast Notifications (Future)

```typescript
"use client";
import { ToastProvider, useToast } from "@beep/comms-ui";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast("Operation completed successfully", "success");
  };

  return <button onClick={handleSuccess}>Do Something</button>;
}
```

### With TanStack Query Integration (Future)

```typescript
"use client";
import { NotificationList } from "@beep/comms-ui";
import { useQuery } from "@tanstack/react-query";
import * as NotificationContracts from "@beep/comms-client";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { Atom } from "@effect-atom/atom-react";

const runtime = Atom.runtime(clientRuntimeLayer);

export function NotificationsPage({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => runtime.runPromise(
      NotificationContracts.GetAll.implement({ userId })
    )
  });

  if (isLoading) return <div>Loading...</div>;

  return <NotificationList notifications={data ?? []} />;
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `react` | React library for UI components |
| `react-dom` | React DOM rendering |
| `@beep/comms-client` | Comms contracts for data fetching |
| `@beep/ui-core` | Design tokens and MUI theme |
| `@beep/runtime-client` | Client-side Effect runtime |
| `@tanstack/react-query` | Data fetching and caching |
| `@mui/material` | Material UI components |
| `@mui/icons-material` | Material UI icons |
| `effect` | Effect runtime for utilities in components |

## Integration

- **Client Layer**: Consumes contracts from `@beep/comms-client` for data operations
- **UI Core**: Uses design tokens and theme from `@beep/ui-core` for consistent styling
- **Runtime**: Integrates with `@beep/runtime-client` for Effect-based operations
- **Query Layer**: Uses TanStack Query for data fetching, caching, and optimistic updates

## Development

```bash
# Type check
bun run --filter @beep/comms-ui check

# Lint
bun run --filter @beep/comms-ui lint

# Lint and auto-fix
bun run --filter @beep/comms-ui lint:fix

# Build
bun run --filter @beep/comms-ui build

# Run tests
bun run --filter @beep/comms-ui test

# Test with coverage
bun run --filter @beep/comms-ui coverage

# Watch mode for development
bun run --filter @beep/comms-ui dev
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

- Add proper ARIA labels for notification indicators and message counts
- Implement focus management for dropdowns and modals
- Support keyboard navigation for notification lists and messaging interfaces
- Provide screen reader announcements for new notifications
- Use semantic HTML elements

### Real-Time Updates

For WebSocket-based real-time features:

- Integrate WebSocket contracts from `@beep/comms-client`
- Use Effect's streaming primitives for connection management
- Handle connection failures gracefully with user feedback
- Implement optimistic updates for better UX
- Debounce typing indicators and presence updates

### Styling

- Use MUI components from `@mui/material` as building blocks
- Apply Tailwind utilities for custom spacing and layout
- Follow design tokens from `@beep/ui-core` for colors, typography, and spacing
- Ensure components work in both light and dark modes
- Use responsive design patterns for mobile and desktop

### Testing

- Create Storybook stories for visual component testing
- Test component rendering with different prop combinations
- Verify accessibility with automated a11y testing tools
- Test integration with TanStack Query hooks
- Mock comms contracts for isolated component testing
- Use `@beep/testkit` for Effect-based test utilities

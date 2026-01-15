# @beep/customization-client

Client SDK layer for the customization slice, providing contracts for user preferences and personalization features.

## Purpose

The customization client package provides the SDK layer for all user preference and personalization features in the beep-effect application. It serves as the bridge between the customization domain logic and UI components, exposing typed RPC contracts for frontend applications to interact with theme settings, keyboard shortcuts, layout preferences, and other personalization options. The package uses Effect's contract-based architecture to ensure type-safe client-server communication with structured error handling.

This package is currently a minimal scaffold awaiting contract implementations as the customization feature set expands. Future implementations will include theme preference contracts, hotkey configuration contracts, and layout customization contracts.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/customization-client": "workspace:*"
```

## Key Exports

This package is currently in scaffold state with a placeholder `beep` export. Future exports will include:

| Export | Description |
|--------|-------------|
| `ThemeContracts` | Contract kit for theme and appearance preferences |
| `HotkeyContracts` | Contract kit for keyboard shortcut configuration |
| `LayoutContracts` | Contract kit for layout and UI customization |
| `PreferenceContracts` | Contract kit for general user preferences |

## Usage

### Basic Contract Usage (Future)

Once contracts are implemented, they will follow this pattern:

```typescript
import * as ThemeContracts from "@beep/customization-client";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const updateTheme = F.pipe(
  ThemeContracts.Update.implement({
    userId: "user-123",
    theme: "dark",
    primaryColor: "#3b82f6"
  }),
  Effect.catchTag("CustomizationError", (error) =>
    Effect.log({ message: "Theme update failed", error })
  )
);
```

### With TanStack Query (Future)

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import * as HotkeyContracts from "@beep/customization-client";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { Atom } from "@effect-atom/atom-react";
import * as F from "effect/Function";

const runtime = Atom.runtime(clientRuntimeLayer);

function HotkeySettings({ userId }: { userId: string }) {
  const { data: hotkeys } = useQuery({
    queryKey: ["hotkeys", userId],
    queryFn: () => runtime.runPromise(
      HotkeyContracts.Get.implement({ userId })
    )
  });

  const updateHotkeys = useMutation({
    mutationFn: (newHotkeys: Record<string, string>) =>
      runtime.runPromise(
        HotkeyContracts.Update.implement({ userId, hotkeys: newHotkeys })
      )
  });

  return <div>{/* Render hotkey configuration */}</div>;
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@beep/customization-domain` | Domain models for customization slice |
| `@beep/schema` | Reusable Effect schemas for validation |
| `@beep/errors` | Error handling and telemetry |

## Integration

- **Domain Layer**: Consumes entity models and business logic from `@beep/customization-domain`
- **Server Layer**: Contracts implemented here must have corresponding handlers in `@beep/customization-server`
- **UI Layer**: Components in `@beep/customization-ui` consume these contracts via TanStack Query hooks
- **Shared Client**: Follows patterns established in `@beep/shared-client` for contract structure

## Development

```bash
# Type check
bun run --filter @beep/customization-client check

# Lint
bun run --filter @beep/customization-client lint

# Lint and auto-fix
bun run --filter @beep/customization-client lint:fix

# Build
bun run --filter @beep/customization-client build

# Run tests
bun run --filter @beep/customization-client test

# Test with coverage
bun run --filter @beep/customization-client coverage

# Watch mode for development
bun run --filter @beep/customization-client dev
```

## Notes

### Contract Definition Guidelines

When implementing contracts, follow these patterns:

- Use `S.TaggedError` for structured error types (e.g., `CustomizationError`)
- Include metadata annotations for domain/method tracking
- Keep contracts thin - business logic belongs in `@beep/customization-domain` and `@beep/customization-server`
- Use `"use client"` directive for React-specific exports that need client-side bundling

### Preference Storage

Consider these patterns for preference persistence:

- Store user-level preferences in database via server contracts
- Cache preferences in browser local storage for offline access
- Sync preferences across devices using Effect's sync primitives
- Provide sensible defaults when preferences are not set

### Error Handling

All contracts should use structured error channels:

- Define a `CustomizationError` tagged error type with code, message, and metadata
- Use Effect's `catchTag` for predictable error handling
- Provide detailed error messages for client-side user feedback
- Handle partial preference updates gracefully

### Testing

- Test contract schema validation (payload, success, failure schemas)
- Mock server responses for contract implementations
- Verify error normalization and structured metadata
- Test preference merge logic and default fallbacks
- Use `@beep/testkit` for Effect-based test utilities

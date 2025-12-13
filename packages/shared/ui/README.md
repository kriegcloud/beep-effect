# @beep/shared-ui

Cross-cutting UI utilities for shared React components and patterns.

## Purpose

This package serves as a placeholder for shared UI utilities that don't belong in the component library (`@beep/ui`) or design system (`@beep/ui-core`). It is intended for:
- Cross-slice UI utilities used by multiple feature domains
- React hooks and patterns shared between `@beep/iam-ui` and `@beep/documents-ui`
- Browser-specific utilities that bridge Effect runtime with DOM APIs

Currently, this package contains minimal placeholder exports and is being prepared for future expansion.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-ui": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `beep` | Placeholder constant (will be replaced with actual utilities) |

## Usage

This package is currently in development. Future utilities will include:
- File upload and validation helpers
- Dropzone state management
- Stable React callback utilities
- Clipboard integration hooks

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/ui` | Component library integration |
| `@beep/shared-domain` | Domain models for UI interactions |
| `@beep/schema` | Schema validation utilities |
| `@beep/utils` | Common utility functions |
| `@beep/errors` | Error handling and logging |

## Integration

This package will provide shared utilities for:
- `@beep/iam-ui` - Authentication UI flows
- `@beep/documents-ui` - Document upload and management UI
- `apps/web` - Next.js frontend components

## Development

```bash
# Type check
bun run --filter @beep/shared-ui check

# Lint
bun run --filter @beep/shared-ui lint

# Build
bun run --filter @beep/shared-ui build

# Test
bun run --filter @beep/shared-ui test
```

## Notes

- This package is currently a placeholder and will be expanded as shared UI patterns emerge
- For file upload utilities, see `@beep/documents-domain` and `@beep/documents-infra`
- For React hooks like `useEvent`, see `@beep/ui/ui`
- For file type validation, see `@beep/schema` integrations

# @beep/customization-client

Effect-based client contracts for the Customization slice.

## Overview

Provides the client-side API surface for customization operations. This package:
- Defines RPC contracts for user preferences, themes, and hotkey customization
- Exports typed client handlers consumed by `@beep/web` and other frontend apps
- Sits in the `customization/client` layer of the vertical slice architecture
- Currently a minimal scaffold awaiting contract definitions as the customization feature matures

**Location**: `packages/customization/client/`

## Package Metadata

| Property | Value |
|----------|-------|
| Package Name | `@beep/customization-client` |
| Type | `module` (ESM) |
| Status | Awaiting Implementation |
| Exports | `src/index.ts`, `src/*.ts` |

## Key Exports

> **Status**: Implementation pending

**Planned Exports:**
- `CustomizationContracts` — RPC contract definitions for customization operations
- `CustomizationHandlers` — Client-side handlers for theme/preference updates
- `HotkeyContracts` — Contracts for user hotkey management

## Dependencies

| Package | Purpose | Location |
|---------|---------|----------|
| `effect` | Core Effect runtime | Peer dependency |
| `@beep/customization-domain` | Domain entities and value objects | `packages/customization/domain/` |

**Note**: This package does NOT have direct runtime dependencies on `@beep/customization-server` — communication happens via RPC contracts.

## Architecture Context

### Slice Structure

The customization slice follows this dependency order:
```
domain -> tables -> server -> client -> ui
                       ↓
                 (RPC boundary)
```

### Cross-Package Relationships

- **Consumed by**: `@beep/customization-ui`, `@beep/web`
- **Communicates with**: `@beep/customization-server` (via RPC contracts)

## Usage Patterns


### With Layer Composition (Planned)

```typescript
import * as Layer from "effect/Layer";
import { CustomizationClientLive } from "@beep/customization-client";
import { HttpClientLive } from "@beep/shared-client";

const AppLayer = Layer.provide(CustomizationClientLive, HttpClientLive);
```

## Authoring Guardrails

- **CRITICAL**: ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`) and rely on Effect collections/utilities instead of native helpers.
- Maintain typed error channels using `S.TaggedError` for predictable client-side error handling.
- Keep contracts thin — business logic belongs in domain or server layers, NOT in client contracts.
- Use `"use client"` directive for React-specific exports that need client-side bundling.
- NEVER use `any`, `@ts-ignore`, or unchecked casts. ALWAYS validate external data with schemas.

## Testing

```bash
# Run all tests
bun run test --filter=@beep/customization-client

# Run with coverage
bun run coverage --filter=@beep/customization-client

# Type checking
bun run check --filter @beep/customization-client

# Linting
bun run lint --filter @beep/customization-client
bun run lint:fix --filter @beep/customization-client
```

**Testing Guidelines:**
- Use Bun's built-in test runner (no separate testing package required)
- ALWAYS test contract request/response schemas
- Test error mapping completeness
- Verify contract annotations are correct

## Common Patterns & Gotchas

### Settings Schema Must Match UI-Core
**Symptom**: Customization changes don't apply; theme resets to defaults; console errors about unknown settings fields.

**Root Cause**: Customization contracts define settings fields that don't align with `@beep/ui-core` SettingsState schema.

**Solution**: Customization schemas MUST import settings types from `@beep/ui-core` directly. When adding new customization options, update BOTH the contract schema AND the ui-core settings schema simultaneously.

### Server-Side vs Client-Side Customization Application
**Symptom**: Customizations apply on page reload but not immediately; SSR shows default theme.

**Root Cause**: Customization data fetched client-side arrives after initial render.

**Solution**: For SSR-compatible customization, fetch settings server-side and pass through initial props. Use `@beep/ui-core` settings provider that accepts initial state. Document which customizations are SSR-safe.

### Contract Response Caching and Stale Settings
**Symptom**: User changes customization but sees old settings after navigating away and back.

**Root Cause**: TanStack Query caches contract responses; stale cache serves old customization data.

**Solution**: Customization mutation contracts MUST invalidate relevant query caches on success. Use `queryClient.invalidateQueries` with appropriate keys. Consider optimistic updates for immediate feedback.

### Tenant-Scoped vs User-Scoped Customization
**Symptom**: User's personal customizations override org-wide branding; or vice versa.

**Root Cause**: Customization contracts don't clearly separate tenant-level and user-level settings.

**Solution**: Define separate contracts for tenant customization and user preferences. Document merge precedence (typically: tenant defaults < user overrides). Contracts should explicitly include scope identifiers.

### Color Preset Validation
**Symptom**: Custom theme colors cause accessibility issues or render as invalid CSS.

**Root Cause**: Contract accepts arbitrary color strings without validation.

**Solution**: Color customization schemas MUST validate hex/rgb format AND contrast ratios. Use `@beep/ui-core` preset validation utilities. Consider restricting to predefined palettes for brand consistency.

### Customization Contract Versioning
**Symptom**: Old clients crash when server returns new customization fields; new clients fail with old servers.

**Root Cause**: Breaking changes to customization response schema without version migration.

**Solution**: Customization contracts MUST include schema version field. Client should handle unknown fields gracefully (strip via schema). When adding required fields, provide defaults for backward compatibility.

## See Also

- [Customization Domain](../domain/AGENTS.md) — Entity definitions and business logic
- [Customization Server](../server/AGENTS.md) — Server-side implementation
- [Customization Tables](../tables/AGENTS.md) — Database schemas
- [UI Core Package](../../ui/core/AGENTS.md) — Settings and theme system

## Contributor Checklist



- [ ] Add proper TypeScript doc comments for contract exports
- [ ] Use Effect Schema for all data validation — no bare type assertions
- [ ] Verify namespace imports for Effect modules (`Effect`, `A`, `F`, `O`, `Str`, `S`)
- [ ] Test contract schemas with valid and invalid payloads
- [ ] Document error cases and failure modes
- [ ] Run verification commands (`check`, `lint`, `test`) before committing

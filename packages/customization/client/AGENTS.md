# @beep/customization-client — Agent Guide

## Purpose & Fit
- Provides the client-side CLIENT layer for the customization slice, enabling frontend applications to interact with customization features.
- Contains API contracts, client-side services, and type definitions for client-server communication.
- Acts as the bridge between the customization domain and UI layers, exposing typed contracts for TanStack Query and Effect-based client runtimes.
- Currently a minimal scaffold awaiting contract definitions as the customization feature matures.

## Surface Map (Exports)

> **Status**: Awaiting implementation

Will export RPC contracts for customization features (themes, preferences).

## Usage Snapshots
- Frontend apps import contracts from this package to invoke customization-related RPC calls.
- TanStack Query hooks wrap contracts for React component consumption.
- Effect client runtime uses contracts to execute type-safe requests against the server.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Define contracts using `@beep/contract` patterns — each contract should specify request/response schemas and error types.
- Maintain typed error channels using `S.TaggedError` for predictable client-side error handling.
- Keep contracts thin — business logic belongs in domain or server layers.
- Use `"use client"` directive for React-specific exports that need client-side bundling.

## Verifications
- `bun run check --filter @beep/customization-client`
- `bun run lint --filter @beep/customization-client`
- `bun run test --filter @beep/customization-client`

## Testing

- Run tests: `bun run test --filter=@beep/customization-client`
- Use `@beep/testkit` for Effect testing utilities
- ALWAYS test contract request/response schemas
- Test error mapping completeness

## Gotchas

### Settings Schema Must Match UI-Core
- **Symptom**: Customization changes don't apply; theme resets to defaults; console errors about unknown settings fields.
- **Root Cause**: Customization contracts define settings fields that don't align with `@beep/ui-core` SettingsState schema.
- **Solution**: Customization schemas MUST import settings types from `@beep/ui-core` directly. When adding new customization options, update BOTH the contract schema AND the ui-core settings schema simultaneously.

### Server-Side vs Client-Side Customization Application
- **Symptom**: Customizations apply on page reload but not immediately; SSR shows default theme.
- **Root Cause**: Customization data fetched client-side arrives after initial render.
- **Solution**: For SSR-compatible customization, fetch settings server-side and pass through initial props. Use `@beep/ui-core` settings provider that accepts initial state. Document which customizations are SSR-safe.

### Contract Response Caching and Stale Settings
- **Symptom**: User changes customization but sees old settings after navigating away and back.
- **Root Cause**: TanStack Query caches contract responses; stale cache serves old customization data.
- **Solution**: Customization mutation contracts MUST invalidate relevant query caches on success. Use `queryClient.invalidateQueries` with appropriate keys. Consider optimistic updates for immediate feedback.

### Tenant-Scoped vs User-Scoped Customization
- **Symptom**: User's personal customizations override org-wide branding; or vice versa.
- **Root Cause**: Customization contracts don't clearly separate tenant-level and user-level settings.
- **Solution**: Define separate contracts for tenant customization and user preferences. Document merge precedence (typically: tenant defaults < user overrides). Contracts should explicitly include scope identifiers.

### Color Preset Validation
- **Symptom**: Custom theme colors cause accessibility issues or render as invalid CSS.
- **Root Cause**: Contract accepts arbitrary color strings without validation.
- **Solution**: Color customization schemas MUST validate hex/rgb format AND contrast ratios. Use `@beep/ui-core` preset validation utilities. Consider restricting to predefined palettes for brand consistency.

### Customization Contract Versioning
- **Symptom**: Old clients crash when server returns new customization fields; new clients fail with old servers.
- **Root Cause**: Breaking changes to customization response schema without version migration.
- **Solution**: Customization contracts MUST include schema version field. Client should handle unknown fields gracefully (strip via schema). When adding required fields, provide defaults for backward compatibility.

## Quick Recipes

### Define a New Contract
```typescript
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

export class MyRequest extends Rpc.StreamRequest<MyRequest>()(
  "MyRequest",
  { failure: MyError, success: S.String, payload: { id: S.String } }
) {}
```

## Contributor Checklist
- [ ] Define contracts with proper request/response schemas following `@beep/contract` patterns.
- [ ] Ensure all contracts have corresponding server-side implementations in `@beep/customization-server`.
- [ ] Add proper TypeScript doc comments for contract exports.
- [ ] Use Effect Schema for all data validation — no bare type assertions.
- [ ] Re-run verification commands above before handing work off.

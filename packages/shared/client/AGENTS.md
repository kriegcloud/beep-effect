# @beep/shared-client — AGENTS Guide

## Purpose & Fit

- Provides shared CLIENT (client-server glue) contracts for cross-cutting concerns consumed by applications and feature slices.
- Currently serves as a placeholder package for future shared client contracts that don't belong to specific vertical slices (IAM, Documents).
- Designed to house shared RPC contracts, API client utilities, and cross-slice Effect-based client services when they emerge.
- Maintains clean separation between slice-specific CLIENTs (`@beep/iam-client`, `@beep/documents-client`) and shared client infrastructure.

## Surface Map

Currently minimal:
- **`src/index.ts`** — Barrel export with placeholder constant
- **`src/client.ts`** — Empty file reserved for future client utilities

## Package Status

This package is in early stages and serves as a placeholder for shared CLIENT infrastructure. As cross-cutting client needs emerge, this package will grow to include:

- Shared RPC client contracts (Effect-based)
- Common API client utilities
- Shared query/mutation hooks for TanStack Query
- Client-side Effect services that span multiple slices
- Cross-slice client observability utilities

## Usage Patterns

### Current State

```typescript
import { beep } from "@beep/shared-client";
// Placeholder export
```

### Future Patterns (Examples)

When this package matures, it may include:

**Shared RPC Client**:
```typescript
import { SharedClient } from "@beep/shared-client/client";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const client = yield* SharedClient;
  const result = yield* client.healthCheck();
  return result;
});
```

**Shared Query Utilities**:
```typescript
import { useSharedQuery } from "@beep/shared-client/hooks";

function MyComponent() {
  const { data, isLoading } = useSharedQuery({
    queryKey: ["shared", "resource"],
    effect: SharedClient.getResource,
  });
}
```

## Integration Points

### With Feature Slices
- `@beep/iam-client` — IAM-specific contracts remain in iam/client
- `@beep/documents-client` — Documents-specific contracts remain in documents/client
- This package is for cross-slice client infrastructure only

### With Runtime
- `@beep/runtime/client` — Client ManagedRuntime for browser Effect execution
- Future shared CLIENT contracts will integrate with client runtime layers

### With Applications
- `apps/web` — Will consume shared CLIENT when client contracts emerge
- Future API client utilities will be imported from this package

## Dependencies

- `@beep/shared-domain` — Shared entity models and domain logic
- `@beep/schema` — Effect Schema utilities
- `@beep/utils` — Runtime helpers
- `@beep/identity` — Package identity
- `@beep/errors` — Error infrastructure
- `@beep/constants` — Schema-backed enums
- `@beep/invariant` — Assertion contracts
- `@beep/shared-server` — Server infrastructure (for type alignment)
- `effect` — Effect runtime

## Authoring Guardrails

- Only add truly cross-cutting client concerns to this package
- Keep slice-specific CLIENT contracts in their respective packages
- Follow Effect-first patterns (no async/await in contracts)
- Use `Effect.Service` for client service definitions
- Export Layers for dependency injection
- Maintain browser-safe dependencies (no server-only code)

## Verifications

- `bun run check --filter @beep/shared-client` — Type check
- `bun run lint --filter @beep/shared-client` — Biome lint
- `bun run test --filter @beep/shared-client` — Bun test suite
- `bun run build --filter @beep/shared-client` — Build ESM/CJS artifacts

## Gotchas

### Cross-Cutting vs Slice-Specific Boundary
- **Symptom**: Functionality duplicated between this package and slice-specific clients (`@beep/iam-client`, `@beep/documents-client`).
- **Root Cause**: Unclear whether a concern is truly cross-cutting or belongs in a vertical slice.
- **Solution**: A concern belongs here ONLY if it is used by 2+ slices AND does not depend on slice-specific domain types. Authentication helpers belong in `@beep/iam-client`; document-specific clients belong in `@beep/documents-client`.

### Browser-Only Dependencies Leaking to Server
- **Symptom**: Build errors or runtime crashes when importing this package on server side.
- **Root Cause**: Package contains browser-only APIs (DOM, IndexedDB, localStorage) that server bundles try to include.
- **Solution**: Use `"use client"` directive on React-specific exports. For Effect services, provide mock/no-op implementations via conditional layers. Test imports in both browser and Node contexts.

### Circular Dependencies with Slice Clients
- **Symptom**: Import errors or undefined exports when slice clients import from shared-client or vice versa.
- **Root Cause**: Shared client depends on slice types, and slice clients depend on shared infrastructure.
- **Solution**: Shared-client MUST NOT import from slice clients. If shared functionality needs slice types, define interfaces in `@beep/shared-domain` and implement in slices. Run `bun run lint:circular` to detect.

### Layer Composition Order
- **Symptom**: Runtime errors about missing services when composing shared client layers with slice layers.
- **Root Cause**: Layer dependencies not provided in correct order; shared layers may depend on slice layers or vice versa.
- **Solution**: Document layer dependency order explicitly. Shared client layers should be "lower" in the stack (provided first). Use `Layer.provideMerge` for composition and test layer construction in isolation.

### TanStack Query Key Collisions
- **Symptom**: Stale data or unexpected cache invalidation when multiple slices use shared query utilities.
- **Root Cause**: Query keys from different slices collide in the shared query cache.
- **Solution**: Shared query utilities MUST namespace query keys with slice identifiers. Use factory functions that prepend slice names to keys (e.g., `["shared", "iam", "session"]` vs `["shared", "documents", "list"]`).

## Contributor Checklist

- [ ] Verify new additions are truly cross-cutting (not slice-specific)
- [ ] Keep browser-safe dependencies (check for Node.js-only imports)
- [ ] Follow Effect Service pattern for client services
- [ ] Export Layers for runtime composition
- [ ] Add type tests when introducing new contracts
- [ ] Update this AGENTS.md when adding significant functionality
- [ ] Coordinate with slice CLIENT maintainers to NEVER duplicate functionality

## Future Work

This package will grow organically as cross-cutting client needs emerge. Potential additions:

- Shared RPC client base class
- Common API error handling utilities
- Client-side telemetry/logging services
- Shared query cache utilities
- Cross-slice client authentication helpers
- Browser storage abstractions (LocalStorage, IndexedDB via Effect)

Until then, this package remains minimal and serves as a marker for future shared client infrastructure.

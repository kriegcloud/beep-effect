# @beep/shared-client — AGENTS Guide

## Purpose & Fit

- Provides shared SDK (client-server glue) contracts for cross-cutting concerns consumed by applications and feature slices.
- Currently serves as a placeholder package for future shared client contracts that don't belong to specific vertical slices (IAM, Documents).
- Designed to house shared RPC contracts, API client utilities, and cross-slice Effect-based client services when they emerge.
- Maintains clean separation between slice-specific SDKs (`@beep/iam-client`, `@beep/documents-client`) and shared client infrastructure.

## Surface Map

Currently minimal:
- **`src/index.ts`** — Barrel export with placeholder constant
- **`src/client.ts`** — Empty file reserved for future client utilities

## Package Status

This package is in early stages and serves as a placeholder for shared SDK infrastructure. As cross-cutting client needs emerge, this package will grow to include:

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
- `@beep/iam-client` — IAM-specific contracts remain in iam/sdk
- `@beep/documents-client` — Documents-specific contracts remain in documents/sdk
- This package is for cross-slice client infrastructure only

### With Runtime
- `@beep/runtime/client` — Client ManagedRuntime for browser Effect execution
- Future shared SDK contracts will integrate with client runtime layers

### With Applications
- `apps/web` — Will consume shared SDK when client contracts emerge
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
- Keep slice-specific SDK contracts in their respective packages
- Follow Effect-first patterns (no async/await in contracts)
- Use `Effect.Service` for client service definitions
- Export Layers for dependency injection
- Maintain browser-safe dependencies (no server-only code)

## Verifications

- `bun run check --filter @beep/shared-client` — Type check
- `bun run lint --filter @beep/shared-client` — Biome lint
- `bun run test --filter @beep/shared-client` — Bun test suite
- `bun run build --filter @beep/shared-client` — Build ESM/CJS artifacts

## Contributor Checklist

- [ ] Verify new additions are truly cross-cutting (not slice-specific)
- [ ] Keep browser-safe dependencies (check for Node.js-only imports)
- [ ] Follow Effect Service pattern for client services
- [ ] Export Layers for runtime composition
- [ ] Add type tests when introducing new contracts
- [ ] Update this AGENTS.md when adding significant functionality
- [ ] Coordinate with slice SDK maintainers to avoid duplication

## Future Work

This package will grow organically as cross-cutting client needs emerge. Potential additions:

- Shared RPC client base class
- Common API error handling utilities
- Client-side telemetry/logging services
- Shared query cache utilities
- Cross-slice client authentication helpers
- Browser storage abstractions (LocalStorage, IndexedDB via Effect)

Until then, this package remains minimal and serves as a marker for future shared client infrastructure.

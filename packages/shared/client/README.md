# @beep/shared-client

Client-facing SDK layer for cross-cutting concerns.

## Purpose

`@beep/shared-client` provides Effect-first contracts and client utilities that span multiple slices, enabling typed communication between frontend clients and backend services without duplicating logic per slice.

This package serves as:
- The server-client glue layer that normalizes cross-cutting SDK patterns
- A foundation for shared client contracts and utilities used across multiple slices (IAM, Documents, etc.)
- Domain-agnostic infrastructure; slice-specific contracts belong in `@beep/iam-client`, `@beep/documents-client`, etc.

Consumed by client runtimes (`@beep/runtime-client`) and TanStack Query integrations.

### Current Status

Currently a placeholder package while shared client patterns stabilize. The package exports a single constant and will grow to house:
- Cross-slice client utilities (auth wrappers, request interceptors, error normalization)
- Shared contract helpers that don't belong to a specific slice
- Common client-side Effect patterns (retry policies, timeout configurations, circuit breakers)

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-client": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `beep` | Placeholder constant (will be replaced with actual SDK infrastructure) |

### When to Use This Package

Use `@beep/shared-client` when:
- Building client utilities needed by multiple slices
- Creating shared contract patterns that span domains
- Implementing cross-cutting concerns like telemetry, logging, or error handling for SDK clients
- Avoiding duplication of common client logic across slice-specific SDKs

Do NOT use for:
- Slice-specific contracts (use `@beep/iam-client`, `@beep/documents-client`, etc.)
- Server-side utilities (use `@beep/shared-server` instead)
- UI components (use `@beep/shared-ui` instead)

## Usage

### Current Usage

```typescript
import { beep } from "@beep/shared-client";

// Currently only exports a placeholder constant
console.log(beep); // "beep"
```

### Future Patterns (Planned)

When this package matures, it will include:

**Effect-First Client Utilities**:
```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Example: Retry wrapper for client requests
export const fetchWithRetry = <E, A>(
  fetcher: Effect.Effect<A, E>
) => F.pipe(
  fetcher,
  Effect.retry({ times: 3 })
);
```

**Shared Contract Patterns**:
```typescript
import { Contract } from "@beep/contract";
import * as S from "effect/Schema";
import * as Context from "effect/Context";

// Shared contracts for cross-cutting concerns
export const HealthCheck = Contract.make("HealthCheck", {
  description: "Check service health status",
  payload: S.Struct({}),
  success: S.Struct({
    status: S.Literal("healthy", "degraded", "unhealthy"),
    timestamp: S.Number,
  }),
  failure: S.Struct({ message: S.String }),
  failureMode: "error",
})
  .annotate(Contract.Domain, "shared")
  .annotate(Contract.Method, "health.check")
  .annotate(Contract.Title, "Health Check")
  .annotateContext(Context.empty());
```

**Import Conventions**:
```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// Single-letter aliases for frequently used modules
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-domain` | Cross-slice entities and value objects |
| `@beep/schema` | EntityId factories and schema utilities |
| `@beep/utils` | Pure runtime helpers |
| `@beep/identity` | Package identity |
| `@beep/errors` | Logging and telemetry utilities |
| `@beep/constants` | Schema-backed enums |
| `@beep/invariant` | Assertion contracts |
| `@beep/contract` | Contract system for RPC-style communication |
| `@beep/shared-server` | Server infrastructure (for type alignment) |
| `effect` | Core Effect runtime |

## Integration

### With Feature Slices
- `@beep/iam-client` — IAM-specific contracts remain in iam/sdk
- `@beep/documents-client` — Documents-specific contracts remain in documents/sdk
- This package is for cross-slice client infrastructure only

### With Runtime
- `@beep/runtime-client` — Client ManagedRuntime for browser Effect execution
- Future shared SDK contracts will integrate with client runtime layers

### With Applications
- `apps/web` — Will consume shared SDK when client contracts emerge
- Future API client utilities will be imported from this package

## Development

```bash
# Type check
bun run --filter @beep/shared-client check

# Lint
bun run --filter @beep/shared-client lint
bun run --filter @beep/shared-client lint:fix

# Build
bun run --filter @beep/shared-client build

# Test
bun run --filter @beep/shared-client test
bun run --filter @beep/shared-client coverage

# Circular dependency check
bun run --filter @beep/shared-client lint:circular
```

## Notes

### Development Guidelines

When extending this package:
- Mirror patterns from `@beep/contract` for contract definitions
- Keep all APIs Effect-first (no async/await)
- Use Effect collection utilities (`A.map`, `A.filter`) instead of native array methods
- Use Effect string utilities (`Str.split`, `Str.trim`) instead of native string methods
- Use `effect/Match` for pattern matching instead of switch statements
- Use `effect/Predicate` for type guards instead of typeof/instanceof
- Add tests under `packages/shared/client/test/` using `@beep/testkit`
- Document new utilities in both README and AGENTS.md

### Type Safety
- No `any`, `@ts-ignore`, or unchecked casts
- Validate external data with `effect/Schema`
- Use branded types from `@beep/schema` for identifiers

### Observability
- Use `Effect.log*` with structured objects for logging
- Add span annotations for tracing via `@effect/opentelemetry`
- Include domain/method metadata in all contract definitions

### Browser Compatibility
- Maintain browser-safe dependencies (no server-only code)
- Keep slice-specific SDK contracts in their respective packages
- Only add truly cross-cutting client concerns to this package

### Contributor Checklist
- [ ] Verify new additions are truly cross-cutting (not slice-specific)
- [ ] Keep browser-safe dependencies (check for Node.js-only imports)
- [ ] Use Effect namespace imports and collection/string helpers
- [ ] Follow `effect/Schema` uppercase constructors: `S.Struct`, `S.Array`, `S.String`
- [ ] Add tests for all new utilities using `@beep/testkit`
- [ ] Document new exports and patterns in this README
- [ ] Run lint + check before commits; run build/tests when modifying exports
- [ ] Update AGENTS.md for package-specific authoring guardrails
- [ ] Coordinate with slice SDK maintainers to avoid duplication

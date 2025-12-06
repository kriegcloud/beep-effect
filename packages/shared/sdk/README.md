# @beep/shared-sdk

Client-facing SDK layer for cross-cutting concerns. Provides Effect-first contracts and client utilities that span multiple slices, enabling typed communication between frontend clients and backend services without duplicating logic per slice.

## Purpose and fit
- Shared client contracts and utilities used across multiple slices (IAM, Documents, etc.)
- Server-client glue layer that normalizes cross-cutting SDK patterns
- Domain-agnostic: slice-specific contracts belong in `@beep/iam-sdk`, `@beep/documents-sdk`, etc.
- Works with client runtimes (`@beep/runtime-client`) and TanStack Query integrations

## Status
Currently a placeholder export (`beep`) while shared client patterns stabilize. This package will house:
- Cross-slice client utilities (auth wrappers, request interceptors, error normalization)
- Shared contract helpers that don't belong to a specific slice
- Common client-side Effect patterns (retry policies, timeout configurations, circuit breakers)

## When to use this package
Use `@beep/shared-sdk` when:
- Building client utilities needed by multiple slices
- Creating shared contract patterns that span domains
- Implementing cross-cutting concerns like telemetry, logging, or error handling for SDK clients
- Avoiding duplication of common client logic across slice-specific SDKs

Do NOT use for:
- Slice-specific contracts (use `@beep/iam-sdk`, `@beep/documents-sdk`, etc.)
- Server-side utilities (use `@beep/shared-infra` instead)
- UI components (use `@beep/shared-ui` instead)

## Architecture principles

### Effect-first development
```typescript
// ✅ REQUIRED - Effect-based client utilities
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";

export const fetchWithRetry = <E, A>(
  fetcher: Effect.Effect<A, E>
) => F.pipe(
  fetcher,
  Effect.retry({ times: 3 })
);

// ❌ FORBIDDEN - async/await or bare Promises
export const fetchWithRetry = async (url: string) => {
  return await fetch(url);
};
```

### Contract patterns
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

### Import conventions
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

## Development guidelines

### When extending
- Mirror patterns from `@beep/contract` for contract definitions
- Keep all APIs Effect-first (no async/await)
- Use Effect collection utilities (`A.map`, `A.filter`) instead of native array methods
- Use Effect string utilities (`Str.split`, `Str.trim`) instead of native string methods
- Add tests under `packages/shared/sdk/test/` using `@beep/testkit`
- Document new utilities in both README and package-level AGENTS.md when created

### Type safety
- No `any`, `@ts-ignore`, or unchecked casts
- Validate external data with `effect/Schema`
- Use branded types from `@beep/schema` for identifiers

### Observability
- Use `Effect.log*` with structured objects for logging
- Add span annotations for tracing via `@effect/opentelemetry`
- Include domain/method metadata in all contract definitions

## Verification and scripts

```bash
# Type checking
bun run check --filter=@beep/shared-sdk

# Linting
bun run lint --filter=@beep/shared-sdk
bun run lint:fix --filter=@beep/shared-sdk

# Testing
bun run test --filter=@beep/shared-sdk
bun run coverage --filter=@beep/shared-sdk

# Building
bun run build --filter=@beep/shared-sdk

# Optional circular dependency check
bun run lint:circular --filter=@beep/shared-sdk
```

## Integration with other packages

### Dependencies
- `@beep/shared-domain` — Cross-slice entities and value objects
- `@beep/schema` — EntityId factories and schema utilities
- `@beep/utils` — Pure runtime helpers
- `@beep/contract` — Contract system for RPC-style communication
- `@beep/errors` — Logging and telemetry utilities
- `effect` — Core Effect runtime

### Consumers
- `apps/web` — Next.js frontend application
- `@beep/runtime-client` — Browser ManagedRuntime
- Slice-specific SDKs that need shared utilities

## Contributor checklist
- Keep contracts and utilities slice-agnostic; slice-specific logic belongs in `@beep/iam-sdk`, `@beep/documents-sdk`, etc.
- Use Effect namespace imports and collection/string helpers (no native array/string methods)
- Follow `effect/Schema` uppercase constructors: `S.Struct`, `S.Array`, `S.String` (never lowercase)
- Add tests for all new utilities using `@beep/testkit`
- Document new exports and patterns in this README
- Run lint + check before commits; run build/tests when modifying exports
- Update AGENTS.md (when created) for package-specific authoring guardrails

## See also
- `packages/shared/sdk/AGENTS.md` — Package-specific authoring guardrails (to be created)
- `packages/common/contract/README.md` — Contract system documentation
- `AGENTS.md` — Repository-wide AI collaboration guidelines
- `docs/patterns/` — Implementation recipes and patterns

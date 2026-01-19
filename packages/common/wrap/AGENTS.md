# @beep/wrap — Agent Guide

## Purpose & Fit
- System-wide constants and utility wrappers for the beep-effect monorepo.
- Provides centralized configuration values and branded type factories.
- Consumed by multiple packages for consistent constant definitions.
- Depends on `@beep/schema`, `@beep/identity`, and `@beep/invariant` for core utilities.

## Surface Map
- **Index (`src/index.ts`)** — Main barrel export for constants and utilities.
- **Constants** — System-wide configuration values and magic numbers.
- **Wrappers** — Utility functions for common operations.

## Usage Snapshots
- Various packages import constants for consistent configuration.
- Shared utilities used across domain and infrastructure layers.

## Authoring Guardrails
- ALWAYS use Effect namespace imports for all Effect modules.
- Constants MUST be typed using `as const` for literal types.
- NEVER export mutable values; all exports must be immutable.
- Branded types MUST use `@beep/schema` patterns.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import { SystemConstants } from "@beep/wrap";

// Use system constants
const maxRetries = SystemConstants.MAX_RETRY_COUNT;
const defaultTimeout = SystemConstants.DEFAULT_TIMEOUT_MS;

// Use with Effect
const configuredOperation = Effect.gen(function* () {
  yield* Effect.timeout(someEffect, defaultTimeout);
});
```

## Verifications
- `bun run check --filter @beep/wrap`
- `bun run lint --filter @beep/wrap`
- `bun run test --filter @beep/wrap`

## Contributor Checklist
- [ ] Constants use `as const` for literal type inference.
- [ ] No mutable exports.
- [ ] Documentation for each constant explaining its purpose.

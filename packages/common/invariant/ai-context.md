---
path: packages/common/invariant
summary: Runtime assertion API with schema-backed errors - invariant, nonNull, unreachable
tags: [assertions, runtime-checks, error-handling, debugging]
---

# @beep/invariant

Canonical runtime assertion library providing `invariant`, `invariant.nonNull`, and `invariant.unreachable` with structured `InvariantViolation` errors. Designed for Effect-based codebases where assertions throw schema-backed errors that callers can pattern-match and convert into domain failures.

## Architecture

```
|-------------------|
|   invariant()     |  <-- Main assertion function with helper attachments
|-------------------|
        |
        | throws on failure
        v
|-------------------|     |-------------------|
| InvariantViolation|---->|   CallMetadata    |
|-------------------|     |-------------------|
  (tagged error)           (schema-validated)
        |
        | pattern-matchable by
        v
|-------------------|
| Effect.catchTag   |
| HTTP handlers     |
| Domain layers     |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `invariant.ts` | Core assertion with `BUG:` debugger trigger, path trimming, helper attachments |
| `error.ts` | `InvariantViolation` error class with file/line/args metadata |
| `meta.ts` | `CallMetadata` Effect Schema (non-empty file, non-negative line, args array) |
| `index.ts` | Barrel exports for consumers |

## Usage Patterns

### Basic Assertion

```typescript
import * as Effect from "effect/Effect";
import { invariant, InvariantViolation } from "@beep/invariant";

invariant(user.role === "admin", "admin access required", {
  file: "packages/iam/server/src/AdminGuard.ts",
  line: 42,
  args: [user.role],
});
```

### Non-Null Narrowing

```typescript
import { invariant } from "@beep/invariant";

const getToken = (session: { token?: string | null }) => {
  invariant.nonNull(session.token, "session missing token", {
    file: "packages/auth/server/src/Session.ts",
    line: 28,
    args: [session],
  });
  return session.token; // narrowed to string
};
```

### Exhaustiveness Check

```typescript
import { invariant } from "@beep/invariant";

type Status = "active" | "inactive" | "pending";

const statusLabel = (status: Status): string => {
  switch (status) {
    case "active": return "Active";
    case "inactive": return "Inactive";
    case "pending": return "Pending";
    default:
      return invariant.unreachable(status, "unhandled status", {
        file: "packages/shared/ui/src/StatusBadge.tsx",
        line: 15,
        args: [status],
      });
  }
};
```

### Effect Integration

```typescript
import * as Effect from "effect/Effect";
import { invariant, InvariantViolation } from "@beep/invariant";

const program = Effect.try({
  try: () => {
    invariant.nonNull(env.DATABASE_URL, "missing database url", {
      file: "packages/server/src/db.ts",
      line: 10,
      args: [],
    });
    return env.DATABASE_URL;
  },
  catch: (error) =>
    error instanceof InvariantViolation
      ? error
      : new Error("unexpected failure"),
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `BUG:` prefix triggers debugger | Immediate dev-mode feedback for impossible states |
| Lazy message `() => string` | Avoid formatting cost on fast path |
| Path trimming to `packages/...` | Keep logs clean, avoid absolute path leakage |
| Schema-backed CallMetadata | Ensures metadata is always serializable for telemetry |
| Error.captureStackTrace | Cleaner stacks by hiding invariant frame |
| No I/O or logging | Pure assertion layer, transport handled elsewhere |

## Dependencies

**Internal**: None (leaf package)

**External**: `effect` (Schema, Array, String, Option, Function)

## Related

- **AGENTS.md** - Detailed contributor guidance and usage snapshots

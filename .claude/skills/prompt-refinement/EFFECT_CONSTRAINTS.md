# Effect Constraints for beep-effect Repository

This file documents repository-specific constraints that must be included in refined prompts. These are derived from the root `AGENTS.md` and package-level `AGENTS.md` files.

## Forbidden Patterns

### Native Array Methods

```typescript
// FORBIDDEN - Native Array methods
items.map((item) => item.name);
items.filter((item) => item.active);
items.forEach((item) => process(item));
items.find((item) => item.id === id);
items.some((item) => item.valid);
items.every((item) => item.complete);
items.reduce((acc, item) => acc + item.value, 0);
Array.from(iterable);

// REQUIRED - Effect Array utilities with pipe
import * as A from "effect/Array";
import * as F from "effect/Function";

F.pipe(items, A.map((item) => item.name));
F.pipe(items, A.filter((item) => item.active));
F.pipe(items, A.forEach((item) => process(item)));
F.pipe(items, A.findFirst((item) => item.id === id));
F.pipe(items, A.some((item) => item.valid));
F.pipe(items, A.every((item) => item.complete));
F.pipe(items, A.reduce(0, (acc, item) => acc + item.value));
F.pipe(iterable, A.fromIterable);
```

### Native String Methods

```typescript
// FORBIDDEN - Native String methods
str.charAt(0).toUpperCase();
str.split(" ");
str.trim();
str.includes("search");

// REQUIRED - Effect String utilities
import * as Str from "effect/String";

F.pipe(str, Str.charAt(0), O.map(Str.toUpperCase));
F.pipe(str, Str.split(" "));
F.pipe(str, Str.trim);
F.pipe(str, Str.includes("search"));
```

### Native Date

```typescript
// FORBIDDEN - Native Date
new Date();
new Date("2025-01-15");
date.setDate(date.getDate() + 1);
date.toISOString();

// REQUIRED - Effect DateTime
import * as DateTime from "effect/DateTime";

DateTime.unsafeNow();
DateTime.unsafeMake("2025-01-15");
DateTime.add(date, { days: 1 });
DateTime.formatIso(date);
```

### Switch Statements

```typescript
// FORBIDDEN - switch statements
switch (response._tag) {
  case "loading": return "Loading...";
  case "success": return `Found ${response.data.length} items`;
  case "error": return `Error: ${response.error}`;
}

// REQUIRED - Effect Match
import * as Match from "effect/Match";

Match.value(response).pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => `Found ${r.data.length} items`),
  Match.tag("error", (r) => `Error: ${r.error}`),
  Match.exhaustive
);
```

### Async/Await and Try/Catch

```typescript
// FORBIDDEN - async/await
async function fetchUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch user");
  }
}

// REQUIRED - Effect patterns
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const fetchUser = (id: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(`/api/users/${id}`),
      catch: () => new FetchError({ message: "Network error" })
    });
    const json = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => new ParseError({ message: "Invalid JSON" })
    });
    return yield* S.decodeUnknown(UserSchema)(json);
  });
```

### Bare No-ops

```typescript
// FORBIDDEN - bare no-op functions
() => null
() => {}
async () => null

// REQUIRED - @beep/utils no-ops
import { nullOp, noOp, nullOpE } from "@beep/utils";

nullOp      // instead of () => null
noOp        // instead of () => {}
nullOpE     // instead of () => Effect.succeed(null)
```

## Required Patterns

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";

// Single-letter aliases for frequently used modules
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as R from "effect/Record";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as M from "@effect/sql/Model";
import * as B from "effect/Brand";
import * as DateTime from "effect/DateTime";
import * as Match from "effect/Match";
```

### Tagged Errors

```typescript
// REQUIRED - Schema TaggedError for all errors
import * as S from "effect/Schema";

class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String }
) {}

class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  { field: S.String, message: S.String }
) {}
```

### Service Pattern

```typescript
// REQUIRED - Context.Tag + make pattern
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

class UserService extends Context.Tag("UserService")<
  UserService,
  {
    readonly getById: (id: UserId) => Effect.Effect<User, UserNotFoundError>;
    readonly create: (input: CreateUserInput) => Effect.Effect<User, ValidationError>;
  }
>() {}

const UserServiceLive = Layer.succeed(UserService, {
  getById: (id) => Effect.gen(function* () { /* ... */ }),
  create: (input) => Effect.gen(function* () { /* ... */ }),
});
```

### PascalCase Constructors

```typescript
// REQUIRED - Always use PascalCase exports from Schema
S.Struct({ ... })    // not S.struct
S.Array(S.String)    // not S.array
S.String             // not S.string
S.Number             // not S.number
```

## Package Boundaries

### Cross-Slice Imports

```typescript
// FORBIDDEN - Direct cross-slice imports
import { User } from "../../iam/domain/User";
import { File } from "../../../documents/domain/File";

// REQUIRED - Import through shared packages
import { User } from "@beep/iam-domain";
import { File } from "@beep/documents-domain";
```

### Path Aliases

Always use `@beep/*` aliases defined in `tsconfig.base.jsonc`:

```typescript
// REQUIRED
import { EntityId } from "@beep/schema";
import { Db } from "@beep/shared-infra";

// FORBIDDEN
import { EntityId } from "../../../packages/common/schema/src";
```

## Validation Requirements

Before considering code complete:

1. `bun run check` - TypeScript compilation passes
2. `bun run lint` - Biome linting passes
3. `bun run test` - All tests pass (if applicable)

## Quick Reference Table

| Category | Forbidden | Required |
|----------|-----------|----------|
| Arrays | `.map()`, `.filter()`, etc. | `A.map`, `A.filter` via pipe |
| Strings | `.split()`, `.trim()`, etc. | `Str.split`, `Str.trim` via pipe |
| Dates | `new Date()` | `DateTime.unsafeNow()` |
| Control | `switch`, long if-else | `Match.value().pipe()` |
| Async | `async/await`, `try/catch` | `Effect.gen`, `Effect.tryPromise` |
| Errors | `throw new Error()` | `Schema.TaggedError` |
| No-ops | `() => null`, `() => {}` | `nullOp`, `noOp` from `@beep/utils` |
| Imports | Relative `../` paths | `@beep/*` aliases |

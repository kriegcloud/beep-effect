# Struct — Agent Context

> Best practices for using `effect/Struct` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Struct.entries` | Get key-value pairs | `Struct.entries(obj)` |
| `Struct.keys` | Get object keys | `Struct.keys(obj)` |
| `Struct.values` | Get object values | `Struct.values(obj)` |
| `Struct.pick(...keys)` | Select specific keys | `Struct.pick("a", "b")(obj)` |
| `Struct.omit(...keys)` | Exclude specific keys | `Struct.omit("c")(obj)` |
| `Struct.get(key)` | Get value by key (returns Option) | `Struct.get("name")(obj)` |
| `Struct.has(key)` | Check if key exists | `Struct.has("id")(obj)` |
| `Struct.evolve` | Transform multiple fields | `Struct.evolve(obj, { age: n => n + 1 })` |

## Codebase Patterns

### Object Iteration

ALWAYS use `Struct.entries` instead of `Object.entries`:

```typescript
import * as Struct from "effect/Struct";
import * as A from "effect/Array";
import * as F from "effect/Function";

const config = { host: "localhost", port: 3000 };

// Iterate over entries
const entries = Struct.entries(config);
// [["host", "localhost"], ["port", 3000]]

// Filter entries
const filtered = F.pipe(
  config,
  Struct.entries,
  A.filter(([_k, v]) => typeof v === "number")
);

// Transform to array
const pairs = F.pipe(
  config,
  Struct.entries,
  A.map(([k, v]) => `${k}=${v}`)
);
```

### Object Keys and Values

```typescript
import * as Struct from "effect/Struct";

const user = { id: "1", name: "Alice", age: 30 };

// Get keys (typed)
const keys = Struct.keys(user);  // ("id" | "name" | "age")[]

// Get values
const values = Struct.values(user);  // (string | number)[]

// Count properties
const count = Struct.keys(user).length;
```

### Selecting and Omitting Fields

```typescript
import * as Struct from "effect/Struct";
import * as F from "effect/Function";

const user = {
  id: "1",
  name: "Alice",
  email: "alice@example.com",
  password: "hashed",
  createdAt: new Date(),
};

// Pick specific fields
const publicUser = Struct.pick(user, "id", "name");
// { id: "1", name: "Alice" }

// Omit sensitive fields
const safeUser = Struct.omit(user, "password");
// { id, name, email, createdAt }

// Pipeline form
const dto = F.pipe(
  user,
  Struct.omit("password", "createdAt")
);
```

### Transforming Objects

```typescript
import * as Struct from "effect/Struct";

const user = { name: "alice", age: 29 };

// Evolve multiple fields
const updated = Struct.evolve(user, {
  name: (s) => s.toUpperCase(),  // Note: Use Str.toUpperCase in real code
  age: (n) => n + 1,
});
// { name: "ALICE", age: 30 }
```

### Type-Safe Key Access

```typescript
import * as Struct from "effect/Struct";
import * as O from "effect/Option";

const config = { host: "localhost", port: 3000 };

// Safe key access (returns Option)
const host = Struct.get(config, "host");  // Option<string>

// Check key existence
if (Struct.has(config, "port")) {
  const port = config.port;  // Type-safe access
}
```

### Real Codebase Examples

**Icon Registration (packages/ui/core/src/constants/iconify/register-icons.ts)**:
```typescript
import * as A from "effect/Array";
import * as Struct from "effect/Struct";

export const iconSets = A.reduce(
  Struct.entries(allIcons),
  [] as IconifyJSON[],
  (acc, [k, v]) => {
    // Process icon entries
    return [...acc, processIcon(k, v)];
  }
);
```

**Theme Configuration (packages/ui/core/src/theme/core/components/link.tsx)**:
```typescript
import * as Struct from "effect/Struct";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as F from "effect/Function";

const filtered = F.pipe(
  themeConfig,
  Struct.entries,
  A.filter(([_k, v]) => !P.isNullable(v))
);
```

## Anti-Patterns

### NEVER use Object.entries/keys/values

```typescript
// FORBIDDEN - Native Object methods
Object.entries(obj)
Object.keys(obj)
Object.values(obj)
Object.hasOwnProperty.call(obj, "key")

// REQUIRED - Effect Struct utilities
import * as Struct from "effect/Struct";

Struct.entries(obj)
Struct.keys(obj)
Struct.values(obj)
Struct.has(obj, "key")
```

### NEVER mutate objects directly

```typescript
// FORBIDDEN - Direct mutation
obj.newKey = value;
delete obj.oldKey;

// REQUIRED - Immutable transformations
const updated = { ...obj, newKey: value };
const removed = Struct.omit(obj, "oldKey");
```

### NEVER use for...in loops

```typescript
// FORBIDDEN - for...in iteration
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log(key, obj[key]);
  }
}

// REQUIRED - Struct.entries with Effect iteration
import * as A from "effect/Array";

A.forEach(Struct.entries(obj), ([key, value]) => {
  Effect.log({ key, value })
});
```

## Type Safety

Struct operations preserve type information:

```typescript
import * as Struct from "effect/Struct";

const user: { id: string; name: string; age: number } = {
  id: "1",
  name: "Alice",
  age: 30,
};

// Type inference works
const picked = Struct.pick(user, "id", "name");
// Type: { id: string; name: string }

const omitted = Struct.omit(user, "age");
// Type: { id: string; name: string }
```

## Related Modules

- [Record.md](./Record.md) - Dictionary operations (dynamic keys)
- [Array.md](./Array.md) - Array operations (often used with `Struct.entries`)
- [Predicate.md](./Predicate.md) - Type guards for filtering entries

## Source Reference

[.repos/effect/packages/effect/src/Struct.ts](../../.repos/effect/packages/effect/src/Struct.ts)

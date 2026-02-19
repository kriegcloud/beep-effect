# Option — Agent Context

> Best practices for using `effect/Option` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `O.fromNullable(value)` | Nullable to Option | `O.fromNullable(user.email)` |
| `O.some(value)` | Create Some | `O.some(42)` |
| `O.none()` | Create None | `O.none()` |
| `O.map(option, fn)` | Transform value | `O.map(maybeUser, u => u.name)` |
| `O.flatMap(option, fn)` | Chain Options | `O.flatMap(maybeId, findUser)` |
| `O.filter(option, pred)` | Filter value | `O.filter(maybeAge, age => age >= 18)` |
| `O.getOrElse(option, fallback)` | Extract with default | `O.getOrElse(maybeUser, () => guest)` |
| `O.getOrNull(option)` | Extract or null | `O.getOrNull(maybeValue)` |
| `O.match(option, {onNone, onSome})` | Pattern match | `O.match(opt, { onNone: () => ..., onSome: v => ... })` |
| `O.isSome(option)` | Check if Some | `O.isSome(maybeUser)` |
| `O.isNone(option)` | Check if None | `O.isNone(maybeValue)` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as O from "effect/Option";

// FORBIDDEN - Named imports
import { fromNullable, map } from "effect/Option";  // WRONG!
```

### ALWAYS Use Option for Nullable Values

This codebase has **banned null checks and non-null assertions**. Route ALL nullable handling through `effect/Option`:

```typescript
// FORBIDDEN - Null checks
if (user !== null && user !== undefined) {
  console.log(user.name);
}

const name = user?.name ?? "Guest";
const email = user!.email;

// REQUIRED - Option handling
import * as O from "effect/Option";

const maybeUser = O.fromNullable(user);

O.match(maybeUser, {
  onNone: () => console.log("No user"),
  onSome: (u) => console.log(u.name)
});

const name = O.pipe(
  maybeUser,
  O.map(u => u.name),
  O.getOrElse(() => "Guest")
);
```

### Convert Nullable to Option

```typescript
import * as O from "effect/Option";
import * as A from "effect/Array";

// From nullable values
const maybeEmail = O.fromNullable(user.email);

// From array access (A.head returns Option)
const maybeFirst = A.head(users);

// From Map.get
const maybeValue = O.fromNullable(map.get(key));

// From DOM APIs
const maybeElement = O.fromNullable(document.getElementById("foo"));
```

### Pattern Match with O.match

```typescript
import * as O from "effect/Option";

const result = O.match(maybeUser, {
  onNone: () => "No user found",
  onSome: (user) => `Hello ${user.name}`
});
```

### Chain Options with flatMap

```typescript
import * as O from "effect/Option";

const maybeAddress = O.pipe(
  maybeUser,
  O.flatMap(user => O.fromNullable(user.address)),
  O.flatMap(addr => O.fromNullable(addr.zipCode))
);

// If any step returns None, entire chain returns None
```

### Transform with map

```typescript
import * as O from "effect/Option";

const maybeUpperName = O.pipe(
  maybeUser,
  O.map(user => user.name),
  O.map(name => name.toUpperCase())
);

// Returns None if maybeUser is None, otherwise Some(uppercase name)
```

### Extract with Default

```typescript
import * as O from "effect/Option";

// With function (lazy evaluation)
const user = O.getOrElse(maybeUser, () => guestUser);

// Direct value (strict evaluation)
const count = O.pipe(maybeCount, O.getOrElse(() => 0));

// Extract as null if needed for interop
const emailOrNull = O.getOrNull(maybeEmail);
```

### Filter Option Values

```typescript
import * as O from "effect/Option";

const maybeAdult = O.pipe(
  maybeAge,
  O.filter(age => age >= 18)
);

// Returns None if Option is None OR predicate fails
```

### Combine Multiple Options

```typescript
import * as O from "effect/Option";

// All must be Some, or result is None
const combined = O.all([maybeId, maybeEmail, maybeName]);
// Returns Option<[string, string, string]>

// With struct
const combined = O.all({
  id: maybeId,
  email: maybeEmail,
  name: maybeName
});
// Returns Option<{ id: string, email: string, name: string }>
```

### Use with Array Functions

```typescript
import * as A from "effect/Array";
import * as O from "effect/Option";

// A.head returns Option
const maybeFirst = A.head(users);

// A.get returns Option
const maybeThird = A.get(users, 2);

// A.findFirst returns Option
const maybeActive = A.findFirst(users, u => u.active);
```

## Anti-Patterns

### NEVER Use Null/Undefined Checks

```typescript
// FORBIDDEN
if (value !== null && value !== undefined) { }
if (value == null) { }
if (!value) { }
value?.prop
value ?? default

// REQUIRED - Option handling
import * as O from "effect/Option";
const option = O.fromNullable(value);
O.match(option, { onNone: () => {}, onSome: (v) => {} });
```

### NEVER Use Non-Null Assertions

```typescript
// FORBIDDEN
const value = map.get(key)!;
const first = array[0]!;
const element = document.getElementById("foo")!;

// REQUIRED - Option handling
import * as O from "effect/Option";
import * as A from "effect/Array";

const maybeValue = O.fromNullable(map.get(key));
const maybeFirst = A.head(array);
const maybeElement = O.fromNullable(document.getElementById("foo"));
```

### NEVER Use Optional Chaining

```typescript
// FORBIDDEN
const zipCode = user?.address?.zipCode;

// REQUIRED - Explicit Option chaining
import * as O from "effect/Option";

const maybeZipCode = O.pipe(
  O.fromNullable(user),
  O.flatMap(u => O.fromNullable(u.address)),
  O.flatMap(addr => O.fromNullable(addr.zipCode))
);
```

### NEVER Throw on None

```typescript
// FORBIDDEN
const value = option.getOrThrow();  // Does not exist!
if (O.isNone(option)) {
  throw new Error("Value required");
}

// REQUIRED - Use Effect for errors
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const getValue = (option: O.Option<string>) =>
  O.match(option, {
    onNone: () => Effect.fail(new MyError({ message: "Value required" })),
    onSome: (value) => Effect.succeed(value)
  });
```

## Related Modules

- **[Array.md](./Array.md)** - `A.head` and `A.get` return Option
- **[Match.md](./Match.md)** - Alternative pattern matching
- **[Either.md](./Either.md)** - Use Either when you need error information
- **effect/Effect** - Convert Option to Effect with `Effect.fromOption`

## Source Reference

[`.repos/effect/packages/effect/src/Option.ts`](../../.repos/effect/packages/effect/src/Option.ts)

## Key Takeaways

1. **ALWAYS** use `import * as O from "effect/Option"`
2. **NEVER** use null checks, optional chaining, or non-null assertions
3. **Use `O.fromNullable()`** to convert nullable values to Option
4. **Use `O.match()`** for pattern matching with exhaustive handling
5. **Use `O.flatMap()`** to chain operations that may return None
6. **Use `O.getOrElse()`** to extract with a default value
7. **Prefer Option** for "value may not exist" (vs Either for "operation may fail")

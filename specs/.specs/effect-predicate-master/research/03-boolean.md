# Effect Boolean Module Research

## Overview

The `effect/Boolean` module provides comprehensive utility functions and type class instances for working with the `boolean` type in TypeScript. It offers a functional programming approach to boolean operations with support for pattern matching, logical combinators, and collection predicates.

**Source File**: `tmp/effect/packages/effect/src/Boolean.ts`
**Type Definitions**: `node_modules/effect/dist/dts/Boolean.d.ts`
**Since**: Effect 2.0.0

---

## Module Structure

### Categories
1. **Guards** - Type guards for boolean values
2. **Pattern Matching** - Boolean-based control flow
3. **Combinators** - Logical operations on booleans
4. **Collection Utilities** - Aggregate boolean predicates
5. **Type Class Instances** - Equivalence and Order

---

## Functions Reference

### Guards

#### `isBoolean`
**Line**: 29
**Category**: guards
**Type Signature**:
```typescript
(input: unknown) => input is boolean
```

**Description**: Tests if a value is a `boolean` type guard.

**Implementation Note**: Delegates to `predicate.isBoolean` from `effect/Predicate`.

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.isBoolean(true);      // true
Bool.isBoolean("true");    // false
Bool.isBoolean(1);         // false
Bool.isBoolean(null);      // false
```

**Integration**: This is the same guard exported by `effect/Predicate`, ensuring consistency across the Effect ecosystem.

---

### Pattern Matching

#### `match`
**Line**: 46-58
**Category**: pattern matching
**Type Signature**:
```typescript
// Curried form
<A, B = A>(options: {
  readonly onFalse: LazyArg<A>
  readonly onTrue: LazyArg<B>
}): (value: boolean) => A | B

// Direct form
<A, B>(value: boolean, options: {
  readonly onFalse: LazyArg<A>
  readonly onTrue: LazyArg<B>
}): A | B
```

**Description**: Returns the result of either of the given functions depending on the boolean value. Useful for conditional execution without if-else statements.

**Implementation**:
```typescript
dual(2, <A, B>(value: boolean, options: {
  readonly onFalse: LazyArg<A>
  readonly onTrue: LazyArg<B>
}): A | B => value ? options.onTrue() : options.onFalse())
```

**Example**:
```typescript
import * as Bool from "effect/Boolean";

// Direct form
const message = Bool.match(true, {
  onFalse: () => "It's false!",
  onTrue: () => "It's true!"
});
// => "It's true!"

// Curried form (for pipe composition)
import * as F from "effect/Function";

const getMessage = Bool.match({
  onFalse: () => "Inactive",
  onTrue: () => "Active"
});

F.pipe(true, getMessage);  // => "Active"
F.pipe(false, getMessage); // => "Inactive"

// With side effects
const result = Bool.match(hasPermission, {
  onFalse: () => Effect.fail(new UnauthorizedError()),
  onTrue: () => Effect.succeed("Access granted")
});
```

**Use Cases**:
- Replace ternary operators with more readable code
- Compose boolean-based control flow in pipelines
- Lazy evaluation of branches (functions called only when needed)

---

### Combinators

All combinators support both curried and direct forms via the `dual` function, enabling flexible composition.

#### `not`
**Line**: 87
**Category**: combinators
**Type Signature**:
```typescript
(self: boolean) => boolean
```

**Description**: Negates the given boolean: `!self`

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.not(true);   // false
Bool.not(false);  // true

// In pipes
F.pipe(true, Bool.not);  // false
```

---

#### `and`
**Line**: 106-109
**Category**: combinators
**Type Signature**:
```typescript
// Curried
(that: boolean): (self: boolean) => boolean
// Direct
(self: boolean, that: boolean): boolean
```

**Description**: Combines two booleans using AND: `self && that`

**Truth Table**:
| self  | that  | result |
|-------|-------|--------|
| true  | true  | true   |
| true  | false | false  |
| false | true  | false  |
| false | false | false  |

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.and(true, true);   // true
Bool.and(true, false);  // false

// Curried form
const andTrue = Bool.and(true);
andTrue(true);   // true
andTrue(false);  // false

// Compose multiple conditions
F.pipe(
  isLoggedIn,
  Bool.and(hasPermission),
  Bool.and(isActive)
);
```

---

#### `nand`
**Line**: 128-131
**Category**: combinators
**Type Signature**:
```typescript
// Curried
(that: boolean): (self: boolean) => boolean
// Direct
(self: boolean, that: boolean): boolean
```

**Description**: Combines two booleans using NAND: `!(self && that)` (negated AND)

**Truth Table**:
| self  | that  | result |
|-------|-------|--------|
| true  | true  | false  |
| true  | false | true   |
| false | true  | true   |
| false | false | true   |

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.nand(true, true);   // false
Bool.nand(true, false);  // true

// "At least one must be false"
const incompatibleFeatures = Bool.nand(featureA, featureB);
```

---

#### `or`
**Line**: 150-153
**Category**: combinators
**Type Signature**:
```typescript
// Curried
(that: boolean): (self: boolean) => boolean
// Direct
(self: boolean, that: boolean): boolean
```

**Description**: Combines two booleans using OR: `self || that`

**Truth Table**:
| self  | that  | result |
|-------|-------|--------|
| true  | true  | true   |
| true  | false | true   |
| false | true  | true   |
| false | false | false  |

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.or(false, true);   // true
Bool.or(false, false);  // false

// Permission checks
const canAccess = F.pipe(
  isOwner,
  Bool.or(isAdmin),
  Bool.or(hasGuestAccess)
);
```

---

#### `nor`
**Line**: 172-175
**Category**: combinators
**Type Signature**:
```typescript
// Curried
(that: boolean): (self: boolean) => boolean
// Direct
(self: boolean, that: boolean): boolean
```

**Description**: Combines two booleans using NOR: `!(self || that)` (negated OR)

**Truth Table**:
| self  | that  | result |
|-------|-------|--------|
| true  | true  | false  |
| true  | false | false  |
| false | true  | false  |
| false | false | true   |

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.nor(false, false);  // true
Bool.nor(true, false);   // false

// "Neither condition is true"
const neitherActive = Bool.nor(featureEnabled, betaEnabled);
```

---

#### `xor`
**Line**: 194-197
**Category**: combinators
**Type Signature**:
```typescript
// Curried
(that: boolean): (self: boolean) => boolean
// Direct
(self: boolean, that: boolean): boolean
```

**Description**: Combines two booleans using XOR: `(!self && that) || (self && !that)` (exclusive OR)

**Truth Table**:
| self  | that  | result |
|-------|-------|--------|
| true  | true  | false  |
| true  | false | true   |
| false | true  | true   |
| false | false | false  |

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.xor(true, false);   // true
Bool.xor(true, true);    // false

// "Exactly one must be true"
const exclusiveMode = Bool.xor(lightMode, darkMode);

// Toggle detection
const hasChanged = Bool.xor(previousValue, currentValue);
```

---

#### `eqv`
**Line**: 216-219
**Category**: combinators
**Type Signature**:
```typescript
// Curried
(that: boolean): (self: boolean) => boolean
// Direct
(self: boolean, that: boolean): boolean
```

**Description**: Combines two booleans using EQV (aka XNOR): `!xor(self, that)` (equivalence)

**Truth Table**:
| self  | that  | result |
|-------|-------|--------|
| true  | true  | true   |
| true  | false | false  |
| false | true  | false  |
| false | false | true   |

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.eqv(true, true);    // true
Bool.eqv(true, false);   // false

// "Both have the same value"
const bothAgree = Bool.eqv(userConsent, termsAccepted);

// Synchronization check
const inSync = Bool.eqv(localState, remoteState);
```

---

#### `implies`
**Line**: 238-241
**Category**: combinators
**Type Signature**:
```typescript
// Curried
(that: boolean): (self: boolean) => boolean
// Direct
(self: boolean, that: boolean): boolean
```

**Description**: Combines two booleans using logical implication: `(!self || that)`. If `self` is true, then `that` must be true for the result to be true.

**Implementation**:
```typescript
dual(2, (self, that) => self ? that : true)
```

**Truth Table**:
| self  | that  | result | Interpretation           |
|-------|-------|--------|--------------------------|
| true  | true  | true   | Precondition met         |
| true  | false | false  | Precondition violated    |
| false | true  | true   | Precondition not needed  |
| false | false | true   | Precondition not needed  |

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.implies(true, true);   // true
Bool.implies(true, false);  // false
Bool.implies(false, false); // true (vacuous truth)

// "If premium user, then must be verified"
const validUserState = Bool.implies(isPremium, isVerified);

// "If debug mode, then logging must be enabled"
const validConfig = Bool.implies(debugMode, loggingEnabled);

// Compose invariants
const validSubscription = F.pipe(
  isActive,
  Bool.implies(hasPaymentMethod),
  Bool.and(F.pipe(isTrial, Bool.implies(withinTrialPeriod)))
);
```

**Use Cases**:
- Expressing preconditions and invariants
- Validation rules where one flag requires another
- Configuration constraints

---

### Collection Utilities

#### `every`
**Line**: 257-264
**Category**: collection utilities
**Type Signature**:
```typescript
(collection: Iterable<boolean>) => boolean
```

**Description**: Checks if all elements in a collection of boolean values are `true`.

**Implementation**:
```typescript
export const every = (collection: Iterable<boolean>): boolean => {
  for (const b of collection) {
    if (!b) {
      return false
    }
  }
  return true
}
```

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.every([true, true, true]);   // true
Bool.every([true, false, true]);  // false
Bool.every([]);                   // true (vacuous truth)

// Check all permissions
const hasAllPermissions = Bool.every([
  canRead,
  canWrite,
  canDelete
]);

// Validate all fields
const allFieldsValid = F.pipe(
  [emailValid, passwordValid, nameValid],
  Bool.every
);

// With Array.map
const allUsersActive = F.pipe(
  users,
  A.map(user => user.isActive),
  Bool.every
);
```

---

#### `some`
**Line**: 280-287
**Category**: collection utilities
**Type Signature**:
```typescript
(collection: Iterable<boolean>) => boolean
```

**Description**: Checks if at least one element in a collection of boolean values is `true`.

**Implementation**:
```typescript
export const some = (collection: Iterable<boolean>): boolean => {
  for (const b of collection) {
    if (b) {
      return true
    }
  }
  return false
}
```

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.some([true, false, true]);   // true
Bool.some([false, false, false]); // false
Bool.some([]);                    // false

// Check any permission
const hasAnyPermission = Bool.some([
  canRead,
  canWrite,
  canDelete
]);

// Validate at least one field
const anyFieldValid = F.pipe(
  [emailValid, phoneValid, usernameValid],
  Bool.some
);

// With Array.map
const anyUserActive = F.pipe(
  users,
  A.map(user => user.isActive),
  Bool.some
);
```

---

### Type Class Instances

#### `Equivalence`
**Line**: 64
**Category**: instances
**Type Signature**:
```typescript
equivalence.Equivalence<boolean>
```

**Description**: Type class instance for boolean equivalence comparison.

**Example**:
```typescript
import * as Bool from "effect/Boolean";

Bool.Equivalence(true, true);   // true
Bool.Equivalence(true, false);  // false

// Use in generic contexts
const compareFlags = (a: boolean, b: boolean) =>
  Bool.Equivalence(a, b);
```

---

#### `Order`
**Line**: 70
**Category**: instances
**Type Signature**:
```typescript
order.Order<boolean>
```

**Description**: Type class instance for ordering booleans. In Effect, `false < true`.

**Example**:
```typescript
import * as Bool from "effect/Boolean";
import * as O from "effect/Order";

// -1 if first < second, 0 if equal, 1 if first > second
O.compare(Bool.Order)(false, true);  // -1 (false < true)
O.compare(Bool.Order)(true, false);  // 1  (true > false)
O.compare(Bool.Order)(true, true);   // 0  (equal)

// Sort booleans
const flags = [true, false, true, false];
const sorted = F.pipe(
  flags,
  A.sort(Bool.Order)
);
// => [false, false, true, true]
```

---

## Integration with Predicate Composition

The `effect/Boolean` module integrates seamlessly with `effect/Predicate` for advanced predicate composition:

### Boolean Combinators as Predicate Builders

```typescript
import * as Bool from "effect/Boolean";
import * as P from "effect/Predicate";
import * as F from "effect/Function";

// Build complex predicates
const isValidUser = (user: User): boolean =>
  F.pipe(
    user.isActive,
    Bool.and(user.isVerified),
    Bool.and(F.pipe(user.isPremium, Bool.implies(user.hasPaymentMethod)))
  );

// Convert boolean function to predicate
const isValidUserPredicate: P.Predicate<User> = isValidUser;

// Use with Match
const getUserStatus = (user: User) =>
  Match.value(user).pipe(
    Match.when(isValidUserPredicate, () => "Active"),
    Match.orElse(() => "Inactive")
  );
```

### Combining Boolean Guards with Predicate Logic

```typescript
import * as Bool from "effect/Boolean";
import * as P from "effect/Predicate";

// Type-safe boolean checks
const validateConfig = (config: unknown): config is ValidConfig => {
  if (!P.isRecord(config)) return false;

  const hasRequiredFields = F.pipe(
    P.hasProperty(config, "apiKey"),
    Bool.and(P.hasProperty(config, "endpoint"))
  );

  if (!hasRequiredFields) return false;

  const isValidType = F.pipe(
    P.isString(config.apiKey),
    Bool.and(P.isString(config.endpoint))
  );

  return isValidType;
};
```

### Boolean Collection Utilities with Predicates

```typescript
import * as Bool from "effect/Boolean";
import * as P from "effect/Predicate";
import * as A from "effect/Array";

// Check if all items match multiple predicates
const allItemsValid = <T>(
  items: ReadonlyArray<T>,
  ...predicates: ReadonlyArray<P.Predicate<T>>
): boolean =>
  F.pipe(
    items,
    A.map(item =>
      F.pipe(
        predicates,
        A.map(pred => pred(item)),
        Bool.every
      )
    ),
    Bool.every
  );

// Usage
const allUsersValid = allItemsValid(
  users,
  (u) => u.age >= 18,
  (u) => P.isNotNullable(u.email),
  (u) => u.isVerified
);
```

### Pattern Matching with Boolean Guards

```typescript
import * as Bool from "effect/Boolean";
import * as Match from "effect/Match";

// Type-safe pattern matching on boolean properties
const getUserTier = (user: User) =>
  Match.value(user).pipe(
    Match.when(
      (u) => Bool.and(u.isPremium, u.isVerified),
      () => "Premium Verified"
    ),
    Match.when(
      (u) => u.isPremium,
      () => "Premium"
    ),
    Match.when(
      (u) => u.isVerified,
      () => "Verified"
    ),
    Match.orElse(() => "Basic")
  );
```

---

## Practical Patterns

### 1. Configuration Validation

```typescript
import * as Bool from "effect/Boolean";
import * as Effect from "effect/Effect";

class ConfigError extends Schema.TaggedError<ConfigError>()(
  "ConfigError",
  { message: Schema.String }
) {}

const validateConfig = (config: AppConfig) =>
  Effect.gen(function* () {
    // Check mutual exclusivity
    const validMode = Bool.xor(config.devMode, config.prodMode);

    if (!validMode) {
      return yield* new ConfigError({
        message: "Exactly one of devMode or prodMode must be enabled"
      });
    }

    // Check implications
    const validDebug = Bool.implies(config.debugMode, config.loggingEnabled);

    if (!validDebug) {
      return yield* new ConfigError({
        message: "Debug mode requires logging to be enabled"
      });
    }

    return config;
  });
```

### 2. Permission Systems

```typescript
import * as Bool from "effect/Boolean";
import * as A from "effect/Array";

interface Permission {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canAdmin: boolean;
}

const hasFullAccess = (perm: Permission): boolean =>
  Bool.every([perm.canRead, perm.canWrite, perm.canDelete]);

const hasAnyAccess = (perm: Permission): boolean =>
  Bool.some([perm.canRead, perm.canWrite, perm.canDelete]);

const canModify = (perm: Permission): boolean =>
  Bool.or(perm.canWrite, perm.canDelete);

// "Admin implies all permissions"
const isValidPermission = (perm: Permission): boolean =>
  F.pipe(
    perm.canAdmin,
    Bool.implies(hasFullAccess(perm))
  );
```

### 3. State Machine Validation

```typescript
import * as Bool from "effect/Boolean";
import * as Match from "effect/Match";

type State = "draft" | "pending" | "approved" | "rejected";

interface Document {
  state: State;
  hasChanges: boolean;
  isLocked: boolean;
}

const canEdit = (doc: Document): boolean =>
  Match.value(doc.state).pipe(
    Match.when("draft", () => Bool.not(doc.isLocked)),
    Match.when("pending", () => false),
    Match.when("approved", () => false),
    Match.when("rejected", () => Bool.not(doc.isLocked)),
    Match.exhaustive
  );

const canSubmit = (doc: Document): boolean =>
  F.pipe(
    doc.state === "draft",
    Bool.and(doc.hasChanges),
    Bool.and(Bool.not(doc.isLocked))
  );
```

### 4. Feature Flag Logic

```typescript
import * as Bool from "effect/Boolean";

interface FeatureFlags {
  newUI: boolean;
  betaFeatures: boolean;
  experimentalMode: boolean;
  devTools: boolean;
}

const shouldShowFeature = (
  flags: FeatureFlags,
  requireBeta: boolean,
  requireExperimental: boolean
): boolean =>
  F.pipe(
    // Feature must be enabled
    flags.newUI,
    // If requires beta, must have beta enabled
    Bool.and(Bool.implies(requireBeta, flags.betaFeatures)),
    // If requires experimental, must have experimental enabled
    Bool.and(Bool.implies(requireExperimental, flags.experimentalMode))
  );

// Usage
const showAdvancedEditor = shouldShowFeature(
  flags,
  true,  // requires beta
  false  // doesn't require experimental
);
```

### 5. Lazy Evaluation with Match

```typescript
import * as Bool from "effect/Boolean";
import * as Effect from "effect/Effect";

const processUser = (user: User) =>
  Bool.match(user.isActive, {
    onFalse: () =>
      Effect.logWarning("Skipping inactive user").pipe(
        Effect.as(null)
      ),
    onTrue: () =>
      Effect.gen(function* () {
        yield* Effect.log("Processing active user");
        const result = yield* performExpensiveOperation(user);
        return result;
      })
  });
```

---

## Comparison with Native JavaScript

### Why Use Effect Boolean Instead of Native Operators?

```typescript
// ❌ Native approach - imperative, not composable
function validateUser(user: User): boolean {
  if (!user.isActive) return false;
  if (!user.isVerified) return false;
  if (user.isPremium && !user.hasPaymentMethod) return false;
  return true;
}

// ✅ Effect approach - declarative, composable
const validateUser = (user: User): boolean =>
  F.pipe(
    user.isActive,
    Bool.and(user.isVerified),
    Bool.and(Bool.implies(user.isPremium, user.hasPaymentMethod))
  );

// ✅ Even better - reusable predicates
const isValidUser: P.Predicate<User> = (user) =>
  F.pipe(
    user.isActive,
    Bool.and(user.isVerified),
    Bool.and(Bool.implies(user.isPremium, user.hasPaymentMethod))
  );
```

### Pattern Matching vs Ternary

```typescript
// ❌ Nested ternaries - hard to read
const message = isPremium
  ? isVerified
    ? "Premium Verified User"
    : "Premium User (Unverified)"
  : isVerified
    ? "Free Verified User"
    : "Free User";

// ✅ Bool.match - clear and composable
const message = Bool.match(isPremium, {
  onTrue: () =>
    Bool.match(isVerified, {
      onTrue: () => "Premium Verified User",
      onFalse: () => "Premium User (Unverified)"
    }),
  onFalse: () =>
    Bool.match(isVerified, {
      onTrue: () => "Free Verified User",
      onFalse: () => "Free User"
    })
});

// ✅ Or use Match.value for more complex cases
const message = Match.value({ isPremium, isVerified }).pipe(
  Match.when(
    ({ isPremium, isVerified }) => Bool.and(isPremium, isVerified),
    () => "Premium Verified User"
  ),
  Match.when(
    ({ isPremium }) => isPremium,
    () => "Premium User (Unverified)"
  ),
  Match.when(
    ({ isVerified }) => isVerified,
    () => "Free Verified User"
  ),
  Match.orElse(() => "Free User")
);
```

---

## Best Practices

### 1. Use Dual Forms Appropriately

```typescript
// ✅ Direct form for simple cases
const result = Bool.and(true, false);

// ✅ Curried form in pipelines
const result = F.pipe(
  isActive,
  Bool.and(isVerified),
  Bool.and(hasPermission)
);
```

### 2. Prefer Named Functions for Complex Logic

```typescript
// ❌ Inline complexity
const isValid = F.pipe(
  a,
  Bool.and(b),
  Bool.or(c),
  Bool.and(d)
);

// ✅ Named predicates
const meetsBasicRequirements = F.pipe(a, Bool.and(b));
const hasOverride = c;
const isApproved = d;

const isValid = F.pipe(
  meetsBasicRequirements,
  Bool.or(hasOverride),
  Bool.and(isApproved)
);
```

### 3. Use `implies` for Invariants

```typescript
// ✅ Express "if A then B" constraints
const validConfig = F.pipe(
  config.useCache,
  Bool.implies(config.cacheProvider !== null)
);

const validSubscription = F.pipe(
  subscription.isPaid,
  Bool.implies(subscription.hasPaymentMethod)
);
```

### 4. Leverage Collection Utilities

```typescript
// ❌ Manual iteration
let allValid = true;
for (const flag of flags) {
  if (!flag) {
    allValid = false;
    break;
  }
}

// ✅ Bool.every
const allValid = Bool.every(flags);

// ✅ With transformation
const allUsersActive = F.pipe(
  users,
  A.map(u => u.isActive),
  Bool.every
);
```

### 5. Combine with Pattern Matching

```typescript
// ✅ Type-safe exhaustive matching
const getStatus = (user: User) =>
  Match.value(user).pipe(
    Match.when(
      (u) => Bool.and(u.isPremium, u.isVerified),
      () => "premium-verified" as const
    ),
    Match.when(
      (u) => u.isPremium,
      () => "premium" as const
    ),
    Match.when(
      (u) => u.isVerified,
      () => "verified" as const
    ),
    Match.exhaustive  // Type error if cases missing
  );
```

---

## Summary

The `effect/Boolean` module provides:

1. **14 functions** organized into 5 categories
2. **Dual-form combinators** supporting both direct and curried usage
3. **Pattern matching** with lazy evaluation via `match`
4. **Logical operators**: `and`, `or`, `not`, `nand`, `nor`, `xor`, `eqv`, `implies`
5. **Collection utilities**: `every`, `some`
6. **Type class instances**: `Equivalence`, `Order`
7. **Type guard**: `isBoolean` (from `effect/Predicate`)

### Key Advantages

- **Composable**: All functions work seamlessly in `F.pipe` chains
- **Dual-form**: Flexible API supporting both curried and direct usage
- **Type-safe**: Full TypeScript inference and type safety
- **Lazy**: `match` evaluates branches lazily
- **Complete**: Supports all standard boolean operations plus advanced ones (`implies`, `eqv`)
- **Integrated**: Works naturally with `effect/Predicate`, `effect/Match`, and `effect/Array`

### When to Use

- **Use `Bool.match`** instead of ternary operators for clarity
- **Use `Bool.implies`** for expressing preconditions and invariants
- **Use `Bool.every`/`Bool.some`** instead of manual loops
- **Use logical combinators** in pipelines for declarative boolean logic
- **Use with `effect/Predicate`** for type-safe predicate composition
- **Use with `effect/Match`** for exhaustive pattern matching on booleans

### Integration Points

- `effect/Predicate` - Type guards and predicate composition
- `effect/Match` - Pattern matching and control flow
- `effect/Array` - Collection transformations
- `effect/Function` - Pipe composition and utilities
- Type class system - `Equivalence` and `Order` instances

---

## Related Modules

- **effect/Predicate** - Type guards and predicate functions
- **effect/Match** - Pattern matching on discriminated unions
- **effect/Array** - Collection operations returning booleans
- **effect/Option** - Type-safe nullable values (alternative to boolean flags)
- **effect/Either** - Type-safe error handling (alternative to boolean success flags)

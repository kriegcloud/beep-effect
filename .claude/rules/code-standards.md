# Code Standards

## Style

```
nested-loops        → pipe(∘)
conditionals        → Match.typeTags(ADT) ∨ $match
domain-types        := Schema.TaggedStruct
imports             := ∀ X → import * as X from "effect/X"
{Date.now, random}  → {Clock, Random}
```

**Example - Nested Loops to Pipe:**
```typescript
// BEFORE: Nested loops
let total = 0;
for (const user of users) {
  for (const order of user.orders) {
    total += order.amount;
  }
}

// AFTER: Effect pipe
import * as A from "effect/Array";
import * as F from "effect/Function";
const total = F.pipe(
  users,
  A.flatMap(u => u.orders),
  A.reduce(0, (acc, o) => acc + o.amount)
);
```

**Example - Conditionals to Match:**
```typescript
// BEFORE: Switch statement
switch (status) {
  case "pending": return "⏳";
  case "approved": return "✓";
  case "rejected": return "✗";
  default: return "?";
}

// AFTER: Match pattern
import * as Match from "effect/Match";
Match.value(status).pipe(
  Match.when("pending", () => "⏳"),
  Match.when("approved", () => "✓"),
  Match.when("rejected", () => "✗"),
  Match.orElse(() => "?")
)
```

**Example - Domain Types as Schema.TaggedStruct:**
```typescript
// BEFORE: Plain interface
interface User {
  id: string;
  name: string;
  email: string;
}

// AFTER: Schema.TaggedStruct
import * as S from "effect/Schema";
export class User extends S.TaggedStruct("User")({
  id: S.String,
  name: S.String,
  email: S.String
}) {}
```

**Example - Namespace Imports:**
```typescript
// BEFORE: Named imports
import { Effect, pipe } from "effect";
import { Array as A } from "effect";

// AFTER: Namespace imports
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
```

**Example - Date.now/random to Clock/Random:**
```typescript
// BEFORE: Native Date and Math.random
const timestamp = Date.now();
const randomId = Math.floor(Math.random() * 1000);

// AFTER: Clock and Random services
import * as Effect from "effect/Effect";
import * as Clock from "effect/Clock";
import * as Random from "effect/Random";

const program = Effect.gen(function* () {
  const clock = yield* Clock.Clock;
  const timestamp = yield* clock.currentTimeMillis;
  const randomId = yield* Random.nextIntBetween(0, 1000);
  return { timestamp, randomId };
});
```

## Effect Pattern Preferences

```
Effect.gen          over  Effect.flatMap chains
pipe(a, f, g)       over  g(f(a))
Schema.TaggedStruct over  plain interfaces
Layer.provide       over  manual dependency passing
catchTag            over  catchAll with conditionals
Data.TaggedError    over  new Error()

as any              →  Schema.decode ∨ type guard
Promise             →  Effect.tryPromise
try/catch           →  Effect.try ∨ Effect.catchTag
null/undefined      →  Option<A>
throw               →  Effect.fail(TaggedError)
```

**Example - Effect.gen over flatMap chains:**
```typescript
// BEFORE: flatMap chains
Effect.succeed(userId)
  .pipe(Effect.flatMap(id => getUser(id)))
  .pipe(Effect.flatMap(user => getOrders(user)))
  .pipe(Effect.map(orders => orders.length));

// AFTER: Effect.gen
import * as Effect from "effect/Effect";
Effect.gen(function* () {
  const user = yield* getUser(userId);
  const orders = yield* getOrders(user);
  return orders.length;
});
```

**Example - pipe over nested calls:**
```typescript
// BEFORE: Nested function calls
const result = processResult(
  transformData(
    parseInput(rawData)
  )
);

// AFTER: pipe
import * as F from "effect/Function";
const result = F.pipe(
  rawData,
  parseInput,
  transformData,
  processResult
);
```

**Example - Schema.TaggedStruct over plain interfaces:**
```typescript
// BEFORE: Plain interface
interface UserCreated {
  _tag: "UserCreated";
  userId: string;
  timestamp: Date;
}

// AFTER: Schema.TaggedStruct
import * as S from "effect/Schema";
export class UserCreated extends S.TaggedStruct("UserCreated")({
  userId: S.String,
  timestamp: S.Date
}) {}
```

**Example - Layer.provide over manual dependency passing:**
```typescript
// BEFORE: Manual dependency passing
const service = new UserService(db, logger, cache);
const result = await service.getUser(id);

// AFTER: Layer.provide
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const program = Effect.gen(function* () {
  const service = yield* UserService;
  return yield* service.getUser(id);
}).pipe(Effect.provide(UserServiceLive));
```

**Example - catchTag over catchAll with conditionals:**
```typescript
// BEFORE: catchAll with conditionals
effect.pipe(
  Effect.catchAll(error => {
    if (error._tag === "NotFound") return Effect.succeed(null);
    if (error._tag === "Unauthorized") return Effect.fail(error);
    return Effect.die(error);
  })
);

// AFTER: catchTag
effect.pipe(
  Effect.catchTag("NotFound", () => Effect.succeed(null))
);
```

**Example - Data.TaggedError over new Error:**
```typescript
// BEFORE: new Error
if (!user) throw new Error("User not found");

// AFTER: Data.TaggedError
import * as S from "effect/Schema";
export class UserNotFound extends S.TaggedError<UserNotFound>()("UserNotFound", {
  userId: S.String
}) {}

if (!user) return Effect.fail(new UserNotFound({ userId }));
```

**Example - Schema.decode over 'as any':**
```typescript
// BEFORE: Type casting
const data = JSON.parse(response) as User;

// AFTER: Schema.decode
import * as S from "effect/Schema";
const UserSchema = S.Struct({ id: S.String, name: S.String });
const data = yield* S.decode(UserSchema)(JSON.parse(response));
```

**Example - Effect.tryPromise over Promise:**
```typescript
// BEFORE: async/await
async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return await response.json();
}

// AFTER: Effect.tryPromise
import * as Effect from "effect/Effect";
const getUser = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`/api/users/${id}`).then(r => r.json()),
    catch: (error) => new FetchError({ cause: error })
  });
```

**Example - Effect.try over try/catch:**
```typescript
// BEFORE: try/catch
try {
  const data = JSON.parse(input);
  return data;
} catch (error) {
  console.error("Parse failed", error);
  return null;
}

// AFTER: Effect.try
import * as Effect from "effect/Effect";
Effect.try({
  try: () => JSON.parse(input),
  catch: (error) => new ParseError({ cause: error })
});
```

**Example - Option over null/undefined:**
```typescript
// BEFORE: null checks
const user = users.find(u => u.id === id);
if (user === undefined) return null;
return user.name;

// AFTER: Option
import * as O from "effect/Option";
import * as A from "effect/Array";
import * as F from "effect/Function";
F.pipe(
  A.findFirst(users, u => u.id === id),
  O.map(u => u.name)
);
```

**Example - Effect.fail(TaggedError) over throw:**
```typescript
// BEFORE: throw
function divide(a: number, b: number) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// AFTER: Effect.fail(TaggedError)
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

class DivisionByZero extends S.TaggedError<DivisionByZero>()("DivisionByZero", {
  dividend: S.Number
}) {}

const divide = (a: number, b: number) =>
  b === 0
    ? Effect.fail(new DivisionByZero({ dividend: a }))
    : Effect.succeed(a / b);
```

## UI Standards

```
¬borders → lightness-variation
depth := f(background-color)
elevation := Δlightness ∧ ¬stroke
```

## Documentation Philosophy

```
principle := self-explanatory(code) → ¬comments

forbidden := {
  inline-comments,
  @example blocks,
  excessive-jsdoc
}

unclear(code) → rewrite(code) ∧ ¬comment(code)
```

## Code Field Principles

```
-- inhibition > instruction

pre(code)           := stated(assumptions)
claim(correct)      := verified(correct)
handle(path)        := ∀path ∈ {happy, edge, adversarial}

surface-before-handle := {
  assumptions(input, environment),
  break-conditions,
  adversarial(caller),
  confusion(maintainer)
}

forbidden := {
  code ← ¬assumptions,
  claim(correct) ← ¬verified,
  happy-path ∧ gesture(rest),
  import(¬needed),
  solve(¬asked),
  produce(¬debuggable(3am))
}

correctness ≠ "works"
correctness := conditions(works) ∧ behavior(¬conditions)
```

**Example - Handle all paths (happy, edge, adversarial):**
```typescript
// BEFORE: Happy path only
const deleteUser = (userId: string) =>
  Effect.gen(function* () {
    const user = yield* userRepo.findById(userId);
    yield* userRepo.delete(userId);
    return { success: true };
  });

// AFTER: All paths handled
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

class UserNotFound extends S.TaggedError<UserNotFound>()("UserNotFound", {
  userId: S.String
}) {}

class UserHasActiveOrders extends S.TaggedError<UserHasActiveOrders>()("UserHasActiveOrders", {
  userId: S.String,
  orderCount: S.Number
}) {}

const deleteUser = (userId: string) =>
  Effect.gen(function* () {
    // Happy: user exists and can be deleted
    const user = yield* userRepo.findById(userId);

    // Edge: user has dependent data
    const orders = yield* orderRepo.findByUserId(userId);
    if (orders.length > 0) {
      return yield* Effect.fail(
        new UserHasActiveOrders({ userId, orderCount: orders.length })
      );
    }

    // Adversarial: empty/invalid userId caught by schema
    yield* userRepo.delete(userId);
    return { success: true };
  }).pipe(
    Effect.catchTag("NotFound", () =>
      Effect.fail(new UserNotFound({ userId }))
    )
  );
```

**Example - Correctness = conditions(works) ∧ behavior(¬conditions):**
```typescript
// BEFORE: "Works" but undefined behavior on failure
const getUserName = (userId: string) =>
  Effect.gen(function* () {
    const user = yield* userRepo.findById(userId);
    return user.name;  // What if user not found?
  });

// AFTER: Explicit behavior for all conditions
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

class UserNotFound extends S.TaggedError<UserNotFound>()("UserNotFound", {
  userId: S.String
}) {}

const getUserName = (userId: string) =>
  Effect.gen(function* () {
    const user = yield* userRepo.findById(userId);
    return user.name;
  }).pipe(
    // Behavior when condition "user exists" is false
    Effect.catchTag("NotFound", (error) =>
      Effect.fail(new UserNotFound({ userId }))
    )
  );
```

---

These code standards define the style, patterns, and quality expectations for all code in the beep-effect monorepo. The formal notation captures critical principles that guide implementation decisions.

# Pattern Analysis - Effect Match and Type Guards

**Generated**: 2026-01-15
**Phase**: 0 - Discovery & Pattern Research

## Task 0.1: Effect Match Findings

### Key Discovery: Match is NOT the Right Tool

After researching Effect's Match module, the conclusion is clear: **Match is for runtime value discrimination, not compile-time type narrowing**.

#### Why Match Cannot Help Here

1. **Match.when does NOT narrow generic type parameters**
   - Predicates like `(c) => c.payloadSchema !== undefined` don't trigger TypeScript's type narrowing
   - The input type remains unchanged throughout the Match pipeline

2. **Generic type parameters are erased at runtime**
   - Match cannot dispatch based on compile-time type information
   - It only works with runtime values

3. **Optional properties don't create discriminated unions**
   - `Match.tag` requires literal discriminant fields
   - `{ payloadSchema?: Schema }` doesn't qualify

#### Match.orElse Return Type Behavior

```typescript
const result = F.pipe(
  value,
  Match.when(pred1, () => "string"),
  Match.when(pred2, () => 42),
  Match.orElse(() => null)
);
// Type: string | number | null  (union of all branches)
```

This union behavior would lose the distinct overload return types we need.

### Evidence from Effect Codebase

Effect's own source uses **function overloads** for conditional signatures based on parameter presence. Example from `effect/src/Effect.ts`:

```typescript
// Effect.gen has overloads for different generator signatures
export function gen<Eff extends EffectGen<any, any, any>, AEff>(
  f: (resume: Adapter) => Generator<Eff, AEff, never>
): Effect<...>;

export function gen<Eff extends EffectGen<any, any, any>, AEff>(
  self: Eff,
  f: (resume: Adapter) => Generator<Eff, AEff, never>
): Effect<...>;
```

This validates that **overloads are the canonical Effect pattern**.

## Task 0.2: Type Guard Pattern Research

### The Core Problem

TypeScript's control flow analysis narrows *value types* but not *generic type parameters*:

```typescript
function factory<P extends Schema | undefined>(config: { payloadSchema?: P }) {
  if (config.payloadSchema !== undefined) {
    // config.payloadSchema is narrowed to: Exclude<P, undefined>
    // BUT P itself is still: Schema | undefined
    // So P-dependent types (like execute signature) aren't narrowed
  }
}
```

### Pattern: Separate Implementation Functions

The solution is to **dispatch to separate functions** where types are explicitly constrained:

```typescript
// Each implementation has explicit, non-generic types
function createWithPayload<P extends Schema, S extends Schema>(
  config: ConfigWithPayload<P, S>
): HandlerWithPayload<P, S> {
  // P is guaranteed to be Schema, not Schema | undefined
  // No assertions needed
}

function createNoPayload<S extends Schema>(
  config: ConfigNoPayload<S>
): HandlerNoPayload<S> {
  // payloadSchema doesn't exist in this type
  // No assertions needed
}

// Main function dispatches based on runtime check
export function createHandler(config: Config): Handler {
  if (config.payloadSchema !== undefined) {
    return createWithPayload(config);  // TypeScript allows this
  }
  return createNoPayload(config);
}
```

### Pattern: Type Guards with Explicit Narrowing

Custom type guards can provide explicit type narrowing:

```typescript
interface ConfigWithPayload<P, S> {
  payloadSchema: P;  // Required, not optional
  execute: (encoded: Encoded<P>) => Promise<Response>;
  // ...
}

interface ConfigNoPayload<S> {
  payloadSchema?: undefined;  // Explicitly undefined
  execute: () => Promise<Response>;
  // ...
}

type AnyConfig<S> = ConfigWithPayload<Schema, S> | ConfigNoPayload<S>;

// Type guard that narrows the union
const isWithPayload = <S extends Schema>(
  config: AnyConfig<S>
): config is ConfigWithPayload<Schema, S> =>
  config.payloadSchema !== undefined;
```

### Why This Works

1. **Union type discrimination** - TypeScript CAN narrow union types with type guards
2. **Separate interfaces** - Each interface has the exact shape needed
3. **No generics in implementation** - The generic complexity stays at the signature level
4. **Type guards bridge the gap** - They connect runtime checks to type-level narrowing

## Recommended Approach

**Option B from README**: Separate internal implementation functions with identical public API.

```
Public API (unchanged):
  createHandler<P, S>(config with payload) → Handler<P, S>
  createHandler<S>(config without payload) → Handler<S>

Internal Implementation:
  createHandler(config) {
    if (hasPayload(config)) return createWithPayloadImpl(config)
    return createNoPayloadImpl(config)
  }
```

Benefits:
- Zero assertions in implementation
- Identical public API (backward compatible)
- Each implementation is fully typed
- Runtime dispatch is a simple conditional

## References

- Effect Match module: Value-based, not type-based
- TypeScript control flow: Narrows values, not generic parameters
- Function overloads: Canonical pattern for conditional signatures

# Initial Analysis - Handler Factory Type Safety Issues

**Generated**: 2026-01-15
**Source**: `packages/iam/client/src/_common/handler.factory.ts`

## Unsafe Assertions Identified

### 1. Payload Schema Assertion (Line 143)

```typescript
const payloadSchema = config.payloadSchema as S.Schema.Any;
```

**Problem**: After the `if (P.isNotUndefined(config.payloadSchema))` check, TypeScript should know `payloadSchema` is defined, but the generic type parameter `PayloadSchema extends S.Schema.Any | undefined` doesn't narrow.

**Root Cause**: TypeScript doesn't narrow generic type parameters through control flow analysis.

### 2. Execute Function Assertion (Lines 144-146)

```typescript
const execute = config.execute as (
  encoded: unknown & { readonly fetchOptions?: ClientFetchOption }
) => Promise<BetterAuthResponse>;
```

**Problem**: The `execute` function type depends on whether `payloadSchema` is defined. After narrowing, TypeScript should infer the correct signature, but it doesn't.

**Root Cause**: Conditional types in function parameter positions don't narrow with control flow.

### 3. Success Schema Assertion (Lines 176, 205)

```typescript
return yield* S.decodeUnknown(config.successSchema as S.Schema.Any)(response.data);
```

**Problem**: `successSchema` is already typed as `S.Schema.Any` in the implementation signature, but the assertion is still needed due to generic variance issues.

**Root Cause**: Schema context types (`S.Schema.Context<SuccessSchema>`) create variance constraints.

### 4. No-Payload Execute Assertion (Line 181)

```typescript
const execute = config.execute as () => Promise<BetterAuthResponse>;
```

**Problem**: In the else branch (no payload), the execute function should be `() => Promise<...>`, but TypeScript sees the union type.

**Root Cause**: Same as #2 - conditional types don't narrow.

## Current Type Structure

```typescript
// Implementation signature (union of both cases)
function createHandler<
  PayloadSchema extends S.Schema.Any | undefined,
  SuccessSchema extends S.Schema.Any,
>(config: {
  readonly execute: PayloadSchema extends S.Schema.Any
    ? (encoded: S.Schema.Encoded<PayloadSchema> & {...}) => Promise<...>
    : () => Promise<...>;
  readonly payloadSchema?: PayloadSchema;
  // ...
})
```

The conditional type `PayloadSchema extends S.Schema.Any ? A : B` evaluates at call sites but remains a union inside the implementation body.

## Handler Usage Analysis

| Handler | Pattern | Payload Schema |
|---------|---------|----------------|
| `sign-in/email` | With payload | `Contract.Payload` |
| `core/sign-out` | No payload | `undefined` |
| `multi-session/set-active` | With payload | Yes |
| `multi-session/revoke` | With payload | Yes |
| `multi-session/list-sessions` | No payload | `undefined` |

## Proposed Solution Approach

### Option C+D: Match + Predicate Refinement

1. **Define discriminating type guard**:
```typescript
interface ConfigWithPayload<P, S> {
  payloadSchema: P;
  execute: (encoded: S.Schema.Encoded<P> & {...}) => Promise<...>;
  // ...
}

interface ConfigNoPayload<S> {
  payloadSchema?: undefined;
  execute: () => Promise<...>;
  // ...
}

type HandlerConfig<P, S> = ConfigWithPayload<P, S> | ConfigNoPayload<S>;
```

2. **Create type-safe predicate**:
```typescript
const hasPayloadSchema = <P extends S.Schema.Any, S extends S.Schema.Any>(
  config: HandlerConfig<P | undefined, S>
): config is ConfigWithPayload<P, S> =>
  config.payloadSchema !== undefined;
```

3. **Dispatch via Match**:
```typescript
return Match.value(config).pipe(
  Match.when(hasPayloadSchema, (c) => createWithPayloadImpl(c)),
  Match.orElse((c) => createNoPayloadImpl(c))
);
```

## Open Questions

1. **Match Return Type Inference**: Does `Match.orElse` preserve the return type from overloads, or does it unify to a common type?

2. **Generic Parameter Preservation**: When `Match.when` calls the implementation function, do generic parameters flow through correctly?

3. **Performance**: Is there measurable overhead from Match vs direct conditional?

4. **Alternative: Function Overload Implementation**: Could we have two completely separate implementation functions dispatched by a thin wrapper?

## Next Steps

1. Research Effect Match with generic type parameters
2. Create proof-of-concept with simplified example
3. Validate type inference at existing call sites
4. Implement and test

# Design Proposal - Type-Safe Handler Factory

**Generated**: 2026-01-15
**Phase**: 0 - Discovery & Pattern Research
**Status**: APPROVED FOR IMPLEMENTATION

## Executive Summary

Eliminate 5 unsafe `as` type assertions in `handler.factory.ts` by introducing:
1. **Discriminated config interfaces** - Separate types for with/without payload
2. **Type guard function** - Bridges runtime check to compile-time narrowing
3. **Separate implementation functions** - Each fully typed, no assertions needed
4. **Unchanged public API** - Overload signatures remain identical

## Recommended Approach

### Option B: Separate Internal Implementation Functions

From the spec options (A: Discriminated Union, B: Separate Functions, C: Effect Match, D: Predicate Refinement), **Option B is recommended**.

**Rationale**:
- Effect Match (Option C) cannot narrow generic type parameters - it's for value discrimination
- Discriminated Union (Option A) would require breaking API changes
- Predicate Refinement (Option D) alone is insufficient for full type safety
- Separate Functions (Option B) achieves zero assertions with zero API changes

## Type Definitions

### New Config Interfaces

```typescript
/**
 * Config for handlers WITH payload schema.
 * payloadSchema is REQUIRED (not optional).
 */
interface ConfigWithPayload<
  PayloadSchema extends S.Schema.Any,
  SuccessSchema extends S.Schema.Any
> {
  readonly domain: string;
  readonly feature: string;
  readonly payloadSchema: PayloadSchema;  // REQUIRED
  readonly successSchema: SuccessSchema;
  readonly mutatesSession?: boolean;
  readonly execute: (
    encoded: S.Schema.Encoded<PayloadSchema> & { readonly fetchOptions?: ClientFetchOption }
  ) => Promise<BetterAuthResponse>;
}

/**
 * Config for handlers WITHOUT payload schema.
 * payloadSchema is explicitly undefined or omitted.
 */
interface ConfigNoPayload<SuccessSchema extends S.Schema.Any> {
  readonly domain: string;
  readonly feature: string;
  readonly payloadSchema?: undefined;  // OPTIONAL, must be undefined
  readonly successSchema: SuccessSchema;
  readonly mutatesSession?: boolean;
  readonly execute: () => Promise<BetterAuthResponse>;
}

/**
 * Union type for internal implementation dispatch.
 */
type HandlerConfig<SuccessSchema extends S.Schema.Any> =
  | ConfigWithPayload<S.Schema.Any, SuccessSchema>
  | ConfigNoPayload<SuccessSchema>;
```

### Type Guard

```typescript
/**
 * Type guard that narrows HandlerConfig to ConfigWithPayload.
 * Bridges runtime check to compile-time type narrowing.
 */
const hasPayloadSchema = <SuccessSchema extends S.Schema.Any>(
  config: HandlerConfig<SuccessSchema>
): config is ConfigWithPayload<S.Schema.Any, SuccessSchema> => {
  return config.payloadSchema !== undefined;
};
```

## Implementation Skeleton

### Structure

```
handler.factory.ts
├── Types (unchanged)
│   ├── BetterAuthResponse
│   ├── HandlerFactoryError
│   ├── HandlerWithPayloadInput
│   └── HandlerNoPayloadInput
├── NEW: Config Interfaces
│   ├── ConfigWithPayload<P, S>
│   ├── ConfigNoPayload<S>
│   └── HandlerConfig<S> (union)
├── NEW: Type Guard
│   └── hasPayloadSchema()
├── NEW: Implementation Functions
│   ├── createHandlerWithPayload<P, S>(config)
│   └── createHandlerNoPayload<S>(config)
├── Overloads (UNCHANGED)
│   ├── createHandler<P, S>(config with payload)
│   └── createHandler<S>(config without payload)
└── Implementation (SIMPLIFIED)
    └── createHandler(config) → dispatch to helpers
```

### Implementation Functions

```typescript
/**
 * Implementation for handlers WITH payload.
 * All types are constrained - no assertions needed.
 */
const createHandlerWithPayload = <
  PayloadSchema extends S.Schema.Any,
  SuccessSchema extends S.Schema.Any
>(
  config: ConfigWithPayload<PayloadSchema, SuccessSchema>
) => {
  const spanName = `${config.domain}/${config.feature}/handler`;

  return Effect.fn(spanName)(function* (
    input: HandlerWithPayloadInput<S.Schema.Type<PayloadSchema>>
  ) {
    // config.payloadSchema is PayloadSchema (guaranteed, not optional)
    const encoded = yield* S.encode(config.payloadSchema)(input.payload);

    // config.execute has correct signature
    const response = yield* Effect.tryPromise({
      try: () => config.execute({ ...encoded, fetchOptions: input.fetchOptions }),
      catch: IamError.fromUnknown,
    });

    if (response.error !== null) {
      return yield* new BetterAuthResponseError({
        message: extractBetterAuthErrorMessage(response.error),
        code: response.error.code,
        status: response.error.status,
      });
    }

    if (config.mutatesSession === true) {
      client.$store.notify("$sessionSignal");
    }

    // config.successSchema is SuccessSchema
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
};

/**
 * Implementation for handlers WITHOUT payload.
 * All types are constrained - no assertions needed.
 */
const createHandlerNoPayload = <SuccessSchema extends S.Schema.Any>(
  config: ConfigNoPayload<SuccessSchema>
) => {
  const spanName = `${config.domain}/${config.feature}/handler`;

  return Effect.fn(spanName)(function* (
    _input?: HandlerNoPayloadInput
  ) {
    // config.execute has correct signature: () => Promise
    const response = yield* Effect.tryPromise({
      try: () => config.execute(),
      catch: IamError.fromUnknown,
    });

    if (P.isNotNull(response.error)) {
      return yield* new BetterAuthResponseError({
        message: extractBetterAuthErrorMessage(response.error),
        code: response.error.code,
        status: response.error.status,
      });
    }

    if (config.mutatesSession === true) {
      client.$store.notify("$sessionSignal");
    }

    // config.successSchema is SuccessSchema
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
};
```

### Main Implementation

```typescript
// Overloads remain UNCHANGED
export function createHandler<PayloadSchema extends S.Schema.Any, SuccessSchema extends S.Schema.Any>(
  config: { /* with payload */ }
): (input: HandlerWithPayloadInput<...>) => Effect.Effect<...>;

export function createHandler<SuccessSchema extends S.Schema.Any>(
  config: { /* without payload */ }
): (input?: HandlerNoPayloadInput) => Effect.Effect<...>;

// Implementation simplified to dispatch
export function createHandler<SuccessSchema extends S.Schema.Any>(
  config: HandlerConfig<SuccessSchema>
) {
  // Type guard narrows to correct variant
  if (hasPayloadSchema(config)) {
    return createHandlerWithPayload(config);
  }
  return createHandlerNoPayload(config);
}
```

## Risk Assessment

### Low Risk
- **Internal-only changes** - No public API modifications
- **Behavior unchanged** - Same encode → execute → decode flow
- **Tests should pass** - No functional changes

### Medium Risk
- **Return type inference** - Must verify call sites still infer correctly
- **Generic flow** - Complex generic relationships need validation

### Mitigation
- **Scratchpad validation** - Test in isolation before applying to real code
- **Call site verification** - Confirm all 8 factory usages still type-check
- **Test coverage** - Run existing tests after each change

## Rollback Plan

1. **Immediate**: Revert to previous commit
2. **Partial**: Keep type definitions, revert implementation to use assertions
3. **Alternative**: If approach fails, try Option A (discriminated union with breaking change)

## Implementation Order

### Phase 1: Scratchpad Setup
1. Copy factory and dependencies to `scratchpad/`
2. Copy 2-3 handler examples (with/without payload)
3. Verify baseline type-checks

### Phase 2: Implement in Scratchpad
1. Add config interfaces (above existing code)
2. Add type guard function
3. Extract `createHandlerWithPayload` from first branch
4. Extract `createHandlerNoPayload` from else branch
5. Simplify main implementation to dispatch
6. Remove all `as` assertions
7. Verify type-check: `tsc --noEmit`

### Phase 3: Validate Scratchpad Handlers
1. Verify all handler examples type-check
2. Verify return type inference matches original
3. Document any issues

### Phase 4: Apply to Real Code
1. Apply changes to `packages/iam/client/src/_common/handler.factory.ts`
2. Run `bun run check --filter @beep/iam-client`
3. Run `bun run test --filter @beep/iam-client`
4. Fix any issues

## Success Criteria

- [ ] Zero `as` type assertions in handler.factory.ts
- [ ] Zero `@ts-ignore` or `@ts-expect-error` comments
- [ ] All existing tests pass
- [ ] All 8 factory usages type-check without changes
- [ ] Return type inference preserved at call sites
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `bun run lint --filter @beep/iam-client` passes

## Appendix: Assertions to Remove

| Line | Current Code | Replacement |
|------|--------------|-------------|
| 143 | `config.payloadSchema as S.Schema.Any` | `config.payloadSchema` (in ConfigWithPayload) |
| 144-146 | `config.execute as (encoded: unknown...) => Promise` | `config.execute` (typed by ConfigWithPayload) |
| 176 | `config.successSchema as S.Schema.Any` | `config.successSchema` (generic constraint) |
| 181 | `config.execute as () => Promise` | `config.execute` (typed by ConfigNoPayload) |
| 205 | `config.successSchema as S.Schema.Any` | `config.successSchema` (generic constraint) |

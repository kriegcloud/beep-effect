# Call Site Analysis - createHandler Usage

**Generated**: 2026-01-15
**Phase**: 0 - Discovery & Pattern Research

## Summary

| Pattern | Count | Files |
|---------|-------|-------|
| With Payload Schema | 6 | sign-in-email, revoke, set-active, change-password, reset-password, request-reset |
| Without Payload Schema | 2 | sign-out, list-sessions |
| Manual (Bypass Factory) | 2 | sign-up-email, get-session |
| **Total** | **10** | |

## Detailed Usage Analysis

### Handlers Using Factory - WITH PAYLOAD

#### 1. sign-in/email/sign-in-email.handler.ts
```typescript
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```
- **Type Inference**: Full generic inference from Contract schemas
- **Session Mutation**: Yes
- **Dependencies**: `@beep/iam-client/adapters`, local Contract

#### 2. multi-session/revoke/revoke.handler.ts
```typescript
export const Handler = createHandler({
  domain: "multi-session",
  feature: "revoke",
  execute: (encoded) => client.multiSession.revoke(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```
- **Type Inference**: Full generic inference
- **Session Mutation**: Yes

#### 3. multi-session/set-active/set-active.handler.ts
```typescript
export const Handler = createHandler({
  domain: "multi-session",
  feature: "set-active",
  execute: (encoded) => client.multiSession.setActive(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```
- **Type Inference**: Full generic inference
- **Session Mutation**: Yes

#### 4. password/change/change.handler.ts
```typescript
export const Handler = createHandler({
  domain: "password",
  feature: "change",
  execute: (encoded) => client.changePassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```
- **Type Inference**: Full generic inference
- **Session Mutation**: Yes
- **Note**: Handles sensitive password fields

#### 5. password/reset/reset.handler.ts
```typescript
export const Handler = createHandler({
  domain: "password",
  feature: "reset",
  execute: (encoded) => client.resetPassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```
- **Type Inference**: Full generic inference
- **Session Mutation**: No (token-based, no session created)

#### 6. password/request-reset/request-reset.handler.ts
```typescript
export const Handler = createHandler({
  domain: "password",
  feature: "request-reset",
  execute: (encoded) => client.forgetPassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```
- **Type Inference**: Full generic inference
- **Session Mutation**: No (email delivery only)

### Handlers Using Factory - WITHOUT PAYLOAD

#### 7. core/sign-out/sign-out.handler.ts
```typescript
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```
- **Type Inference**: Success schema inference only
- **Session Mutation**: Yes
- **Note**: No payloadSchema field at all

#### 8. multi-session/list-sessions/list-sessions.handler.ts
```typescript
export const Handler = createHandler({
  domain: "multi-session",
  feature: "list-sessions",
  execute: () => client.multiSession.listSessions(),
  successSchema: Contract.Success,
  mutatesSession: false,
});
```
- **Type Inference**: Success schema inference only
- **Session Mutation**: No (read-only operation)

### Handlers NOT Using Factory

#### 9. sign-up/email/sign-up-email.handler.ts
**Reason**: Uses `S.transformOrFailFrom` which changes the encoded output shape.

The factory assumes `execute` receives the direct output of `S.encode(payloadSchema)`. However, sign-up needs to:
1. Encode via transformOrFailFrom
2. Manually compute and inject the `name` field from `firstName` + `lastName`

```typescript
// Manual implementation required
export const Handler = Effect.fn("sign-up/email/handler")(function* (
  input: SignUpEmailInput
) {
  const encoded = yield* S.encode(Contract.Payload)(input.payload);
  const payload = { ...encoded, name: `${encoded.firstName} ${encoded.lastName}` };
  // ... rest of manual implementation
});
```

#### 10. core/get-session/get-session.handler.ts
**Reason**: Different response shape.

The factory expects `{ data: T, error: E | null }` response. Get-session returns `{ data: { session: T | null } }` - a wrapped nullable session.

```typescript
// Manual implementation handles nullable session
export const Handler = Effect.fn("core/get-session/handler")(function* () {
  const response = yield* Effect.tryPromise({
    try: () => client.getSession({ fetchOptions: { throw: true } }),
    catch: IamError.fromUnknown,
  });
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

## Type Inference Patterns

All factory usages rely on TypeScript's inference:

```typescript
// Call site - types inferred from schemas
const Handler = createHandler({
  payloadSchema: Contract.Payload,  // Infers PayloadSchema = typeof Contract.Payload
  successSchema: Contract.Success,  // Infers SuccessSchema = typeof Contract.Success
  execute: (encoded) => ...,        // Encoded type inferred from PayloadSchema
});

// Return type automatically inferred as:
// (input: HandlerWithPayloadInput<PayloadType>) => Effect<SuccessType, Errors, Context>
```

## Critical Constraints for Refactoring

1. **Overload signatures must remain unchanged** - All 8 factory usages depend on inference
2. **Encoded payload shape must match** - `execute` receives schema-encoded payload
3. **Session signal notification** - 5 handlers depend on `mutatesSession: true`
4. **Error type union** - `HandlerFactoryError` exported and used in tests
5. **Span naming convention** - `{domain}/{feature}/handler` for telemetry

## Risk Assessment

| Change Type | Risk Level | Affected Files |
|-------------|------------|----------------|
| Internal implementation refactor | Low | handler.factory.ts only |
| Overload signature change | High | All 8 factory users |
| Return type inference change | High | All call sites |
| Error type change | Medium | Tests, error handlers |

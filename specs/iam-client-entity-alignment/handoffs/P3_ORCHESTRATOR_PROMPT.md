# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 (Contract Success Schemas) of the `iam-client-entity-alignment` spec.

### Context

P1 updated `_common/` schemas with EntityIds. P2 updated Payload classes. Now we ensure Success classes work with the updated schemas and add transformation schemas if needed.

### Your Mission

1. **Find all Success classes**:
   ```bash
   grep -r "class Success" packages/iam/client/src/ -l
   ```

2. **Verify Success classes compile** with updated `_common/` schemas

3. **Create transformation schemas** if type errors occur because Better Auth returns plain strings

4. **Verify changes compile**:
   ```bash
   bun run check --filter @beep/iam-client
   ```

### Decision Framework

**Try Direct Use First**:
```typescript
// If this compiles, no transformation needed
export class Success extends S.Class<Success>($I`Success`)({
  member: Member,  // From updated _common/
}) {}
```

**Add Transformation If Needed**:
```typescript
// If type error because Better Auth returns plain strings
export const DomainMemberFromBetterAuth = S.transformOrFail(
  BetterAuthMemberSchema,
  Member,
  {
    strict: true,
    decode: Effect.fn(function* (raw, _options, ast) {
      if (!IamEntityIds.MemberId.is(raw.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, raw.id, "Invalid member ID")
        );
      }
      return raw;
    }),
    encode: (domain) => Effect.succeed(domain),
  }
);

export class Success extends S.Class<Success>($I`Success`)({
  member: DomainMemberFromBetterAuth,
}) {}
```

### Reference Pattern

See `packages/iam/client/src/_internal/user.schemas.ts` for `DomainUserFromBetterAuthUser`.

### Success Criteria

- [ ] All Success classes verified
- [ ] Transformation schemas created where needed
- [ ] Type check passes

### Handoff Document

Read full context in: `specs/iam-client-entity-alignment/handoffs/HANDOFF_P3.md`

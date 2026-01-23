# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 of the `iam-client-entity-alignment` spec.

### Context

Phase 4 completed entity ID alignment - all contract schemas now use branded EntityIds from `@beep/shared-domain`. However, gaps remain in transformation schema coverage and test validation.

**Completed in P4:**
- 64+ contract files updated with branded EntityIds
- 10 intentional S.String exceptions documented (external IDs, W3C specs)
- Type check and lint pass

**Remaining gaps identified:**
1. Missing transformation schemas for Team, ApiKey, OrganizationRole
2. No automated tests for EntityId transformation schemas
3. Documentation needs transformation coverage table

### Your Mission

1. **Audit domain models** (5.1): Check if domain models exist for Team, ApiKey, OrganizationRole in `@beep/iam-domain` or `@beep/shared-domain`

2. **Create transformation schemas** (5.2): For entities WITH domain models, create `Domain*FromBetterAuth*` transformation schemas following the pattern in `_internal/user.schemas.ts`

3. **Create transformation tests** (5.4): Add tests in `test/_internal/transformation.test.ts` verifying:
   - Valid responses decode successfully
   - Invalid ID formats fail with proper errors
   - Missing required fields fail descriptively

4. **Update documentation** (5.5): Add transformation coverage table to `AGENTS.md`

### Critical Patterns

**Transformation schema pattern:**
```typescript
export const DomainEntityFromBetterAuthEntity = S.transformOrFail(
  BetterAuthEntitySchema,
  Entity.Model,
  {
    strict: true,
    decode: Effect.fn(function* (ba, _options, ast) {
      // 1. Validate branded ID format
      if (!EntityId.is(ba.id)) {
        return yield* ParseResult.fail(new ParseResult.Type(ast, ba, "Invalid ID format"));
      }
      // 2. Validate required fields
      const field = yield* requireField(ba, "fieldName", ast);
      // 3. Return encoded form
      return { id: ba.id, ... };
    }),
    encode: Effect.fn(function* (entity, _options, _ast) {
      // Reverse mapping
    }),
  }
);
```

**Test pattern:**
```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

effect("DomainEntityFromBetterAuth - valid decodes", () =>
  Effect.gen(function* () {
    const valid = { id: "prefix__uuid", ... };
    const result = yield* S.decode(Transformation)(valid);
    strictEqual(result.id, valid.id);
  })
);
```

### Reference Files

| File | Purpose |
|------|---------|
| `_internal/user.schemas.ts` | Canonical transformation pattern |
| `_internal/transformation-helpers.ts` | Helper functions |
| `.claude/rules/effect-patterns.md` | EntityId requirements |
| `handoffs/HANDOFF_P5.md` | Full context and gap analysis |

### Verification

After each step:
```bash
# Type check
bun run check --filter @beep/iam-client

# Run tests
bun run test --filter @beep/iam-client
```

### Success Criteria

- [ ] Domain model existence audited for Team, ApiKey, OrganizationRole
- [ ] Transformation schemas created (if domain models exist)
- [ ] Transformation tests created and passing
- [ ] AGENTS.md updated with transformation coverage table
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Tests pass: `bun run test --filter @beep/iam-client`

### Handoff Document

Read full context in: `specs/iam-client-entity-alignment/handoffs/HANDOFF_P5.md`

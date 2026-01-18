# TaggedConfigKit Code Review Spec

## Purpose

This spec orchestrates a code review of the newly implemented `TaggedConfigKit` in `@beep/schema`. The kit transforms between string literal tags and their associated tagged configuration structs.

## Background

`TaggedConfigKit` was implemented to provide:
- **Decode**: `"GRAY"` → `{ _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }`
- **Encode**: `{ _tag: "GRAY", ... }` → `"GRAY"`

This is useful for database scenarios where you store a simple tag but need rich config objects at runtime.

## Review Focus Areas

1. **Type Safety** - The implementation uses several `as unknown as` casts that need scrutiny
2. **Pattern Consistency** - Should align with `MappedLiteralKit` and `StringLiteralKit` patterns
3. **Ergonomics** - Missing features compared to sibling kits (type guards, derive, HashMap)
4. **Test Coverage** - Comprehensive but could be expanded

## Handoffs

| File | Purpose |
|------|---------|
| `HANDOFF_CRITIC.md` | Primary review handoff with detailed instructions |

## Verification

```bash
bun run check --filter @beep/schema
bun run test --filter @beep/schema
bun run lint --filter @beep/schema
```

## Success Criteria

- [ ] All unsafe casts are eliminated or justified with comments
- [ ] Type inference is verified correct for all static properties
- [ ] At least 2 improvement features are added
- [ ] Test coverage is expanded for identified gaps
- [ ] All verifications pass

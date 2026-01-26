# TaggedValuesKit - Quick Start

## Current Status

| Field | Value |
|-------|-------|
| **Phase** | 0 (Scaffolding) - Complete |
| **Next Phase** | 1 (Implementation) |
| **Blocking Issues** | None |
| **Complexity** | Simple (Score: 8) |

## Immediate Next Actions

1. Read `README.md` for full technical design
2. Start Phase 1: Implementation with `effect-code-writer` agent
3. Create `packages/common/schema/src/derived/kits/tagged-values-kit.ts`

## Quick Context

**What**: Schema kit transforming tag strings ↔ `{ _tag, values }` structs

**Why**: HTML sanitization needs element → allowed attributes mapping

**How**: Follow `TaggedConfigKit` pattern with new `ValuesFor` and `LiteralKitFor` accessors

## Key Files

| Purpose | Path |
|---------|------|
| New Source | `packages/common/schema/src/derived/kits/tagged-values-kit.ts` |
| New Tests | `packages/common/schema/test/kits/taggedValuesKit.test.ts` |
| Reference | `packages/common/schema/src/derived/kits/tagged-config-kit.ts` |
| Dependency | `packages/common/schema/src/derived/kits/literal-kit.ts` |

## Token Budget

| Memory Type | Content | Est. Tokens |
|-------------|---------|-------------|
| Working | Current phase tasks | ~400 |
| Episodic | Previous phases summary | ~200 |
| Semantic | Tech stack constants | ~300 |
| Procedural | Documentation links | ~100 |
| **Total** | | **~1,000** |

## Verification

```bash
bun run check --filter @beep/schema
bun run test --filter @beep/schema
```

## Common Failure Modes

| Symptom | Root Cause | Resolution |
|---------|------------|------------|
| Type errors in builders | Missing AST import | Add `import * as AST from "effect/SchemaAST"` |
| LiteralKitFor returns wrong type | Forgot to wrap with makeGenericLiteralKit | Review literal-kit.ts factory pattern |
| Encode validation not working | Transform schema missing strict mode | Add `strict: true` to S.transform options |
| Tests fail on ValuesFor | Incorrect accessor type mapping | Check ValuesForAccessor type utility |

## Links

- [Full README](./README.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Phase 1 Prompt](./handoffs/P1_ORCHESTRATOR_PROMPT.md)

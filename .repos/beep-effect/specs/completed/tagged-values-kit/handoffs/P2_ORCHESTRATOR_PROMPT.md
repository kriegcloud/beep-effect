# Phase 2 Orchestrator Prompt

> Copy-paste this prompt to begin Phase 2 in a new session.

---

## Prompt

```
I'm continuing work on the tagged-values-kit spec.

## Context
The spec is at: specs/tagged-values-kit/
Phase 1 (Implementation) is complete. Starting Phase 2 (Testing).

## Goal
Create comprehensive test suite for `TaggedValuesKit`.

## Key Files to Read First
1. specs/tagged-values-kit/handoffs/HANDOFF_P1.md - P1 completion notes
2. packages/common/schema/src/derived/kits/tagged-values-kit.ts - Implementation to test
3. packages/common/schema/test/kits/taggedConfigKit.test.ts - Reference test structure

## Tasks
1. Create test file following taggedConfigKit.test.ts structure
2. Test basic decode/encode
3. Test all static properties (Tags, TagsEnum, Entries, Configs, ValuesFor, LiteralKitFor)
4. Test validation (allOf encode, oneOf LiteralKitFor)
5. Test type guards, HashMap, derive
6. Test edge cases (single entry, single value, mixed literal types)
7. Verify with `bun run test --filter @beep/schema`

## Output
- packages/common/schema/test/kits/taggedValuesKit.test.ts

## After Completion
Update REFLECTION_LOG.md with P2 learnings.
Create handoffs/HANDOFF_P2.md and handoffs/P3_ORCHESTRATOR_PROMPT.md for documentation phase.
```

---

## Delegation Strategy

| Task | Agent | Expected Output |
|------|-------|-----------------|
| Read taggedConfigKit.test.ts | test-writer | Test structure, describe blocks, patterns |
| Read tagged-values-kit.ts | test-writer | APIs to test, edge cases to cover |
| Write test suite | test-writer | Complete test file with all categories |
| Run tests | orchestrator | `bun run test --filter @beep/schema` passes |

### Delegation Thresholds
- **≤3 file reads**: Orchestrator may handle directly
- **>3 file reads**: MUST delegate to specialized agent
- **Test pattern research**: Delegate to test-writer

**Orchestrator Handles**: Final test run, REFLECTION_LOG update, handoff creation

---

## Quick Reference

### Target File
`packages/common/schema/test/kits/taggedValuesKit.test.ts`

### Test Categories from Reference
Port these test categories from taggedConfigKit.test.ts:
1. `describe("basic decode/encode")`
2. `describe("roundtrip property")`
3. `describe("static properties")`
4. `describe("different value types")`
5. `describe("single entry")`
6. `describe("referential stability")`
7. `describe("annotations")`
8. `describe("type safety")`
9. `describe("type guards (is)")`
10. `describe("HashMap (ConfigMap)")`
11. `describe("derive")`

### New Test Categories
12. `describe("ValuesFor accessor")`
13. `describe("LiteralKitFor accessor")`
14. `describe("encode validation (allOf)")`

### Success Criteria
- [ ] All test categories implemented
- [ ] `bun run test --filter @beep/schema` passes
- [ ] 100% API coverage

### Verification
```bash
bun run test --filter @beep/schema
```

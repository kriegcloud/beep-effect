# Phase 1 Orchestrator Prompt

> Copy-paste this prompt to begin Phase 1 in a new session.

---

## Prompt

```
I'm continuing work on the tagged-values-kit spec.

## Context
The spec is at: specs/tagged-values-kit/
Phase 0 (Scaffolding) is complete. Starting Phase 1 (Implementation).

## Goal
Create `TaggedValuesKit` schema following the `TaggedConfigKit` pattern.

## Key Files to Read First
1. specs/tagged-values-kit/README.md - Full technical design
2. packages/common/schema/src/derived/kits/tagged-config-kit.ts - Reference implementation
3. packages/common/schema/src/derived/kits/literal-kit.ts - LiteralKit dependency

## Tasks
1. Create type utilities (TaggedValuesEntry, DecodedConfig, ValuesForAccessor, LiteralKitForAccessor)
2. Create builder functions (buildValuesFor, buildLiteralKitsFor, buildConfigs, etc.)
3. Create factory function (makeTaggedValuesKit)
4. Create public API (TaggedValuesKit, TaggedValuesKitFromObject)
5. Export through BS namespace in src/schema.ts
6. Verify with `bun run check --filter @beep/schema`

## Output
- packages/common/schema/src/derived/kits/tagged-values-kit.ts
- specs/tagged-values-kit/outputs/implementation-notes.md

## After Completion
Update REFLECTION_LOG.md with P1 learnings.
Create handoffs/HANDOFF_P1.md and handoffs/P2_ORCHESTRATOR_PROMPT.md for testing phase.
```

---

## Delegation Strategy

| Task | Agent | Expected Output |
|------|-------|-----------------|
| Read TaggedConfigKit source | effect-code-writer | Type utilities, builders, factory pattern |
| Read LiteralKit source | effect-code-writer | IGenericLiteralKit interface, makeGenericLiteralKit |
| Implement TaggedValuesKit | effect-code-writer | Complete source file with all exports |
| Verify compilation | orchestrator | `bun run check --filter @beep/schema` passes |

### Delegation Thresholds
- **≤3 file reads**: Orchestrator may handle directly
- **>3 file reads**: MUST delegate to specialized agent
- **Cross-package research**: Delegate to codebase-researcher

**Orchestrator Handles**: Final verification, REFLECTION_LOG update, handoff creation

---

## Quick Reference

### Target File
`packages/common/schema/src/derived/kits/tagged-values-kit.ts`

### Key Differences from TaggedConfigKit
| Aspect | TaggedConfigKit | TaggedValuesKit |
|--------|-----------------|-----------------|
| Entry value | `ConfigObject` (Record) | `NonEmptyReadonlyArray<LiteralValue>` |
| Decoded struct | `{ _tag, ...configFields }` | `{ _tag, values }` |
| New accessors | - | `ValuesFor`, `LiteralKitFor` |

### Validation Behavior
- **Encode (allOf)**: Values array must match exactly
- **LiteralKitFor (oneOf)**: Standard LiteralKit for individual values

### Success Criteria
- [ ] File compiles without errors
- [ ] All static properties accessible with correct types
- [ ] Exported through BS namespace

### Verification
```bash
bun run check --filter @beep/schema
```

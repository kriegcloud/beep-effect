# Phase 3 Orchestrator Prompt

> Copy-paste this prompt to begin Phase 3 in a new session.

---

## Prompt

```
I'm continuing work on the tagged-values-kit spec.

## Context
The spec is at: specs/tagged-values-kit/
Phase 2 (Testing) is complete. Starting Phase 3 (Documentation & Integration).

## Goal
Add comprehensive JSDoc documentation and verify integration.

## Key Files to Read First
1. specs/tagged-values-kit/handoffs/HANDOFF_P2.md - P2 completion notes
2. packages/common/schema/src/derived/kits/tagged-values-kit.ts - File to document
3. packages/common/schema/src/derived/kits/tagged-config-kit.ts - JSDoc reference

## Tasks
1. Add JSDoc to all exported functions/types with @example, @category, @since
2. Verify export through BS namespace in src/schema.ts
3. Run `bun run docgen --filter @beep/schema` to verify
4. Update README.md success criteria checkboxes

## Output
- Updated tagged-values-kit.ts with JSDoc
- All success criteria checked in README.md

## After Completion
Update REFLECTION_LOG.md with P3 learnings and final retrospective.
Mark spec as complete.
```

---

## Delegation Strategy

| Task | Agent | Expected Output |
|------|-------|-----------------|
| Read tagged-config-kit.ts JSDoc | doc-writer | JSDoc style, @category, @since format |
| Add JSDoc to tagged-values-kit.ts | doc-writer | All exports documented with examples |
| Verify docgen | orchestrator | `bun run docgen --filter @beep/schema` passes |
| Update README checkboxes | orchestrator | All criteria marked complete |

### Delegation Thresholds
- **≤3 file reads**: Orchestrator may handle directly
- **>3 file reads**: MUST delegate to specialized agent
- **Documentation patterns**: Delegate to doc-writer

**Orchestrator Handles**: Final verification, REFLECTION_LOG retrospective, spec completion

---

## Quick Reference

### Key Documentation Points (from P2)
1. Kit IS the schema - use `S.decodeSync(Kit)` not `S.decodeSync(Kit.Schema)`
2. `Configs`, `ValuesFor`, `LiteralKitFor` are object accessors (not functions)
3. Encode requires exact positional order (S.Tuple validation)
4. `IGenericLiteralKit` uses `.Options` property (not `.Literals`)

### JSDoc Template
```ts
/**
 * Brief description.
 *
 * Detailed description with behavior explanation.
 *
 * @example
 * import { TaggedValuesKit } from "@beep/schema/derived/kits/tagged-values-kit";
 * import * as S from "effect/Schema";
 *
 * const Kit = TaggedValuesKit(
 *   ["a", ["href", "target"]],
 *   ["img", ["src", "alt"]]
 * );
 *
 * // Direct values access (object accessor, not function)
 * Kit.ValuesFor.a  // ["href", "target"]
 *
 * // LiteralKit for oneOf validation
 * Kit.LiteralKitFor.a.Options  // ["href", "target"]
 *
 * // Decode: kit IS the schema
 * S.decodeSync(Kit)("a")  // { _tag: "a", values: ["href", "target"] }
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
```

### Success Criteria
- [ ] All exports have JSDoc
- [ ] Examples are runnable
- [ ] Docgen succeeds
- [ ] All README checkboxes marked

### Verification
```bash
bun run docgen --filter @beep/schema
bun run check --filter @beep/schema
bun run test --filter @beep/schema
```

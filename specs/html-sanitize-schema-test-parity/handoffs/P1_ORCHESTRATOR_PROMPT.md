# Phase 1 Orchestrator Prompt

> Copy-paste this prompt to begin Phase 1 in a new session.

---

## Prompt

```
I'm continuing work on the html-sanitize-schema-test-parity spec.

## Context
The spec is at: specs/html-sanitize-schema-test-parity/
Phase 0 (Scaffolding) is complete. Starting Phase 1 (Discovery & Verification).

## Goal
Verify the gap analysis by comparing:
- Utils: packages/common/utils/src/sanitize-html/types.ts (SanitizeOptions)
- Schema: packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts (SanitizeConfig)
- Conversion: packages/common/schema/src/integrations/html/sanitize/to-sanitize-options.ts

## Tasks
1. Create a type mapping table showing utils options vs schema options
2. Identify callback options intentionally excluded from schema
3. Find any utils options missing from schema
4. Analyze toSanitizeOptions for conversion edge cases
5. Output to specs/html-sanitize-schema-test-parity/outputs/type-comparison.md

## Reference
See HANDOFF_P1.md for detailed context.

## After Completion
Create handoffs/HANDOFF_P2.md and handoffs/P2_ORCHESTRATOR_PROMPT.md for the next phase.
```

---

## Quick Reference

### Key Files to Read
1. `packages/common/utils/src/sanitize-html/types.ts` - Utils SanitizeOptions
2. `packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts` - Schema SanitizeConfig
3. `packages/common/schema/src/integrations/html/sanitize/to-sanitize-options.ts` - Conversion logic

### Expected Output
- `outputs/type-comparison.md` with mapping table
- List of intentionally excluded features (callbacks)
- List of any missing features

### Success Criteria
- All utils options mapped
- Conversion edge cases documented
- Clear path to Phase 2 (Test Design)

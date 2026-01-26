# Handoff: Phase 1 - Discovery & Verification

> Context document for beginning Phase 1.

---

## Working Memory (≤2,000 tokens)

### Current Task
Verify the gap analysis accuracy by systematically comparing utils `SanitizeOptions` with schema `SanitizeConfig`.

### Success Criteria
- [ ] All utils options mapped to schema equivalents
- [ ] Callback options documented as intentionally excluded
- [ ] Any missing options identified
- [ ] `toSanitizeOptions` conversion edge cases documented

### Blocking Issues
None - Phase 0 complete.

---

## Episodic Memory (≤1,000 tokens)

### Phase 0 Summary
- Spec scaffolded with complex structure (complexity score: 49)
- Gap analysis identified 5 missing test file areas
- ~170 new tests needed across CSS, classes, iframe, modes, presets
- XSS security coverage is critical focus

### Key Decisions
1. Focus on serializable config options only
2. Port tests by feature group, not by file
3. Use existing `createSanitizer` helper pattern

---

## Semantic Memory (≤500 tokens)

### Key Files
- Utils types: `packages/common/utils/src/sanitize-html/types.ts`
- Schema config: `packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts`
- Conversion: `packages/common/schema/src/integrations/html/sanitize/to-sanitize-options.ts`

### Tech Stack
- Effect Schema for configuration
- `makeSanitizeSchema` factory pattern
- `@beep/testkit` for tests

---

## Procedural Memory (Links Only)

- [MASTER_ORCHESTRATION.md](../MASTER_ORCHESTRATION.md) - Full phase details
- [AGENT_PROMPTS.md](../AGENT_PROMPTS.md) - Phase 1 agent prompts
- [specs/_guide/README.md](../../_guide/README.md) - Spec workflow guide

---

## Agent Instructions

### Primary Agent: `codebase-researcher`

**Task**: Compare utils and schema types, output mapping table.

**Prompt**:
```
Compare the utils SanitizeOptions type in packages/common/utils/src/sanitize-html/types.ts
with the schema SanitizeConfig in packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts.

Create a mapping table showing:
1. Which utils options have schema equivalents
2. Which utils options are intentionally excluded (callbacks)
3. Which utils options might be missing from schema

Also analyze toSanitizeOptions in packages/common/schema/src/integrations/html/sanitize/to-sanitize-options.ts
for any conversion edge cases or potential bugs.

Output to specs/html-sanitize-schema-test-parity/outputs/type-comparison.md
```

### Secondary Analysis

After type comparison, verify:
1. Does `allowedStyles` regex conversion handle edge cases?
2. Does `allowedClasses` support both string and RegExpPattern?
3. Are iframe/script hostname/domain options all present?

---

## Phase Completion Checklist

- [ ] `outputs/type-comparison.md` created
- [ ] `outputs/conversion-analysis.md` created (if issues found)
- [ ] Missing features documented
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

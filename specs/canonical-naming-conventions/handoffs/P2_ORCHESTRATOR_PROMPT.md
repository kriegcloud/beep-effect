# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify HANDOFF_P1.md context is preserved:

**Phase 0 Artifacts (Required for synthesis):**
- [ ] `outputs/existing-patterns-audit.md` exists
- [ ] `outputs/file-category-inventory.md` exists
- [ ] `outputs/inconsistency-report.md` exists

**Phase 1 Artifacts (Required for synthesis):**
- [ ] `outputs/industry-best-practices.md` exists (with ≥3 citations)
- [ ] `outputs/fp-repo-conventions.md` exists (with ≥3 citations)
- [ ] `outputs/academic-research.md` exists (with ≥3 citations)
- [ ] `outputs/llms-txt-patterns.md` exists (with ≥3 citations)

**Reflection State:**
- [ ] `REFLECTION_LOG.md` contains Phase 0 and Phase 1 learnings

If any artifacts are missing or citations are insufficient, request completion of the missing phase work before proceeding.

---

## Prompt

You are executing Phase 2 (Synthesis & Standards Definition) of the Canonical Naming Conventions spec.

### Context

Phases 0 and 1 are complete:
- Phase 0: Codebase inventory in `outputs/existing-patterns-audit.md`, `outputs/file-category-inventory.md`, `outputs/inconsistency-report.md`
- Phase 1: External research in `outputs/industry-best-practices.md`, `outputs/fp-repo-conventions.md`, `outputs/academic-research.md`, `outputs/llms-txt-patterns.md`

### Your Mission

Synthesize internal patterns and external research into actionable naming standards.

### Deliverables

1. `specs/canonical-naming-conventions/outputs/category-taxonomy.md`
2. `specs/canonical-naming-conventions/outputs/casing-decision-matrix.md`
3. `specs/canonical-naming-conventions/outputs/module-structure-patterns.md`
4. `specs/canonical-naming-conventions/outputs/naming-rules-draft.md`

### Synthesis Tasks

**Task 2.1: Category Taxonomy Synthesis**
Delegate to `reflector`:
```
Synthesize file category taxonomy from Phase 0 inventory and Phase 1 research.

Inputs:
- outputs/file-category-inventory.md (internal patterns)
- outputs/fp-repo-conventions.md (FP naming patterns)
- outputs/academic-research.md (category theory foundations)

Questions to answer:
1. What category postfixes should we standardize?
2. How do categories map to architectural layers (domain/tables/infra/client/ui)?
3. What categories are missing based on external research?
4. What postfixes need renaming for precision?

Output: Complete category taxonomy with:
- Postfix name
- Semantic purpose
- Layer association
- Grep pattern
- Rationale (internal + external evidence)
```

**Task 2.2: Casing Decision**
Delegate to `reflector`:
```
Synthesize casing conventions from Phase 0 analysis and Phase 1 research.

Inputs:
- outputs/existing-patterns-audit.md (current casing patterns)
- outputs/industry-best-practices.md (AI-friendly conventions)
- outputs/fp-repo-conventions.md (FP language casing)

Questions to answer:
1. Should we use lower-snake-case, kebab-case, or camelCase?
2. What casing do folders use vs files?
3. What is the migration cost for standardization?
4. Are there exceptions (React components, etc.)?

Output: Casing decision matrix with:
- Recommended convention
- Internal evidence supporting decision
- External evidence supporting decision
- Trade-off analysis
- Exception list with rationale
```

**Task 2.3: Module Structure Finalization**
Delegate to `reflector`:
```
Finalize barrel export and module structure patterns.

Inputs:
- outputs/existing-patterns-audit.md (mod.ts/index.ts patterns)
- outputs/fp-repo-conventions.md (barrel patterns)
- outputs/llms-txt-patterns.md (AI comprehension)

Questions to answer:
1. Should barrel files be named mod.ts, barrel.ts, or something else?
2. How should nested modules be structured?
3. What's the relationship between mod.ts and index.ts?
4. How do these patterns affect namespace imports?

Output: Module structure guide with:
- Canonical structure template
- Naming rationale
- Examples from codebase
- Migration notes
```

**Task 2.4: Rules Document Draft**
Delegate to `doc-writer`:
```
Create draft of .claude/rules/naming-conventions.md.

Inputs:
- Category taxonomy from Task 2.1
- Casing decisions from Task 2.2
- Module structure from Task 2.3

Requirements:
- Complete postfix reference table
- Casing rules with examples
- Module structure patterns
- Verification commands (grep patterns)
- Anti-patterns section

Output: Complete rules file draft in outputs/naming-rules-draft.md
```

### Decision Framework

For each standard, include:
1. **Decision**: Clear statement of the standard
2. **Internal Evidence**: What patterns exist in our codebase?
3. **External Support**: What do sources recommend?
4. **Trade-offs**: What are the costs?
5. **Exceptions**: What cases deviate and why?

### Verification

After creating artifacts:
1. Cross-reference decisions with Phase 0/1 evidence
2. Ensure all categories have unique purposes
3. Update `REFLECTION_LOG.md` with synthesis learnings

### Handoff Document

Full context: `specs/canonical-naming-conventions/handoffs/HANDOFF_P2.md`

### Success Criteria

- [ ] `outputs/category-taxonomy.md` created with all postfixes justified
- [ ] `outputs/casing-decision-matrix.md` created with rationale
- [ ] `outputs/module-structure-patterns.md` created with examples
- [ ] `outputs/naming-rules-draft.md` created and actionable
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] All decisions cite Phase 0 and Phase 1 evidence

### Next Steps

After completing Phase 2:
1. This spec's research phase is COMPLETE
2. Create separate `specs/naming-conventions-refactor/` for implementation
3. Use `mcp-refactor-typescript` MCP tools for refactoring (see `.claude/skills/mcp-refactor-typescript.md`)
4. Draft automated linting rules

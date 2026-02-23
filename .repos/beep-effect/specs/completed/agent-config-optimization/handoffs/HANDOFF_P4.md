# Phase 4 Handoff: Templates and Deduplication

**Date**: 2026-01-18
**Previous Phase**: Phase 3C (Compression) - Complete
**Next Phase**: Phase 3D (Templates and Deduplication) - Optional

---

## Context Summary

Phase 3 of the agent configuration optimization project achieved **4,555 lines saved** through compression of 11 documentation files, averaging 63% reduction per file. The project target was 6,750-9,750 lines (15-22% of total content).

Phase 3D is **optional** and focuses on creating shared templates and deduplicating cross-file content for an estimated additional 1,500-2,500 lines of savings.

---

## Completed Work

### Phase 3A-3C Summary

| Phase | Description | Lines Saved |
|-------|-------------|-------------|
| 3A | Critical fixes (stale refs, stub docs) | - |
| 3B | Created 12 AGENTS.md + 10 README.md files | - |
| 3C | Compressed 11 documentation files | 4,555 |

### Compressed Files (Phase 3C)

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| `test-writer.md` | 1,220 | 275 | 77% |
| `effect-schema-expert.md` | 947 | 306 | 68% |
| `effect-predicate-master.md` | 792 | 354 | 55% |
| `effect-testing-patterns.md` | 772 | 416 | 46% |
| `spec-reviewer.md` | 675 | 196 | 71% |
| `todox/AGENTS.md` | 671 | 226 | 66% |
| `jsdoc-fixer.md` | 587 | 258 | 56% |
| `architecture-pattern-enforcer.md` | 548 | 245 | 55% |
| `doc-writer.md` | 505 | 197 | 61% |
| `code-reviewer.md` | 458 | 147 | 68% |

---

## Phase 3D Tasks (Optional)

### OPT-013: Create Shared Verification Commands Template

**Estimated Savings**: 288-384 lines

Create `.claude/templates/verification-commands.md` that can be referenced instead of duplicated:

```markdown
## Verification Commands

| Command | Description |
|---------|-------------|
| `bun run check --filter @beep/[package]` | TypeScript type checking |
| `bun run test --filter @beep/[package]` | Run tests |
| `bun run lint --filter @beep/[package]` | Biome linting |
| `bun run build --filter @beep/[package]` | Production build |
```

Update 8-12 AGENTS.md files to reference this template instead of duplicating.

### OPT-014: Reference effect-patterns.md Instead of Re-explaining

**Estimated Savings**: 300-500 lines

Many agent files duplicate Effect pattern explanations. Update them to reference:
- `.claude/rules/effect-patterns.md` for import conventions
- `.claude/rules/general.md` for architecture rules

Files to update:
- `packages/*/AGENTS.md` files that explain Effect imports
- Agent files that include "Effect Patterns" sections

### OPT-018-019: Create Domain Package Templates

**Estimated Savings**: Maintenance improvement

Create templates for consistent domain/tables/server/client/ui AGENTS.md structure:

```
.claude/templates/
├── domain-agents.template.md
├── tables-agents.template.md
├── server-agents.template.md
├── client-agents.template.md
└── ui-agents.template.md
```

### OPT-020-024: Deduplicate Guardrails and Checklists

**Estimated Savings**: 600-900 lines

Common sections that appear in 10+ files:
1. Effect import namespace requirements
2. Native method bans (array/string)
3. Path alias requirements (`@beep/*`)
4. Contributor checklists

Create shared reference and update files to link rather than duplicate.

### OPT-025: Remove CLAUDE.md Context Duplication

**Estimated Savings**: 570-770 lines

Several rules files duplicate content from CLAUDE.md. Audit and consolidate:
- `.claude/rules/effect-patterns.md` vs `documentation/EFFECT_PATTERNS.md`
- `.claude/rules/general.md` vs CLAUDE.md sections

---

## Methodology

### Step 1: Identify Duplication Patterns

```bash
# Find files with "Verification" sections
grep -l "## Verification" packages/*/*/AGENTS.md .claude/agents/*.md

# Find files with Effect import explanations
grep -l "import \* as Effect" packages/*/*/AGENTS.md .claude/agents/*.md

# Count guardrail sections
grep -c "## Guardrails\|## Authoring Guardrails" packages/*/*/AGENTS.md
```

### Step 2: Create Shared Templates

1. Extract common patterns into `.claude/templates/`
2. Keep templates minimal and focused
3. Use markdown includes pattern: `See [Verification Commands](.claude/templates/verification.md)`

### Step 3: Update Files to Reference Templates

For each file with duplicated content:
1. Remove verbose section
2. Add reference link to template
3. Keep package-specific additions inline

### Step 4: Verify No Information Loss

```bash
# Check that all packages still have verification info accessible
grep -l "Verification\|bun run check" packages/*/*/AGENTS.md | wc -l
```

---

## Decision: Continue or Stop?

### Arguments for Continuing (Phase 3D)

- Additional 1,500-2,500 lines of savings possible
- Reduces maintenance burden (update once, applies everywhere)
- Improves consistency across documentation
- Reaches closer to 6,750 line target

### Arguments for Stopping Here

- 4,555 lines saved already (67% of minimum target)
- Remaining work has lower ROI per hour
- Template references may reduce discoverability
- Phase 3D requires careful coordination to avoid breaking documentation

### Recommendation

**Stop here** unless there's a specific need to reach the full target. The 63% average compression achieved in Phase 3C provides excellent value. Phase 3D can be pursued later as a maintenance improvement.

---

## Files Reference

| File | Purpose |
|------|---------|
| `specs/agent-config-optimization/handoffs/P3_PROGRESS.md` | Detailed progress tracking |
| `.claude/rules/effect-patterns.md` | Effect pattern reference (already exists) |
| `.claude/rules/general.md` | Architecture rules (already exists) |

---

## Orchestrator Prompt for Phase 3D

If continuing, use this prompt:

```
Continue the agent configuration optimization project with Phase 3D: Templates and Deduplication.

Context:
- Phase 3C completed with 4,555 lines saved (63% average reduction)
- Phase 3D targets shared templates and cross-file deduplication
- Estimated additional savings: 1,500-2,500 lines

Tasks:
1. Create `.claude/templates/verification-commands.md` shared template
2. Update AGENTS.md files to reference the template instead of duplicating
3. Identify files with duplicated Effect pattern explanations
4. Update those files to reference `.claude/rules/effect-patterns.md`
5. Track lines saved in P3_PROGRESS.md

Constraints:
- Do not remove package-specific information
- Maintain discoverability (readers should find what they need)
- Test that referenced files exist before removing content

Start with OPT-013 (verification commands template) as it has the clearest ROI.
```

---

## Verification

```bash
# Current agent file sizes
wc -l .claude/agents/*.md | sort -n

# AGENTS.md coverage
ls packages/*/AGENTS.md packages/*/*/AGENTS.md 2>/dev/null | wc -l

# Check for stale references
grep -r "@beep/core-" packages/ --include="*.md" | wc -l
```

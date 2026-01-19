# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 (Analysis) of the agent-config-optimization spec.

### Context

Phase 1 successfully created comprehensive inventories:
- 56 .claude/ files (17,949 lines, 92% Effect compliant)
- 48 AGENTS.md files (7,483 lines, 63% compliant, 1 CRITICAL stale reference)
- 49 README.md files (18,749 lines, 35% compliant)

Phase 2 analyzes these inventories to identify redundancy, bloat, and optimization opportunities.

### Your Mission

Analyze Phase 1 inventories and create:
1. Redundancy report (duplicate content across files)
2. Bloat analysis (verbose sections that could be compressed)
3. Benchmark comparison (against industry best practices)
4. Prioritized improvement opportunities list

### Phase 1 Verification (CRITICAL)

Before starting, verify Phase 1 outputs exist:

```bash
ls -la specs/agent-config-optimization/outputs/inventory-*.md
# Expected: 4 files (claude-config, agents-md, readme, summary)
```

**If files don't match, do NOT proceed.**

### Critical Issues to Address

The following issues were identified in Phase 1 and MUST be included in the improvement opportunities:

1. **CRITICAL**: Stale references in `packages/shared/server/AGENTS.md`
   - `@beep/core-db` → deleted package
   - `@beep/core-env` → should be `@beep/shared-env`

2. **HIGH**: 12 packages missing AGENTS.md
3. **HIGH**: 10 packages missing README.md
4. **MEDIUM**: 31 files with Effect pattern violations

### Tasks

#### Task 1: Redundancy Analysis

Use Explore agent (very thorough):

```
Analyze Phase 1 inventories in specs/agent-config-optimization/outputs/
to identify redundant content across files.

Focus on:
1. .claude/agents/*.md files sharing patterns
2. AGENTS.md files with similar structure
3. README.md files with template content

For each redundancy:
- Files affected
- Duplicated lines count
- Source of truth recommendation
- Estimated savings

Output: specs/agent-config-optimization/outputs/redundancy-report.md
```

#### Task 2: Bloat Analysis

Use spec-reviewer agent:

```
Analyze Phase 1 inventories to identify bloat patterns.

Look for:
1. Verbose explanations → tables
2. Multiple examples → 1-2 suffice
3. Excessive context → reference CLAUDE.md
4. Redundant sections
5. Outdated content

For each bloat pattern:
- File and line range
- Type of bloat
- Compression potential
- Suggested fix

Output: specs/agent-config-optimization/outputs/bloat-analysis.md
```

#### Task 3: Industry Benchmark

Use ai-trends-researcher agent:

```
Research industry best practices for AI agent documentation.

Research areas:
1. Optimal agent prompt length
2. Instruction structure best practices
3. Successful configuration patterns
4. Token efficiency techniques

Compare against current state:
- Average agent: 320 lines
- Total config: 17,949 lines
- Compliance: 63%

Output: specs/agent-config-optimization/outputs/benchmark-analysis.md
```

#### Task 4: Generate Improvement Opportunities

Synthesize Tasks 1-3 into prioritized list:

```
Create prioritized improvement list from all analyses.

For each opportunity:
- ID (OPT-001, etc.)
- Description
- Files affected
- Estimated impact
- Effort (LOW/MEDIUM/HIGH)
- Priority (CRITICAL/HIGH/MEDIUM/LOW)
- Implementation phase (P3A/P3B/P3C/P3D)

Include ALL issues from Phase 1:
- Stale references (CRITICAL)
- Missing files (HIGH)
- Pattern violations (MEDIUM)

Output: specs/agent-config-optimization/outputs/improvement-opportunities.md
```

### Verification

After all analyses complete:

```bash
# Verify all output files exist
ls specs/agent-config-optimization/outputs/ | grep -E "(redundancy|bloat|benchmark|improvement)"
# Expected: 4 files

# Verify prioritized items
grep -c "OPT-" specs/agent-config-optimization/outputs/improvement-opportunities.md
# Expected: >25 items
```

### Success Criteria

- [ ] `redundancy-report.md` identifies ≥20 redundancies
- [ ] `bloat-analysis.md` identifies ≥30 bloat sections
- [ ] `benchmark-analysis.md` includes industry comparisons
- [ ] `improvement-opportunities.md` has ≥25 prioritized items
- [ ] CRITICAL stale reference issue is first in priority list
- [ ] All Phase 1 issues are captured in improvement list
- [ ] `REFLECTION_LOG.md` updated
- [ ] `HANDOFF_P3.md` created
- [ ] `P3_ORCHESTRATOR_PROMPT.md` created

### Reference Files

- Spec: `specs/agent-config-optimization/README.md`
- Phase 2 context: `specs/agent-config-optimization/handoffs/HANDOFF_P2.md`
- Phase 1 outputs: `specs/agent-config-optimization/outputs/`

### Output Format

Ensure all outputs follow consistent format:

```markdown
# [Analysis Type] Analysis

## Summary
- Total [items] analyzed: X
- [Key metric 1]: X
- [Key metric 2]: X

## Findings Table

| ID | Description | Files | Impact | Effort | Priority |
|----|-------------|-------|--------|--------|----------|
| XXX-001 | ... | ... | ... | ... | ... |

## Recommendations

1. **CRITICAL**: [item]
2. **HIGH**: [item]
...
```

### Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P3.md` (context document)
3. Create `P3_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 3 will implement optimizations in sub-phases:
- 3A: Fix stale references
- 3B: Create missing documentation
- 3C: Apply optimization patterns
- 3D: Update cross-references

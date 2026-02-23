# P1 Orchestrator Prompt: Redundancy & Conflict Analysis

You are executing Phase 1 of the `agent-infrastructure-rationalization` spec.

---

## Context

P0 established baseline metrics:
- **31 agents**: 18 synced, 11 orphaned, 2 missing files
- **53 unique skills**: scattered across 6 directories
- **82K tokens per session**: 51% above target

P1 identifies redundancies and conflicts to inform consolidation.

---

## Your Mission

Execute 3 analysis tasks to produce a redundancy report:

1. **Agent Overlap Analysis**: Which agents serve identical purposes?
2. **Configuration Conflict Check**: Are rules consistent across IDEs?
3. **CLAUDE.md Redundancy Analysis**: What's duplicated between root and .claude?

---

## Critical Patterns

**DO use specialized agents**:
```
reflector         → Agent overlap analysis (meta-reflection capability)
code-reviewer     → Configuration conflict detection
Explore           → CLAUDE.md comparison (read-only)
```

**DO reference P0 outputs**:
```
specs/agent-infrastructure-rationalization/outputs/agent-catalog.md
specs/agent-infrastructure-rationalization/outputs/skill-duplication-matrix.md
specs/agent-infrastructure-rationalization/outputs/hook-analysis.md
```

**DON'T modify any files** - P1 is analysis only, changes happen in P5

---

## Task Details

### Task 1: Agent Overlap Analysis

Spawn reflector agent with:

```markdown
<contextualization>
P0 identified 31 agents with these distribution issues:
- 18 synced (manifest + file)
- 11 orphaned (file only, no manifest entry)
- 2 missing (manifest entry, no file)

Known overlap candidates:
- codebase-researcher vs codebase-explorer
- effect-researcher vs effect-expert vs effect-schema-expert vs effect-predicate-master
- doc-writer vs agents-md-updater vs readme-updater
- observability-expert vs code-observability-writer

Reference: specs/agent-infrastructure-rationalization/outputs/agent-catalog.md
</contextualization>

Analyze agent overlaps:
1. Read the agent catalog
2. For each potential overlap pair, score similarity (0-100%)
3. Recommend: MERGE (>80%), EVALUATE (50-80%), KEEP SEPARATE (<50%)
4. Produce overlap matrix as markdown table
```

### Task 2: Configuration Conflict Check

Spawn code-reviewer agent with:

```markdown
<contextualization>
Rule files exist in three locations:
- .claude/rules/ (authoritative)
- .cursor/rules/ (MDC format, synced via script)
- .windsurf/rules/ (symlink to .claude/rules)

P0 found skill naming inconsistencies; similar issues may exist in rules.
</contextualization>

Check for configuration conflicts:
1. Compare .claude/rules/*.md with .cursor/rules/*.mdc
2. Identify content differences, format issues, missing files
3. Check .windsurf/rules symlink validity
4. Produce conflict matrix showing: file, .claude state, .cursor state, .windsurf state, issue
```

### Task 3: CLAUDE.md Redundancy

Spawn Explore agent with:

```markdown
Compare CLAUDE.md files:
1. Read /home/elpresidank/YeeBois/projects/beep-effect2/CLAUDE.md (~8KB)
2. Read /home/elpresidank/YeeBois/projects/beep-effect2/.claude/CLAUDE.md (~3KB)
3. Identify: overlapping sections, contradictions, unique content
4. Calculate potential token savings if consolidated
5. Recommend consolidation strategy
```

---

## Deliverables

Create these files in `specs/agent-infrastructure-rationalization/outputs/`:

### 1. `P1_REDUNDANCY_REPORT.md`

Summary report with:
- Executive summary
- Agent overlap findings
- Configuration conflict findings
- CLAUDE.md redundancy findings
- Consolidation recommendations (prioritized)

### 2. `agent-overlap-matrix.md`

| Agent A | Agent B | Similarity | Recommendation |
|---------|---------|------------|----------------|
| ... | ... | ...% | MERGE/EVALUATE/KEEP |

### 3. `conflict-matrix.md`

| File | .claude | .cursor | .windsurf | Issue |
|------|---------|---------|-----------|-------|
| ... | ✓/content | ✓/content | ✓/symlink | ... |

---

## Verification

After analysis complete:
```bash
# Verify outputs created
ls -la specs/agent-infrastructure-rationalization/outputs/P1_*
ls -la specs/agent-infrastructure-rationalization/outputs/*matrix.md
```

---

## Success Criteria

- [ ] Agent overlap matrix covers all 31 agents
- [ ] Configuration conflicts documented for all rule files
- [ ] CLAUDE.md redundancy quantified (token count)
- [ ] Consolidation recommendations prioritized (high/medium/low)
- [ ] All deliverables in outputs/ directory

---

## Handoff Reference

Full context: `specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P1.md`

# Handoff — Phase 1: Git Subtree Setup

> Context document for Phase 1 implementation.

---

## Context Budget Status

| Memory Type | Est. Tokens | Budget | Status |
|-------------|-------------|--------|--------|
| Working | ~800 | ≤2,000 | ✅ OK |
| Episodic | ~400 | ≤1,000 | ✅ OK |
| Semantic | ~200 | ≤500 | ✅ OK |
| Procedural | Links | N/A | ✅ OK |
| **Total** | **~1,400** | **≤4,000** | **✅ OK** |

---

## Working Context (≤2K tokens)

### Phase 1 Mission

Add the Effect repository as a git subtree to provide agents with direct source access.

### Tasks

| ID | Task | Agent | Output |
|----|------|-------|--------|
| 1.1 | Research subtree best practices | web-researcher | Informed orchestrator |
| 1.2 | Add Effect subtree | Bash (direct) | `.repos/effect/` |
| 1.3 | Configure tooling exclusions | Bash (direct) | Updated configs |
| 1.4 | Document workflow | doc-writer | `documentation/subtree-workflow.md` |

### Success Criteria

- [ ] `.repos/effect/` exists with Effect source
- [ ] Effect source searchable via grep/glob
- [ ] Tooling exclusions configured if needed
- [ ] `documentation/subtree-workflow.md` created
- [ ] `bun run check` passes
- [ ] REFLECTION_LOG.md updated

### Blocking Issues

None currently identified.

---

## Episodic Context (≤1K tokens)

### Phase 0 Summary

**Completed**:
- Created spec structure (README, REFLECTION_LOG, QUICK_START, MASTER_ORCHESTRATION, RUBRICS)
- Analyzed existing agent infrastructure (65+ AGENTS.md files, 35+ skills)
- Identified gaps: No `.repos/` subtrees, no `context/` best practices

**Key Decisions**:
- Use single Effect monorepo subtree (contains effect, platform, ai packages)
- Context files will be generated in Phase 2
- Index enhancement in Phase 3

---

## Semantic Context (≤500 tokens)

### Project Constants

- **Tech Stack**: Effect 3, Bun 1.3.x, TypeScript
- **Effect Monorepo**: Contains `packages/effect/`, `packages/platform/`, `packages/ai/`
- **Subtree Location**: `.repos/effect/`
- **Squash Strategy**: Use `--squash` to avoid history bloat

---

## Procedural Context (Links only)

| Resource | Path | Purpose |
|----------|------|---------|
| Master Orchestration | `MASTER_ORCHESTRATION.md` | Full Phase 1 workflow |
| Spec Guide | `specs/_guide/README.md` | Handoff standards |
| Effect Patterns | `.claude/rules/effect-patterns.md` | Code standards |

---

## Implementation Details

### Task 1.2: Add Effect Subtree

```bash
# Create .repos directory
mkdir -p .repos

# Add Effect subtree (squash to avoid history bloat)
git subtree add --prefix=.repos/effect https://github.com/Effect-TS/effect.git main --squash
```

**Expected Result**:
- `.repos/effect/` contains full Effect monorepo
- Includes: `packages/effect/`, `packages/platform/`, `packages/ai/`

### Task 1.3: Configure Exclusions

**Files to Check**:
- `knip.config.ts` - May need to exclude `.repos/` from analysis
- `biome.jsonc` - May need to exclude `.repos/` from linting

---

## Verification Steps

| Step | Command | Expected |
|------|---------|----------|
| Subtree exists | `ls .repos/effect/packages/effect/src/Effect.ts` | File exists |
| Source searchable | `grep -l "flatMap" .repos/effect/packages/effect/src/Effect.ts` | Match found |
| Build passes | `bun run check` | No errors |
| Tests pass | `bun run test` | No regressions |

---

## Known Issues & Gotchas

1. **Large Download**: Effect monorepo is ~100MB. Use `--squash` to avoid pulling full history.
2. **Merge Conflicts**: If updating subtree later, use `--squash` to minimize conflicts.
3. **IDE Indexing**: Some IDEs may index subtree sources. Consider excluding in IDE settings if performance degrades.

---

## Context Engineering Notes

**For Orchestrator**:
- This handoff targets ~1.4K tokens (within 4K budget)
- Keep P2 handoff focused: only include completed P1 artifacts, not full source listings
- Delegate large file analysis to codebase-researcher, summarize findings

**For Sub-agents**:
- web-researcher: Limit subtree research to actionable guidance (3-5 best practices max)
- doc-writer: Use workflow template, avoid freeform documentation

---

## Exit to Phase 2

After completing Phase 1:
1. Update REFLECTION_LOG.md with learnings
2. Populate `handoffs/HANDOFF_P2.md` with P1 results
3. Verify `handoffs/P2_ORCHESTRATOR_PROMPT.md` is ready

# Spec Folder Standardization — Claude Instance Prompt

> Use this prompt to have a Claude instance systematize the self-improving spec pattern across all spec folders AND integrate it with core context files.

---

## Context

The `specs/ai-friendliness-audit/` folder has established a self-improving specification pattern that captures learnings and refines prompts across execution phases. This pattern should be:
1. **Systematized** across all spec folders
2. **Integrated** with core context files (CLAUDE.md)
3. **Self-referential** — this standardization itself follows the pattern

## Your Mission

1. Audit and standardize all spec folders in `specs/`
2. Update CLAUDE.md to reference the spec pattern
3. Reconcile `.claude/skills/` with `specs/` patterns
4. Clean up or consolidate conflicting locations

---

## Read First (In Order)

1. `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` — The pattern to apply
2. `specs/ai-friendliness-audit/REFLECTION_LOG.md` — Example of accumulated learnings
3. `CLAUDE.md` — Current core context (to be updated)
4. `.claude/skills/prompt-refinement/SKILL.md` — Overlapping pattern
5. `.claude/skills/research-orchestration/SKILL.md` — Overlapping pattern

---

## The Standard Spec Structure

Every spec folder should have this structure:

```
specs/[SPEC_NAME]/
├── README.md                     # Entry point (100-150 lines)
├── QUICK_START.md               # 5-min getting started (optional for simple)
├── MASTER_ORCHESTRATION.md      # Full workflow (for complex specs)
├── AGENT_PROMPTS.md             # Specialized prompts (for complex specs)
├── RUBRICS.md                   # Evaluation criteria (if applicable)
├── REFLECTION_LOG.md            # Cumulative learnings
├── templates/                   # Output templates (if applicable)
├── outputs/                     # Generated artifacts
└── handoffs/                    # Iterative execution (for multi-phase)
    ├── HANDOFF_P[N].md
    └── P[N]_ORCHESTRATOR_PROMPT.md
```

---

## Tasks

### Task 1: Audit Existing Specs

For each folder in `specs/`:

1. List current files and structure
2. Identify which standard files are missing
3. Classify complexity: Simple / Medium / Complex
4. Note unique patterns to preserve

**Output**: `specs/SPEC_AUDIT_REPORT.md`

---

### Task 2: Create Missing Core Files

For specs missing core files, create:
- **README.md** if missing (always required)
- **REFLECTION_LOG.md** if missing (always required, even if empty)
- **QUICK_START.md** for medium+ complexity

---

### Task 3: Update CLAUDE.md

Add a "Specifications" section to CLAUDE.md:

```markdown
## Specifications

Self-improving specification workflow for complex tasks. See [META_SPEC_TEMPLATE.md](specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md).

| Action | Location |
|--------|----------|
| Create new spec | `specs/[name]/` following META_SPEC_TEMPLATE |
| Standardize specs | `specs/SPEC_STANDARDIZATION_PROMPT.md` |
| View all specs | `specs/README.md` |

Key patterns:
- Phase-based workflow (Discovery → Evaluation → Synthesis)
- Self-reflection via REFLECTION_LOG.md
- Multi-session handoffs via HANDOFF_P[N].md
```

---

### Task 4: Reconcile .claude/skills/ with specs/

Two skills output to spec-like locations but don't follow META_SPEC_TEMPLATE:

**Option A: Update skills to use specs/**
1. Update `prompt-refinement/SKILL.md`:
   - Change output from `.specs/<name>/` to `specs/<name>/`
   - Add: "For multi-session work, generate HANDOFF_P1.md per META_SPEC_TEMPLATE"
   - Add: "Create REFLECTION_LOG.md for accumulated learnings"

2. Update `research-orchestration/SKILL.md`:
   - Change output from `.claude/prompts/` to `specs/<name>/`
   - Reference META_SPEC_TEMPLATE for structure

**Option B: Keep skills lightweight, link to full pattern**
1. Add note to each skill: "For complex multi-phase work, see META_SPEC_TEMPLATE.md"
2. Keep skills for single-session work
3. Use specs/ for multi-session orchestration

**Recommendation**: Option B — skills are for quick work, specs/ are for complex orchestration.

---

### Task 5: Clean Up Orphaned Locations

1. **Move** `.claude/prompts/runtime-server-refactor-orchestration.md` to `specs/runtime-server-refactor/`
2. **Delete** `.claude/prompts/` directory after moving
3. **Update** any references to the old location

---

### Task 6: Update Root specs/README.md

Create or update with:
1. Standard spec structure description
2. Table of all specs with status and complexity
3. Link to META_SPEC_TEMPLATE.md
4. Instructions for creating new specs
5. Link to SPEC_STANDARDIZATION_PROMPT.md for future audits

---

## Execution Protocol

### Phase 1: Audit (Read-Only)
1. List all spec folders
2. Catalog contents of each
3. Generate SPEC_AUDIT_REPORT.md

### Phase 2: Standardize Specs
For each spec by priority:
1. Create missing README.md
2. Create missing REFLECTION_LOG.md
3. Restructure if needed

### Phase 3: Update Core Files
1. Update CLAUDE.md with Specifications section
2. Update root specs/README.md

### Phase 4: Reconcile Skills
1. Add META_SPEC_TEMPLATE references to skills
2. Move orphaned prompts to specs/
3. Clean up `.claude/prompts/`

### Phase 5: Self-Reflection
1. Log learnings to this spec's REFLECTION_LOG.md
2. Generate HANDOFF_P2.md if work remains
3. Update SPEC_STANDARDIZATION_PROMPT.md with improvements

---

## Success Criteria

- [ ] All spec folders have README.md
- [ ] All spec folders have REFLECTION_LOG.md
- [ ] Complex specs have handoff mechanism
- [ ] CLAUDE.md references spec pattern
- [ ] Root specs/README.md is comprehensive
- [ ] Skills reference META_SPEC_TEMPLATE for complex work
- [ ] No orphaned prompt files in `.claude/prompts/`
- [ ] This spec has its own REFLECTION_LOG.md

---

## Self-Referential Bootstrap

This standardization prompt is ITSELF a spec. After completing the audit:

1. Create `specs/spec-standardization/` directory
2. Move this file to `specs/spec-standardization/MASTER_ORCHESTRATION.md`
3. Create:
   - `specs/spec-standardization/README.md`
   - `specs/spec-standardization/REFLECTION_LOG.md`
   - `specs/spec-standardization/outputs/SPEC_AUDIT_REPORT.md`
4. Generate `HANDOFF_P2.md` with learnings

This ensures the standardization follows its own pattern.

---

## Files to Create/Update Summary

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `specs/SPEC_AUDIT_REPORT.md` | Audit findings |
| UPDATE | `specs/README.md` | Root index with structure |
| UPDATE | `CLAUDE.md` | Add Specifications section |
| UPDATE | `.claude/skills/prompt-refinement/SKILL.md` | Reference META_SPEC_TEMPLATE |
| UPDATE | `.claude/skills/research-orchestration/SKILL.md` | Reference META_SPEC_TEMPLATE |
| MOVE | `.claude/prompts/*.md` → `specs/*/` | Consolidate locations |
| DELETE | `.claude/prompts/` | After moving contents |
| CREATE | `specs/spec-standardization/` | This spec's proper home |

---

## Notes

1. **Don't over-engineer simple specs** — A single investigation note only needs README.md + REFLECTION_LOG.md
2. **Preserve existing value** — Some specs have unique methodologies worth keeping
3. **Skills vs Specs**: Skills = single-session, Specs = multi-session orchestration
4. **Self-referential is key** — This standardization must follow its own rules

---

## Begin

Start by reading META_SPEC_TEMPLATE.md, then execute Task 1 (Audit).

# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Inventory) of the agent-config-optimization spec.

### Context

Phase 0 successfully optimized 4 bootstrap agents from 1,842 to 716 lines (61% reduction). Phase 1 creates an exhaustive inventory of all agent-related documentation.

### Your Mission

Create complete inventories of:
1. `.claude/` directory structure
2. All AGENTS.md files (~50 expected)
3. All README.md files (~60 expected)

### Phase 0 Verification (CRITICAL)

Before starting, verify Phase 0 optimization was applied:

```bash
wc -l .claude/agents/agents-md-updater.md .claude/agents/readme-updater.md \
      .claude/agents/ai-trends-researcher.md .claude/agents/codebase-researcher.md
# Expected total: ~716 lines (down from 1,842)
```

**If counts don't match, do NOT proceed.**

### Critical Patterns

**Inventory Table Format**:
````markdown
| File | Lines | Sections | References | Effect Compliant |
|------|-------|----------|------------|------------------|
| path/file.md | 123 | Purpose, Usage | CLAUDE.md, effect-patterns.md | Yes |
````

**Expected Output Structure**:
- Summary metrics at top (total files, avg lines, compliance %)
- Per-file table with all columns populated
- Gap analysis section (missing files, stale references)

### Tasks

#### Task 1: Inventory .claude/ Directory

Use Explore agent (very thorough):

```
Create a comprehensive inventory of the .claude/ directory structure.

For each file, capture:
1. Full path and filename
2. Line count
3. Key sections (from headers)
4. Cross-references to other files
5. Whether it follows Effect patterns

Output: specs/agent-config-optimization/outputs/inventory-claude-config.md

Structure as a table:
| File | Lines | Sections | References | Effect Compliant |
```

#### Task 2: Audit AGENTS.md Files

Use agents-md-updater agent:

```
Create an exhaustive inventory of all AGENTS.md files in the repository.

For each file, capture:
1. Package path and name
2. Line count
3. Whether package.json exists
4. Whether README.md exists
5. Stale @beep/* references (count)
6. MCP tool shortcuts present (yes/no)
7. Effect pattern compliance

Output: specs/agent-config-optimization/outputs/inventory-agents-md.md
```

#### Task 3: Audit README.md Files

Use readme-updater agent:

```
Create an exhaustive inventory of all README.md files in packages/, apps/, and tooling/.

For each file, capture:
1. Package path and name
2. Line count
3. Whether package.json exists
4. Whether AGENTS.md exists
5. Required sections present
6. Effect pattern compliance

Output: specs/agent-config-optimization/outputs/inventory-readme.md
```

### Verification

After all inventories complete:

```bash
# Verify all output files exist
ls -la specs/agent-config-optimization/outputs/

# Check counts
grep -c "|" specs/agent-config-optimization/outputs/inventory-*.md
```

### Success Criteria

- [ ] `inventory-claude-config.md` lists all `.claude/` files
- [ ] `inventory-agents-md.md` lists all AGENTS.md files
- [ ] `inventory-readme.md` lists all README.md files
- [ ] Each includes line counts and compliance status
- [ ] `REFLECTION_LOG.md` updated
- [ ] `HANDOFF_P2.md` created
- [ ] `P2_ORCHESTRATOR_PROMPT.md` created

### Reference Files

- Spec: `specs/agent-config-optimization/README.md`
- Phase 1 context: `specs/agent-config-optimization/handoffs/HANDOFF_P1.md`
- Phase 0 outputs: `specs/agent-config-optimization/outputs/`

### Handoff Document

Read full context in: `specs/agent-config-optimization/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P2.md` (context document)
3. Create `P2_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 2 will analyze redundancy, detect bloat, and prioritize optimization opportunities.

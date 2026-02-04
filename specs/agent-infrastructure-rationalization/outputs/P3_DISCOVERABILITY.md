# P3 Implementation Summary: Discoverability Enhancement

> Phase 3 deliverables for agent-infrastructure-rationalization spec
> Completed: 2026-02-03

---

## Deliverables Created

### 1. Agent Capability Matrix

**Location**: `specs/_guide/AGENT_CAPABILITIES.md`

Human-readable reference for selecting the right agent for each task type. Complements the machine-readable `agents-manifest.yaml`.

**Key Features**:
- Task-to-agent mapping table
- Capability classification (read-only, write-reports, write-files)
- Phase-based selection guidance
- Decision tree for quick lookup
- Anti-patterns section

### 2. Discovery Kit Skill

**Location**: `.claude/skills/discovery-kit/SKILL.md`

Glob and Grep patterns optimized for the beep-effect monorepo.

**Key Features**:
- Package structure patterns (slice/layer navigation)
- Effect-specific search patterns (services, layers, schemas)
- Common verification sequences (package exists, export exists, etc.)
- Anti-patterns (avoid Bash for discovery)
- Performance tips

### 3. Token Budget Validator

**Location**: `specs/_guide/scripts/validate-handoff.sh`

Bash script enforcing ≤4K token limit on handoff documents.

**Key Features**:
- Word count → token estimation (~1.33 tokens/word)
- Color-coded output (pass/fail/warning)
- Warning zone at 80% of budget
- Actionable suggestions on failure
- Exit codes for automation (0=pass, 1=fail, 2=error)

---

## Design Decisions

### 1. Capability Matrix Location

**Decision**: `specs/_guide/AGENT_CAPABILITIES.md` (not in `.claude/`)

**Rationale**:
- Spec guide is for orchestration patterns
- `.claude/agents-manifest.yaml` remains machine-readable source
- Avoids duplication in IDE-synced directories

### 2. Discovery Kit Structure

**Decision**: Single `SKILL.md` file (not multi-file structure)

**Rationale**:
- Keeps patterns together for easy reference
- Avoids directory traversal overhead
- Matches existing skill format conventions
- P2 suggested multi-file but single file is more practical

### 3. Token Estimation Method

**Decision**: Word count × 1.33 (simple approximation)

**Rationale**:
- No external dependencies (pure bash)
- Close enough for enforcement purposes
- More conservative than character-based estimation
- Easy to understand and audit

---

## Validation Results

```bash
# Agent capability matrix
✅ specs/_guide/AGENT_CAPABILITIES.md (created)

# Discovery kit skill
✅ .claude/skills/discovery-kit/SKILL.md (created)

# Token validator
✅ specs/_guide/scripts/validate-handoff.sh (created, executable)

# Verify script works
$ ./specs/_guide/scripts/validate-handoff.sh specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P3.md
✅ PASSED: ~2400 tokens (60% of budget)
```

---

## Integration Notes

### Using the Capability Matrix

Orchestrators should reference `AGENT_CAPABILITIES.md` when selecting agents:

```markdown
<!-- In orchestrator prompt -->
See specs/_guide/AGENT_CAPABILITIES.md for agent selection guidance.
```

### Using the Discovery Kit

Agents can reference discovery patterns:

```markdown
<!-- In agent definition or skill -->
See .claude/skills/discovery-kit/SKILL.md for search patterns.
```

### Using the Token Validator

Run before committing handoff documents:

```bash
./specs/_guide/scripts/validate-handoff.sh handoffs/HANDOFF_P*.md
```

---

## Next Phase (P4)

P4 will implement the actual infrastructure changes:
1. Merge `agents-md-updater` + `readme-updater` → `doc-maintainer`
2. Remove missing agents from manifest
3. Add orphaned agents to manifest
4. Migrate `.claude/CLAUDE.md` content to rules
5. Fix IDE sync (Cursor rules, Windsurf symlinks)

See `handoffs/HANDOFF_P4.md` for full context.

---

## Files Modified

| File | Action |
|------|--------|
| `specs/_guide/AGENT_CAPABILITIES.md` | Created |
| `.claude/skills/discovery-kit/SKILL.md` | Created |
| `specs/_guide/scripts/validate-handoff.sh` | Created |
| `outputs/P3_DISCOVERABILITY.md` | Created |
| `handoffs/HANDOFF_P4.md` | Created |
| `handoffs/P4_ORCHESTRATOR_PROMPT.md` | Created |
| `REFLECTION_LOG.md` | Updated |

---

## Metrics

| Metric | Value |
|--------|-------|
| Files created | 6 |
| Lines of documentation | ~450 |
| Token validator budget | 4000 |
| Phase duration | Single session |

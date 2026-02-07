# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 (Implementation) of the agent-config-optimization spec.

### Context

Phase 2 identified 43 improvement opportunities with estimated savings of 6,750-9,750 lines (15-22% reduction):
- 2 CRITICAL items (stale references)
- 15 HIGH items (missing docs, large file compression)
- 18 MEDIUM items (pattern fixes, deduplication)
- 8 LOW items (templates, metadata)

### Your Mission

Implement improvements in 4 sub-phases:
- P3A: Fix critical issues (30 min)
- P3B: Create missing documentation (5-7 hrs)
- P3C: Apply compression optimizations (20-30 hrs)
- P3D: Update cross-references and templates (10-14 hrs)

### Phase 2 Verification (CRITICAL)

Before starting, verify Phase 2 outputs exist:

```bash
ls -la specs/agent-config-optimization/outputs/ | grep -E "(redundancy|bloat|benchmark|improvement)"
# Expected: 4 files
```

**If files don't match, do NOT proceed.**

### Sub-Phase 3A: Critical Fixes (REQUIRED FIRST)

#### OPT-001: Fix Stale Package References

```bash
# Verify the issue exists
grep "@beep/core-" packages/shared/server/AGENTS.md
```

**Action**:
1. Read `packages/shared/server/AGENTS.md`
2. Line 5: Replace `@beep/core-db` → remove or update to current
3. Line 5: Replace `@beep/core-env` → `@beep/shared-env`
4. Verify: `grep -r "@beep/core-" packages/` returns 0

#### OPT-002: Handle Stub Documentation

**File**: `.claude/commands/port.md` (9 lines)
**Decision**: Either expand or remove - document rationale.

### Sub-Phase 3B: Create Missing Documentation

Use the agents-md-updater agent for AGENTS.md and readme-updater for README.md.

#### Create 12 Missing AGENTS.md Files

```
Launch agents-md-updater agent with prompt:

"Create AGENTS.md files for these packages using the template
at .claude/agents/templates/agents-md-template.md:

- packages/knowledge/server
- packages/knowledge/tables
- packages/knowledge/domain
- packages/knowledge/ui
- packages/knowledge/client
- packages/calendar/server
- packages/calendar/tables
- packages/calendar/domain
- packages/calendar/ui
- packages/calendar/client
- packages/common/wrap
- packages/ui/editor

For each package:
1. Read package.json for name and dependencies
2. Analyze src/ directory structure
3. Generate AGENTS.md following template
4. Verify syntax is valid"
```

#### Create 10 Missing README.md Files

```
Launch readme-updater agent with prompt:

"Create README.md files for packages missing them.
Use the domain README pattern from packages/iam/domain/README.md as template.

Missing packages:
- packages/calendar/* (all 5)
- packages/knowledge/client
- packages/knowledge/server
- packages/knowledge/tables
- packages/knowledge/ui
- packages/ui/editor

Include required sections: Purpose, Installation, Key Exports, Dependencies."
```

### Sub-Phase 3C: Apply Compression Optimizations

#### Compress Largest Files

Start with the largest files for maximum impact:

```
For .claude/agents/test-writer.md (1,220 lines → 600-800):

1. Read the file
2. Convert verbose API reference sections (lines 48-445) to single table
3. Reduce excessive examples (lines 440-890) to 1 per pattern
4. Remove redundant import block (lines 1158-1202), add reference
5. Target: 600-800 lines
6. Verify functionality preserved
```

Repeat for:
- effect-schema-expert.md (947 → 650-750)
- effect-predicate-master.md (792 → 620-700)
- effect-testing-patterns.md (772 → 520-600)
- apps/todox/AGENTS.md (672 → 450-520)
- packages/shared/ui/AGENTS.md (430 → 280-320)

#### Fix Pattern Violations

```
For each file in the 18 non-compliant AGENTS.md files:

1. Find native array methods (.map, .filter, .reduce)
2. Replace with Effect utilities (A.map, A.filter, A.reduce)
3. Find Effect.runPromise patterns
4. Replace with @beep/testkit patterns
5. Verify examples are syntactically valid
```

### Sub-Phase 3D: Update Cross-References

#### Create Templates

Create `.claude/templates/domain-agents-md.template` with placeholders for:
- Package name
- Entity list
- Surface map content

Create `.claude/templates/domain-readme.template` similarly.

#### Deduplicate Sections

For Verifications sections in 48 AGENTS.md files:
1. Create `.claude/shared/verification-commands.md`
2. Add template with `{{PACKAGE_NAME}}` placeholder
3. Replace verbose sections with: "See `.claude/shared/verification-commands.md`"

### Verification After Each Sub-Phase

```bash
# After P3A
grep -r "@beep/core-" packages/
# Expected: 0 results

# After P3B
ls packages/knowledge/*/AGENTS.md packages/calendar/*/AGENTS.md | wc -l
# Expected: 10

# After P3C
wc -l .claude/agents/test-writer.md
# Expected: 600-800

# After P3D
wc -l specs/agent-config-optimization/outputs/*.md | grep total
# Verify consistent outputs
```

### Success Criteria

- [ ] OPT-001 resolved (0 stale references)
- [ ] OPT-003 resolved (12 new AGENTS.md)
- [ ] OPT-004 resolved (10 new README.md)
- [ ] test-writer.md ≤800 lines
- [ ] Effect compliance 100% in AGENTS.md
- [ ] Total line reduction ≥15%
- [ ] All cross-references resolve
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P4.md created
- [ ] P4_ORCHESTRATOR_PROMPT.md created

### Reference Files

- Spec: `specs/agent-config-optimization/README.md`
- Phase 3 context: `specs/agent-config-optimization/handoffs/HANDOFF_P3.md`
- Improvement list: `specs/agent-config-optimization/outputs/improvement-opportunities.md`
- Bloat analysis: `specs/agent-config-optimization/outputs/bloat-analysis.md`

### Execution Order

1. **P3A first** - Critical fixes must be done before other changes
2. **P3B second** - Create missing docs before modifying existing
3. **P3C third** - Apply compression after baseline established
4. **P3D last** - Cross-references depend on final content

### Progress Tracking

After each sub-phase:
1. Verify success criteria for that sub-phase
2. Update REFLECTION_LOG.md with challenges/learnings
3. Commit changes if working in git

### Output Format

Track metrics in `specs/agent-config-optimization/outputs/p3-metrics.md`:

```markdown
# Phase 3 Implementation Metrics

## Sub-Phase 3A: Critical Fixes
- [ ] OPT-001: Stale refs fixed (before: 2, after: 0)
- [ ] OPT-002: Stub handled (decision: expand/remove)

## Sub-Phase 3B: Missing Documentation
- [ ] AGENTS.md created: 0/12
- [ ] README.md created: 0/10
- [ ] Required sections added: 0/17

## Sub-Phase 3C: Compression
| File | Before | After | Reduction |
|------|--------|-------|-----------|
| test-writer.md | 1,220 | | |
...

## Sub-Phase 3D: Cross-References
- [ ] Templates created: 0/2
- [ ] Verifications deduplicated: 0/48
...
```

### Next Phase

After completing Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P4.md` (context document)
3. Create `P4_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 4 will validate all changes and confirm targets met.

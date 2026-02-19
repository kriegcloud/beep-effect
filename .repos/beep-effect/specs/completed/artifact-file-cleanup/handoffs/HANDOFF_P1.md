# Handoff: Phase 1 - Discovery

> Complete context for Phase 1 of the artifact file cleanup spec.

---

## Previous Phase Summary

**Phase 0 (Spec Creation)** completed:
- Created spec structure in `specs/artifact-file-cleanup/`
- Defined artifact categories and detection heuristics
- Identified ~8 high-confidence candidates and ~6 needing validation
- Established methodology for systematic discovery

---

## Phase 1 Mission

Systematically discover all artifact files in the repository using the defined heuristics.

### Objectives

1. Scan repository for files matching artifact patterns
2. Cross-reference against legitimacy criteria
3. Generate comprehensive candidate list with rationale
4. Categorize findings by confidence level

### Deliverable

`specs/artifact-file-cleanup/outputs/artifact-candidates.md`

---

## Detection Methodology

### Step 1: Root-Level Script Scan

Find potentially orphaned scripts at repository root:

```bash
# Python/Shell scripts (almost always artifacts in this repo)
ls *.py *.sh *.mjs 2>/dev/null

# Expected findings:
# - update-spec-guide.py (migration script)
# - update-spec-guide.sh (shell wrapper)
# - test-splitter.mjs (unknown - validate)
# - terragon-setup.sh (unknown - validate)
```

### Step 2: Package Folder Artifacts

Find one-off outputs left in package directories:

```bash
# Audit reports
find packages tooling -name "*AUDIT*.md" 2>/dev/null

# Implementation prompts
find packages -name "*PROMPT*.md" 2>/dev/null

# Expected findings:
# - packages/shared/client/README_AUDIT_REPORT.md
# - packages/common/utils/AUDIT_REPORT.md
# - packages/common/identity/IMPLEMENTATION_PROMPT.md
# - tooling/repo-scripts/README_AUDIT_REPORT.md
```

### Step 3: Scripts Folder Analysis

Determine which scripts are legitimate vs artifacts:

```bash
# List all scripts
ls scripts/

# Check package.json for references
cat package.json | jq '.scripts'

# For each script not in package.json, check if referenced elsewhere
rg "scripts/filename" --type ts --type md --type json
```

Scripts in this repo's `scripts/`:
- `sync-cursor-rules.ts` - Referenced in CLAUDE.md, KEEP
- `install-gitleaks.sh` - Security tooling, likely KEEP
- `analyze-jsdoc.mjs` - Validate purpose
- `analyze-jsdoc.md` - Documentation for above
- `analyze-agents-md.ts` - Validate purpose
- `find-missing-agents.ts` - Validate purpose
- `analyze-readme-inventory.ts` - Validate purpose
- `analyze-readme-simple.ts` - Validate purpose
- `update-handoff-standards.py` - Migration script, DELETE
- `update-handoff-standards.ts` - Likely replaced .py version, validate

### Step 4: Root Markdown Files

Check for planning/meta documents:

```bash
# List markdown at root (excluding standard files)
ls *.md | grep -v -E "^(README|CLAUDE|ARCHITECTURE|CONTRIBUTING)"
```

Known candidates:
- `agents-meta-prompt.md` - Planning notes, DELETE
- `chat-ui.md` - Validate if active design doc

### Step 5: Cross-Reference Validation

For each candidate, verify it's not referenced:

```bash
# Check if filename appears in codebase
rg "filename" --type ts --type md --type json -l

# Check turbo.json
cat turbo.json | jq '.'

# Check any import statements
rg "from.*filename" --type ts
```

---

## Output Template

Create `outputs/artifact-candidates.md` with this structure:

```markdown
# Artifact Candidates Report

**Generated**: [DATE]
**Phase**: Discovery (P1)

## Summary

| Category | Count |
|----------|-------|
| High Confidence DELETE | N |
| Needs Validation | N |
| Confirmed KEEP | N |
| **Total Scanned** | N |

---

## High Confidence DELETE

Files that clearly match artifact patterns and have no references.

| File | Category | Rationale |
|------|----------|-----------|
| `update-spec-guide.py` | Migration Script | Python at root, one-time spec guide update |
| `update-spec-guide.sh` | Migration Script | Shell wrapper for above |
| ... | ... | ... |

---

## Needs Validation

Files that match patterns but require human confirmation.

| File | Category | Validation Question |
|------|----------|---------------------|
| `scripts/analyze-*.ts` | Analysis Script | Is this active tooling or one-off analysis? |
| ... | ... | ... |

---

## Confirmed KEEP

Files initially flagged but confirmed legitimate.

| File | Reason for Keeping |
|------|-------------------|
| `scripts/sync-cursor-rules.ts` | Referenced in CLAUDE.md |
| ... | ... |

---

## Reference Check Results

For each candidate, grep results:

### update-spec-guide.py
- References found: 0
- Conclusion: Safe to delete

### scripts/sync-cursor-rules.ts
- References found: 1 (CLAUDE.md line 45)
- Conclusion: Keep - active tooling
```

---

## Success Criteria for Phase 1

- [ ] All files matching artifact patterns have been identified
- [ ] Each candidate has been checked for references
- [ ] Candidates are categorized (DELETE/VALIDATE/KEEP)
- [ ] Rationale documented for each categorization
- [ ] `outputs/artifact-candidates.md` created with full report
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created for validation phase

---

## Files to Read

1. `specs/artifact-file-cleanup/README.md` - Full spec context
2. `CLAUDE.md` - Check for referenced scripts
3. `package.json` - Check scripts section
4. `turbo.json` - Check for referenced files

---

## Agent Delegation

Use `codebase-researcher` agent for systematic scanning:

```
Use the codebase-researcher agent to perform artifact file discovery.

Research questions:
1. What *.py, *.sh, *.mjs files exist at repository root?
2. What *AUDIT*.md and *PROMPT*.md files exist in packages/?
3. What files in scripts/ are NOT referenced in package.json?
4. What root-level *.md files are not standard documentation?

For each found file, also check:
- Is it imported/referenced anywhere in .ts files?
- Is it mentioned in CLAUDE.md or other documentation?
- Does it have a clear ongoing purpose?

Output should categorize each file as:
- HIGH_CONFIDENCE_DELETE: Pattern match + no references
- NEEDS_VALIDATION: Pattern match + unclear purpose
- KEEP: Has references or clear ongoing purpose
```

---

## Transition to Phase 2

After completing discovery:

1. Create `outputs/artifact-candidates.md`
2. Update `REFLECTION_LOG.md` with:
   - Total files scanned
   - Detection methods that worked well
   - Any unexpected findings
3. Create `handoffs/HANDOFF_P2.md` with validation methodology
4. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`

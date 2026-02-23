# Artifact File Cleanup Spec

> Systematic discovery and removal of leftover artifact files from completed or abandoned specs, one-off tasks, and obsolete tooling.

**Status**: `complete`
**Completed**: 2026-01-22
**Commit**: `e99b35f1`

---

## Purpose

Remove files that were created as part of spec work, one-off tasks, or temporary tooling but were never cleaned up after completion. These files:

- Add noise to the codebase
- Confuse developers about what is canonical
- May contain outdated patterns or incorrect information
- Increase cognitive load when navigating the repository

**Goal**: A clean repository where every file has a clear purpose and is actively maintained.

---

## Scope

### Artifact Categories

| Category | Pattern | Example |
|----------|---------|---------|
| **Migration Scripts** | `*.py`, `*.sh` at root or in `scripts/` | `update-spec-guide.py`, `update-spec-guide.sh` |
| **Audit Reports** | `*AUDIT*.md` outside `specs/` | `packages/*/README_AUDIT_REPORT.md` |
| **Implementation Prompts** | `*PROMPT*.md` in package folders | `packages/*/IMPLEMENTATION_PROMPT.md` |
| **Meta-planning Docs** | `*meta*.md`, planning docs at root | `agents-meta-prompt.md` |
| **One-off Scripts** | `*.mjs`, `*.ts` in `scripts/` that aren't referenced | `test-splitter.mjs` |
| **Orphaned Spec Outputs** | `outputs/` artifacts from completed specs | Stale analysis reports |
| **Chat/Design Docs** | `chat-*.md`, design notes not in specs | `chat-ui.md` |

### In Scope

- Root-level files that appear to be one-off scripts or temporary docs
- Files in `scripts/` that are not referenced in `package.json` or documentation
- Audit reports and implementation prompts in package directories
- Orphaned outputs from completed or abandoned specs

### Out of Scope

- Files in `node_modules/` or `tmp/`
- Files in active specs with status != "complete"
- Files referenced in `package.json`, `turbo.json`, or documentation
- Standard project files (README.md, AGENTS.md, CLAUDE.md, etc.)
- Files in `.claude/`, `.cursor/`, `.husky/`, `.vscode/` configuration directories

---

## Artifact Detection Heuristics

### Red Flags (High Confidence Artifact)

1. **Python/Shell scripts at root level** - Almost never legitimate in a TS/Bun monorepo
2. **`*_PROMPT.md` in package folders** - Prompts belong in `specs/` or `.claude/`
3. **`*AUDIT_REPORT.md`** - One-time outputs that should be in spec `outputs/`
4. **Unreferenced scripts** - `scripts/*.ts` not in `package.json` scripts
5. **Dated filenames** - `analysis-2024-01-15.md` type temporal files

### Yellow Flags (Needs Validation)

1. **Scripts in `scripts/`** - May be legitimate tooling; check `package.json`
2. **Markdown at root** - May be intentional documentation
3. **Files with "old", "backup", "temp" in name** - Obvious candidates but verify

### Green Flags (Likely Legitimate)

1. **Referenced in `package.json` scripts**
2. **Referenced in `CLAUDE.md` or documentation**
3. **Part of `.claude/` configuration system
4. **Standard file patterns (README.md, AGENTS.md, etc.)

---

## Success Criteria

- [x] Discovery phase identifies all candidate artifact files
- [x] Each candidate is validated against legitimacy criteria
- [x] Report categorizes files as DELETE, MOVE, or KEEP with rationale
- [x] No legitimate files are accidentally removed
- [x] `bun run check` passes after cleanup (Note: pre-existing errors from naming-conventions-refactor)
- [x] `bun run lint` passes after cleanup
- [x] No broken references remain in documentation

---

## Phase Overview

### Phase 1: Discovery

**Agent**: `codebase-researcher`

Tasks:
1. Scan for files matching artifact patterns (see categories above)
2. Cross-reference against `package.json` scripts and documentation
3. Identify files created/modified around spec completion dates
4. Generate comprehensive candidate list

Output: `outputs/artifact-candidates.md`

### Phase 2: Validation

**Agent**: Orchestrator with targeted reads

Tasks:
1. For each candidate, determine:
   - Is it referenced anywhere in the codebase?
   - Does it serve an ongoing purpose?
   - Is it orphaned from a completed/abandoned spec?
2. Categorize as DELETE, MOVE (to specs/), or KEEP
3. Document rationale for each decision

Output: `outputs/validation-report.md`

### Phase 3: Cleanup Execution

**Agent**: Orchestrator

Tasks:
1. Delete files categorized as DELETE
2. Move files categorized as MOVE to appropriate spec folders
3. Update any affected imports or references
4. Commit changes with descriptive message

Output: Clean repository, git commit

### Phase 4: Verification

Tasks:
1. Run `bun run check` - ensure no broken references
2. Run `bun run lint` - ensure no lint errors
3. Grep for deleted filenames - confirm no dangling references
4. Confirm spec `outputs/` contain validation report

---

## Known Candidates (Initial Inventory)

Based on preliminary scan:

### High Confidence DELETE

| File | Reason |
|------|--------|
| `update-spec-guide.py` | One-time migration script for spec guide |
| `update-spec-guide.sh` | Shell wrapper for migration script |
| `agents-meta-prompt.md` | Planning notes for agent system design |
| `packages/shared/client/README_AUDIT_REPORT.md` | One-time audit output |
| `packages/common/utils/AUDIT_REPORT.md` | One-time audit output |
| `packages/common/identity/IMPLEMENTATION_PROMPT.md` | One-time implementation prompt |
| `tooling/repo-scripts/README_AUDIT_REPORT.md` | One-time audit output |
| `scripts/update-handoff-standards.py` | One-time migration script |

### Needs Validation

| File | Question |
|------|----------|
| `scripts/sync-cursor-rules.ts` | Referenced in CLAUDE.md? |
| `scripts/install-gitleaks.sh` | Part of CI/security setup? |
| `scripts/analyze-*.ts` | Active tooling or one-off analysis? |
| `test-splitter.mjs` | Active tooling or artifact? |
| `chat-ui.md` | Design doc for active feature? |
| `terragon-setup.sh` | Infrastructure setup or obsolete? |

---

## Execution Instructions

### For Orchestrating Agent

```
You are implementing Phase 1 of the artifact-file-cleanup spec.

READ FIRST:
- specs/artifact-file-cleanup/README.md (this file)
- specs/artifact-file-cleanup/QUICK_START.md

YOUR MISSION:
Use codebase-researcher to systematically discover artifact files.

DETECTION METHODOLOGY:

1. Root-level scan:
   - Find *.py, *.sh, *.mjs files at repository root
   - Find *meta*.md, *prompt*.md, *chat*.md at root
   - Flag anything that looks like a one-off script or temp doc

2. Scripts folder analysis:
   - List all files in scripts/
   - Cross-reference against package.json "scripts" section
   - Files not referenced = candidates

3. Package folder scan:
   - Find *AUDIT*.md, *PROMPT*.md in packages/*/
   - These almost certainly should be in specs/ or deleted

4. Spec outputs check:
   - For each completed spec, check if outputs/ should be archived or deleted

OUTPUT FORMAT:
Create outputs/artifact-candidates.md with:

## Summary
- Total candidates found: N
- High confidence: N
- Needs validation: N

## High Confidence Artifacts
| File | Category | Rationale |
|------|----------|-----------|
| path/to/file | Migration Script | Python file at root, never part of TS monorepo |

## Needs Validation
| File | Category | Question to Resolve |
|------|----------|---------------------|
| path/to/file | Script | Is this referenced in package.json? |

HANDOFF:
After discovery, update REFLECTION_LOG.md and create handoffs/HANDOFF_P2.md
```

---

## Anti-Patterns to Avoid

1. **Don't delete without validation** - Always confirm the file isn't referenced
2. **Don't assume scripts/ is all artifacts** - Some are legitimate tooling
3. **Don't forget spec outputs** - They may have valuable learnings to preserve
4. **Don't skip grep for references** - A file may be imported/referenced unexpectedly
5. **Don't batch delete** - Remove incrementally and verify after each batch

---

## Reference Commands

```bash
# Find root-level scripts
ls *.py *.sh *.mjs 2>/dev/null

# Find audit reports outside specs
find . -name "*AUDIT*.md" -not -path "./specs/*" -not -path "./node_modules/*" -not -path "./tmp/*"

# Find implementation prompts in packages
find packages -name "*PROMPT*.md"

# Check if a file is referenced
rg "filename" --type ts --type md

# Check package.json scripts
cat package.json | jq '.scripts'
```

---

## Related Specs

- `specs/deprecated-code-cleanup/` - Removes `@deprecated` JSDoc code (different scope)
- `specs/agents-md-audit/` - Audits AGENTS.md files (may have produced artifacts)

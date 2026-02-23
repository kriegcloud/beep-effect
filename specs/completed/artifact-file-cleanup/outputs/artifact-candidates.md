# Artifact Candidates Report

**Generated**: 2026-01-22
**Phase**: Discovery (P1)
**Scanner**: Manual orchestrator with grep/file analysis

---

## Summary

| Category | Count |
|----------|-------|
| High Confidence DELETE | 9 |
| Needs Validation | 8 |
| Confirmed KEEP | 6 |
| **Total Scanned** | 23 |

---

## High Confidence DELETE

Files that clearly match artifact patterns and have no meaningful external references.

| File | Category | Rationale |
|------|----------|-----------|
| `update-spec-guide.py` | Migration Script | Python at root, one-time spec guide migration, no external refs |
| `update-spec-guide.sh` | Migration Script | Shell wrapper for migration script, no external refs |
| `test-splitter.mjs` | Debug Script | Playwright test for FlexLayout splitter, dev debugging artifact |
| `chat-ui.md` | Empty File | Empty file (0 lines of content), no purpose |
| `scripts/update-handoff-standards.py` | Migration Script | Python migration for handoff standards, one-time use |
| `scripts/update-handoff-standards.ts` | Migration Script | TypeScript version of above, hardcoded absolute path |
| `packages/shared/client/README_AUDIT_REPORT.md` | Audit Output | One-time audit output, not linked from README |
| `packages/common/identity/IMPLEMENTATION_PROMPT.md` | Implementation Prompt | One-time prompt, belongs in specs/ if anywhere |
| `tooling/repo-scripts/README_AUDIT_REPORT.md` | Audit Output | One-time audit output, not linked from README |

---

## Needs Validation

Files that match patterns but require human confirmation before deletion.

| File | Category | Validation Question |
|------|----------|---------------------|
| `terragon-setup.sh` | Infrastructure Script | Is Nix/direnv dev environment setup still needed? No .envrc file exists. |
| `agents-meta-prompt.md` | Planning Doc | Planning notes for agent system - superseded by implementation? |
| `scripts/analyze-jsdoc.mjs` | Analysis Tool | Duplicate of tooling/repo-scripts/src/analyze-jsdoc.ts? Referenced in done-feature.md |
| `scripts/analyze-readme-inventory.ts` | Analysis Tool | Not directly referenced, similar to analyze-readme-simple.ts |
| `packages/common/utils/AUDIT_REPORT.md` | Audit Output | **LINKED** from README.md - remove link first? Move to spec outputs? |

### Special Cases (scripts/ folder)

These scripts exist in `scripts/` but are NOT in `package.json` scripts section. However, they ARE referenced in documentation:

| File | Referenced In | Status |
|------|--------------|--------|
| `scripts/analyze-agents-md.ts` | `.claude/standards/documentation.md`, spec outputs | **KEEP** - active tooling |
| `scripts/analyze-readme-simple.ts` | `specs/agent-config-optimization/` | **KEEP** - active tooling |
| `scripts/find-missing-agents.ts` | `.claude/standards/documentation.md` | **KEEP** - active tooling |

---

## Confirmed KEEP

Files initially flagged but confirmed as legitimate.

| File | Reason for Keeping |
|------|-------------------|
| `scripts/sync-cursor-rules.ts` | Referenced in CLAUDE.md for Cursor IDE setup |
| `scripts/install-gitleaks.sh` | Security tooling for gitleaks installation |
| `scripts/analyze-agents-md.ts` | Active AGENTS.md analysis tool, referenced in documentation |
| `scripts/analyze-readme-simple.ts` | Active README analysis tool, referenced in spec outputs |
| `scripts/find-missing-agents.ts` | Active package coverage checker, referenced in documentation |
| `scripts/analyze-jsdoc.md` | Documentation for analyze-jsdoc.mjs |
| `AGENTS.md` (root) | Standard project file |

---

## Reference Check Results

### Root-Level Scripts

#### update-spec-guide.py
- **References found**: 0 (only in this spec's own documentation)
- **Purpose**: One-time migration script for spec guide
- **Conclusion**: **Safe to delete**

#### update-spec-guide.sh
- **References found**: 0 (only in this spec's own documentation)
- **Purpose**: Shell wrapper for Python migration
- **Conclusion**: **Safe to delete**

#### terragon-setup.sh
- **References found**: 0 (only in this spec's own documentation)
- **Purpose**: Nix/direnv development environment setup
- **Context**: "Terragon" appears to be a project codename. No `.envrc` file exists in repo.
- **Conclusion**: **Ask user** - may be needed for new contributor onboarding

#### test-splitter.mjs
- **References found**: 0 (only in this spec's own documentation)
- **Purpose**: Playwright debug script for FlexLayout splitter component
- **Conclusion**: **Safe to delete** - dev debugging artifact

---

### Package Audit/Prompt Files

#### packages/shared/client/README_AUDIT_REPORT.md
- **References found**: 0
- **Conclusion**: **Safe to delete**

#### packages/common/identity/IMPLEMENTATION_PROMPT.md
- **References found**: 0
- **Conclusion**: **Safe to delete**

#### packages/common/utils/AUDIT_REPORT.md
- **References found**: 1 (packages/common/utils/README.md line 490)
- **Context**: README links to it as documentation: `- [AUDIT_REPORT.md](./AUDIT_REPORT.md)`
- **Conclusion**: **Remove link from README first**, then delete file

#### tooling/repo-scripts/README_AUDIT_REPORT.md
- **References found**: 0
- **Conclusion**: **Safe to delete**

---

### Scripts Folder Analysis

#### Referenced in package.json: NONE

The `package.json` "scripts" section does not directly reference any files in `scripts/`. All referenced scripts use either:
- `turbo` pipelines
- `tooling/cli/src/index.ts`
- `tooling/repo-scripts/src/*.ts`
- `bunx` commands

#### Referenced in documentation:

| Script | Documentation Reference |
|--------|------------------------|
| `sync-cursor-rules.ts` | CLAUDE.md |
| `analyze-agents-md.ts` | .claude/standards/documentation.md |
| `find-missing-agents.ts` | .claude/standards/documentation.md |
| `analyze-readme-simple.ts` | specs/agent-config-optimization/ |
| `analyze-jsdoc.mjs` | .claude/commands/done-feature.md |
| `install-gitleaks.sh` | Not documented but security tooling |

#### Not referenced:

| Script | Status |
|--------|--------|
| `analyze-readme-inventory.ts` | May be superseded by `analyze-readme-simple.ts` |
| `update-handoff-standards.py` | One-time migration, DELETE |
| `update-handoff-standards.ts` | One-time migration, DELETE |

---

### Root Markdown Files

#### agents-meta-prompt.md
- **References found**: 0 (only in this spec's own documentation)
- **Content**: Planning notes for agent system design (folders, phases, agents)
- **Context**: Agent system has been implemented in `.claude/agents/`
- **Conclusion**: **Likely safe to delete** - superseded by implementation

#### chat-ui.md
- **References found**: 0 (only in this spec's own documentation)
- **Content**: Empty file (0 lines)
- **Conclusion**: **Safe to delete**

---

## File Categories Summary

### Migration Scripts (DELETE)
- `update-spec-guide.py`
- `update-spec-guide.sh`
- `scripts/update-handoff-standards.py`
- `scripts/update-handoff-standards.ts`

### Debug/Test Scripts (DELETE)
- `test-splitter.mjs`

### Audit Outputs (DELETE)
- `packages/shared/client/README_AUDIT_REPORT.md`
- `packages/common/identity/IMPLEMENTATION_PROMPT.md`
- `tooling/repo-scripts/README_AUDIT_REPORT.md`

### Audit Outputs (NEEDS LINK REMOVAL)
- `packages/common/utils/AUDIT_REPORT.md`

### Empty/Obsolete Docs (DELETE)
- `chat-ui.md`

### Planning Docs (VALIDATE)
- `agents-meta-prompt.md` - superseded?

### Infrastructure (VALIDATE)
- `terragon-setup.sh` - still needed?

### Active Tooling (KEEP)
- `scripts/sync-cursor-rules.ts`
- `scripts/install-gitleaks.sh`
- `scripts/analyze-agents-md.ts`
- `scripts/analyze-readme-simple.ts`
- `scripts/find-missing-agents.ts`
- `scripts/analyze-jsdoc.mjs` (though may be superseded)
- `scripts/analyze-jsdoc.md`

---

## Recommended Actions for Phase 2

1. **User validation required**:
   - `terragon-setup.sh` - Ask if Nix/direnv setup is needed
   - `agents-meta-prompt.md` - Confirm superseded by implementation

2. **Link removal required before deletion**:
   - `packages/common/utils/AUDIT_REPORT.md` - Remove from README.md first

3. **Potential duplicate investigation**:
   - `scripts/analyze-jsdoc.mjs` vs `tooling/repo-scripts/src/analyze-jsdoc.ts`
   - `scripts/analyze-readme-inventory.ts` vs `scripts/analyze-readme-simple.ts`

4. **Safe to delete immediately** (9 files):
   - `update-spec-guide.py`
   - `update-spec-guide.sh`
   - `test-splitter.mjs`
   - `chat-ui.md`
   - `scripts/update-handoff-standards.py`
   - `scripts/update-handoff-standards.ts`
   - `packages/shared/client/README_AUDIT_REPORT.md`
   - `packages/common/identity/IMPLEMENTATION_PROMPT.md`
   - `tooling/repo-scripts/README_AUDIT_REPORT.md`

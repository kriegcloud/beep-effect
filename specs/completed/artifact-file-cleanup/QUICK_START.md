# Artifact File Cleanup - Quick Start

> 5-minute guide to get oriented with this spec.

---

## What Are We Cleaning?

Files left behind from completed specs, one-off tasks, or temporary tooling:

| Type | Example | Why Delete |
|------|---------|------------|
| Migration scripts | `update-spec-guide.py` | One-time use, job done |
| Audit reports | `*AUDIT_REPORT.md` | Snapshot output, not maintained |
| Implementation prompts | `IMPLEMENTATION_PROMPT.md` | Instructions for completed work |
| Planning docs | `agents-meta-prompt.md` | Brainstorming, superseded by implementation |

---

## Detection Cheat Sheet

**High Confidence DELETE:**
- `*.py` or `*.sh` at repository root
- `*AUDIT*.md` or `*PROMPT*.md` in `packages/`
- Files with dates in name (`*-2024-*.md`)

**Needs Validation:**
- Files in `scripts/` - check `package.json`
- Root-level `.md` - check if referenced in docs

**Don't Touch:**
- Anything in `.claude/`, `specs/`, `node_modules/`, `tmp/`
- Files referenced in `package.json` or `CLAUDE.md`

---

## Quick Commands

```bash
# Find obvious artifacts
ls *.py *.sh 2>/dev/null

# Find audit reports in packages
find packages -name "*AUDIT*.md"

# Find prompts in packages
find packages -name "*PROMPT*.md"

# Check if file is referenced
rg "filename" --type ts --type md

# Check package.json scripts
cat package.json | jq '.scripts | keys'
```

---

## Phases

1. **Discovery** - Find all candidates using patterns
2. **Validation** - Confirm each is truly an artifact
3. **Cleanup** - Delete with verification
4. **Verification** - Ensure nothing broke

---

## Start Here

Read the full spec: `specs/artifact-file-cleanup/README.md`

Then use the orchestrator prompt: `specs/artifact-file-cleanup/handoffs/P1_ORCHESTRATOR_PROMPT.md`

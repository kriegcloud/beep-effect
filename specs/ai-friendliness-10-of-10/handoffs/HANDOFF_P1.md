# Handoff: P0 → P1 (ai-context.md Generation)

**From**: P0 Discovery Agent
**To**: P1 Generation Orchestrator
**Date**: 2026-02-04

---

## Executive Summary

Phase 0 Discovery is complete. The baseline reveals:

| Metric | Value | Implication |
|--------|-------|-------------|
| Total packages | 62 | Large scope for ai-context.md generation |
| ai-context.md coverage | 0% | Everything needs creation |
| AGENTS.md coverage | 100% | Rich source material available |
| AGENTS.md quality | 4-9/10 | Some packages need research beyond AGENTS.md |
| Error patterns | 45 | Error catalog can be populated |
| Rules without examples | 33 | Needs P2 attention |
| Onboarding blockers | 8 critical | Quick wins available before P1 |

---

## P0 Outputs (Reference These)

All outputs are in `specs/ai-friendliness-10-of-10/outputs/`:

1. **packages-inventory.md** - Complete list of 62 packages with paths and names
2. **agents-md-quality.md** - Quality scores for all 64 AGENTS.md files
3. **error-patterns.md** - 45 documented error patterns ready for catalog
4. **rules-without-examples.md** - 33 rules needing worked examples
5. **onboarding-gaps.md** - 47 friction points with priority matrix

---

## P1 Mission: Generate ai-context.md Files

### Goal

Create ai-context.md files for all 62 packages to enable:
- `/modules` command functionality
- Package discovery for agents
- Consistent documentation format

### Prioritization (from onboarding analysis)

**Tier 1 - Critical Path (10 packages)**:
1. @beep/shared-domain
2. @beep/shared-server
3. @beep/shared-tables
4. @beep/iam-client
5. @beep/iam-server
6. @beep/testkit
7. @beep/schema
8. @beep/errors
9. @beep/utils
10. @beep/shared-env

**Tier 2 - High Value (14 packages)**:
- All remaining shared/* packages
- All remaining common/* packages
- runtime/* packages

**Tier 3 - Slice Packages (30 packages)**:
- iam/, documents/, calendar/, knowledge/, comms/, customization/

**Tier 4 - Apps & Tooling (8 packages)**:
- apps/*, tooling/*

### Template to Use

Use template from `specs/ai-friendliness-10-of-10/templates/ai-context.template.md`:

```markdown
# AI Context: @beep/package-name

> One-line summary

## Purpose
What this package does and why it exists.

## Key Exports
| Export | Type | Purpose |
|--------|------|---------|
| ... | ... | ... |

## Usage Patterns
### Pattern: [Name]
[Code example]

## Dependencies
- @beep/other-package - Why

## Common Tasks
### "How do I...?"
[Answer with code]

## Gotchas
- Warning 1
- Warning 2
```

### Source Material Strategy

| AGENTS.md Quality | Strategy |
|-------------------|----------|
| 8-10/10 | Transform directly to ai-context.md format |
| 6-7/10 | Supplement with package.json, src/ analysis |
| 4-5/10 | Research package deeply, may need code reading |

### Top 10 AGENTS.md Files (Use as Templates)

From agents-md-quality.md:
1. packages/shared/ui/AGENTS.md (429 lines, 28 code blocks)
2. packages/iam/client/AGENTS.md (406 lines, 22 code blocks)
3. packages/shared/client/AGENTS.md (313 lines, 10 code blocks)
4. packages/knowledge/server/AGENTS.md (284 lines, 26 code blocks)
5. packages/shared/server/AGENTS.md (279 lines, 18 code blocks)

### Packages Needing Most Work (Low Quality AGENTS.md)

From agents-md-quality.md:
1. packages/knowledge/ui/AGENTS.md (46 lines) - Need deep dive
2. packages/calendar/ui/AGENTS.md (47 lines) - Need deep dive
3. packages/common/wrap/AGENTS.md (47 lines) - Need deep dive
4. packages/knowledge/client/AGENTS.md (47 lines) - Need deep dive
5. packages/calendar/client/AGENTS.md (48 lines) - Need deep dive

---

## Execution Approach

### Recommended Parallelization

```
P1a: Tier 1 packages (10) - Serial, highest quality
P1b: Tier 2 packages (14) - 2-3 parallel agents
P1c: Tier 3 packages (30) - 5 parallel agents by slice
P1d: Tier 4 packages (8) - 2 parallel agents
```

### Quality Gates

After each sub-phase:
1. Verify files exist: `ls packages/*/ai-context.md`
2. Test /modules command recognizes new files
3. Spot-check 2-3 files for format compliance

### Context Passing for Agents

When spawning ai-context generation agents, include:

```markdown
<contextualization>
## Template
Use: specs/ai-friendliness-10-of-10/templates/ai-context.template.md

## Reference
- AGENTS.md quality: [score from agents-md-quality.md]
- Error patterns relevant to this package: [from error-patterns.md]

## Package Details
- Path: [path]
- Name: [name from packages-inventory.md]
- Slice: [iam/documents/etc]
- Layer: [domain/tables/server/client/ui]
</contextualization>
```

---

## Pre-P1 Quick Wins (Optional)

From onboarding-gaps.md, these can be done in parallel with P1:

1. **Add Effect Quick Reference to CLAUDE.md** (30 min)
2. **Document services:up prerequisite** (15 min)
3. **Create alias cheatsheet** (20 min)

These don't block P1 but improve overall AI-friendliness.

---

## Success Criteria for P1

- [ ] 62 ai-context.md files created
- [ ] `/modules` command returns all packages
- [ ] Format matches template (Purpose, Key Exports, Usage Patterns, etc.)
- [ ] Quality score ≥7/10 for all files (using same rubric as AGENTS.md audit)
- [ ] REFLECTION_LOG.md updated with P1 learnings

---

## Files to Reference

| File | Use For |
|------|---------|
| `outputs/packages-inventory.md` | Package list and paths |
| `outputs/agents-md-quality.md` | Quality scores, prioritization |
| `outputs/error-patterns.md` | Include relevant errors in Gotchas |
| `templates/ai-context.template.md` | Output format |
| `MASTER_ORCHESTRATION.md` | Full phase details |

---

## Next Handoff

After P1 completion, create:
- `handoffs/HANDOFF_P2.md` - For error catalog population
- `handoffs/P2_ORCHESTRATOR_PROMPT.md` - For next orchestrator

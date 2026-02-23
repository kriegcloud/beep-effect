# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the scripts-to-cli-migration spec.

### Context

Phase 0 (Scaffolding) created the spec structure with pre-researched reference data. A seed inventory exists at `outputs/reference-inventory.md` with 38+ known references, but these have NOT been verified against current file state.

### Your Mission

Verify and complete the documentation reference inventory for all four scripts being migrated.

Delegate to `codebase-researcher` agent:
- Search for all references to `scripts/sync-cursor-rules`, `scripts/analyze-agents`, `scripts/find-missing`, `scripts/analyze-readme` across the entire repo
- Verify each reference in `outputs/reference-inventory.md` is current (file exists, line matches)
- Find any new references not in the seed inventory
- Categorize each: **operational** (CLAUDE.md, .claude/standards/) vs **archival** (specs/)

### Reference Files

- Seed inventory: `specs/scripts-to-cli-migration/outputs/reference-inventory.md`
- Spec README: `specs/scripts-to-cli-migration/README.md`

### Verification

After completion, verify:
```bash
# Confirm no references were missed
grep -r "scripts/sync-cursor-rules\|scripts/analyze-agents\|scripts/find-missing\|scripts/analyze-readme" --include="*.md" . | wc -l
```

### Success Criteria

- [ ] All seed references verified as current or marked stale
- [ ] New references (if any) added to inventory
- [ ] Each reference categorized as operational or archival
- [ ] `outputs/reference-inventory.md` updated with verified inventory
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings

### Handoff Document

Read full context in: `specs/scripts-to-cli-migration/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Proceed to Phase 2 (can run in parallel with P1 if not yet done)

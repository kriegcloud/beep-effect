---
name: Done Feature
description: Complete feature development with validation, documentation updates, and git workflow. Use when finishing a feature (equivalent to /done-feature in Claude/Codex).
---

# Done Feature Skill

Use this skill when completing a feature: run quality gates, update docs, and follow git/PR workflow. Cursor has no `/done-feature` command; invoke via prompt (e.g. "Feature is done, run completion workflow").

## Completion Workflow

### 1. Final Validation (mandatory)

Run in order; all must pass:

```bash
bun run lint:fix
bun run docgen    # if JSDoc examples exist
bun run check
bun run test     # relevant tests
bun run build
```

### 2. Documentation Updates

- Mark completed tasks in `specs/[feature]/plan.md` with ✅
- Add implementation summary and any deviations + rationale
- Update `specs/README.md` or related docs if needed

### 3. Git Workflow

- Stage implementation, tests, and doc changes
- Commit with structured message (feat: …, validation checklist, Co-Authored-By if applicable)
- If on feature branch: push and open PR with summary, implementation details, validation results, test plan

### 4. Success Criteria

- All validation steps pass
- Documentation reflects the implementation
- No forbidden patterns (see AGENTS.md / code-standards)
- Tests use @beep/testkit; examples compile

## Critical Reminders

- Do not skip validation; do not commit with failing tests or type errors
- Always update documentation and use structured commit messages

## Reference

Full checklist and PR template: `.claude/commands/done-feature.md` (read-only reference).

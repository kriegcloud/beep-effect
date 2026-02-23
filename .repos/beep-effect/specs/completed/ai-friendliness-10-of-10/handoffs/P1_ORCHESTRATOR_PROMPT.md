# P1 Orchestrator Prompt

Copy this prompt to start Phase 1 (ai-context.md Generation).

---

## Prompt

You are implementing Phase 1 (ai-context.md Generation) of the ai-friendliness-10-of-10 spec.

### Context from P0

Phase 0 Discovery completed with these findings:
- 62 packages need ai-context.md files (currently 0% coverage)
- 100% have AGENTS.md files as source material
- Quality varies 4-9/10 across packages
- 45 error patterns documented for reference

### Your Mission

Generate ai-context.md files for all 62 packages in 4 sub-phases:

**P1a: Critical Path (10 packages)** - Serial, highest quality
1. @beep/shared-domain (packages/shared/domain)
2. @beep/shared-server (packages/shared/server)
3. @beep/shared-tables (packages/shared/tables)
4. @beep/iam-client (packages/iam/client)
5. @beep/iam-server (packages/iam/server)
6. @beep/testkit (tooling/testkit)
7. @beep/schema (packages/common/schema)
8. @beep/errors (packages/common/errors)
9. @beep/utils (packages/common/utils)
10. @beep/shared-env (packages/shared/env)

**P1b: Remaining shared/common (14 packages)** - 2-3 parallel agents

**P1c: Slice packages (30 packages)** - 5 parallel agents (one per slice)

**P1d: Apps & tooling (8 packages)** - 2 parallel agents

### Template

Use `specs/ai-friendliness-10-of-10/templates/ai-context.template.md` as the format.

### Reference Files

- Package list: `specs/ai-friendliness-10-of-10/outputs/packages-inventory.md`
- Quality scores: `specs/ai-friendliness-10-of-10/outputs/agents-md-quality.md`
- Error patterns: `specs/ai-friendliness-10-of-10/outputs/error-patterns.md`
- Full handoff: `specs/ai-friendliness-10-of-10/handoffs/HANDOFF_P1.md`

### Execution Pattern

For each package:
1. Read the package's AGENTS.md
2. Read package.json for dependencies
3. If AGENTS.md quality < 7/10, also read key source files
4. Generate ai-context.md following template
5. Write to `packages/[slice]/[layer]/ai-context.md`

### Quality Gates

After each sub-phase:
```bash
# Verify files created
find packages -name "ai-context.md" | wc -l

# Test modules command (if available)
# /modules
```

### Success Criteria

- [ ] 62 ai-context.md files exist
- [ ] All follow template format
- [ ] Quality ≥7/10 per file
- [ ] REFLECTION_LOG.md updated

### After Completion

1. Update `specs/ai-friendliness-10-of-10/REFLECTION_LOG.md` with P1 entry
2. Create `handoffs/HANDOFF_P2.md` for error catalog phase
3. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`

---

## Agent Delegation Pattern

When spawning agents for ai-context generation:

```
Task: Generate ai-context.md for @beep/[package-name]

<contextualization>
Package: @beep/[name]
Path: packages/[slice]/[layer]
AGENTS.md quality: [X]/10
Layer: [domain|tables|server|client|ui]

Template: specs/ai-friendliness-10-of-10/templates/ai-context.template.md

Source material:
- Read: packages/[slice]/[layer]/AGENTS.md
- Read: packages/[slice]/[layer]/package.json
- If needed: Read key exports from src/index.ts
</contextualization>

Write the ai-context.md file to: packages/[slice]/[layer]/ai-context.md
```

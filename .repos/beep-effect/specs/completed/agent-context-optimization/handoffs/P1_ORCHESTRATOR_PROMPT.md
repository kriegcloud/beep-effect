# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `agent-context-optimization` spec.

### Context

Phase 0 (Scaffolding) is complete. The spec structure has been created:
- `specs/agent-context-optimization/README.md` — Overview and success criteria
- `specs/agent-context-optimization/MASTER_ORCHESTRATION.md` — Detailed workflow
- `specs/agent-context-optimization/QUICK_START.md` — Quick reference

### Your Mission

Add the Effect repository as a git subtree to `.repos/effect/`.

### Tasks

1. **Research subtree best practices** (delegate to web-researcher)
   - Understand git subtree workflow for large monorepos
   - Identify potential issues with Effect monorepo size

2. **Add Effect subtree** (execute directly)
   ```bash
   mkdir -p .repos
   git subtree add --prefix=.repos/effect https://github.com/Effect-TS/effect.git main --squash
   ```

3. **Configure tooling exclusions** (execute directly)
   - Check if `knip.config.ts` needs `.repos/` exclusion
   - Check if `biome.jsonc` needs `.repos/` exclusion

4. **Document workflow** (delegate to doc-writer)
   - Create `documentation/subtree-workflow.md`
   - Include update commands and troubleshooting

### Critical Patterns

- Use `--squash` flag to avoid history bloat
- Effect monorepo contains multiple packages:
  - `packages/effect/` — Core Effect
  - `packages/platform/` — @effect/platform
  - `packages/ai/` — @effect/ai

### Verification

After each task, verify:
```bash
# Subtree added
ls .repos/effect/packages/effect/src/Effect.ts

# Source searchable
grep -l "flatMap" .repos/effect/packages/effect/src/Effect.ts

# Build passes
bun run check
```

### Success Criteria

- [ ] `.repos/effect/` exists with Effect source
- [ ] Effect source searchable via grep/glob
- [ ] Tooling exclusions configured if needed
- [ ] `documentation/subtree-workflow.md` created
- [ ] `bun run check` passes
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Read full context in: `specs/agent-context-optimization/handoffs/HANDOFF_P1.md`

### On Completion

Create:
1. `handoffs/HANDOFF_P2.md` — Context for Phase 2
2. `handoffs/P2_ORCHESTRATOR_PROMPT.md` — Prompt for Phase 2

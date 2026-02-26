# Handoff P6

## Objective
Execute Phase P6 exactly as defined in 
a) - 
a) - [README.md](../README.md)
- [MASTER_ORCHESTRATION.md](../MASTER_ORCHESTRATION.md)

## Inputs
1. Global spec docs (, , ).
2. Prior phase outputs (if phase > P0).
3. Upstream source: .
4. Local source: .

## Required Work
1. Run discovery commands first:
   - Codebase Laws
Effect-first quality law summary and validation entry points.
- Use Effect-first APIs and aliases defined by repository law.
- Reject unsafe typing escapes and untyped runtime errors.
- Keep domain logic free of native mutable runtime containers.
- Finish only when check, lint, test, and docgen pass.
- Run: bun run check
- Run: bun run lint
- Run: bun run test
- Run: bun run docgen
   - Agent Skills
High-signal skills and usage expectations for coding agents.
- Use focused skills when a task clearly matches a specialized domain.
- Prefer minimal skill sets that directly match requested outcomes.
- Keep context tight and avoid broad, unfocused skill loading.
- Pair skills with verification commands before completion.
- Run: bun run beep docs find effect
   - Policy Gates
Operational policy checks for agent output and repo hygiene.
- Benchmark compliance and allowlist checks are strict by default.
- Agent instruction surfaces must remain pathless and lightweight.
- Worktree runs must use isolated disposable worktrees when enabled.
- Run: bun run agents:check
- Run: bun run agents:pathless:check
- Run: bun run lint:effect-laws:strict
2. Execute P6 workstream and produce required outputs in the phase output directory.
3. Keep  in sync with artifact status.
4. Author next phase handoff and orchestrator prompt before closing phase.

## Deliverables
See phase requirements in [outputs/manifest.json](../outputs/manifest.json).

## Completion Checklist
- [ ] Required outputs created and non-empty.
- [ ] Required checks executed and results recorded.
- [ ] No unresolved gate blockers remain.
- [ ] Next-phase handoff + orchestrator prompt authored.

## Memory Protocol
1. Before heavy parallel work, check proxy health:
   - 
2. During high fan-out runs, monitor:
   - 
3. If memory is unavailable, continue and report exactly:
   - 
4. Do not target Graphiti direct endpoint  from agents.

## Exit Gate
P6 is complete only when all checklist items are satisfied and phase outputs meet rubric gates.

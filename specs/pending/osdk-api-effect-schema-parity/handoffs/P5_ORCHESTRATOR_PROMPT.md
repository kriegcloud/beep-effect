# P5 Orchestrator Prompt

## 1. Context
You are running Phase P5 of .
Follow locked defaults and phase gates in  and .

## 2. Mission
Deliver Phase P5 outputs to completion with no unresolved blockers and with next-phase handoff continuity.

## 3. Inputs
1. 
2. 
3. 
4. 
5. Prior phase outputs (if available)
6. Upstream API source ()
7. Local ontology source ()

## 4. Non-negotiable locks
1. API target: hybrid parity + aliases.
2. Type fidelity: high.
3. Unstable work only in P6.
4. Effect conventions (, no unsafe typing escapes).
5. Required discovery commands run first.

## 5. Agent assignments
1. Assign focused sub-agents by workstream within this phase.
2. Keep ownership explicit per file/output.
3. Reduce parallel fan-out if proxy metrics indicate rejection/queue pressure.

## 6. Required outputs
Produce all artifacts for Phase P5 listed in  under that phase path.

## 7. Required checks
1. Codebase Laws
Effect-first quality law summary and validation entry points.
- Use Effect-first APIs and aliases defined by repository law.
- Reject unsafe typing escapes and untyped runtime errors.
- Keep domain logic free of native mutable runtime containers.
- Finish only when check, lint, test, and docgen pass.
- Run: bun run check
- Run: bun run lint
- Run: bun run test
- Run: bun run docgen
2. Agent Skills
High-signal skills and usage expectations for coding agents.
- Use focused skills when a task clearly matches a specialized domain.
- Prefer minimal skill sets that directly match requested outcomes.
- Keep context tight and avoid broad, unfocused skill loading.
- Pair skills with verification commands before completion.
- Run: bun run beep docs find effect
3. Policy Gates
Operational policy checks for agent output and repo hygiene.
- Benchmark compliance and allowlist checks are strict by default.
- Agent instruction surfaces must remain pathless and lightweight.
- Worktree runs must use isolated disposable worktrees when enabled.
- Run: bun run agents:check
- Run: bun run agents:pathless:check
- Run: bun run lint:effect-laws:strict
4.  when prompt/handoff instruction text is changed.
5. Phase-specific compile/test checks documented in outputs.

## 8. Exit gate
1. All declared outputs exist and are non-empty.
2. Required checks are recorded.
3. No unresolved blocker remains.
4. Next-phase handoff + orchestrator prompt exist.

## 9. Memory protocol
1. Health preflight: 
2. Fan-out monitoring: 
3. On memory/proxy failure, continue and report exactly:
   - 
4. Route Graphiti memory to  only; do not use  directly.
5. If available, query both groups at phase start:
   - 
   - 

## 10. Handoff document pointer
Primary phase handoff: 

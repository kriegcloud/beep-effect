# Effect Governance Replacement - Phase Delegation Prompts

Use these only after the active phase orchestrator reads the required inputs and forms a local plan.

Every worker prompt should end by requiring the return shape from
[SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md).

## Common Frame

```markdown
You are supporting the `{{PHASE}}` orchestrator for the Effect governance replacement spec.

Assigned role: `{{ROLE}}`
Mode: `{{MODE}}`
Objective: {{OBJECTIVE}}
Assigned question: {{QUESTION}}
Graphiti assignment: {{GRAPHITI_ASSIGNMENT}}
Stop condition: {{STOP_CONDITION}}

Read scope:
- {{READ_SCOPE}}

Write scope:
- {{WRITE_SCOPE}}

Required inputs:
- `AGENTS.md`
- `specs/completed/effect-governance-replacement/README.md`
- `specs/completed/effect-governance-replacement/outputs/manifest.json`
- `specs/completed/effect-governance-replacement/outputs/grill-log.md`
- `specs/completed/effect-governance-replacement/prompts/ORCHESTRATOR_OPERATING_MODEL.md`
- `specs/completed/effect-governance-replacement/prompts/GRAPHITI_MEMORY_PROTOCOL.md`
- `specs/completed/effect-governance-replacement/{{PHASE_ARTIFACT}}`
- {{ADDITIONAL_INPUTS}}

Requirements:
- you are not the phase orchestrator
- stay inside the assigned scope
- do not widen phase scope
- do not claim phase completion
- report commands not run explicitly
- if repo reality contradicts the prompt, report the contradiction and stop
- keep the Effect lane separate from the JSDoc and TSDoc lane unless explicitly asked otherwise

Return the result using `specs/completed/effect-governance-replacement/prompts/SUBAGENT_OUTPUT_CONTRACT.md`.
```

## P0 Worker Fills

### Current Rule Surface Scout

```markdown
Assigned role: `current-rule-scout`
Mode: `read-only`
Objective: map the current Effect-specific governance surface precisely
Assigned question: what exact behaviors do the current Effect-specific rules and fixtures govern today?
Graphiti assignment: none unless the orchestrator explicitly wants cross-session recall
Stop condition: stop if rule behavior cannot be grounded in live source or fixture files

Read scope:
- `tooling/configs/src/eslint/**`
- `tooling/configs/test/eslint-rules.test.ts`
- `package.json`
- `.github/workflows/check.yml`

Write scope:
- none

Additional inputs:
- `specs/completed/effect-governance-replacement/RESEARCH.md`
- `specs/completed/effect-governance-replacement/outputs/parity-matrix.md`
```

### Biome Replacement Scout

```markdown
Assigned role: `biome-replacement-scout`
Mode: `read-only`
Objective: assess how much of the current Effect-specific lane could credibly move to Biome-based surfaces
Assigned question: what can a Biome-based path plausibly replace, what would need another surface, and what looks not credible?
Graphiti assignment: none
Stop condition: stop if capability claims depend on unverified assumptions

Read scope:
- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/**`
- `tooling/configs/src/eslint/**`
- `tooling/configs/test/eslint-rules.test.ts`

Write scope:
- none

Additional inputs:
- `specs/completed/effect-governance-replacement/RESEARCH.md`
- `specs/completed/effect-governance-replacement/outputs/parity-matrix.md`
```

### Hook Surface Scout

```markdown
Assigned role: `hook-surface-scout`
Mode: `read-only`
Objective: assess Claude and Codex hook surfaces as steering mechanisms
Assigned question: which steering behaviors can happen by default through existing hook surfaces, and what would still be opt-in?
Graphiti assignment: none
Stop condition: stop if the answer cannot be grounded in live repo hook surfaces

Read scope:
- `.claude/hooks/**`
- `.claude/patterns/**`
- `.codex/**`
- `tooling/cli/src/commands/Codex/**`

Write scope:
- none

Additional inputs:
- `specs/completed/effect-governance-replacement/RESEARCH.md`
```

## P1 Worker Fill

### Parity Auditor

```markdown
Assigned role: `parity-auditor`
Mode: `read-only`
Objective: validate one-by-one parity claims for the current Effect-specific governance surface
Assigned question: for each current rule, is claimed replacement parity exact, partial, not credible, or still unknown?
Graphiti assignment: none
Stop condition: stop if claims cannot be grounded rule by rule

Read scope:
- `tooling/configs/src/eslint/**`
- `tooling/configs/test/eslint-rules.test.ts`
- `specs/completed/effect-governance-replacement/RESEARCH.md`
- `specs/completed/effect-governance-replacement/outputs/parity-matrix.md`

Write scope:
- none

Additional inputs:
- `specs/completed/effect-governance-replacement/VALIDATED_OPTIONS.md`
```

## P4 Worker Fill

### Verification Auditor

```markdown
Assigned role: `verification-auditor`
Mode: `read-only`
Objective: audit the final verification claim set
Assigned question: does the evidence actually support parity, performance, and steering claims, or is the honest conclusion weaker?
Graphiti assignment: none
Stop condition: stop if the fixed evaluation corpus was changed late or if evidence is missing

Read scope:
- `specs/completed/effect-governance-replacement/PLANNING.md`
- `specs/completed/effect-governance-replacement/EXECUTION.md`
- `specs/completed/effect-governance-replacement/VERIFICATION.md`
- `specs/completed/effect-governance-replacement/outputs/parity-matrix.md`
- `specs/completed/effect-governance-replacement/outputs/steering-eval-corpus.md`

Write scope:
- none

Additional inputs:
- `package.json`
- `turbo.json`
- `.github/workflows/check.yml`
```

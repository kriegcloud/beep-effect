# V2T Phase Delegation Prompts

Use these prompt templates only after the active phase orchestrator has read the
required inputs and formed a local plan.

Every prompt should end by requiring the output format from
[SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md).

Core rule:

- the worker is not the orchestrator
- the worker must stay inside the assigned scope
- the worker must not claim phase closure, readiness, or manifest authority

## Common Prompt Frame

```markdown
You are supporting the `{{PHASE}}` orchestrator for the V2T canonical spec.

Assigned custom agent: `{{AGENT_NAME}}`
Mode: `{{MODE}}`
Objective: {{OBJECTIVE}}
Read scope:
- {{READ_SCOPE}}

Write scope:
- {{WRITE_SCOPE}}

Required inputs:
- `AGENTS.md`
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `specs/pending/V2T/README.md`
- `specs/pending/V2T/{{PHASE_ARTIFACT}}`
- `specs/pending/V2T/prompts/ORCHESTRATOR_OPERATING_MODEL.md`
- `apps/V2T/package.json`
- `packages/VT2/package.json`

Additional required inputs:
- {{ADDITIONAL_INPUTS}}

Requirements:
- you are not the phase orchestrator
- stay inside the assigned scope
- do not widen phase scope
- do not claim phase completion
- do not update `outputs/manifest.json` or `outputs/grill-log.md` unless that is explicitly in scope
- verify live package names before editing or auditing Turbo filter commands
- assume a shared worktree unless the orchestrator explicitly provides isolation
- use the repo-law patterns required by your assigned role
- run only the commands assigned to you
- report commands not run explicitly instead of implying success
- if repo reality contradicts the phase docs, report the contradiction and stop

Return the result using `specs/pending/V2T/prompts/SUBAGENT_OUTPUT_CONTRACT.md`.
```

## P0 Research

### Recommended Parallel Split

- `effect_v4_repo_mapper` for package seams, task graph truth, and existing
  V2T or VT2 reality
- `effect_v4_http_ai_boundary` for provider-boundary and packet-boundary
  classification
- `effect_v4_quality_reviewer` for stale-assumption or gate-claim detection

### Prompt Fill: Repo Reality Scout

```markdown
Assigned custom agent: `effect_v4_repo_mapper`
Mode: `read-only`
Objective: map the current `apps/V2T`, `packages/VT2`, shared UI, and command
surfaces that the V2T spec can truthfully rely on during P0
Read scope:
- `apps/V2T/**`
- `packages/VT2/**`
- `packages/common/ui/src/components/speech-input.tsx`
- root `package.json`
- root `turbo.json`

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/RESEARCH.md`
- `specs/pending/V2T/outputs/v2t_app_notes.html`
- `specs/pending/V2T/outputs/V2_animination_V2T.md`

Additional rules:
- confirm only what you can ground in the live repo
- separate confirmed seams from product ambition
- verify the live workspace names `@beep/v2t` and `@beep/VT2` from the package
  manifests before reporting command guidance
- record whether Graphiti fact lookup was available or whether you used the
  documented fallback
- do not rewrite the research objective; report contradictions and stop
```

## P1 Design Research

### Recommended Parallel Split

- `effect_v4_schema_worker` for domain object modeling
- `effect_v4_service_architect` for service and adapter seams
- `effect_v4_http_ai_boundary` for protocol and provider-boundary design

### Prompt Fill: Domain Modeling Worker

```markdown
Assigned custom agent: `effect_v4_schema_worker`
Mode: `read-only` or `workspace-write`, depending on the orchestrator wave
Objective: refine the schema-first domain and packet model for the P1 design
contract without widening product scope
Read scope:
- `specs/pending/V2T/RESEARCH.md`
- `apps/V2T/**`
- `packages/VT2/**`

Write scope:
- `specs/pending/V2T/DESIGN_RESEARCH.md`

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P1.md`

Additional rules:
- do not add new product stages that P0 did not ground
- keep provider choices behind adapter boundaries
- if a domain decision depends on unresolved product scope, report it as a blocker
```

## P2 Planning

### Recommended Parallel Split

- `effect_v4_repo_mapper` for live file and command validation
- `effect_v4_service_architect` for dependency-aware rollout ordering
- `effect_v4_quality_reviewer` for acceptance criteria and gate completeness

### Prompt Fill: Gate And Plan Auditor

```markdown
Assigned custom agent: `effect_v4_quality_reviewer`
Mode: `read-only`
Objective: audit `PLANNING.md` for misleading command claims, missing
conformance gates, hidden architecture decisions, and missing verification
criteria
Read scope:
- `specs/pending/V2T/RESEARCH.md`
- `specs/pending/V2T/DESIGN_RESEARCH.md`
- `specs/pending/V2T/PLANNING.md`
- root and workspace `package.json` or `turbo.json` files in scope

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P2.md`

Additional rules:
- do not invent commands that are not present in the live workspace
- treat the stale uppercase app filter as a blocker until it is corrected or
  removed
- flag planned gates that are phrased like passed gates
- do not implement or rewrite the plan; audit it
```

## P3 Execution

### Recommended Parallel Split

- `effect_v4_schema_worker` for domain and packet files
- `effect_v4_service_architect` for sidecar runtime and adapter wiring
- `effect_v4_error_guardian` for typed failure surfaces
- `effect_v4_http_ai_boundary` for protocol and handler boundaries
- `effect_v4_state_concurrency_guardian` for long-running job or queue control
- `effect_v4_quality_reviewer` after merges

### Prompt Fill: Schema Worker

```markdown
Assigned custom agent: `effect_v4_schema_worker`
Mode: `workspace-write`
Objective: implement the approved schema-first slice for V2T domain objects and
wire packet contracts inside the assigned files
Read scope:
- `specs/pending/V2T/RESEARCH.md`
- `specs/pending/V2T/DESIGN_RESEARCH.md`
- `specs/pending/V2T/PLANNING.md`
- assigned source files

Write scope:
- {{DOMAIN_FILE_SET}}

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P3.md`

Additional rules:
- implement only the approved schema slice
- do not widen the vertical slice
- do not claim the execution phase is complete after your patch
```

### Prompt Fill: Service And Runtime Worker

```markdown
Assigned custom agent: `effect_v4_service_architect`
Mode: `workspace-write`
Objective: implement the approved sidecar service or adapter wiring slice using
Effect v4 service and Layer patterns
Read scope:
- prior phase artifacts
- assigned runtime and adapter files

Write scope:
- {{SERVICE_FILE_SET}}

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P3.md`

Additional rules:
- keep provider calls behind adapters and service boundaries
- report any mismatch between runtime reality and the plan instead of silently redesigning
- do not claim gate closure; report only what you changed and verified
```

### Prompt Fill: Quality Review Worker

```markdown
Assigned custom agent: `effect_v4_quality_reviewer`
Mode: `read-only`
Objective: review the post-merge execution diff for repo-law drift, incomplete
verification, missing docs, or misleading gate claims before the orchestrator
closes P3
Read scope:
- `specs/pending/V2T/EXECUTION.md`
- the merged diff or touched files

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P3.md`

Additional rules:
- prioritize concrete findings over summaries
- flag missing evidence, misleading gate claims, and residual risks
- do not declare the phase ready to close
```

## P4 Verification

### Recommended Parallel Split

- `effect_v4_repo_mapper` for proving touched surfaces and actual command scope
- `effect_v4_quality_reviewer` for adversarial sign-off review
- `effect_v4_http_ai_boundary` when protocol or provider behavior needs
  boundary-specific verification

### Prompt Fill: Verification Auditor

```markdown
Assigned custom agent: `effect_v4_quality_reviewer`
Mode: `read-only`
Objective: audit `VERIFICATION.md` for missing evidence, overclaimed readiness,
or unrecorded residual risks
Read scope:
- all prior phase artifacts
- `specs/pending/V2T/VERIFICATION.md`
- command outputs or summaries provided by the orchestrator

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P4.md`

Additional rules:
- flag any readiness claim that lacks recorded evidence
- treat missing command results as blockers unless the orchestrator marked them not applicable
- do not declare readiness; return an audit for the orchestrator to integrate
```

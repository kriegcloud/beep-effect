# V2T Phase Delegation Prompts

Use these prompt templates only after the active phase orchestrator has read the
required inputs and formed a local plan.

Every prompt should end by requiring the output format from
[SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md).

Each prompt fill below supplies only the phase-specific values for the common frame. Keep every common-frame field in the final prompt, especially
`Assigned question`, `Graphiti assignment`, and `Stop condition`.

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
Assigned question: {{QUESTION}}
Graphiti assignment: {{GRAPHITI_ASSIGNMENT}}
Stop condition: {{STOP_CONDITION}}
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
- `specs/pending/V2T/prompts/GRAPHITI_MEMORY_PROTOCOL.md`
- `infra/package.json`
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
- if Graphiti recall is relevant, report the exact query, exact error text on
  failure, and whether you used the documented fallback
- if repo reality contradicts the phase docs, report the contradiction and stop
- answer the assigned objective and assigned question directly instead of
  returning only loose advice

Return the result using `specs/pending/V2T/prompts/SUBAGENT_OUTPUT_CONTRACT.md`.
```

## Worker Packet Checklist

Before sending a worker prompt, make sure it names:

- the one concrete question the worker must answer
- whether Graphiti is `none` or explicitly assigned for that worker
- the exact fallback behavior if Graphiti lookup is unavailable or errors
- the exact files the worker may change or audit
- the commands the worker owns, if any
- the repo-truth checks that matter for the assignment
- the expected stop condition if the worker finds contradiction or ambiguity

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
Assigned question: which repo seams, package identities, and task surfaces can
P0 truthfully rely on, and what remains product ambition rather than repo fact?
Graphiti assignment: none unless the orchestrator explicitly wants a
corroborating recall attempt
Stop condition: stop and return a blocker if a claim cannot be grounded in live
files, manifests, or commands, or if repo reality contradicts the P0 objective
Read scope:
- `apps/V2T/**`
- `packages/VT2/**`
- `infra/Pulumi.yaml`
- `infra/package.json`
- `infra/src/internal/entry.ts`
- `infra/src/V2T.ts`
- `infra/scripts/v2t-workstation.sh`
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
  documented fallback, plus the exact query and exact error text if lookup
  failed
- do not rewrite the research objective; report contradictions and stop
```

## P1 Design Research

### Recommended Parallel Split

- `effect_v4_schema_worker` for domain object modeling
- `effect_v4_service_architect` for service and adapter seams
- `effect_v4_persistence_runtime_architect` for SQLite, filesystem, and local
  artifact persistence design
- `effect_v4_http_ai_boundary` for protocol and provider-boundary design

### Prompt Fill: Domain Modeling Worker

```markdown
Assigned custom agent: `effect_v4_schema_worker`
Mode: `read-only`
Objective: refine the schema-first domain and packet model for the P1 design
contract without widening product scope
Assigned question: which schema-first domain objects, packet shapes, and
annotations should the orchestrator adopt in `DESIGN_RESEARCH.md` without
reopening P0 scope?
Graphiti assignment: none unless the orchestrator explicitly assigns recall
Stop condition: stop and return a blocker if the answer depends on reopening P0,
changing repo seams, or inventing implementation detail that belongs to P2 or P3
Read scope:
- `specs/pending/V2T/RESEARCH.md`
- `apps/V2T/**`
- `packages/VT2/**`
- `infra/Pulumi.yaml`
- `infra/src/V2T.ts`

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P1.md`

Additional rules:
- do not add new product stages that P0 did not ground
- keep provider choices behind adapter boundaries
- if a domain decision depends on unresolved product scope, report it as a blocker
```

### Prompt Fill: Persistence Design Worker

```markdown
Assigned custom agent: `effect_v4_persistence_runtime_architect`
Mode: `read-only`
Objective: refine the local-first persistence posture for the approved P1
design without widening the execution slice
Assigned question: what persistence, filesystem, config, and artifact-storage
rules should the orchestrator adopt in `DESIGN_RESEARCH.md` while keeping P1
design-only and local-first?
Graphiti assignment: none unless the orchestrator explicitly assigns recall
Stop condition: stop and return a blocker if persistence posture depends on
reopening product scope or on implementation detail that belongs to P2 or P3
Read scope:
- `specs/pending/V2T/RESEARCH.md`
- `apps/V2T/**`
- `packages/VT2/**`
- `infra/Pulumi.yaml`
- `infra/src/V2T.ts`

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P1.md`

Additional rules:
- answer where SQLite, filesystem, config, and artifact records should live
- keep resource-lifetime and adapter decisions behind explicit services
- if persistence posture depends on unresolved product scope, report that as a blocker
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
Assigned question: what concrete command-truth, conformance, or acceptance
gaps still prevent `PLANNING.md` from being a reliable execution contract?
Graphiti assignment: none unless the orchestrator explicitly assigns recall
Stop condition: stop and return a blocker if command truth cannot be grounded in
live manifests, tasks, or dry-run evidence
Read scope:
- `specs/pending/V2T/RESEARCH.md`
- `specs/pending/V2T/DESIGN_RESEARCH.md`
- `specs/pending/V2T/PLANNING.md`
- root and workspace `package.json` or `turbo.json` files in scope plus `infra/package.json`

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

### Prompt Fill: Repo Reality Scout

```markdown
Assigned custom agent: `effect_v4_repo_mapper`
Mode: `read-only`
Objective: validate the concrete file groups, package names, and gate commands
that P2 intends to lock
Assigned question: which file groups, package identities, or gate commands in
the plan are confirmed repo truth, and which still need correction?
Graphiti assignment: none unless the orchestrator explicitly assigns recall
Stop condition: stop and return a blocker if command truth depends on guessed
package names, missing tasks, or undocumented path assumptions
Read scope:
- `specs/pending/V2T/RESEARCH.md`
- `specs/pending/V2T/DESIGN_RESEARCH.md`
- `specs/pending/V2T/PLANNING.md`
- root plus workspace `package.json` and `turbo.json` files plus `infra/package.json`

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P2.md`

Additional rules:
- verify command truth only from live manifests, tasks, and dry-run evidence
- flag any stale filter, nonexistent task, or guessed file path as a blocker
- do not redesign the plan; return a repo-truth audit
```

## P3 Execution

### Recommended Parallel Split

- `effect_v4_schema_worker` for domain and packet files
- `effect_v4_service_architect` for sidecar runtime and adapter wiring
- `effect_v4_error_guardian` for typed failure surfaces
- `effect_v4_http_ai_boundary` for protocol and handler boundaries
- `effect_v4_persistence_runtime_architect` for SQLite, filesystem, config, and
  artifact-lifecycle seams
- `effect_v4_state_concurrency_guardian` for long-running job or queue control
- `effect_v4_quality_reviewer` after merges

### Prompt Fill: Schema Worker

```markdown
Assigned custom agent: `effect_v4_schema_worker`
Mode: `workspace-write`
Objective: implement the approved schema-first slice for V2T domain objects and
wire packet contracts inside the assigned files
Assigned question: which approved schema or packet changes can you implement in
the assigned files without widening the slice or changing adjacent boundaries?
Graphiti assignment: none
Stop condition: stop and return a blocker if the assigned files are insufficient
or if the plan requires boundary changes outside your write scope
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
Assigned question: which approved service, layer, or adapter changes can you
implement in the assigned files without redesigning adjacent seams?
Graphiti assignment: none
Stop condition: stop and return a blocker if the plan requires protocol,
persistence, or schema changes outside the assigned write scope
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

### Prompt Fill: Persistence And Artifact Worker

```markdown
Assigned custom agent: `effect_v4_persistence_runtime_architect`
Mode: `workspace-write`
Objective: implement the approved persistence slice for SQLite, filesystem,
config, or artifact tracking inside the assigned files
Assigned question: which approved persistence and artifact-tracking changes can
you implement in the assigned files without reopening service or protocol design?
Graphiti assignment: none
Stop condition: stop and return a blocker if the work requires protocol or
service redesign outside the assigned persistence scope
Read scope:
- prior phase artifacts
- assigned persistence and runtime files

Write scope:
- {{PERSISTENCE_FILE_SET}}

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P3.md`

Additional rules:
- keep persistence work inside the approved slice
- keep filesystem, config, and managed resources behind explicit boundaries
- do not redesign the protocol or broaden the execution slice without reporting a blocker
```

### Prompt Fill: Quality Review Worker

```markdown
Assigned custom agent: `effect_v4_quality_reviewer`
Mode: `read-only`
Objective: review the post-merge execution diff for repo-law drift, incomplete
verification, missing docs, or misleading gate claims before the orchestrator
closes P3
Assigned question: what substantive issues still prevent the current P3 result
from closing cleanly?
Graphiti assignment: none unless the orchestrator explicitly assigns recall
Stop condition: stop and return a blocker if the review lacks the diff, touched
files, or command evidence needed for a trustworthy audit
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
Assigned question: what concrete evidence gaps, overclaims, or residual risks
still block a trustworthy readiness statement?
Graphiti assignment: none unless the orchestrator explicitly assigns recall
Stop condition: stop and return a blocker if the readiness audit lacks command
outputs, touched-surface context, or the current verification artifact
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

### Prompt Fill: Repo Scope Verifier

```markdown
Assigned custom agent: `effect_v4_repo_mapper`
Mode: `read-only`
Objective: verify that the touched surfaces and recorded command matrix in
`VERIFICATION.md` match the actual implementation scope
Assigned question: do the recorded touched surfaces and command matrix match the
real implementation scope, and if not, exactly where do they drift?
Graphiti assignment: none unless the orchestrator explicitly assigns recall
Stop condition: stop and return a blocker if the audit lacks the touched files,
merged diff, or live manifest data needed to answer the scope question
Read scope:
- all prior phase artifacts
- `specs/pending/V2T/VERIFICATION.md`
- touched files or merged diff
- root plus workspace `package.json` and `turbo.json` files plus `infra/package.json`

Write scope:
- none; read-only

Additional required inputs:
- `specs/pending/V2T/handoffs/HANDOFF_P4.md`

Additional rules:
- return only repo-truth mismatches, missing evidence, or clean confirmation
- do not reinterpret readiness; give the orchestrator an evidence-scope audit
```

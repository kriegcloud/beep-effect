# Workflow Lifecycle And Phase Gates

## Objective

This design defines the universal category workflow for the control plane. Every category phase is required to move through the same lifecycle.

## Universal Category Loop

Every category phase is required to execute these steps in order:

1. `Research` — inspect repo reality, prior artifacts, and adjacent precedents
2. `Plan` — lock acceptance criteria, interfaces, and decisions
3. `Implement` — write or refine the category artifacts
4. `Refine` — run adversarial review and close blockers
5. `Validate` — produce explicit evidence that the category is closed

## Entry Criteria

A phase may start only when:

1. the previous phase output exists or the README explicitly authorizes a phase-zero start
2. the active handoff is present
3. the orchestrator has loaded the required inputs
4. the target output artifact is named
5. the acceptance criteria for the phase are explicit

## Exit Criteria

A phase closes only when:

1. the target output artifact is substantive
2. the phase-specific acceptance criteria are satisfied
3. adversarial blockers are closed or logged in the `Exception Ledger`
4. cross-phase drift is resolved
5. the manifest is ready to advance

## Stop Conditions

Work is required to stop and escalate when:

1. repo reality contradicts the current handoff materially
2. the previous phase output is missing a required decision
3. an uncovered law family is discovered
4. the current phase cannot close without creating a hidden exception
5. the output contract is too weak to guide the next phase safely

## Escalation Rules

Escalation is required to be explicit and artifact-backed:

1. record the blocker
2. record the affected phase
3. record the missing decision or conflicting evidence
4. record the proposed resolution path
5. update the handoff or packet before work resumes

## Exception Handling

Exceptions are phase artifacts, not side comments:

1. use the `Exception Ledger`
2. cite the law
3. cite the scope
4. cite the owner
5. cite the removal condition

## Phase Consequence

This lifecycle is the required workflow for every category in this packet and every downstream initiative inheriting it. Downstream initiatives are allowed to add domain-specific checks. Downstream initiatives are not allowed to weaken this lifecycle.

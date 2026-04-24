# Loop6 Critique - Architecture / Repo-Law

## Scope

Authority order, startup/read contract, phase-gate authority, live-ledger
authority, and root-packet coherence for
`initiatives/repo-architecture-convergence`.

## Methodology

Compared the root contract in `README.md`, `SPEC.md`, and `PLAN.md` against
the executable ops layer in `ops/manifest.json`, `ops/README.md`,
`ops/prompts/agent-prompts.md`, `ops/prompt-assets/*`, and the phase
orchestrator prompts. Focus stayed on grounded residual mismatches only.

## Findings

### High - Search-audit gate authority is still internally contradictory

- Affected files:
  - `initiatives/repo-architecture-convergence/README.md`
  - `initiatives/repo-architecture-convergence/SPEC.md`
  - `initiatives/repo-architecture-convergence/PLAN.md`
  - `initiatives/repo-architecture-convergence/ops/manifest.json`
- What is wrong:
  - The root packet says the seven audit families are a shared catalog and that
    only a phase's `requiredSearchAuditIds` are blocking.
  - The current root tables in `SPEC.md` and `PLAN.md` still describe
    phase-specific subsets.
  - The machine-readable authority in `ops/manifest.json` currently encodes a
    universal seven-family contract via `searchAuditContract.requiredForEveryPhase`,
    `phaseDefaults.requiredSearchAuditIds`, `phaseDefaults.requiredEvidencePackSections`,
    and the phase records that currently list all seven families.
- Why it matters:
  - This breaks the packet's own claim that the manifest is the authoritative
    gate model. A worker following the root tables can under-prove closure;
    a worker following the manifest can reject closure the root docs say is
    sufficient. That ambiguity sits directly on phase-close authority.
- Remediation:
  - Choose one contract and make every layer say the same thing.
  - Preferred fix: keep the manifest-driven subset model, narrow
    `ops/manifest.json` per phase to the intended blocking subset, delete the
    universal-seven wording/fields, and refresh the root tables from the live
    manifest.
  - Alternate fix: if universal-seven is intentional, rewrite the root packet
    to say that explicitly and remove the subset language.

### Medium - Downstream ops entrypoints still compress or reorder the canonical startup/authority contract

- Affected files:
  - `initiatives/repo-architecture-convergence/ops/README.md`
  - `initiatives/repo-architecture-convergence/ops/prompts/agent-prompts.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P0_ORCHESTRATOR_PROMPT.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P1_ORCHESTRATOR_PROMPT.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P2_ORCHESTRATOR_PROMPT.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P3_ORCHESTRATOR_PROMPT.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P4_ORCHESTRATOR_PROMPT.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P5_ORCHESTRATOR_PROMPT.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P6_ORCHESTRATOR_PROMPT.md`
  - `initiatives/repo-architecture-convergence/ops/handoffs/P7_ORCHESTRATOR_PROMPT.md`
- What is wrong:
  - `ops/README.md` and `ops/prompts/agent-prompts.md` restate the authority
    ladder in compressed form instead of preserving the exact `SPEC.md` order,
    including the companion architecture packet and the explicit repo-reality
    rung.
  - The orchestrator prompts tell workers to load the shared prompt layer and
    prompt assets "first", then satisfy the worker-read contract, which
    reorders the startup sequence the root packet says downstream files may not
    reorder.
- Why it matters:
  - The packet explicitly forbids downstream omission, compression, or
    reordering of the startup/read contract and authority order. These files
    are the operator entrypoints, so any looseness here reintroduces exactly
    the ambiguity the root packet claims to eliminate.
- Remediation:
  - Replace downstream restatements with a strict pointer to the root contract,
    for example: "Follow `README.md` and `SPEC.md` exactly for read order and
    precedence; this file adds no new authority."
  - Remove "load prompt assets first" wording from every orchestrator prompt so
    the prompts sit inside the root contract instead of preceding it.

## Residual Risk

The packet is otherwise materially tighter than earlier loops: live-ledger
authority, phase ownership, P7 reopening behavior, and the control-plane
versus code-moving distinction now read coherently. The remaining risk is
localized to gate-authority drift and startup-authority drift.

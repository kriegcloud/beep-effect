# Loop7 Critique - Ops Canonical And Prompts

## Scope

Reviewed only `ops/**` control-plane surfaces for the repo architecture
convergence initiative: `ops/manifest.json`, `ops/README.md`,
`ops/prompts/agent-prompts.md`, `ops/prompt-assets/*`, `ops/handoffs/*`, and
the phase orchestrator prompts. Cross-checks were limited to the initiative
root contract in `README.md` where that file defines the binding startup and
manifest authority rules.

## Method

Compared the canonical startup contract, manifest-driven gate model,
search-audit authority, blocker taxonomy, exact phase input lists, and
phase-execution wording across the shared prompt layer, prompt assets, phase
handoffs, and orchestrator prompts. Focused on whether later prompts narrow,
omit, or blur the binding manifest contract.

## Findings

### 1. P7 blocker contract omits the canonical architecture-route blocker

Severity: Medium

Why this is still a residual:

- The initiative root contract makes each phase record's `blockerIds` part of
  the binding closure contract, not just advisory text:
  `initiatives/repo-architecture-convergence/README.md:92`.
- The blocker taxonomy still defines `architecture-invalid-route` as the
  canonical id for a route that conflicts with `standards/ARCHITECTURE.md`:
  `initiatives/repo-architecture-convergence/ops/prompt-assets/blocker-protocol.md:11`.
- P7's own exit gate says final verification cannot close unless every
  architecture row is compliant or resolved through an approved amendment:
  `initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P7.md:115`.
- But the active P7 manifest record omits `architecture-invalid-route` from
  `blockerIds`:
  `initiatives/repo-architecture-convergence/ops/manifest.json:1560`.
- The phase handoff mirrors that omission in its explicit blocking conditions:
  `initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P7.md:102`.

Impact:

If P7 final verification finds an architecture-matrix failure that is neither a
mere command failure nor an ungoverned temporary exception, the control plane
does not currently give operators the manifest-authorized blocker id that most
precisely describes that failure. That weakens blocker taxonomy consistency and
reopen routing exactly where the packet says P7 must send implementation
defects back to earlier phases.

Affected files:

- `initiatives/repo-architecture-convergence/ops/manifest.json`
- `initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P7.md`

Remediation guidance:

- Add `architecture-invalid-route` to the P7 `blockerIds` record in
  `ops/manifest.json`.
- Mirror that same id in `HANDOFF_P7.md` under `## Blocking Conditions` so the
  human-readable packet stays aligned with the manifest-driven contract.

## Verdict

Remaining findings: 1

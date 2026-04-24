# Loop6 Critique - Phases, Gates, And Evidence

## Scope

Adversarial review of the execution packet's phase plan, gate sequencing,
evidence model, packet structure, quick-start/history guidance, and handoff
process for full architecture-spec convergence.

## Methodology

Compared the root contract (`README.md`, `SPEC.md`, `PLAN.md`) against the live
ops control plane (`ops/README.md`, `ops/manifest.json`, handoff docs, and
prompt assets) plus the history bootstrap surfaces (`history/quick-start.md`
and `history/README.md`). Checked whether a worker following only the operator
surfaces would execute the same closure contract as the root packet.

## Findings

### 1. High - The live ops packet still contradicts the manifest-driven search-audit model

Affected files:
- `initiatives/repo-architecture-convergence/ops/manifest.json`
- `initiatives/repo-architecture-convergence/ops/README.md`
- `initiatives/repo-architecture-convergence/ops/handoffs/README.md`
- `initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P0-P7.md`
- `initiatives/repo-architecture-convergence/ops/prompt-assets/verification-checks.md`
- `initiatives/repo-architecture-convergence/ops/prompt-assets/manifest-and-evidence.md`

Why it matters:
The root packet now says search-audit closure is phase-specific and anchored to
`phases[].requiredSearchAuditIds` in `ops/manifest.json`, but the live ops
surfaces still tell workers that every phase must record all seven audit
families with zero-hit or no-scope proof. `ops/manifest.json` itself contains
both rules: `searchAuditContract.requiredForEveryPhase` declares a universal
seven-family obligation while each phase record defines a smaller blocking
subset. That means the "authoritative" machine-readable gate still contains two
different closure models, and a worker can reasonably over-run or under-run the
intended proof contract depending on which surface they follow.

Concrete remediation:
Pick one rule and encode it everywhere. If the intended model is the revised
manifest-driven subset model, remove the universal-seven wording from
`ops/manifest.json`, `ops/README.md`, `ops/handoffs/README.md`,
`ops/handoffs/HANDOFF_P0-P7.md`, and both prompt assets, and restate that only
phase-listed `requiredSearchAuditIds` are blocking while extra audits are
optional context.

### 2. Medium - The history-side bootstrap still omits the mandatory P0 standards reread

Affected files:
- `initiatives/repo-architecture-convergence/history/quick-start.md`
- `initiatives/repo-architecture-convergence/history/README.md`

Why it matters:
The root contract requires any `P0` batch that records baseline architecture or
repo-law status to reread `standards/ARCHITECTURE.md`,
`standards/effect-laws-v1.md`, and
`standards/effect-first-development.md` before scoring the baseline. The
history-side bootstrap docs restate the P2-P7 and P7 reread duties but skip the
P0 requirement entirely. Because those files are positioned as operator
bootstrap guidance, they can still lead a P0 worker to produce baseline
evidence without the reread that the root packet treats as blocking.

Concrete remediation:
Add the missing P0 reread rule to both history bootstrap docs, using the same
wording and placement as the root packet so the startup contract matches across
root, ops, and history surfaces.

## Verdict

The phase ordering, P0-P7 closure posture, P7 reopen rule, live-ledger
authority, and review-loop framing are now broadly coherent. Remaining risk is
concentrated in these two execution-surface mismatches, which still leave the
gate model and startup contract partially contradictory.

# P0-P5 Cross-Phase Handoff

## Package Objective

Run a staged repo cleanup that removes explicit bloat, verifies docgen ownership, prunes repo-level drift, and processes stale-code candidates safely with durable artifacts and user-controlled deletion.

## Locked Defaults

1. The package path is `specs/pending/repo-cleanup-bloat-staleness`.
2. The workflow uses one Codex session per phase.
3. Historical/security/research documents are preserved by default unless they break navigation or create misleading current-state claims.
4. Managed commands such as `config-sync`, `version-sync --skip-network`, `docgen`, and `trustgraph:sync-curated` are part of cleanup completeness when the active phase changes those surfaces.
5. P4 candidates require explicit user approval one candidate at a time.
6. No session is allowed to push or merge without explicit user confirmation.

## Phase Order

1. P0 locks the plan, grilling record, and document-classification policy.
2. P1 removes the targeted workspaces and regenerates managed artifacts.
3. P2 verifies local docgen ownership and removes stale docgen assumptions.
4. P3 prunes dependency, security, and platform drift exposed by the prior phases.
5. P4 builds and processes the ranked candidate inventory with approval gates.
6. P5 runs final validation and curated TrustGraph sync.

## Cross-Phase Rules

- Every phase is required to preserve prior locked defaults.
- Evidence is required before deletion; guesses are not enough.
- The checklist is the durable execution ledger.
- The grill log is the durable planning ledger.
- The manifest is the authoritative phase-state ledger and is required to be updated when a phase starts, blocks, completes, or advances.
- Each phase is required to write or refine its named output artifact.
- Out-of-phase cleanup opportunities are required to be logged for later handling rather than removed opportunistically.
- Default commit cadence is one commit per completed implementation phase in P1-P3 and one commit per approved candidate in P4 unless P0 explicitly overrides it.
- If repo reality contradicts the current plan, record the contradiction and stop for clarification rather than inventing a new policy silently.

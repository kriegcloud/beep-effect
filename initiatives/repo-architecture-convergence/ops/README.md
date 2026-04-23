# Ops Surface

This directory is the authoritative execution control plane for
`repo-architecture-convergence`. It exists to drive landed repo changes plus
proof, not to collect one markdown output per phase.

## Read Order

1. [manifest.json](./manifest.json)
2. [prompts/agent-prompts.md](./prompts/agent-prompts.md)
3. [prompt-assets/README.md](./prompt-assets/README.md)
4. [handoffs/README.md](./handoffs/README.md)
5. the active phase handoff and matching orchestrator prompt

## Operating Loop

1. Bootstrap Graphiti with `bun run graphiti:proxy:ensure` when available, or
   record a skipped reason.
2. Read the active phase packet, durable artifact paths, and blocker state.
3. Land the repo changes owned by the phase.
4. Update the phase evidence pack plus any phase-owned durable artifacts.
5. Run the required command gates and exact search audits.
6. Update critique, remediation, and re-review artifacts in
   `history/reviews/`.
7. Update [manifest.json](./manifest.json) with artifact state, evidence,
   blockers, and the next allowed phase.

## Multi-Artifact Model

- Every phase owns an evidence pack under `history/outputs/`.
- Some phases also own durable artifacts beyond the evidence pack:
  - `P0`: `history/outputs/p0-consumer-importer-census.md`
  - `P1`: [compatibility-ledger.md](./compatibility-ledger.md) and
    [architecture-amendment-register.md](./architecture-amendment-register.md)
  - `P7`: `history/outputs/p7-architecture-compliance-matrix.md` and
    `history/outputs/p7-repo-law-compliance-matrix.md`
- Every phase also owns `pX-critique.md`, `pX-remediation.md`, and
  `pX-rereview.md` under `history/reviews/`.
- No phase closes on packet authoring alone. Later phases must show landed repo
  changes plus replayable proof.

## Authoritative Paths

- [manifest.json](./manifest.json) - machine-readable phase state, dependency
  graph, gates, and artifact index
- [compatibility-ledger.md](./compatibility-ledger.md) - authoritative
  temporary alias and shim ledger
- [architecture-amendment-register.md](./architecture-amendment-register.md) -
  authoritative register for unresolved constitution conflicts
- [prompts/agent-prompts.md](./prompts/agent-prompts.md) - shared operator
  duties
- [handoffs/](./handoffs) - per-phase execution packets and orchestrator
  prompts

## Review Namespaces

- `history/reviews/loop*-*.md` remains the initiative-wide critique namespace.
- `history/reviews/pX-critique.md`, `pX-remediation.md`, and
  `pX-rereview.md` are the per-phase execution review loop artifacts.

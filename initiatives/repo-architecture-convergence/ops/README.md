# Ops Surface

This directory is the authoritative execution control plane for
`repo-architecture-convergence`. It exists to drive landed repo changes plus
proof, not to collect one markdown output per phase.

The only live governance ledgers for this initiative are
[compatibility-ledger.md](./compatibility-ledger.md) and
[architecture-amendment-register.md](./architecture-amendment-register.md).
Any ledger copies or discussions under `design/` or `history/` are historical
or planning context only and never close a phase.

## Required Read Order

This file does not create a second startup contract. Follow the exact
worker-read order from [../README.md](../README.md),
[../SPEC.md](../SPEC.md), and [manifest.json](./manifest.json) without
reordering or compressing it. Mirrored here, that contract is:

1. [../README.md](../README.md)
2. [../SPEC.md](../SPEC.md)
3. [../PLAN.md](../PLAN.md)
4. this [README.md](./README.md)
5. [manifest.json](./manifest.json)
6. [handoffs/README.md](./handoffs/README.md), the active phase handoff, and
   the matching orchestrator prompt
7. [../history/quick-start.md](../history/quick-start.md)
8. [prompts/agent-prompts.md](./prompts/agent-prompts.md)
9. [prompt-assets/README.md](./prompt-assets/README.md)
10. the prompt assets named by the active phase's `promptAssetIds` in
    [manifest.json](./manifest.json), which currently resolve to
    [prompt-assets/required-outputs.md](./prompt-assets/required-outputs.md),
    [prompt-assets/verification-checks.md](./prompt-assets/verification-checks.md),
    [prompt-assets/blocker-protocol.md](./prompt-assets/blocker-protocol.md),
    [prompt-assets/review-loop.md](./prompt-assets/review-loop.md), and
    [prompt-assets/manifest-and-evidence.md](./prompt-assets/manifest-and-evidence.md)

For any `P0` batch that records baseline architecture or repo-law status,
reread `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
`standards/effect-first-development.md` before that baseline is recorded. For
`P2` through `P7` code-moving or code-review work, also read those same three
standards before edits or gate interpretation begin. For `P7` final
verification or closeout re-checks, reread those three standards plus
`ops/compatibility-ledger.md` and
`ops/architecture-amendment-register.md` immediately before scoring matrices
or claiming closure.

When instructions disagree, use the exact source-of-truth order from
[../SPEC.md](../SPEC.md):

1. `standards/ARCHITECTURE.md`
2. `standards/architecture/*`
3. `standards/effect-laws-v1.md` and
   `standards/effect-first-development.md`
4. `standards/effect-laws.allowlist.jsonc` for governed repo-law exceptions
5. current repo reality when deciding migration order and compatibility
   containment
6. `SPEC.md`
7. `PLAN.md`, `ops/manifest.json`, and the active handoff packet
8. design docs, prompts, and history outputs

## Manifest Path Base

Unless a manifest field says otherwise, resolve every path in
`ops/manifest.json` from the initiative root
`initiatives/repo-architecture-convergence/`, not from the `ops/` directory.
That means entries such as `README.md` target the initiative root, while
entries such as `../../standards/...` continue from that same initiative-root
base.

## Operating Loop

1. Bootstrap Graphiti with `bun run graphiti:proxy:ensure` when available, or
   record a skipped reason.
2. Read the required packet inputs, standards when applicable, durable artifact
   paths, and blocker state.
3. Land the repo changes owned by the phase.
4. Update the phase evidence pack plus any phase-owned durable artifacts,
   including the worker-read acknowledgment and live-ledger delta.
5. Run the required command gates and the exact search audits named by the
   active phase's `requiredSearchAuditIds` in [manifest.json](./manifest.json).
   At the current manifest version, every phase record lists all seven catalog
   families; if the manifest later narrows a phase, only the phase-listed ids
   remain blocking.
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

If a design or history file names a ledger path differently, treat that
reference as non-authoritative context and keep the live state in `ops/*`.

## Review Namespaces

- `history/reviews/loop*-*.md` remains the initiative-wide critique namespace.
- `history/reviews/pX-critique.md`, `pX-remediation.md`, and
  `pX-rereview.md` are the per-phase execution review loop artifacts.

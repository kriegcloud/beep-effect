# History

This subtree is the initiative's execution evidence trail. It is not a
narrative archive and it is not satisfied by placeholder prose alone.

## Required Flow

1. Bootstrap durable context before phase work:
   - run `bun run codex:hook:session-start`
   - run `bun run graphiti:proxy:ensure` when Graphiti needs bootstrap help
   - recall prior phase and review context before making new decisions
2. Load the active contract set:
   - initiative `README.md`, `SPEC.md`, `ops/manifest.json`, and the active
     handoff
   - [quick-start.md](./quick-start.md)
   - [reviews/README.md](./reviews/README.md)
   - the active phase file under [outputs/](./outputs) and any required
     companion artifacts for that phase
   - the authoritative live governance ledgers under [ledgers/](./ledgers)
3. Execute real repo work before claiming closure:
   - land the routed changes
   - capture exact commands, search audits, and resulting evidence
   - record blockers, deviations, and consumer or cutover impact
4. Govern temporary deviations explicitly:
   - compatibility shims and temporary aliases belong in
     [ledgers/compatibility-ledger.md](./ledgers/compatibility-ledger.md)
   - architecture or repo-law amendment candidates belong in
     [ledgers/amendment-register.md](./ledgers/amendment-register.md)
   - code-law exceptions must reference the governing entry in
     `effect-laws.allowlist.jsonc`
5. Treat adversarial review as a gate:
   - critiques land under [reviews/](./reviews)
   - remediations land in the loop register
   - closure waits for re-review, not just self-attestation
6. Close the batch with durable writeback:
   - update the active phase output
   - update the reflection log if the work changed the plan or surfaced a
     durable lesson
   - write back key decisions, blockers, and unresolved risks to Graphiti

## Directory Contract

- [quick-start.md](./quick-start.md): operator bootstrap and batch closeout
  sequence
- [reviews/](./reviews): critique, remediation, and re-review surfaces
- [outputs/](./outputs): per-phase execution record files plus required
  companion artifacts such as the P0 consumer or importer census and the P7
  compliance matrices
- [ledgers/](./ledgers): authoritative live compatibility and amendment control
  planes for the history surface
- [reflection-log.md](./reflection-log.md): structured lessons learned after
  evidence is captured elsewhere

## Evidence Rules

- A phase file may remain scaffolded, but it must say so explicitly.
- Some phases are multi-artifact by contract. P0 remains incomplete without
  [outputs/p0-consumer-importer-census.md](./outputs/p0-consumer-importer-census.md),
  and P7 remains incomplete without
  [outputs/p7-architecture-compliance-matrix.md](./outputs/p7-architecture-compliance-matrix.md)
  plus
  [outputs/p7-repo-law-compliance-matrix.md](./outputs/p7-repo-law-compliance-matrix.md).
- A completed phase file must show executed work, validation evidence, and
  closeout state.
- Presence of a file never implies readiness; the recorded status does.

# Quick Start

1. Bootstrap the session before phase work:
   - run `bun run codex:hook:session-start`
   - run `bun run graphiti:proxy:ensure` if Graphiti needs bootstrap help
   - recall prior context and open [reviews/README.md](./reviews/README.md)
2. Load the active contract set:
   - read [README.md](../README.md), [SPEC.md](../SPEC.md),
     [ops/manifest.json](../ops/manifest.json), and the active handoff under
     [ops/handoffs/](../ops/handoffs)
   - open the active phase file under [outputs/](./outputs) plus any companion
     artifacts required by that phase
   - review the authoritative live ledgers
     [ledgers/compatibility-ledger.md](./ledgers/compatibility-ledger.md) and
     [ledgers/amendment-register.md](./ledgers/amendment-register.md)
3. Execute real work before writing conclusions:
   - land the repo changes for the batch
   - if the phase is still unexecuted, leave the phase file in scaffolded state
4. Capture evidence in the active phase file and its companion artifacts:
   - changed surfaces
   - exact commands and search audits with results
   - implementation evidence, blockers, deviations, and follow-ups
   - consumer impact and cutover state
   - Graphiti recall and writeback status
5. Run and record repo-law and architecture gates for the batch:
   - use the smallest safe command scope, but record the exact command line and
     result
   - expected gates usually include `bun run config-sync:check`,
     `bun run check`, `bun run lint`, `bun run test`, `bun run docgen`, and
     `bun run audit:full`
6. Govern temporary exceptions explicitly:
   - temporary compatibility surfaces go in the live compatibility ledger
   - architecture or repo-law tensions go in the live amendment register
   - any temporary law exception must reference the controlling entry in
     `effect-laws.allowlist.jsonc`
7. Close only after the review loop is ready:
   - update the active primary output, required companion artifacts, manifest,
     and
     [reflection-log.md](./reflection-log.md)
   - update the loop remediation register and re-review gate when critique work
     is involved
   - write back durable findings to Graphiti

Do not close a phase on narrative completeness alone. Closure requires executed
work, recorded evidence, and a review path that can be re-run.

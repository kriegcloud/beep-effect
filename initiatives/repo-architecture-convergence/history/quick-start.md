# Quick Start

1. Bootstrap the session before phase work:
   - run `bun run codex:hook:session-start`
   - run `bun run graphiti:proxy:ensure` if Graphiti needs bootstrap help
   - recall prior context and open [reviews/README.md](./reviews/README.md)
2. Read the required contract set exactly:
   - read [README.md](../README.md), [SPEC.md](../SPEC.md),
     [PLAN.md](../PLAN.md), [ops/README.md](../ops/README.md), and
     [ops/manifest.json](../ops/manifest.json)
   - read [ops/handoffs/README.md](../ops/handoffs/README.md), the active
     handoff under [ops/handoffs/](../ops/handoffs), the matching orchestrator
     prompt, [ops/prompts/agent-prompts.md](../ops/prompts/agent-prompts.md),
     and [ops/prompt-assets/README.md](../ops/prompt-assets/README.md); then
     load the prompt assets named by the active handoff and prompt layer before
     execution starts
   - use this [quick-start.md](./quick-start.md) as the history-side bootstrap
     checklist that accompanies the live `ops/*` surfaces
   - for P0 batches that record baseline architecture or repo-law status,
     reread `../../standards/ARCHITECTURE.md`,
     `../../standards/effect-laws-v1.md`, and
     `../../standards/effect-first-development.md` before recording baseline
     matrix or compliance status
   - for P2 through P7 code-moving or code-review work, also read
     `../../standards/ARCHITECTURE.md`,
     `../../standards/effect-laws-v1.md`, and
     `../../standards/effect-first-development.md`
   - for P7 final verification or any closure re-check, immediately before any
     matrix scoring or closure claim, reread
     `../../standards/ARCHITECTURE.md`,
     `../../standards/effect-laws-v1.md`,
     `../../standards/effect-first-development.md`,
     [../ops/compatibility-ledger.md](../ops/compatibility-ledger.md), and
     [../ops/architecture-amendment-register.md](../ops/architecture-amendment-register.md)
3. Resolve disagreements with the exact `SPEC.md` authority order:
   - `../../standards/ARCHITECTURE.md`
   - the companion packet in `../../standards/architecture/`
   - `../../standards/effect-laws-v1.md` and
     `../../standards/effect-first-development.md`
   - `../../standards/effect-laws.allowlist.jsonc` for governed repo-law
     exceptions
   - current repo reality when deciding migration order and compatibility
     containment
   - `../SPEC.md`
   - `../PLAN.md`, `../ops/manifest.json`, and the active handoff packet
   - design docs, prompts, and history outputs
4. Open the current phase history bundle:
   - the canonical evidence pack under [outputs/](./outputs) for the live phase
     model
   - any required companion artifacts for that phase
   - the matching phase review loop files under `history/reviews/pX-*.md`
   - any applicable initiative-wide `loop*-*.md` critique artifacts
5. Execute real work before writing conclusions:
   - land the repo changes for the batch
   - if the phase is still unexecuted, leave the evidence pack in scaffolded
     state
6. Capture evidence in the active phase file and its companion artifacts:
   - worker-read acknowledgment for the required packet and standards inputs
   - changed surfaces
   - exact commands and search audits with results
   - implementation evidence, blockers, deviations, and follow-ups
   - consumer impact and cutover state
   - Graphiti recall and writeback status
7. Govern temporary exceptions only in the live `ops/*` surfaces:
   - temporary compatibility surfaces go in
     [../ops/compatibility-ledger.md](../ops/compatibility-ledger.md)
   - architecture or repo-law tensions go in
     [../ops/architecture-amendment-register.md](../ops/architecture-amendment-register.md)
   - any temporary law exception must reference the controlling entry in
     `standards/effect-laws.allowlist.jsonc`
   - treat [ledgers/](./ledgers) as historical reference only
8. Close only after the review loop is ready:
   - update the active primary output, required companion artifacts, phase
     critique, remediation, and re-review files, `ops/manifest.json`, and
     [reflection-log.md](./reflection-log.md) when durable lessons changed
   - if broader packet critique applies, cite the relevant `loop*-*.md`
     artifacts, but do not use them as a substitute for the phase review loop
   - write back durable findings to Graphiti

Do not close a phase on narrative completeness alone. Closure requires executed
work, recorded evidence, live `ops/*` governance state, and a review path that
can be re-run.

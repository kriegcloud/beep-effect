# History

This subtree is the initiative's evidence and review surface. It preserves
execution proof, review state, and historical breadcrumbs, but it is not the
live governance control plane.

## Required Flow

1. Bootstrap durable context before phase work:
   - run `bun run codex:hook:session-start`
   - run `bun run graphiti:proxy:ensure` when Graphiti needs bootstrap help
   - recall prior phase and review context before making new decisions
2. Load the active contract set in the live startup order:
   - initiative `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`, and
     `ops/manifest.json`
   - `ops/handoffs/README.md`, the active handoff, the matching orchestrator
     prompt, `ops/prompts/agent-prompts.md`,
     `ops/prompt-assets/README.md`, and [quick-start.md](./quick-start.md);
     then load the prompt assets named by the active handoff and prompt layer
     before execution starts
   - for P0 batches that record baseline architecture or repo-law status,
     reread `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
     `standards/effect-first-development.md` before recording baseline matrix
     or compliance status
   - for P2 through P7 code-moving or code-review work, also load
     `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
     `standards/effect-first-development.md`
   - for P7 final verification or closeout re-check, immediately before any
     matrix scoring or closure claim, reread
     `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`,
     `standards/effect-first-development.md`,
     `ops/compatibility-ledger.md`, and
     `ops/architecture-amendment-register.md`
3. Resolve disagreements with the exact `SPEC.md` source-of-truth order:
   - `standards/ARCHITECTURE.md`
   - the companion packet in `standards/architecture/`
   - `standards/effect-laws-v1.md` and
     `standards/effect-first-development.md`
   - `standards/effect-laws.allowlist.jsonc` for governed repo-law exceptions
   - current repo reality when deciding migration order and compatibility
     containment
   - `SPEC.md`
   - `PLAN.md`, `ops/manifest.json`, and the active handoff packet
   - design docs, prompts, and history outputs
4. Open the current history surfaces for the active phase:
   - [reviews/README.md](./reviews/README.md)
   - the canonical phase evidence pack under [outputs/](./outputs) that matches
     the live `P0` through `P7` model used by `ops/`
   - any required companion artifacts for that phase
   - the phase-scoped review loop files under `history/reviews/pX-*.md`
   - any applicable initiative-wide `loop*-*.md` critique artifacts that still
     constrain the batch
5. Execute real repo work before claiming closure:
   - land the routed changes
   - capture exact commands, search audits, and resulting evidence
   - record blockers, deviations, and consumer or cutover impact
6. Treat `ops/*` as the only live governance plane:
   - compatibility shims and temporary aliases belong in
     [../ops/compatibility-ledger.md](../ops/compatibility-ledger.md)
   - architecture or repo-law amendment candidates belong in
     [../ops/architecture-amendment-register.md](../ops/architecture-amendment-register.md)
   - code-law exceptions must reference the governing entry in
     `standards/effect-laws.allowlist.jsonc`
   - [ledgers/](./ledgers) is historical context only and never the closeout
     authority
7. Use the review surfaces as gates, not as competing authorities:
   - phase execution review lives in `history/reviews/pX-critique.md`,
     `pX-remediation.md`, and `pX-rereview.md`
   - `history/reviews/loop*-*.md` remains the initiative-wide critique and
     historical re-review namespace
   - closure waits for the active phase re-review plus any still-blocking
     initiative-wide findings
8. Close the batch with durable writeback:
   - update the active phase output and required companion artifacts
   - update the phase review loop files and `ops/manifest.json`
   - update the reflection log only when the work changed the plan or surfaced
     a durable lesson
   - write back key decisions, blockers, and unresolved risks to Graphiti

## Directory Contract

- [quick-start.md](./quick-start.md): operator bootstrap and batch closeout
  sequence aligned to the live packet
- [reviews/](./reviews): phase-scoped execution review files plus historical
  initiative-wide critique loops
- [outputs/](./outputs): canonical phase evidence packs and required companion
  artifacts; earlier filenames that do not match the live phase model are
  historical aliases only
- [ledgers/](./ledgers): historical seed and reference copies retained for
  auditability after live authority moved to `ops/*`
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
- A completed phase file must show executed work, validation evidence, review
  clearance, and current references to the live `ops/*` governance state.
- Presence of a file never implies readiness; the recorded status does.

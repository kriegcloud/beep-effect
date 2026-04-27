# Architecture And Migration Plan Review

Date: 2026-04-26

Scope reviewed:

- Core architecture standards under `standards/ARCHITECTURE.md` and `standards/architecture/`
- Superseded migration packet archived by
  `initiatives/repo-architecture-automation/design/prior-convergence-digest.md`
- Design, ops, handoff, prompt, manifest, history, and review-loop surfaces

This is an architecture and migration-plan critique. I am not treating the
documents as a statement about the repo's current implementation state.

## Short Verdict

I like this direction a lot. The architecture has a real spine: slice-first
product code, driver-neutral domain language, use-cases as application
contracts, `shared` as a deliberate DDD shared kernel, `foundation` as generic
substrate, `drivers` as technical boundary wrappers, and explicit topology for
tooling and agent assets.

The migration packet is also much better than normal architecture migration
plans because it refuses to call markdown completion "done." It insists on
landed repo diffs, command gates, search audits, live ledgers, evidence packs,
and review loops. That is the right instinct for a repo where agents will be
executing large parts of the work.

My main concern is not the direction. My concern is operational drag. The
architecture and migration controls are coherent, but they repeat the same
authority/read/gate language across many files. That makes the plan safer today
but drift-prone tomorrow. The plan is senior-orchestrator implementable now. I
would not yet call it fully independent-agent implementable until P2/P3 are
split into smaller execution batches, audit recipes are exact, and the evidence
model has a validator.

## What I Love

- The architecture is opinionated in the right places. It does not just say
  "clean architecture" or "vertical slices"; it names where domain, use-cases,
  config, server, client, tables, UI, drivers, shared, foundation, tooling, and
  agents belong.

- `shared` versus `foundation` is excellent. Treating `shared` as deliberate
  cross-slice product language, not generic reusable substrate, is one of the
  strongest decisions in the packet. It gives reviewers a real test: "Are these
  packages intentionally agreeing on product semantics?"

- The driver boundary is crisp. Drivers expose technical capability. Product
  ports live in use-cases. Server packages adapt drivers to product ports. That
  split should prevent Drizzle/Postgres/SDK details from becoming product
  language.

- The use-case package is doing useful architectural work. Putting commands,
  queries, product ports, driver-neutral protocol declarations, and application
  errors in `use-cases` gives the repo an application layer without turning
  `server` into the place where product language is invented.

- Explicit export subpaths are a very strong move. `use-cases/public`,
  `use-cases/server`, `config/public`, `config/secrets`, `config/layer`, and
  driver `/browser` entrypoints make boundary safety visible at import sites.

- The rich-domain stance fits this repo. Schema-first models, typed failures,
  pure behavior, `Context.Service`, and slice-local Effect v4 `Layer`
  composition all align with the implementation style you have been pushing.

- The plan correctly treats tooling, scaffolders, docgen, app entrypoints, root
  configs, identity registries, and agent instructions as architecture surfaces.
  That is huge. Many migration plans fail because they move packages but leave
  the repo machinery regenerating the old topology.

- The route canon is unusually concrete. `repo-memory`, `editor`,
  `runtime/protocol`, `shared/server`, `shared/tables`, agent roots, and tooling
  all have committed routes rather than vague "clean up later" language.

- The compatibility/amendment split is exactly right. Temporary shims belong in
  a compatibility ledger with deletion proof. Permanent deviations must become
  explicit architecture amendments. That prevents "known issue" from becoming a
  polite name for permanent entropy.

- The history/review corpus shows the packet got better through critique. Early
  findings pushed it away from documentation theater and toward execution gates,
  live governance, blocker taxonomy, and manifest authority. That evolution is
  a good sign.

## What I Dislike

- `standards/ARCHITECTURE.md` is doing too much. It is constitution, tutorial,
  example bank, glossary-lite, migration guide, and enforcement prelude. The
  content is good, but the file is heavy enough that future edits will be risky.

- The same rules are repeated too many times. Source-of-truth order,
  worker-read contracts, Graphiti duties, all-seven audit families, live-ledger
  rules, and phase gates appear across root docs, ops docs, prompts, handoffs,
  quick-start files, history docs, and the manifest. It is aligned now, but this
  is exactly the kind of duplication that drifts.

- P2 is overloaded. It includes workspace globs, aliases, scripts, scaffolders,
  docgen, repo checks, config sync, tooling emitters, hard-coded entrypoints,
  app Layer assembly, sidecar launch paths, and agent-root canonicalization.
  That is not one phase in practice. It is a cluster of migration batches.

- The sidecar entrypoint sequencing is not crisp enough. P2 says launch surfaces
  should stop pointing at legacy runtime paths, while P4/P5 create or stabilize
  the replacement server packages. The plan needs a precise rule for whether P2
  prepares wrappers, records ledger entries, flips paths, or only blocks later
  phases until replacement targets exist.

- The audit families are named, but not yet operational enough. The docs require
  exact commands and counts, but the reusable audit catalog is still conceptual.
  Without canonical recipes, two agents can both "run the audit" and produce
  incomparable evidence.

- The all-seven-audits rule is safe but risks evidence theater. If every phase
  owes every audit family, agents may generate broad, stale, low-signal proof
  instead of the precise proof that closes the actual batch.

- The live ledger templates are directionally right, but owner fields risk being
  too phase-shaped. A row owned by `P4` is less accountable than a row owned by a
  named migration lane or concrete owner role. Phase ownership can make a bridge
  look governed while nobody owns deletion.

- Scaffolded history files are honest, but visually risky. A file named
  `p7-final-architecture-and-repo-law-verification.md` can look like an outcome
  even when its status says scaffolded. The packet warns about this, but future
  agents will still be tempted to over-trust file presence.

- The "authoritative lightweight/pathless `.aiassistant` rule" appears as a
  blocker-level concern but feels imported from elsewhere. If it is important
  enough to block P2/P6, this packet should define it locally or link to the
  exact owning rule.

- `config` is right conceptually but high-risk in practice. It owns typed config
  contracts and `/layer` helpers, and use-cases may import config contracts or
  services. Without more positive and negative examples, config could quietly
  become a new runtime/settings bucket.

- Browser-safe driver imports need a sharper bar. Allowing client packages to
  import `@beep/<driver>/browser` is practical, but the docs should define what
  makes a driver browser-safe and how to prevent that path from bypassing client
  adapters.

## Directionally Correct But Needs Work

- Keep the architecture doctrine, but extract a compact rule matrix. The repo
  needs a machine-checkable table for package kind, allowed imports, allowed
  exports, browser safety, required metadata, and forbidden patterns.

- Add a short operator map. A future worker should be able to open one page and
  see the current phase, authoritative files, required reads, committed routes,
  blocking gates, and next action. The deep packet can remain, but the entrypoint
  should be merciful.

- Generate repeated gate/read/audit tables from `ops/manifest.json`. Prose docs
  should summarize and link to the manifest rather than hand-maintain the same
  contract everywhere.

- Split P2 into named batches before kickoff. Suggested lanes:
  workspace/path/metadata, identity/generator, docgen/repo-checks,
  app-entrypoint prep, config-sync/root tooling, agent-root routing, and
  Layer-composition prep.

- Split P3 into named extraction batches. Suggested lanes:
  `shared/server -> drivers/drizzle`, `shared/tables` split,
  `shared/providers/firecrawl -> drivers/firecrawl`, foundation/common moves,
  shared-kernel retention decisions, and metadata proof.

- Add file-level responsibility audits for the riskiest mixed packages. The
  `repo-memory/sqlite` split is excellent because it classifies responsibilities,
  not just folders. Do the same for `runtime/protocol`, `runtime/server`,
  `editor/protocol`, `editor/runtime`, `shared/server`, and `shared/tables`.

- Turn the route canon into structured data or enrich the tables. Useful fields:
  legacy surface, target package path, target public package name, required
  export subpaths, source globs, consumer set, owner lane, compatibility ledger
  id, amendment id, blocker id, validation query, and deletion phase.

- Add exact audit recipes. P0 should seed reusable `rg` commands with scan sets,
  exclusions, variables, and expected before/after semantics. Later phases should
  replay those recipes rather than inventing their own proof.

- Add a validator command before execution. It should fail on placeholder text,
  missing command timestamps/exits, omitted search-audit ids, stale evidence,
  missing review-loop artifacts, inconsistent manifest state, open blockers, and
  `completed` without landed repo diffs.

- Define evidence freshness mechanically. Evidence should include commit SHA,
  diff base, changed-file list, command timestamp, and "last material repo
  change" anchor so stale-evidence rules can be checked, not interpreted.

- Add a multi-agent concurrency protocol. The packet needs a rule for branch or
  worktree ownership, who may update `currentTargetPhase`, how manifest conflicts
  are resolved, what counts as handoff-ready, and how a worker should stop when
  another worker touches a shared control-plane file.

- Define exception evidence. "High-bar" shared packages, browser-safe drivers,
  cross-concept escape hatches, and driver-to-driver dependencies are all
  reasonable, but the docs should say what evidence justifies each exception and
  where the decision is recorded.

- Add a small-slice path. The docs say not to create empty files, but the
  canonical topology example is large enough to encourage over-scaffolding. Give
  agents a minimal valid slice and a rule for when to add each role.

- Treat `shared/use-cases` as the main future hazard. The docs constrain it well,
  but it is the easiest place for old `runtime/protocol` to reincarnate. Keep the
  post-slice decision binary: retain only a proven narrow shared control-plane
  contract, or delete it.

## My Recommended Pre-Kickoff Hardening Slice

Before starting the actual migration, I would add one small hardening slice to
make the plan easier to execute:

1. Create an operator map for the convergence packet.
2. Add exact audit recipes for the seven audit families.
3. Add a validator for manifest/evidence/review-loop consistency.
4. Split P2 and P3 into named batch lanes with owner lanes and handoff-ready
   checkpoints.
5. Add file-level responsibility audits for the mixed runtime/editor/shared
   packages.
6. Define evidence freshness anchors and the multi-agent concurrency protocol.

That is not architecture churn. It is insurance against the migration machinery
becoming its own fog machine.

## Final Honest Take

The architecture is directionally correct and genuinely useful. It captures the
kind of repo you appear to want: high experimentation, low topology drift,
Effect-first boundaries, schema-first models, and agent-readable structure.

The migration plan is also directionally correct. It is much more serious than a
normal backlog migration plan because it has gates, ledgers, evidence, review,
and final deletion rules.

The part I would change is the operating surface. Make the doctrine easier to
scan, make the control plane less duplicated, make the audits executable, and
make the early phases smaller. If you do that, I would be comfortable kicking
this off. Without that hardening, I would still be comfortable with a senior
human orchestrating it, but I would expect independent agents to lose time in
process navigation and occasionally produce plausible-but-weak evidence.

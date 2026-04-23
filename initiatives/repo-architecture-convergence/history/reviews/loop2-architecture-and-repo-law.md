# Loop 2 Re-review: Architecture And Repo-Law

## Scope

This re-review covered the remediated initiative packet against the binding
architecture and repo-law source set:

- `standards/ARCHITECTURE.md`
- `standards/architecture/*`
- `standards/effect-laws-v1.md`
- `standards/effect-first-development.md`
- `initiatives/repo-architecture-convergence/README.md`
- `initiatives/repo-architecture-convergence/SPEC.md`
- `initiatives/repo-architecture-convergence/PLAN.md`
- `initiatives/repo-architecture-convergence/design/*`
- `initiatives/repo-architecture-convergence/history/*`
- `initiatives/repo-architecture-convergence/ops/*`

This review stayed in the architecture + repo-law lens. It did not audit repo
implementation code directly.

## Remaining Findings

### Critical

#### C1. The ops control plane still encodes the superseded phase model and a document-first execution contract

Category: Phase model, execution contract, and evidence routing.

Evidence:
- `README.md` defines `P1` as program controls, `P2` as enablement, and `P3`
  as shared-kernel/non-slice extraction while `PLAN.md` uses the same order.
- `ops/manifest.json:298-345` still defines `P1` as `Family Groundwork And Metadata`.
- `ops/manifest.json:380-430` still defines `P2` as `Shared Kernel Contraction`.
- `ops/manifest.json:465-516` still defines `P3` as `Repo-Memory Slice Migration`
  and says the objective is to "Produce the decision-complete repo-memory
  migration packet".
- `ops/handoffs/HANDOFF_P3.md:1-70` still frames P3 as a
  "decision-complete migration packet".
- `ops/handoffs/P2_ORCHESTRATOR_PROMPT.md:1-33` still routes P2 to
  `history/outputs/p2-shared-kernel-contraction.md`.
- `design/README.md:43-54` still uses an ordering assumption that skips the
  explicit shared-kernel phase between enablement and slice migration.

Why it matters:
The remediated `SPEC.md` correctly says phases close on executed repo changes
plus proof, but the machine-readable manifest, worker handoffs, prompts, and
artifact routing still tell operators to run the old program. In practice, an
operator following the checked-in ops surface can still do the wrong phase in
the wrong order and satisfy a packet-oriented deliverable instead of an
execution-led one. That is a critical contradiction in the initiative’s actual
control plane.

Concrete remediation:
Rewrite `ops/manifest.json`, every phase handoff, every orchestrator prompt, the
design index ordering note, and the phase output filenames or mappings so they
exactly match the `SPEC.md` and `PLAN.md` phase model:
- `P1` = program controls and ledgers
- `P2` = enablement and wiring cutover
- `P3` = shared-kernel and non-slice extraction
- `P4` = `repo-memory`
- `P5` = `editor`
- `P6` = remaining operational/app/agent cutovers
- `P7` = final verification

Also remove remaining "decision-complete packet" language from phase objectives
and exit gates. The ops surface must require landed repo diffs plus gate
evidence, not migration prose.

#### C2. Compatibility and amendment governance is split across conflicting locations and conflicting states

Category: Exception governance and source-of-truth integrity.

Evidence:
- `SPEC.md:92-97` declares the canonical durable work-product paths as
  `ops/compatibility-ledger.md` and `ops/architecture-amendment-register.md`.
- `history/README.md:18-27,40-47` tells operators the active governance ledgers
  live under `history/ledgers/`.
- `design/README.md:22-25` says `design/compatibility-ledger.md` is a "live
  registry" and `design/architecture-amendment-register.md` is the durable
  register.
- `design/compatibility-ledger.md` already contains planned shim rows, while
  `history/ledgers/compatibility-ledger.md` says no executed compatibility
  surfaces have been recorded yet.
- `design/architecture-amendment-register.md` pre-populates candidate rows,
  while `history/ledgers/amendment-register.md` says no amendment candidates
  have been recorded yet.

Why it matters:
Final closure depends on compatibility and amendment governance being exact.
Right now the packet has at least three competing homes for those control-plane
artifacts, and two of them disagree on current state. That makes blocker
tracking, temporary exception governance, and "ledger is empty" closeout claims
untrustworthy.

Concrete remediation:
Choose one authoritative location for live governance ledgers and update the
entire packet to use only that location. Then:
- demote any duplicate ledger docs to seed/reference docs, not live state
- remove conflicting pre-populated/live wording
- wire the chosen canonical paths into `SPEC.md`, `README.md`, `history/`,
  `design/`, `ops/manifest.json`, and every handoff/prompt
- ensure the manifest indexes the chosen ledgers explicitly

### High

#### H1. Repo-law standards are still not fully part of the operational read contract

Category: Repo-law process and operator startup requirements.

Evidence:
- `SPEC.md:76-83` correctly puts `standards/effect-laws-v1.md` and
  `standards/effect-first-development.md` above repo reality and above the
  initiative packet in source-of-truth order.
- `ops/manifest.json:14-23` omits both repo-law documents from
  `sourceOfTruthOrder`.
- `ops/prompts/agent-prompts.md:6-22` tells workers to read the manifest,
  handoff, prompt assets, design docs, outputs, and review artifacts, but does
  not require reading the repo-law docs.
- `ops/handoffs/HANDOFF_P3.md:14-22` and the other phase handoffs route workers
  to `SPEC.md`, design docs, prior outputs, and the manifest, but not to the
  repo-law standards that the phase is supposed to satisfy.

Why it matters:
The packet now claims 100% repo-law compliance at closeout, but the ops layer
does not consistently require workers to load the repo-law sources that define
that compliance. A phase can therefore follow the checked-in instructions and
still miss binding requirements around schema-first modeling, typed errors,
JSDoc/docgen, or runtime-boundary law.

Concrete remediation:
Promote `standards/effect-laws-v1.md` and
`standards/effect-first-development.md` into the operational startup contract:
- add them to `ops/manifest.json.sourceOfTruthOrder`
- require them in `ops/prompts/agent-prompts.md`
- include them in handoff required inputs for every code-moving phase and for
  P7 final verification
- add a shared prompt-asset or checklist section for repo-law reads and proofs

#### H2. The repo-law compliance matrix is still too coarse to support a literal "100%" repo-law-compliant closeout

Category: Verification completeness and closeout proof.

Evidence:
- `SPEC.md:322-339` defines a broad repo-law matrix, but it compresses many
  enforceable rules into high-level buckets.
- `standards/effect-laws-v1.md:15-35` and
  `standards/effect-first-development.md:238-241,454-489,1185-1227` make
  several explicit laws and checks binding, including schema annotation via
  `$I.annote(...)`, no direct `JSON.parse` / `JSON.stringify`, preference for
  `S.Class`, and repo-wide schema-first verification via
  `bun run beep lint schema-first`.
- A repo-wide search of the initiative packet does not show
  `bun run beep lint schema-first`, `bun run beep laws allowlist-check`,
  `$I.annote`, `S.Class`, or the JSON/schema-codec law integrated into the gate
  stack or matrix rows.

Why it matters:
With the current matrix, P7 can mark every repo-law row green while still
missing explicit standards-level obligations that the repo treats as binding.
That means the initiative can honestly prove "green against this matrix" but
not honestly prove "100% repo-law compliant".

Concrete remediation:
Either:
- expand the repo-law matrix and gate stack so it explicitly covers the missing
  enforceable laws that matter to migrated code, including schema annotation,
  schema-first inventory verification, JSON/schema-codec usage, and object
  schema form guidance where the standard makes them mandatory

or:
- narrow the initiative’s claim from "100% repo-law compliant" to a clearly
  named migration-law subset until the full repo-law surface is encoded in the
  matrix and gates

## Clean Areas

- The packet now correctly treats `/public`, `/server`, `/secrets`, `/layer`,
  and `/test` as canonical export subpaths rather than destination package
  kinds.
- The revised `SPEC.md` and `PLAN.md` now frame progress around executed repo
  changes plus evidence, not markdown completion alone.
- The architecture and repo-law matrices now exist, which is a major upgrade
  over loop 1.
- Early enablement, app-entrypoint rewrites, compatibility governance, and
  final deletion are now recognized as first-class work rather than incidental
  cleanup.
- The routing canon is materially more aligned with `standards/ARCHITECTURE.md`
  than the original packet.

## Final Verdict

Remaining findings: 4.

Findings by severity:
- Critical: 2
- High: 2
- Medium: 0
- Low: 0

This lens is not clean yet.

The initiative is substantially improved, but it is still not acceptable as the
packet that guarantees 100% architecture and repo-law convergence by the end.
The biggest remaining problem is that the authoritative execution surface still
disagrees with the authoritative contract. Until the ops plane and governance
ledgers are made singular and consistent, final compliance claims remain
unreliable.

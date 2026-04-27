# Loop 1 Repo Law And Enforcement Review

## Scope

This review checks the initiative against repo laws and enforcement expectations
that sit beyond raw architecture shape:

- [AGENTS.md](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md)
- [standards/effect-laws-v1.md](/home/elpresidank/YeeBois/projects/beep-effect/standards/effect-laws-v1.md)
- [standards/effect-first-development.md](/home/elpresidank/YeeBois/projects/beep-effect/standards/effect-first-development.md)
- the root quality and operator scripts in [package.json](/home/elpresidank/YeeBois/projects/beep-effect/package.json)
- the initiative packet under [initiatives/repo-architecture-convergence](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence)

It intentionally does not re-review raw route-table correctness already covered
by the other loop-1 critiques. The focus here is enforceability, repo-law
alignment, and proof of compliance.

## Findings

### Critical

#### C1. The initiative defines completion in architecture terms, not repo-law terms

- Category: `misalignment`
- Evidence:
  - [AGENTS.md:5-16](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md:5) requires effect-first development, schema-first domain models, typed errors, explicit service boundaries, and green quality commands.
  - [standards/effect-laws-v1.md:15-30](/home/elpresidank/YeeBois/projects/beep-effect/standards/effect-laws-v1.md:15) makes those expectations enforceable: no `any` or assertions, no native `Error`, JSDoc on exported APIs, schema-first constraints, and passing `check` / `lint` / `test` / `docgen`.
  - [SPEC.md:241-263](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:241) defines success only in terms of topology, metadata, subpaths, shared-kernel shape, and compatibility deletion.
  - [design/repo-memory-migration.md:36-69](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/design/repo-memory-migration.md:36) and [ops/handoffs/HANDOFF_P3.md:18-49](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P3.md:18) require route and export decisions, but no schema-first, typed-error, service-boundary, or JSDoc acceptance checks.
- Why it matters:
  - The repo can end the initiative with packages in the right folders while
    still violating the repo's binding engineering laws. That is not "100% up
    to spec" in this repo.
- Concrete remediation:
  - Add a repo-law compliance matrix to `SPEC.md` and make it part of phase
    closure. At minimum the matrix must cover schema-first domain models, typed
    error boundaries, Effect-law compliance, explicit service boundaries,
    JSDoc/docgen compliance, and required quality commands.

#### C2. The initiative does not make green quality commands a hard phase gate

- Category: `issue`
- Evidence:
  - [AGENTS.md:15-20](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md:15) says to keep repo quality commands green and prefers repo-local bootstrap helpers.
  - [standards/effect-laws-v1.md:25-35](/home/elpresidank/YeeBois/projects/beep-effect/standards/effect-laws-v1.md:25) says not to finish work with failing `check`, `lint`, `test`, or `docgen`.
  - The root repo already exposes the relevant command surface in [package.json:52-86](/home/elpresidank/YeeBois/projects/beep-effect/package.json:52): `codex:hook:session-start`, `config-sync:check`, `check`, `test`, `lint`, `docgen`, `audit:full`, and `graphiti:proxy:ensure`.
  - The initiative only mentions "repo quality commands" vaguely in [design/verification-and-cutover.md:11-23](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/design/verification-and-cutover.md:11) and [ops/handoffs/HANDOFF_P7.md:17-25](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P7.md:17).
  - [history/quick-start.md:3-12](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/quick-start.md:3), [ops/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md:1-6](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md:1), and [ops/manifest.json:1-109](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:1) do not require command execution, evidence capture, or stop-the-line behavior.
- Why it matters:
  - A phase can currently be declared complete while the repo is broken under
    the exact commands that the repo treats as non-negotiable.
- Concrete remediation:
  - Add a per-phase command matrix with exact commands, allowed filters, pass
    criteria, and blocker rules. Require outputs and the manifest to record the
    command set that was run and its result.

### High

#### H1. Temporary repo-law exceptions have no canonical home in the initiative

- Category: `inconsistency`
- Evidence:
  - [standards/effect-laws-v1.md:32-48](/home/elpresidank/YeeBois/projects/beep-effect/standards/effect-laws-v1.md:32) says `effect-laws.allowlist.jsonc` is the sole supported registry for Effect-law and runtime-boundary exceptions and requires owner, issue, reason, and optional expiry.
  - [design/non-slice-family-migration.md:75-84](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/design/non-slice-family-migration.md:75) defines compatibility aliases only for topology-path shims.
  - No initiative file references `effect-laws.allowlist.jsonc`, a law-exception ledger, or a required removal workflow for temporary code-law exceptions.
- Why it matters:
  - Large package moves often need temporary exceptions. Right now the packet
    gives agents a place to track path aliases, but no canonical place to track
    code-law deviations.
- Concrete remediation:
  - Add a law-exception section to the initiative that explicitly routes any
    temporary Effect-law or runtime-boundary exception through
    `effect-laws.allowlist.jsonc`, with owner, issue, expiry, deletion phase,
    and proof of removal.

#### H2. Slice phases do not require schema-first, typed-error, or service-boundary audits

- Category: `misalignment`
- Evidence:
  - [AGENTS.md:9-14](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md:9) requires schema-first models, typed errors, Effect modules, and explicit service boundaries.
  - [standards/effect-first-development.md:723-789](/home/elpresidank/YeeBois/projects/beep-effect/standards/effect-first-development.md:723) makes schema-first domain models, schema defaults, and schema-backed guards the expected implementation style.
  - [design/repo-memory-migration.md:38-69](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/design/repo-memory-migration.md:38) and [ops/handoffs/HANDOFF_P3.md:20-49](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P3.md:20) focus on routing, public/server/config splits, and driver extraction only.
- Why it matters:
  - `repo-memory` and `editor` can be migrated structurally while preserving
    pre-law modeling patterns, technical errors in domain code, or leaky
    service boundaries.
- Concrete remediation:
  - Add mandatory slice audit sections for domain schemas, typed errors,
    service/layer ownership, config/public/server/secrets/test contracts, and
    JSDoc/docgen status for exported APIs.

#### H3. Law-sensitive tooling and generator cutover happens too late

- Category: `better phase`
- Evidence:
  - [design/non-slice-family-migration.md:15-25](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/design/non-slice-family-migration.md:15) admits the old topology is encoded in workspaces, tsconfig paths, `docgen`, turbo filters, repo scripts such as `ui-add`, and `create-package`.
  - [package.json:55-81](/home/elpresidank/YeeBois/projects/beep-effect/package.json:55) shows those surfaces are live today, including `create-package`, `config-sync:check`, `docgen`, and `ui-add`, which still targets `packages/common/ui`.
  - [ops/handoffs/HANDOFF_P1.md:16-28](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P1.md:16) only asks to define rewrite rules, while the operational cutover is still deferred until a later phase.
- Why it matters:
  - The repo can keep generating illegal paths or missing moved packages while
    slice migration is already underway. That undercuts enforcement at the
    exact moment blast radius is highest.
- Concrete remediation:
  - Add an early enablement-execution phase, or expand P1 so it lands
    `repo-checks`, `docgen`, `create-package`, shadcn/UI script targets,
    workspace globs, and config-sync updates before P3 and P4 begin.

#### H4. The operator workflow ignores the repo's durable-memory protocol

- Category: `better process`
- Evidence:
  - [AGENTS.md:16-24](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md:16) says `graphiti-memory` is the primary durable repository knowledge base and prefers `bun run codex:hook:session-start` plus Graphiti bootstrap helpers.
  - [history/quick-start.md:3-9](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/quick-start.md:3) starts with README, SPEC, manifest, handoff, and output writing only.
  - [ops/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md:1-6](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md:1) contains no Graphiti bootstrap, recall, or writeback duty.
- Why it matters:
  - Decisions about compatibility shims, cutover blockers, and architecture
    amendments will fragment across chats and markdown instead of the repo's
    primary durable memory system.
- Concrete remediation:
  - Add standard phase bootstrap and closeout instructions: run session-start
    or equivalent Graphiti health/bootstrap, recall prior phase context, and
    write back decisions, blockers, and unresolved risks at phase end.

### Medium

#### M1. The manifest cannot record repo-law proof, blockers, or exception state

- Category: `improvement`
- Evidence:
  - [ops/manifest.json:1-109](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:1) only records phase ids, names, outputs, decisions, and open questions.
  - The quick-start explicitly tells operators to update the manifest, but the
    schema has nowhere to record command results, evidence links, blockers,
    exceptions, or memory writebacks.
- Why it matters:
  - A machine-readable initiative index that cannot say which repo-law gates
    passed is not a real enforcement surface.
- Concrete remediation:
  - Extend the manifest with per-phase `requiredCommands`, `evidence`,
    `exceptions`, `blockedBy`, `dependsOn`, `reviewStatus`, and memory
    writeback references.

#### M2. P7 verification is still architecture-centric and does not enumerate repo-law proof

- Category: `improvement`
- Evidence:
  - [design/verification-and-cutover.md:11-23](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/design/verification-and-cutover.md:11) verifies roots, metadata, subpaths, dependency directions, and generic "repo quality commands."
  - [ops/handoffs/HANDOFF_P7.md:17-25](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P7.md:17) still does not name the final command set or law-specific search audits.
  - The root repo exposes distinct verification surfaces in [package.json:57-82](/home/elpresidank/YeeBois/projects/beep-effect/package.json:57): `config-sync:check`, `check`, `test`, `lint`, `docgen`, and `audit:full`.
- Why it matters:
  - Final signoff remains subjective. The repo can pass a shallow architecture
    audit while still failing command, docgen, allowlist, or generator hygiene.
- Concrete remediation:
  - Make P7 enumerate exact final commands and search audits, including
    no-legacy-import searches, no-legacy-workspace-glob checks,
    `config-sync:check`, `check`, `lint`, `test`, `docgen`, `audit:full`,
    allowlist integrity, and JSDoc/docgen evidence.

### Low

#### L1. The reflection log is informative but too free-form to act as compliance evidence

- Category: `improvement`
- Evidence:
  - [history/reflection-log.md:1-10](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/reflection-log.md:1) is narrative-only and currently captures general learnings rather than structured evidence or standards decisions.
  - No initiative surface ties reflections to blocker state, command evidence,
    exception removal, or amendment outcomes.
- Why it matters:
  - Useful lessons may be captured, but they are not queryable or enforceable
    as proof of compliance.
- Concrete remediation:
  - Keep the reflection log, but pair it with a structured evidence and
    exception ledger referenced by the manifest and each phase output.

## Better Enforcement

- Add a repo-law compliance matrix to `SPEC.md` with rows for schema-first
  modeling, typed errors, Effect laws, service boundaries, JSDoc/docgen,
  quality commands, allowlist usage, Graphiti workflow, and generator/script
  targets.
- Require every phase output to include: changed surfaces, commands run, search
  audits, exceptions introduced, blockers, evidence links, Graphiti writeback,
  and a readiness statement.
- Move operational enforcement updates earlier so `repo-checks`, `docgen`,
  scaffolders, shadcn/UI scripts, workspace globs, and config-sync stop
  recreating the old topology before slice migration starts.
- Track compatibility aliases and repo-law exceptions as separate ledgers. Both
  need owner, reason, issue, expiry, deletion phase, and proof of removal.
- Convert orchestrator prompts from generic instructions into executable gate
  checklists with named commands, required outputs, and explicit blocker rules.

## Required Remediations

1. Expand `SPEC.md` success criteria into a full repo-law compliance matrix,
   not just an architecture-shape checklist.
2. Add per-phase command gates with exact commands, expected filters, evidence
   capture, and stop-the-line rules.
3. Add canonical handling for temporary Effect-law and runtime-boundary
   exceptions via `effect-laws.allowlist.jsonc`.
4. Move enforcement-sensitive tooling updates earlier: `repo-checks`,
   `docgen`, `create-package`, shadcn/UI script targets, workspace globs,
   config-sync, and related generator surfaces.
5. Add schema-first, typed-error, service-boundary, and JSDoc/docgen audits to
   the slice phases.
6. Add Graphiti bootstrap and writeback requirements to quick-start, prompts,
   and phase closeout.
7. Extend the manifest so it can record evidence, blockers, exceptions, and
   review state.
8. Make P7 enumerate the exact final verification suite, including repo-law
   searches and command proofs.

## Residual Risks

- Even with these remediations, the repo still needs a fresh baseline scan to
  discover package-by-package law debt before claims of "0 issues" are
  credible.
- Large package moves may expose temporary JSDoc, allowlist, or typed-error
  debt in places the initiative has not yet enumerated.
- If enforcement tooling is not cut over before slice work, later proof may be
  contaminated by stale path assumptions.

## Verdict

The initiative is a useful architecture bootstrap packet, but it is not yet an
acceptable plan for getting this repo to full repo-law-complete compliance.
Right now it can plausibly achieve topology convergence without proving
effect-first, schema-first, quality-command, exception-governance, and
durable-memory compliance.

## Required Changes Checklist

- [ ] Add a repo-law compliance matrix to `SPEC.md` and phase gates.
- [ ] Add per-phase command matrices and stop-the-line rules.
- [ ] Add `effect-laws.allowlist.jsonc` exception governance to the initiative.
- [ ] Move `repo-checks`, `docgen`, scaffolders, and script cutovers ahead of slice migration.
- [ ] Add schema-first, typed-error, service-boundary, and JSDoc/docgen audits to P3 and P4.
- [ ] Add Graphiti bootstrap and writeback duties to quick-start and prompts.
- [ ] Extend `ops/manifest.json` to record evidence, blockers, and exceptions.
- [ ] Expand P7 into an explicit repo-law verification suite.

# Quality Safety Semantics

## Current-State Findings

- Phase 0 is correctly scoped as read-only research: the initiative explicitly
  says no quality command behavior changes belong in the first proof.
- Ownership is aligned with doctrine: quality acceleration belongs to `tooling`,
  primarily `packages/tooling/tool/cli`, plus workflow/Turbo orchestration. It
  must not move into `shared`, `foundation`, drivers, or product slices:
  `initiatives/repo-quality-acceleration/SPEC.md:27-35`.
- PR checks may be tiered when every relaxation names its full fallback proof.
  Current PR CI already tiers `lint`, `check`, `test`, and affected `docgen`
  through Turbo `--affected`; `docgen` can also skip irrelevant changes or force
  full when docgen tooling changed.
- Full push/main proof is still required for complete build, all-up
  lint/check/test/docgen, repo sanity, export catalog drift, security scans,
  Nix, SAST, and secrets.
- `lint --affected` and `check --affected` are safer than pure affected lanes
  today: repo-cli keeps repo-wide policy checks and tsgo sidecars unless an
  explicit package filter or `--since` is passed.
- Hard-failure warnings are mixed:
  - Hard today: docgen generation failures, docgen missing metadata via
    `docgen check`, stale repo export catalog, strict Effect law failures,
    package-test-import violations, schema-first/tooling policy violations,
    circular dependency findings, security/Nix/SAST nonzero exits.
  - Soft today but semantically should remain defects on changed surfaces:
    JSDoc ESLint warning rules, TSDoc syntax warnings, docgen fence warnings,
    and `docgen quality` warn/fail tiers.
- Current drift risk is not wrong package ownership; it is duplicated quality
  semantics across workflow YAML, root scripts, repo-cli task adapters, docgen
  commands, and policy-pack ESLint config.

## Evidence

Source evidence:

- Initiative mission permits PR tiering only with preserved full proof:
  `initiatives/repo-quality-acceleration/SPEC.md:21-25`.
- Initiative ownership forbids routing quality semantics through
  shared/foundation/slices:
  `initiatives/repo-quality-acceleration/SPEC.md:27-35`.
- Phase 0 must remain read-only:
  `initiatives/repo-quality-acceleration/README.md:28-37`,
  `initiatives/repo-quality-acceleration/SPEC.md:90-91`, and
  `initiatives/repo-quality-acceleration/SPEC.md:127-136`.
- Architecture doctrine routes repo operations, generators, policy packs, and
  automation to tooling: `standards/ARCHITECTURE.md` and
  `standards/architecture/07-non-slice-families.md`.
- PR workflow uses affected Turbo scopes:
  `.github/workflows/check.yml:155-160`.
- PR docgen gates are already selective:
  `.github/workflows/check.yml:115-130` and
  `.github/workflows/check.yml:181-190`.
- Push-only build exists: `.github/workflows/check.yml:207-236`.
- Root scripts route through repo-cli/Turbo: `package.json:75-96`.
- Repo-cli affected check still adds repo-wide dtslint/test tsgo and smoke
  checks unless explicitly scoped:
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:420-423` and
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:749-763`.
- Repo-cli affected lint still adds repo-wide policy checks unless explicitly
  scoped: `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:792-821`.
- `docgen quality` is report-only/advisory and does not set nonzero exit for
  warning/fail tiers:
  `packages/tooling/tool/cli/src/commands/Docgen/index.ts:670-725`.

## Candidate Interventions

| Rank | Intervention | Expected Impact | Risk | Cost | Verification |
|---:|---|---:|---|---|---|
| 1 | Add a tooling-owned quality gate semantics map in `@beep/repo-cli` that names PR tier, push/main proof, scheduled/full proof, hard failures, and soft/advisory lanes. | High: removes semantic drift across YAML/scripts/docgen. | Medium: wrong central model could overfit current CI. | Medium | Unit tests for lane classification; workflow dry-run/diff; `bun run check --filter=@beep/repo-cli`; focused repo-cli tests. |
| 2 | Add changed-surface warning enforcement for docs/JSDoc, separate from repo-wide historical warning debt. | High: matches SPEC without turning old warnings into instant blockers. | Medium: changed-file mapping must be precise. | Medium | Fixture with changed exported symbol warning; verify nonzero on changed-surface warning and zero on untouched historical warning. |
| 3 | Name the canonical full proof explicitly, either as split push workflow plus scheduled `audit:github pre-push`, or as a single full CI job. | High: every PR relaxation has an auditable fallback. | Low-medium: may add CI cost. | Small-medium | Push/main run proves all full lanes; scheduled/workflow_dispatch run records `audit:github pre-push` or equivalent. |
| 4 | Preserve repo-wide policy sidecars in `lint --affected` and `check --affected`; only skip them for explicit package filters with documented fallback. | Medium-high safety. | Low: current behavior already does this. | Small | Keep or extend quality task tests for affected lint/check sidecars. |
| 5 | Move PR docgen skip/affected/full decision into tooling-owned logic or a tested script, leaving workflow YAML as orchestration. | Medium: safer docgen selectivity and easier review. | Medium: stale generated docs if changed-file predicates are incomplete. | Medium | Fixture tests for no-op docs, package source, package `docgen.json`, and docgen implementation changes. |
| 6 | Consider changed-file SAST on PR only if full SAST remains on push/main or schedule. | Medium PR speed improvement. | Medium-high: Semgrep can catch cross-file patterns. | Medium | Compare changed-file SAST output against full SAST on recent runs before adopting. |
| 7 | Keep `docgen quality-worker-eval` advisory-only and publish outputs as triage packets, not required checks. | Medium review quality, low gate risk. | Low | Small | Worker eval reports generated read-only; no required workflow depends on model output. |

## Do Not Do

- Do not move quality gate semantics into `shared`, `foundation`, drivers, or any
  product slice.
- Do not remove full push/main or scheduled proof and rely only on PR affected
  lanes.
- Do not make all historical docs/JSDoc warnings hard failures in one step; gate
  changed-surface warnings first.
- Do not remove repo-wide policy sidecars from affected `lint` or `check` merely
  because Turbo supports `--affected`.
- Do not make `docgen quality` or worker/model scoring a required gate without a
  deterministic fallback.
- Do not add write-mode codegen/formatting behavior to Phase 0.

## Open Questions

- Should PRs add an affected build lane for app/package changes, or is push-only
  build intentionally accepted?
- What is the named canonical full proof: split push workflow,
  `bun run audit:github quality`, or `bun run audit:github pre-push`?
- Should JSDoc/TSDoc warnings hard-fail only on changed files in PRs, but all
  files on scheduled/full proof?
- Should PR SAST remain full-action, or move to repo-cli changed-file mode with
  full scheduled fallback?
- Should affected docgen aggregation stay full-root aggregate, or gain an
  affected/package aggregate mode?
- Which non-code changes should trigger docgen: all Markdown, only package docs,
  standards docs, or docgen config/tooling changes only?

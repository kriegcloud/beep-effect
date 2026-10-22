# Repository Rating — beep-effect (2026-10-21)

**Overall: 8/10.** Elite, machine-enforced engineering discipline that is
increasingly taxed by the weight of its own machinery. The code, types,
architecture, and CI are close to exemplary. Almost every deduction below is
not "this is sloppy" but "this is so heavily governed that humans and agents
pay a coordination tax to move."

## Method

Eight parallel auditors (agent-friendliness, architecture/modularity,
type-safety/schema, testing, CI/CD, documentation, DX/tooling,
maintainability) each opened the bodies they cite. Counts come from actual
`rg` / `wc` / `git ls-files` runs in the audit session, not estimates. The
maintainability and security scores were verified directly by the
orchestrating session (see Disclosure). Scores are on a 1–10 scale per
dimension; the overall is the mean (87.5 / 11 ≈ 7.95, rounded to 8).

## Scorecard

| Dimension | Score | One-line verdict |
| --- | --- | --- |
| Agent friendliness | 7/10 | Elite infra, verbose prefix |
| Architecture | 9/10 | Codified and enforced |
| Modularity | 8/10 | Small slices, wide sprawl |
| Type safety | 9/10 | Near-zero escape hatches |
| Schema-first / Effect | 9.5/10 | Exemplary, bounded casts |
| Testing | 8.5/10 | Scale plus ratchet, soft floors |
| CI/CD & quality gates | 8.5/10 | Tiered, secure, slow |
| Documentation | 7/10 | Governed, overwhelming volume |
| DX / tooling | 6/10 | One CLI, steep magic burden |
| Maintainability | 6.5/10 | Too many mega-files |
| Security / secrets | 8.5/10 | Strong scanning, S11 bypass |

## 1. Agent friendliness — 7/10

- (+) Single source of truth: `CLAUDE.md` is a symlink to
  [AGENTS.md](../../../AGENTS.md); Claude and Codex cannot diverge.
- (+) Discoverable routing: the Touch → Skill/Command table in `AGENTS.md`
  maps "new package", "schemas", "PR publish" to exactly one command or
  skill; Discovery & Reuse forbids recreating helpers before searching
  `packages/**/src/**`.
- (+) `graft` (`.agents/skills/graft/SKILL.md`): 6 tools, a scenario→tool
  table, "most tasks need one call". Genuinely agent-optimised.
- (+) Prose is backed by code: the `beep` CLI registers `session`, `skills`,
  `yeet`, `graft` plus ~40 command groups; `.claude/settings.json`
  pre-approves 82 safe `Bash(...)` calls and denies force-push /
  `reset --hard`.
- (−) Always-loaded prefix: `AGENTS.md` is 546 lines / 33,367 bytes, restates
  the model pins three times, and duplicates them again in the 624-line
  `docs/runbooks/agent-pools.md` — violating its own prompt-cache warning.
- (−) Skill-corpus inconsistency: 36 skills, 7,403 lines; `yeet` (495),
  `ontology-foundational-auditor` (499), `portless` (489) sit hard against
  the "<500 lines" law, and most lack the `license` / `compatibility` /
  `allowed-tools` keys that law requires.
- (−) Stale pins that misroute agents: `.agents/skills/graft/SKILL.md` still
  names `claude-opus-5` (superseded per `AGENTS.md`), and
  `docs/runbooks/agent-pools.md` still offers `gpt-5.6-sol-xhigh` /
  `grok-4.6` seats.
- (−) Cache friction: `graft/` is 5,765 markdown nodes, 854 MB, git-ignored;
  cards lag edits and paths vanish after a branch switch.

## 2. Architecture — 9/10

- (+) A real constitution: [standards/ARCHITECTURE.md](../../../standards/ARCHITECTURE.md)
  defines hexagonal vertical slices, "Ports Point Inward"
  (`ui -> client -> use-cases -> domain`), and an explicit forbidden list
  (`domain` ↛ `config`/`drivers`/`server`, slice ↛ `tooling`).
- (+) Enforcement, not intention: `.fallowrc.jsonc` (606 lines), a 4,875-line
  generated boundaries file covering 170 `@beep` zones, `import/no-cycle:
  error`, `lint:circular`, `ecosystem-polarity`.
- (+) Sampled conformance: `packages/documents/` has exactly `domain`,
  `use-cases`, `server`, `tables`; its domain depends only on
  `@beep/{identity,rdf,schema,shared-domain,utils}` plus `effect`.
- (−) Target-first constitution: `ARCHITECTURE.md` admits wildcard exports
  "may remain during migration" and `shared/{client,server,ui}` "do not
  exist yet". The document describes the destination more accurately than
  the current tree.
- (−) Manual topology upkeep: slice workspaces are enumerated one by one in
  the root `package.json` instead of globbed like `drivers/*`. Adding a
  slice role edits the root manifest and regenerates 4,875 boundary lines.

## 3. Modularity — 8/10

- (+) 118 workspace packages, each `@beep/<slice>-<role>` with explicit
  `/public|/server|/test` subpaths and a minimal-package rule.
  `packages/architecture-lab/` plus `apps/architecture-lab-proof` are
  executable examples, not just prose.
- (+) Build modularity: `turbo.json` tasks depend on `^build`/`^transit`
  with shared `$TURBO_ROOT$` inputs.
- (−) Sprawl: 118 packages, 170 boundary zones, `workspace:^` everywhere.
  `packages/ecosystem/` (required `@beep/*`-free) contains exactly one
  package, `effect-drizzle`. External extraction is the documented
  exception, not the lived reality.
- (−) Barrel leakage: sampled `src/index.ts` files use
  `export * from "./aggregates/Document/index.ts"`, bypassing the
  explicit-subpath contract the architecture is built on.

## 4. Type safety — 9/10

- (+) Maximum strictness in `tsconfig.base.json`: `strict`,
  `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
  `noUnusedLocals/Parameters`, `noImplicitOverride/Returns`,
  `verbatimModuleSyntax`, `allowJs: false`; ~100
  `@effect/language-service` diagnostics at `error`.
- (+) Near-zero escape hatches across 3,670 `src` files: `@ts-ignore` = 0,
  `@ts-nocheck` = 0, `: any` in code = 0, `as any` in code = 0.
  `@ts-expect-error` = 2, both for React type friction in
  `packages/foundation/ui-system/ui/src/components/speech-input.tsx`.
- (−) Remaining casts: `as unknown as` on 21 code lines (e.g.
  `packages/shared/domain/src/entity/EntityKit.ts`,
  `packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts`),
  concentrated at driver/metaprogramming boundaries but un-audited.
- (−) Deliberate gate-weakening: `skipLibCheck: true` and Effect
  suggestions/warnings ignored in the exit code. Justified by the
  `@stability unstable` policy, but the compiler gate is softer than the
  `strict` banner suggests.

## 5. Schema-first / Effect idiomaticity — 9.5/10

- (+) Schemas are the domain model: `S`-based entity classes
  (`packages/shared/domain/src/entities/User/User.model.ts`), `S.Opaque` +
  brands + `LiteralKit.toTaggedUnion` verdicts
  (`packages/shared/use-cases/src/PromotionGate/PromotionGate.schema.ts`),
  closed `Effect<PromotionGateVerdict>` services with typed E/R channels.
- (+) Scale of adoption: `effect/Schema` in 2,069 files, `S.TaggedError` in
  331 files, `Context.Service` in 275 files.
- (+) Enforced leaf imports: `from "effect"` (barrel) = 0 in `src`;
  `from "effect/<Module>"` ≈ 22,259 matches across 2,590 files, gated by
  `beep laws effect-imports`.
- (−) The half-point: cast residue above, plus
  `apiStabilityLeak`/`unstableApiUsage` diagnostics switched off. Using
  unstable Effect APIs is a defensible bet; a future Effect bump collects
  on it in many files at once.

## 6. Testing & verification — 8.5/10

- (+) Scale: 3,986 `src` files against 1,508 `test/**/*.test.*` files, 167
  per-package `vitest.config.ts`. Only `apps/storybook` lacks tests.
- (+) Behaviour tests via `@beep/*` aliases (e.g.
  `packages/shared/domain/test/LocalDate.test.ts` tests round-trips and
  Feb-30/leap-year rejection), fast-check property tests with
  `effect/Arbitrary`, shared helpers in `packages/tooling/test-kit/`.
- (+) Coverage ratchet: global thresholds deliberately `undefined` in
  `vitest.shared.ts`; fail-on-drop against a 1.3 MB regression baseline
  (`standards/coverage.regression-baseline.jsonc`, 70/50/60, epsilon 0.001).
- (−) Empty-suite masking: 121 `package.json` files contain
  `passWithNoTests`. A package that silently loses its tests stays green
  outside the coverage ratchet.
- (−) Sparse absolute floors: only 9 packages set their own thresholds;
  fail-on-drop happily preserves low absolute coverage forever.
- (−) Root-config blind spot: `vitest.config.ts` globs miss 51 configs at
  depth 5 (e.g. `packages/foundation/capability/chalk/vitest.config.ts`).
  Bare root `vitest` silently skips them; only the `beep-cli test` / Turbo
  path is complete.

## 7. CI/CD & quality gates — 8.5/10

- (+) Tiering across 13 workflows: `.github/workflows/check.yml` Tier 1 on
  every PR, then an admission job gates `.github/workflows/heavy.yml`
  (8 lanes, Check 120 min, Effect Diagnostics 90 min, Coverage, Docgen,
  Doctest, Build) on self-hosted runners.
- (+) Merge gate stricter than GitHub: no outstanding review thread, no
  failing CI (except rate-limited Vercel), squash commitlint, 20-minute
  review window; unknown window = blocked. `yeet ready` has no `--force`.
- (+) Supply-chain hygiene: gitleaks pinned by sha256 with a base-branch
  config a PR cannot weaken, OSV scan, dependency-review denying AGPL/GPL,
  Semgrep SAST, commitlint; `permissions: contents: read`, SHA-pinned
  actions, `persist-credentials: false`. Local `lefthook` mirrors the gates.
- (−) The S11 bypass: `AGENTS.md` allows merging over failing required jobs
  when the owner calls the PR final, with attribution and a same-day fix
  promise as the only safeguard. Every other gate is un-bypassable; this
  one is a standing, documented override.
- (−) Warn-only drift: Shadcn Lint / Property Laws explicitly non-required;
  4 of 6 `.oxlintrc.json` rules warn-only; Biome a11y off,
  `noConsole`/`noExplicitAny` at warn. The gate advertises more coverage
  than it enforces.
- (−) Cost: `check.yml` 1,204 lines, `turbo.json` 1,465 lines; Heavy only
  starts after a label/flip. Certainty is thorough and slow.

## 8. Documentation — 7/10

- (+) Strong front door: `README.md` (vision, honest surface table, rules,
  run commands), `docs/README.md` tracked-vs-ignored law,
  `research/README.md` (immutable packets, `claims.jsonl` as truth).
- (+) Enforced JSDoc: `.patterns/jsdoc-documentation.md` bans
  `@example`/`@remarks`, requires titled `**Example** (Title)` sections;
  6,219 `src` files contain titled Examples; docgen is a CI lane.
- (−) Volume defeats navigation: `git ls-files '*.md'` = 8,432, of which
  `goals/` + `explorations/` = 6,789 against 80 tracked in `docs/`. On
  disk, 3,825 of 3,902 `docs/**/*.md` are git-ignored generated output.
  Finding the documentation requires already knowing which is real.
- (−) Duplication/staleness: Prose-to-Proof restated in the README, four
  `PROSE_TO_PROOF_*.md` files, and `docs/product/prose-to-proof.md`;
  `README.md` still names `claude-opus-5` as the deep tier (superseded).
- (−) Admitted JSDoc debt: `standards/jsdoc-documentation.inventory.md`
  (2026-10-21) records 163 packages, 81 needing remediation, 1,386 open
  exports. Credit: forbidden tags = 0, missing `@category`/`@since` = 0.

## 9. DX / tooling — 6/10

The lowest score, and the one a new human feels first.

- (+) Single entrypoint: 111 root scripts collapse to one idea — `beep`
  (`bun run packages/tooling/tool/cli/src/bin.ts --`) with
  `build`/`check`/`test`/`lint`/`coverage` aliased to `beep-cli …`.
  `bun run beep create-package` is the only sanctioned package bootstrap
  and emits the manifest scripts, tsconfig overlays, and per-package
  `turbo.json` (without which Turbo warns about missing outputs).
- (+) Portless dev servers (`<name>.beep.localhost:1355`, no raw `vite` on
  numeric ports) and the 1Password `op` shim lane (one automation
  credential, exit 78 instead of a desktop prompt).
- (−) Learning cliff: before ordinary work, a newcomer must learn the
  `beep` CLI, generated package scripts (hand-edits rejected by
  `beep lint package-scripts`), Turbo input fingerprints, portless, the
  `tsc-rs`/`@effect/tsgo` patch stack, fallow boundary regeneration, and
  the 1Password lane rules. None are industry-standard; all are
  load-bearing. Bus-factor risk concentrates in
  `packages/tooling/tool/cli`.
- (−) Generated-file churn as a daily tax: `beep:preflight` runs
  `tsconfig-sync`, `fallow:boundaries:write`, `jsdoc:inventory`, and three
  `lint --write` passes. Installers/generators rewrite files you did not
  name; the repo's own laws warn against its tooling's side effects.

## 10. Maintainability & complexity — 6.5/10

- (+) Near-zero rot markers: `TODO|FIXME|HACK` in `packages/**/src` = 0
  (67 in the whole tree including tests/docs) across ~670k `src` lines.
  Active refactoring waves in recent history (e.g. effect-string wave 2:
  145 sites, 24 packages). Fallow audit/dead-code/health run as blocking
  CI envelopes with baselines.
- (−) Mega-files (handwritten, generated excluded):
  `packages/foundation/modeling/html/src/Html.model.ts` 11,419 lines;
  `packages/tooling/tool/cli/src/commands/Corpus/internal/RestorationTransformations.ts`
  5,327; `packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts` 5,225;
  `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts`
  4,458. Vocabulary tables mitigate some; a 5k-line CLI command file is
  where bugs go to hide.
- (−) Generated mass inside `src`: `iana-media-types.ts` 49,333 lines; two
  ACP generated schemas ~17k lines each, under `src/generated` /
  `src/_generated`. They inflate every search, every graft build (already
  854 MB), and every size audit.
- (−) Meta-complexity: a 4,875-line generated boundary file, a 1,465-line
  `turbo.json`, a 1,204-line `check.yml`, a 1.3 MB coverage baseline, and
  a CLI whose job is partly to keep the other generated files consistent.
  Each layer is justified; the stack of layers is the risk — when the
  tooling breaks, it breaks the ability to fix the tooling.

## 11. Security / secrets — 8.5/10

- (+) Scanning depth: gitleaks (anti-bypass base config), OSV,
  dependency-review with licence denial, Semgrep, in CI and on staged
  files locally; SHA-pinned actions, no persisted credentials, read-only
  token by default.
- (+) Secret model: agents resolve `op` from `PATH` through a shim loading
  exactly one automation credential; secrets referenced as `op://`
  strings, never copied into files; the D11 boundary keeps client
  documents and secrets out of Cursor/Junie lanes.
- (+) Pre-approved guardrails deny force-push and hard reset outright
  rather than relying on agent judgement.
- (−) S11 again: merging over red required jobs — security jobs included —
  on an owner's say-so is a security-relevant hole, however
  well-attributed. The same-day fix owner is a promise, not a control.
- (−) Trusted-surface size: 82 pre-approved `Bash(...)` patterns, a custom
  CLI with ~40 command groups and repo write access, systemd-timer
  installers, and a local proxy holding multiple OAuth credentials. Each
  is individually reasoned; collectively the workstation is a high-value
  target and this public repo documents its shape in detail.

## Where the next point of effort goes

1. **Shrink the always-loaded prefix.** Collapse the triple-stated model
   pins in `AGENTS.md` to one manifest table; delete the duplicated
   volume-pool prose from `docs/runbooks/agent-pools.md`; fix the three
   stale model names (`claude-opus-5` in the graft skill and README,
   `gpt-5.6-*`/`grok-4.6` in the runbook seat map). Raises agent
   friendliness and documentation together; it is a deletion, not an
   addition.
2. **Close the two silent-green holes.** Remove `passWithNoTests` from
   packages that have tests (121 files carry it today), and add the
   depth-5 packages to the root `vitest.config.ts` globs. Testing moves
   8.5 → ~9.5 with no new infrastructure — only removing ways it can lie.
3. **Split the four handwritten mega-files** (`Html.model.ts`,
   `RestorationTransformations.ts`, `JSDoc.ts`, `Quality.command.ts`) and
   move generated registries out of `src`. Maintainability holds the
   overall score down and is the cheapest dimension to improve.

## Disclosure

The audit's final synthesis step was truncated in delivery, and the
maintainability auditor's structured report did not arrive intact. The
maintainability (§10) and security (§11) scores were therefore verified
directly by the orchestrating session with the `wc` / `rg` / `git` runs
quoted there. The other nine dimensions are the auditors', spot-checked
against the files they cite. The audit's first launch failed because the
workflow pinned `claude-opus-5-5` children in a session whose catalog only
offered the session model. That is an availability failure of the session
catalog, not a stale pin (`claude-opus-5-5` is the current Claude child pin
in `AGENTS.md`), so it is recorded here and not counted as §1 evidence.

Review corrections (PR #1996), the only content departures from the audit
text beyond the link rebasing SOURCES.md notes: the §10 mega-file list
dropped a fifth row, `packages/drivers/firecrawl/src/Firecrawl.models.ts`
(5,157 lines), which names a file that does not exist in the tree; and the
launch-failure note above replaced the audit's wording, which had counted it
as §1 evidence.

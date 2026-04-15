# Effect Governance Replacement - P0 Research

## Status

**COMPLETED**

## Objective

Map the credible replacement landscape for the Effect-specific `beep-laws` / ESLint governance lane without changing repo behavior outside this spec package.

## Scope Guardrails

- Primary target: replace the Effect-specific governance lane.
- Secondary target: keep the JSDoc and TSDoc lane separate unless a later phase finds a shared mechanism that directly supports the primary target.
- P0 through P2 remain read-only outside this spec package.
- P0 captures verified facts and clearly labeled parity or fit hypotheses. Validation belongs to P1.

## Claim Types

- `Verified`: directly supported by repo code, repo config, tests, or official vendor docs.
- `Inference`: a parity, feasibility, or fit hypothesis derived from the verified evidence and queued for P1 validation.

## Evidence Base

### Repo-local sources

- `tooling/configs/src/eslint/ESLintConfig.ts`
- `tooling/configs/src/eslint/EffectImportStyleRule.ts`
- `tooling/configs/src/eslint/NoNativeRuntimeRule.ts`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `tooling/configs/src/eslint/TerseEffectStyleRule.ts`
- `tooling/configs/src/eslint/EffectLawsAllowlist.ts`
- `tooling/configs/test/eslint-rules.test.ts`
- `tooling/configs/test/effect-first-regressions.test.ts`
- `tooling/cli/src/commands/Laws/index.ts`
- `tooling/cli/src/commands/Laws/EffectImports.ts`
- `tooling/cli/src/commands/Laws/TerseEffect.ts`
- `tooling/cli/src/commands/Lint/SchemaFirst.ts`
- `package.json`
- `turbo.json`
- `.github/workflows/check.yml`
- `.claude/hooks/README.md`
- `.claude/hooks/pattern-detector/core.ts`
- `.claude/hooks/agent-init/index.ts`
- `.claude/hooks/subagent-init/index.ts`
- `.claude/hooks/skill-suggester/index.ts`
- `.claude/patterns/README.md`
- `.claude/rules/agent-instructions.md`
- `.codex/config.toml`
- `.codex/agents/README.md`
- `tooling/cli/src/commands/Codex/internal/CodexSessionStartRuntime.ts`
- `packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts`
- `packages/repo-memory/store/src/RepoSymbolStore.ts`
- `standards/effect-laws.allowlist.jsonc`

### External reference repo

- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/README.md`
- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/ROADMAP.md`
- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/bin/linteffect.mjs`
- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/configs/*.jsonc`
- representative rules under `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/rules/*.grit`

### Official docs consulted

- Biome linter plugins: <https://biomejs.dev/linter/plugins/>
- Claude Code hooks: <https://code.claude.com/docs/en/hooks>
- Codex hooks: <https://developers.openai.com/codex/hooks>
- Codex `AGENTS.md`: <https://developers.openai.com/codex/guides/agents-md>

## Verified Current Effect-Specific Governance Surface

### 1. Root ESLint lane

Verified:

- The repo registers a root `beep-laws` ESLint plugin with four custom rules: `effect-import-style`, `no-native-runtime`, `schema-first`, and `terse-effect-style`.
- The broad flat-config block applies all four as `warn` across `apps`, `packages`, `tooling`, `infra`, and `.claude/hooks`.
- Narrower override blocks escalate `schema-first` to `error` in selected `tooling/cli` and `tooling/repo-utils` files, and escalate `no-native-runtime` to `error` in an enumerated hotspot file list.
- The repo keeps the JSDoc or TSDoc lane separate in the same ESLint config through `eslint-plugin-jsdoc`, `eslint-plugin-tsdoc`, and `beep-jsdoc/require-category-tag`.

Implication:

- The current primary target is already a distinct governance lane with separate rules, scopes, severities, and CI entrypoints. That makes replacement tractable without forcing a JSDoc or TSDoc rewrite into the same phase.

### 2. Rule-by-rule reality

Verified:

- `effect-import-style` enforces canonical namespace aliases for selected `effect/*` helper modules and prefers root `effect` imports for other stable submodules.
- `no-native-runtime` is the only `problem`-typed rule and combines broad native-runtime bans with stricter hotspot-only checks inside the rule body.
- `schema-first` is conservative and only flags exported pure-data interface or type-literal shapes.
- `terse-effect-style` is intentionally narrow. It only inspects expression-bodied arrow functions and targets trivial helper wrappers, passthrough `pipe(...)` callbacks that should use `flow(...)`, and shared literal thunk helpers.

Important nuance:

- The current lane is not just “idiomatic Effect linting.” It mixes import hygiene, runtime primitive bans, schema-first modeling, and terse helper style.

### 3. Allowlist and companion governance

Verified:

- `EffectLawsAllowlist.ts` is snapshot-backed and suppresses allowlisted findings by exact `rule + file + kind`.
- `effect-import-style`, `no-native-runtime`, and `terse-effect-style` use the allowlist reporter. `schema-first` does not.
- The repo also ships non-ESLint companion commands:
  - `bun run beep laws effect-imports --check|--write`
  - `bun run beep laws terse-effect --check|--write`
  - `bun run beep laws allowlist-check`
  - `bun run beep lint schema-first`
- `lint schema-first` is already inventory-based and broader than the narrow ESLint `schema-first` rule in some ways.

Implication:

- Replacement does not need to preserve a purely ESLint-shaped surface. The repo already tolerates hybrid governance where lint, inventory checks, and codemod-like checks coexist.

### 4. CI and performance-relevant wiring

Verified:

- `package.json` includes `lint:effect-laws`, `lint:effect-laws:strict`, `check:effect-laws-allowlist`, and `lint:schema-first`.
- `.github/workflows/check.yml` runs `lint:effect-laws` in the `lint` job, and runs `check:effect-laws-allowlist` plus `lint:schema-first` in `repo-sanity`.
- The workflow shown does not run `lint:effect-laws:strict`.
- ESLint remains a direct root dependency and a first-class part of the repo quality pipeline.

Implication:

- Removing the Effect-specific ESLint lane could meaningfully shrink a CI choke point, but any replacement must preserve three things:
  - broad default-path steering,
  - hotspot-strength enforcement where needed,
  - exception and inventory handling.

## Verified Repo-Native Steering Surfaces Beyond ESLint

| Deployment Surface | Default Path | Enforceable | Verified Role In Repo | P0 Take |
|---|---|---|---|---|
| Root ESLint `beep-laws` lane | Yes | Yes | Current Effect-specific governance lane | Existing baseline to replace |
| `beep laws` ts-morph check/write commands | Opt-in unless wired into CI | Yes for invoked scope | Exact check or rewrite for imports and terse wrappers | Strong parity support for some rules |
| `beep lint schema-first` inventory command | Yes via root lint or repo-sanity | Yes | Repo-wide schema-first inventory enforcement | Likely primary replacement for `schema-first` |
| Claude `pattern-detector` + `.claude/patterns` | Default for Claude sessions using project hooks | Yes on `PreToolUse`, advisory on `PostToolUse` | Repo-authored regex or glob policies with `context`, `ask`, and `deny` | Strong steering surface, especially for tool-call governance |
| Claude `agent-init`, `subagent-init`, `skill-suggester` | Default for Claude sessions using project hooks | Advisory | Inject context, posture, skill hints, and module context | Useful steering, weak parity by itself |
| Codex `SessionStart` hook runtime | Repo-local helper exists now | Advisory in current repo | Graphiti-first startup context for Codex | Useful early steering, not enough alone |
| Official Codex hooks surface | Default only when configured by users or repo | Mixed, but current `PreToolUse` is Bash-only | Supports `SessionStart`, `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop` | Real surface, but current tool interception is narrower than Claude |
| `AGENTS.md`, skills, and subagent registry | Default once present and project trusted | Advisory | Shape prompt and delegation behavior | Important steering layer, weak parity alone |
| Repo-memory index and symbol store | Opt-in | No direct policy execution shown | Deterministic index, search, import-edge lookup | Strong substrate for retrieval or recommendation tooling |
| External `linteffect` Biome pack | Default once installed and extended in `biome.jsonc` | Yes | Grit-based diagnostics for Effect code shape | Credible seed, not drop-in replacement as-is |

## Official-Docs Notes That Matter For Fit

Verified from official docs:

- Biome’s current plugin story is Grit-based and diagnostic-first. The official plugin docs describe matching code patterns in `.grit` files and registering diagnostics through `register_diagnostic(...)`.
- Claude Code hooks support `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, and richer tool interception than the current repo implementation is using. The official docs show `PreToolUse` can allow, deny, ask, defer, update tool input, and add context across many tool names, including MCP tools.
- Codex hooks are real and documented, but the official hooks docs currently describe `PreToolUse` and `PostToolUse` as Bash-only in the current runtime. `UserPromptSubmit` and `SessionStart` are more broadly useful today than `PreToolUse` for source-shape steering.

Inference:

- Claude hooks are a stronger immediate candidate than Codex hooks for repo-authored policy enforcement on agent behavior.
- Codex hooks are still useful, but today they appear better suited to startup and prompt steering than to comprehensive source-pattern enforcement.
- Biome is credible for fast diagnostics, but P0 did not verify any official built-in rewrite or assist surface that would replace the repo’s current `--write` helper commands by itself.

## External Reference Repo: `biome-effect-linting-rules`

Verified:

- The repo is packaging a Biome Grit rule pack for Effect code shape, with preset exports and a `check` CLI.
- The implemented product is diagnostics-first. The current CLI supports `check`, not `rewrite`.
- The README and roadmap are not perfectly aligned with implementation:
  - the roadmap says `core` should be the default preset,
  - the package currently exports the root entrypoint to `full`,
  - the roadmap proposes rewrite commands that are not implemented in the current CLI.
- The rule pack appears strongest on flat composition, explicit sequencing, readable control flow, React or web Effect usage, and type-shape lanes.

Inference:

- This repo is a credible packaging or design reference for a faster Effect-first Biome lane.
- It is not verified as a turnkey drop-in replacement for the current `beep-laws` surface, especially where `beep-laws` covers import alias governance, allowlist-backed runtime bans, and repo-specific schema or inventory policy.

## Rule-by-Rule Parity Hypotheses

These are P0 hypotheses, not validated P1 claims.

| Current Rule | Strongest Credible Replacement Hypothesis | P0 Parity Hypothesis |
|---|---|---|
| `effect-import-style` | Keep or expand the existing `beep laws effect-imports` check or write command, optionally shadowed by a local Biome diagnostic for faster default feedback | Exact parity looks credible through the existing CLI surface; Biome alone is unverified |
| `no-native-runtime` | Repo-local Biome diagnostics for broad cheap feedback, plus a focused allowlist-backed hotspot checker or retained repo-local policy runner | Partial parity from Biome alone looks credible; full parity likely requires a hybrid surface |
| `schema-first` | Promote the existing inventory-based `beep lint schema-first` lane to the primary source of truth | Exact or better-than-current parity looks credible because the inventory command is already repo-wide and CI-wired |
| `terse-effect-style` | Keep or expand the existing `beep laws terse-effect` CLI for exact current rewrites, and use Biome for broader idiomaticity steering | Exact current-fixture parity looks credible through the CLI; broader idiomaticity steering is strongest with Biome added |

## Candidate Landscape Grouped By Deployment Surface

### A. Fast default-path diagnostics

1. Repo-local Biome or Grit rule pack dedicated to this repo.
2. External `linteffect` seed plus repo-local overlays.
3. Hybrid Biome shadow mode before cutover.

Why this lane matters:

- It is the most credible replacement for ESLint’s broad default-path steering.
- It directly addresses the user’s performance concern because Biome is cheaper than an ESLint custom-rule lane in most repos.

### B. Exact parity and fixers

1. Existing `beep laws effect-imports` check or write command.
2. Existing `beep laws terse-effect` check or write command.
3. Existing `beep lint schema-first` inventory command.
4. Focused repo-local hotspot or allowlist checker for `no-native-runtime` if Biome does not cover all parity needs.

Why this lane matters:

- Some of the current governance surface is already implemented more precisely as repo-local commands than as pure lint warnings.

### C. Tool-loop steering

1. Claude `pattern-detector` plus `.claude/patterns`.
2. Claude `UserPromptSubmit` and `SessionStart` contextualization.
3. Codex `SessionStart`, `UserPromptSubmit`, and limited Bash-only `PreToolUse`.

Why this lane matters:

- Hook-based steering can bias the agent earlier than lint, and can do so without paying full project-lint cost on every iteration.
- Hook-only replacement is not a full parity answer, but hook-assisted steering is a strong supporting surface.

### D. Retrieval and recommendation

1. Repo-memory idiom search CLI backed by `TypeScriptIndexer` and `RepoSymbolStore`.
2. Agent skills or subagents with curated module inventories.
3. Repo-authored prompt or AGENTS rules that explicitly tell agents which helper shapes to seek first.

Why this lane matters:

- This is the clearest path for solving the user’s higher-level concern that agents do not reliably explore Effect modules or reach for the flattest idioms.
- It is weak as a sole enforcement boundary because it is partly opt-in and advisory.

## Seed Steering Evaluation Corpus

P0 seeded the future corpus with both rule-derived cases and repo-real idiomaticity cases:

- `effect-import-style`: alias mismatch and root-effect import cases from `tooling/configs/test/eslint-rules.test.ts`
- `no-native-runtime`: `new Date`, native `Error`, `globalThis.Error`, and bracket-call variants from `tooling/configs/test/eslint-rules.test.ts`
- `schema-first`: exported pure-data interface versus service-like interface from `tooling/configs/test/eslint-rules.test.ts`
- `terse-effect-style`: direct helper references, `flow(...)` callback shape, and thunk helper cases from `tooling/configs/test/eslint-rules.test.ts`
- Repo-real idiomaticity case: nested `Bool.match` in `packages/common/ui/src/hooks/useNumberInput.ts`
- Repo-real idiomaticity case: `Match.value`-driven host normalization and repo-root search in `packages/v2t-sidecar/src/Server/index.ts`
- Repo-real idiomaticity case: `O.match` boundary handling in `packages/v2t-sidecar/src/Server/index.ts`

P1 must lock exact snippets, labels, and rubric. P4 must reuse the locked corpus unchanged.

## P0 Conclusions

### What looks strongest

- The most credible primary direction is a hybrid replacement:
  - repo-local Biome or Grit rules for fast default-path diagnostics,
  - existing repo-local CLI or inventory commands for exact parity where they already outperform pure lint,
  - hook-based steering for earlier prompt or tool-loop nudges,
  - AGENTS, skills, and repo-memory as supporting recommendation layers rather than the primary enforcement boundary.

### What looks weak as a sole answer

- A hook-first strategy by itself is not a full replacement for the current Effect lane.
- Skills, AGENTS, or subagent specialization by themselves are advisory and opt-in.
- External `linteffect` alone is not a verified drop-in replacement for the repo’s current rule mix.

### What already reduces the replacement burden

- `schema-first` likely already wants to live primarily in the inventory-based CLI lane.
- `effect-import-style` and `terse-effect-style` already have precise repo-local check or write companions.

### Primary P1 questions now

1. Can a repo-local Biome pack cover enough of `no-native-runtime` and `terse-effect-style` to justify ESLint removal?
2. Which `effect-import-style` behaviors should remain in a dedicated check or write command versus move into Biome diagnostics?
3. Should `schema-first` fully move to the inventory command as the source of truth and drop the ESLint rule entirely?
4. What minimal allowlist or exception mechanism is needed if ESLint leaves the critical path?
5. Which hook-based suggestions genuinely improve default agent behavior, and which are just noise?

## Exit Gate Check

- Current Effect governance surface explicit: yes
- Candidate landscape mapped by deployment surface: yes
- Parity matrix initialized with rule-level hypotheses: yes
- Research separates verified evidence from inference: yes
- No production code or CI changed outside this package: yes

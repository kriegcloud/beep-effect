# Effect CLI Entrypoint Migration Plan

Date: 2026-02-08
Author: Codex
Workspace: `/Users/pooks/Dev/recursive-llm`

## 1. Goal

Refactor the current CLI entrypoint to `@effect/cli` while preserving existing behavior, output semantics, and layer wiring into `Rlm`.

Migration target: replace manual argument parsing in `src/cli.ts` with declarative `Command` / `Args` / `Options` definitions and `Command.run`.

## 2. Inputs Reviewed

- Current CLI and runtime wiring:
  - `/Users/pooks/Dev/recursive-llm/src/cli.ts`
  - `/Users/pooks/Dev/recursive-llm/src/CliLayer.ts`
  - `/Users/pooks/Dev/recursive-llm/src/Rlm.ts`
  - `/Users/pooks/Dev/recursive-llm/src/RlmConfig.ts`
  - `/Users/pooks/Dev/recursive-llm/src/RlmModel.ts`
  - `/Users/pooks/Dev/recursive-llm/src/RlmRenderer.ts`
- Current test surface:
  - `/Users/pooks/Dev/recursive-llm/test/CliLayer.test.ts`
  - `/Users/pooks/Dev/recursive-llm/test/RlmRenderer.test.ts`
- Effect CLI source and examples:
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/cli/README.md`
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/cli/src/Command.ts`
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/cli/src/Args.ts`
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/cli/src/Options.ts`
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/cli/src/BuiltInOptions.ts`
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/cli/examples/minigit.ts`
- Effect guidance:
  - `effect-solutions show cli project-setup services-and-layers testing`
- Effect docs MCP APIs:
  - `Command.make`, `Command.withHandler`, `Command.withSubcommands`, `Command.run`, `CliApp.run`

## 3. Current CLI Contract To Preserve

### 3.1 Argument and Option Parity

| Input | Type | Current Default | Rule |
| --- | --- | --- | --- |
| `<query>` | positional text | none | required |
| `--context <text>` | text option | `""` | optional |
| `--context-file <path>` | text option | undefined | optional; file read at runtime |
| `--provider <anthropic|openai|google>` | choice option | `anthropic` | must be one of listed providers |
| `--model <name>` | text option | `claude-sonnet-4-5-20250929` | optional |
| `--sub-model <name>` | text option | undefined | optional |
| `--sub-delegation-enabled` | boolean option | derived | true by default only when `--sub-model` is set |
| `--disable-sub-delegation` | boolean option | `false` | overrides enabled path |
| `--sub-delegation-depth-threshold <n>` | integer option | `1` | must be integer `>= 1` |
| `--max-iterations <n>` | integer option | `50` | optional |
| `--max-depth <n>` | integer option | `1` | optional |
| `--max-llm-calls <n>` | integer option | `200` | optional |
| `--quiet` | boolean option | `false` | optional |
| `--no-color` | boolean option | `false` | optional |
| `--help`, `-h` | boolean option | n/a | show usage and exit |

### 3.2 Environment Validation

- Provider-specific API key is mandatory:
  - `anthropic` -> `ANTHROPIC_API_KEY`
  - `openai` -> `OPENAI_API_KEY`
  - `google` -> `GOOGLE_API_KEY`

### 3.3 Runtime and Output Semantics

- `--context-file` loads text via Bun file APIs before starting the stream.
- CLI builds layer stack via `buildCliLayer(args)` and runs Effect with Bun runtime.
- Event stream is rendered incrementally:
  - non-final output to `stderr`
  - final answer to `stdout`
- Exit behavior:
  - set `process.exitCode = 1` when call ends in failure
  - successful finalization keeps exit code zero
- `quiet` and `noColor` must propagate to `RenderOptions`.

## 4. Target Architecture (Effect CLI)

### 4.1 Command Topology

- Keep invocation shape stable: single top-level command with positional `<query>`.
- Use:
  - `Args.text({ name: "query" })`
  - `Options.*` for all current flags
  - `Command.make("recursive-llm", config, handler)`
  - `Command.run(command, { name, version })`
- Built-in Effect CLI options should replace custom help/version plumbing:
  - help (`-h`/`--help`)
  - version (`--version`)
  - completions / wizard (enabled by default through `@effect/cli`)

### 4.2 Internal Module Split

- Keep external entrypoint path stable (`src/cli.ts`), but split internals:
  - `src/cli/Command.ts`: argument/option definitions + command construction
  - `src/cli/Normalize.ts`: map parsed command config -> existing `CliArgs`
  - `src/cli/Run.ts`: existing stream/render/finalize logic (mostly moved from `main`)
  - `src/cli.ts`: bootstrap only (`Command.run`, provide layer, `BunRuntime.runMain`)

### 4.3 Layering Strategy

- Preserve `buildCliLayer` contract and reuse `makeCliConfig` + model/provider wiring.
- Keep `src/CliLayer.ts` as system wiring boundary during migration.
- Avoid mixing parser concerns with runtime/layer concerns.

## 5. Phased Implementation Plan

### Phase 0: Characterization Tests (before parser replacement)

Deliverables:

- Add parser contract tests that lock current behavior and failures.
- Add entrypoint integration tests with fake `Rlm` stream to lock `stdout`/`stderr`/exit code.

Files:

- New: `/Users/pooks/Dev/recursive-llm/test/CliParse.test.ts`
- New: `/Users/pooks/Dev/recursive-llm/test/CliMain.test.ts`
- Extend: `/Users/pooks/Dev/recursive-llm/test/CliLayer.test.ts`

Exit criteria:

- Existing and new tests pass with current manual parser.
- Key failure modes are covered (missing query, invalid provider, missing API key, invalid depth threshold).

### Phase 1: Introduce Effect CLI Command Definition

Deliverables:

- Implement command definition with full flag parity in `src/cli/Command.ts`.
- Include exact defaults and validation behavior from current contract.
- Implement normalization layer to produce existing `CliArgs` shape.

Important parity notes:

- Preserve both delegation toggles (`--sub-delegation-enabled` and `--disable-sub-delegation`).
- Keep provider/API-key checks explicit in handler path.
- Keep `max-llm-calls` default at `200`.

Exit criteria:

- New parser tests pass against Effect CLI command parsing.
- Help output switches to Effect CLI output format intentionally.

### Phase 2: Switch Entrypoint Execution To `Command.run`

Deliverables:

- Replace `parseArgs`/`printUsage`/manual argv scanning in `src/cli.ts`.
- Run command via `Command.run`.
- Keep streaming/rendering logic behaviorally unchanged in `Run.ts`.

Exit criteria:

- Integration tests confirm:
  - streaming events still reach `stderr`
  - final answer still reaches `stdout`
  - failure still sets `process.exitCode = 1`
  - `quiet` and `no-color` still work

### Phase 3: Cleanup and Migration Completion

Deliverables:

- Remove obsolete parser code and dead helpers.
- Update docs/README usage examples to reflect Effect CLI behavior.
- Keep command-line syntax stable for existing users.

Exit criteria:

- No references to old parser remain.
- CLI behavior, layers, and tests are stable under `bun test`.

## 6. Test Matrix For Migration Gates

### 6.1 Parser + Validation

- Required query missing.
- Unknown provider.
- Missing provider API key.
- `--sub-delegation-enabled` without `--sub-model`.
- `--sub-delegation-depth-threshold < 1`.
- Defaults for provider/model/delegation/max limits.
- `--context-file` argument accepted and loaded.

### 6.2 Runtime Integration

- Success stream with `CallFinalized`: exit code 0, final text on stdout.
- Failure stream with `CallFailed`: exit code 1.
- Renderer toggles (`quiet`, `no-color`) affect emitted text.
- Context merge from `--context` + `--context-file`.

### 6.3 Wiring/Regression

- `buildCliLayer` still selects correct provider and model wiring.
- Sub-delegation flags still flow into `RlmConfig` through `makeCliConfig`.
- `RlmRenderer` contract remains guarded by existing tests.

## 7. Risk Register

1. Option ordering differences between manual parser and Effect CLI.
Mitigation: explicit characterization tests and migration note if behavior changes intentionally.

2. Help text format change may break text-based scripts.
Mitigation: treat help text as changed contract; avoid coupling automation to exact help formatting.

3. Delegation toggle precedence drift.
Mitigation: explicit unit tests for every toggle combination.

4. Exit semantics regression during refactor.
Mitigation: integration tests asserting stdout/stderr and exit code in success/failure paths.

## 8. Implementation Sequence (Recommended PR Stack)

1. PR1: characterization tests (`CliParse`, `CliMain`, `CliLayer` expansions).
2. PR2: new `src/cli/Command.ts` + normalization, no runtime switch yet.
3. PR3: switch `src/cli.ts` to `Command.run` and remove old parser.
4. PR4: cleanup docs and remove compatibility shims.

## 9. Definition Of Done

- CLI entrypoint uses `@effect/cli` end-to-end.
- Existing invocation syntax and runtime semantics are preserved.
- Tests cover parser, runtime integration, and layer wiring.
- No manual argv parser remains in production code.

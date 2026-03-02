# PRE KG CLI Refactor and AI SDK Integration

## Status

PLANNED on 2026-02-28.

## Objective

Complete foundation refactors required before P1-P5 work while preserving command behavior parity for:

- `kg index`
- `kg publish`
- `kg verify`
- `kg parity`
- `kg replay`

and migrating Claude benchmark SDK execution to `@beep/ai-sdk`.

## Locked Constraints

1. No command-surface regressions for `index|publish|verify|parity|replay`.
2. Effect-first implementation patterns are mandatory.
3. Tooling failures use typed schema-based errors only.
4. Claude benchmark SDK backend is routed via `@beep/ai-sdk`.
5. Existing CLI fallback behavior remains intact.

## Current File Ownership (Pre-Refactor Baseline)

| Surface | Current owning file | Current responsibility |
|---|---|---|
| CLI runtime and layer wiring | `tooling/cli/src/bin.ts` | Root runtime, service layers, root command execution |
| CLI command registration | `tooling/cli/src/commands/root.ts` | Registers `kg` command under root CLI |
| KG command parsing + orchestration + providers + outputs | `tooling/cli/src/commands/kg.ts` | All `kg` subcommands, flag parsing, Falkor/Graphiti integrations, spool/ledger/snapshot IO |
| Benchmark backend selection and fallback | `tooling/agent-eval/src/benchmark/execution/index.ts` | Chooses CLI vs SDK backend and fallback behavior |
| Claude CLI backend | `tooling/agent-eval/src/benchmark/execution/cli-executor.ts` | Shell execution via installed `claude` binary |
| Claude SDK backend (vendor-coupled) | `tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` | Direct `@anthropic-ai/claude-agent-sdk` integration |
| Canonical AI SDK wrapper | `packages/ai/sdk/src/core/AgentSdk.ts` | Effect-first wrapper around provider SDKs |

## Target File Ownership (Post-Refactor)

### KG CLI split ownership

| Target file | Owner responsibility |
|---|---|
| `tooling/cli/src/commands/kg/index.ts` | Compose subcommands, preserve flag names/defaults/help text, map typed errors to CLI exit behavior |
| `tooling/cli/src/commands/kg/constants.ts` | Shared constants, env keys, default thresholds/groups |
| `tooling/cli/src/commands/kg/types.ts` | Shared payload types and command result types |
| `tooling/cli/src/commands/kg/errors.ts` | `S.TaggedErrorClass` tooling error definitions |
| `tooling/cli/src/commands/kg/io-boundary.ts` | File IO boundaries (spool, ledgers, snapshot writes, manifest writes) |
| `tooling/cli/src/commands/kg/indexing.ts` | Index pipeline and deterministic envelope generation |
| `tooling/cli/src/commands/kg/publish.ts` | Target selection, group override, multi-sink publish orchestration |
| `tooling/cli/src/commands/kg/falkor.ts` | Falkor query execution and receipt mapping |
| `tooling/cli/src/commands/kg/graphiti.ts` | Graphiti MCP preflight, publish, verify polling helpers |
| `tooling/cli/src/commands/kg/verify.ts` | Verify checks for Falkor/Graphiti/both |
| `tooling/cli/src/commands/kg/parity.ts` | Functional/strict parity profile checks |
| `tooling/cli/src/commands/kg/replay.ts` | Replay from spool path and publish routing |

### Benchmark routing ownership

| Target file | Owner responsibility |
|---|---|
| `packages/ai/sdk/src/benchmark/claudeBenchmark.ts` | Benchmark-oriented `@beep/ai-sdk` adapter returning normalized execution payload |
| `tooling/agent-eval/src/benchmark/execution/ai-sdk-executor.ts` | Thin execution bridge from benchmark request to `@beep/ai-sdk` adapter |
| `tooling/agent-eval/src/benchmark/execution/index.ts` | Keep backend selection/fallback contract unchanged while swapping SDK backend implementation |
| `tooling/agent-eval/src/benchmark/execution/cli-executor.ts` | No behavior change; remains fallback/runtime parity path |

## Command Behavior Parity Contract (Must Hold)

| Command | Inputs/flags that must remain stable | Required side effects | Output contract |
|---|---|---|---|
| `kg index` | `--mode full|delta`, `--changed` semantics unchanged | same snapshot/index/ledger/spool writes for same inputs | same JSON shape and success/failure semantics |
| `kg publish` | `--target falkor|graphiti|both`, `--mode`, `--changed`, `--group` | same preflight behavior (including Graphiti proxy health gate at `127.0.0.1:8123/healthz` when Graphiti is targeted), same sink fanout and ledger updates | same JSON summary fields and per-sink receipts |
| `kg verify` | `--target`, `--group`, `--commit` default behavior | same Falkor counts and Graphiti episode verification logic | same `checks` structure and pass/fail behavior |
| `kg parity` | `--profile code-graph-functional|code-graph-strict`, `--group`, `--strict-min-paths` | no new writes | same matrix semantics and strict threshold behavior |
| `kg replay` | `--from-spool`, `--target`, `--group` | same spool read/parse behavior and publish routing | same replay summary JSON and sink receipts |

## Effect-First and Typed Tooling Error Contract

1. No `throw`, `new Error`, `try/catch` recovery in command internals.
2. Failures are modeled with `S.TaggedErrorClass` in `errors.ts`.
3. Command internals return `Effect` values with typed error channels.
4. Boundary-only runtime execution in command entrypoints.
5. Native runtime helpers in domain logic are replaced with canonical Effect modules (`A`, `O`, `P`, `R`, `S`).
6. Parsing/decoding of external JSON payloads uses schema decode paths.
7. Each extracted module must be law-clean before merge (`check`, `lint`, `test`, `docgen`).

### Required typed error set (minimum)

- `KgCliUsageError`
- `KgIoBoundaryError`
- `KgLedgerWriteError`
- `KgSpoolDecodeError`
- `KgFalkorQueryError`
- `KgGraphitiMcpError`
- `KgVerifyInvariantError`
- `KgParityEvaluationError`

## Claude Benchmark Backend Migration via `@beep/ai-sdk`

### Current risk

`tooling/agent-eval` currently imports `@anthropic-ai/claude-agent-sdk` directly for SDK execution, creating vendor coupling outside `@beep/ai-sdk`.

### Target state

1. Benchmark SDK path calls only `@beep/ai-sdk`.
2. Vendor SDK dependency remains isolated inside `packages/ai/sdk`.
3. Execution resolver behavior is unchanged:
   - keep backend selection contract
   - keep CLI fallback contract
   - keep normalized benchmark result shape

### Migration steps (SDK path)

1. Add benchmark adapter API in `packages/ai/sdk/src/benchmark/claudeBenchmark.ts`.
2. Export adapter through `@beep/ai-sdk` package surface.
3. Implement `tooling/agent-eval/src/benchmark/execution/ai-sdk-executor.ts` using the adapter.
4. Switch resolver imports in `tooling/agent-eval/src/benchmark/execution/index.ts` from vendor executor to AI SDK executor.
5. Remove direct vendor dependency from `tooling/agent-eval/package.json`.
6. Verify SDK path outputs match current normalized shape.

## Migration Order (Execution Sequence)

1. Extract immutable constants/types/error modules from `kg.ts` with no behavior changes.
2. Extract IO boundary helpers (ledger/spool/snapshot writes) and hold output JSON format constant.
3. Extract index pipeline (`indexing.ts`) and rebind `index`/`publish` callers.
4. Extract sink providers (`falkor.ts`, `graphiti.ts`) and preserve query/polling behavior.
5. Extract `publish`, `verify`, `parity`, `replay` orchestrators; keep command signatures identical.
6. Replace `kg` root command assembly to use split modules while retaining user-facing flags and defaults.
7. Implement AI SDK benchmark adapter and wire new `ai-sdk-executor`.
8. Switch resolver to AI SDK executor while keeping CLI fallback path unchanged.
9. Run parity and gate verification commands; block progression on any mismatch.

## Verification Matrix (Pre/Post Required)

| Area | Verification command | Pass condition |
|---|---|---|
| KG command registration | `bun run beep kg --help` | subcommands and help text unchanged for `index|publish|verify|parity|replay` |
| Index parity | `bun run beep kg index --mode full` | output JSON schema + artifacts match baseline contract |
| Publish parity | `bun run beep kg publish --target both --mode delta --changed <baseline-list>` | sink receipts + ledger effects match baseline contract |
| Verify parity | `bun run beep kg verify --target both --group beep-ast-kg --commit <commit>` | same pass/fail behavior and check payload shape |
| Parity parity | `bun run beep kg parity --profile code-graph-functional --group beep-ast-kg` | same matrix semantics and threshold handling |
| Replay parity | `bun run beep kg replay --from-spool <baseline-spool> --target both --group beep-ast-kg` | same envelope replay and receipt behavior |
| AI SDK routing | `rg -n "@anthropic-ai/claude-agent-sdk|@beep/ai-sdk" tooling/agent-eval/src/benchmark/execution` | direct vendor import removed from benchmark execution path, `@beep/ai-sdk` present |
| Agent-eval backend behavior | benchmark smoke run with `--execution-backend sdk` and CLI fallback scenario | same normalized result shape, fallback still triggers correctly |

## Exit Criteria for PRE Completion

1. `kg` command split is complete with ownership map implemented.
2. Parity checks pass for all five `kg` commands.
3. Tooling errors are fully typed and schema-based.
4. Claude SDK benchmark route runs through `@beep/ai-sdk`.
5. Repo quality gates required for touched packages pass.

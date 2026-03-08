# Effect-Native Remediation Plan (P1/P2/P3)

## Summary

This plan closes remaining Effect-native gaps with a clean-break posture, keeps the core platform-neutral, and standardizes service-owned test layers.

Locked decisions for this plan:
1. Plan doc lives under `docs/plans`.
2. `visualize` CLI input contract is annotated JSON only.
3. Migration posture is clean break (no compatibility shims).

## Status Update (2026-02-17)

Completed:
1. P1-1 through P1-5.
2. P2-1 through P2-5.
3. P3-1 through P3-4.

Audit hardening delta (non-visualization) completed in follow-up:
1. Unified extract config resolution through `ExtractionConfig` (`Effect.Config`) with `CLI > env > defaults`.
2. Runtime control contract aligned to `withProviderPermit(provider, effect)` with partitioned fairness semantics.
3. Provider `streamText` paths switched to native incremental streaming with no primed-cache path.
4. Prompt validator isolation tests and service contract override-determinism checks added.
5. Provider schema metadata upgraded from placeholders where format contracts are known.
6. Runtime boundary checks confirmed (`@effect/platform-bun` only in runtime modules; no core globals).
7. Fixture-driven extraction parity diff harness added (`scripts/parity/extract-diff-harness.ts`) with committed baselines and CI-safe test coverage.

Artifact paths:
1. Performance benchmark reports: `.cache/perf/annotator-throughput.latest.json` and `.cache/perf/annotator-throughput-<timestamp>.json`.
2. Worker alignment runtime wiring: `src/runtime/BunAlignmentWorker.ts` and `src/runtime/workers/*`.
3. Provider smoke matrix command: `bun run test:smoke:providers`.
4. Parity diff report and actual outputs: `.cache/parity/extract-diff-report.latest.json` and `.cache/parity/actual/*.json`.

## Scope

In scope:
1. CLI parity (`extract` + `visualize`) with typed `@effect/cli` commands.
2. Parser/validation/visualization parity work needed for production usefulness.
3. Service-layer testing conventions (`Effect.Service` + canonical test layers).
4. Runtime-layer split and docs/spec synchronization.
5. P1/P2/P3 backlog with explicit acceptance gates.

Out of scope:
1. Backward compatibility adapters for legacy API paths.
2. Non-Effect CLI surfaces.
3. Provider/plugin systems beyond Gemini/OpenAI/Anthropic/Ollama.

## Public API / Interface Changes

1. Add `visualize` command surface in `src/Cli.ts`.
2. Add `executeVisualizeCommand(...)` and `makeVisualizeCommand(...)` in `src/Cli.ts`.
3. Expand `FormatHandler` behavior contract in `src/FormatHandler.ts` to honor config fields (`formatType`, fences, wrapper, top-level list policy, attribute suffix mapping).
4. Upgrade `PromptValidator` implementation in `src/PromptValidation.ts` from stub to resolver-backed validation.
5. Add missing service test-layer factories where absent (`testLayer(...)`) for configurable services.
6. Remove stale mock-only export `runGeminiBatch` from `src/providers/GeminiBatch.ts` and `src/index.ts` (clean break).

## P1 Workstream (Required Next)

| ID | Work | Implementation (decision-complete) | Files | Exit Criteria |
|---|---|---|---|---|
| P1-1 | Add typed `visualize` subcommand | Add options: `--input` (required annotated JSON path), `--output-path` (optional), `--animation-speed` (optional float), `--show-legend` (optional boolean). Implement command handler: read file via `FileSystem`, decode via `decodeAnnotatedDocumentJson`, call `Visualizer.visualize`, write file or stdout. Register in root command subcommands array. | `src/Cli.ts`, `src/IO.ts` | `bun run cli -- --help` shows both `extract` and `visualize`; `visualize` integration tests pass. |
| P1-2 | `FormatHandler` parser parity | Add YAML dependency and parser path. Parsing algorithm: fence extraction first when enabled; strict-fence failure when enabled + strict and no valid fenced block; parse by `formatType`; if non-strict and primary parse fails, attempt alternate parser once; normalize wrapper (`wrapperKey` or `extractions`), enforce `allowTopLevelList`, map `*_attributes` keys into `attributes` record. | `src/FormatHandler.ts`, `package.json` | New parser tests cover JSON, YAML, fenced, wrapper/no-wrapper, strict failures, attribute suffix mapping. |
| P1-3 | Real prompt validation | Re-implement `validatePromptAlignment` to use `Resolver.align` against each example text with provided `AlignmentPolicy`; emit `ValidationIssue` entries for failed and non-exact alignments; keep `handleAlignmentReport` behavior and enforce strict non-exact path. | `src/PromptValidation.ts` | Validator tests prove `off/warning/error` behavior and strict non-exact enforcement. |
| P1-4 | Replace placeholder visualization renderer | Replace current JSON `<pre>` output with extraction-highlight HTML generator using extraction intervals, legend rendering, and speed option plumbed to script/CSS variable. For overlaps in P1, apply deterministic first-pass-wins highlighting. | `src/Visualization.ts` | Visualization tests assert highlight markers and stable output for deterministic fixture docs. |
| P1-5 | P1 coverage and contracts | Add missing tests for visualize CLI, format parsing, prompt validation, and visualization renderer; keep deterministic mock-first strategy. | `test/cli/*`, `test/foundation/*`, `test/pipeline/*` | `bun run test` passes with new suites; no flaky behavior in default CI mode. |

## P2 Workstream (Architecture Hardening)

| ID | Work | Implementation (decision-complete) | Files | Exit Criteria |
|---|---|---|---|---|
| P2-1 | Mandatory service-owned test layers | For every `Effect.Service` in `src/`, enforce `Test` and/or `testLayer(...)`. Add `testLayer(...)` for configurable/stateful services currently missing it (`FormatHandler`, `PromptBuilder`, `PromptValidator`, `Resolver`, `Annotator`, `Visualizer`, `RuntimeControl` as applicable). | `src/*.ts`, `test/contracts/service-shape.test.ts` | Contract test enumerates and verifies required test APIs for all service classes. |
| P2-2 | Runtime composition split completion | Keep Bun default entrypoint. Add Node CLI entry composition module (`NodeMain`) using `src/runtime/NodeRuntime.ts`; add script for Node execution path; keep core unchanged. | `src/runtime/NodeMain.ts`, `package.json`, `README.md` | Bun and Node runtime entry paths both execute CLI successfully with same command surface. |
| P2-3 | Remove core global UUID dependency | Introduce service-based document ID generation and refactor `makeDocument` to depend on that service in orchestration paths; no direct `crypto.randomUUID()` in core data model. | `src/Data.ts`, `src/Extract.ts`, `src/Annotator.ts` | Static scan shows no `crypto.` usage in core source modules. |
| P2-4 | SPEC and README sync | Update SPEC sections 7/8/9/10/11 to current architecture and status-tracked phases; remove stale Node-specific helper snippet from shared core guidance; document visualize contract and clean-break decisions. | `SPEC.md`, `README.md` | Spec describes implemented CLI/runtime/parser behavior without contradictions. |
| P2-5 | Clean-break API cleanup | Remove unused/stale exports (`GeminiBatch` mock path and other non-production mock artifacts) from public index. | `src/index.ts`, `src/providers/GeminiBatch.ts` | No production mock inference surface remains in exported API. |

## P3 Workstream (Performance + Operational Maturity)

| ID | Work | Implementation (decision-complete) | Files | Exit Criteria |
|---|---|---|---|---|
| P3-1 | Stream + worker architecture | Refactor chunk/pipeline batching toward `Stream`-driven execution and integrate optional Bun worker layers for heavy workloads, while preserving parity semantics. | `src/Chunking.ts`, `src/Annotator.ts`, runtime modules | Throughput improves under load tests; behavioral parity tests remain green. |
| P3-2 | RuntimeControl integration | Wire provider permit acquisition/release into provider invocation paths so concurrency controls are enforceable through service layer. | `src/RuntimeControl.ts`, `src/providers/AiAdapters.ts`, `src/providers/Ollama.ts` | Concurrency-limit tests demonstrate permits are honored and released on failure paths. |
| P3-3 | Provider smoke matrix | Add opt-in smoke tests for OpenAI, Gemini, Ollama, Anthropic with env-gated execution, deterministic defaults for CI. | `test/providers/*.test.ts` | Default CI remains deterministic; live matrix runs only when env flags are enabled. |
| P3-4 | Observability + guardrails | Add structured logging around cache hit/miss, provider latency, and parse failures; retain typed error mapping. | provider and pipeline modules | Logs provide actionable diagnostics without leaking sensitive data. |

## Test Plan (Mandatory)

1. Unit tests:
- `FormatHandler`: JSON/YAML, fence handling, wrapper extraction, strict mode failures, attribute suffix mapping.
- `PromptValidator`: failed/non-exact issue generation, level handling.
- `Visualizer`: highlight generation and deterministic output.
- Service contract tests for required `Test`/`testLayer(...)` shape.

2. Integration tests:
- CLI `extract` + `visualize` subcommands end-to-end with mock `LanguageModel` layer.
- Config precedence (`CLI > env > defaults`) for provider/model/cache settings.
- Runtime composition checks for Bun and Node entry modules.

3. Boundary/static checks:
- No `@effect/platform-bun` imports outside runtime modules.
- No core `process`, `Date.now`, `Math.random`, direct `JSON.parse`/`JSON.stringify`.
- No production mock provider inference exports in public API.

## Acceptance Gates

1. `bun run typecheck` passes.
2. `bun run test` passes default suite.
3. CLI help shows `extract` and `visualize`.
4. Parser supports JSON/YAML per config and strict behavior.
5. Prompt validation emits real issues from resolver alignment.
6. Visualization produces highlight HTML, not raw payload dump.
7. Service testing convention is enforced project-wide.
8. SPEC and README are synchronized to actual architecture.

## Implementation Sequence

1. Complete P1-1 through P1-5 in order.
2. Complete P2-1 through P2-5 in order.
3. Complete P3-1 through P3-4 after P1/P2 are merged and stable.

## Assumptions and Defaults

1. Clean-break migration is authorized.
2. Visualize command input is annotated JSON only.
3. Bun remains default runtime; Node is additive via dedicated entry composition.
4. Providers in scope are Gemini/OpenAI/Anthropic/Ollama.
5. Deterministic mock-based tests remain default CI behavior.
6. Config precedence remains `CLI > env > defaults`.

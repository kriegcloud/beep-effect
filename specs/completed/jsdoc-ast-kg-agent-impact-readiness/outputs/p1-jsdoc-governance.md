# P1 JSDoc Governance

## Status

COMPLETE on 2026-02-28.

## Objective

Define a minimal, high-impact governance contract that keeps KG semantic edges trustworthy without forcing immediate repo-wide documentation churn.

## First Scope (Small, High-Value)

P1 enforcement applies only to these paths:

1. `tooling/cli/src/commands/kg.ts` and its split successors under `tooling/cli/src/commands/kg/**/*.ts`.
2. `tooling/agent-eval/src/benchmark/execution/**/*.ts`.

Rationale:

1. These paths directly affect retrieval quality, benchmark validity, and rollout decisions.
2. The scope is small enough to migrate quickly while producing measurable impact for P3/P4 gates.

Everything else remains on current baseline lint behavior until later rollout waves.

## Required Semantic Tags and Allowed Values

### Contracted tags

The semantic contract is locked to these tags because they map directly to KG edges in `tooling/cli/src/commands/kg.ts`:

- `@category`
- `@module`
- `@domain`
- `@provides`
- `@depends`
- `@errors`

### Syntax rules

All six tags must be single-line values (current parser constraint) and follow these formats:

| Tag | Required on P1 scope | Allowed values / format |
|---|---|---|
| `@category` | every exported symbol | One token from allowlist: `commands`, `kg-indexing`, `kg-publish`, `kg-verify`, `kg-parity`, `kg-replay`, `benchmark-execution`, `adapters` |
| `@module` | once per file with exports, repeated on major exported symbols | `@beep/<pkg>/<path>` (kebab/snake path segments; no whitespace) |
| `@domain` | every exported symbol | `kg-cli` or `agent-eval` |
| `@provides` | every exported symbol in scope | Comma-separated capability tokens, or `none` |
| `@depends` | every exported symbol in scope | Comma-separated dependency/service tokens, or `none` |
| `@errors` | every exported symbol in scope | Comma-separated tagged error identifiers, or `none` |

### Minimum compliant block

```ts
/**
 * Builds and verifies a scoped KG publish payload.
 * @category kg-publish
 * @module @beep/cli/commands/kg/publish
 * @domain kg-cli
 * @provides KgPublishPlan
 * @depends FileSystem, GraphitiClient
 * @errors ParseFailure, PublishFailure
 */
```

## Lint Enforcement Strategy

### Rule contract (P1)

1. Keep `jsdoc/check-tag-names` as `error` and include all six semantic tags.
2. Promote `beep-jsdoc/require-category-tag` from `warn` to `error` for P1 scope only.
3. Add `beep-jsdoc/require-semantic-tags` (new) for required presence of `@module/@domain/@provides/@depends/@errors` in P1 scope.
4. Add `beep-jsdoc/validate-semantic-tag-values` (new) to enforce the allowlists/formats above.
5. Run scoped lint with `--max-warnings 0` to prevent warning-only drift in P1 paths.

### CI failure behavior

PR status `jsdoc-semantic-governance` is **required** and fails when any of the following occurs:

1. Missing required semantic tag in P1 scope.
2. Tag present but value violates allowlist/format.
3. `stale-doc` checker reports one or more stale symbols.
4. Stale checker cannot run or produces incomplete output (`BLOCKED`, fail-closed).

Out-of-scope paths remain non-blocking for P1 (no repo-wide hard fail expansion yet).

## stale-doc Detection Rule

P1 `stale-doc` is deterministic and intentionally narrow:

1. Generate per-symbol `signatureCanonical` (same canonicalization strategy used by KG indexing).
2. Generate semantic-doc fingerprint from normalized values of `@category/@module/@domain/@provides/@depends/@errors`.
3. Mark symbol as `stale-doc` when either condition is true:
   - Signature changed vs merge-base/main snapshot, but semantic-doc fingerprint is unchanged.
   - File path changed and `@module` no longer matches the exported symbol location contract.

Failure threshold in CI: any `stale-doc` count `> 0` in modified P1-scope files.

## Scope Rollout Order

1. Wave 1 (P1): `kg` command path + benchmark execution path (this document).
2. Wave 2: remaining `tooling/cli/src/commands/**/*.ts`.
3. Wave 3: `tooling/*/src/**/*.ts` excluding `internal`.
4. Wave 4: selected package API surfaces (`packages/shared/domain`, `packages/common/*`) after P3 precision/recall gates pass.

Wave advancement requires two consecutive green runs of `jsdoc-semantic-governance` for the current wave.

## Migration Plan for Existing Docs

### Phase A: Inventory (no fail)

1. Produce baseline report of violations for P1 scope.
2. Create temporary debt ledger with symbol-level owners and fix status.

### Phase B: Backfill P1 scope

1. Update existing JSDoc blocks in Wave 1 files to full six-tag contract.
2. Normalize inconsistent tag values into allowlisted vocabulary.
3. Add `none` where dependencies or errors are intentionally absent.

### Phase C: Enforce fail-closed in CI

1. Enable required status check `jsdoc-semantic-governance`.
2. Remove temporary debt exemptions for P1 scope.

### Phase D: Expand by waves

1. Repeat A-C for each rollout wave.
2. Do not expand scope if stale-doc failures exceed 2% of changed symbols in the prior wave.

## P1 Command and Evidence Contract (Design-Time)

| Command ID | Command | Purpose |
|---|---|---|
| P1-C01 | `bun run beep docs laws` | Law discovery requirement |
| P1-C02 | `bun run beep docs skills` | Skills discovery requirement |
| P1-C03 | `bun run beep docs policies` | Policy discovery requirement |
| P1-C04 | `bun run lint:jsdoc` | Baseline jsdoc lint behavior |
| P1-C05 | `bun run lint:jsdoc -- --max-warnings 0 tooling/cli/src/commands/kg.ts tooling/agent-eval/src/benchmark/execution/**/*.ts` | P1 scope hard-fail lint |
| P1-C06 | `bun run jsdoc:stale-check --scope p1` | stale-doc enforcement |
| P1-C07 | `rg -n "@category|@module|@domain|@provides|@depends|@errors|stale-doc|scope rollout" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p1-jsdoc-governance.md` | Contract audit anchor |

## Exit Criteria

- [x] Required tag set and syntax are locked.
- [x] CI failure behavior is explicit and fail-closed for P1 scope.
- [x] stale-doc detection criteria are concrete and testable.
- [x] Migration plan for existing docs is staged and bounded.

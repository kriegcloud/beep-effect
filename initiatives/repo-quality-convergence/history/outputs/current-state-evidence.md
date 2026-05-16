# Current-State Evidence

## Baseline Commands

Captured on 2026-05-16 from `/home/elpresidank/YeeBois/projects/beep-effect3`.

| Command | Result | Evidence |
| --- | --- | --- |
| `git status --short --branch` | Clean `main...origin/main` at start. | Local command output. |
| `bun run check` | Passed before implementation planning. | Local command output from planning pass. |
| `bun run repo-exports:catalog:check` | Passed before implementation planning. | Local command output from planning pass. |
| `bun run beep lint schema-first` | Failed. | 20 missing `object-struct-schema` findings under generated docs examples. |
| `gh run list --limit 10` | Check green, Release red on `main`. | Check run `25963549469`, Release run `25963549457`. |
| `gh run view 25963549457 --log-failed` | Failed in `changesets/action@v1`. | Changesets reported `@beep/editor-app` is not in the workspace. |

## Source Evidence

- `packages/tooling/tool/cli/src/commands/Shared/TypeScriptSourceExclusions.ts`
  excluded generated and `_generated` paths but not `/docs/`.
- `.gitignore` ignores `docs/` and `**/docs`, with specific exceptions.
- `packages/foundation/modeling/schema/docs/examples` has generated TypeScript
  examples and no tracked files.
- `.github/workflows/release.yml` runs `changesets/action@v1` with
  `version: bun run changeset:version`.
- `packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts` owns
  `repo-sanity`, making it the durable home for a release graph preflight.

## External Primary Docs

- Changesets action: <https://github.com/changesets/action>
- Changesets versioning workflow: <https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md>
- GitHub Actions concurrency: <https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency>
- Turborepo run reference: <https://turborepo.dev/docs/reference/run>

## After P1

Captured on 2026-05-16 after local implementation.

| Command | Result | Evidence |
| --- | --- | --- |
| `bun run beep quality changeset-graph` | Passed. | `workspace_packages=80`, `changeset_files=60`, `references=47`, `missing_references=0`. |
| `bun run beep lint schema-first` | Passed. | `live_entries=184`, `tracked_entries=184`, `missing_entries=0`, `stale_entries=0`, `enforced_candidates=0`. |
| `bunx --bun vitest run packages/tooling/tool/cli/test/changeset-graph.test.ts packages/tooling/tool/cli/test/schema-first.test.ts` | Passed. | 2 test files, 9 tests. |
| `bun run --cwd packages/tooling/tool/cli check` | Passed. | Tooling package type and test checks completed. |
| `bun run --cwd packages/tooling/tool/cli lint` | Passed. | Tooling package lint completed. |
| `bun run beep laws dual-arity --check` | Passed. | `missing_entries=0`. |
| `bun run beep laws terse-effect --check` | Passed. | Existing non-failing dry-run note remains in `QualityWorkerRunpodEval.ts`; no finding was introduced by this packet. |
| `bun run lint` | Passed. | Root lint completed after JSDoc and formatting fixes. |
| `bun run check` | Passed. | Turbo package checks and repo tsgo lanes completed. |
| `bun run repo-exports:catalog` | Passed. | Refreshed `standards/repo-exports.catalog.jsonc` and `standards/repo-exports.catalog.md`. |
| `bun run repo-exports:catalog:check` | Passed. | Generated catalog artifacts are current; `packages=81`, `importSpecifiers=913`, `publicExportEntries=13079`. |
| `bun run audit:github repo-sanity` | Passed. | Changeset graph, tsconfig sync, version sync, syncpack, sherif package graph, and `bun audit --audit-level=high` passed. |
| `bun run changeset:version` | Passed in a throwaway copy. | The real checkout was not mutated; Changesets reported all files updated in the temp copy. |

## Blocker Closure

- Generated docs output is excluded from TypeScript source-law traversals through
  `TYPESCRIPT_SOURCE_EXCLUDED_SEGMENTS`, with a focused regression test.
- Release graph drift is guarded by `bun run beep quality changeset-graph`,
  wired into repo-sanity and the Release workflow before `changesets/action`.
- Stale changeset package references for removed workspaces were removed.
- Stale root `tsconfig.json` excludes for removed app workspaces were removed.
- The repo export catalog was refreshed after adding the new public quality
  command helpers.

## Pending External Evidence

Fresh GitHub Check and Release evidence must be captured after these changes
land. The local proof bundle supports a 90-plus candidate score, but the
initiative does not close under `SPEC.md` until those workflow runs are green or
explicitly waived.

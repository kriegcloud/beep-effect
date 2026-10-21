# Retired IRI authority law baseline re-record (2026-10-20)

Reviewer: Claude Opus 5.5 (`feat/public-origin-beep-effect-com`).

## What changed

Two things change the reviewed cache configuration.

1. One root computation is added: `//#lint:retired-iri-authorities`, running
   `bun run beep laws retired-iri-authorities --check`. The law scans every
   git-tracked text file for a retired identity authority host (rule 1) and
   every product TS/JS source for a string literal of the public origin
   outside `@beep/identity` and `@beep/public-site` (rule 2). The task copies
   the `//#lint:retired-effect-paths` posture: `cache: false`, whole-tree
   inputs minus `.git`, `graft`, `.repos` and the generated-artifact
   directories, the `//#lint:policy-fingerprint` edge, the medium policy
   phase, and its own cheap-gates lane in the preflight wave.
2. One workspace is added: `@beep/public-site`
   (`packages/foundation/modeling/public-site`), scaffolded by
   `bun run beep create-package public-site --family foundation --kind modeling`.
   It adds 14 task computations, all from the generated scripts block and the
   shared task definitions; none is hand-edited. Nine are cached (`build`,
   `check`, `docgen`, `doctest`, `lint`, `lint:deprecated-apis`, `lint:jsdoc`,
   `lint:laws`, `test`); five are uncached (`audit`, `coverage`, `lint:fix`,
   `package-test-typecheck`, `test:integration`). All 14 are reviewed here;
   `test:integration` carries the shared secret env globs every package's
   integration task declares.

## Why the baseline needs a new record

`cache audit` on this branch reports 37 blocking findings, all from those two
changes:

- 28 `configuration-drift` rows, one per cached root computation
  (`//#config-sync:check` through `//#topo-sort`). The new root script changes
  the complete-workspace-script digest that every root computation binds, so
  every cached root node drifts. No other root command, input, output,
  environment key, dependency edge or cache flag changes.
- 9 `unreviewed-expansion` rows, one per cached `@beep/public-site` task node
  listed above (the audit only flags cached nodes; the five uncached ones are
  recorded in the same review).
- One non-blocking `configuration-source-drift: turbo.json` review row: the new
  `//#lint:retired-iri-authorities` task entry.

No qualification is granted: the new root computation is uncached, the
public-site nodes take the shared definitions, scope/profile/epoch are
unchanged, and no exception row or standards inventory grows.

## Evidence

- `bun run beep laws retired-iri-authorities --check` on this branch, with the
  whole change staged: 36,893 tracked files scanned, 106 binary files skipped,
  3,858 exempt files, 0 findings, exit 0.
- `laws-retired-iri-authorities.test.ts` (30 tests) pins both rules, the
  exemptions and the seeded-violation `--check` exit;
  `root-tasks-turbo-inputs.test.ts` and `quality-tasks.test.ts` pin the new
  row's uncached flag, inputs, fingerprint edge and lane placement.
- `bun run beep quality package-verify @beep/public-site` passes (audit and
  docgen).

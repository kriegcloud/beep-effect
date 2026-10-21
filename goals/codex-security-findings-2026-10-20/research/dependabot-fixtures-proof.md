# Historical fixture migration: local proof

Verified on 2026-10-20 after the PR #1928 hold was released, at checkout HEAD
`426d494b3433ccddf797a2d896984f1ad23c81ad`. This receipt covers the existing
fixture migration in the shared checkout. It does not claim hosted checks,
publication, merge, GitHub dependency-graph removal, or advisory closure.

## Capture integrity and reader coverage

An independent byte comparison read each original capture with `git show
HEAD:<original-path>` and compared it with its renamed on-disk document.
All 38 lockfile captures and all five manifest captures are byte-identical.
The SHA-256 of each original lockfile also matches its entry in
`scratchpad/test/lockfiles/fixtures/digests.json`. No historical vulnerable
package records were edited or regenerated.

The fixture-storage suite independently requires all 38 digest entries, checks
the content digest, checks absence of the original active basename, and requires
complete enumeration parity with stored `.fixture` documents.

The four lockfile consumers are `Lockfile.test.ts`, `importers.test.ts`,
`documents.test.ts`, and `PnpmEnvLockfile.test.ts`; all use `fixtures.ts`.
The existing supported-version enumeration uses `fixturePath` while retaining
logical original filenames and parser formats. Package manifest integration
imports all five `package.fixture.json` documents and retains its virtual
`package.json` paths. A repository/source reference search found no additional
consumer of either renamed corpus requiring migration. Runner `Copy.ts`
counts fixture directory bytes and copies directory trees without depending
on these original basenames; no change is required there.

## Passing verification

Commands below ran from the repository root, because this Vitest configuration
includes root-relative scratchpad paths.

| Command | Result |
| --- | --- |
| `bunx --bun --no-install vitest run --config scratchpad/vitest.config.ts scratchpad/test/lockfiles scratchpad/test/package-json/integration` | 35 files, 308 tests passed; exit 0 |
| `bunx --bun --no-install vitest run --config scratchpad/vitest.config.ts scratchpad/test/package-json` | 50 files, 467 tests passed |
| `bun run scratchpad/effected/audit.ts lint lockfiles` | exit 0; oxlint and all four law checks passed with their intentional canaries flagged |
| `bun run scratchpad/effected/audit.ts lint package-json` | exit 0; oxlint and all four law checks passed with their intentional canaries flagged |
| Independent original-byte/digest comparison | 38 lockfile captures and five manifest captures passed |

## Existing check blockers and bounded attribution

`bun run scratchpad/effected/audit.ts check lockfiles` and the corresponding
`check package-json` both exit 1 before the target check. The runner requires
its diagnostic canary to report `effect(missingPipeableSignature)` and
`effect(strictBooleanExpressions)`; the installed compiler does not flag those
canary cases. The canary and runner are unchanged against HEAD. This is a
pre-existing compiler/canary compatibility failure, not evidence of a fixture
parser failure or full typecheck success.

Direct target checks, using `bun run --cwd scratchpad tsgo -p
 effected/<target>/tsconfig.json --noEmit --pretty false` (without the displayed
line wrap/leading space), reach source checking and report only existing
`TS377084 effect(unnecessaryArrowBlock)` diagnostics:

- `packages/foundation/modeling/npm-spec/src/RegistryKind.ts` (at the time, the scratchpad npm port): lines 47, 48 and 141, both targets.
- `scratchpad/effected/yaml/Yaml.ts`: line 529, lockfiles target only.

These dependency source files are unchanged against HEAD; no diagnostic names
a migrated fixture, test reader, or new loader. Direct compiler exits are 0
although these Effect diagnostics are printed, so an exit code alone is not
claimed as successful qualification. The canonical check remains red until
the existing diagnostic/canary mismatch is repaired by its owning lane.

An initial root Biome check processed zero files because scratchpad is excluded
by the root configuration; it is not counted as passing lint. The scoped
runner lint above is the applicable successful check. No repair to toolchain,
canary, unrelated source, root manifest, or root lockfile was made in this lane.

## Remaining gate

Observe hosted required checks and GitHub dependency inventory after publication
and merge. Only that later observation can establish whether the renamed inert
documents leave the dependency graph and all 103 captured fixture-bound alerts
close. The initial inventory contained 94; the post-publication refresh added
nine Vite alerts on the same historical fixture paths, without changing the
38-capture corpus or its byte-preservation proof. See `DEPENDABOT.md` and
`../ops/dependabot.json` for the complete refreshed inventory.

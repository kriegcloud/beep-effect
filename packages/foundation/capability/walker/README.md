# @beep/walker

Path traversal as Effect primitives. `Walker.ascend` gives the directory chain from a starting path toward the filesystem root; `Walker.findUpward` returns the nearest existing file among per-directory candidates; `Walker.findRoot` returns the nearest directory a marker predicate accepts. Going the other way, `descend` expands a compiled `@beep/glob` pattern under a directory into the matching file paths, sorted, symlink-safe, and typed about unreadable subtrees. `FileSystem` and `Path` arrive from `effect` core, so no platform package is pulled in, not even in tests.

## Why this package

Walking up a directory tree looks like four lines of code until you meet the edges. If a probe on one ancestor fails (an `EACCES` on a directory you had no business reading), the naive loop propagates that error and the whole search fails, so an unreadable directory hides the workspace root one level above it. Walker absorbs each probe individually: a failed probe means "this candidate did not match", never "abort the scan". Every upward error channel is `never` as a result, and not-found and cannot-look are deliberately indistinguishable, because discovery is best-effort.

The downward walk makes the opposite call on purpose. An unreadable subtree during glob expansion fails typed by default, because "no matches there" would be a wrong answer dressed as an empty one.

The other edges get the same treatment. Absorption catches failures, not defects, so a predicate that throws still surfaces. `findUpward` scans directory-major, so a distant ancestor's `.apprc` never beats a nearer `config/.apprc`. `maxDepth` must be a positive integer: `NaN`, `2.5` and `0` are defects rather than a silently empty chain. A ceiling (`stopAt`) must be absolute, and `start` is required: walker never reads `process.cwd()` on your behalf.

The package is ESM-only (`"type": "module"`). Its runtime dependencies are `effect` v4 plus the workspace `@beep/glob`, `@beep/identity` and `@beep/schema` packages. Every symbol is exported by name from a leaf module (`@beep/walker/Walker`, `@beep/walker/Descend`, `@beep/walker/Expand`).

## Usage

Ascend from a directory, then look for a file in each rung of the chain:

```ts
import { Walker } from "@beep/walker/Walker";
import * as Effect from "effect/Effect";
import * as Path from "effect/Path";

const findConfig = Effect.gen(function* () {
  const path = yield* Path.Path;
  const dirs = yield* Walker.ascend("/home/you/project/packages/app", { stopAt: "/home/you/project" });
  return yield* Walker.findUpward(dirs, (dir) => [path.join(dir, ".apprc")]);
});

// Effect<Option<string>, never, FileSystem | Path>: provide both once at the application edge.
console.log(Effect.isEffect(findConfig)); // true
```

`findRoot` is the same scan over the directories themselves, with a marker predicate instead of a filename:

```ts
import { Walker } from "@beep/walker/Walker";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

const findGitRoot = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const dirs = yield* Walker.ascend("/home/you/project/src");
  return yield* Walker.findRoot(dirs, (dir) => fs.exists(path.join(dir, ".git")));
});

console.log(Effect.isEffect(findGitRoot)); // true
```

Expand a glob from its source text with `compileAndExpand`, which folds the compile error and the walk error into one `GlobExpansionError`:

```ts
import { GlobPatternOptions } from "@beep/glob/GlobPattern";
import { compileAndExpand } from "@beep/walker/Expand";
import * as Effect from "effect/Effect";

const program = compileAndExpand("src/**/*.ts", { cwd: "/repo", glob: GlobPatternOptions.make({ dot: false }) });

console.log(Effect.isEffect(program)); // true
```

## Features

- `Walker.ascend(start, options?)`: the directory chain from `start` toward the root, nearest first. `stopAt` halts the ascent inclusively and is compared in normalized form; `maxDepth` (default 256) caps the chain. Lexical, not physical.
- `Walker.ascendWithin(start, ceiling, options?)`: `ascend` bounded by a physical ceiling passed as an `Option`, stopping at the nearest directory whose real path is the ceiling's real path.
- `Walker.firstMatch`, `Walker.findUpward`, `Walker.findRoot`: first-match scans that absorb each probe's failure and short-circuit at the first hit.
- `descend(pattern, options)`: the file paths a compiled pattern selects under `cwd`, POSIX separators, sorted. `onUnreadable` chooses `"fail"` (default, typed `DescendError`), `"skip"`, or `"record"` (a `DescendResult` with each `UnreadableDirectory` and its cause). `followSymlinks` descends links under a per-branch cycle guard.
- `compileAndExpand(pattern, options)`: `descend` from a glob string, failing with `GlobExpansionError`.
- Option schemas: `AscendOptions`, `DescendOptions`, `DescendRecordOptions` and `CompileAndExpandOptions` are branded `S.Opaque` schemas; the functions accept their unbranded `Encoded` shapes, so callers pass object literals.

## Named importers

The capability gate for `foundation/capability` requires at least two importing packages:

- `@beep/repo-utils`: repo-root discovery (`Root` `findRepoRoot`) and nearest-`tsconfig.json` discovery in `TSMorph` (`resolveFileEntrypointTsConfig`).
- `@beep/repo-cli`: the drawings review-directory lookup (`Drawings.review`) and the owning-package lookup of the test-tsgo programs (`TestTsgoPrograms`).

## Development

```bash
# from the repository root
bun run beep quality package-verify @beep/walker

# from packages/foundation/capability/walker
bun run check
bun run lint
bun run test
bun run docgen
```

Tests live in `test/` and import package source through `@beep/walker/<Module>` aliases; `test/support/fixtures.ts` holds the in-memory platform fixtures built on `@beep/memfs`. `KNOWLEDGE.md` carries the upstream design notes verbatim.

## Provenance

Ported from upstream `@effected/walker` (MIT, C. Spencer Beggs) through the effected port, then promoted from the scratchpad into this workspace package by `goals/effected-promotion` (wave 2b). The package [LICENSE](LICENSE) carries both the beep-effect and the upstream copyright notices. Schema identities moved from `@beep/scratchpad/effected/walker/*` to `@beep/walker/*`.

### Attribution

- Upstream package: `@effected/walker` 0.15.0
- Upstream commit: `af7566a9da2eff169cb74955efcc5ede1e5de9f8` (`$HOME/YeeBois/references/effect/effected`)
- License: [LICENSE](./LICENSE) (upstream MIT notice alongside the beep-effect notice)

### Deviations

The module-level port deviations recorded in the scratchpad port carry over unchanged: Effect collections and helpers in place of native runtime operations, schema-tagged `WalkerDefect`/`DescendDefect` defects, schema-derived option and result models, finite numeric domains with a positive-integer `DepthCap`, dual direct and curried signatures, per-module Effect imports, and `@beep/identity` annotations. On promotion, `AscendOptions`, `DescendOptions`, `DescendRecordOptions`, `CompileAndExpandOptions`, `UnreadableDirectory` and `DescendResult` became branded `S.Opaque` schemas constructed with `X.make` (the upstream `DescendOptions` and `DescendRecordOptions` interfaces are now schemas), the functions take the `X.Encoded` shapes, and `CompileAndExpandOptions` is derived from `DescendOptions`' fields. The downward walk was split into single-purpose helpers with no change in traversal order or failure behaviour.

## License

[MIT](LICENSE)

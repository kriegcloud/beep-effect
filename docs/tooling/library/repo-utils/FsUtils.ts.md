---
title: FsUtils.ts
nav_order: 7
parent: "@beep/repo-utils"
---

## FsUtils.ts overview

Filesystem utility service for common monorepo operations.

Provides effectful wrappers around glob matching, JSON file I/O,
path existence checks, and file/directory type queries.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [FsUtilsLive](#fsutilslive)
- [models](#models)
  - [FsUtils (class)](#fsutils-class)
  - [FsUtilsShape (interface)](#fsutilsshape-interface)
  - [GlobOptions (class)](#globoptions-class)
---

# constructors

## FsUtilsLive

Live layer for `FsUtils` that uses the platform `FileSystem` and `Path`
services.

**Example**

```ts
import { Layer } from "effect"
import { FsUtilsLive } from "@beep/repo-utils/FsUtils"
const layer = Layer.provideMerge(FsUtilsLive, Layer.empty)
console.log(layer)
```

**Signature**

```ts
declare const FsUtilsLive: Layer.Layer<FsUtils, never, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/FsUtils.ts#L177)

Since v0.0.0

# models

## FsUtils (class)

Service tag for `FsUtils`.

**Example**

```ts
import { Effect } from "effect"
import { FsUtils } from "@beep/repo-utils/FsUtils"
const program = Effect.gen(function* () {
  const fsUtils = yield* FsUtils
  return fsUtils
})
console.log(program)
```

**Signature**

```ts
declare class FsUtils
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/FsUtils.ts#L161)

Since v0.0.0

## FsUtilsShape (interface)

Shape of the FsUtils service.

**Example**

```ts
import type { FsUtilsShape } from "@beep/repo-utils/FsUtils"
const methodName = "readJson" satisfies keyof FsUtilsShape
console.log(methodName)
```

**Signature**

```ts
export interface FsUtilsShape {
  /**
   * Verify that a path exists on disk, or fail with `NoSuchFileError`.
   *
   * @since 0.0.0
   */
  readonly existsOrThrow: (filePath: string) => Effect.Effect<void, NoSuchFileError>;

  /**
   * Get the parent directory of a path.
   *
   * @since 0.0.0
   */
  readonly getParentDirectory: (filePath: string) => Effect.Effect<string>;
  /**
   * Match files and directories using glob patterns.
   *
   * @since 0.0.0
   */
  readonly glob: (
    pattern: string | ReadonlyArray<string>,
    options?: undefined | GlobOptions
  ) => Effect.Effect<ReadonlyArray<string>, DomainError>;

  /**
   * Match only files (not directories) using glob patterns.
   *
   * @since 0.0.0
   */
  readonly globFiles: (
    pattern: string | ReadonlyArray<string>,
    options?: undefined | GlobOptions
  ) => Effect.Effect<ReadonlyArray<string>, DomainError>;

  /**
   * Check whether a path is a directory.
   *
   * @since 0.0.0
   */
  readonly isDirectory: (filePath: string) => Effect.Effect<boolean, NoSuchFileError>;

  /**
   * Check whether a path is a regular file.
   *
   * @since 0.0.0
   */
  readonly isFile: (filePath: string) => Effect.Effect<boolean, NoSuchFileError>;

  /**
   * Read a file, apply a transform to its content, and write back only if the
   * content actually changed.
   *
   * @since 0.0.0
   */
  readonly modifyFile: (
    filePath: string,
    transform: (content: string) => string
  ) => Effect.Effect<boolean, NoSuchFileError | DomainError>;

  /**
   * Read and parse a JSON file.
   *
   * Returns `Option.none` when the file content is not valid JSON, while
   * missing-file failures remain in the error channel.
   *
   * @since 0.0.0
   */
  readonly readJson: (filePath: string) => Effect.Effect<O.Option<S.Json>, NoSuchFileError>;

  /**
   * Resolve a path to its canonical absolute form.
   *
   * @since 0.0.0
   */
  readonly realPath: (filePath: string) => Effect.Effect<string, NoSuchFileError>;

  /**
   * Write a value as JSON to a file with 2-space indentation and trailing newline.
   *
   * @since 0.0.0
   */
  readonly writeJson: (filePath: string, json: unknown) => Effect.Effect<void, DomainError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/FsUtils.ts#L61)

Since v0.0.0

## GlobOptions (class)

Options for glob matching operations.

**Example**

```ts
import { GlobOptions } from "@beep/repo-utils/FsUtils"
const options = GlobOptions.make({
  cwd: "src",
  ignore: ["*.test.ts"]
})
console.log(options.cwd)
```

**Signature**

```ts
declare class GlobOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/FsUtils.ts#L37)

Since v0.0.0
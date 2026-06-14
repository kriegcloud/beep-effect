---
title: Files.progress.ts
nav_order: 33
parent: "@beep/repo-cli"
---

## Files.progress.ts overview

Progress rendering and bounded concurrency helpers for Files commands.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [FilesConcurrency](#filesconcurrency)
- [utilities](#utilities)
  - [isFilesProgressEnabled](#isfilesprogressenabled)
  - [renderFilesProgressBar](#renderfilesprogressbar)
  - [runFilesProgressAll](#runfilesprogressall)
  - [runFilesProgressForEach](#runfilesprogressforeach)
---

# constants

## FilesConcurrency

Shared concurrency caps for Files command phases.

**Example**

```ts
import { FilesConcurrency } from "@beep/repo-cli/commands/Files"
console.log(FilesConcurrency)
```

**Signature**

```ts
declare const FilesConcurrency: { readonly ffmpeg: 2; readonly image: 4; readonly metadata: 8; readonly scan: 16; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.progress.ts#L28)

Since v0.0.0

# utilities

## isFilesProgressEnabled

Return true when live Files progress should be rendered.

**Example**

```ts
import { isFilesProgressEnabled } from "@beep/repo-cli/commands/Files"
console.log(isFilesProgressEnabled)
```

**Signature**

```ts
declare const isFilesProgressEnabled: (enabled?: boolean) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.progress.ts#L83)

Since v0.0.0

## renderFilesProgressBar

Render a single-line ASCII progress bar.

**Example**

```ts
import { renderFilesProgressBar } from "@beep/repo-cli/commands/Files"
console.log(renderFilesProgressBar)
```

**Signature**

```ts
declare const renderFilesProgressBar: (options: FilesProgressRenderOptions) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.progress.ts#L98)

Since v0.0.0

## runFilesProgressAll

Run an array of effects with bounded concurrency and optional TTY progress.

**Example**

```ts
import { runFilesProgressAll } from "@beep/repo-cli/commands/Files"
console.log(runFilesProgressAll)
```

**Signature**

```ts
declare const runFilesProgressAll: { <A2, E, R>(options: FilesProgressRunOptions): (effects: ReadonlyArray<Effect.Effect<A2, E, R>>) => Effect.Effect<ReadonlyArray<A2>, E, R | Terminal.Terminal>; <A2, E, R>(effects: ReadonlyArray<Effect.Effect<A2, E, R>>, options: FilesProgressRunOptions): Effect.Effect<ReadonlyArray<A2>, E, R | Terminal.Terminal>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.progress.ts#L124)

Since v0.0.0

## runFilesProgressForEach

Map items to effects, then run them with bounded concurrency and optional TTY progress.

**Example**

```ts
import { runFilesProgressForEach } from "@beep/repo-cli/commands/Files"
console.log(runFilesProgressForEach)
```

**Signature**

```ts
declare const runFilesProgressForEach: { <A2, B, E, R>(f: (item: A2, index: number) => Effect.Effect<B, E, R>, options: FilesProgressRunOptions): (items: ReadonlyArray<A2>) => Effect.Effect<ReadonlyArray<B>, E, R | Terminal.Terminal>; <A2, B, E, R>(items: ReadonlyArray<A2>, f: (item: A2, index: number) => Effect.Effect<B, E, R>, options: FilesProgressRunOptions): Effect.Effect<ReadonlyArray<B>, E, R | Terminal.Terminal>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.progress.ts#L197)

Since v0.0.0
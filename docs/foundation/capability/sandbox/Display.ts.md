---
title: Display.ts
nav_order: 5
parent: "@beep/sandbox"
---

## Display.ts overview

Display services for sandbox runs.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [ClackDisplay](#clackdisplay)
  - [FileDisplay](#filedisplay)
  - [SilentDisplay](#silentdisplay)
- [models](#models)
  - [DisplayEntry (type alias)](#displayentry-type-alias)
  - [DisplayEntryIntro (class)](#displayentryintro-class)
  - [DisplayEntrySpinner (class)](#displayentryspinner-class)
  - [DisplayEntryStatus (class)](#displayentrystatus-class)
  - [DisplayEntrySummary (class)](#displayentrysummary-class)
  - [DisplayEntryTaskLog (class)](#displayentrytasklog-class)
  - [DisplayEntryText (class)](#displayentrytext-class)
  - [DisplayEntryToolCall (class)](#displayentrytoolcall-class)
  - [Severity (type alias)](#severity-type-alias)
- [schemas](#schemas)
  - [DisplayEntry](#displayentry)
  - [Severity](#severity)
- [services](#services)
  - [Display (class)](#display-class)
  - [DisplayServiceShape (interface)](#displayserviceshape-interface)
- [utilities](#utilities)
  - [terminalStyle](#terminalstyle)
---

# layers

## ClackDisplay

Interactive terminal display implementation backed by `@clack/prompts`.

**Example**

```ts
import { ClackDisplay } from "@beep/sandbox/Display"

console.log(ClackDisplay)
```

**Signature**

```ts
declare const ClackDisplay: { layer: Layer.Layer<Display, never, never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L571)

Since v0.0.0

## FileDisplay

File-backed display implementation that appends display output to a log file.

**Example**

```ts
import { FileDisplay } from "@beep/sandbox/Display"

console.log(FileDisplay)
```

**Signature**

```ts
declare const FileDisplay: { layer: (filePath: string) => Layer.Layer<Display, never, FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L513)

Since v0.0.0

## SilentDisplay

Display implementation that records entries in a `Ref`.

**Example**

```ts
import { SilentDisplay } from "@beep/sandbox/Display"

console.log(SilentDisplay)
```

**Signature**

```ts
declare const SilentDisplay: { layer: (ref: Ref.Ref<ReadonlyArray<DisplayEntry>>) => Layer.Layer<Display>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L318)

Since v0.0.0

# models

## DisplayEntry (type alias)

Runtime type for `DisplayEntry`.

**Signature**

```ts
type DisplayEntry = typeof DisplayEntry.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L245)

Since v0.0.0

## DisplayEntryIntro (class)

Intro entry captured by a display implementation.

**Example**

```ts
import { DisplayEntryIntro } from "@beep/sandbox/Display"

console.log(DisplayEntryIntro)
```

**Signature**

```ts
declare class DisplayEntryIntro
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L83)

Since v0.0.0

## DisplayEntrySpinner (class)

Spinner entry captured by a display implementation.

**Example**

```ts
import { DisplayEntrySpinner } from "@beep/sandbox/Display"

console.log(DisplayEntrySpinner)
```

**Signature**

```ts
declare class DisplayEntrySpinner
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L106)

Since v0.0.0

## DisplayEntryStatus (class)

Status entry captured by a display implementation.

**Example**

```ts
import { DisplayEntryStatus } from "@beep/sandbox/Display"

console.log(DisplayEntryStatus)
```

**Signature**

```ts
declare class DisplayEntryStatus
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L59)

Since v0.0.0

## DisplayEntrySummary (class)

Summary entry captured by a display implementation.

**Example**

```ts
import { DisplayEntrySummary } from "@beep/sandbox/Display"

console.log(DisplayEntrySummary)
```

**Signature**

```ts
declare class DisplayEntrySummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L129)

Since v0.0.0

## DisplayEntryTaskLog (class)

Task log entry captured by a display implementation.

**Example**

```ts
import { DisplayEntryTaskLog } from "@beep/sandbox/Display"

console.log(DisplayEntryTaskLog)
```

**Signature**

```ts
declare class DisplayEntryTaskLog
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L153)

Since v0.0.0

## DisplayEntryText (class)

Text entry captured by a display implementation.

**Example**

```ts
import { DisplayEntryText } from "@beep/sandbox/Display"

console.log(DisplayEntryText)
```

**Signature**

```ts
declare class DisplayEntryText
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L177)

Since v0.0.0

## DisplayEntryToolCall (class)

Tool-call entry captured by a display implementation.

**Example**

```ts
import { DisplayEntryToolCall } from "@beep/sandbox/Display"

console.log(DisplayEntryToolCall)
```

**Signature**

```ts
declare class DisplayEntryToolCall
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L200)

Since v0.0.0

## Severity (type alias)

Runtime type for `Severity`.

**Signature**

```ts
type Severity = typeof Severity.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L44)

Since v0.0.0

# schemas

## DisplayEntry

Display entry union.

**Example**

```ts
import { DisplayEntry } from "@beep/sandbox/Display"

console.log(DisplayEntry)
```

**Signature**

```ts
declare const DisplayEntry: S.toTaggedUnion<"_tag", readonly [typeof DisplayEntryStatus, typeof DisplayEntryIntro, typeof DisplayEntrySpinner, typeof DisplayEntrySummary, typeof DisplayEntryTaskLog, typeof DisplayEntryText, typeof DisplayEntryToolCall]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L224)

Since v0.0.0

## Severity

Severity - The severity of the display message.

**Example**

```ts
import { Severity } from "@beep/sandbox/Display"

console.log(Severity)
```

**Signature**

```ts
declare const Severity: AnnotatedSchema<LiteralKit<readonly ["Info", "Success", "Warn", "Error"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L32)

Since v0.0.0

# services

## Display (class)

Display service.

**Example**

```ts
import { Display } from "@beep/sandbox/Display"

console.log(Display)
```

**Signature**

```ts
declare class Display
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L293)

Since v0.0.0

## DisplayServiceShape (interface)

Display service shape.

**Example**

```ts
import type { DisplayServiceShape } from "@beep/sandbox/Display"

const value = {} as DisplayServiceShape
console.log(value)
```

**Signature**

```ts
export interface DisplayServiceShape {
  readonly intro: (title: string) => Effect.Effect<void>;

  readonly spinner: <A, E, R>(message: string, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;

  readonly status: (message: string, severity: Severity) => Effect.Effect<void>;

  readonly summary: (title: string, rows: Record<string, string>) => Effect.Effect<void>;

  readonly taskLog: <A, E, R>(
    title: string,
    effect: (message: (msg: string) => void) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;

  readonly text: (message: string) => Effect.Effect<void>;

  readonly toolCall: (name: string, formattedArgs: string) => Effect.Effect<void>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L261)

Since v0.0.0

# utilities

## terminalStyle

Terminal text styles used by `ClackDisplay`.

**Example**

```ts
import { terminalStyle } from "@beep/sandbox/Display"

console.log(terminalStyle)
```

**Signature**

```ts
declare const terminalStyle: { status: (message: string) => string; summaryTitle: (title: string) => string; summaryRow: (key: string, value: string) => string; toolCall: (text: string) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Display.ts#L550)

Since v0.0.0
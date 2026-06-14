---
title: terminalCleanup.ts
nav_order: 27
parent: "@beep/sandbox"
---

## terminalCleanup.ts overview

Escape sequence that restores terminal cursor visibility.

**Example**

```ts
import { SHOW_CURSOR } from "@beep/sandbox"

process.stdout.write(SHOW_CURSOR)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [SHOW_CURSOR](#show_cursor)
- [constructors](#constructors)
  - [makeTerminalCleanupHandler](#maketerminalcleanuphandler)
  - [setupTerminalCleanup](#setupterminalcleanup)
- [models](#models)
  - [TerminalCleanupStdin (interface)](#terminalcleanupstdin-interface)
  - [TerminalCleanupStdout (interface)](#terminalcleanupstdout-interface)
---

# constants

## SHOW_CURSOR

Escape sequence that restores terminal cursor visibility.

**Example**

```ts
import { SHOW_CURSOR } from "@beep/sandbox"

process.stdout.write(SHOW_CURSOR)
```

**Signature**

```ts
declare const SHOW_CURSOR: "\u001B[?25h"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/terminalCleanup.ts#L21)

Since v0.0.0

# constructors

## makeTerminalCleanupHandler

Create a synchronous exit handler that restores terminal state.

**Example**

```ts
import { makeTerminalCleanupHandler } from "@beep/sandbox"

const handler = makeTerminalCleanupHandler(process.stdin, process.stdout)
handler()
```

**Signature**

```ts
declare const makeTerminalCleanupHandler: (stdin: TerminalCleanupStdin, stdout: TerminalCleanupStdout) => (() => void)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/terminalCleanup.ts#L74)

Since v0.0.0

## setupTerminalCleanup

Register terminal cleanup for process exit.

**Example**

```ts
import { setupTerminalCleanup } from "@beep/sandbox"

setupTerminalCleanup()
```

**Signature**

```ts
declare const setupTerminalCleanup: () => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/terminalCleanup.ts#L100)

Since v0.0.0

# models

## TerminalCleanupStdin (interface)

Minimal stdin surface required by terminal cleanup.

**Example**

```ts
import type { TerminalCleanupStdin } from "@beep/sandbox/terminalCleanup"

const value = {} as TerminalCleanupStdin
console.log(value)
```

**Signature**

```ts
export interface TerminalCleanupStdin {
  readonly isTTY?: boolean;
  readonly setRawMode?: (raw: boolean) => void;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/terminalCleanup.ts#L37)

Since v0.0.0

## TerminalCleanupStdout (interface)

Minimal stdout surface required by terminal cleanup.

**Example**

```ts
import type { TerminalCleanupStdout } from "@beep/sandbox/terminalCleanup"

const value = {} as TerminalCleanupStdout
console.log(value)
```

**Signature**

```ts
export interface TerminalCleanupStdout {
  readonly write: (data: string) => boolean;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/terminalCleanup.ts#L56)

Since v0.0.0
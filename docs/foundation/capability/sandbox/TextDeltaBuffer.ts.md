---
title: TextDeltaBuffer.ts
nav_order: 28
parent: "@beep/sandbox"
---

## TextDeltaBuffer.ts overview

Streaming text delta buffering helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [TextDeltaBuffer (class)](#textdeltabuffer-class)
    - [write (method)](#write-method)
    - [flush (method)](#flush-method)
    - [dispose (method)](#dispose-method)
    - [#shouldFlush (method)](#%23shouldflush-method)
    - [#flushBuffer (method)](#%23flushbuffer-method)
    - [#clearTimer (method)](#%23cleartimer-method)
    - [#onFlush (property)](#%23onflush-property)
    - [#options (property)](#%23options-property)
    - [#buffer (property)](#%23buffer-property)
    - [#timer (property)](#%23timer-property)
- [models](#models)
  - [TextDeltaBufferOptions (class)](#textdeltabufferoptions-class)
  - [TextDeltaFlush (type alias)](#textdeltaflush-type-alias)
---

# constructors

## TextDeltaBuffer (class)

Buffers streaming text deltas into readable chunks.

**Example**

```ts
import { TextDeltaBuffer } from "@beep/sandbox"
import { A } from "@beep/utils"

const flushed: Array<string> = []
const buffer = new TextDeltaBuffer((text) => A.appendInPlace(flushed, text))

buffer.write("Hello. ")
buffer.dispose()
```

**Signature**

```ts
declare class TextDeltaBuffer { constructor(onFlush: TextDeltaFlush, options: TextDeltaBufferOptions = defaultOptions) }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L83)

Since v0.0.0

### write (method)

Append a text delta and flush when a readability boundary is reached.

**Signature**

```ts
declare const write: (text: string) => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L100)

Since v0.0.0

### flush (method)

Force any buffered text to flush.

**Signature**

```ts
declare const flush: () => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L131)

Since v0.0.0

### dispose (method)

Flush buffered text and cancel pending timers.

**Signature**

```ts
declare const dispose: () => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L142)

Since v0.0.0

### #shouldFlush (method)

**Signature**

```ts
declare const #shouldFlush: () => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L146)

### #flushBuffer (method)

**Signature**

```ts
declare const #flushBuffer: () => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L154)

### #clearTimer (method)

**Signature**

```ts
declare const #clearTimer: () => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L164)

### #onFlush (property)

**Signature**

```ts
readonly #onFlush: TextDeltaFlush
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L84)

### #options (property)

**Signature**

```ts
readonly #options: TextDeltaBufferOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L85)

### #buffer (property)

**Signature**

```ts
#buffer: string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L86)

### #timer (property)

**Signature**

```ts
#timer: Fiber.Fiber<void, never> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L87)

# models

## TextDeltaBufferOptions (class)

Configuration for `TextDeltaBuffer`.

**Example**

```ts
import { TextDeltaBufferOptions } from "@beep/sandbox"

const options = TextDeltaBufferOptions.make({
  debounceMs: 50,
  lengthThreshold: 80,
})
```

**Signature**

```ts
declare class TextDeltaBufferOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L34)

Since v0.0.0

## TextDeltaFlush (type alias)

Callback invoked whenever buffered text is flushed.

**Example**

```ts
import type { TextDeltaFlush } from "@beep/sandbox/TextDeltaBuffer"

const value = {} as TextDeltaFlush
console.log(value)
```

**Signature**

```ts
type TextDeltaFlush = (text: string) => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/TextDeltaBuffer.ts#L63)

Since v0.0.0
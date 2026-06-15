---
title: Logs.ts
nav_order: 145
parent: "@beep/schema"
---

## Logs.ts overview

Log level and log severity literal kits.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [LogLevel](#loglevel)
  - [LogLevel (type alias)](#loglevel-type-alias)
  - [LogSeverity](#logseverity)
  - [LogSeverity (type alias)](#logseverity-type-alias)
---

# models

## LogLevel

Supported log levels including global enable-all and disable-all sentinels.

**Example**

```ts
import * as S from "effect/Schema"
import { LogLevel } from "@beep/schema/Logs"

const level = S.decodeUnknownSync(LogLevel)("Info")
console.log(level)

LogLevel.Enum.Info  // "Info"
LogLevel.is.Debug("Debug") // true
```

**Signature**

```ts
declare const LogLevel: AnnotatedSchema<LiteralKit<readonly ["All", "Fatal", "Error", "Warn", "Info", "Debug", "Trace", "None"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Logs.ts#L31)

Since v0.0.0

## LogLevel (type alias)

Runtime type for `LogLevel`.

**Signature**

```ts
type LogLevel = typeof LogLevel.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Logs.ts#L43)

Since v0.0.0

## LogSeverity

Supported log severities emitted by the logger (excludes `All` and `None`).

**Example**

```ts
import * as S from "effect/Schema"
import { LogSeverity } from "@beep/schema/Logs"

const severity = S.decodeUnknownSync(LogSeverity)("Error")
console.log(severity)

LogSeverity.Enum.Warn  // "Warn"
```

**Signature**

```ts
declare const LogSeverity: AnnotatedSchema<LiteralKit<readonly ["Fatal", "Error", "Warn", "Info", "Debug", "Trace"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Logs.ts#L62)

Since v0.0.0

## LogSeverity (type alias)

Runtime type for `LogSeverity`.

**Signature**

```ts
type LogSeverity = typeof LogSeverity.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Logs.ts#L74)

Since v0.0.0
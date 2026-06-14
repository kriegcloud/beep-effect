---
title: Agent.provider.ts
nav_order: 1
parent: "@beep/sandbox"
---

## Agent.provider.ts overview

Agent provider contracts and built-in Claude/Codex providers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [claudeCode](#claudecode)
  - [codex](#codex)
  - [opencode](#opencode)
  - [pi](#pi)
- [models](#models)
  - [AgentCommandOptions (class)](#agentcommandoptions-class)
  - [ClaudeCodeOptions (class)](#claudecodeoptions-class)
  - [ClaudeEffort (type alias)](#claudeeffort-type-alias)
  - [CodexEffort (type alias)](#codexeffort-type-alias)
  - [CodexOptions (class)](#codexoptions-class)
  - [IterationUsage (class)](#iterationusage-class)
  - [OpenCodeOptions (class)](#opencodeoptions-class)
  - [ParsedStreamEvent (type alias)](#parsedstreamevent-type-alias)
  - [PiOptions (class)](#pioptions-class)
  - [PrintCommand (class)](#printcommand-class)
- [schemas](#schemas)
  - [ClaudeEffort](#claudeeffort)
  - [CodexEffort](#codexeffort)
  - [ParsedStreamEvent](#parsedstreamevent)
- [services](#services)
  - [AgentProvider (interface)](#agentprovider-interface)
- [utilities](#utilities)
  - [DEFAULT_CLAUDE_MODEL](#default_claude_model)
---

# constructors

## claudeCode

Create a Claude Code agent provider.

**Example**

```ts
import { claudeCode } from "@beep/sandbox/Agent.provider"

console.log(claudeCode)
```

**Signature**

```ts
declare const claudeCode: (model?: string, options?: ClaudeCodeOptions) => AgentProvider
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L936)

Since v0.0.0

## codex

Create a Codex agent provider.

**Example**

```ts
import { codex } from "@beep/sandbox/Agent.provider"

console.log(codex)
```

**Signature**

```ts
declare const codex: (model: string, options?: CodexOptions) => AgentProvider
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L852)

Since v0.0.0

## opencode

Create an OpenCode agent provider.

**Example**

```ts
import { opencode } from "@beep/sandbox/Agent.provider"

console.log(opencode)
```

**Signature**

```ts
declare const opencode: (model: string, options?: OpenCodeOptions) => AgentProvider
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L910)

Since v0.0.0

## pi

Create a Pi agent provider.

**Example**

```ts
import { pi } from "@beep/sandbox/Agent.provider"

console.log(pi)
```

**Signature**

```ts
declare const pi: (model: string, options?: PiOptions) => AgentProvider
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L883)

Since v0.0.0

# models

## AgentCommandOptions (class)

Options passed when building an agent command.

**Example**

```ts
import { AgentCommandOptions } from "@beep/sandbox/Agent.provider"

console.log(AgentCommandOptions)
```

**Signature**

```ts
declare class AgentCommandOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L434)

Since v0.0.0

## ClaudeCodeOptions (class)

Options for the Claude Code provider.

**Example**

```ts
import { ClaudeCodeOptions } from "@beep/sandbox/Agent.provider"

console.log(ClaudeCodeOptions)
```

**Signature**

```ts
declare class ClaudeCodeOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L573)

Since v0.0.0

## ClaudeEffort (type alias)

Runtime type for `ClaudeEffort`.

**Signature**

```ts
type ClaudeEffort = typeof ClaudeEffort.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L419)

Since v0.0.0

## CodexEffort (type alias)

Runtime type for `CodexEffort`.

**Signature**

```ts
type CodexEffort = typeof CodexEffort.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L392)

Since v0.0.0

## CodexOptions (class)

Options for the Codex provider.

**Example**

```ts
import { CodexOptions } from "@beep/sandbox/Agent.provider"

console.log(CodexOptions)
```

**Signature**

```ts
declare class CodexOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L506)

Since v0.0.0

## IterationUsage (class)

Token usage snapshot extracted from an agent session.

**Example**

```ts
import { IterationUsage } from "@beep/sandbox/Agent.provider"

console.log(IterationUsage)
```

**Signature**

```ts
declare class IterationUsage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L481)

Since v0.0.0

## OpenCodeOptions (class)

Options for the OpenCode provider.

**Example**

```ts
import { OpenCodeOptions } from "@beep/sandbox/Agent.provider"

console.log(OpenCodeOptions)
```

**Signature**

```ts
declare class OpenCodeOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L551)

Since v0.0.0

## ParsedStreamEvent (type alias)

Runtime type for `ParsedStreamEvent`.

**Signature**

```ts
type ParsedStreamEvent = typeof ParsedStreamEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L365)

Since v0.0.0

## PiOptions (class)

Options for the Pi provider.

**Example**

```ts
import { PiOptions } from "@beep/sandbox/Agent.provider"

console.log(PiOptions)
```

**Signature**

```ts
declare class PiOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L529)

Since v0.0.0

## PrintCommand (class)

Command emitted by an agent provider.

**Example**

```ts
import { PrintCommand } from "@beep/sandbox/Agent.provider"

console.log(PrintCommand)
```

**Signature**

```ts
declare class PrintCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L458)

Since v0.0.0

# schemas

## ClaudeEffort

Reasoning effort accepted by the Claude Code provider.

**Example**

```ts
import { ClaudeEffort } from "@beep/sandbox/Agent.provider"

console.log(ClaudeEffort)
```

**Signature**

```ts
declare const ClaudeEffort: AnnotatedSchema<LiteralKit<readonly ["low", "medium", "high", "max"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L407)

Since v0.0.0

## CodexEffort

Reasoning effort accepted by the Codex provider.

**Example**

```ts
import { CodexEffort } from "@beep/sandbox/Agent.provider"

console.log(CodexEffort)
```

**Signature**

```ts
declare const CodexEffort: AnnotatedSchema<LiteralKit<readonly ["low", "medium", "high", "xhigh"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L380)

Since v0.0.0

## ParsedStreamEvent

Parsed event emitted by an agent stream line.

**Example**

```ts
import { ParsedStreamEvent } from "@beep/sandbox/Agent.provider"

console.log(ParsedStreamEvent)
```

**Signature**

```ts
declare const ParsedStreamEvent: AnnotatedSchema<S.TaggedUnion<{ readonly Result: S.TaggedStruct<"Result", { readonly result: S.String; }>; readonly SessionId: S.TaggedStruct<"SessionId", { readonly sessionId: S.String; }>; readonly Text: S.TaggedStruct<"Text", { readonly text: S.String; }>; readonly ToolCall: S.TaggedStruct<"ToolCall", { readonly args: S.String; readonly name: S.String; }>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L339)

Since v0.0.0

# services

## AgentProvider (interface)

Effect-first agent provider contract.

**Example**

```ts
import type { AgentProvider } from "@beep/sandbox/Agent.provider"

const value = {} as AgentProvider
console.log(value)
```

**Signature**

```ts
export interface AgentProvider {
  readonly buildInteractiveArgs?: undefined | ((options: AgentCommandOptions) => ReadonlyArray<string>);
  readonly buildPrintCommand: (options: AgentCommandOptions) => PrintCommand;
  readonly captureSessions: boolean;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
  readonly parseSessionUsage?: undefined | ((content: string) => O.Option<IterationUsage>);
  readonly parseStreamLine: (line: string) => ReadonlyArray<ParsedStreamEvent>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L598)

Since v0.0.0

# utilities

## DEFAULT_CLAUDE_MODEL

Default Claude model used by the source Sandcastle implementation.

**Example**

```ts
import { DEFAULT_CLAUDE_MODEL } from "@beep/sandbox/Agent.provider"

console.log(DEFAULT_CLAUDE_MODEL)
```

**Signature**

```ts
declare const DEFAULT_CLAUDE_MODEL: "claude-opus-4-6"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Agent.provider.ts#L621)

Since v0.0.0
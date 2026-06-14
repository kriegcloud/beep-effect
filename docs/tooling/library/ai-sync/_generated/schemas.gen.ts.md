---
title: schemas.gen.ts
nav_order: 1
parent: "@beep/ai-sync"
---

## schemas.gen.ts overview

Generated AI sync schemas and source metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [ClaudeMcpJson (class)](#claudemcpjson-class)
  - [ClaudeSettings (class)](#claudesettings-class)
  - [CodexConfig (class)](#codexconfig-class)
  - [CodexMcpServer (class)](#codexmcpserver-class)
  - [CodexSkillEntry (class)](#codexskillentry-class)
  - [CodexSkills (class)](#codexskills-class)
  - [McpJsonServer (class)](#mcpjsonserver-class)
---

# schemas

## ClaudeMcpJson (class)

Generated Claude-style MCP JSON schema.

**Example**

```ts
import { ClaudeMcpJson } from "@beep/ai-sync"
console.log(ClaudeMcpJson.ast)
```

**Signature**

```ts
declare class ClaudeMcpJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/schemas.gen.ts#L158)

Since v0.0.0

## ClaudeSettings (class)

Generated Claude Code settings schema subset.

**Example**

```ts
import { ClaudeSettings } from "@beep/ai-sync"
console.log(ClaudeSettings.ast)
```

**Signature**

```ts
declare class ClaudeSettings
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/schemas.gen.ts#L178)

Since v0.0.0

## CodexConfig (class)

Generated Codex config schema.

**Example**

```ts
import { CodexConfig } from "@beep/ai-sync"
console.log(CodexConfig.ast)
```

**Signature**

```ts
declare class CodexConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/schemas.gen.ts#L95)

Since v0.0.0

## CodexMcpServer (class)

Generated MCP server command configuration.

**Example**

```ts
import { CodexMcpServer } from "@beep/ai-sync"
console.log(CodexMcpServer.ast)
```

**Signature**

```ts
declare class CodexMcpServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/schemas.gen.ts#L27)

Since v0.0.0

## CodexSkillEntry (class)

Generated Codex skill entry.

**Example**

```ts
import { CodexSkillEntry } from "@beep/ai-sync"
const entry = CodexSkillEntry.make({ name: "effect-first-development", enabled: true })
console.log(entry.name)
```

**Signature**

```ts
declare class CodexSkillEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/schemas.gen.ts#L53)

Since v0.0.0

## CodexSkills (class)

Generated Codex skills block.

**Example**

```ts
import { CodexSkills } from "@beep/ai-sync"
console.log(CodexSkills.ast)
```

**Signature**

```ts
declare class CodexSkills
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/schemas.gen.ts#L74)

Since v0.0.0

## McpJsonServer (class)

Generated Claude-style MCP server schema.

**Example**

```ts
import { McpJsonServer } from "@beep/ai-sync"
console.log(McpJsonServer.ast)
```

**Signature**

```ts
declare class McpJsonServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/_generated/schemas.gen.ts#L128)

Since v0.0.0
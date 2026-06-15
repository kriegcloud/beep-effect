---
title: schemas.ts
nav_order: 7
parent: "@beep/ai-sync"
---

## schemas.ts overview

Native AI agent configuration schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [AgentCommandMetadata (class)](#agentcommandmetadata-class)
  - [AgentInstructionDocument](#agentinstructiondocument)
  - [AgentInstructionDocument (type alias)](#agentinstructiondocument-type-alias)
  - [AgentPluginManifestMetadata (class)](#agentpluginmanifestmetadata-class)
  - [AgentSkillFrontmatter (class)](#agentskillfrontmatter-class)
  - [ClaudeMcpJson](#claudemcpjson)
  - [ClaudeSettings](#claudesettings)
  - [CodexConfig](#codexconfig)
  - [CodexMcpServer](#codexmcpserver)
  - [CodexSkillEntry](#codexskillentry)
  - [CodexSkills](#codexskills)
  - [McpJsonServer](#mcpjsonserver)
  - [UnknownNativeSchemaCell (class)](#unknownnativeschemacell-class)
- [validation](#validation)
  - [decodeClaudeMcpJsonObject](#decodeclaudemcpjsonobject)
  - [decodeClaudeSettingsObject](#decodeclaudesettingsobject)
  - [decodeCodexConfigObject](#decodecodexconfigobject)
  - [renderSchemaIssueMessage](#renderschemaissuemessage)
---

# schemas

## AgentCommandMetadata (class)

Documentation-backed generic command metadata.

**Example**

```ts
import { AgentCommandMetadata } from "@beep/ai-sync"
const command = AgentCommandMetadata.make({ name: "review", description: "Review the repo" })
console.log(command.name)
```

**Signature**

```ts
declare class AgentCommandMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L115)

Since v0.0.0

## AgentInstructionDocument

Agent instruction markdown document.

**Example**

```ts
import { AgentInstructionDocument } from "@beep/ai-sync"
console.log(AgentInstructionDocument.ast)
```

**Signature**

```ts
declare const AgentInstructionDocument: AnnotatedSchema<S.NonEmptyString>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L35)

Since v0.0.0

## AgentInstructionDocument (type alias)

Runtime type for `AgentInstructionDocument`.

**Example**

```ts
import type { AgentInstructionDocument } from "@beep/ai-sync"
const document: AgentInstructionDocument = "# Instructions"
console.log(document)
```

**Signature**

```ts
type AgentInstructionDocument = typeof AgentInstructionDocument.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L53)

Since v0.0.0

## AgentPluginManifestMetadata (class)

Generic package/plugin manifest metadata used only where a native schema is known.

**Example**

```ts
import { AgentPluginManifestMetadata } from "@beep/ai-sync"
const manifest = AgentPluginManifestMetadata.make({ name: "example", version: "0.0.0" })
console.log(manifest.version)
```

**Signature**

```ts
declare class AgentPluginManifestMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L138)

Since v0.0.0

## AgentSkillFrontmatter (class)

Generic agent skill frontmatter shared by compatible agents.

**Example**

```ts
import { AgentSkillFrontmatter } from "@beep/ai-sync"
console.log(AgentSkillFrontmatter.ast)
```

**Signature**

```ts
declare class AgentSkillFrontmatter
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L66)

Since v0.0.0

## ClaudeMcpJson

Generated Codex config schema, Claude-style MCP JSON, and settings schemas.

**Signature**

```ts
declare const ClaudeMcpJson: typeof ClaudeMcpJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L156)

Since v0.0.0

## ClaudeSettings

Generated Codex config schema, Claude-style MCP JSON, and settings schemas.

**Signature**

```ts
declare const ClaudeSettings: typeof ClaudeSettings
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L156)

Since v0.0.0

## CodexConfig

Generated Codex config schema, Claude-style MCP JSON, and settings schemas.

**Signature**

```ts
declare const CodexConfig: typeof CodexConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L156)

Since v0.0.0

## CodexMcpServer

Generated Codex config schema, Claude-style MCP JSON, and settings schemas.

**Signature**

```ts
declare const CodexMcpServer: typeof CodexMcpServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L156)

Since v0.0.0

## CodexSkillEntry

Generated Codex config schema, Claude-style MCP JSON, and settings schemas.

**Signature**

```ts
declare const CodexSkillEntry: typeof CodexSkillEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L156)

Since v0.0.0

## CodexSkills

Generated Codex config schema, Claude-style MCP JSON, and settings schemas.

**Signature**

```ts
declare const CodexSkills: typeof CodexSkills
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L156)

Since v0.0.0

## McpJsonServer

Generated Codex config schema, Claude-style MCP JSON, and settings schemas.

**Signature**

```ts
declare const McpJsonServer: typeof McpJsonServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L156)

Since v0.0.0

## UnknownNativeSchemaCell (class)

Unknown native schema marker for documented-but-undisclosed surfaces.

**Example**

```ts
import { UnknownNativeSchemaCell } from "@beep/ai-sync"
const cell = UnknownNativeSchemaCell.make({
  agent: "grok-build",
  domain: "hooks",
  reason: "Native hook payload schema is not public."
})
console.log(cell.reason)
```

**Signature**

```ts
declare class UnknownNativeSchemaCell
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L92)

Since v0.0.0

# validation

## decodeClaudeMcpJsonObject

Decoder for Claude-style MCP JSON values after JSON parsing.

**Example**

```ts
import { decodeClaudeMcpJsonObject } from "@beep/ai-sync"
console.log(decodeClaudeMcpJsonObject)
```

**Signature**

```ts
declare const decodeClaudeMcpJsonObject: (input: unknown, options?: ParseOptions) => Effect.Effect<ClaudeMcpJson, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L182)

Since v0.0.0

## decodeClaudeSettingsObject

Decoder for Claude settings JSON values after JSON parsing.

**Example**

```ts
import { decodeClaudeSettingsObject } from "@beep/ai-sync"
console.log(decodeClaudeSettingsObject)
```

**Signature**

```ts
declare const decodeClaudeSettingsObject: (input: unknown, options?: ParseOptions) => Effect.Effect<ClaudeSettings, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L195)

Since v0.0.0

## decodeCodexConfigObject

Decoder for Codex TOML config values after TOML parsing.

**Example**

```ts
import { decodeCodexConfigObject } from "@beep/ai-sync"
console.log(decodeCodexConfigObject)
```

**Signature**

```ts
declare const decodeCodexConfigObject: (input: unknown, options?: ParseOptions) => Effect.Effect<CodexConfig, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L169)

Since v0.0.0

## renderSchemaIssueMessage

Helper that turns schema issues into a bounded message.

**Example**

```ts
import { renderSchemaIssueMessage } from "@beep/ai-sync"
console.log(renderSchemaIssueMessage)
```

**Signature**

```ts
declare const renderSchemaIssueMessage: (cause: unknown) => Effect.Effect<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/schemas.ts#L210)

Since v0.0.0
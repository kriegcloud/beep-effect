---
title: transforms.ts
nav_order: 9
parent: "@beep/ai-sync"
---

## transforms.ts overview

V1 cross-agent transforms.

Since v0.0.0

---
## Exports Grouped by Category
- [interop](#interop)
  - [claudeMcpJsonToCodexConfig](#claudemcpjsontocodexconfig)
  - [claudeMcpJsonToJunieMcpJson](#claudemcpjsontojuniemcpjson)
  - [codexMcpServersToClaudeMcpJson](#codexmcpserverstoclaudemcpjson)
  - [junieMcpJsonToClaudeMcpJson](#juniemcpjsontoclaudemcpjson)
- [normalization](#normalization)
  - [normalizeAgentSkillFrontmatter](#normalizeagentskillfrontmatter)
  - [normalizeInstructionDocument](#normalizeinstructiondocument)
---

# interop

## claudeMcpJsonToCodexConfig

Transform Claude-style `.mcp.json` into the Codex TOML MCP server block.

**Example**

```ts
import { ClaudeMcpJson, claudeMcpJsonToCodexConfig } from "@beep/ai-sync"
const config = ClaudeMcpJson.make({ mcpServers: {} })
console.log(claudeMcpJsonToCodexConfig(config).mcp_servers)
```

**Signature**

```ts
declare const claudeMcpJsonToCodexConfig: (config: ClaudeMcpJson) => CodexConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/transforms.ts#L78)

Since v0.0.0

## claudeMcpJsonToJunieMcpJson

Transform Claude-style `.mcp.json` into the modeled Junie project MCP shape.

**Example**

```ts
import { ClaudeMcpJson, claudeMcpJsonToJunieMcpJson } from "@beep/ai-sync"
const config = ClaudeMcpJson.make({ mcpServers: {} })
console.log(claudeMcpJsonToJunieMcpJson(config).mcpServers)
```

**Signature**

```ts
declare const claudeMcpJsonToJunieMcpJson: (config: ClaudeMcpJson) => ClaudeMcpJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/transforms.ts#L97)

Since v0.0.0

## codexMcpServersToClaudeMcpJson

Transform Codex TOML MCP server config into Claude-style `.mcp.json`.

**Example**

```ts
import { CodexConfig, codexMcpServersToClaudeMcpJson } from "@beep/ai-sync"
const config = CodexConfig.make({
  mcp_servers: { local: { command: "node", args: ["server.js"] } }
})
console.log(codexMcpServersToClaudeMcpJson(config).mcpServers.local.command)
```

**Signature**

```ts
declare const codexMcpServersToClaudeMcpJson: (config: CodexConfig) => ClaudeMcpJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/transforms.ts#L59)

Since v0.0.0

## junieMcpJsonToClaudeMcpJson

Transform the modeled Junie project MCP shape into Claude-style `.mcp.json`.

**Example**

```ts
import { ClaudeMcpJson, junieMcpJsonToClaudeMcpJson } from "@beep/ai-sync"
const config = ClaudeMcpJson.make({ mcpServers: {} })
console.log(junieMcpJsonToClaudeMcpJson(config).mcpServers)
```

**Signature**

```ts
declare const junieMcpJsonToClaudeMcpJson: (config: ClaudeMcpJson) => ClaudeMcpJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/transforms.ts#L113)

Since v0.0.0

# normalization

## normalizeAgentSkillFrontmatter

Keep only the shared Agent Skills frontmatter fields modeled in V1.

**Example**

```ts
import { AgentSkillFrontmatter, normalizeAgentSkillFrontmatter } from "@beep/ai-sync"
const skill = AgentSkillFrontmatter.make({ name: "review", description: "Review code" })
console.log(normalizeAgentSkillFrontmatter(skill).name)
```

**Signature**

```ts
declare const normalizeAgentSkillFrontmatter: (frontmatter: AgentSkillFrontmatter) => AgentSkillFrontmatter
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/transforms.ts#L144)

Since v0.0.0

## normalizeInstructionDocument

Normalize markdown instruction documents for compatible rule surfaces.

**Example**

```ts
import { normalizeInstructionDocument } from "@beep/ai-sync"
console.log(normalizeInstructionDocument("# Rules"))
```

**Signature**

```ts
declare const normalizeInstructionDocument: (self: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/transforms.ts#L128)

Since v0.0.0
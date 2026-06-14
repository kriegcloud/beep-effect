---
title: bin.ts
nav_order: 1
parent: "@beep/nlp-mcp"
---

## bin.ts overview

stdio entrypoint for the `@beep/nlp` MCP server.

Launches the `Server.makeServerLayer` stdio-transport MCP server so an
MCP client (e.g. an editor or agent runtime) can call the NLP tools over
standard input/output. Register in an MCP client config by pointing it at this
file via `bun run`.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [SERVER_CONFIG](#server_config)
---

# configuration

## SERVER_CONFIG

The server identity advertised to MCP clients by this entrypoint.

**Example**

```ts
import { SERVER_CONFIG } from "@beep/nlp-mcp/bin"

console.log(SERVER_CONFIG.name)
```

**Signature**

```ts
declare const SERVER_CONFIG: NlpMcpServerConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/bin.ts#L34)

Since v0.0.0
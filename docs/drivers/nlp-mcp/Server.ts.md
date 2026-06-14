---
title: Server.ts
nav_order: 3
parent: "@beep/nlp-mcp"
---

## Server.ts overview

MCP server wiring for the `@beep/nlp` MCP driver.

Mounts two toolkits into a single stdio-transport MCP server:

- the canonical `NlpToolkit` from `@beep/nlp`, backed by the wink-nlp
  handler layer (`WinkNlpToolkitLive`) from `@beep/wink`; and
- the `StreamingToolkit` streaming/file-IO toolkit, backed by its
  `StreamingToolkitHandlersLive` handler layer.

Both toolkit layers consume the same memoized `McpServer` provided by
`McpServer.layerStdio`, so they register into one server. The streaming
handlers' `FileSystem`/`Path` requirement intentionally bubbles up so the
layer stays platform-agnostic; a node implementation is provided at the
entrypoint (see `./bin.ts`).

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [makeServerLayer](#makeserverlayer)
- [models](#models)
  - [NlpMcpServerConfig (class)](#nlpmcpserverconfig-class)
---

# layers

## makeServerLayer

Build the stdio-transport MCP server layer exposing the NLP and streaming
toolkits.

Registers both the canonical `NlpToolkit` (with its wink-backed
`WinkNlpToolkitLive` handlers) and the `StreamingToolkit` (with
its `StreamingToolkitHandlersLive` handlers) into one MCP server served
over stdio with NDJSON-RPC framing. Handler-layer initialization failures are
promoted to defects via `Layer.orDie`, so the resolved layer has no
error channel. The layer requires the `Stdio` transport, the
`FileSystem`/`Path` services used by the streaming handlers, and an
`HttpClient` for URL-backed dataset loads; provide `NodeStdio.layer`,
`NodeFileSystem.layer`, `NodePath.layer` (from `@effect/platform-node`) and
`FetchHttpClient.layer` (from `effect/unstable/http`) at the entrypoint.

**Example**

```ts
import { Layer } from "effect"
import { makeServerLayer } from "@beep/nlp-mcp/Server"
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
import * as NodePath from "@effect/platform-node/NodePath"
import * as NodeStdio from "@effect/platform-node/NodeStdio"
import { FetchHttpClient } from "effect/unstable/http"

const server = makeServerLayer({ name: "beep-nlp", version: "0.0.0" }).pipe(
  Layer.provide(NodeStdio.layer),
  Layer.provide(NodeFileSystem.layer),
  Layer.provide(NodePath.layer),
  Layer.provide(FetchHttpClient.layer)
)

void Layer.launch(server)
```

**Signature**

```ts
declare const makeServerLayer: (config: NlpMcpServerConfig) => Layer.Layer<never, never, FileSystem.FileSystem | HttpClient.HttpClient | Path.Path | Stdio>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Server.ts#L101)

Since v0.0.0

# models

## NlpMcpServerConfig (class)

Configuration for the MCP server identity advertised to clients.

**Example**

```ts
import { NlpMcpServerConfig } from "@beep/nlp-mcp/Server"

const config = NlpMcpServerConfig.make({ name: "beep-nlp", version: "0.0.0" })
console.log(config.name)
```

**Signature**

```ts
declare class NlpMcpServerConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Server.ts#L50)

Since v0.0.0
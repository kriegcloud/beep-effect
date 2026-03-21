# MCP Server AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Commands

| Command                        | Purpose                      |
| ------------------------------ | ---------------------------- |
| `bun dev --filter=server-mcp`  | Start MCP server (port 9009) |
| `bun test --filter=server-mcp` | Run MCP tests                |

## MCP Components

```typescript
// 1. Resources - static content
McpServer.resource({
  uri: "app://primer",
  name: "Primer Document",
  description: "Documentation for the application",
  content: Effect.succeed("Content here"),
});

// 2. Prompts - parameterized templates
McpServer.prompt({
  name: "Hello Prompt",
  parameters: Schema.Struct({ name: Schema.String }),
  content: ({ name }) => Effect.succeed(`Hello, ${name}!`),
});

// 3. Tools - executable actions
class MyTools extends Toolkit.make(
  Tool.make("ToolName", {
    description: "Tool description",
    parameters: { arg: Schema.String },
    success: Schema.String,
    failure: Schema.Never,
  })
) {}

// Implement tools
McpServer.toolkit(MyTools).pipe(
  Layer.provide(
    MyTools.toLayer(
      Effect.succeed({
        ToolName: ({ arg }) => Effect.succeed(`Result: ${arg}`),
      })
    )
  )
);
```

## Layer Composition

```typescript
// Merge all MCP components
const McpLive = Layer.mergeAll(ResourceLayer, PromptLayer, ToolLayer);

// Create HTTP router
const McpRouter = McpServer.layerHttpRouter({
  name: "Server Name",
  version: "0.1.0",
  path: "/mcp",
}).pipe(Layer.provideMerge(McpLive));

// Serve
HttpLayerRouter.serve(McpRouter).pipe(Layer.launch);
```

## Environment

```bash
MCP_PORT=9009  # MCP server port (default)
```

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._

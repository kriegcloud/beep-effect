# MCP Server

[Model Context Protocol](https://modelcontextprotocol.io/) server built with
[Effect Platform](https://effect.website/docs/platform) and TypeScript, part of
the [bEvr stack](../../README.md).

## Stack

- **@effect/ai** - Effect AI framework for MCP tools and resources
- **Model Context Protocol** - AI assistant communication protocol
- **Effect Platform** - Functional framework foundation
- **Bun** - JavaScript runtime
- **TypeScript** - Type safety
- **@repo/domain** - Shared types and schemas
- **@repo/observability** - Shared OpenTelemetry layer

## Getting Started

From the monorepo root:

```bash
# Start development server
bun dev --filter=server-mcp

# Build for production
bun run build --filter=server-mcp

# Test MCP server functionality (MCPJam Inspector)
bun --filter=server-mcp run inspector
```

The MCP server provides tools and resources for AI assistants via the Model
Context Protocol.

## Architecture

The MCP server uses @effect/ai for type-safe, functional MCP tool and resource
handling:

- **MCP Tools**: Exposed functions that AI assistants can call via AiToolkit
- **MCP Resources**: Data sources that AI assistants can access with templates
- **MCP Prompts**: Structured prompts with parameters and completion
- **Type-safe Implementation**: Schema-driven validation and type safety
- **Effect Integration**: Functional error handling and data processing
- **Environment Agnostic**: Deploy to any JavaScript runtime

## Testing

You can test the MCP server functionality using MCPJam Inspector:

```bash
bun --filter=server-mcp run inspector
```

This will start an interactive session where you can test MCP tools and
resources directly.

## Example Implementation

```typescript
import { AiTool, AiToolkit } from "@effect/ai";
import { Effect, Schema } from "effect";

// Create toolkit with the tool
const UserToolkit = AiToolkit.make(
  AiTool.make("get_user", {
    description: "Get user information by ID",
    parameters: Schema.Struct({
      userId: Schema.NumberFromString,
      includeProfile: Schema.optional(Schema.Boolean),
    }),
    success: Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
      email: Schema.String,
      profile: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
    }),
  })
);

// Implement the toolkit logic
const UserToolkitLive = UserToolkit.toLayer({
  get_user: ({ userId, includeProfile }) =>
    Effect.succeed({
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      profile: includeProfile ? { theme: "dark", timezone: "UTC" } : undefined,
    }),
});
```

## Learn More

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [@effect/ai Documentation](https://github.com/tim-smart/effect-io-ai)
- [Effect Documentation](https://effect.website)
- [bEvr Stack Overview](../../README.md)

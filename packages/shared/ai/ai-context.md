---
path: packages/shared/ai
summary: Effect-based AI/LLM integration - provider clients, agent schemas, tool definitions, messages
tags: [ai, llm, effect-ai, anthropic, openai, agents, tools]
---

# @beep/shared-ai

Effect Schema definitions and provider integrations for AI/LLM services. Provides type-safe schemas for multi-provider LLM interactions, agent execution, tool definitions, and Claude Agents SDK compatibility.

## Architecture

```
|----------------------|
|   Provider Clients   |  Anthropic, OpenAI via @effect/ai-*
|----------------------|
          |
          v
|----------------------|     |----------------------|
|   Agent Schemas      | --> |   Tool Definitions   |
|   - AgentConfig      |     |   - ToolCall         |
|   - AgentResponse    |     |   - ToolDefinition   |
|   - AgentRunMetrics  |     |   - ToolCallResult   |
|----------------------|     |----------------------|
          |                            |
          v                            v
|----------------------|     |----------------------|
|   Message Schemas    |     |   Agents SDK Schemas |
|   - ChatMessage      |     |   - common, mcp      |
|   - SystemMessage    |     |   - permissions      |
|   - ToolMessage      |     |   - hooks, session   |
|----------------------|     |----------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `providers` | Effect Layers for Anthropic/OpenAI clients via @effect/ai-* |
| `constants` | Static model definitions per provider, AiProviderName schema |
| `models/agent` | Agent, AgentConfig, AgentResponse, AgentRunMetrics schemas |
| `models/message` | ChatMessage union, role-based message types |
| `models/tools` | ToolDefinition, ToolCall, ToolCallResult schemas |
| `models/llm` | LLMProvider, ModelInfo, LLMAuthenticationError |
| `errors` | NetworkError, ProviderOutage tagged errors |
| `sequential-thinking` | ThoughtData, SequentialThinkingParams for CoT |
| `agents-sdk/schema/*` | Claude Agents SDK type schemas |

## Usage Patterns

### Provider Layer Composition

```typescript
import * as Layer from "effect/Layer";
import { Anthropic, OpenAi, layer } from "@beep/shared-ai/providers";

// Individual provider
const program = myEffect.pipe(Effect.provide(Anthropic));

// All providers
const program = myEffect.pipe(Effect.provide(layer));
```

### Agent Execution Schema

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { AgentRunnerOptions, AgentResponse } from "@beep/shared-ai/models/agent";

const runAgent = (options: AgentRunnerOptions.Type): Effect.Effect<AgentResponse.Type> =>
  Effect.gen(function* () {
    // Agent execution logic
    return new AgentResponse({
      content: "Response text",
      conversationId: options.conversationId ?? crypto.randomUUID(),
    });
  });
```

### Chat Message Construction

```typescript
import * as Effect from "effect/Effect";
import {
  ChatMessage,
  SystemChatMessage,
  UserChatMessage,
  ConversationMessages,
} from "@beep/shared-ai/models/message";

const conversation = ConversationMessages.init(
  new SystemChatMessage({ content: "You are a helpful assistant." })
);

conversation.push(new UserChatMessage({ content: "Hello!" }));
```

### Tool Definition

```typescript
import * as Effect from "effect/Effect";
import { ToolDefinition, ToolDefinitionFunction } from "@beep/shared-ai/models/tools";

const searchTool = new ToolDefinition({
  function: new ToolDefinitionFunction({
    name: "search",
    description: "Search the knowledge base",
    parameters: { type: "object", properties: { query: { type: "string" } } },
  }),
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Multi-provider via @effect/ai-* | Consistent Effect Layer pattern for all LLM providers |
| Static model registry | Compile-time model ID validation via AiProviderName schema |
| Role-tagged messages | ChatMessage union enables type-safe message discrimination |
| Agents SDK schemas | Interoperability with Claude Agents SDK without runtime dependency |
| Separate errors module | Tagged errors for precise AI failure handling |

## Dependencies

**Internal**: `@beep/schema` (BS helpers), `@beep/identity` (annotations), `@beep/shared-domain` (EntityIds), `@beep/utils`, `@beep/invariant`

**External**: `effect`, `@effect/ai`, `@effect/ai-anthropic`, `@effect/ai-openai`, `@effect/ai-google`, `@effect/platform`

## Related

- **AGENTS.md** - Detailed contributor guidance for schema authoring patterns

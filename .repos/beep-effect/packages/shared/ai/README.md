# @beep/shared-ai

Shared AI utilities and Effect Schema definitions for AI provider integrations.

## Overview

This package provides:

- Effect Schema definitions for the Claude Agents SDK types
- Type-safe schemas for SDK messages, permissions, hooks, and MCP integrations
- Common schemas for AI-related operations

## Key Exports

| Export | Description |
|--------|-------------|
| `agents-sdk/schema/*` | Schema definitions for Claude Agents SDK types |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@effect/ai-*` | AI provider integrations (Anthropic, OpenAI, Google, etc.) |
| `@beep/schema` | Schema utilities (BS helpers) |
| `@beep/identity` | Package identity for schema annotations |

## Usage Patterns

### Importing Schema Types

```typescript
import * as S from "effect/Schema"
import { ModelUsage, AccountInfo } from "@beep/shared-ai/agents-sdk/schema/common.schemas"

// Use in your own schemas
const MySchema = S.Struct({
  usage: ModelUsage,
  account: AccountInfo,
})
```

### Available Schema Modules

| Module | Contents |
|--------|----------|
| `common.schemas` | UUID, ApiKeySource, ModelInfo, ModelUsage, AccountInfo |
| `message.schemas` | SDK message types |
| `permission.schemas` | Permission-related schemas |
| `hooks.schemas` | Hook event schemas |
| `mcp.schemas` | MCP server configuration schemas |
| `session.schemas` | Session-related schemas |
| `sandbox.schemas` | Sandbox configuration schemas |
| `tool-input.schemas` | Tool input schemas |
| `options.schemas` | SDK options schemas |

## Integration Points

- **Consumed by**: Packages that need to interact with Claude Agents SDK
- **Depends on**: `@beep/schema` for BS helpers, `@effect/ai-*` for AI types

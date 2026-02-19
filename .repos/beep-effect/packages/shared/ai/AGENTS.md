# @beep/shared-ai AGENTS.md

Effect Schema definitions for AI provider integrations, specifically the Claude Agents SDK.

## Overview

This package provides type-safe Effect Schema definitions for working with AI SDKs. It sits in the shared layer and provides:

- Claude Agents SDK type schemas
- Common AI-related schemas (model info, usage, accounts)
- Reusable schema patterns for AI integrations

## Key Exports

| Export | Description |
|--------|-------------|
| `agents-sdk/schema/common.schemas` | Core types: UUID, ApiKeySource, ModelUsage, AccountInfo |
| `agents-sdk/schema/message.schemas` | SDK message type schemas |
| `agents-sdk/schema/permission.schemas` | Permission configuration schemas |
| `agents-sdk/schema/hooks.schemas` | Hook event schemas |
| `agents-sdk/schema/mcp.schemas` | MCP server configuration schemas |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/schema` | BS helper utilities for schema composition |
| `@beep/identity` | Package identity for schema annotations |
| `effect` | Core Effect runtime and Schema module |
| `@effect/ai-*` | AI provider peer dependencies |

## Usage Patterns

### Importing Common Types

```typescript
import * as S from "effect/Schema"
import { ModelUsage, AccountInfo, ApiKeySource } from "@beep/shared-ai/agents-sdk/schema/common.schemas"

const program = Effect.gen(function* () {
  // Use the schemas for validation
  const usage = yield* S.decodeUnknown(ModelUsage)(rawUsage)
  return usage
})
```

### Schema Annotation Pattern

The package uses consistent annotation patterns for all schemas:

```typescript
import { $SharedAiId } from "@beep/identity/packages"

const $I = $SharedAiId.create("agents-sdk/schema/my-module")

export class MyType extends S.Class<MyType>("MyType")(
  { field: S.String },
  { ...$I.annotations("MyType", { description: "..." }) }
) {}
```

## Integration Points

- **Consumed by**: Any package integrating with Claude Agents SDK
- **Depends on**: `@beep/schema`, `@beep/identity`
- **Layer**: Shared (cross-cutting utilities)

## See Also

- [Shared Domain](../domain/AGENTS.md) - Domain entity patterns
- [Schema Package](../../common/schema/AGENTS.md) - BS helper reference

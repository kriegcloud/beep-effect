# Supermemory Claude Code: Technical Context

> Reference documentation for implementing the Supermemory tooling.

---

## Supermemory MCP Server

### Endpoint

```
https://mcp.supermemory.ai/mcp
```

### Authentication

**OAuth (Default):**
- Server uses OAuth discovery via `/.well-known/oauth-protected-resource`
- Automatic browser-based authentication flow
- Recommended for personal use

**API Key:**
- Obtain from `app.supermemory.ai`
- Keys start with `sm_`
- Pass via `Authorization: Bearer sm_...` header

### Project Scoping

All operations can be scoped to a project:

```json
{
  "headers": {
    "x-sm-project": "beep-effect"
  }
}
```

---

## MCP Tools

### memory

Save or forget information.

```typescript
interface MemoryInput {
  content: string;           // Required: content to save/forget
  action: "save" | "forget"; // Required: operation type
  containerTag?: string;     // Optional: additional scoping
}

// Example: Save a pattern
{
  content: "Effect services use Context.GenericTag for DI",
  action: "save"
}
```

### recall

Search memories and retrieve user profile.

```typescript
interface RecallInput {
  query: string;             // Required: search query
  includeProfile?: boolean;  // Include user profile in response
  containerTag?: string;     // Optional: scope filter
}

// Example: Search for HTTP patterns
{
  query: "How are HTTP clients structured?",
  includeProfile: true
}
```

### whoAmI

Get current user information.

```typescript
interface WhoAmIResponse {
  userId: string;
  email: string;
  name: string;
  client: string;
  sessionId: string;
}
```

---

## MCP Resources

### supermemory://profile

User profile with preferences and activity history.

### supermemory://projects

List of available memory projects.

---

## Claude Code Config Locations

### macOS

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Linux

```
~/.config/claude/claude_desktop_config.json
```

### Windows

```
%APPDATA%\Claude\claude_desktop_config.json
```

---

## Config File Format

### Minimal Config (OAuth)

```json
{
  "mcpServers": {
    "supermemory": {
      "url": "https://mcp.supermemory.ai/mcp",
      "headers": {
        "x-sm-project": "beep-effect"
      }
    }
  }
}
```

### API Key Config

```json
{
  "mcpServers": {
    "supermemory": {
      "url": "https://mcp.supermemory.ai/mcp",
      "headers": {
        "Authorization": "Bearer sm_your_api_key_here",
        "x-sm-project": "beep-effect"
      }
    }
  }
}
```

---

## Effect CLI Patterns

### Command Structure

```typescript
import * as CliCommand from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";

const setupCommand = CliCommand.make(
  "setup",
  {
    useOAuth: Options.boolean("oauth").pipe(
      Options.withDefault(true),
      Options.withDescription("Use OAuth authentication (recommended)")
    ),
    apiKey: Options.text("api-key").pipe(
      Options.optional,
      Options.withDescription("API key (alternative to OAuth)")
    ),
  },
  ({ useOAuth, apiKey }) =>
    Effect.gen(function* () {
      yield* Console.log("Setting up Supermemory...");
      // Implementation
    })
);
```

### Command Group

```typescript
export const supermemoryCommand = CliCommand.make("supermemory").pipe(
  CliCommand.withDescription("Supermemory memory integration for Claude Code"),
  CliCommand.withSubcommands([
    setupCommand,
    statusCommand,
    seedCommand,
  ])
);
```

---

## Memory Seeds

### beep-effect Patterns

```typescript
export const effectPatternSeeds = [
  {
    category: "imports",
    content: "Effect modules use namespace imports: import * as Effect from 'effect/Effect'",
  },
  {
    category: "imports",
    content: "Schema uses S.* prefix with PascalCase: S.String, S.Struct, S.Array",
  },
  {
    category: "imports",
    content: "Array operations use A.* from effect/Array, never native .map/.filter",
  },
  {
    category: "architecture",
    content: "Slice structure order: domain -> tables -> infra -> client -> ui",
  },
  {
    category: "architecture",
    content: "Cross-slice imports only via @beep/shared-* or @beep/common-*",
  },
  {
    category: "architecture",
    content: "Always use @beep/* path aliases, never relative ../../../ paths",
  },
  {
    category: "errors",
    content: "Error types use Schema.TaggedError for proper typing and matching",
  },
  {
    category: "services",
    content: "Services use Context.GenericTag for dependency injection",
  },
  {
    category: "testing",
    content: "Use @beep/testkit for Effect testing utilities",
  },
  {
    category: "testing",
    content: "Run tests with: bun run test --filter=@beep/package",
  },
];
```

### Seeding Script

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";

const seedMemories = Effect.gen(function* () {
  const client = yield* SupermemoryClient;

  yield* Effect.forEach(
    effectPatternSeeds,
    (seed) => client.memory({
      content: seed.content,
      action: "save",
    }),
    { concurrency: 5 }
  );
});
```

---

## Config Detection

### Cross-Platform Path Resolution

```typescript
import * as Effect from "effect/Effect";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as O from "effect/Option";

const detectClaudeConfigPath = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const home = yield* Effect.sync(() => process.env.HOME ?? process.env.USERPROFILE ?? "");

  const candidates = [
    path.join(home, "Library/Application Support/Claude/claude_desktop_config.json"),
    path.join(home, ".config/claude/claude_desktop_config.json"),
    path.join(home, "AppData/Roaming/Claude/claude_desktop_config.json"),
  ];

  // Use Effect.findFirst instead of native for-loop
  return yield* Effect.findFirst(candidates, (candidate) =>
    fs.exists(candidate).pipe(
      Effect.map((exists) => exists ? O.some(candidate) : O.none())
    )
  ).pipe(
    Effect.map(O.flatten)
  );
});
```

---

## Validation

### Connection Test

```typescript
const validateConnection = Effect.gen(function* () {
  const response = yield* HttpClient.get("https://mcp.supermemory.ai/mcp").pipe(
    HttpClient.withHeader("x-sm-project", "beep-effect"),
    Effect.timeout("5 seconds"),
  );

  return response.status === 200;
});
```

---

## Error Types

```typescript
import * as S from "effect/Schema";

export class SupermemorySetupError extends S.TaggedError<SupermemorySetupError>()(
  "SupermemorySetupError",
  {
    message: S.String,
    phase: S.Literal("detection", "authentication", "configuration", "validation"),
  }
) {}

export class ClaudeConfigNotFoundError extends S.TaggedError<ClaudeConfigNotFoundError>()(
  "ClaudeConfigNotFoundError",
  {
    searchedPaths: S.Array(S.String),
  }
) {}
```

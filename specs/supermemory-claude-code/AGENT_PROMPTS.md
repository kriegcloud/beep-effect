# Supermemory Claude Code: Agent Prompts

> Implementation guidance for each phase task. These are direct implementation prompts, not agent delegations.

---

## Available Agents Reference

Per `.claude/agents-manifest.yaml`, relevant agents for this spec:

| Agent | Capability | Use For |
|-------|------------|---------|
| `codebase-researcher` | read-only | Explore existing CLI patterns |
| `architecture-pattern-enforcer` | write-reports | Validate package structure |
| `doc-writer` | write-files | Create AGENTS.md, documentation |

**Note**: There is no `effect-code-writer` agent. CLI commands are implemented directly.

---

## Phase 0: Package Setup

### P0.1 Package Scaffolding

**Method**: Direct implementation

**Directory Structure**:
```
tooling/supermemory/
├── package.json
├── tsconfig.json
├── AGENTS.md
├── src/
│   ├── index.ts
│   ├── commands/
│   │   ├── index.ts
│   │   ├── setup.ts
│   │   └── status.ts
│   └── config/
│       └── detect-claude.ts
└── test/
```

**package.json**:
```json
{
  "name": "@beep/tooling-supermemory",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./commands": "./src/commands/index.ts"
  },
  "dependencies": {
    "@effect/cli": "workspace:*",
    "@effect/platform": "workspace:*",
    "@effect/platform-bun": "workspace:*",
    "effect": "workspace:*"
  }
}
```

**tsconfig.json**:
```json
{
  "extends": "../../tsconfig.base.jsonc",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*", "test/**/*"]
}
```

**Success Criteria**:
- [ ] All directories created
- [ ] package.json is valid JSON with correct name
- [ ] tsconfig.json extends base correctly
- [ ] src/index.ts exports supermemoryCommand

---

### P0.2 Setup Command Implementation

**Method**: Direct implementation

**File**: `tooling/supermemory/src/commands/setup.ts`

**Requirements**:
1. Options: `--oauth`, `--api-key`, `--project`
2. Platform detection (macOS, Linux, Windows)
3. Config merge without clobbering existing servers
4. Tagged error types

**Implementation**:
```typescript
import * as CliCommand from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as FileSystem from "@effect/platform/FileSystem";
import * as S from "effect/Schema";
import * as O from "effect/Option";

// Error types
export class ClaudeConfigNotFoundError extends S.TaggedError<ClaudeConfigNotFoundError>()(
  "ClaudeConfigNotFoundError",
  { searchedPaths: S.Array(S.String) }
) {}

export class ConfigWriteError extends S.TaggedError<ConfigWriteError>()(
  "ConfigWriteError",
  { path: S.String, cause: S.Unknown }
) {}

// Platform detection - see CONTEXT.md for full implementation
const detectClaudeConfig = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const home = yield* Effect.sync(() =>
    process.env.HOME ?? process.env.USERPROFILE ?? ""
  );

  const candidates = [
    `${home}/.config/claude/claude_desktop_config.json`,
    `${home}/Library/Application Support/Claude/claude_desktop_config.json`,
    `${home}/AppData/Roaming/Claude/claude_desktop_config.json`,
  ];

  // Use Effect.findFirst - see CONTEXT.md for proper implementation
  // Return path or fail with ClaudeConfigNotFoundError
});

// Generate MCP config entry
const generateMcpConfig = (options: {
  apiKey: O.Option<string>;
  project: string;
}) => ({
  url: "https://mcp.supermemory.ai/mcp",
  headers: {
    "x-sm-project": options.project,
    ...O.match(options.apiKey, {
      onNone: () => ({}),
      onSome: (key) => ({ Authorization: `Bearer ${key}` }),
    }),
  },
});

// Setup command
export const setupCommand = CliCommand.make(
  "setup",
  {
    apiKey: Options.text("api-key").pipe(
      Options.optional,
      Options.withDescription("API key (alternative to OAuth)")
    ),
    project: Options.text("project").pipe(
      Options.withDefault("beep-effect"),
      Options.withDescription("Supermemory project scope")
    ),
  },
  ({ apiKey, project }) =>
    Effect.gen(function* () {
      yield* Console.log("Setting up Supermemory for Claude Code...\n");

      const configPath = yield* detectClaudeConfig;
      yield* Console.log(`Found config at: ${configPath}`);

      const fs = yield* FileSystem.FileSystem;
      const existingContent = yield* fs.readFileString(configPath).pipe(
        Effect.catchTag("SystemError", () => Effect.succeed("{}"))
      );
      const existingConfig = JSON.parse(existingContent);

      const newConfig = {
        ...existingConfig,
        mcpServers: {
          ...existingConfig.mcpServers,
          supermemory: generateMcpConfig({ apiKey, project }),
        },
      };

      yield* fs.writeFileString(configPath, JSON.stringify(newConfig, null, 2));

      yield* Console.log("\n✓ Supermemory configured!");
      yield* Console.log(`  Project: ${project}`);
      yield* Console.log(`  Auth: ${O.isSome(apiKey) ? "API Key" : "OAuth"}`);
      yield* Console.log("\nRestart Claude Code to apply changes.");
    })
);
```

**Success Criteria**:
- [ ] Command compiles without TypeScript errors
- [ ] Options have descriptions for --help
- [ ] Detects config path on current platform
- [ ] Handles missing config file gracefully
- [ ] Merges without overwriting other MCP servers
- [ ] Uses Effect patterns (no async/await, no native methods)

---

### P0.3 Status Command Implementation

**Method**: Direct implementation

**File**: `tooling/supermemory/src/commands/status.ts`

**Implementation**:
```typescript
import * as CliCommand from "@effect/cli/Command";
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as FileSystem from "@effect/platform/FileSystem";
import * as O from "effect/Option";
import { detectClaudeConfig } from "../config/detect-claude.js";

export const statusCommand = CliCommand.make(
  "status",
  {},
  () =>
    Effect.gen(function* () {
      yield* Console.log("Supermemory Status\n");

      const configResult = yield* detectClaudeConfig.pipe(
        Effect.map(O.some),
        Effect.catchAll(() => Effect.succeed(O.none()))
      );

      if (O.isNone(configResult)) {
        yield* Console.log("✗ Claude config not found");
        yield* Console.log("\nSearched paths:");
        yield* Console.log("  ~/.config/claude/");
        yield* Console.log("  ~/Library/Application Support/Claude/");
        return;
      }

      const configPath = configResult.value;
      yield* Console.log(`Config: ${configPath}`);

      const fs = yield* FileSystem.FileSystem;
      const content = yield* fs.readFileString(configPath);
      const config = JSON.parse(content);

      const supermemory = config.mcpServers?.supermemory;

      if (!supermemory) {
        yield* Console.log("\n✗ Supermemory not configured");
        yield* Console.log("\nRun: bun run beep supermemory setup");
        return;
      }

      yield* Console.log("\n✓ Supermemory configured");
      yield* Console.log(`  URL: ${supermemory.url}`);
      yield* Console.log(`  Project: ${supermemory.headers?.["x-sm-project"] ?? "default"}`);

      const auth = supermemory.headers?.Authorization ? "API Key" : "OAuth";
      yield* Console.log(`  Auth: ${auth}`);
    })
);
```

**Success Criteria**:
- [ ] Command compiles without errors
- [ ] Shows config path when found
- [ ] Shows "not found" message with searched paths when missing
- [ ] Displays supermemory configuration details
- [ ] Uses Effect patterns consistently

---

### P0.4 Command Index

**File**: `tooling/supermemory/src/commands/index.ts`

```typescript
import * as CliCommand from "@effect/cli/Command";
import { setupCommand } from "./setup.js";
import { statusCommand } from "./status.js";

export const supermemoryCommand = CliCommand.make("supermemory").pipe(
  CliCommand.withDescription("Supermemory memory integration for Claude Code"),
  CliCommand.withSubcommands([setupCommand, statusCommand])
);
```

**Success Criteria**:
- [ ] Exports supermemoryCommand
- [ ] Both subcommands registered
- [ ] Description provided

---

## Phase 1: Memory Seeding

### P1.1 Seed Command Implementation

**Method**: Direct implementation

**File**: `tooling/supermemory/src/commands/seed.ts`

**Note**: The seed command requires calling Supermemory's HTTP API directly since MCP tools aren't accessible from CLI. Consider:
1. Using `@effect/platform` HttpClient
2. Or documenting manual seeding via Claude Code session

**Seed Content** (from CONTEXT.md):
```typescript
export const effectPatternSeeds = [
  "Effect modules use namespace imports: import * as Effect from 'effect/Effect'",
  "Schema uses S.* prefix with PascalCase: S.String, S.Struct, S.Array",
  "Array operations use A.* from effect/Array, never native .map/.filter",
  "beep-effect slice structure: domain -> tables -> infra -> client -> ui",
  "Cross-slice imports only via @beep/shared-* or @beep/common-*",
  "Always use @beep/* path aliases, never relative ../../../ paths",
  "Services use Context.GenericTag for dependency injection",
  "Error types use Schema.TaggedError for proper typing",
  "Use @beep/testkit for Effect testing utilities",
  "Run tests with: bun run test --filter=@beep/package",
];
```

**Success Criteria**:
- [ ] Seed content defined
- [ ] API call implementation (or alternative approach)
- [ ] Progress display during seeding
- [ ] Error handling for API failures

---

## Common Standards

### Effect Code Requirements

All code MUST:

1. **Namespace imports**:
   ```typescript
   import * as Effect from "effect/Effect";
   import * as S from "effect/Schema";
   import * as O from "effect/Option";
   ```

2. **PascalCase Schema constructors**:
   ```typescript
   S.String  // correct
   S.string  // WRONG
   ```

3. **No native methods**:
   ```typescript
   A.map(array, fn)  // correct
   array.map(fn)     // WRONG
   ```

4. **Tagged errors**:
   ```typescript
   export class MyError extends S.TaggedError<MyError>()("MyError", {
     message: S.String,
   }) {}
   ```

5. **Effect.gen for control flow** (no async/await)

### Reference Files

Study these for patterns:
- `tooling/cli/src/commands/sync.ts` - FileSystem operations
- `tooling/cli/src/commands/env.ts` - Interactive prompts
- `tooling/cli/src/commands/docgen.ts` - Subcommand composition

### Output Templates

Use templates from `templates/` directory:
- `command-implementation.template.ts` - Command structure
- `test-results.template.md` - Test documentation
- `phase-reflection-entry.template.md` - Reflection entries

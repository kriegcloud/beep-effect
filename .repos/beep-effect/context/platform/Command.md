# Command — Agent Context

> Best practices for using `@effect/platform/Command` in this codebase.

## Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `Command.make(cmd, ...args)` | Create command | `Command` |
| `Command.string(command)` | Execute and capture stdout | `Effect<string, PlatformError, CommandExecutor>` |
| `Command.lines(command)` | Execute and capture lines | `Effect<ReadonlyArray<string>, PlatformError, CommandExecutor>` |
| `Command.exitCode(command)` | Execute and get exit code | `Effect<ExitCode, PlatformError, CommandExecutor>` |
| `Command.stream(command)` | Stream stdout as bytes | `Stream<Uint8Array, PlatformError, CommandExecutor>` |
| `Command.streamLines(command)` | Stream stdout as lines | `Stream<string, PlatformError, CommandExecutor>` |

## Codebase Patterns

### Basic Command Execution

```typescript
import * as Command from "@effect/platform/Command";
import * as Effect from "effect/Effect";

const getGitStatus = Effect.gen(function* () {
  const command = Command.make("git", "status", "--porcelain");
  const output = yield* Command.string(command);
  return output;
});
```

### Multi-line Output

```typescript
import * as Command from "@effect/platform/Command";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";

const listPackages = Effect.gen(function* () {
  const command = Command.make("ls", "-1", "packages");
  const lines = yield* Command.lines(command);

  // Process lines with Effect utilities
  return F.pipe(
    lines,
    A.filter(line => !Str.startsWith(line, ".")),
    A.sort(Str.Order)
  );
});
```

### Shell Commands

For complex shell syntax (pipes, redirection), use `runInShell`:

```typescript
import * as Command from "@effect/platform/Command";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const countFiles = Effect.gen(function* () {
  const command = F.pipe(
    Command.make("ls", "-1", "packages"),
    Command.runInShell  // Enables shell features
  );

  const output = yield* Command.string(command);
  return output;
});
```

### Environment Variables

```typescript
import * as Command from "@effect/platform/Command";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const runWithEnv = Effect.gen(function* () {
  const command = F.pipe(
    Command.make("node", "script.js"),
    Command.env({ NODE_ENV: "production", API_KEY: "secret" })
  );

  const output = yield* Command.string(command);
  return output;
});
```

### Working Directory

```typescript
import * as Command from "@effect/platform/Command";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const runInDirectory = (dir: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;

    const command = F.pipe(
      Command.make("npm", "install"),
      Command.workingDirectory(path.resolve(dir))
    );

    yield* Command.exitCode(command);
  });
```

### Piping Input

```typescript
import * as Command from "@effect/platform/Command";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const echoToCommand = (input: string) =>
  Effect.gen(function* () {
    const command = F.pipe(
      Command.make("cat"),
      Command.feed(input)  // Pipe string to stdin
    );

    const output = yield* Command.string(command);
    return output;
  });
```

### Streaming Output

For large outputs or real-time processing:

```typescript
import * as Command from "@effect/platform/Command";
import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";

const streamLogs = Effect.gen(function* () {
  const command = Command.make("tail", "-f", "/var/log/app.log");

  yield* F.pipe(
    Command.streamLines(command),
    Stream.tap(line => Console.log(line)),
    Stream.runDrain
  );
});
```

### Error Handling

```typescript
import * as Command from "@effect/platform/Command";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export class CommandFailedError extends S.TaggedError<CommandFailedError>()(
  "CommandFailedError",
  {
    command: S.String,
    exitCode: S.Number,
    stderr: S.String,
  }
) {}

const safeCommand = (cmd: string, args: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const command = Command.make(cmd, ...args);

    const exitCode = yield* Command.exitCode(command).pipe(
      Effect.catchTag("SystemError", (error) => {
        if (error.reason === "NotFound") {
          return Effect.fail(
            new CommandFailedError({
              command: `${cmd} ${args.join(" ")}`,
              exitCode: -1,
              stderr: `Command not found: ${cmd}`,
            })
          );
        }
        return Effect.fail(error);
      })
    );

    if (exitCode !== 0) {
      return yield* Effect.fail(
        new CommandFailedError({
          command: `${cmd} ${args.join(" ")}`,
          exitCode,
          stderr: "Command failed",
        })
      );
    }
  });
```

### Fallback on Command Not Found

```typescript
import * as Command from "@effect/platform/Command";
import * as Effect from "effect/Effect";

const tryCommand = (primary: string, fallback: string, args: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const primaryCmd = Command.make(primary, ...args);

    const result = yield* Command.string(primaryCmd).pipe(
      Effect.catchTag("SystemError", (error) => {
        if (error.reason === "NotFound") {
          // Try fallback command
          const fallbackCmd = Command.make(fallback, ...args);
          return Command.string(fallbackCmd);
        }
        return Effect.fail(error);
      })
    );

    return result;
  });
```

## Layer Composition

### Bun Runtime

```typescript
import { BunCommandExecutor } from "@effect/platform-bun";
import { BunFileSystem } from "@effect/platform-bun";
import * as Layer from "effect/Layer";

export const MyCommandLive = Layer.mergeAll(
  BunCommandExecutor.layer,  // Provides CommandExecutor
  BunFileSystem.layer,       // Required by CommandExecutor
);
```

### Node Runtime

```typescript
import { NodeCommandExecutor } from "@effect/platform-node";
import { NodeFileSystem } from "@effect/platform-node";
import * as Layer from "effect/Layer";

export const MyCommandLive = Layer.mergeAll(
  NodeCommandExecutor.layer,  // Provides CommandExecutor
  NodeFileSystem.layer,       // Required by CommandExecutor
);
```

### Service Dependencies

When your service needs Command execution:

```typescript
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Command from "@effect/platform/Command";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";

class GitService extends Context.Tag("GitService")<
  GitService,
  { readonly status: () => Effect.Effect<string, GitError> }
>() {}

const GitServiceLive = Layer.effect(
  GitService,
  Effect.gen(function* () {
    // CommandExecutor is automatically injected
    return {
      status: () =>
        Effect.gen(function* () {
          const command = Command.make("git", "status", "--porcelain");
          return yield* Command.string(command);
        }),
    };
  })
);

// GitServiceLive requires CommandExecutor
// Provide it via BunCommandExecutor.layer or NodeCommandExecutor.layer
```

## Anti-Patterns

### FORBIDDEN - Using child_process directly

```typescript
// FORBIDDEN - Node.js child_process
import { execSync, spawnSync } from "node:child_process";
const output = execSync("git status").toString();
const result = spawnSync("ls", ["-la"]);

// REQUIRED - Command from @effect/platform
import * as Command from "@effect/platform/Command";
const command = Command.make("git", "status");
const output = yield* Command.string(command);
```

### FORBIDDEN - Using Bun.spawn directly

```typescript
// FORBIDDEN - Bun.spawn
const proc = Bun.spawn(["git", "status"]);
const output = await new Response(proc.stdout).text();

// REQUIRED - Command from @effect/platform
import * as Command from "@effect/platform/Command";
const command = Command.make("git", "status");
const output = yield* Command.string(command);
```

### FORBIDDEN - Ignoring exit codes

```typescript
// FORBIDDEN - Not checking success
const command = Command.make("git", "push");
yield* Command.string(command);  // What if it fails?

// REQUIRED - Check exit code
const exitCode = yield* Command.exitCode(command);
if (exitCode !== 0) {
  return yield* Effect.fail(new PushFailedError({ exitCode }));
}
```

### FORBIDDEN - Shell injection vulnerabilities

```typescript
// FORBIDDEN - Unsafe string interpolation
const userInput = getUserInput();
const command = Command.make("sh", "-c", `rm -rf ${userInput}`);  // DANGER!

// REQUIRED - Pass arguments separately (auto-escaped)
const command = Command.make("rm", "-rf", userInput);
```

### FORBIDDEN - Blocking on large outputs

```typescript
// FORBIDDEN - Loading entire output into memory
const command = Command.make("find", "/", "-type", "f");
const allFiles = yield* Command.string(command);  // Could be gigabytes!

// REQUIRED - Stream large outputs
yield* F.pipe(
  Command.streamLines(command),
  Stream.take(1000),  // Limit results
  Stream.runCollect
);
```

### FORBIDDEN - Swallowing errors

```typescript
// FORBIDDEN - Ignoring command failures
const output = yield* Command.string(command).pipe(
  Effect.catchAll(() => Effect.succeed(""))  // Loses error context
);

// REQUIRED - Map to domain errors
export class ScriptFailedError extends S.TaggedError<ScriptFailedError>()(
  "ScriptFailedError",
  { script: S.String, cause: S.Unknown }
) {}

const output = yield* Command.string(command).pipe(
  Effect.mapError((cause) => new ScriptFailedError({ script: "build.sh", cause }))
);
```

## Related Modules

- **CommandExecutor** (`@effect/platform/CommandExecutor`) — Command execution service
- **Process** (`@effect/platform/Process`) — Process information
- **FileSystem** (`@effect/platform/FileSystem`) — Required dependency

## Source Reference

[.repos/effect/packages/platform/src/Command.ts](/home/elpresidank/YeeBois/projects/beep-effect2/.repos/effect/packages/platform/src/Command.ts)

## Test Reference

Comprehensive usage examples from Effect test suite:

[.repos/effect/packages/platform-node-shared/test/CommandExecutor.test.ts](/home/elpresidank/YeeBois/projects/beep-effect2/.repos/effect/packages/platform-node-shared/test/CommandExecutor.test.ts)

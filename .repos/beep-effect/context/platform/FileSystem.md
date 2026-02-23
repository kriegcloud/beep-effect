# FileSystem — Agent Context

> Best practices for using `@effect/platform/FileSystem` in this codebase.

## Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `fs.exists(path)` | Check if path exists | `Effect<boolean, PlatformError>` |
| `fs.readFileString(path)` | Read text file | `Effect<string, PlatformError>` |
| `fs.writeFileString(path, content)` | Write text file | `Effect<void, PlatformError>` |
| `fs.makeDirectory(path, opts)` | Create directory | `Effect<void, PlatformError>` |
| `fs.readDirectory(path)` | List directory contents | `Effect<ReadonlyArray<string>, PlatformError>` |
| `fs.copyFile(from, to)` | Copy file | `Effect<void, PlatformError>` |
| `fs.remove(path)` | Delete file/directory | `Effect<void, PlatformError>` |

## Codebase Patterns

### Basic File Operations

From `tooling/cli/src/commands/create-slice/handler.ts`:

```typescript
import * as FileSystem from "@effect/platform/FileSystem";
import * as Effect from "effect/Effect";
import * as path from "node:path";

const updateTsconfigBase = (
  sliceName: string,
  repoRoot: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const filePath = path.join(repoRoot, "tsconfig.base.jsonc");

    // Read file
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));

    // Transform content
    const updatedContent = transformConfig(content);

    // Write file
    yield* fs
      .writeFileString(filePath, updatedContent)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));
  });
```

### Directory Creation (Recursive)

```typescript
import * as FileSystem from "@effect/platform/FileSystem";
import * as Effect from "effect/Effect";

const ensureDirectory = (dirPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Create directory with parent directories
    yield* fs.makeDirectory(dirPath, { recursive: true });
  });
```

### Existence Checks

```typescript
import * as FileSystem from "@effect/platform/FileSystem";
import * as Effect from "effect/Effect";

const sliceExists = (sliceName: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const slicePath = `packages/${sliceName}`;

    const exists = yield* fs.exists(slicePath);
    return exists;
  });
```

### Reading Directory Contents

```typescript
import * as FileSystem from "@effect/platform/FileSystem";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";

const listPackages = (packagesDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const entries = yield* fs.readDirectory(packagesDir);

    // Filter and transform with Effect utilities
    return F.pipe(
      entries,
      A.filter(entry => !Str.startsWith(entry, ".")),
      A.sort(Str.Order)
    );
  });
```

### Error Handling Pattern

ALWAYS wrap FileSystem errors with domain-specific tagged errors:

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

export class FileWriteError extends S.TaggedError<FileWriteError>()("FileWriteError", {
  filePath: S.String,
  cause: S.Unknown,
}) {}

const safeWrite = (path: string, content: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    yield* fs
      .writeFileString(path, content)
      .pipe(
        Effect.mapError((cause) => new FileWriteError({ filePath: path, cause }))
      );
  });
```

## Layer Composition

### Bun Runtime

```typescript
import { BunFileSystem } from "@effect/platform-bun";
import * as Layer from "effect/Layer";

export const MyCommandLive = Layer.mergeAll(
  BunFileSystem.layer,  // Provides FileSystem.FileSystem service
  // ... other layers
);
```

### Node Runtime

```typescript
import { NodeFileSystem } from "@effect/platform-node";
import * as Layer from "effect/Layer";

export const MyServiceLive = Layer.mergeAll(
  NodeFileSystem.layer,  // Provides FileSystem.FileSystem service
  // ... other layers
);
```

### Service Dependencies

When your service needs FileSystem:

```typescript
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as FileSystem from "@effect/platform/FileSystem";

class MyService extends Context.Tag("MyService")<
  MyService,
  { readonly processFile: (path: string) => Effect.Effect<void, MyError> }
>() {}

const MyServiceLive = Layer.effect(
  MyService,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;  // Dependency injection

    return {
      processFile: (path) =>
        Effect.gen(function* () {
          const content = yield* fs.readFileString(path);
          // Process content...
        }),
    };
  })
);

// MyServiceLive requires FileSystem.FileSystem
// Provide it via BunFileSystem.layer or NodeFileSystem.layer
```

## Anti-Patterns

### FORBIDDEN - Node.js fs module

```typescript
// FORBIDDEN
import * as fs from "node:fs";
const exists = fs.existsSync(path);
const content = fs.readFileSync(path, "utf-8");
fs.writeFileSync(path, content);

// REQUIRED - Effect FileSystem
import * as FileSystem from "@effect/platform/FileSystem";
const fs = yield* FileSystem.FileSystem;
const exists = yield* fs.exists(path);
const content = yield* fs.readFileString(path);
yield* fs.writeFileString(path, content);
```

### FORBIDDEN - Wrapping Node.js fs in Effect.try

```typescript
// FORBIDDEN - Don't wrap synchronous fs
const exists = yield* Effect.try(() => fs.existsSync(path));

// REQUIRED - Use FileSystem service
const fs = yield* FileSystem.FileSystem;
const exists = yield* fs.exists(path);
```

### FORBIDDEN - Ignoring PlatformError

```typescript
// FORBIDDEN - Losing error context
const content = yield* fs.readFileString(path).pipe(
  Effect.catchAll(() => Effect.succeed(""))
);

// REQUIRED - Map to domain error
export class FileReadError extends S.TaggedError<FileReadError>()("FileReadError", {
  filePath: S.String,
  cause: S.Unknown,
}) {}

const content = yield* fs.readFileString(path).pipe(
  Effect.mapError((cause) => new FileReadError({ filePath: path, cause }))
);
```

### FORBIDDEN - Mixing path operations

```typescript
// FORBIDDEN - Using path.join with FileSystem
import * as path from "node:path";
const filePath = path.join(dir, file);  // Inconsistent with platform abstraction

// REQUIRED - Use Path service
import * as Path from "@effect/platform/Path";
const pathSvc = yield* Path.Path;
const filePath = pathSvc.join(dir, file);
```

## Related Modules

- **Path** (`@effect/platform/Path`) — Platform-agnostic path operations
- **Command** (`@effect/platform/Command`) — Process execution
- **Error** (`@effect/platform/Error`) — PlatformError types

## Source Reference

[.repos/effect/packages/platform/src/FileSystem.ts](/home/elpresidank/YeeBois/projects/beep-effect2/.repos/effect/packages/platform/src/FileSystem.ts)

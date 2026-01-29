# FileSystem Platform Abstraction

Use `@effect/platform` FileSystem for cross-platform file I/O. This abstraction works across Node.js, Bun, and browser environments.

## Basic Pattern

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

// Service injection via yield*
const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  // Use fs methods here
  const content = yield* fs.readFileString("path/to/file.txt")
  return content
})
```

## Reading Operations

### Read File (Binary)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const readBinary = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const bytes = yield* fs.readFile("data.bin")
  return bytes // Uint8Array
})
```

### Read File (String)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const readText = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const content = yield* fs.readFileString("config.json")
  return content // string
})
```

### Stream File

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const streamFile = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const stream = yield* fs.stream("large-file.log")
  return stream // Stream<Uint8Array, PlatformError, never>
})
```

### Read Directory

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const listFiles = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const entries = yield* fs.readDirectory("src/")
  return entries // ReadonlyArray<string>
})
```

### Read Symbolic Link

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const readLink = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const target = yield* fs.readLink("symlink")
  return target // string
})
```

## Writing Operations

### Write File (Binary)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const writeBinary = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])
  yield* fs.writeFile("output.bin", data)
})
```

### Write File (String)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const writeText = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.writeFileString("output.txt", "Hello, World!")
})
```

### Sink (Stream Writing)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect, Stream, pipe } from "effect"

const writeStream = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const sink = yield* fs.sink("output.log")

  yield* pipe(
    Stream.fromIterable(["line 1\n", "line 2\n", "line 3\n"]),
    Stream.mapEffect(s => Effect.succeed(new TextEncoder().encode(s))),
    Stream.run(sink)
  )
})
```

## File Operations

### Copy File

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const copyFile = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.copyFile("source.txt", "dest.txt")
})
```

### Copy (Recursive Directory)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const copyDir = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.copy("src-dir/", "dest-dir/")
})
```

### Rename/Move

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const renameFile = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.rename("old-name.txt", "new-name.txt")
})
```

### Remove

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const removeFile = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.remove("file.txt")
})

// Remove directory recursively
const removeDir = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.remove("directory/", { recursive: true })
})
```

### Open File Handle

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const useFileHandle = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const file = yield* fs.open("data.txt", { flag: "r" })

  // Use file.read(), file.write(), etc.
  const buffer = new Uint8Array(1024)
  const bytesRead = yield* file.read(buffer)

  yield* file.close()
})
```

## Directory Operations

### Make Directory

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const createDir = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.makeDirectory("new-dir/")

  // Recursive directory creation
  yield* fs.makeDirectory("path/to/nested/dir/", { recursive: true })
})
```

### Make Temp Directory

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const useTempDir = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const tempPath = yield* fs.makeTempDirectory()

  // Use tempPath
  yield* fs.writeFileString(`${tempPath}/temp-file.txt`, "data")

  // Manual cleanup required
  yield* fs.remove(tempPath, { recursive: true })
})
```

### Make Temp Directory (Scoped)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const useScopedTempDir = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const tempPath = yield* fs.makeTempDirectoryScoped()

  // Use tempPath within scope
  yield* fs.writeFileString(`${tempPath}/temp-file.txt`, "data")

  // Automatically cleaned up when scope exits
}).pipe(Effect.scoped)
```

## Metadata Operations

### Stat (File Info)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect, Console } from "effect"

const getFileInfo = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const info = yield* fs.stat("file.txt")

  yield* Console.log(`Type: ${info.type}`) // "File" | "Directory" | "SymbolicLink" | "Other"
  yield* Console.log(`Size: ${info.size}`) // bigint
  yield* Console.log(`Modified: ${info.mtime}`) // Option<Date>
  yield* Console.log(`Accessed: ${info.atime}`) // Option<Date>
  yield* Console.log(`Created: ${info.birthtime}`) // Option<Date>
})
```

### Access (Check Permissions)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const checkAccess = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  // Check if file exists and is readable
  yield* fs.access("file.txt", { readable: true })

  // Check writable
  yield* fs.access("file.txt", { writable: true })

  // Check executable
  yield* fs.access("script.sh", { executable: true })
})
```

### Exists

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const fileExists = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const exists = yield* fs.exists("file.txt")
  return exists // boolean
})
```

### Real Path (Resolve Symlinks)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const resolvePath = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const realPath = yield* fs.realPath("symlink-or-relative-path")
  return realPath // string (absolute path)
})
```

## Permission Operations

### Change Mode (chmod)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const changeMode = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.chmod("script.sh", 0o755)
})
```

### Change Owner (chown)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const changeOwner = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.chown("file.txt", 1000, 1000) // uid, gid
})
```

### Update Times (utimes)

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const updateTimes = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const now = new Date()
  yield* fs.utimes("file.txt", now, now) // atime, mtime
})
```

## Links

### Hard Link

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const createHardLink = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.link("original.txt", "hardlink.txt")
})
```

### Symbolic Link

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const createSymlink = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.symlink("target.txt", "symlink.txt")
})
```

## Watching

### Watch Files/Directories

```typescript
import { FileSystem } from "@effect/platform"
import { Effect, Stream, Console, pipe } from "effect"

const watchFiles = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const events = yield* fs.watch("src/")

  return events // Stream<FileSystem.WatchEvent, PlatformError, never>
})

// Consume watch events
const consumeWatchEvents = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const events = yield* fs.watch("config/")

  yield* pipe(
    events,
    Stream.runForEach(event =>
      Console.log(`Event: ${event.type}, Path: ${event.path}`)
    )
  )
})
```

## Size Helpers

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const { Size, KiB, MiB, GiB } = FileSystem

// Create size values
const oneKb = Size(1024)
const tenKb = KiB(10)
const oneMb = MiB(1)
const fiveGb = GiB(5)

// Use with file operations
const checkFileSize = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const info = yield* fs.stat("large-file.bin")

  const maxSize = MiB(100)
  if (info.size > BigInt(maxSize)) {
    yield* Effect.fail(new Error("File too large"))
  }
})
```

## Error Handling

### SystemErrorReason Values

FileSystem operations fail with `PlatformError` containing a `SystemErrorReason`:

- `AlreadyExists` - File/directory already exists
- `BadResource` - Invalid file descriptor or handle
- `Busy` - Resource is busy
- `InvalidData` - Invalid data format
- `NotFound` - File/directory not found
- `PermissionDenied` - Insufficient permissions
- `TimedOut` - Operation timed out
- `UnexpectedEof` - Unexpected end of file
- `Unknown` - Unknown error
- `WouldBlock` - Operation would block
- `WriteZero` - Write operation wrote zero bytes

### Error Handling Pattern

```typescript
import { FileSystem } from "@effect/platform"
import { Effect, pipe } from "effect"

const readConfigWithFallback = pipe(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readFileString("config.json")
  }),
  Effect.catchTag("SystemError", error => {
    if (error.reason === "NotFound") {
      return Effect.succeed("{}")
    }
    if (error.reason === "PermissionDenied") {
      return Effect.fail(new Error("Cannot read config: permission denied"))
    }
    return Effect.fail(error)
  })
)
```

### Typed Error Recovery

```typescript
import { FileSystem } from "@effect/platform"
import { Effect, Data, pipe } from "effect"

class ConfigNotFound extends Data.TaggedError("ConfigNotFound")<{
  path: string
}> {}

class ConfigInvalid extends Data.TaggedError("ConfigInvalid")<{
  path: string
  reason: string
}> {}

const readConfig = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* pipe(
      fs.readFileString(path),
      Effect.mapError(error =>
        error.reason === "NotFound"
          ? new ConfigNotFound({ path })
          : new ConfigInvalid({ path, reason: error.message })
      )
    )

    return content
  })
```

## Scoped Resources Pattern

```typescript
import { FileSystem } from "@effect/platform"
import { Effect } from "effect"

const processInTempDir = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  // Create temp directory with automatic cleanup
  const tempDir = yield* fs.makeTempDirectoryScoped()

  // Do work in temp directory
  const inputPath = `${tempDir}/input.txt`
  const outputPath = `${tempDir}/output.txt`

  yield* fs.writeFileString(inputPath, "data")
  const content = yield* fs.readFileString(inputPath)
  yield* fs.writeFileString(outputPath, content.toUpperCase())

  const result = yield* fs.readFileString(outputPath)

  // Temp directory is automatically removed when scope exits
  return result
}).pipe(Effect.scoped)
```

## Layer Provision

### Node.js

```typescript
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  return yield* fs.readFileString("data.txt")
})

// Provide Node.js implementation
const runnable = program.pipe(
  Effect.provide(NodeFileSystem.layer)
)

Effect.runPromise(runnable)
```

### Bun

```typescript
import { FileSystem } from "@effect/platform"
import { BunFileSystem } from "@effect/platform-bun"
import { Effect } from "effect"

declare const program: Effect.Effect<string, never, FileSystem.FileSystem>

const runnable = program.pipe(
  Effect.provide(BunFileSystem.layer)
)

Effect.runPromise(runnable)
```

## DO

- Import from `@effect/platform`
- Use `yield* FileSystem.FileSystem` for service injection
- Provide platform layer at entry point only
- Use scoped temp directories with `makeTempDirectoryScoped`
- Handle `SystemError` with `catchTag`
- Use size helpers: `Size()`, `KiB()`, `MiB()`, `GiB()`
- Stream large files with `stream()` and `sink()`

## DON'T

- Import `node:fs`, `fs/promises`, or platform-specific modules in business logic
- Use synchronous fs operations
- Forget to cleanup temp directories (use scoped version)
- Mix platform-specific code with business logic
- Use `Date.now()` - use `Clock` service instead (see testability requirements)
- Hardcode platform-specific paths - use `Path` service for path operations

---
title: Files.errors.ts
nav_order: 31
parent: "@beep/repo-cli"
---

## Files.errors.ts overview

Typed errors for dataset file curation commands.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [FilesCommandError (class)](#filescommanderror-class)
  - [failOnExtensionlessFile](#failonextensionlessfile)
  - [formatPlatformError](#formatplatformerror)
---

# error-handling

## FilesCommandError (class)

Error raised by file curation commands.

**Example**

```ts
import { FilesCommandError } from "@beep/repo-cli/commands/Files/index"

const error = FilesCommandError.make({ message: "Invalid directory" })
console.log(error.message)
```

**Signature**

```ts
declare class FilesCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.errors.ts#L39)

Since v0.0.0

## failOnExtensionlessFile

Fail when a rename operation selects an extensionless file.

**Example**

```ts
import { failOnExtensionlessFile } from "@beep/repo-cli/commands/Files"
console.log(failOnExtensionlessFile)
```

**Signature**

```ts
declare const failOnExtensionlessFile: (filePath: string) => Effect.Effect<never, FilesCommandError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.errors.ts#L102)

Since v0.0.0

## formatPlatformError

Convert a platform failure into a file command error.

**Example**

```ts
import { formatPlatformError } from "@beep/repo-cli/commands/Files"
console.log(formatPlatformError)
```

**Signature**

```ts
declare const formatPlatformError: { (filePath: string, options: PlatformErrorOptions): (operation: string) => FilesCommandError; (operation: string, filePath: string, options: PlatformErrorOptions): FilesCommandError; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.errors.ts#L77)

Since v0.0.0
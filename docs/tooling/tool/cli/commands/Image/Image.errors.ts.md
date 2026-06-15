---
title: Image.errors.ts
nav_order: 41
parent: "@beep/repo-cli"
---

## Image.errors.ts overview

Image command error types.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [ImageCommandError (class)](#imagecommanderror-class)
---

# error-handling

## ImageCommandError (class)

Error raised by image curation commands.

**Example**

```ts
import { ImageCommandError } from "@beep/repo-cli/commands/Image/index"

const error = ImageCommandError.make({ message: "No videos found" })
```

**Signature**

```ts
declare class ImageCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.errors.ts#L28)

Since v0.0.0
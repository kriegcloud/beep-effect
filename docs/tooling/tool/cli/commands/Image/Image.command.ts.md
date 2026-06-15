---
title: Image.command.ts
nav_order: 40
parent: "@beep/repo-cli"
---

## Image.command.ts overview

Command definitions for image and video curation.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [imageCommand](#imagecommand)
---

# use-cases

## imageCommand

Image and video curation command group.

**Example**

```ts
import { imageCommand } from "@beep/repo-cli"
console.log(imageCommand)
```

**Signature**

```ts
declare const imageCommand: Command.Command<"image", {} | {}, {}, FFmpegError | ImageCommandError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Image/Image.command.ts#L135)

Since v0.0.0
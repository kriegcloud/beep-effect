---
title: NoSuchFileError.ts
nav_order: 6
parent: "@beep/repo-utils"
---

## NoSuchFileError.ts overview

Error representing a file or directory that could not be found.

Typically raised when traversing the filesystem for markers like `.git`
or `bun.lock` and reaching the root without success, or when an expected
file path does not exist on disk.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [NoSuchFileError (class)](#nosuchfileerror-class)
---

# error-handling

## NoSuchFileError (class)

Raised when a required file or directory cannot be located.

**Example**

```ts
import { NoSuchFileError } from "@beep/repo-utils/errors/NoSuchFileError"
const error = NoSuchFileError.make({
  message: "Path does not exist",
  path: "/missing"
})
console.log(error.path)
```

**Signature**

```ts
declare class NoSuchFileError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/errors/NoSuchFileError.ts#L32)

Since v0.0.0
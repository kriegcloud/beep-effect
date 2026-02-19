---
title: File.ts
nav_order: 6
parent: Modules
---

## File overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [createFile](#createfile)
- [model](#model)
  - [File (interface)](#file-interface)

---

# constructors

## createFile

By default files are readonly (`isOverwriteable = false`).

**Signature**

```ts
export declare const createFile: (path: string, content: string, isOverwriteable?: boolean) => File
```

Added in v1.0.0

# model

## File (interface)

Represents a file which can be optionally overwriteable.

**Signature**

```ts
export interface File {
  readonly path: string
  readonly content: string
  readonly isOverwriteable: boolean
}
```

Added in v1.0.0

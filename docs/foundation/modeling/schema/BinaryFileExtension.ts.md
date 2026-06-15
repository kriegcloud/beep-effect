---
title: BinaryFileExtension.ts
nav_order: 6
parent: "@beep/schema"
---

## BinaryFileExtension.ts overview

Schema-backed binary file extension literals and byte heuristics for
excluding non-text formats from textual processing.

This module centralizes the binary file extensions used by text-oriented
tooling and provides lightweight helpers for checking file paths and byte
samples before attempting textual comparison.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { BinaryFileExtension, hasBinaryExtension, isBinaryContent } from "@beep/schema/BinaryFileExtension";

const extension = S.decodeUnknownSync(BinaryFileExtension)(".png");

console.log(extension); // ".png"
console.log(hasBinaryExtension("photo.png")); // true
console.log(isBinaryContent(new Uint8Array([0, 159, 146, 150]))); // true
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [hasBinaryExtension](#hasbinaryextension)
  - [isBinaryContent](#isbinarycontent)
- [validation](#validation)
  - [BinaryFileExtension](#binaryfileextension)
  - [isBinaryFileExtension](#isbinaryfileextension)
---

# models

## BinaryFileExtension (type alias)

Union of literals accepted by `BinaryFileExtension`.

**Example**

```ts
import type { BinaryFileExtension } from "@beep/schema/BinaryFileExtension"

const ext: BinaryFileExtension = ".png"
```

**Signature**

```ts
type BinaryFileExtension = typeof BinaryFileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BinaryFileExtension.ts#L198)

Since v0.0.0

# utilities

## hasBinaryExtension

Detects whether a file path ends in a known binary file extension.

The extracted extension is normalized to lowercase before membership is
checked against `BinaryFileExtension`.

**Example**

```ts
```typescript
import { hasBinaryExtension } from "@beep/schema/BinaryFileExtension";

console.log(hasBinaryExtension("photo.PNG")); // true
console.log(hasBinaryExtension("notes.md")); // false
```
```

**Signature**

```ts
declare const hasBinaryExtension: (filePath: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BinaryFileExtension.ts#L238)

Since v0.0.0

## isBinaryContent

Detects whether a byte sample looks like binary content.

The heuristic returns `true` when the inspected sample contains a null byte
or when more than 10% of sampled bytes are non-printable ASCII bytes other
than tab, line feed, and carriage return.

**Example**

```ts
```typescript
import { isBinaryContent } from "@beep/schema/BinaryFileExtension";

const text = new TextEncoder().encode("hello world");
const binary = new Uint8Array([0, 159, 146, 150]);

console.log(isBinaryContent(text)); // false
console.log(isBinaryContent(binary)); // true
```
```

**Signature**

```ts
declare const isBinaryContent: (bytes: Uint8Array) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BinaryFileExtension.ts#L265)

Since v0.0.0

# validation

## BinaryFileExtension

Schema for dotted binary file extensions that should be excluded from
text-based processing.

The literal members include the leading `.` so they match normalized path
extensions directly.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { BinaryFileExtension } from "@beep/schema/BinaryFileExtension";

const extension = S.decodeUnknownSync(BinaryFileExtension)(".pdf");
console.log(extension); // ".pdf"
```
```

**Signature**

```ts
declare const BinaryFileExtension: AnnotatedSchema<LiteralKit<readonly [".data" | ".ai" | ".db" | ".lockb" | ".dat" | ".swf" | ".fla" | ".psd" | ".eps" | ".sketch" | ".fig" | ".xd" | ".blend" | ".3ds" | ".max" | ".sqlite" | ".sqlite3" | ".mdb" | ".idx" | ".pyc" | ".pyo" | ".class" | ".jar" | ".war" | ".ear" | ".node" | ".wasm" | ".rlib" | ".ttf" | ".otf" | ".woff" | ".woff2" | ".eot" | ".pdf" | ".doc" | ".docx" | ".xls" | ".xlsx" | ".ppt" | ".pptx" | ".odt" | ".ods" | ".odp" | ".exe" | ".dll" | ".so" | ".dylib" | ".bin" | ".o" | ".a" | ".obj" | ".lib" | ".app" | ".msi" | ".deb" | ".rpm" | ".zip" | ".tar" | ".gz" | ".bz2" | ".7z" | ".rar" | ".xz" | ".z" | ".tgz" | ".iso" | ".mp3" | ".wav" | ".ogg" | ".flac" | ".aac" | ".m4a" | ".wma" | ".aiff" | ".opus" | ".mp4" | ".mov" | ".avi" | ".mkv" | ".webm" | ".wmv" | ".flv" | ".m4v" | ".mpeg" | ".mpg" | ".png" | ".jpg" | ".jpeg" | ".gif" | ".bmp" | ".ico" | ".webp" | ".tiff" | ".tif", ...(".data" | ".ai" | ".db" | ".lockb" | ".dat" | ".swf" | ".fla" | ".psd" | ".eps" | ".sketch" | ".fig" | ".xd" | ".blend" | ".3ds" | ".max" | ".sqlite" | ".sqlite3" | ".mdb" | ".idx" | ".pyc" | ".pyo" | ".class" | ".jar" | ".war" | ".ear" | ".node" | ".wasm" | ".rlib" | ".ttf" | ".otf" | ".woff" | ".woff2" | ".eot" | ".pdf" | ".doc" | ".docx" | ".xls" | ".xlsx" | ".ppt" | ".pptx" | ".odt" | ".ods" | ".odp" | ".exe" | ".dll" | ".so" | ".dylib" | ".bin" | ".o" | ".a" | ".obj" | ".lib" | ".app" | ".msi" | ".deb" | ".rpm" | ".zip" | ".tar" | ".gz" | ".bz2" | ".7z" | ".rar" | ".xz" | ".z" | ".tgz" | ".iso" | ".mp3" | ".wav" | ".ogg" | ".flac" | ".aac" | ".m4a" | ".wma" | ".aiff" | ".opus" | ".mp4" | ".mov" | ".avi" | ".mkv" | ".webm" | ".wmv" | ".flv" | ".m4v" | ".mpeg" | ".mpg" | ".png" | ".jpg" | ".jpeg" | ".gif" | ".bmp" | ".ico" | ".webp" | ".tiff" | ".tif")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BinaryFileExtension.ts#L176)

Since v0.0.0

## isBinaryFileExtension

Schema-derived guard for individual binary file extensions.

**Example**

```ts
```typescript
import { isBinaryFileExtension } from "@beep/schema/BinaryFileExtension";

console.log(isBinaryFileExtension(".png")); // true
console.log(isBinaryFileExtension("png")); // false
```
```

**Signature**

```ts
declare const isBinaryFileExtension: (value: unknown) => value is BinaryFileExtension
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BinaryFileExtension.ts#L216)

Since v0.0.0
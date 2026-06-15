---
title: Domain.ts
nav_order: 6
parent: "@beep/repo-docgen"
---

## Domain.ts overview

Domain models shared by docgen parsing, checking, and printing.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Class (class)](#class-class)
  - [Constant (class)](#constant-class)
  - [Doc (class)](#doc-class)
    - [modifyDescription (method)](#modifydescription-method)
  - [DocEntry (class)](#docentry-class)
  - [DocgenError (class)](#docgenerror-class)
  - [Export (class)](#export-class)
  - [File (class)](#file-class)
  - [Function (class)](#function-class)
  - [Interface (class)](#interface-class)
  - [Module (class)](#module-class)
    - [source (property)](#source-property)
  - [Namespace (class)](#namespace-class)
    - [namespaces (property)](#namespaces-property)
  - [Position (class)](#position-class)
  - [TypeAlias (class)](#typealias-class)
- [services](#services)
  - [Process (class)](#process-class)
- [symbols](#symbols)
  - [DocgenErrorTypeId](#docgenerrortypeid)
  - [DocgenErrorTypeId (type alias)](#docgenerrortypeid-type-alias)
- [utilities](#utilities)
  - [ByPath](#bypath)
---

# models

## Class (class)

Represents a documented class and its emitted member structure.

**Example**

```ts
import { Class, Doc, Position } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const model = Class.new("Example", doc, {
  signature: "declare class Example",
  position: Position.new(1, 1),
  methods: [],
  staticMethods: [],
  properties: []
})
console.log(model)
```

**Signature**

```ts
declare class Class
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L256)

Since v0.0.0

## Constant (class)

Represents a documented exported constant declaration.

**Example**

```ts
import { Constant, Doc, Position } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const model = Constant.new("example", doc, {
  signature: "declare const example: string",
  position: Position.new(1, 1)
})
console.log(model)
```

**Signature**

```ts
declare class Constant
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L474)

Since v0.0.0

## Doc (class)

Represents normalized JSDoc metadata for a documented symbol.

**Example**

```ts
import { Doc } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
console.log(doc)
```

**Signature**

```ts
declare class Doc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L122)

Since v0.0.0

### modifyDescription (method)

Returns a copy of the doc with a different description.

**Signature**

```ts
declare const modifyDescription: (description: string | undefined) => Doc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L163)

## DocEntry (class)

Represents a named documented API member with source and signature metadata.

**Example**

```ts
import { Doc, DocEntry, Position } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const entry = DocEntry.new("Example", doc, {
  signature: "declare const Example: string",
  position: Position.new(1, 1)
})
console.log(entry)
```

**Signature**

```ts
declare class DocEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L200)

Since v0.0.0

## DocgenError (class)

Typed error used throughout docgen parsing and generation operations.

**Example**

```ts
import { DocgenError } from "@beep/repo-docgen/Domain"
const error = DocgenError.make({ message: "Unable to generate docs." })
console.log(error)
```

**Signature**

```ts
declare class DocgenError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L780)

Since v0.0.0

## Export (class)

These are manual exports, like:

```ts
const _null = ...

export {

}
```

**Example**

```ts
import { Doc, Export, Position } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const model = Export.new("Example", doc, {
  signature: "export { Example }",
  position: Position.new(1, 1),
  isNamespaceExport: false
})
console.log(model)
```

**Signature**

```ts
declare class Export
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L536)

Since v0.0.0

## File (class)

Represents a file which can be optionally overwritable.

**Example**

```ts
import { File } from "@beep/repo-docgen/Domain"
const file = File.new("docs/index.md", "# Docs", { isOverwritable: true })
console.log(file)
```

**Signature**

```ts
declare class File
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L716)

Since v0.0.0

## Function (class)

Represents a documented function declaration or function-valued export.

**Example**

```ts
import { Doc, Function, Position } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const model = Function.new("example", doc, {
  signature: "declare const example: () => void",
  position: Position.new(1, 1)
})
console.log(model)
```

**Signature**

```ts
declare class Function
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L368)

Since v0.0.0

## Interface (class)

Represents a documented interface declaration.

**Example**

```ts
import { Doc, Interface, Position } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const model = Interface.new("Example", doc, {
  signature: "interface Example {}",
  position: Position.new(1, 1)
})
console.log(model)
```

**Signature**

```ts
declare class Interface
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L315)

Since v0.0.0

## Module (class)

Represents a fully parsed module ready for validation and printing.

**Example**

```ts
import { Module } from "@beep/repo-docgen/Domain"
console.log(Module)
```

**Signature**

```ts
declare class Module
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L639)

Since v0.0.0

### source (property)

**Signature**

```ts
readonly source: Parser.SourceShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L652)

## Namespace (class)

Represents a documented namespace and its nested exported members.

**Example**

```ts
import { Doc, Namespace, Position } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const model = Namespace.new("Example", doc, {
  position: Position.new(1, 1),
  interfaces: [],
  typeAliases: [],
  namespaces: []
})
console.log(model)
```

**Signature**

```ts
declare class Namespace
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L593)

Since v0.0.0

### namespaces (property)

**Signature**

```ts
readonly namespaces: ReadonlyArray<Namespace>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L601)

## Position (class)

Represents a one-based source location in a parsed file.

**Example**

```ts
import { Position } from "@beep/repo-docgen/Domain"
const position = Position.new(1, 1)
console.log(position)
```

**Signature**

```ts
declare class Position
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L78)

Since v0.0.0

## TypeAlias (class)

Represents a documented type alias declaration.

**Example**

```ts
import { Doc, Position, TypeAlias } from "@beep/repo-docgen/Domain"
const doc = Doc.new("Description.", {
  since: ["0.0.0"],
  deprecated: [],
  examples: [],
  category: ["model"],
  throws: [],
  sees: [],
  tags: {}
})
const model = TypeAlias.new("Example", doc, {
  signature: "type Example = string",
  position: Position.new(1, 1)
})
console.log(model)
```

**Signature**

```ts
declare class TypeAlias
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L421)

Since v0.0.0

# services

## Process (class)

Represents a handle to the currently executing process.

**Example**

```ts
import { Process } from "@beep/repo-docgen/Domain"
console.log(Process)
```

**Signature**

```ts
declare class Process
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L816)

Since v0.0.0

# symbols

## DocgenErrorTypeId

Unique symbol used to brand docgen-specific errors.

**Example**

```ts
import { DocgenErrorTypeId } from "@beep/repo-docgen/Domain"
console.log(DocgenErrorTypeId)
```

**Signature**

```ts
declare const DocgenErrorTypeId: unique symbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L753)

Since v0.0.0

## DocgenErrorTypeId (type alias)

Type-level alias for the unique docgen error branding symbol.

**Example**

```ts
import type { DocgenErrorTypeId } from "@beep/repo-docgen/Domain"
type ExampleDocgenErrorTypeId = DocgenErrorTypeId
```

**Signature**

```ts
type DocgenErrorTypeId = typeof DocgenErrorTypeId
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L766)

Since v0.0.0

# utilities

## ByPath

A comparator function for sorting `Module` objects by their file path,
represented as a lowercase string.

**Example**

```ts
import { ByPath } from "@beep/repo-docgen/Domain"
console.log(ByPath)
```

**Signature**

```ts
declare const ByPath: Order.Order<Module>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Domain.ts#L700)

Since v0.0.0
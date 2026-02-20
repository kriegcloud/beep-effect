---
title: Domain.ts
nav_order: 5
parent: Modules
---

## Domain.ts overview

Since v0.6.0

---

## Exports Grouped by Category

- [model](#model)
  - [Class (class)](#class-class)
    - [\_tag (property)](#_tag-property)
  - [Constant (class)](#constant-class)
    - [\_tag (property)](#_tag-property-1)
  - [Doc (class)](#doc-class)
    - [modifyDescription (method)](#modifydescription-method)
  - [DocEntry (class)](#docentry-class)
  - [DocgenError (class)](#docgenerror-class)
  - [Export (class)](#export-class)
    - [\_tag (property)](#_tag-property-2)
  - [File (class)](#file-class)
  - [Function (class)](#function-class)
    - [\_tag (property)](#_tag-property-3)
  - [Interface (class)](#interface-class)
    - [\_tag (property)](#_tag-property-4)
  - [Module (class)](#module-class)
  - [Namespace (class)](#namespace-class)
    - [\_tag (property)](#_tag-property-5)
  - [Position (interface)](#position-interface)
  - [TypeAlias (class)](#typealias-class)
    - [\_tag (property)](#_tag-property-6)
- [service](#service)
  - [Process (class)](#process-class)
- [sorting](#sorting)
  - [ByPath](#bypath)
- [symbol](#symbol)
  - [DocgenErrorTypeId](#docgenerrortypeid)
  - [DocgenErrorTypeId (type alias)](#docgenerrortypeid-type-alias)

---

# model

## Class (class)

**Signature**

```ts
declare class Class { constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position,
    readonly methods: ReadonlyArray<DocEntry>,
    readonly staticMethods: ReadonlyArray<DocEntry>,
    readonly properties: ReadonlyArray<DocEntry>
  ) }
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L79)

Since v0.6.0

### \_tag (property)

**Signature**

```ts
readonly _tag: "Class"
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L80)

## Constant (class)

**Signature**

```ts
declare class Constant {
  constructor(name: string, doc: Doc, signature: string, position: Position)
}
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L155)

Since v0.6.0

### \_tag (property)

**Signature**

```ts
readonly _tag: "Constant"
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L156)

## Doc (class)

**Signature**

```ts
declare class Doc { constructor(
    readonly description: string | undefined,
    readonly since: ReadonlyArray<string>,
    readonly deprecated: ReadonlyArray<string>,
    readonly examples: ReadonlyArray<string>,
    readonly category: ReadonlyArray<string>,
    readonly throws: ReadonlyArray<string>,
    readonly sees: ReadonlyArray<string>,
    readonly tags: Record<string, ReadonlyArray<string> | undefined>
  ) }
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L29)

Since v0.6.0

### modifyDescription (method)

**Signature**

```ts
declare const modifyDescription: (description: string | undefined) => Doc
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L41)

## DocEntry (class)

**Signature**

```ts
declare class DocEntry { constructor(
    readonly name: string,
    readonly doc: Doc,
    readonly signature: string,
    readonly position: Position
  ) }
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L16)

Since v0.6.0

## DocgenError (class)

**Signature**

```ts
declare class DocgenError
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L252)

Since v0.6.0

## Export (class)

These are manual exports, like:

```ts
const _null = ...

export {
  _null as null
}
```

**Signature**

```ts
declare class Export { constructor(
    name: string,
    doc: Doc,
    signature: string,
    position: Position,
    readonly isNamespaceExport: boolean
  ) }
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L181)

Since v0.6.0

### \_tag (property)

**Signature**

```ts
readonly _tag: "Export"
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L182)

## File (class)

Represents a file which can be optionally overwriteable.

**Signature**

```ts
declare class File { constructor(
    readonly path: string,
    readonly content: string,
    readonly isOverwriteable: boolean = false
  ) }
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L228)

Since v0.6.0

## Function (class)

**Signature**

```ts
declare class Function {
  constructor(name: string, doc: Doc, signature: string, position: Position)
}
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L123)

Since v0.6.0

### \_tag (property)

**Signature**

```ts
readonly _tag: "Function"
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L124)

## Interface (class)

**Signature**

```ts
declare class Interface {
  constructor(name: string, doc: Doc, signature: string, position: Position)
}
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L98)

Since v0.6.0

### \_tag (property)

**Signature**

```ts
readonly _tag: "Interface"
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L99)

## Module (class)

**Signature**

```ts
declare class Module { constructor(
    readonly source: Parser.SourceShape,
    readonly name: string,
    readonly doc: Doc,
    readonly path: Array.NonEmptyReadonlyArray<string>,
    readonly classes: ReadonlyArray<Class>,
    readonly interfaces: ReadonlyArray<Interface>,
    readonly functions: ReadonlyArray<Function>,
    readonly typeAliases: ReadonlyArray<TypeAlias>,
    readonly constants: ReadonlyArray<Constant>,
    readonly exports: ReadonlyArray<Export>,
    readonly namespaces: ReadonlyArray<Namespace>
  ) }
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L59)

Since v0.6.0

## Namespace (class)

**Signature**

```ts
declare class Namespace { constructor(
    readonly name: string,
    readonly doc: Doc,
    readonly position: Position,
    readonly interfaces: ReadonlyArray<Interface>,
    readonly typeAliases: ReadonlyArray<TypeAlias>,
    readonly namespaces: ReadonlyArray<Namespace>
  ) }
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L198)

Since v0.6.0

### \_tag (property)

**Signature**

```ts
readonly _tag: "Namespace"
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L199)

## Position (interface)

**Signature**

```ts
export interface Position {
  readonly line: number
  readonly column: number
}
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L114)

Since v0.6.0

## TypeAlias (class)

**Signature**

```ts
declare class TypeAlias {
  constructor(name: string, doc: Doc, signature: string, position: Position)
}
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L139)

Since v0.6.0

### \_tag (property)

**Signature**

```ts
readonly _tag: "TypeAlias"
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L140)

# service

## Process (class)

Represents a handle to the currently executing process.

**Signature**

```ts
declare class Process
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L262)

Since v0.6.0

# sorting

## ByPath

A comparator function for sorting `Module` objects by their file path, represented as a string.
The file path is converted to lowercase before comparison.

**Signature**

```ts
declare const ByPath: Order.Order<Module>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L217)

Since v0.6.0

# symbol

## DocgenErrorTypeId

**Signature**

```ts
declare const DocgenErrorTypeId: unique symbol
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L240)

Since v0.6.0

## DocgenErrorTypeId (type alias)

**Signature**

```ts
type DocgenErrorTypeId = typeof DocgenErrorTypeId
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Domain.ts#L246)

Since v0.6.0

---
title: Domain.ts
nav_order: 4
parent: Modules
---

## Domain overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [createClass](#createclass)
  - [createConstant](#createconstant)
  - [createDoc](#createdoc)
  - [createExport](#createexport)
  - [createFunction](#createfunction)
  - [createInterface](#createinterface)
  - [createMethod](#createmethod)
  - [createModule](#createmodule)
  - [createNamedDoc](#createnameddoc)
  - [createNamespace](#createnamespace)
  - [createProperty](#createproperty)
  - [createTypeAlias](#createtypealias)
- [model](#model)
  - [Class (interface)](#class-interface)
  - [Constant (interface)](#constant-interface)
  - [Doc (interface)](#doc-interface)
  - [Example (type alias)](#example-type-alias)
  - [Export (interface)](#export-interface)
  - [Function (interface)](#function-interface)
  - [Interface (interface)](#interface-interface)
  - [Method (interface)](#method-interface)
  - [Module (interface)](#module-interface)
  - [NamedDoc (interface)](#nameddoc-interface)
  - [Namespace (interface)](#namespace-interface)
  - [Property (interface)](#property-interface)
  - [TypeAlias (interface)](#typealias-interface)
- [sorting](#sorting)
  - [ByPath](#bypath)

---

# constructors

## createClass

**Signature**

```ts
export declare const createClass: (
  doc: NamedDoc,
  signature: string,
  methods: ReadonlyArray<Method>,
  staticMethods: ReadonlyArray<Method>,
  properties: ReadonlyArray<Property>
) => Class
```

Added in v1.0.0

## createConstant

**Signature**

```ts
export declare const createConstant: (doc: NamedDoc, signature: string) => Constant
```

Added in v1.0.0

## createDoc

**Signature**

```ts
export declare const createDoc: (
  description: Option.Option<string>,
  since: Option.Option<string>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: Option.Option<string>
) => Doc
```

Added in v1.0.0

## createExport

**Signature**

```ts
export declare const createExport: (doc: NamedDoc, signature: string) => Export
```

Added in v1.0.0

## createFunction

**Signature**

```ts
export declare const createFunction: (doc: NamedDoc, signatures: ReadonlyArray<string>) => Function
```

Added in v1.0.0

## createInterface

**Signature**

```ts
export declare const createInterface: (doc: NamedDoc, signature: string) => Interface
```

Added in v1.0.0

## createMethod

**Signature**

```ts
export declare const createMethod: (doc: NamedDoc, signatures: ReadonlyArray<string>) => Method
```

Added in v1.0.0

## createModule

**Signature**

```ts
export declare const createModule: (
  doc: NamedDoc,
  path: ReadonlyArray<string>,
  classes: ReadonlyArray<Class>,
  interfaces: ReadonlyArray<Interface>,
  functions: ReadonlyArray<Function>,
  typeAliases: ReadonlyArray<TypeAlias>,
  constants: ReadonlyArray<Constant>,
  exports: ReadonlyArray<Export>,
  namespaces: ReadonlyArray<Namespace>
) => Module
```

Added in v1.0.0

## createNamedDoc

**Signature**

```ts
export declare const createNamedDoc: (
  name: string,
  description: Option.Option<string>,
  since: Option.Option<string>,
  deprecated: boolean,
  examples: ReadonlyArray<Example>,
  category: Option.Option<string>
) => NamedDoc
```

Added in v1.0.0

## createNamespace

**Signature**

```ts
export declare const createNamespace: (
  doc: NamedDoc,
  interfaces: ReadonlyArray<Interface>,
  typeAliases: ReadonlyArray<TypeAlias>,
  namespaces: ReadonlyArray<Namespace>
) => Namespace
```

Added in v1.0.0

## createProperty

**Signature**

```ts
export declare const createProperty: (doc: NamedDoc, signature: string) => Property
```

Added in v1.0.0

## createTypeAlias

**Signature**

```ts
export declare const createTypeAlias: (doc: NamedDoc, signature: string) => TypeAlias
```

Added in v1.0.0

# model

## Class (interface)

**Signature**

```ts
export interface Class extends NamedDoc {
  readonly _tag: "Class"
  readonly signature: string
  readonly methods: ReadonlyArray<Method>
  readonly staticMethods: ReadonlyArray<Method>
  readonly properties: ReadonlyArray<Property>
}
```

Added in v1.0.0

## Constant (interface)

**Signature**

```ts
export interface Constant extends NamedDoc {
  readonly _tag: "Constant"
  readonly signature: string
}
```

Added in v1.0.0

## Doc (interface)

**Signature**

```ts
export interface Doc {
  readonly description: Option.Option<string>
  readonly since: Option.Option<string>
  readonly deprecated: boolean
  readonly examples: ReadonlyArray<Example>
  readonly category: Option.Option<string>
}
```

Added in v1.0.0

## Example (type alias)

**Signature**

```ts
export type Example = {
  body: string
  fences?: {
    start: string
    end: string
  }
}
```

Added in v1.0.0

## Export (interface)

These are manual exports, like:

```ts
const _null = ...

export {
  _null as null
}
```

**Signature**

```ts
export interface Export extends NamedDoc {
  readonly _tag: "Export"
  readonly signature: string
}
```

Added in v1.0.0

## Function (interface)

**Signature**

```ts
export interface Function extends NamedDoc {
  readonly _tag: "Function"
  readonly signatures: ReadonlyArray<string>
}
```

Added in v1.0.0

## Interface (interface)

**Signature**

```ts
export interface Interface extends NamedDoc {
  readonly _tag: "Interface"
  readonly signature: string
}
```

Added in v1.0.0

## Method (interface)

**Signature**

```ts
export interface Method extends NamedDoc {
  readonly signatures: ReadonlyArray<string>
}
```

Added in v1.0.0

## Module (interface)

**Signature**

```ts
export interface Module extends NamedDoc {
  readonly path: ReadonlyArray<string>
  readonly classes: ReadonlyArray<Class>
  readonly interfaces: ReadonlyArray<Interface>
  readonly functions: ReadonlyArray<Function>
  readonly typeAliases: ReadonlyArray<TypeAlias>
  readonly constants: ReadonlyArray<Constant>
  readonly exports: ReadonlyArray<Export>
  readonly namespaces: ReadonlyArray<Namespace>
}
```

Added in v1.0.0

## NamedDoc (interface)

**Signature**

```ts
export interface NamedDoc extends Doc {
  readonly name: string
}
```

Added in v1.0.0

## Namespace (interface)

**Signature**

```ts
export interface Namespace extends NamedDoc {
  readonly _tag: "Namespace"
  readonly interfaces: ReadonlyArray<Interface>
  readonly typeAliases: ReadonlyArray<TypeAlias>
  readonly namespaces: ReadonlyArray<Namespace>
}
```

Added in v1.0.0

## Property (interface)

**Signature**

```ts
export interface Property extends NamedDoc {
  readonly signature: string
}
```

Added in v1.0.0

## TypeAlias (interface)

**Signature**

```ts
export interface TypeAlias extends NamedDoc {
  readonly _tag: "TypeAlias"
  readonly signature: string
}
```

Added in v1.0.0

# sorting

## ByPath

A comparator function for sorting `Module` objects by their file path, represented as a string.
The file path is converted to lowercase before comparison.

**Signature**

```ts
export declare const ByPath: Order.Order<Module>
```

Added in v1.0.0

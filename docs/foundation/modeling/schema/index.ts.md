---
title: index.ts
nav_order: 135
parent: "@beep/schema"
---

## index.ts overview

\@beep/schema

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [VERSION](#version)
- [schemas](#schemas)
  - ["./Number.ts" (namespace export)](#numberts-namespace-export)
  - ["./Record/index.ts" (namespace export)](#recordindexts-namespace-export)
- [utilities](#utilities)
  - [SchemaUtils (namespace export)](#schemautils-namespace-export)
- [validation](#validation)
  - ["./AbortSignal.ts" (namespace export)](#abortsignalts-namespace-export)
  - ["./ArrayOf.ts" (namespace export)](#arrayofts-namespace-export)
  - ["./BigDecimal.ts" (namespace export)](#bigdecimalts-namespace-export)
  - ["./BufferEncoding.ts" (namespace export)](#bufferencodingts-namespace-export)
  - ["./CauseTaggedError/index.ts" (namespace export)](#causetaggederrorindexts-namespace-export)
  - ["./Color/index.ts" (namespace export)](#colorindexts-namespace-export)
  - ["./CommonTextSchemas.ts" (namespace export)](#commontextschemasts-namespace-export)
  - ["./DateTimeUtcFromValid/index.ts" (namespace export)](#datetimeutcfromvalidindexts-namespace-export)
  - ["./EffectSchema.ts" (namespace export)](#effectschemats-namespace-export)
  - ["./Email.ts" (namespace export)](#emailts-namespace-export)
  - ["./FileExtension.ts" (namespace export)](#fileextensionts-namespace-export)
  - ["./FileName.ts" (namespace export)](#filenamets-namespace-export)
  - ["./FilePath/index.ts" (namespace export)](#filepathindexts-namespace-export)
  - ["./Float16Array.ts" (namespace export)](#float16arrayts-namespace-export)
  - ["./Float32Array.ts" (namespace export)](#float32arrayts-namespace-export)
  - ["./Float64Array.ts" (namespace export)](#float64arrayts-namespace-export)
  - ["./Fn/index.ts" (namespace export)](#fnindexts-namespace-export)
  - ["./Glob/index.ts" (namespace export)](#globindexts-namespace-export)
  - ["./Graph/index.ts" (namespace export)](#graphindexts-namespace-export)
  - ["./Html.ts" (namespace export)](#htmlts-namespace-export)
  - ["./Int.ts" (namespace export)](#intts-namespace-export)
  - ["./Json.ts" (namespace export)](#jsonts-namespace-export)
  - ["./Jsonc.ts" (namespace export)](#jsoncts-namespace-export)
  - ["./Jsonl.ts" (namespace export)](#jsonlts-namespace-export)
  - ["./KebabStr.ts" (namespace export)](#kebabstrts-namespace-export)
  - ["./LiteralKit/index.ts" (namespace export)](#literalkitindexts-namespace-export)
  - ["./LocalDate/index.ts" (namespace export)](#localdateindexts-namespace-export)
  - ["./Logs.ts" (namespace export)](#logsts-namespace-export)
  - ["./MappedLiteralKit/index.ts" (namespace export)](#mappedliteralkitindexts-namespace-export)
  - ["./Markdown.ts" (namespace export)](#markdownts-namespace-export)
  - ["./MimeType.ts" (namespace export)](#mimetypets-namespace-export)
  - ["./MutableHashMap.ts" (namespace export)](#mutablehashmapts-namespace-export)
  - ["./MutableHashSet.ts" (namespace export)](#mutablehashsetts-namespace-export)
  - ["./Options.ts" (namespace export)](#optionsts-namespace-export)
  - ["./PascalStr.ts" (namespace export)](#pascalstrts-namespace-export)
  - ["./PosixPath.ts" (namespace export)](#posixpathts-namespace-export)
  - ["./Primitive.ts" (namespace export)](#primitivets-namespace-export)
  - ["./PromiseSchema.ts" (namespace export)](#promiseschemats-namespace-export)
  - ["./RegExp.ts" (namespace export)](#regexpts-namespace-export)
  - ["./SemanticVersion.ts" (namespace export)](#semanticversionts-namespace-export)
  - ["./SeverityLevel.ts" (namespace export)](#severitylevelts-namespace-export)
  - ["./Sha256.ts" (namespace export)](#sha256ts-namespace-export)
  - ["./Slug.ts" (namespace export)](#slugts-namespace-export)
  - ["./SnakeStr.ts" (namespace export)](#snakestrts-namespace-export)
  - ["./StatusCauseError.ts" (namespace export)](#statuscauseerrorts-namespace-export)
  - ["./StatusCauseTaggedErrorClass/index.ts" (namespace export)](#statuscausetaggederrorclassindexts-namespace-export)
  - ["./String.ts" (namespace export)](#stringts-namespace-export)
  - ["./TaggedErrorClass/index.ts" (namespace export)](#taggederrorclassindexts-namespace-export)
  - ["./Timezone.ts" (namespace export)](#timezonets-namespace-export)
  - ["./Toml.ts" (namespace export)](#tomlts-namespace-export)
  - ["./Transformations.ts" (namespace export)](#transformationsts-namespace-export)
  - ["./URL.ts" (namespace export)](#urlts-namespace-export)
  - ["./Xml.ts" (namespace export)](#xmlts-namespace-export)
  - ["./Yaml.ts" (namespace export)](#yamlts-namespace-export)
  - [CSV](#csv)
  - [Csv](#csv-1)
  - [CsvDocument](#csvdocument)
  - [CsvText](#csvtext)
  - [DomainModel (namespace export)](#domainmodel-namespace-export)
  - [Duration](#duration)
  - [DurationFromInput](#durationfrominput)
  - [DurationFromInputValue](#durationfrominputvalue)
  - [DurationInput](#durationinput)
  - [DurationInputValue](#durationinputvalue)
  - [DurationObject](#durationobject)
  - [DurationUnit](#durationunit)
  - [DurationUnitAlias](#durationunitalias)
  - [DurationUnitValue](#durationunitvalue)
  - [DurationValue](#durationvalue)
  - [EntitySchema (namespace export)](#entityschema-namespace-export)
  - [FromInput](#frominput)
  - [Model (namespace export)](#model-namespace-export)
  - [RowSchemaWithFields](#rowschemawithfields)
  - [VariantSchema (namespace export)](#variantschema-namespace-export)
---

# configuration

## VERSION

Package version.

**Example**

```ts
import { VERSION } from "@beep/schema"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L23)

Since v0.0.0

# schemas

## "./Number.ts" (namespace export)

Re-exports all named exports from the "./Number.ts" module.

**Signature**

```ts
export * from "./Number.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L8)

Since v0.0.0

## "./Record/index.ts" (namespace export)

Re-exports all named exports from the "./Record/index.ts" module.

**Signature**

```ts
export * from "./Record/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L259)

Since v0.0.0

# utilities

## SchemaUtils (namespace export)

Re-exports all named exports from the "./SchemaUtils/index.ts" module as `SchemaUtils`.

**Signature**

```ts
export * as SchemaUtils from "./SchemaUtils/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L269)

Since v0.0.0

# validation

## "./AbortSignal.ts" (namespace export)

Re-exports all named exports from the "./AbortSignal.ts" module.

**Signature**

```ts
export * from "./AbortSignal.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L42)

Since v0.0.0

## "./ArrayOf.ts" (namespace export)

Re-exports all named exports from the "./ArrayOf.ts" module.

**Signature**

```ts
export * from "./ArrayOf.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L47)

Since v0.0.0

## "./BigDecimal.ts" (namespace export)

Re-exports all named exports from the "./BigDecimal.ts" module.

**Signature**

```ts
export * from "./BigDecimal.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L52)

Since v0.0.0

## "./BufferEncoding.ts" (namespace export)

Re-exports all named exports from the "./BufferEncoding.ts" module.

**Signature**

```ts
export * from "./BufferEncoding.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L57)

Since v0.0.0

## "./CauseTaggedError/index.ts" (namespace export)

Re-exports all named exports from the "./CauseTaggedError/index.ts" module.

**Signature**

```ts
export * from "./CauseTaggedError/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L62)

Since v0.0.0

## "./Color/index.ts" (namespace export)

Re-exports all named exports from the "./Color/index.ts" module.

**Signature**

```ts
export * from "./Color/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L67)

Since v0.0.0

## "./CommonTextSchemas.ts" (namespace export)

Re-exports all named exports from the "./CommonTextSchemas.ts" module.

**Signature**

```ts
export * from "./CommonTextSchemas.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L72)

Since v0.0.0

## "./DateTimeUtcFromValid/index.ts" (namespace export)

Re-exports all named exports from the "./DateTimeUtcFromValid/index.ts" module.

**Signature**

```ts
export * from "./DateTimeUtcFromValid/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L82)

Since v0.0.0

## "./EffectSchema.ts" (namespace export)

Re-exports all named exports from the "./EffectSchema.ts" module.

**Signature**

```ts
export * from "./EffectSchema.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L109)

Since v0.0.0

## "./Email.ts" (namespace export)

Re-exports all named exports from the "./Email.ts" module.

**Signature**

```ts
export * from "./Email.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L114)

Since v0.0.0

## "./FileExtension.ts" (namespace export)

Re-exports all named exports from the "./FileExtension.ts" module.

**Signature**

```ts
export * from "./FileExtension.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L124)

Since v0.0.0

## "./FileName.ts" (namespace export)

Re-exports all named exports from the "./FileName.ts" module.

**Signature**

```ts
export * from "./FileName.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L129)

Since v0.0.0

## "./FilePath/index.ts" (namespace export)

Re-exports all named exports from the "./FilePath/index.ts" module.

**Signature**

```ts
export * from "./FilePath/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L134)

Since v0.0.0

## "./Float16Array.ts" (namespace export)

Re-exports all named exports from the "./Float16Array.ts" module.

**Signature**

```ts
export * from "./Float16Array.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L139)

Since v0.0.0

## "./Float32Array.ts" (namespace export)

Re-exports all named exports from the "./Float32Array.ts" module.

**Signature**

```ts
export * from "./Float32Array.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L144)

Since v0.0.0

## "./Float64Array.ts" (namespace export)

Re-exports all named exports from the "./Float64Array.ts" module.

**Signature**

```ts
export * from "./Float64Array.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L149)

Since v0.0.0

## "./Fn/index.ts" (namespace export)

Re-exports all named exports from the "./Fn/index.ts" module.

**Signature**

```ts
export * from "./Fn/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L154)

Since v0.0.0

## "./Glob/index.ts" (namespace export)

Re-exports all named exports from the "./Glob/index.ts" module.

**Signature**

```ts
export * from "./Glob/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L159)

Since v0.0.0

## "./Graph/index.ts" (namespace export)

Re-exports all named exports from the "./Graph/index.ts" module.

**Signature**

```ts
export * from "./Graph/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L164)

Since v0.0.0

## "./Html.ts" (namespace export)

Re-exports all named exports from the "./Html.ts" module.

**Signature**

```ts
export * from "./Html.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L169)

Since v0.0.0

## "./Int.ts" (namespace export)

Re-exports all named exports from the "./Int.ts" module.

**Signature**

```ts
export * from "./Int.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L174)

Since v0.0.0

## "./Json.ts" (namespace export)

Re-exports all named exports from the "./Json.ts" module.

**Signature**

```ts
export * from "./Json.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L179)

Since v0.0.0

## "./Jsonc.ts" (namespace export)

Re-exports all named exports from the "./Jsonc.ts" module.

**Signature**

```ts
export * from "./Jsonc.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L184)

Since v0.0.0

## "./Jsonl.ts" (namespace export)

Re-exports all named exports from the "./Jsonl.ts" module.

**Signature**

```ts
export * from "./Jsonl.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L189)

Since v0.0.0

## "./KebabStr.ts" (namespace export)

Re-exports all named exports from the "./KebabStr.ts" module.

**Signature**

```ts
export * from "./KebabStr.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L194)

Since v0.0.0

## "./LiteralKit/index.ts" (namespace export)

Re-exports all named exports from the "./LiteralKit/index.ts" module.

**Signature**

```ts
export * from "./LiteralKit/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L29)

Since v0.0.0

## "./LocalDate/index.ts" (namespace export)

Re-exports all named exports from the "./LocalDate/index.ts" module.

**Signature**

```ts
export * from "./LocalDate/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L199)

Since v0.0.0

## "./Logs.ts" (namespace export)

Re-exports all named exports from the "./Logs.ts" module.

**Signature**

```ts
export * from "./Logs.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L204)

Since v0.0.0

## "./MappedLiteralKit/index.ts" (namespace export)

Re-exports all named exports from the "./MappedLiteralKit/index.ts" module.

**Signature**

```ts
export * from "./MappedLiteralKit/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L34)

Since v0.0.0

## "./Markdown.ts" (namespace export)

Re-exports all named exports from the "./Markdown.ts" module.

**Signature**

```ts
export * from "./Markdown.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L209)

Since v0.0.0

## "./MimeType.ts" (namespace export)

Re-exports all named exports from the "./MimeType.ts" module.

**Signature**

```ts
export * from "./MimeType.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L214)

Since v0.0.0

## "./MutableHashMap.ts" (namespace export)

Re-exports all named exports from the "./MutableHashMap.ts" module.

**Signature**

```ts
export * from "./MutableHashMap.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L224)

Since v0.0.0

## "./MutableHashSet.ts" (namespace export)

Re-exports all named exports from the "./MutableHashSet.ts" module.

**Signature**

```ts
export * from "./MutableHashSet.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L229)

Since v0.0.0

## "./Options.ts" (namespace export)

Re-exports all named exports from the "./Options.ts" module.

**Signature**

```ts
export * from "./Options.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L234)

Since v0.0.0

## "./PascalStr.ts" (namespace export)

Re-exports all named exports from the "./PascalStr.ts" module.

**Signature**

```ts
export * from "./PascalStr.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L239)

Since v0.0.0

## "./PosixPath.ts" (namespace export)

Re-exports all named exports from the "./PosixPath.ts" module.

**Signature**

```ts
export * from "./PosixPath.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L244)

Since v0.0.0

## "./Primitive.ts" (namespace export)

Re-exports all named exports from the "./Primitive.ts" module.

**Signature**

```ts
export * from "./Primitive.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L249)

Since v0.0.0

## "./PromiseSchema.ts" (namespace export)

Re-exports all named exports from the "./PromiseSchema.ts" module.

**Signature**

```ts
export * from "./PromiseSchema.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L254)

Since v0.0.0

## "./RegExp.ts" (namespace export)

Re-exports all named exports from the "./RegExp.ts" module.

**Signature**

```ts
export * from "./RegExp.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L264)

Since v0.0.0

## "./SemanticVersion.ts" (namespace export)

Re-exports all named exports from the "./SemanticVersion.ts" module.

**Signature**

```ts
export * from "./SemanticVersion.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L274)

Since v0.0.0

## "./SeverityLevel.ts" (namespace export)

Re-exports all named exports from the "./SeverityLevel.ts" module.

**Signature**

```ts
export * from "./SeverityLevel.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L279)

Since v0.0.0

## "./Sha256.ts" (namespace export)

Re-exports all named exports from the "./Sha256.ts" module.

**Signature**

```ts
export * from "./Sha256.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L284)

Since v0.0.0

## "./Slug.ts" (namespace export)

Re-exports all named exports from the "./Slug.ts" module.

**Signature**

```ts
export * from "./Slug.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L289)

Since v0.0.0

## "./SnakeStr.ts" (namespace export)

Re-exports all named exports from the "./SnakeStr.ts" module.

**Signature**

```ts
export * from "./SnakeStr.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L294)

Since v0.0.0

## "./StatusCauseError.ts" (namespace export)

Re-exports all named exports from the "./StatusCauseError.ts" module.

**Signature**

```ts
export * from "./StatusCauseError.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L299)

Since v0.0.0

## "./StatusCauseTaggedErrorClass/index.ts" (namespace export)

Re-exports all named exports from the "./StatusCauseTaggedErrorClass/index.ts" module.

**Signature**

```ts
export * from "./StatusCauseTaggedErrorClass/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L304)

Since v0.0.0

## "./String.ts" (namespace export)

Re-exports all named exports from the "./String.ts" module.

**Signature**

```ts
export * from "./String.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L309)

Since v0.0.0

## "./TaggedErrorClass/index.ts" (namespace export)

Re-exports all named exports from the "./TaggedErrorClass/index.ts" module.

**Signature**

```ts
export * from "./TaggedErrorClass/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L314)

Since v0.0.0

## "./Timezone.ts" (namespace export)

Re-exports all named exports from the "./Timezone.ts" module.

**Signature**

```ts
export * from "./Timezone.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L319)

Since v0.0.0

## "./Toml.ts" (namespace export)

Re-exports all named exports from the "./Toml.ts" module.

**Signature**

```ts
export * from "./Toml.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L324)

Since v0.0.0

## "./Transformations.ts" (namespace export)

Re-exports all named exports from the "./Transformations.ts" module.

**Signature**

```ts
export * from "./Transformations.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L329)

Since v0.0.0

## "./URL.ts" (namespace export)

Re-exports all named exports from the "./URL.ts" module.

**Signature**

```ts
export * from "./URL.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L334)

Since v0.0.0

## "./Xml.ts" (namespace export)

Re-exports all named exports from the "./Xml.ts" module.

**Signature**

```ts
export * from "./Xml.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L344)

Since v0.0.0

## "./Yaml.ts" (namespace export)

Re-exports all named exports from the "./Yaml.ts" module.

**Signature**

```ts
export * from "./Yaml.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L349)

Since v0.0.0

## CSV

**Signature**

```ts
declare const CSV: { <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema, options: CsvCodecOptionsArgs): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(options: CsvCodecOptionsArgs): (rowSchema: RowSchema) => CsvDocument<RowSchema>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L77)

Since v0.0.0

## Csv

**Signature**

```ts
declare const Csv: { <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema, options: CsvCodecOptionsArgs): CsvDocument<RowSchema>; <RowSchema extends RowSchemaWithFields>(options: CsvCodecOptionsArgs): (rowSchema: RowSchema) => CsvDocument<RowSchema>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L77)

Since v0.0.0

## CsvDocument

**Signature**

```ts
declare const CsvDocument: any
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L77)

Since v0.0.0

## CsvText

**Signature**

```ts
declare const CsvText: any
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L77)

Since v0.0.0

## DomainModel (namespace export)

Re-exports all named exports from the "./DomainModel.ts" module as `DomainModel`.

**Signature**

```ts
export * as DomainModel from "./DomainModel.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L87)

Since v0.0.0

## Duration

**Signature**

```ts
declare const Duration: Duration
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L93)

Since v0.0.0

## DurationFromInput

**Signature**

```ts
declare const DurationFromInput: AnnotatedSchema<decodeTo<Duration, Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]> & SchemaStatics<Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L95)

Since v0.0.0

## DurationFromInputValue

**Signature**

```ts
declare const DurationFromInputValue: AnnotatedSchema<decodeTo<Duration, Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]> & SchemaStatics<Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L96)

Since v0.0.0

## DurationInput

**Signature**

```ts
declare const DurationInput: AnnotatedSchema<Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L97)

Since v0.0.0

## DurationInputValue

**Signature**

```ts
declare const DurationInputValue: AnnotatedSchema<Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L98)

Since v0.0.0

## DurationObject

**Signature**

```ts
declare const DurationObject: typeof DurationObject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L99)

Since v0.0.0

## DurationUnit

**Signature**

```ts
declare const DurationUnit: AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L100)

Since v0.0.0

## DurationUnitAlias

**Signature**

```ts
declare const DurationUnitAlias: any
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L103)

Since v0.0.0

## DurationUnitValue

**Signature**

```ts
declare const DurationUnitValue: AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L101)

Since v0.0.0

## DurationValue

**Signature**

```ts
declare const DurationValue: Duration
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L94)

Since v0.0.0

## EntitySchema (namespace export)

Re-exports all named exports from the "./EntitySchema/index.ts" module as `EntitySchema`.

**Signature**

```ts
export * as EntitySchema from "./EntitySchema/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L119)

Since v0.0.0

## FromInput

**Signature**

```ts
declare const FromInput: AnnotatedSchema<decodeTo<Duration, Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]> & SchemaStatics<Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L102)

Since v0.0.0

## Model (namespace export)

Re-exports all named exports from the "./Model/index.ts" module as `Model`.

**Signature**

```ts
export * as Model from "./Model/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L219)

Since v0.0.0

## RowSchemaWithFields

**Signature**

```ts
declare const RowSchemaWithFields: any
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L77)

Since v0.0.0

## VariantSchema (namespace export)

Re-exports all named exports from the "./VariantSchema/index.ts" module as `VariantSchema`.

**Signature**

```ts
export * as VariantSchema from "./VariantSchema/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/index.ts#L339)

Since v0.0.0
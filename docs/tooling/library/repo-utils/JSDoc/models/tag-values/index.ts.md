---
title: index.ts
nav_order: 28
parent: "@beep/repo-utils"
---

## index.ts overview

Tag value occurrence shapes — individual `S.TaggedClass` members composed
into `TagValue` (tagged union) and `TagName` (LiteralKit).

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - ["./AccessModifierTagValues.js" (namespace export)](#accessmodifiertagvaluesjs-namespace-export)
  - ["./ClosureTagValues.js" (namespace export)](#closuretagvaluesjs-namespace-export)
  - ["./DocumentationTagValues.js" (namespace export)](#documentationtagvaluesjs-namespace-export)
  - ["./EventDependencyTagValues.js" (namespace export)](#eventdependencytagvaluesjs-namespace-export)
  - ["./InlineTagValues.js" (namespace export)](#inlinetagvaluesjs-namespace-export)
  - ["./OrganizationalTagValues.js" (namespace export)](#organizationaltagvaluesjs-namespace-export)
  - ["./RemainingTagValues.js" (namespace export)](#remainingtagvaluesjs-namespace-export)
  - ["./StructuralTagValues.js" (namespace export)](#structuraltagvaluesjs-namespace-export)
  - ["./TSDocTagValues.js" (namespace export)](#tsdoctagvaluesjs-namespace-export)
  - ["./TypeDocTagValues.js" (namespace export)](#typedoctagvaluesjs-namespace-export)
  - ["./TypeScriptTagValues.js" (namespace export)](#typescripttagvaluesjs-namespace-export)
  - [TagName](#tagname)
  - [TagName (type alias)](#tagname-type-alias)
  - [TagValue](#tagvalue)
  - [TagValue (type alias)](#tagvalue-type-alias)
---

# models

## "./AccessModifierTagValues.js" (namespace export)

Re-exports all named exports from the "./AccessModifierTagValues.js" module.

**Signature**

```ts
export * from "./AccessModifierTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L16)

Since v0.0.0

## "./ClosureTagValues.js" (namespace export)

Re-exports all named exports from the "./ClosureTagValues.js" module.

**Signature**

```ts
export * from "./ClosureTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L21)

Since v0.0.0

## "./DocumentationTagValues.js" (namespace export)

Re-exports all named exports from the "./DocumentationTagValues.js" module.

**Signature**

```ts
export * from "./DocumentationTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L26)

Since v0.0.0

## "./EventDependencyTagValues.js" (namespace export)

Re-exports all named exports from the "./EventDependencyTagValues.js" module.

**Signature**

```ts
export * from "./EventDependencyTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L31)

Since v0.0.0

## "./InlineTagValues.js" (namespace export)

Re-exports all named exports from the "./InlineTagValues.js" module.

**Signature**

```ts
export * from "./InlineTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L36)

Since v0.0.0

## "./OrganizationalTagValues.js" (namespace export)

Re-exports all named exports from the "./OrganizationalTagValues.js" module.

**Signature**

```ts
export * from "./OrganizationalTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L41)

Since v0.0.0

## "./RemainingTagValues.js" (namespace export)

Re-exports all named exports from the "./RemainingTagValues.js" module.

**Signature**

```ts
export * from "./RemainingTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L46)

Since v0.0.0

## "./StructuralTagValues.js" (namespace export)

Re-exports all named exports from the "./StructuralTagValues.js" module.

**Signature**

```ts
export * from "./StructuralTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L52)

Since v0.0.0

## "./TSDocTagValues.js" (namespace export)

Re-exports all named exports from the "./TSDocTagValues.js" module.

**Signature**

```ts
export * from "./TSDocTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L57)

Since v0.0.0

## "./TypeDocTagValues.js" (namespace export)

Re-exports all named exports from the "./TypeDocTagValues.js" module.

**Signature**

```ts
export * from "./TypeDocTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L62)

Since v0.0.0

## "./TypeScriptTagValues.js" (namespace export)

Re-exports all named exports from the "./TypeScriptTagValues.js" module.

**Signature**

```ts
export * from "./TypeScriptTagValues.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L67)

Since v0.0.0

## TagName

LiteralKit over all 113 canonical JSDoc tag names.

Provides `.Enum`, `.is`, `.$match`, `S.decodeUnknownResult(TagName)`, and
`TagName.Type` (`"param" | "returns" | ... | "overload"`).

**Example**

```ts
import { TagName } from "@beep/repo-utils/JSDoc/models/tag-values"

console.log(TagName)
```

**Signature**

```ts
declare const TagName: LiteralKit<readonly ["param", "returns", "throws", "template", "typeParam", "type", "typedef", "callback", "augments", "implements", "class", "enum", "async", "generator", "yields", "access", "public", "private", "protected", "package", "readonly", "abstract", "final", "override", "static", "constant", "default", "defaultValue", "exports", "export", "satisfies", "import", "this", "description", "summary", "remarks", "example", "deprecated", "see", "since", "version", "author", "todo", "alpha", "beta", "experimental", "internal", "sealed", "virtual", "privateRemarks", "packageDocumentation", "label", "decorator", "eventProperty", "link", "inheritDoc", "module", "namespace", "memberof", "member", "property", "interface", "function", "fires", "listens", "event", "requires", "alias", "borrows", "classdesc", "constructs", "copyright", "license", "external", "file", "global", "hideconstructor", "ignore", "inner", "instance", "kind", "lends", "mixin", "mixes", "name", "variation", "tutorial", "define", "dict", "implicitCast", "struct", "unrestricted", "suppress", "externs", "noalias", "nocompile", "nosideeffects", "polymer", "polymerBehavior", "record", "nocollapse", "noinline", "category", "document", "group", "hidden", "expand", "inline", "mergeModuleWith", "primaryExport", "sortStrategy", "useDeclaredType", "overload"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L532)

Since v0.0.0

## TagName (type alias)

Static literal union represented by the `TagName` LiteralKit.

**Example**

```ts
import type { TagName } from "@beep/repo-utils/JSDoc/models/tag-values"
type Example = TagName
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type TagName = typeof TagName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L547)

Since v0.0.0

## TagValue

Tagged union over all 113 JSDoc tag occurrence shapes, discriminated by `_tag`.

Provides `.cases`, `.match`, `.guards`, and `.isAnyOf` out of the box.

**Example**

```ts
import { TagValue } from "@beep/repo-utils/JSDoc/models/tag-values"

console.log(TagValue)
```

**Signature**

```ts
declare const TagValue: S.toTaggedUnion<"_tag", readonly [S.Union<readonly [S.toEncoded<typeof ParamValue>, S.toEncoded<typeof ReturnsValue>, S.toEncoded<typeof ThrowsValue>, S.toEncoded<typeof TemplateValue>, S.toEncoded<typeof TypeParamValue>, S.toEncoded<typeof TypeValue>, S.toEncoded<typeof TypedefValue>, S.toEncoded<typeof CallbackValue>, S.toEncoded<typeof AugmentsValue>, S.toEncoded<typeof ImplementsValue>, S.toEncoded<typeof ClassValue>, S.toEncoded<typeof EnumValue>, S.toEncoded<typeof AsyncValue>, S.toEncoded<typeof GeneratorValue>, S.toEncoded<typeof YieldsValue>]>, S.Union<readonly [S.toEncoded<typeof AccessValue>, S.toEncoded<typeof PublicValue>, S.toEncoded<typeof PrivateValue>, S.toEncoded<typeof ProtectedValue>, S.toEncoded<typeof PackageValue>, S.toEncoded<typeof ReadonlyValue>, S.toEncoded<typeof AbstractValue>, S.toEncoded<typeof FinalValue>, S.toEncoded<typeof OverrideValue>, S.toEncoded<typeof StaticValue>, S.toEncoded<typeof ConstantValue>, S.toEncoded<typeof DefaultValue>, S.toEncoded<typeof DefaultValueValue>, S.toEncoded<typeof ExportsValue>, S.toEncoded<typeof ExportValue>, S.toEncoded<typeof SatisfiesValue>, S.toEncoded<typeof ImportValue>, S.toEncoded<typeof ThisValue>]>, S.Union<readonly [S.toEncoded<typeof DescriptionValue>, S.toEncoded<typeof SummaryValue>, S.toEncoded<typeof RemarksValue>, S.toEncoded<typeof ExampleValue>, S.toEncoded<typeof DeprecatedValue>, S.toEncoded<typeof SeeValue>, S.toEncoded<typeof SinceValue>, S.toEncoded<typeof VersionValue>, S.toEncoded<typeof AuthorValue>, S.toEncoded<typeof TodoValue>]>, S.Union<readonly [S.toEncoded<typeof AlphaValue>, S.toEncoded<typeof BetaValue>, S.toEncoded<typeof ExperimentalValue>, S.toEncoded<typeof InternalValue>, S.toEncoded<typeof SealedValue>, S.toEncoded<typeof VirtualValue>, S.toEncoded<typeof PrivateRemarksValue>, S.toEncoded<typeof PackageDocumentationValue>, S.toEncoded<typeof LabelValue>, S.toEncoded<typeof DecoratorValue>, S.toEncoded<typeof EventPropertyValue>]>, S.Union<readonly [S.toEncoded<typeof LinkValue>, S.toEncoded<typeof InheritDocValue>]>, S.Union<readonly [S.toEncoded<typeof ModuleValue>, S.toEncoded<typeof NamespaceValue>, S.toEncoded<typeof MemberofValue>, S.toEncoded<typeof MemberValue>, S.toEncoded<typeof PropertyValue>, S.toEncoded<typeof InterfaceValue>, S.toEncoded<typeof FunctionValue>]>, S.Union<readonly [S.toEncoded<typeof FiresValue>, S.toEncoded<typeof ListensValue>, S.toEncoded<typeof EventValue>, S.toEncoded<typeof RequiresValue>]>, S.Union<readonly [S.toEncoded<typeof AliasValue>, S.toEncoded<typeof BorrowsValue>, S.toEncoded<typeof ClassdescValue>, S.toEncoded<typeof ConstructsValue>, S.toEncoded<typeof CopyrightValue>, S.toEncoded<typeof LicenseValue>, S.toEncoded<typeof ExternalValue>, S.toEncoded<typeof FileValue>, S.toEncoded<typeof GlobalValue>, S.toEncoded<typeof HideconstructorValue>, S.toEncoded<typeof IgnoreValue>, S.toEncoded<typeof InnerValue>, S.toEncoded<typeof InstanceValue>, S.toEncoded<typeof KindValue>, S.toEncoded<typeof LendsValue>, S.toEncoded<typeof MixinValue>, S.toEncoded<typeof MixesValue>, S.toEncoded<typeof NameValue>, S.toEncoded<typeof VariationValue>, S.toEncoded<typeof TutorialValue>]>, S.Union<readonly [S.toEncoded<typeof DefineValue>, S.toEncoded<typeof DictValue>, S.toEncoded<typeof ImplicitCastValue>, S.toEncoded<typeof StructValue>, S.toEncoded<typeof UnrestrictedValue>, S.toEncoded<typeof SuppressValue>, S.toEncoded<typeof ExternsValue>, S.toEncoded<typeof NoaliasValue>, S.toEncoded<typeof NocompileValue>, S.toEncoded<typeof NosideeffectsValue>, S.toEncoded<typeof PolymerValue>, S.toEncoded<typeof PolymerBehaviorValue>, S.toEncoded<typeof RecordValue>, S.toEncoded<typeof NocollapseValue>, S.toEncoded<typeof NoinlineValue>]>, S.Union<readonly [S.toEncoded<typeof CategoryValue>, S.toEncoded<typeof DocumentValue>, S.toEncoded<typeof GroupValue>, S.toEncoded<typeof HiddenValue>, S.toEncoded<typeof ExpandValue>, S.toEncoded<typeof InlineValue>, S.toEncoded<typeof MergeModuleWithValue>, S.toEncoded<typeof PrimaryExportValue>, S.toEncoded<typeof SortStrategyValue>, S.toEncoded<typeof UseDeclaredTypeValue>]>, S.Union<readonly [S.toEncoded<typeof OverloadValue>]>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L356)

Since v0.0.0

## TagValue (type alias)

Static type represented by the `TagValue` tagged union schema.

**Example**

```ts
import type { TagValue } from "@beep/repo-utils/JSDoc/models/tag-values"
type Example = TagValue
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type TagValue = typeof TagValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/tag-values/index.ts#L383)

Since v0.0.0
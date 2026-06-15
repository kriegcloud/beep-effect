---
title: JSDoc.ts
nav_order: 11
parent: "@beep/repo-utils"
---

## JSDoc.ts overview

Canonical JSDoc tag metadata catalog.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AccessModifierJSDoc](#accessmodifierjsdoc)
  - [AccessModifierJSDoc (namespace)](#accessmodifierjsdoc-namespace)
    - [Type (type alias)](#type-type-alias)
    - [Encoded (type alias)](#encoded-type-alias)
  - [ClosureSpecificJSDoc](#closurespecificjsdoc)
  - [ClosureSpecificJSDoc (namespace)](#closurespecificjsdoc-namespace)
    - [Type (type alias)](#type-type-alias-1)
    - [Encoded (type alias)](#encoded-type-alias-1)
  - [DocumentationContentJSDoc](#documentationcontentjsdoc)
  - [DocumentationContentJSDoc (namespace)](#documentationcontentjsdoc-namespace)
    - [Type (type alias)](#type-type-alias-2)
    - [Encoded (type alias)](#encoded-type-alias-2)
  - [EventDependencyJSDoc](#eventdependencyjsdoc)
  - [EventDependencyJSDoc (namespace)](#eventdependencyjsdoc-namespace)
    - [Type (type alias)](#type-type-alias-3)
    - [Encoded (type alias)](#encoded-type-alias-3)
  - [InlineJSDoc](#inlinejsdoc)
  - [InlineJSDoc (namespace)](#inlinejsdoc-namespace)
    - [Type (type alias)](#type-type-alias-4)
    - [Encoded (type alias)](#encoded-type-alias-4)
  - [JSDocAbstract (class)](#jsdocabstract-class)
  - [JSDocAccess (class)](#jsdocaccess-class)
  - [JSDocAlias (class)](#jsdocalias-class)
  - [JSDocAlpha (class)](#jsdocalpha-class)
  - [JSDocAsync (class)](#jsdocasync-class)
  - [JSDocAugments (class)](#jsdocaugments-class)
  - [JSDocAuthor (class)](#jsdocauthor-class)
  - [JSDocBeta (class)](#jsdocbeta-class)
  - [JSDocBorrows (class)](#jsdocborrows-class)
  - [JSDocCallback (class)](#jsdoccallback-class)
  - [JSDocCategory (class)](#jsdoccategory-class)
  - [JSDocClass (class)](#jsdocclass-class)
  - [JSDocClassDesc (class)](#jsdocclassdesc-class)
  - [JSDocConstant (class)](#jsdocconstant-class)
  - [JSDocConstructs (class)](#jsdocconstructs-class)
  - [JSDocCopyright (class)](#jsdoccopyright-class)
  - [JSDocDecorator (class)](#jsdocdecorator-class)
  - [JSDocDefault (class)](#jsdocdefault-class)
  - [JSDocDefaultValue (class)](#jsdocdefaultvalue-class)
  - [JSDocDefine (class)](#jsdocdefine-class)
  - [JSDocDeprecated (class)](#jsdocdeprecated-class)
  - [JSDocDescription (class)](#jsdocdescription-class)
  - [JSDocDict (class)](#jsdocdict-class)
  - [JSDocDocument (class)](#jsdocdocument-class)
  - [JSDocEnum (class)](#jsdocenum-class)
  - [JSDocEvent (class)](#jsdocevent-class)
  - [JSDocEventProperty (class)](#jsdoceventproperty-class)
  - [JSDocExample (class)](#jsdocexample-class)
  - [JSDocExpand (class)](#jsdocexpand-class)
  - [JSDocExperimental (class)](#jsdocexperimental-class)
  - [JSDocExport (class)](#jsdocexport-class)
  - [JSDocExports (class)](#jsdocexports-class)
  - [JSDocExternal (class)](#jsdocexternal-class)
  - [JSDocExterns (class)](#jsdocexterns-class)
  - [JSDocFile (class)](#jsdocfile-class)
  - [JSDocFinal (class)](#jsdocfinal-class)
  - [JSDocFires (class)](#jsdocfires-class)
  - [JSDocFunction (class)](#jsdocfunction-class)
  - [JSDocGenerator (class)](#jsdocgenerator-class)
  - [JSDocGlobal (class)](#jsdocglobal-class)
  - [JSDocGroup (class)](#jsdocgroup-class)
  - [JSDocHidden (class)](#jsdochidden-class)
  - [JSDocHideConstructor (class)](#jsdochideconstructor-class)
  - [JSDocIgnore (class)](#jsdocignore-class)
  - [JSDocImplements (class)](#jsdocimplements-class)
  - [JSDocImplicitCast (class)](#jsdocimplicitcast-class)
  - [JSDocImport (class)](#jsdocimport-class)
  - [JSDocInheritDoc (class)](#jsdocinheritdoc-class)
  - [JSDocInline (class)](#jsdocinline-class)
  - [JSDocInner (class)](#jsdocinner-class)
  - [JSDocInstance (class)](#jsdocinstance-class)
  - [JSDocInterface (class)](#jsdocinterface-class)
  - [JSDocInternal (class)](#jsdocinternal-class)
  - [JSDocKind (class)](#jsdockind-class)
  - [JSDocLabel (class)](#jsdoclabel-class)
  - [JSDocLends (class)](#jsdoclends-class)
  - [JSDocLicense (class)](#jsdoclicense-class)
  - [JSDocLink (class)](#jsdoclink-class)
  - [JSDocListens (class)](#jsdoclistens-class)
  - [JSDocMember (class)](#jsdocmember-class)
  - [JSDocMemberOf (class)](#jsdocmemberof-class)
  - [JSDocMergeModuleWith (class)](#jsdocmergemodulewith-class)
  - [JSDocMixes (class)](#jsdocmixes-class)
  - [JSDocMixin (class)](#jsdocmixin-class)
  - [JSDocModule (class)](#jsdocmodule-class)
  - [JSDocName (class)](#jsdocname-class)
  - [JSDocNamespace (class)](#jsdocnamespace-class)
  - [JSDocNoAlias (class)](#jsdocnoalias-class)
  - [JSDocNoCollapse (class)](#jsdocnocollapse-class)
  - [JSDocNoCompile (class)](#jsdocnocompile-class)
  - [JSDocNoInline (class)](#jsdocnoinline-class)
  - [JSDocNoSideEffects (class)](#jsdocnosideeffects-class)
  - [JSDocOverload (class)](#jsdocoverload-class)
  - [JSDocOverride (class)](#jsdocoverride-class)
  - [JSDocPackage (class)](#jsdocpackage-class)
  - [JSDocPackageDocumentation (class)](#jsdocpackagedocumentation-class)
  - [JSDocParam (class)](#jsdocparam-class)
  - [JSDocPolymer (class)](#jsdocpolymer-class)
  - [JSDocPolymerBehavior (class)](#jsdocpolymerbehavior-class)
  - [JSDocPrimaryExport (class)](#jsdocprimaryexport-class)
  - [JSDocPrivate (class)](#jsdocprivate-class)
  - [JSDocPrivateRemarks (class)](#jsdocprivateremarks-class)
  - [JSDocProperty (class)](#jsdocproperty-class)
  - [JSDocProtected (class)](#jsdocprotected-class)
  - [JSDocPublic (class)](#jsdocpublic-class)
  - [JSDocReadonly (class)](#jsdocreadonly-class)
  - [JSDocRecord (class)](#jsdocrecord-class)
  - [JSDocRemarks (class)](#jsdocremarks-class)
  - [JSDocRequires (class)](#jsdocrequires-class)
  - [JSDocReturns (class)](#jsdocreturns-class)
  - [JSDocSatisfies (class)](#jsdocsatisfies-class)
  - [JSDocSealed (class)](#jsdocsealed-class)
  - [JSDocSee (class)](#jsdocsee-class)
  - [JSDocSince (class)](#jsdocsince-class)
  - [JSDocSortStrategy (class)](#jsdocsortstrategy-class)
  - [JSDocStatic (class)](#jsdocstatic-class)
  - [JSDocStruct (class)](#jsdocstruct-class)
  - [JSDocSummary (class)](#jsdocsummary-class)
  - [JSDocSuppress (class)](#jsdocsuppress-class)
  - [JSDocTag](#jsdoctag)
  - [JSDocTag (namespace)](#jsdoctag-namespace)
    - [Type (type alias)](#type-type-alias-5)
    - [Encoded (type alias)](#encoded-type-alias-5)
  - [JSDocTemplate (class)](#jsdoctemplate-class)
  - [JSDocThis (class)](#jsdocthis-class)
  - [JSDocThrows (class)](#jsdocthrows-class)
  - [JSDocTodo (class)](#jsdoctodo-class)
  - [JSDocTutorial (class)](#jsdoctutorial-class)
  - [JSDocType (class)](#jsdoctype-class)
  - [JSDocTypeDef (class)](#jsdoctypedef-class)
  - [JSDocTypeParam (class)](#jsdoctypeparam-class)
  - [JSDocUnrestricted (class)](#jsdocunrestricted-class)
  - [JSDocUseDeclaredType (class)](#jsdocusedeclaredtype-class)
  - [JSDocVariation (class)](#jsdocvariation-class)
  - [JSDocVersion (class)](#jsdocversion-class)
  - [JSDocVirtual (class)](#jsdocvirtual-class)
  - [JSDocYields (class)](#jsdocyields-class)
  - [OrganizationalJSDoc](#organizationaljsdoc)
  - [OrganizationalJSDoc (namespace)](#organizationaljsdoc-namespace)
    - [Type (type alias)](#type-type-alias-6)
    - [Encoded (type alias)](#encoded-type-alias-6)
  - [RemainingJSDoc](#remainingjsdoc)
  - [RemainingJSDoc (namespace)](#remainingjsdoc-namespace)
    - [Type (type alias)](#type-type-alias-7)
    - [Encoded (type alias)](#encoded-type-alias-7)
  - [StructuralJSDoc](#structuraljsdoc)
  - [StructuralJSDoc (namespace)](#structuraljsdoc-namespace)
    - [Type (type alias)](#type-type-alias-8)
    - [Encoded (type alias)](#encoded-type-alias-8)
  - [TSDocSpecificJSDoc](#tsdocspecificjsdoc)
  - [TSDocSpecificJSDoc (namespace)](#tsdocspecificjsdoc-namespace)
    - [Type (type alias)](#type-type-alias-9)
    - [Encoded (type alias)](#encoded-type-alias-9)
  - [TypeDocSpecificJSDoc](#typedocspecificjsdoc)
  - [TypeDocSpecificJSDoc (namespace)](#typedocspecificjsdoc-namespace)
    - [Type (type alias)](#type-type-alias-10)
    - [Encoded (type alias)](#encoded-type-alias-10)
  - [TypeScriptSpecificJSDoc](#typescriptspecificjsdoc)
  - [TypeScriptSpecificJSDoc (namespace)](#typescriptspecificjsdoc-namespace)
    - [Type (type alias)](#type-type-alias-11)
    - [Encoded (type alias)](#encoded-type-alias-11)
  - [matchStructuralJSDoc](#matchstructuraljsdoc)
---

# models

## AccessModifierJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { AccessModifierJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(AccessModifierJSDoc)
```

**Signature**

```ts
declare const AccessModifierJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis], [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1136)

Since v0.0.0

## AccessModifierJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { AccessModifierJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(AccessModifierJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1169)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof AccessModifierJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1176)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof AccessModifierJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1183)

Since v0.0.0

## ClosureSpecificJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { ClosureSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(ClosureSpecificJSDoc)
```

**Signature**

```ts
declare const ClosureSpecificJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline], [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3838)

Since v0.0.0

## ClosureSpecificJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { ClosureSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(ClosureSpecificJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3868)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof ClosureSpecificJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3875)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof ClosureSpecificJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3882)

Since v0.0.0

## DocumentationContentJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { DocumentationContentJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(DocumentationContentJSDoc)
```

**Signature**

```ts
declare const DocumentationContentJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo], [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1533)

Since v0.0.0

## DocumentationContentJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { DocumentationContentJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(DocumentationContentJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1558)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof DocumentationContentJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1565)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof DocumentationContentJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1572)

Since v0.0.0

## EventDependencyJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { EventDependencyJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(EventDependencyJSDoc)
```

**Signature**

```ts
declare const EventDependencyJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires], [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2553)

Since v0.0.0

## EventDependencyJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { EventDependencyJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(EventDependencyJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2570)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof EventDependencyJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2577)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof EventDependencyJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2584)

Since v0.0.0

## InlineJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { InlineJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(InlineJSDoc)
```

**Signature**

```ts
declare const InlineJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocLink, typeof JSDocInheritDoc]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocLink, typeof JSDocInheritDoc], [typeof JSDocLink, typeof JSDocInheritDoc]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2082)

Since v0.0.0

## InlineJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { InlineJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(InlineJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2099)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof InlineJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2106)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof InlineJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2113)

Since v0.0.0

## JSDocAbstract (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocAbstract } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocAbstract)
```

**Signature**

```ts
declare class JSDocAbstract
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L790)

Since v0.0.0

## JSDocAccess (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocAccess } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocAccess)
```

**Signature**

```ts
declare class JSDocAccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L614)

Since v0.0.0

## JSDocAlias (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocAlias } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocAlias)
```

**Signature**

```ts
declare class JSDocAlias
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2601)

Since v0.0.0

## JSDocAlpha (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocAlpha } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocAlpha)
```

**Signature**

```ts
declare class JSDocAlpha
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1589)

Since v0.0.0

## JSDocAsync (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocAsync } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocAsync)
```

**Signature**

```ts
declare class JSDocAsync
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L420)

Since v0.0.0

## JSDocAugments (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocAugments } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocAugments)
```

**Signature**

```ts
declare class JSDocAugments
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L300)

Since v0.0.0

## JSDocAuthor (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocAuthor } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocAuthor)
```

**Signature**

```ts
declare class JSDocAuthor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1467)

Since v0.0.0

## JSDocBeta (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocBeta } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocBeta)
```

**Signature**

```ts
declare class JSDocBeta
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1622)

Since v0.0.0

## JSDocBorrows (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocBorrows } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocBorrows)
```

**Signature**

```ts
declare class JSDocBorrows
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2634)

Since v0.0.0

## JSDocCallback (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocCallback } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocCallback)
```

**Signature**

```ts
declare class JSDocCallback
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L271)

Since v0.0.0

## JSDocCategory (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocCategory } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocCategory)
```

**Signature**

```ts
declare class JSDocCategory
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3899)

Since v0.0.0

## JSDocClass (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocClass } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocClass)
```

**Signature**

```ts
declare class JSDocClass
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L362)

Since v0.0.0

## JSDocClassDesc (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocClassDesc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocClassDesc)
```

**Signature**

```ts
declare class JSDocClassDesc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2667)

Since v0.0.0

## JSDocConstant (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocConstant } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocConstant)
```

**Signature**

```ts
declare class JSDocConstant
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L903)

Since v0.0.0

## JSDocConstructs (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocConstructs } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocConstructs)
```

**Signature**

```ts
declare class JSDocConstructs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2700)

Since v0.0.0

## JSDocCopyright (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocCopyright } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocCopyright)
```

**Signature**

```ts
declare class JSDocCopyright
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2733)

Since v0.0.0

## JSDocDecorator (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDecorator } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDecorator)
```

**Signature**

```ts
declare class JSDocDecorator
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1890)

Since v0.0.0

## JSDocDefault (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDefault } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDefault)
```

**Signature**

```ts
declare class JSDocDefault
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L932)

Since v0.0.0

## JSDocDefaultValue (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDefaultValue } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDefaultValue)
```

**Signature**

```ts
declare class JSDocDefaultValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L960)

Since v0.0.0

## JSDocDefine (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDefine } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDefine)
```

**Signature**

```ts
declare class JSDocDefine
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3343)

Since v0.0.0

## JSDocDeprecated (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDeprecated } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDeprecated)
```

**Signature**

```ts
declare class JSDocDeprecated
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1333)

Since v0.0.0

## JSDocDescription (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDescription } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDescription)
```

**Signature**

```ts
declare class JSDocDescription
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1199)

Since v0.0.0

## JSDocDict (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDict } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDict)
```

**Signature**

```ts
declare class JSDocDict
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3376)

Since v0.0.0

## JSDocDocument (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocDocument } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocDocument)
```

**Signature**

```ts
declare class JSDocDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3932)

Since v0.0.0

## JSDocEnum (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocEnum } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocEnum)
```

**Signature**

```ts
declare class JSDocEnum
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L392)

Since v0.0.0

## JSDocEvent (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocEvent } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocEvent)
```

**Signature**

```ts
declare class JSDocEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2485)

Since v0.0.0

## JSDocEventProperty (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocEventProperty } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocEventProperty)
```

**Signature**

```ts
declare class JSDocEventProperty
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1924)

Since v0.0.0

## JSDocExample (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocExample } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocExample)
```

**Signature**

```ts
declare class JSDocExample
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1299)

Since v0.0.0

## JSDocExpand (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocExpand } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocExpand)
```

**Signature**

```ts
declare class JSDocExpand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4031)

Since v0.0.0

## JSDocExperimental (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocExperimental } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocExperimental)
```

**Signature**

```ts
declare class JSDocExperimental
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1655)

Since v0.0.0

## JSDocExport (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocExport } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocExport)
```

**Signature**

```ts
declare class JSDocExport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1018)

Since v0.0.0

## JSDocExports (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocExports } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocExports)
```

**Signature**

```ts
declare class JSDocExports
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L989)

Since v0.0.0

## JSDocExternal (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocExternal } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocExternal)
```

**Signature**

```ts
declare class JSDocExternal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2799)

Since v0.0.0

## JSDocExterns (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocExterns } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocExterns)
```

**Signature**

```ts
declare class JSDocExterns
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3541)

Since v0.0.0

## JSDocFile (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocFile } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocFile)
```

**Signature**

```ts
declare class JSDocFile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2832)

Since v0.0.0

## JSDocFinal (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocFinal } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocFinal)
```

**Signature**

```ts
declare class JSDocFinal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L818)

Since v0.0.0

## JSDocFires (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocFires } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocFires)
```

**Signature**

```ts
declare class JSDocFires
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2419)

Since v0.0.0

## JSDocFunction (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocFunction } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocFunction)
```

**Signature**

```ts
declare class JSDocFunction
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2332)

Since v0.0.0

## JSDocGenerator (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocGenerator } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocGenerator)
```

**Signature**

```ts
declare class JSDocGenerator
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L448)

Since v0.0.0

## JSDocGlobal (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocGlobal } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocGlobal)
```

**Signature**

```ts
declare class JSDocGlobal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2865)

Since v0.0.0

## JSDocGroup (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocGroup } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocGroup)
```

**Signature**

```ts
declare class JSDocGroup
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3965)

Since v0.0.0

## JSDocHidden (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocHidden } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocHidden)
```

**Signature**

```ts
declare class JSDocHidden
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3998)

Since v0.0.0

## JSDocHideConstructor (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocHideConstructor } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocHideConstructor)
```

**Signature**

```ts
declare class JSDocHideConstructor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2898)

Since v0.0.0

## JSDocIgnore (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocIgnore } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocIgnore)
```

**Signature**

```ts
declare class JSDocIgnore
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2931)

Since v0.0.0

## JSDocImplements (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocImplements } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocImplements)
```

**Signature**

```ts
declare class JSDocImplements
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L329)

Since v0.0.0

## JSDocImplicitCast (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocImplicitCast } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocImplicitCast)
```

**Signature**

```ts
declare class JSDocImplicitCast
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3409)

Since v0.0.0

## JSDocImport (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocImport } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocImport)
```

**Signature**

```ts
declare class JSDocImport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1074)

Since v0.0.0

## JSDocInheritDoc (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocInheritDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocInheritDoc)
```

**Signature**

```ts
declare class JSDocInheritDoc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2048)

Since v0.0.0

## JSDocInline (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocInline } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocInline)
```

**Signature**

```ts
declare class JSDocInline
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4064)

Since v0.0.0

## JSDocInner (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocInner } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocInner)
```

**Signature**

```ts
declare class JSDocInner
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2964)

Since v0.0.0

## JSDocInstance (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocInstance } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocInstance)
```

**Signature**

```ts
declare class JSDocInstance
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2998)

Since v0.0.0

## JSDocInterface (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocInterface } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocInterface)
```

**Signature**

```ts
declare class JSDocInterface
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2299)

Since v0.0.0

## JSDocInternal (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocInternal } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocInternal)
```

**Signature**

```ts
declare class JSDocInternal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1688)

Since v0.0.0

## JSDocKind (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocKind } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocKind)
```

**Signature**

```ts
declare class JSDocKind
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3031)

Since v0.0.0

## JSDocLabel (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocLabel } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocLabel)
```

**Signature**

```ts
declare class JSDocLabel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1857)

Since v0.0.0

## JSDocLends (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocLends } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocLends)
```

**Signature**

```ts
declare class JSDocLends
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3078)

Since v0.0.0

## JSDocLicense (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocLicense } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocLicense)
```

**Signature**

```ts
declare class JSDocLicense
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2766)

Since v0.0.0

## JSDocLink (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocLink } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocLink)
```

**Signature**

```ts
declare class JSDocLink
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2014)

Since v0.0.0

## JSDocListens (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocListens } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocListens)
```

**Signature**

```ts
declare class JSDocListens
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2452)

Since v0.0.0

## JSDocMember (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocMember } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocMember)
```

**Signature**

```ts
declare class JSDocMember
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2232)

Since v0.0.0

## JSDocMemberOf (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocMemberOf } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocMemberOf)
```

**Signature**

```ts
declare class JSDocMemberOf
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2198)

Since v0.0.0

## JSDocMergeModuleWith (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocMergeModuleWith } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocMergeModuleWith)
```

**Signature**

```ts
declare class JSDocMergeModuleWith
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4097)

Since v0.0.0

## JSDocMixes (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocMixes } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocMixes)
```

**Signature**

```ts
declare class JSDocMixes
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3145)

Since v0.0.0

## JSDocMixin (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocMixin } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocMixin)
```

**Signature**

```ts
declare class JSDocMixin
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3111)

Since v0.0.0

## JSDocModule (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocModule } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocModule)
```

**Signature**

```ts
declare class JSDocModule
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2130)

Since v0.0.0

## JSDocName (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocName } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocName)
```

**Signature**

```ts
declare class JSDocName
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3178)

Since v0.0.0

## JSDocNamespace (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocNamespace } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocNamespace)
```

**Signature**

```ts
declare class JSDocNamespace
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2164)

Since v0.0.0

## JSDocNoAlias (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocNoAlias } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocNoAlias)
```

**Signature**

```ts
declare class JSDocNoAlias
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3574)

Since v0.0.0

## JSDocNoCollapse (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocNoCollapse } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocNoCollapse)
```

**Signature**

```ts
declare class JSDocNoCollapse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3772)

Since v0.0.0

## JSDocNoCompile (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocNoCompile } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocNoCompile)
```

**Signature**

```ts
declare class JSDocNoCompile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3607)

Since v0.0.0

## JSDocNoInline (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocNoInline } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocNoInline)
```

**Signature**

```ts
declare class JSDocNoInline
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3805)

Since v0.0.0

## JSDocNoSideEffects (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocNoSideEffects } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocNoSideEffects)
```

**Signature**

```ts
declare class JSDocNoSideEffects
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3640)

Since v0.0.0

## JSDocOverload (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocOverload } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocOverload)
```

**Signature**

```ts
declare class JSDocOverload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4285)

Since v0.0.0

## JSDocOverride (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocOverride } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocOverride)
```

**Signature**

```ts
declare class JSDocOverride
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L846)

Since v0.0.0

## JSDocPackage (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPackage } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPackage)
```

**Signature**

```ts
declare class JSDocPackage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L733)

Since v0.0.0

## JSDocPackageDocumentation (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPackageDocumentation } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPackageDocumentation)
```

**Signature**

```ts
declare class JSDocPackageDocumentation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1822)

Since v0.0.0

## JSDocParam (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocParam } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocParam)
```

**Signature**

```ts
declare class JSDocParam
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L32)

Since v0.0.0

## JSDocPolymer (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPolymer } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPolymer)
```

**Signature**

```ts
declare class JSDocPolymer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3673)

Since v0.0.0

## JSDocPolymerBehavior (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPolymerBehavior } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPolymerBehavior)
```

**Signature**

```ts
declare class JSDocPolymerBehavior
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3706)

Since v0.0.0

## JSDocPrimaryExport (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPrimaryExport } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPrimaryExport)
```

**Signature**

```ts
declare class JSDocPrimaryExport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4130)

Since v0.0.0

## JSDocPrivate (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPrivate } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPrivate)
```

**Signature**

```ts
declare class JSDocPrivate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L677)

Since v0.0.0

## JSDocPrivateRemarks (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPrivateRemarks } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPrivateRemarks)
```

**Signature**

```ts
declare class JSDocPrivateRemarks
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1789)

Since v0.0.0

## JSDocProperty (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocProperty } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocProperty)
```

**Signature**

```ts
declare class JSDocProperty
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2265)

Since v0.0.0

## JSDocProtected (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocProtected } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocProtected)
```

**Signature**

```ts
declare class JSDocProtected
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L705)

Since v0.0.0

## JSDocPublic (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocPublic } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocPublic)
```

**Signature**

```ts
declare class JSDocPublic
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L648)

Since v0.0.0

## JSDocReadonly (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocReadonly } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocReadonly)
```

**Signature**

```ts
declare class JSDocReadonly
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L761)

Since v0.0.0

## JSDocRecord (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocRecord } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocRecord)
```

**Signature**

```ts
declare class JSDocRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3739)

Since v0.0.0

## JSDocRemarks (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocRemarks } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocRemarks)
```

**Signature**

```ts
declare class JSDocRemarks
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1266)

Since v0.0.0

## JSDocRequires (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocRequires } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocRequires)
```

**Signature**

```ts
declare class JSDocRequires
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2519)

Since v0.0.0

## JSDocReturns (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocReturns } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocReturns)
```

**Signature**

```ts
declare class JSDocReturns
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L72)

Since v0.0.0

## JSDocSatisfies (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocSatisfies } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocSatisfies)
```

**Signature**

```ts
declare class JSDocSatisfies
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1046)

Since v0.0.0

## JSDocSealed (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocSealed } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocSealed)
```

**Signature**

```ts
declare class JSDocSealed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1722)

Since v0.0.0

## JSDocSee (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocSee } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocSee)
```

**Signature**

```ts
declare class JSDocSee
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1367)

Since v0.0.0

## JSDocSince (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocSince } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocSince)
```

**Signature**

```ts
declare class JSDocSince
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1400)

Since v0.0.0

## JSDocSortStrategy (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocSortStrategy } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocSortStrategy)
```

**Signature**

```ts
declare class JSDocSortStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4163)

Since v0.0.0

## JSDocStatic (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocStatic } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocStatic)
```

**Signature**

```ts
declare class JSDocStatic
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L875)

Since v0.0.0

## JSDocStruct (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocStruct } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocStruct)
```

**Signature**

```ts
declare class JSDocStruct
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3442)

Since v0.0.0

## JSDocSummary (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocSummary } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocSummary)
```

**Signature**

```ts
declare class JSDocSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1233)

Since v0.0.0

## JSDocSuppress (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocSuppress } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocSuppress)
```

**Signature**

```ts
declare class JSDocSuppress
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3508)

Since v0.0.0

## JSDocTag

JSDoc tag metadata export.

**Example**

```ts
import { JSDocTag } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocTag)
```

**Signature**

```ts
declare const JSDocTag: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.Union<readonly [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields], [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis], [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo], [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty], [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocLink, typeof JSDocInheritDoc]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocLink, typeof JSDocInheritDoc], [typeof JSDocLink, typeof JSDocInheritDoc]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction], [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires], [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial], [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline], [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType], [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocOverload]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocOverload], [typeof JSDocOverload]>>]> & TaggedUnionUtils<"_tag", readonly [AnnotatedSchema<S.Union<readonly [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields], [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis], [typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo], [typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty], [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocLink, typeof JSDocInheritDoc]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocLink, typeof JSDocInheritDoc], [typeof JSDocLink, typeof JSDocInheritDoc]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction], [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires], [typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial], [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline], [typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType], [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType]>>, AnnotatedSchema<S.Union<readonly [typeof JSDocOverload]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocOverload], [typeof JSDocOverload]>>], [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields, typeof JSDocAccess, typeof JSDocPublic, typeof JSDocPrivate, typeof JSDocProtected, typeof JSDocPackage, typeof JSDocReadonly, typeof JSDocAbstract, typeof JSDocFinal, typeof JSDocOverride, typeof JSDocStatic, typeof JSDocConstant, typeof JSDocDefault, typeof JSDocDefaultValue, typeof JSDocExports, typeof JSDocExport, typeof JSDocSatisfies, typeof JSDocImport, typeof JSDocThis, typeof JSDocDescription, typeof JSDocSummary, typeof JSDocRemarks, typeof JSDocExample, typeof JSDocDeprecated, typeof JSDocSee, typeof JSDocSince, typeof JSDocVersion, typeof JSDocAuthor, typeof JSDocTodo, typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty, typeof JSDocLink, typeof JSDocInheritDoc, typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction, typeof JSDocFires, typeof JSDocListens, typeof JSDocEvent, typeof JSDocRequires, typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial, typeof JSDocDefine, typeof JSDocDict, typeof JSDocImplicitCast, typeof JSDocStruct, typeof JSDocUnrestricted, typeof JSDocSuppress, typeof JSDocExterns, typeof JSDocNoAlias, typeof JSDocNoCompile, typeof JSDocNoSideEffects, typeof JSDocPolymer, typeof JSDocPolymerBehavior, typeof JSDocRecord, typeof JSDocNoCollapse, typeof JSDocNoInline, typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType, typeof JSDocOverload]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4365)

Since v0.0.0

## JSDocTag (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocTag } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocTag)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4391)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof JSDocTag.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4398)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof JSDocTag.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4405)

Since v0.0.0

## JSDocTemplate (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocTemplate } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocTemplate)
```

**Signature**

```ts
declare class JSDocTemplate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L145)

Since v0.0.0

## JSDocThis (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocThis } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocThis)
```

**Signature**

```ts
declare class JSDocThis
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1107)

Since v0.0.0

## JSDocThrows (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocThrows } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocThrows)
```

**Signature**

```ts
declare class JSDocThrows
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L110)

Since v0.0.0

## JSDocTodo (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocTodo } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocTodo)
```

**Signature**

```ts
declare class JSDocTodo
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1500)

Since v0.0.0

## JSDocTutorial (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocTutorial } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocTutorial)
```

**Signature**

```ts
declare class JSDocTutorial
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3244)

Since v0.0.0

## JSDocType (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocType } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocType)
```

**Signature**

```ts
declare class JSDocType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L213)

Since v0.0.0

## JSDocTypeDef (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocTypeDef } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocTypeDef)
```

**Signature**

```ts
declare class JSDocTypeDef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L242)

Since v0.0.0

## JSDocTypeParam (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocTypeParam } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocTypeParam)
```

**Signature**

```ts
declare class JSDocTypeParam
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L180)

Since v0.0.0

## JSDocUnrestricted (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocUnrestricted } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocUnrestricted)
```

**Signature**

```ts
declare class JSDocUnrestricted
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3475)

Since v0.0.0

## JSDocUseDeclaredType (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocUseDeclaredType } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocUseDeclaredType)
```

**Signature**

```ts
declare class JSDocUseDeclaredType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4196)

Since v0.0.0

## JSDocVariation (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocVariation } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocVariation)
```

**Signature**

```ts
declare class JSDocVariation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3211)

Since v0.0.0

## JSDocVersion (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocVersion } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocVersion)
```

**Signature**

```ts
declare class JSDocVersion
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1434)

Since v0.0.0

## JSDocVirtual (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocVirtual } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocVirtual)
```

**Signature**

```ts
declare class JSDocVirtual
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1756)

Since v0.0.0

## JSDocYields (class)

JSDoc tag metadata export.

**Example**

```ts
import { JSDocYields } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(JSDocYields)
```

**Signature**

```ts
declare class JSDocYields
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L476)

Since v0.0.0

## OrganizationalJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { OrganizationalJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(OrganizationalJSDoc)
```

**Signature**

```ts
declare const OrganizationalJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction], [typeof JSDocModule, typeof JSDocNamespace, typeof JSDocMemberOf, typeof JSDocMember, typeof JSDocProperty, typeof JSDocInterface, typeof JSDocFunction]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2366)

Since v0.0.0

## OrganizationalJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { OrganizationalJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(OrganizationalJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2388)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof OrganizationalJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2395)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof OrganizationalJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L2402)

Since v0.0.0

## RemainingJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { RemainingJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(RemainingJSDoc)
```

**Signature**

```ts
declare const RemainingJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial], [typeof JSDocAlias, typeof JSDocBorrows, typeof JSDocClassDesc, typeof JSDocConstructs, typeof JSDocCopyright, typeof JSDocLicense, typeof JSDocExternal, typeof JSDocFile, typeof JSDocGlobal, typeof JSDocHideConstructor, typeof JSDocIgnore, typeof JSDocInner, typeof JSDocInstance, typeof JSDocKind, typeof JSDocLends, typeof JSDocMixin, typeof JSDocMixes, typeof JSDocName, typeof JSDocVariation, typeof JSDocTutorial]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3277)

Since v0.0.0

## RemainingJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { RemainingJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(RemainingJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3312)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof RemainingJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3319)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof RemainingJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L3326)

Since v0.0.0

## StructuralJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { StructuralJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(StructuralJSDoc)
```

**Signature**

```ts
declare const StructuralJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields], [typeof JSDocParam, typeof JSDocReturns, typeof JSDocThrows, typeof JSDocTemplate, typeof JSDocTypeParam, typeof JSDocType, typeof JSDocTypeDef, typeof JSDocCallback, typeof JSDocAugments, typeof JSDocImplements, typeof JSDocClass, typeof JSDocEnum, typeof JSDocAsync, typeof JSDocGenerator, typeof JSDocYields]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L510)

Since v0.0.0

## StructuralJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { StructuralJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(StructuralJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L548)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof StructuralJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L555)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof StructuralJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L562)

Since v0.0.0

## TSDocSpecificJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { TSDocSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(TSDocSpecificJSDoc)
```

**Signature**

```ts
declare const TSDocSpecificJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty], [typeof JSDocAlpha, typeof JSDocBeta, typeof JSDocExperimental, typeof JSDocInternal, typeof JSDocSealed, typeof JSDocVirtual, typeof JSDocPrivateRemarks, typeof JSDocPackageDocumentation, typeof JSDocLabel, typeof JSDocDecorator, typeof JSDocEventProperty]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1957)

Since v0.0.0

## TSDocSpecificJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { TSDocSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(TSDocSpecificJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1983)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof TSDocSpecificJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1990)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof TSDocSpecificJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L1997)

Since v0.0.0

## TypeDocSpecificJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { TypeDocSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(TypeDocSpecificJSDoc)
```

**Signature**

```ts
declare const TypeDocSpecificJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType], [typeof JSDocCategory, typeof JSDocDocument, typeof JSDocGroup, typeof JSDocHidden, typeof JSDocExpand, typeof JSDocInline, typeof JSDocMergeModuleWith, typeof JSDocPrimaryExport, typeof JSDocSortStrategy, typeof JSDocUseDeclaredType]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4229)

Since v0.0.0

## TypeDocSpecificJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { TypeDocSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(TypeDocSpecificJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4254)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof TypeDocSpecificJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4261)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof TypeDocSpecificJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4268)

Since v0.0.0

## TypeScriptSpecificJSDoc

JSDoc tag metadata export.

**Example**

```ts
import { TypeScriptSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(TypeScriptSpecificJSDoc)
```

**Signature**

```ts
declare const TypeScriptSpecificJSDoc: AnnotatedSchema<S.Union<readonly [typeof JSDocOverload]> & TaggedUnionUtils<"_tag", readonly [typeof JSDocOverload], [typeof JSDocOverload]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4319)

Since v0.0.0

## TypeScriptSpecificJSDoc (namespace)

JSDoc tag metadata export.

**Example**

```ts
import { TypeScriptSpecificJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(TypeScriptSpecificJSDoc)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4336)

Since v0.0.0

### Type (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Type = typeof TypeScriptSpecificJSDoc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4343)

Since v0.0.0

### Encoded (type alias)

JSDoc tag metadata export.

**Signature**

```ts
type Encoded = typeof TypeScriptSpecificJSDoc.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L4350)

Since v0.0.0

## matchStructuralJSDoc

Matches over structural JSDoc tag variants.

**Example**

```ts
import { matchStructuralJSDoc } from "@beep/repo-utils/JSDoc/JSDoc"

console.log(matchStructuralJSDoc)
```

**Signature**

```ts
declare const matchStructuralJSDoc: (value: StructuralJSDoc.Type) => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/JSDoc.ts#L579)

Since v0.0.0
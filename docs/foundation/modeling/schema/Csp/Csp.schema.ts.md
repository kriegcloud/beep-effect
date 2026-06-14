---
title: Csp.schema.ts
nav_order: 32
parent: "@beep/schema"
---

## Csp.schema.ts overview

CSP header schema & constructor's

Since v0.0.0

---
## Exports Grouped by Category
- [formatting](#formatting)
  - [createContentSecurityPolicyOptionHeaderValue](#createcontentsecuritypolicyoptionheadervalue)
- [models](#models)
  - [ContentSecurityPolicyHeader (type alias)](#contentsecuritypolicyheader-type-alias)
  - [ContentSecurityPolicyHeaderName (type alias)](#contentsecuritypolicyheadername-type-alias)
  - [ContentSecurityPolicyOption (type alias)](#contentsecuritypolicyoption-type-alias)
  - [ContentSecurityPolicyOptionStruct (class)](#contentsecuritypolicyoptionstruct-class)
  - [ContentSecurityPolicyResponseHeader (class)](#contentsecuritypolicyresponseheader-class)
  - [DirectiveSource (type alias)](#directivesource-type-alias)
  - [DocumentDirective (class)](#documentdirective-class)
  - [FetchDirective (class)](#fetchdirective-class)
  - [NavigationDirective (class)](#navigationdirective-class)
  - [PluginTypes (type alias)](#plugintypes-type-alias)
  - [ReportingDirective (class)](#reportingdirective-class)
  - [Sandbox (type alias)](#sandbox-type-alias)
- [schemas](#schemas)
  - [ContentSecurityPolicyHeader](#contentsecuritypolicyheader)
  - [ContentSecurityPolicyHeaderName](#contentsecuritypolicyheadername)
  - [ContentSecurityPolicyOption](#contentsecuritypolicyoption)
  - [CspDirectives](#cspdirectives)
  - [DirectiveSource](#directivesource)
  - [Header](#header)
  - [Option](#option)
  - [PluginTypes](#plugintypes)
  - [ReportURI](#reporturi)
  - [ResponseHeader](#responseheader)
  - [Sandbox](#sandbox)
- [utilities](#utilities)
  - [createDirectiveValue](#createdirectivevalue)
  - [getProperHeaderName](#getproperheadername)
---

# formatting

## createContentSecurityPolicyOptionHeaderValue

Format a structured CSP option into a header value.

**Example**

```ts
import { ContentSecurityPolicyOptionStruct, createContentSecurityPolicyOptionHeaderValue } from "@beep/schema/Csp"

const option = ContentSecurityPolicyOptionStruct.make({
  directives: { defaultSrc: "'self'" }
})
console.log(createContentSecurityPolicyOptionHeaderValue(option))
```

**Signature**

```ts
declare const createContentSecurityPolicyOptionHeaderValue: (option?: undefined | ContentSecurityPolicyOption, fetchDirectiveToStringConverter?: (directive?: undefined | DirectiveInput<FetchDirective>) => string, documentDirectiveToStringConverter?: (directive?: undefined | DirectiveInput<DocumentDirective>) => string, navigationDirectiveToStringConverter?: (directive?: undefined | DirectiveInput<NavigationDirective>) => string, reportingDirectiveToStringConverter?: (directive?: undefined | DirectiveInput<ReportingDirective>) => string) => string | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L748)

Since v0.0.0

# models

## ContentSecurityPolicyHeader (type alias)

Runtime type for `ContentSecurityPolicyHeader`.

**Example**

```ts
import type { ContentSecurityPolicyHeader } from "@beep/schema/Csp"

console.log({} as { header: ContentSecurityPolicyHeader })
```

**Signature**

```ts
type ContentSecurityPolicyHeader = typeof ContentSecurityPolicyHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L857)

Since v0.0.0

## ContentSecurityPolicyHeaderName (type alias)

Runtime type for `ContentSecurityPolicyHeaderName`.

**Example**

```ts
import type { ContentSecurityPolicyHeaderName } from "@beep/schema/Csp"

const name: ContentSecurityPolicyHeaderName = "Content-Security-Policy"
console.log(name)
```

**Signature**

```ts
type ContentSecurityPolicyHeaderName = typeof ContentSecurityPolicyHeaderName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L97)

Since v0.0.0

## ContentSecurityPolicyOption (type alias)

Runtime type for `ContentSecurityPolicyOption`.

**Example**

```ts
import type { ContentSecurityPolicyOption } from "@beep/schema/Csp"

const option: ContentSecurityPolicyOption = false
console.log(option)
```

**Signature**

```ts
type ContentSecurityPolicyOption = typeof ContentSecurityPolicyOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L663)

Since v0.0.0

## ContentSecurityPolicyOptionStruct (class)

Structured CSP option object before header serialization.

**Example**

```ts
import { ContentSecurityPolicyOptionStruct } from "@beep/schema/Csp"

console.log(ContentSecurityPolicyOptionStruct.ast)
```

**Signature**

```ts
declare class ContentSecurityPolicyOptionStruct
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L602)

Since v0.0.0

## ContentSecurityPolicyResponseHeader (class)

Serialized Content-Security-Policy response header model.

**Example**

```ts
import { ContentSecurityPolicyResponseHeader } from "@beep/schema/Csp"

console.log(ContentSecurityPolicyResponseHeader.ast)
```

**Signature**

```ts
declare class ContentSecurityPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L678)

Since v0.0.0

## DirectiveSource (type alias)

Runtime type for `DirectiveSource`.

**Example**

```ts
import type { DirectiveSource } from "@beep/schema/Csp"

const source: DirectiveSource = "'self'"
console.log(source)
```

**Signature**

```ts
type DirectiveSource = typeof DirectiveSource.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L55)

Since v0.0.0

## DocumentDirective (class)

Document directive fields accepted by Content-Security-Policy.

**Example**

```ts
import { DocumentDirective } from "@beep/schema/Csp"

const value = DocumentDirective.convertToString({ sandbox: "allow-scripts" })
console.log(value)
```

**Signature**

```ts
declare class DocumentDirective
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L406)

Since v0.0.0

## FetchDirective (class)

Fetch directive fields accepted by Content-Security-Policy.

**Example**

```ts
import { FetchDirective } from "@beep/schema/Csp"

const value = FetchDirective.convertToString({ defaultSrc: "'self'" })
console.log(value)
```

**Signature**

```ts
declare class FetchDirective
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L327)

Since v0.0.0

## NavigationDirective (class)

Navigation directive fields accepted by Content-Security-Policy.

**Example**

```ts
import { NavigationDirective } from "@beep/schema/Csp"

const value = NavigationDirective.convertToString({ formAction: "'self'" })
console.log(value)
```

**Signature**

```ts
declare class NavigationDirective
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L460)

Since v0.0.0

## PluginTypes (type alias)

Runtime type for `PluginTypes`.

**Example**

```ts
import type { PluginTypes } from "@beep/schema/Csp"

const pluginTypes: PluginTypes = ["application/pdf"]
console.log(pluginTypes)
```

**Signature**

```ts
type PluginTypes = typeof PluginTypes.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L221)

Since v0.0.0

## ReportingDirective (class)

Reporting directive fields accepted by Content-Security-Policy.

**Example**

```ts
import { ReportingDirective } from "@beep/schema/Csp"

const value = ReportingDirective.convertToString({ reportTo: "default" })
console.log(value)
```

**Signature**

```ts
declare class ReportingDirective
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L533)

Since v0.0.0

## Sandbox (type alias)

Runtime type for `Sandbox`.

**Example**

```ts
import type { Sandbox } from "@beep/schema/Csp"

const sandbox: Sandbox = "allow-scripts"
console.log(sandbox)
```

**Signature**

```ts
type Sandbox = typeof Sandbox.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L274)

Since v0.0.0

# schemas

## ContentSecurityPolicyHeader

One-way schema that decodes CSP options into a response header.

**Example**

```ts
import { ContentSecurityPolicyHeader } from "@beep/schema/Csp"

console.log(ContentSecurityPolicyHeader.ast)
```

**Signature**

```ts
declare const ContentSecurityPolicyHeader: S.decodeTo<typeof ContentSecurityPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof ContentSecurityPolicyOptionStruct]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ContentSecurityPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof ContentSecurityPolicyOptionStruct]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ContentSecurityPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ContentSecurityPolicyOption, headerValueCreator?: undefined | ((option?: undefined | ContentSecurityPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L783)

Since v0.0.0

## ContentSecurityPolicyHeaderName

Header names used for enforcing or reporting CSP directives.

**Example**

```ts
import { ContentSecurityPolicyHeaderName } from "@beep/schema/Csp"

console.log(ContentSecurityPolicyHeaderName.ast)
```

**Signature**

```ts
declare const ContentSecurityPolicyHeaderName: LiteralKit<readonly ["Content-Security-Policy", "Content-Security-Policy-Report-Only"], undefined> & SchemaStatics<LiteralKit<readonly ["Content-Security-Policy", "Content-Security-Policy-Report-Only"], undefined>> & LiteralKitStatics<readonly ["Content-Security-Policy", "Content-Security-Policy-Report-Only"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L76)

Since v0.0.0

## ContentSecurityPolicyOption

CSP option schema accepting a disabled `false` value or structured directives.

**Example**

```ts
import { ContentSecurityPolicyOption } from "@beep/schema/Csp"

console.log(ContentSecurityPolicyOption.ast)
```

**Signature**

```ts
declare const ContentSecurityPolicyOption: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof ContentSecurityPolicyOptionStruct]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L643)

Since v0.0.0

## CspDirectives

Combined CSP directive field schema.

**Example**

```ts
import { CspDirectives } from "@beep/schema/Csp"

console.log(CspDirectives.ast)
```

**Signature**

```ts
declare const CspDirectives: AnnotatedSchema<S.Struct<{ readonly reportURI: AnnotatedSchema<S.Union<readonly [S.String, S.URL, S.$Array<AnnotatedSchema<S.Union<readonly [S.String, S.URL]>>>]>>; readonly "report-uri": AnnotatedSchema<S.Union<readonly [S.String, S.URL, S.$Array<AnnotatedSchema<S.Union<readonly [S.String, S.URL]>>>]>>; readonly reportTo: S.String; readonly "report-to": S.String; readonly formAction: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "form-action": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly frameAncestors: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "frame-ancestors": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly navigateTo: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "navigate-to": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly baseURI: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "base-uri": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly pluginTypes: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>]> & SchemaStatics<S.Union<readonly [S.String, S.$Array<S.String>]>>>; readonly "plugin-types": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>]> & SchemaStatics<S.Union<readonly [S.String, S.$Array<S.String>]>>>; readonly sandbox: LiteralKit<readonly [true, "allow-downloads-without-user-activation", "allow-forms", "allow-modals", "allow-orientation-lock", "allow-pointer-lock", "allow-popups", "allow-popups-to-escape-sandbox", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-storage-access-by-user-activation", "allow-top-navigation", "allow-top-navigation-by-user-activation"], undefined> & SchemaStatics<LiteralKit<readonly [true, "allow-downloads-without-user-activation", "allow-forms", "allow-modals", "allow-orientation-lock", "allow-pointer-lock", "allow-popups", "allow-popups-to-escape-sandbox", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-storage-access-by-user-activation", "allow-top-navigation", "allow-top-navigation-by-user-activation"], undefined>> & LiteralKitStatics<readonly [true, "allow-downloads-without-user-activation", "allow-forms", "allow-modals", "allow-orientation-lock", "allow-pointer-lock", "allow-popups", "allow-popups-to-escape-sandbox", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-storage-access-by-user-activation", "allow-top-navigation", "allow-top-navigation-by-user-activation"]>; readonly childSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "child-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly connectSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "connect-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly defaultSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "default-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly fontSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "font-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly frameSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "frame-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly imgSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "img-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly manifestSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "manifest-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly mediaSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "media-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly prefetchSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "prefetch-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly objectSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "object-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly scriptSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "script-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly scriptSrcElem: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "script-src-elem": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly scriptSrcAttr: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "script-src-attr": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly styleSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "style-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly styleSrcElem: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "style-src-elem": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly styleSrcAttr: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "style-src-attr": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly workerSrc: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; readonly "worker-src": AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L578)

Since v0.0.0

## DirectiveSource

Source value accepted by a Content-Security-Policy directive.

**Example**

```ts
import { DirectiveSource } from "@beep/schema/Csp"

console.log(DirectiveSource.ast)
```

**Signature**

```ts
declare const DirectiveSource: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>, S.Undefined]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L35)

Since v0.0.0

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof ContentSecurityPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof ContentSecurityPolicyOptionStruct]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ContentSecurityPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof ContentSecurityPolicyOptionStruct]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ContentSecurityPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ContentSecurityPolicyOption, headerValueCreator?: undefined | ((option?: undefined | ContentSecurityPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L866)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof ContentSecurityPolicyOptionStruct]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L867)

Since v0.0.0

## PluginTypes

Values accepted by the CSP `plugin-types` directive.

**Example**

```ts
import { PluginTypes } from "@beep/schema/Csp"

console.log(PluginTypes.ast)
```

**Signature**

```ts
declare const PluginTypes: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>]> & SchemaStatics<S.Union<readonly [S.String, S.$Array<S.String>]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L201)

Since v0.0.0

## ReportURI

Values accepted by the CSP `report-uri` directive.

**Example**

```ts
import { ReportURI } from "@beep/schema/Csp"

console.log(ReportURI.ast)
```

**Signature**

```ts
declare const ReportURI: AnnotatedSchema<S.Union<readonly [S.String, S.URL, S.$Array<AnnotatedSchema<S.Union<readonly [S.String, S.URL]>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L513)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof ContentSecurityPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L868)

Since v0.0.0

## Sandbox

Values accepted by the CSP `sandbox` directive.

**Example**

```ts
import { Sandbox } from "@beep/schema/Csp"

console.log(Sandbox.ast)
```

**Signature**

```ts
declare const Sandbox: LiteralKit<readonly [true, "allow-downloads-without-user-activation", "allow-forms", "allow-modals", "allow-orientation-lock", "allow-pointer-lock", "allow-popups", "allow-popups-to-escape-sandbox", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-storage-access-by-user-activation", "allow-top-navigation", "allow-top-navigation-by-user-activation"], undefined> & SchemaStatics<LiteralKit<readonly [true, "allow-downloads-without-user-activation", "allow-forms", "allow-modals", "allow-orientation-lock", "allow-pointer-lock", "allow-popups", "allow-popups-to-escape-sandbox", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-storage-access-by-user-activation", "allow-top-navigation", "allow-top-navigation-by-user-activation"], undefined>> & LiteralKitStatics<readonly [true, "allow-downloads-without-user-activation", "allow-forms", "allow-modals", "allow-orientation-lock", "allow-pointer-lock", "allow-popups", "allow-popups-to-escape-sandbox", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-storage-access-by-user-activation", "allow-top-navigation", "allow-top-navigation-by-user-activation"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L253)

Since v0.0.0

# utilities

## createDirectiveValue

Creates a serialized directive value from a directive name and value list.

**Example**

```ts
import { createDirectiveValue } from "@beep/schema/Csp"

const value = createDirectiveValue("default-src", ["'self'", "https://cdn.example.com"])
console.log(value)
```

**Signature**

```ts
declare const createDirectiveValue: { <const T extends string>(directiveName: string, value: T | readonly T[]): `${string} ${string}`; <const T extends string>(directiveName: string, value: T | readonly T[], options: DirectiveValueOptions): `${string} ${string}`; <const T extends string>(value: T | readonly T[]): (directiveName: string) => `${string} ${string}`; <const T extends string>(value: T | readonly T[], options: DirectiveValueOptions): (directiveName: string) => `${string} ${string}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L163)

Since v0.0.0

## getProperHeaderName

Get proper header name for CSP

**Example**

```ts
import {
  getProperHeaderName
} from "@beep/schema/Csp";

// Get standard CSP header name
const standardHeader = getProperHeaderName();
console.log(standardHeader)
// => "Content-Security-Policy"

// Get report-only CSP header name
const reportOnlyHeader = getProperHeaderName(true);
console.log(reportOnlyHeader)
// => "Content-Security-Policy-Report-Only"
```

**Signature**

```ts
declare const getProperHeaderName: (reportOnly?: boolean) => ContentSecurityPolicyHeaderName
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Csp/Csp.schema.ts#L131)

Since v0.0.0
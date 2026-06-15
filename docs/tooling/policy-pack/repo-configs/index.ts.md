---
title: index.ts
nav_order: 7
parent: "@beep/repo-configs"
---

## index.ts overview

\@beep/repo-configs

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [DeprecatedApisESLintConfig](#deprecatedapiseslintconfig)
  - [DeprecatedApisESLintConfigShape (type alias)](#deprecatedapiseslintconfigshape-type-alias)
  - [DocsESLintConfig](#docseslintconfig)
  - [DocsESLintConfigShape (type alias)](#docseslintconfigshape-type-alias)
  - [VERSION](#version)
---

# configuration

## DeprecatedApisESLintConfig

Shared deprecated API ESLint flat config.

**Example**

```ts
import { DeprecatedApisESLintConfig } from "@beep/repo-configs"
console.log(DeprecatedApisESLintConfig)
```

**Signature**

```ts
declare const DeprecatedApisESLintConfig: DeprecatedApisESLintConfigShapeInternal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/index.ts#L78)

Since v0.0.0

## DeprecatedApisESLintConfigShape (type alias)

Flat deprecated API ESLint config array shape exported by this package.

**Example**

```ts
import type { DeprecatedApisESLintConfigShape } from "@beep/repo-configs"
const config = [] satisfies DeprecatedApisESLintConfigShape
console.log(config)
```

**Signature**

```ts
type DeprecatedApisESLintConfigShape = DeprecatedApisESLintConfigShapeInternal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/index.ts#L52)

Since v0.0.0

## DocsESLintConfig

Shared docs-only repository ESLint flat config.

**Example**

```ts
import { DocsESLintConfig } from "@beep/repo-configs"
console.log(DocsESLintConfig)
```

**Signature**

```ts
declare const DocsESLintConfig: DocsESLintConfigShapeInternal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/index.ts#L65)

Since v0.0.0

## DocsESLintConfigShape (type alias)

Flat docs-only ESLint config array shape exported by this package.

**Example**

```ts
import type { DocsESLintConfigShape } from "@beep/repo-configs"
const config = [] satisfies DocsESLintConfigShape
console.log(config)
```

**Signature**

```ts
type DocsESLintConfigShape = DocsESLintConfigShapeInternal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/index.ts#L38)

Since v0.0.0

## VERSION

Package version for `@beep/repo-configs`.

**Example**

```ts
import { VERSION } from "@beep/repo-configs"
console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/index.ts#L24)

Since v0.0.0
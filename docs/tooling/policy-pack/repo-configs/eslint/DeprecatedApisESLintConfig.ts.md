---
title: DeprecatedApisESLintConfig.ts
nav_order: 1
parent: "@beep/repo-configs"
---

## DeprecatedApisESLintConfig.ts overview

Deprecated API ESLint configuration used by repository quality gates.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [DeprecatedApisESLintConfig](#deprecatedapiseslintconfig)
  - [DeprecatedApisESLintConfigShape (type alias)](#deprecatedapiseslintconfigshape-type-alias)
---

# configuration

## DeprecatedApisESLintConfig

Shared deprecated API ESLint flat config.

**Example**

```ts
import { DeprecatedApisESLintConfig } from "@beep/repo-configs/eslint/DeprecatedApisESLintConfig"
console.log(DeprecatedApisESLintConfig)
```

**Signature**

```ts
declare const DeprecatedApisESLintConfig: DeprecatedApisESLintConfigShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/DeprecatedApisESLintConfig.ts#L64)

Since v0.0.0

## DeprecatedApisESLintConfigShape (type alias)

Flat ESLint config array shape exported for deprecated API checks.

**Example**

```ts
import type { DeprecatedApisESLintConfigShape } from "@beep/repo-configs/eslint/DeprecatedApisESLintConfig"
const config = [] satisfies DeprecatedApisESLintConfigShape
console.log(config)
```

**Signature**

```ts
type DeprecatedApisESLintConfigShape = ReadonlyArray<Linter.Config>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/DeprecatedApisESLintConfig.ts#L51)

Since v0.0.0
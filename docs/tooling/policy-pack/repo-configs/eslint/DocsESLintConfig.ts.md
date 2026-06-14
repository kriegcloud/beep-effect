---
title: DocsESLintConfig.ts
nav_order: 2
parent: "@beep/repo-configs"
---

## DocsESLintConfig.ts overview

Docs-only ESLint configuration used by repository tooling.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [DocsESLintConfig](#docseslintconfig)
  - [DocsESLintConfigShape (type alias)](#docseslintconfigshape-type-alias)
---

# configuration

## DocsESLintConfig

Docs-only ESLint configuration used by the repository root `lint:jsdoc` lane.

**Example**

```ts
import { DocsESLintConfig } from "@beep/repo-configs/eslint/DocsESLintConfig"
console.log(DocsESLintConfig)
```

**Signature**

```ts
declare const DocsESLintConfig: DocsESLintConfigShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/DocsESLintConfig.ts#L48)

Since v0.0.0

## DocsESLintConfigShape (type alias)

Flat ESLint config array shape exported for repository documentation checks.

**Example**

```ts
import type { DocsESLintConfigShape } from "@beep/repo-configs/eslint/DocsESLintConfig"
const config = [] satisfies DocsESLintConfigShape
console.log(config)
```

**Signature**

```ts
type DocsESLintConfigShape = ReadonlyArray<Linter.Config>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/DocsESLintConfig.ts#L35)

Since v0.0.0
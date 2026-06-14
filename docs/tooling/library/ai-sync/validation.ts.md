---
title: validation.ts
nav_order: 10
parent: "@beep/ai-sync"
---

## validation.ts overview

Repo-local agent configuration validation.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [defaultRepoRoot](#defaultreporoot)
  - [validateCurrentCheckoutDogfood](#validatecurrentcheckoutdogfood)
  - [validateDogfoodConfig](#validatedogfoodconfig)
  - [validateRepoConfig](#validaterepoconfig)
---

# validation

## defaultRepoRoot

Resolve the repository root from the package source directory.

**Example**

```ts
import { defaultRepoRoot } from "@beep/ai-sync"
console.log(defaultRepoRoot)
```

**Signature**

```ts
declare const defaultRepoRoot: () => Effect.Effect<string, never, Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/validation.ts#L120)

Since v0.0.0

## validateCurrentCheckoutDogfood

Validate the mandatory V1 config from the current checkout.

**Example**

```ts
import { validateCurrentCheckoutDogfood } from "@beep/ai-sync"
console.log(validateCurrentCheckoutDogfood)
```

**Signature**

```ts
declare const validateCurrentCheckoutDogfood: () => Effect.Effect<AiSyncValidationResult, AiSyncError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/validation.ts#L136)

Since v0.0.0

## validateDogfoodConfig

Validate the mandatory V1 dogfood config.

**Example**

```ts
import { validateDogfoodConfig } from "@beep/ai-sync"
console.log(validateDogfoodConfig)
```

**Signature**

```ts
declare const validateDogfoodConfig: (repoRoot: string) => Effect.Effect<AiSyncValidationResult, AiSyncError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/validation.ts#L105)

Since v0.0.0

## validateRepoConfig

Validate one repo-local config file through its native schema.

**Example**

```ts
import { validateRepoConfig } from "@beep/ai-sync"
console.log(validateRepoConfig)
```

**Signature**

```ts
declare const validateRepoConfig: (options: { readonly repoRoot: string; readonly config: string; }) => Effect.Effect<AiSyncValidationResult, AiSyncError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/validation.ts#L76)

Since v0.0.0
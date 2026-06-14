---
title: BiomeJson.ts
nav_order: 46
parent: "@beep/repo-utils"
---

## BiomeJson.ts overview

Shared Biome-backed JSON rendering for repo-managed config files.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [renderBiomeJson](#renderbiomejson)
---

# utilities

## renderBiomeJson

Render JSON with the same Biome config that repository lint uses.

**Example**

```ts
console.log("renderBiomeJson")
```

**Signature**

```ts
declare const renderBiomeJson: { (filePath: string, value: unknown): Effect.Effect<string, DomainError, Path.Path>; (value: unknown): (filePath: string) => Effect.Effect<string, DomainError, Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/BiomeJson.ts#L43)

Since v0.0.0
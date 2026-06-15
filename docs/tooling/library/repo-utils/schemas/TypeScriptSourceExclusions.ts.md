---
title: TypeScriptSourceExclusions.ts
nav_order: 54
parent: "@beep/repo-utils"
---

## TypeScriptSourceExclusions.ts overview

Shared TypeScript source path exclusion rules for CLI lint commands.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [TYPESCRIPT_SOURCE_EXCLUDED_SEGMENTS](#typescript_source_excluded_segments)
  - [TYPESCRIPT_SOURCE_EXCLUDED_SUFFIXES](#typescript_source_excluded_suffixes)
  - [isExcludedTypeScriptSourcePath](#isexcludedtypescriptsourcepath)
  - [toPosixPath](#toposixpath)
---

# utilities

## TYPESCRIPT_SOURCE_EXCLUDED_SEGMENTS

Path segments excluded from TypeScript source lint traversals.

**Example**

```ts
console.log("TYPESCRIPT_SOURCE_EXCLUDED_SEGMENTS")
```

**Signature**

```ts
declare const TYPESCRIPT_SOURCE_EXCLUDED_SEGMENTS: readonly ["/.repos/", "/node_modules/", "/dist/", "/build/", "/coverage/", "/storybook-static/", "/.next/", "/.turbo/", "/docs/", "/_generated/", "/generated/", "/goals/", "/test/", "/tests/", "/dtslint/"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TypeScriptSourceExclusions.ts#L19)

Since v0.0.0

## TYPESCRIPT_SOURCE_EXCLUDED_SUFFIXES

File suffixes excluded from TypeScript source lint traversals.

**Example**

```ts
console.log("TYPESCRIPT_SOURCE_EXCLUDED_SUFFIXES")
```

**Signature**

```ts
declare const TYPESCRIPT_SOURCE_EXCLUDED_SUFFIXES: readonly [".d.ts", ".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".gen.ts", ".gen.tsx", ".stories.tsx"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TypeScriptSourceExclusions.ts#L47)

Since v0.0.0

## isExcludedTypeScriptSourcePath

Check whether a TypeScript source path should be excluded from lint traversals.

**Example**

```ts
console.log("isExcludedTypeScriptSourcePath")
```

**Signature**

```ts
declare const isExcludedTypeScriptSourcePath: (filePath: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TypeScriptSourceExclusions.ts#L84)

Since v0.0.0

## toPosixPath

Normalize filesystem paths to POSIX separators before string matching.

**Example**

```ts
console.log("toPosixPath")
```

**Signature**

```ts
declare const toPosixPath: (value: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TypeScriptSourceExclusions.ts#L70)

Since v0.0.0
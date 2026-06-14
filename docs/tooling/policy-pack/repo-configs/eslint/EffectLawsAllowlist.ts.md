---
title: EffectLawsAllowlist.ts
nav_order: 3
parent: "@beep/repo-configs"
---

## EffectLawsAllowlist.ts overview

Effect laws allowlist helpers used by repository ESLint rules.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [getAllowlistDiagnostics](#getallowlistdiagnostics)
  - [getAllowlistEntries](#getallowlistentries)
  - [isViolationAllowlisted](#isviolationallowlisted)
  - [resetAllowlistCache](#resetallowlistcache)
---

# utilities

## getAllowlistDiagnostics

Retrieve allowlist decode diagnostics.

**Example**

```ts
import { getAllowlistDiagnostics } from "@beep/repo-configs/eslint/EffectLawsAllowlist"
const diagnostics = getAllowlistDiagnostics()
console.log(diagnostics)
```

**Signature**

```ts
declare const getAllowlistDiagnostics: () => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/EffectLawsAllowlist.ts#L69)

Since v0.0.0

## getAllowlistEntries

Retrieve normalized allowlist entries from the generated snapshot.

**Example**

```ts
import { getAllowlistEntries } from "@beep/repo-configs/eslint/EffectLawsAllowlist"
const entries = getAllowlistEntries()
console.log(entries)
```

**Signature**

```ts
declare const getAllowlistEntries: () => ReadonlyArray<EffectLawsAllowlistEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/EffectLawsAllowlist.ts#L84)

Since v0.0.0

## isViolationAllowlisted

Check whether a normalized violation key appears in the effect-laws allowlist.

**Example**

```ts
import { isViolationAllowlisted } from "@beep/repo-configs/eslint/EffectLawsAllowlist"
const allowlisted = isViolationAllowlisted({
  ruleId: "effect/no-native-runtime",
  filePath: "packages/tooling/tool/cli/src/commands/Lint/index.ts",
  kind: "error",
})
console.log(allowlisted)
```

**Signature**

```ts
declare const isViolationAllowlisted: (input: unknown) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/EffectLawsAllowlist.ts#L104)

Since v0.0.0

## resetAllowlistCache

Reset memoized allowlist state.

Snapshot-backed runtime has no mutable cache, so this is a compatibility no-op.

**Example**

```ts
import { resetAllowlistCache } from "@beep/repo-configs/eslint/EffectLawsAllowlist"
resetAllowlistCache()
```

**Signature**

```ts
declare const resetAllowlistCache: () => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/EffectLawsAllowlist.ts#L54)

Since v0.0.0
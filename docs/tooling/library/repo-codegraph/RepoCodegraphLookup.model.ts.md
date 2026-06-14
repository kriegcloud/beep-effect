---
title: RepoCodegraphLookup.model.ts
nav_order: 2
parent: "@beep/repo-codegraph"
---

## RepoCodegraphLookup.model.ts overview

Schema-first lookup request and response models for repo-codegraph.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [RepoCodegraphBoundaryAdvice (class)](#repocodegraphboundaryadvice-class)
  - [RepoCodegraphBoundaryStatus](#repocodegraphboundarystatus)
  - [RepoCodegraphBoundaryStatus (type alias)](#repocodegraphboundarystatus-type-alias)
  - [RepoCodegraphFreshnessStatus](#repocodegraphfreshnessstatus)
  - [RepoCodegraphFreshnessStatus (type alias)](#repocodegraphfreshnessstatus-type-alias)
  - [RepoCodegraphImportCandidate (class)](#repocodegraphimportcandidate-class)
  - [RepoCodegraphLookupMatch (class)](#repocodegraphlookupmatch-class)
  - [RepoCodegraphLookupRequest (class)](#repocodegraphlookuprequest-class)
  - [RepoCodegraphLookupResult (class)](#repocodegraphlookupresult-class)
  - [RepoCodegraphLookupSchemaVersion](#repocodegraphlookupschemaversion)
  - [RepoCodegraphLookupSchemaVersion (type alias)](#repocodegraphlookupschemaversion-type-alias)
  - [RepoCodegraphLookupScore (class)](#repocodegraphlookupscore-class)
  - [RepoCodegraphLookupTotals (class)](#repocodegraphlookuptotals-class)
  - [RepoCodegraphPackageImportPolicy (class)](#repocodegraphpackageimportpolicy-class)
  - [RepoCodegraphPreferredImport (class)](#repocodegraphpreferredimport-class)
- [schemas](#schemas)
  - [encodeRepoCodegraphLookupResult](#encoderepocodegraphlookupresult)
---

# models

## RepoCodegraphBoundaryAdvice (class)

Advisory architecture boundary note for a match.

**Example**

```ts
import { RepoCodegraphBoundaryAdvice } from "@beep/repo-codegraph"
const advice = RepoCodegraphBoundaryAdvice.make({
  citations: ["standards/ARCHITECTURE.md"],
  reason: "No caller package was supplied.",
  status: "unknown"
})
console.log(advice.status)
```

**Signature**

```ts
declare class RepoCodegraphBoundaryAdvice
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L218)

Since v0.0.0

## RepoCodegraphBoundaryStatus

Advisory boundary status for a candidate import.

**Example**

```ts
import { RepoCodegraphBoundaryStatus } from "@beep/repo-codegraph"
console.log(RepoCodegraphBoundaryStatus.Enum.allowed)
```

**Signature**

```ts
declare const RepoCodegraphBoundaryStatus: AnnotatedSchema<LiteralKit<readonly ["allowed", "advisory", "blocked", "unknown"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L89)

Since v0.0.0

## RepoCodegraphBoundaryStatus (type alias)

Runtime type for `RepoCodegraphBoundaryStatus`.

**Example**

```ts
import type { RepoCodegraphBoundaryStatus } from "@beep/repo-codegraph"
const status: RepoCodegraphBoundaryStatus = "advisory"
console.log(status)
```

**Signature**

```ts
type RepoCodegraphBoundaryStatus = typeof RepoCodegraphBoundaryStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L107)

Since v0.0.0

## RepoCodegraphFreshnessStatus

Freshness state for the export catalog used by a lookup.

**Example**

```ts
import { RepoCodegraphFreshnessStatus } from "@beep/repo-codegraph"
console.log(RepoCodegraphFreshnessStatus.Enum.unchecked)
```

**Signature**

```ts
declare const RepoCodegraphFreshnessStatus: AnnotatedSchema<LiteralKit<readonly ["unchecked", "current"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L58)

Since v0.0.0

## RepoCodegraphFreshnessStatus (type alias)

Runtime type for `RepoCodegraphFreshnessStatus`.

**Example**

```ts
import type { RepoCodegraphFreshnessStatus } from "@beep/repo-codegraph"
const status: RepoCodegraphFreshnessStatus = "current"
console.log(status)
```

**Signature**

```ts
type RepoCodegraphFreshnessStatus = typeof RepoCodegraphFreshnessStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L76)

Since v0.0.0

## RepoCodegraphImportCandidate (class)

One legal import option for a matched symbol.

**Example**

```ts
import { RepoCodegraphImportCandidate } from "@beep/repo-codegraph"
import * as O from "effect/Option"
const candidate = RepoCodegraphImportCandidate.make({
  exportSubpath: ".",
  importSpecifier: "@beep/schema",
  isRecommended: true,
  reason: O.some("Shortest public export.")
})
console.log(candidate.importSpecifier)
```

**Signature**

```ts
declare class RepoCodegraphImportCandidate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L188)

Since v0.0.0

## RepoCodegraphLookupMatch (class)

One scored lookup match.

**Example**

```ts
import { RepoCodegraphLookupMatch } from "@beep/repo-codegraph"
console.log(RepoCodegraphLookupMatch)
```

**Signature**

```ts
declare class RepoCodegraphLookupMatch
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L243)

Since v0.0.0

## RepoCodegraphLookupRequest (class)

Deterministic lookup request.

**Example**

```ts
import { RepoCodegraphLookupRequest } from "@beep/repo-codegraph"
import * as O from "effect/Option"
const request = RepoCodegraphLookupRequest.make({
  fromPackage: O.none(),
  limit: 8,
  query: "UnknownRecord"
})
console.log(request.query)
```

**Signature**

```ts
declare class RepoCodegraphLookupRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L126)

Since v0.0.0

## RepoCodegraphLookupResult (class)

Deterministic lookup result.

**Example**

```ts
import { RepoCodegraphLookupResult } from "@beep/repo-codegraph"
console.log(RepoCodegraphLookupResult)
```

**Signature**

```ts
declare class RepoCodegraphLookupResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L300)

Since v0.0.0

## RepoCodegraphLookupSchemaVersion

Lookup result schema version.

**Example**

```ts
import { RepoCodegraphLookupSchemaVersion } from "@beep/repo-codegraph"
console.log(RepoCodegraphLookupSchemaVersion.Enum["repo-codegraph.lookup/v1"])
```

**Signature**

```ts
declare const RepoCodegraphLookupSchemaVersion: AnnotatedSchema<LiteralKit<readonly ["repo-codegraph.lookup/v1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L27)

Since v0.0.0

## RepoCodegraphLookupSchemaVersion (type alias)

Runtime type for `RepoCodegraphLookupSchemaVersion`.

**Example**

```ts
import type { RepoCodegraphLookupSchemaVersion } from "@beep/repo-codegraph"
const version: RepoCodegraphLookupSchemaVersion = "repo-codegraph.lookup/v1"
console.log(version)
```

**Signature**

```ts
type RepoCodegraphLookupSchemaVersion = typeof RepoCodegraphLookupSchemaVersion.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L45)

Since v0.0.0

## RepoCodegraphLookupScore (class)

Machine-readable score components for one lookup match.

**Example**

```ts
import { RepoCodegraphLookupScore } from "@beep/repo-codegraph"
const score = RepoCodegraphLookupScore.make({
  boundary: 5,
  exact: 80,
  graph: 8,
  lexical: 20,
  semantic: 10,
  total: 123
})
console.log(score.total)
```

**Signature**

```ts
declare class RepoCodegraphLookupScore
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L156)

Since v0.0.0

## RepoCodegraphLookupTotals (class)

Aggregate match counts for a lookup result.

**Example**

```ts
import { RepoCodegraphLookupTotals } from "@beep/repo-codegraph"
const totals = RepoCodegraphLookupTotals.make({
  catalogEntries: 10,
  matchedEntries: 2,
  returnedMatches: 1
})
console.log(totals.returnedMatches)
```

**Signature**

```ts
declare class RepoCodegraphLookupTotals
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L278)

Since v0.0.0

## RepoCodegraphPackageImportPolicy (class)

Package-local import policy consumed by lookup.

**Example**

```ts
import { RepoCodegraphPackageImportPolicy } from "@beep/repo-codegraph"
const policy = RepoCodegraphPackageImportPolicy.make({
  packageName: "@beep/schema",
  packagePath: "packages/foundation/modeling/schema",
  preferredImports: []
})
console.log(policy.packageName)
```

**Signature**

```ts
declare class RepoCodegraphPackageImportPolicy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L365)

Since v0.0.0

## RepoCodegraphPreferredImport (class)

Preferred import rule recorded in package-local repo-codegraph policy.

**Example**

```ts
import { RepoCodegraphPreferredImport } from "@beep/repo-codegraph"
import * as O from "effect/Option"
const preferred = RepoCodegraphPreferredImport.make({
  importSpecifier: "@beep/schema",
  reason: O.some("Use the package root for public schemas."),
  symbols: ["UnknownRecord"]
})
console.log(preferred.importSpecifier)
```

**Signature**

```ts
declare class RepoCodegraphPreferredImport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L333)

Since v0.0.0

# schemas

## encodeRepoCodegraphLookupResult

Encode a lookup result into its JSON-safe representation.

**Example**

```ts
import { encodeRepoCodegraphLookupResult } from "@beep/repo-codegraph"
console.log(encodeRepoCodegraphLookupResult)
```

**Signature**

```ts
declare const encodeRepoCodegraphLookupResult: (input: RepoCodegraphLookupResult, options?: ParseOptions) => Effect.Effect<{ readonly schemaVersion: "repo-codegraph.lookup/v1"; readonly query: string; readonly fromPackage: string | null; readonly limit: number; readonly freshnessStatus: "unchecked" | "current"; readonly warnings: ReadonlyArray<string>; readonly matches: ReadonlyArray<{ readonly packageName: string; readonly packagePath: string; readonly symbolName: string; readonly exportKind: string; readonly sourcePath: string; readonly sourceLine: number; readonly summary: string | null; readonly recommendedImport: { readonly importSpecifier: string; readonly exportSubpath: string; readonly isRecommended: boolean; readonly reason: string | null; }; readonly legalImports: ReadonlyArray<{ readonly importSpecifier: string; readonly exportSubpath: string; readonly isRecommended: boolean; readonly reason: string | null; }>; readonly boundary: { readonly status: "allowed" | "advisory" | "blocked" | "unknown"; readonly reason: string; readonly citations?: ReadonlyArray<string> | undefined; }; readonly score: { readonly exact: number; readonly lexical: number; readonly semantic: number; readonly graph: number; readonly boundary: number; readonly total: number; }; }>; readonly totals: { readonly catalogEntries: number; readonly matchedEntries: number; readonly returnedMatches: number; }; }, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.model.ts#L389)

Since v0.0.0
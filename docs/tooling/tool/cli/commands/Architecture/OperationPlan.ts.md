---
title: OperationPlan.ts
nav_order: 10
parent: "@beep/repo-cli"
---

## OperationPlan.ts overview

Architecture operation-plan command implementation.

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - [decodeCanonicalSliceOperationPlanJson](#decodecanonicalsliceoperationplanjson)
  - [encodeCanonicalSliceOperationPlanJson](#encodecanonicalsliceoperationplanjson)
- [constructors](#constructors)
  - [makeArchitectureOperationPlan](#makearchitectureoperationplan)
  - [makeArchitecturePackageOperationPlan](#makearchitecturepackageoperationplan)
  - [makeCanonicalSliceOperationPlan](#makecanonicalsliceoperationplan)
- [models](#models)
  - [ArchitectureDomainKind](#architecturedomainkind)
  - [ArchitectureDomainKind (type alias)](#architecturedomainkind-type-alias)
  - [ArchitectureOperation](#architectureoperation)
  - [ArchitectureOperation (type alias)](#architectureoperation-type-alias)
  - [ArchitectureOperationCheck (class)](#architectureoperationcheck-class)
  - [ArchitectureOperationCheckStatus](#architectureoperationcheckstatus)
  - [ArchitectureOperationCheckStatus (type alias)](#architectureoperationcheckstatus-type-alias)
  - [ArchitectureOperationConflictPolicy](#architectureoperationconflictpolicy)
  - [ArchitectureOperationConflictPolicy (type alias)](#architectureoperationconflictpolicy-type-alias)
  - [ArchitectureOperationKind](#architectureoperationkind)
  - [ArchitectureOperationKind (type alias)](#architectureoperationkind-type-alias)
  - [ArchitectureOperationSource](#architectureoperationsource)
  - [ArchitectureOperationSource (type alias)](#architectureoperationsource-type-alias)
  - [ArchitectureOperationWriteMode](#architectureoperationwritemode)
  - [ArchitectureOperationWriteMode (type alias)](#architectureoperationwritemode-type-alias)
  - [ArchitecturePackageRole](#architecturepackagerole)
  - [ArchitecturePackageRole (type alias)](#architecturepackagerole-type-alias)
  - [ArchitecturePlanStage](#architectureplanstage)
  - [ArchitecturePlanStage (type alias)](#architectureplanstage-type-alias)
  - [ArchitecturePlanTarget (class)](#architectureplantarget-class)
  - [ArchitectureSliceRole](#architectureslicerole)
  - [ArchitectureSliceRole (type alias)](#architectureslicerole-type-alias)
  - [ArchitectureSliceRolePlan (class)](#architecturesliceroleplan-class)
  - [ArchitectureWriterKind](#architecturewriterkind)
  - [ArchitectureWriterKind (type alias)](#architecturewriterkind-type-alias)
  - [CanonicalSliceOperationPlan (class)](#canonicalsliceoperationplan-class)
  - [EnsureAbsentPathOperation (class)](#ensureabsentpathoperation-class)
  - [EnsureFileOperation (class)](#ensurefileoperation-class)
  - [OperationPlanApplyResult (class)](#operationplanapplyresult-class)
  - [OperationPlanCheckResult (class)](#operationplancheckresult-class)
  - [WriteFileOperation (class)](#writefileoperation-class)
  - [WritePackageJsonOperation (class)](#writepackagejsonoperation-class)
  - [defaultArchitecturePlanTarget](#defaultarchitectureplantarget)
---

# codecs

## decodeCanonicalSliceOperationPlanJson

Decode operation-plan JSON text.

**Example**

```ts
import { decodeCanonicalSliceOperationPlanJson } from "@beep/repo-cli/commands/Architecture"
console.log(decodeCanonicalSliceOperationPlanJson)
```

**Signature**

```ts
declare const decodeCanonicalSliceOperationPlanJson: (input: unknown, options?: ParseOptions) => Effect.Effect<CanonicalSliceOperationPlan, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L2608)

Since v0.0.0

## encodeCanonicalSliceOperationPlanJson

Encode an operation plan as JSON text.

**Example**

```ts
import { encodeCanonicalSliceOperationPlanJson } from "@beep/repo-cli/commands/Architecture"
console.log(encodeCanonicalSliceOperationPlanJson)
```

**Signature**

```ts
declare const encodeCanonicalSliceOperationPlanJson: (input: unknown, options?: ParseOptions) => Effect.Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L2595)

Since v0.0.0

# constructors

## makeArchitectureOperationPlan

Build a write-capable operation plan from the accepted WorkItem proof files.

**Example**

```ts
import { makeArchitectureOperationPlan } from "@beep/repo-cli/commands/Architecture"
console.log(makeArchitectureOperationPlan)
```

**Signature**

```ts
declare const makeArchitectureOperationPlan: (repoRoot: string, input?: Partial<ArchitecturePlanTarget> | undefined, roles?: O.Option<ReadonlyArray<"ui" | "db-admin" | "domain" | "server" | "client" | "tables" | "config" | "use-cases" | "proof-app">> | undefined) => Effect.Effect<CanonicalSliceOperationPlan, DomainError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L2484)

Since v0.0.0

## makeArchitecturePackageOperationPlan

Build a shell-only slice role package operation plan.

**Example**

```ts
import { makeArchitecturePackageOperationPlan } from "@beep/repo-cli/commands/Architecture/index"
import { Effect } from "effect"

const program = Effect.map(
  makeArchitecturePackageOperationPlan({ boundedContext: "research-lab", role: "domain" }),
  (plan) => plan.operations.length,
)
console.log(program)
```

**Signature**

```ts
declare const makeArchitecturePackageOperationPlan: (input: { readonly boundedContext: string; readonly role: ArchitecturePackageRole; }) => Effect.Effect<CanonicalSliceOperationPlan, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L2563)

Since v0.0.0

## makeCanonicalSliceOperationPlan

Build the canonical architecture lab WorkItem operation plan.

**Example**

```ts
import { makeCanonicalSliceOperationPlan } from "@beep/repo-cli/commands/Architecture"
console.log(makeCanonicalSliceOperationPlan)
```

**Signature**

```ts
declare const makeCanonicalSliceOperationPlan: () => CanonicalSliceOperationPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L2434)

Since v0.0.0

# models

## ArchitectureDomainKind

Canonical architecture domain-kind folders.

**Example**

```ts
import { ArchitectureDomainKind } from "@beep/repo-cli/commands/Architecture"
console.log(ArchitectureDomainKind)
```

**Signature**

```ts
declare const ArchitectureDomainKind: AnnotatedSchema<LiteralKit<readonly ["aggregates", "entities", "values"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L32)

Since v0.0.0

## ArchitectureDomainKind (type alias)

Canonical architecture domain-kind folder.

**Signature**

```ts
type ArchitectureDomainKind = typeof ArchitectureDomainKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L44)

Since v0.0.0

## ArchitectureOperation

Canonical operation-plan operation.

**Example**

```ts
import { ArchitectureOperation } from "@beep/repo-cli/commands/Architecture"
console.log(ArchitectureOperation)
```

**Signature**

```ts
declare const ArchitectureOperation: S.Union<readonly [typeof WriteFileOperation, typeof WritePackageJsonOperation, typeof EnsureFileOperation, typeof EnsureAbsentPathOperation]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L586)

Since v0.0.0

## ArchitectureOperation (type alias)

Canonical operation-plan operation.

**Signature**

```ts
type ArchitectureOperation = typeof ArchitectureOperation.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L599)

Since v0.0.0

## ArchitectureOperationCheck (class)

Idempotency status for one checked operation.

**Example**

```ts
import { ArchitectureOperationCheck } from "@beep/repo-cli/commands/Architecture/index"

const status = ArchitectureOperationCheck.make({
  operationId: "ensure-file:packages/architecture-lab/domain/src/index.ts",
  kind: "ensure-file",
  path: "packages/architecture-lab/domain/src/index.ts",
  status: "matching",
})
console.log(status.status)
```

**Signature**

```ts
declare class ArchitectureOperationCheck
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L619)

Since v0.0.0

## ArchitectureOperationCheckStatus

Per-operation idempotency status.

**Example**

```ts
import { ArchitectureOperationCheckStatus } from "@beep/repo-cli/commands/Architecture/index"
import * as S from "effect/Schema"

console.log(S.is(ArchitectureOperationCheckStatus)("matching"))
```

**Signature**

```ts
declare const ArchitectureOperationCheckStatus: AnnotatedSchema<LiteralKit<readonly ["matching", "missing", "differing", "unexpected", "absent"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L340)

Since v0.0.0

## ArchitectureOperationCheckStatus (type alias)

Per-operation idempotency status.

**Example**

```ts
import type { ArchitectureOperationCheckStatus } from "@beep/repo-cli/commands/Architecture/index"

const status: ArchitectureOperationCheckStatus = "absent"
console.log(status)
```

**Signature**

```ts
type ArchitectureOperationCheckStatus = typeof ArchitectureOperationCheckStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L365)

Since v0.0.0

## ArchitectureOperationConflictPolicy

Conflict policy metadata for architecture operations.

**Example**

```ts
import { ArchitectureOperationConflictPolicy } from "@beep/repo-cli/commands/Architecture/index"
import * as S from "effect/Schema"

console.log(S.is(ArchitectureOperationConflictPolicy)("skip-identical-fail-different"))
```

**Signature**

```ts
declare const ArchitectureOperationConflictPolicy: AnnotatedSchema<LiteralKit<readonly ["skip-identical-fail-different", "require-present", "remove-existing"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L263)

Since v0.0.0

## ArchitectureOperationConflictPolicy (type alias)

Conflict policy metadata for an architecture operation.

**Example**

```ts
import type { ArchitectureOperationConflictPolicy } from "@beep/repo-cli/commands/Architecture/index"

const policy: ArchitectureOperationConflictPolicy = "require-present"
console.log(policy)
```

**Signature**

```ts
type ArchitectureOperationConflictPolicy = typeof ArchitectureOperationConflictPolicy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L286)

Since v0.0.0

## ArchitectureOperationKind

Operation kinds supported by canonical architecture operation plans.

**Example**

```ts
import { ArchitectureOperationKind } from "@beep/repo-cli/commands/Architecture/index"
import * as S from "effect/Schema"

console.log(S.is(ArchitectureOperationKind)("write-file"))
```

**Signature**

```ts
declare const ArchitectureOperationKind: AnnotatedSchema<LiteralKit<readonly ["write-file", "write-package-json", "ensure-file", "ensure-absent-path"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L161)

Since v0.0.0

## ArchitectureOperationKind (type alias)

Operation kind supported by canonical architecture operation plans.

**Example**

```ts
import type { ArchitectureOperationKind } from "@beep/repo-cli/commands/Architecture/index"

const kind: ArchitectureOperationKind = "ensure-file"
console.log(kind)
```

**Signature**

```ts
type ArchitectureOperationKind = typeof ArchitectureOperationKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L185)

Since v0.0.0

## ArchitectureOperationSource

Source metadata for architecture operations.

**Example**

```ts
import { ArchitectureOperationSource } from "@beep/repo-cli/commands/Architecture/index"
import * as S from "effect/Schema"

console.log(S.is(ArchitectureOperationSource)("accepted-proof"))
```

**Signature**

```ts
declare const ArchitectureOperationSource: AnnotatedSchema<LiteralKit<readonly ["accepted-proof", "package-shell", "legacy-cleanup", "legacy-plan"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L301)

Since v0.0.0

## ArchitectureOperationSource (type alias)

Source metadata for an architecture operation.

**Example**

```ts
import type { ArchitectureOperationSource } from "@beep/repo-cli/commands/Architecture/index"

const source: ArchitectureOperationSource = "package-shell"
console.log(source)
```

**Signature**

```ts
type ArchitectureOperationSource = typeof ArchitectureOperationSource.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L325)

Since v0.0.0

## ArchitectureOperationWriteMode

Write-mode metadata for architecture operations.

**Example**

```ts
import { ArchitectureOperationWriteMode } from "@beep/repo-cli/commands/Architecture/index"
import * as S from "effect/Schema"

console.log(S.is(ArchitectureOperationWriteMode)("write-if-missing"))
```

**Signature**

```ts
declare const ArchitectureOperationWriteMode: AnnotatedSchema<LiteralKit<readonly ["write-if-missing", "ensure-present", "remove-if-present"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L225)

Since v0.0.0

## ArchitectureOperationWriteMode (type alias)

Write-mode metadata for an architecture operation.

**Example**

```ts
import type { ArchitectureOperationWriteMode } from "@beep/repo-cli/commands/Architecture/index"

const mode: ArchitectureOperationWriteMode = "ensure-present"
console.log(mode)
```

**Signature**

```ts
type ArchitectureOperationWriteMode = typeof ArchitectureOperationWriteMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L248)

Since v0.0.0

## ArchitecturePackageRole

Slice role packages supported by `beep architecture create package`.

**Example**

```ts
import { ArchitecturePackageRole } from "@beep/repo-cli/commands/Architecture/index"
import * as S from "effect/Schema"

console.log(S.is(ArchitecturePackageRole)("domain"))
```

**Signature**

```ts
declare const ArchitecturePackageRole: AnnotatedSchema<LiteralKit<readonly ["domain", "use-cases", "config", "server", "tables", "client", "ui"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L119)

Since v0.0.0

## ArchitecturePackageRole (type alias)

Slice role package supported by `beep architecture create package`.

**Example**

```ts
import type { ArchitecturePackageRole } from "@beep/repo-cli/commands/Architecture/index"

const role: ArchitecturePackageRole = "domain"
console.log(role)
```

**Signature**

```ts
type ArchitecturePackageRole = typeof ArchitecturePackageRole.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L146)

Since v0.0.0

## ArchitecturePlanStage

Staged architecture proof targets.

**Example**

```ts
import { ArchitecturePlanStage } from "@beep/repo-cli/commands/Architecture"
console.log(ArchitecturePlanStage)
```

**Signature**

```ts
declare const ArchitecturePlanStage: AnnotatedSchema<LiteralKit<readonly ["core", "persistence", "protocol", "client", "full"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L57)

Since v0.0.0

## ArchitecturePlanStage (type alias)

Staged architecture proof target.

**Signature**

```ts
type ArchitecturePlanStage = typeof ArchitecturePlanStage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L69)

Since v0.0.0

## ArchitecturePlanTarget (class)

Normalized architecture creation target.

**Example**

```ts
import { ArchitecturePlanTarget } from "@beep/repo-cli/commands/Architecture"
console.log(ArchitecturePlanTarget)
```

**Signature**

```ts
declare class ArchitecturePlanTarget
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L434)

Since v0.0.0

## ArchitectureSliceRole

Canonical architecture slice roles.

**Example**

```ts
import { ArchitectureSliceRole } from "@beep/repo-cli/commands/Architecture"
console.log(ArchitectureSliceRole)
```

**Signature**

```ts
declare const ArchitectureSliceRole: AnnotatedSchema<LiteralKit<readonly ["domain", "use-cases", "config", "server", "tables", "client", "ui", "proof-app", "db-admin"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L82)

Since v0.0.0

## ArchitectureSliceRole (type alias)

Canonical architecture slice role.

**Signature**

```ts
type ArchitectureSliceRole = typeof ArchitectureSliceRole.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L104)

Since v0.0.0

## ArchitectureSliceRolePlan (class)

Role package entry in a canonical architecture slice operation plan.

**Example**

```ts
import { ArchitectureSliceRolePlan } from "@beep/repo-cli/commands/Architecture"
console.log(ArchitectureSliceRolePlan)
```

**Signature**

```ts
declare class ArchitectureSliceRolePlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L411)

Since v0.0.0

## ArchitectureWriterKind

Writer families selected from normalized architecture operations.

**Example**

```ts
import { ArchitectureWriterKind } from "@beep/repo-cli/commands/Architecture"
console.log(ArchitectureWriterKind)
```

**Signature**

```ts
declare const ArchitectureWriterKind: AnnotatedSchema<LiteralKit<readonly ["template", "json", "jsonc", "package-json", "ts-morph"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L198)

Since v0.0.0

## ArchitectureWriterKind (type alias)

Writer family selected from normalized architecture operations.

**Signature**

```ts
type ArchitectureWriterKind = typeof ArchitectureWriterKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L210)

Since v0.0.0

## CanonicalSliceOperationPlan (class)

Schema-versioned canonical architecture slice operation plan.

**Example**

```ts
import { CanonicalSliceOperationPlan } from "@beep/repo-cli/commands/Architecture"
console.log(CanonicalSliceOperationPlan)
```

**Signature**

```ts
declare class CanonicalSliceOperationPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L642)

Since v0.0.0

## EnsureAbsentPathOperation (class)

Operation that proves a legacy repo-relative path must not exist.

**Example**

```ts
import { EnsureAbsentPathOperation } from "@beep/repo-cli/commands/Architecture"
console.log(EnsureAbsentPathOperation)
```

**Signature**

```ts
declare class EnsureAbsentPathOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L560)

Since v0.0.0

## EnsureFileOperation (class)

Operation that proves a repo-relative file must exist.

**Example**

```ts
import { EnsureFileOperation } from "@beep/repo-cli/commands/Architecture"
console.log(EnsureFileOperation)
```

**Signature**

```ts
declare class EnsureFileOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L533)

Since v0.0.0

## OperationPlanApplyResult (class)

Result of applying a canonical operation plan.

**Example**

```ts
import { OperationPlanApplyResult } from "@beep/repo-cli/commands/Architecture"
console.log(OperationPlanApplyResult)
```

**Signature**

```ts
declare class OperationPlanApplyResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L710)

Since v0.0.0

## OperationPlanCheckResult (class)

Result of validating a canonical operation plan against a checkout.

**Example**

```ts
import { OperationPlanCheckResult } from "@beep/repo-cli/commands/Architecture"
console.log(OperationPlanCheckResult)
```

**Signature**

```ts
declare class OperationPlanCheckResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L684)

Since v0.0.0

## WriteFileOperation (class)

Operation that writes a repo-relative file when absent.

**Example**

```ts
import { WriteFileOperation } from "@beep/repo-cli/commands/Architecture"
console.log(WriteFileOperation)
```

**Signature**

```ts
declare class WriteFileOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L458)

Since v0.0.0

## WritePackageJsonOperation (class)

Operation that writes a structured package manifest.

**Example**

```ts
import { WritePackageJsonOperation } from "@beep/repo-cli/commands/Architecture/index"

const operation = WritePackageJsonOperation.make({
  kind: "write-package-json",
  role: "domain",
  path: "packages/research-lab/domain/package.json",
  packageName: "@beep/research-lab-domain",
  packageDescription: "Research lab domain package.",
  repositoryDirectory: "packages/research-lab/domain",
  exports: ["."],
  dependencies: {},
  devDependencies: {},
  description: "Write the research-lab domain package manifest.",
})
console.log(operation.packageName)
```

**Signature**

```ts
declare class WritePackageJsonOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L500)

Since v0.0.0

## defaultArchitecturePlanTarget

Default architecture target shared by command defaults and plan factories.

**Example**

```ts
import { defaultArchitecturePlanTarget } from "@beep/repo-cli/commands/Architecture/index"

console.log(defaultArchitecturePlanTarget.boundedContext)
```

**Signature**

```ts
declare const defaultArchitecturePlanTarget: ArchitecturePlanTarget
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlan.ts#L745)

Since v0.0.0
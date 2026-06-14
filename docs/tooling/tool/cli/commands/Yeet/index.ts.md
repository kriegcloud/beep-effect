---
title: index.ts
nav_order: 84
parent: "@beep/repo-cli"
---

## index.ts overview

Public yeet run models.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [yeetCommand](#yeetcommand)
- [errors](#errors)
  - ["./Yeet.errors.js" (namespace export)](#yeeterrorsjs-namespace-export)
- [models](#models)
  - [PackageQualityReport](#packagequalityreport)
  - [QualityIssue](#qualityissue)
  - [QualityIssueAttribution](#qualityissueattribution)
  - [QualityIssueCategory](#qualityissuecategory)
  - [QualityIssueConfidence](#qualityissueconfidence)
  - [QualityIssueIndex](#qualityissueindex)
  - [QualityIssueRouting](#qualityissuerouting)
  - [QualityIssueSeverity](#qualityissueseverity)
  - [YeetRunMode](#yeetrunmode)
  - [YeetRunOptions](#yeetrunoptions)
  - [YeetRunResult](#yeetrunresult)
---

# cli-commands

## yeetCommand

Yeet quality feedback and publish command.

**Signature**

```ts
declare const yeetCommand: Command<"yeet", {} | { readonly allowStaleBase: boolean; readonly amend: boolean; readonly fast: boolean; readonly message: string; readonly monitor: boolean; readonly noEdit: boolean; readonly pr: boolean; readonly pushOnly: boolean; readonly reuseVerified: boolean; readonly stagedOnly: boolean; readonly startPrEarly: boolean; readonly base: string; readonly head: string; readonly json: boolean; readonly packetDir: string; readonly plan: boolean; readonly tier: "full" | "review-fix"; }, {}, YeetCommandError, FileSystem | Path | ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L44)

Since v0.0.0

# errors

## "./Yeet.errors.js" (namespace export)

Re-exports all named exports from the "./Yeet.errors.js" module.

**Signature**

```ts
export * from "./Yeet.errors.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L51)

Since v0.0.0

# models

## PackageQualityReport

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const PackageQualityReport: typeof PackageQualityReport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L29)

Since v0.0.0

## QualityIssue

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const QualityIssue: typeof QualityIssue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L30)

Since v0.0.0

## QualityIssueAttribution

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const QualityIssueAttribution: AnnotatedSchema<LiteralKit<readonly ["introduced", "inherited-adjacent", "not-applicable"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L31)

Since v0.0.0

## QualityIssueCategory

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const QualityIssueCategory: AnnotatedSchema<LiteralKit<readonly ["typecheck", "effect-tsgo-policy", "docgen-jsdoc-quality", "repo-law", "schema-first-policy", "lint-tool", "test", "build", "changeset-policy", "repo-export-policy", "security-audit", "pr-review", "greptile-review", "bot-review", "command-failure", "parser-error", "unknown-raw"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L32)

Since v0.0.0

## QualityIssueConfidence

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const QualityIssueConfidence: AnnotatedSchema<LiteralKit<readonly ["structured", "partial", "raw"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L33)

Since v0.0.0

## QualityIssueIndex

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const QualityIssueIndex: typeof QualityIssueIndex
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L34)

Since v0.0.0

## QualityIssueRouting

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const QualityIssueRouting: typeof QualityIssueRouting
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L35)

Since v0.0.0

## QualityIssueSeverity

Yeet quality issue index models and parsers.

**Signature**

```ts
declare const QualityIssueSeverity: AnnotatedSchema<LiteralKit<readonly ["info", "warning", "error", "fatal"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L36)

Since v0.0.0

## YeetRunMode

Public yeet execution mode model.

**Signature**

```ts
declare const YeetRunMode: AnnotatedSchema<LiteralKit<readonly ["repair", "verify", "publish", "monitor", "closeout", "pre-push-hook"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L21)

Since v0.0.0

## YeetRunOptions

Public yeet run models.

**Signature**

```ts
declare const YeetRunOptions: typeof YeetRunOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L14)

Since v0.0.0

## YeetRunResult

Public yeet run models.

**Signature**

```ts
declare const YeetRunResult: typeof YeetRunResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/index.ts#L14)

Since v0.0.0
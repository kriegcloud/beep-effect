---
title: CauseDiagnostics.ts
nav_order: 1
parent: "@beep/observability"
---

## CauseDiagnostics.ts overview

Diagnostic utilities for inspecting, classifying, and summarizing Effect causes and exits.

Provides transport-safe schemas and pure functions for converting runtime
failure information into structured diagnostics suitable for logging,
metrics, and error reporting.

**Example**

```ts
```typescript
import { Cause } from "effect"
import { classifyCause, summarizeCause } from "@beep/observability"

const cause = Cause.fail(new Error("boom"))
const classification = classifyCause(cause)
const summary = summarizeCause(cause)

console.log(classification) // "failure"
console.log(summary.primaryMessage) // "boom"
```
```

Since v0.0.0

---
## Exports Grouped by Category
  - [fingerprintCause](#fingerprintcause)
  - [renderObservedCause](#renderobservedcause)
  - [summarizeCause](#summarizecause)
  - [summarizeExit](#summarizeexit)
- [models](#models)
  - [CauseClassification](#causeclassification)
  - [CauseClassification (type alias)](#causeclassification-type-alias)
  - [CauseFingerprint (class)](#causefingerprint-class)
  - [CauseSummary (type alias)](#causesummary-type-alias)
  - [ExitOutcome](#exitoutcome)
  - [ExitOutcome (type alias)](#exitoutcome-type-alias)
  - [ObservedExitSummary](#observedexitsummary)
  - [ObservedExitSummary (type alias)](#observedexitsummary-type-alias)
---

# diagnostics

## classifyCause

Classify a cause by its reason makeup into a single `CauseClassification` label.

Returns `"empty"` for empty causes, `"mixed"` when multiple reason kinds are
present, or the single kind (`"failure"`, `"defect"`, `"interrupted"`) otherwise.

**Example**

```ts
```typescript
import { Cause } from "effect"
import { classifyCause } from "@beep/observability"

console.log(classifyCause(Cause.empty)) // "empty"
console.log(classifyCause(Cause.fail("err"))) // "failure"
console.log(classifyCause(Cause.die("bug"))) // "defect"
```
```

**Signature**

```ts
declare const classifyCause: (cause: Cause.Cause<unknown>) => "empty" | "failure" | "defect" | "interrupted" | "mixed"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L403)

Since v0.0.0

## fingerprintCause

Generate a deterministic fingerprint for a cause.

The fingerprint combines the classification, reason tags, reason count,
and a truncated primary message chunk for grouping similar failures.

**Example**

```ts
```typescript
import { Cause } from "effect"
import { fingerprintCause } from "@beep/observability"

const fp = fingerprintCause(Cause.fail(new Error("connection refused")))
console.log(fp.value) // "failure:fail:1:error:connection refused"
```
```

**Signature**

```ts
declare const fingerprintCause: (cause: Cause.Cause<unknown>) => CauseFingerprint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L423)

Since v0.0.0

## renderObservedCause

Render a compact human-readable representation of a cause.

Combines the classification, fingerprint, and pretty-printed cause into
a single multiline string suitable for console or log output.

**Example**

```ts
```typescript
import { Cause } from "effect"
import { renderObservedCause } from "@beep/observability"

const rendered = renderObservedCause(Cause.fail(new Error("boom")))
console.log(rendered)
// [failure] failure:fail:1:error:boom
// Error: boom
// ...
```
```

**Signature**

```ts
declare const renderObservedCause: (cause: Cause.Cause<unknown>) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L551)

Since v0.0.0

## summarizeCause

Summarize a cause into a transport-safe `CauseSummary` with classification,
fingerprint, reason counts, primary message, and pretty-printed output.

**Example**

```ts
```typescript
import { Cause } from "effect"
import { summarizeCause } from "@beep/observability"

const summary = summarizeCause(Cause.fail(new Error("timeout")))

console.log(summary.classification) // "failure"
console.log(summary.errorCount) // 1
console.log(summary.primaryMessage) // "timeout"
```
```

**Signature**

```ts
declare const summarizeCause: (cause: Cause.Cause<unknown>) => CauseSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L447)

Since v0.0.0

## summarizeExit

Summarize an exit into a transport-safe `ObservedExitSummary`.

For successful exits the outcome is `"success"` with an empty classification.
For failed exits the cause is analyzed via `summarizeCause`.

**Example**

```ts
```typescript
import { Exit } from "effect"
import { summarizeExit } from "@beep/observability"

const ok = summarizeExit(Exit.succeed("done"))
console.log(ok.outcome) // "success"

const err = summarizeExit(Exit.fail(new Error("oops")))
console.log(err.outcome) // "failure"
```
```

**Signature**

```ts
declare const summarizeExit: <A, E>(exit: Exit.Exit<A, E>) => ObservedExitSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L495)

Since v0.0.0

# models

## CauseClassification

High-level classification for a full Effect cause.

One of `"empty"`, `"failure"`, `"defect"`, `"interrupted"`, or `"mixed"`.

**Example**

```ts
```typescript
import { Cause } from "effect"
import { classifyCause } from "@beep/observability"

console.log(classifyCause(Cause.empty)) // "empty"
console.log(classifyCause(Cause.fail("err"))) // "failure"
console.log(classifyCause(Cause.die("bug"))) // "defect"
```
```

**Signature**

```ts
declare const CauseClassification: AnnotatedSchema<LiteralKit<readonly ["empty", "failure", "defect", "interrupted", "mixed"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L56)

Since v0.0.0

## CauseClassification (type alias)

Runtime type for `CauseClassification`.

**Example**

```ts
```typescript
import type { CauseClassification } from "@beep/observability"

const classification: CauseClassification = "failure"
console.log(classification)
```
```

**Signature**

```ts
type CauseClassification = typeof CauseClassification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L76)

Since v0.0.0

## CauseFingerprint (class)

Deterministic string fingerprint for a cause, useful for deduplication and grouping.

**Example**

```ts
```typescript
import { CauseFingerprint } from "@beep/observability"

const fp = CauseFingerprint.make({ value: "failure:fail:1:error:boom" })
console.log(fp.value) // "failure:fail:1:error:boom"
```
```

**Signature**

```ts
declare class CauseFingerprint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L127)

Since v0.0.0

## CauseSummary (type alias)

Type of `CauseSummary`

**Example**

```ts
```typescript
import type { CauseSummary } from "@beep/observability"

const renderClassification = (summary: CauseSummary) => summary.classification
console.log(renderClassification)
```
```

**Signature**

```ts
type CauseSummary = typeof CauseSummary.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L192)

Since v0.0.0

## ExitOutcome

High-level classification for an exit: `"success"` or `"failure"`.

**Example**

```ts
```typescript
import { ExitOutcome } from "@beep/observability"

console.log(ExitOutcome)
```
```

**Signature**

```ts
declare const ExitOutcome: AnnotatedSchema<LiteralKit<readonly ["success", "failure"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L91)

Since v0.0.0

## ExitOutcome (type alias)

Runtime type for `ExitOutcome`.

**Example**

```ts
```typescript
import type { ExitOutcome } from "@beep/observability"

const outcome: ExitOutcome = "success"
console.log(outcome)
```
```

**Signature**

```ts
type ExitOutcome = typeof ExitOutcome.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L111)

Since v0.0.0

## ObservedExitSummary

Summary of an observed Effect exit including outcome classification and cause analysis.

**Example**

```ts
```typescript
import { ObservedExitSummary } from "@beep/observability"

console.log(ObservedExitSummary)
```
```

**Signature**

```ts
declare const ObservedExitSummary: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly classification: S.tag<"empty">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: AnnotatedSchema<LiteralKit<readonly ["success", "failure"], undefined>>; }> & { readonly Type: { readonly classification: "empty"; }; }, S.Struct<{ readonly classification: S.tag<"failure">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "failure"; }; }, S.Struct<{ readonly classification: S.tag<"defect">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "defect"; }; }, S.Struct<{ readonly classification: S.tag<"interrupted">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "interrupted"; }; }, S.Struct<{ readonly classification: S.tag<"mixed">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "mixed"; }; }]> & TaggedUnionUtils<"classification", readonly [S.Struct<{ readonly classification: S.tag<"empty">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: AnnotatedSchema<LiteralKit<readonly ["success", "failure"], undefined>>; }> & { readonly Type: { readonly classification: "empty"; }; }, S.Struct<{ readonly classification: S.tag<"failure">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "failure"; }; }, S.Struct<{ readonly classification: S.tag<"defect">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "defect"; }; }, S.Struct<{ readonly classification: S.tag<"interrupted">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "interrupted"; }; }, S.Struct<{ readonly classification: S.tag<"mixed">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "mixed"; }; }], [S.Struct<{ readonly classification: S.tag<"empty">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: AnnotatedSchema<LiteralKit<readonly ["success", "failure"], undefined>>; }> & { readonly Type: { readonly classification: "empty"; }; }, S.Struct<{ readonly classification: S.tag<"failure">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "failure"; }; }, S.Struct<{ readonly classification: S.tag<"defect">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "defect"; }; }, S.Struct<{ readonly classification: S.tag<"interrupted">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "interrupted"; }; }, S.Struct<{ readonly classification: S.tag<"mixed">; readonly fingerprint: typeof CauseFingerprint; readonly interrupted: S.Boolean; readonly reasonCount: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly primaryMessage: S.String; readonly outcome: S.tag<"failure">; }> & { readonly Type: { readonly classification: "mixed"; }; }]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L256)

Since v0.0.0

## ObservedExitSummary (type alias)

Type of `ObservedExitSummary`

**Example**

```ts
```typescript
import type { ObservedExitSummary } from "@beep/observability"

const renderOutcome = (summary: ObservedExitSummary) => summary.outcome
console.log(renderOutcome)
```
```

**Signature**

```ts
type ObservedExitSummary = typeof ObservedExitSummary.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/CauseDiagnostics.ts#L276)

Since v0.0.0
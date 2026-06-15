---
title: models.ts
nav_order: 11
parent: "@beep/repo-ai-metrics"
---

## models.ts overview

Schema-first AI metrics data models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AgentSession (class)](#agentsession-class)
  - [AgentTask (class)](#agenttask-class)
  - [AgentTurn (class)](#agentturn-class)
  - [AiMetricsDeployTarget](#aimetricsdeploytarget)
  - [AiMetricsDeployTarget (type alias)](#aimetricsdeploytarget-type-alias)
  - [AiMetricsOtlpEndpointSpec (class)](#aimetricsotlpendpointspec-class)
  - [AiMetricsOtlpProtocol](#aimetricsotlpprotocol)
  - [AiMetricsOtlpProtocol (type alias)](#aimetricsotlpprotocol-type-alias)
  - [AiMetricsOtlpSignalScope](#aimetricsotlpsignalscope)
  - [AiMetricsOtlpSignalScope (type alias)](#aimetricsotlpsignalscope-type-alias)
  - [AiMetricsPrivacyMode](#aimetricsprivacymode)
  - [AiMetricsPrivacyMode (type alias)](#aimetricsprivacymode-type-alias)
  - [AiMetricsQualityGateStatus](#aimetricsqualitygatestatus)
  - [AiMetricsQualityGateStatus (type alias)](#aimetricsqualitygatestatus-type-alias)
  - [AiMetricsScoreWeights (class)](#aimetricsscoreweights-class)
  - [AiMetricsSourceAttribution (class)](#aimetricssourceattribution-class)
  - [AiMetricsSourceRole](#aimetricssourcerole)
  - [AiMetricsSourceRole (type alias)](#aimetricssourcerole-type-alias)
  - [AiMetricsTool](#aimetricstool)
  - [AiMetricsTool (type alias)](#aimetricstool-type-alias)
  - [AiMetricsTranscriptSource](#aimetricstranscriptsource)
  - [AiMetricsTranscriptSource (type alias)](#aimetricstranscriptsource-type-alias)
  - [BenchmarkCase (class)](#benchmarkcase-class)
  - [BenchmarkRun (class)](#benchmarkrun-class)
  - [ClaudeTranscriptLine (class)](#claudetranscriptline-class)
  - [CodexTranscriptLine (class)](#codextranscriptline-class)
  - [ConfigSnapshot (class)](#configsnapshot-class)
  - [ModelCall (class)](#modelcall-class)
  - [OpenClawTranscriptLine (class)](#openclawtranscriptline-class)
  - [OutcomeLabel (class)](#outcomelabel-class)
  - [Scorecard (class)](#scorecard-class)
  - [ToolInvocation (class)](#toolinvocation-class)
  - [TranscriptIngestSummary (class)](#transcriptingestsummary-class)
---

# models

## AgentSession (class)

Session-level transcript metadata under an agent task.

**Example**

```ts
import { AgentSession } from "@beep/repo-ai-metrics"
console.log(AgentSession)
```

**Signature**

```ts
declare class AgentSession
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L411)

Since v0.0.0

## AgentTask (class)

Canonical unit of analysis for coding-agent metrics.

**Example**

```ts
import { AgentTask } from "@beep/repo-ai-metrics"
console.log(AgentTask)
```

**Signature**

```ts
declare class AgentTask
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L379)

Since v0.0.0

## AgentTurn (class)

Turn-level transcript event normalized from local agent logs.

**Example**

```ts
import { AgentTurn } from "@beep/repo-ai-metrics"
console.log(AgentTurn)
```

**Signature**

```ts
declare class AgentTurn
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L447)

Since v0.0.0

## AiMetricsDeployTarget

Supported deployment targets for the AI metrics stack.

**Example**

```ts
import { AiMetricsDeployTarget } from "@beep/repo-ai-metrics"
console.log(AiMetricsDeployTarget.Enum.dankserver)
```

**Signature**

```ts
declare const AiMetricsDeployTarget: AnnotatedSchema<LiteralKit<readonly ["local", "dankserver"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L26)

Since v0.0.0

## AiMetricsDeployTarget (type alias)

Runtime type for `AiMetricsDeployTarget`.

**Example**

```ts
import type { AiMetricsDeployTarget } from "@beep/repo-ai-metrics"
const target: AiMetricsDeployTarget = "local"
console.log(target)
```

**Signature**

```ts
type AiMetricsDeployTarget = typeof AiMetricsDeployTarget.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L44)

Since v0.0.0

## AiMetricsOtlpEndpointSpec (class)

Install-owned OTLP endpoint contract consumed by CLI, local smoke, and IaC.

**Example**

```ts
import { AiMetricsOtlpEndpointSpec } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpEndpointSpec)
```

**Signature**

```ts
declare class AiMetricsOtlpEndpointSpec
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L301)

Since v0.0.0

## AiMetricsOtlpProtocol

OTLP protocol variants supported by the P3 AI metrics backend contract.

**Example**

```ts
import { AiMetricsOtlpProtocol } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpProtocol.Enum["http/protobuf"])
```

**Signature**

```ts
declare const AiMetricsOtlpProtocol: AnnotatedSchema<LiteralKit<readonly ["http/protobuf"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L208)

Since v0.0.0

## AiMetricsOtlpProtocol (type alias)

Runtime type for `AiMetricsOtlpProtocol`.

**Example**

```ts
import type { AiMetricsOtlpProtocol } from "@beep/repo-ai-metrics"
const protocol: AiMetricsOtlpProtocol = "http/protobuf"
console.log(protocol)
```

**Signature**

```ts
type AiMetricsOtlpProtocol = typeof AiMetricsOtlpProtocol.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L226)

Since v0.0.0

## AiMetricsOtlpSignalScope

Telemetry signal scope exported to the P3 Phoenix backend.

**Example**

```ts
import { AiMetricsOtlpSignalScope } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpSignalScope.Enum.traces_only)
```

**Signature**

```ts
declare const AiMetricsOtlpSignalScope: AnnotatedSchema<LiteralKit<readonly ["traces_only"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L239)

Since v0.0.0

## AiMetricsOtlpSignalScope (type alias)

Runtime type for `AiMetricsOtlpSignalScope`.

**Example**

```ts
import type { AiMetricsOtlpSignalScope } from "@beep/repo-ai-metrics"
const scope: AiMetricsOtlpSignalScope = "traces_only"
console.log(scope)
```

**Signature**

```ts
type AiMetricsOtlpSignalScope = typeof AiMetricsOtlpSignalScope.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L257)

Since v0.0.0

## AiMetricsPrivacyMode

Raw transcript retention and derived-dashboard privacy posture.

**Example**

```ts
import { AiMetricsPrivacyMode } from "@beep/repo-ai-metrics"
console.log(AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui)
```

**Signature**

```ts
declare const AiMetricsPrivacyMode: AnnotatedSchema<LiteralKit<readonly ["encrypted_raw_redacted_ui", "raw_tailnet_ui", "redacted_only"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L177)

Since v0.0.0

## AiMetricsPrivacyMode (type alias)

Runtime type for `AiMetricsPrivacyMode`.

**Example**

```ts
import type { AiMetricsPrivacyMode } from "@beep/repo-ai-metrics"
const mode: AiMetricsPrivacyMode = "encrypted_raw_redacted_ui"
console.log(mode)
```

**Signature**

```ts
type AiMetricsPrivacyMode = typeof AiMetricsPrivacyMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L195)

Since v0.0.0

## AiMetricsQualityGateStatus

Quality-gate outcome recorded for a labeled task or benchmark run.

**Example**

```ts
import { AiMetricsQualityGateStatus } from "@beep/repo-ai-metrics"
console.log(AiMetricsQualityGateStatus.Enum.passed)
```

**Signature**

```ts
declare const AiMetricsQualityGateStatus: AnnotatedSchema<LiteralKit<readonly ["passed", "failed", "not_run", "unknown"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L270)

Since v0.0.0

## AiMetricsQualityGateStatus (type alias)

Runtime type for `AiMetricsQualityGateStatus`.

**Example**

```ts
import type { AiMetricsQualityGateStatus } from "@beep/repo-ai-metrics"
const status: AiMetricsQualityGateStatus = "passed"
console.log(status)
```

**Signature**

```ts
type AiMetricsQualityGateStatus = typeof AiMetricsQualityGateStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L288)

Since v0.0.0

## AiMetricsScoreWeights (class)

Outcome-heavy scorecard weights for coding-agent performance.

**Example**

```ts
import { AiMetricsScoreWeights } from "@beep/repo-ai-metrics"
console.log(AiMetricsScoreWeights.make({}).outcome)
```

**Signature**

```ts
declare class AiMetricsScoreWeights
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L325)

Since v0.0.0

## AiMetricsSourceAttribution (class)

Privacy-preserving source attribution derived from transcript metadata.

**Example**

```ts
import { AiMetricsSourceAttribution } from "@beep/repo-ai-metrics"
console.log(AiMetricsSourceAttribution.make({ sourceRole: "primary" }).sourceRole)
```

**Signature**

```ts
declare class AiMetricsSourceAttribution
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L150)

Since v0.0.0

## AiMetricsSourceRole

Role of a discovered source file within the source's local storage.

**Example**

```ts
import { AiMetricsSourceRole } from "@beep/repo-ai-metrics"
console.log(AiMetricsSourceRole.Enum.primary)
```

**Signature**

```ts
declare const AiMetricsSourceRole: AnnotatedSchema<LiteralKit<readonly ["primary", "subagent", "gateway_metadata"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L119)

Since v0.0.0

## AiMetricsSourceRole (type alias)

Runtime type for `AiMetricsSourceRole`.

**Example**

```ts
import type { AiMetricsSourceRole } from "@beep/repo-ai-metrics"
const role: AiMetricsSourceRole = "primary"
console.log(role)
```

**Signature**

```ts
type AiMetricsSourceRole = typeof AiMetricsSourceRole.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L137)

Since v0.0.0

## AiMetricsTool

Candidate LLM-observability tool identifiers used in the bakeoff.

**Example**

```ts
import { AiMetricsTool } from "@beep/repo-ai-metrics"
console.log(AiMetricsTool.Enum.langfuse)
```

**Signature**

```ts
declare const AiMetricsTool: AnnotatedSchema<LiteralKit<readonly ["langfuse", "phoenix", "opik", "posthog"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L57)

Since v0.0.0

## AiMetricsTool (type alias)

Runtime type for `AiMetricsTool`.

**Example**

```ts
import type { AiMetricsTool } from "@beep/repo-ai-metrics"
const tool: AiMetricsTool = "phoenix"
console.log(tool)
```

**Signature**

```ts
type AiMetricsTool = typeof AiMetricsTool.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L75)

Since v0.0.0

## AiMetricsTranscriptSource

Transcript source kind normalized by the ingest layer.

**Example**

```ts
import { AiMetricsTranscriptSource } from "@beep/repo-ai-metrics"
console.log(AiMetricsTranscriptSource.Enum.codex)
```

**Signature**

```ts
declare const AiMetricsTranscriptSource: AnnotatedSchema<LiteralKit<readonly ["codex", "claude", "openclaw"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L88)

Since v0.0.0

## AiMetricsTranscriptSource (type alias)

Runtime type for `AiMetricsTranscriptSource`.

**Example**

```ts
import type { AiMetricsTranscriptSource } from "@beep/repo-ai-metrics"
const source: AiMetricsTranscriptSource = "codex"
console.log(source)
```

**Signature**

```ts
type AiMetricsTranscriptSource = typeof AiMetricsTranscriptSource.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L106)

Since v0.0.0

## BenchmarkCase (class)

Repeatable benchmark case for comparing agent configurations.

**Example**

```ts
import { BenchmarkCase } from "@beep/repo-ai-metrics"
console.log(BenchmarkCase)
```

**Signature**

```ts
declare class BenchmarkCase
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L550)

Since v0.0.0

## BenchmarkRun (class)

Benchmark run result under one config snapshot.

**Example**

```ts
import { BenchmarkRun } from "@beep/repo-ai-metrics"
console.log(BenchmarkRun)
```

**Signature**

```ts
declare class BenchmarkRun
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L574)

Since v0.0.0

## ClaudeTranscriptLine (class)

Minimal external Claude JSONL shape.

**Example**

```ts
import { ClaudeTranscriptLine } from "@beep/repo-ai-metrics"
const line = ClaudeTranscriptLine.make({ type: "message" })
console.log(line.type)
```

**Signature**

```ts
declare class ClaudeTranscriptLine
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L688)

Since v0.0.0

## CodexTranscriptLine (class)

Minimal external Codex JSONL shape.

**Example**

```ts
import { CodexTranscriptLine } from "@beep/repo-ai-metrics"
const line = CodexTranscriptLine.make({ type: "session_meta" })
console.log(line.type)
```

**Signature**

```ts
declare class CodexTranscriptLine
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L665)

Since v0.0.0

## ConfigSnapshot (class)

Versioned snapshot of agent-facing repository configuration.

**Example**

```ts
import { ConfigSnapshot } from "@beep/repo-ai-metrics"
console.log(ConfigSnapshot)
```

**Signature**

```ts
declare class ConfigSnapshot
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L350)

Since v0.0.0

## ModelCall (class)

Model or provider call measured under an agent task.

**Example**

```ts
import { ModelCall } from "@beep/repo-ai-metrics"
console.log(ModelCall)
```

**Signature**

```ts
declare class ModelCall
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L475)

Since v0.0.0

## OpenClawTranscriptLine (class)

Minimal external OpenClaw JSONL shape.

**Example**

```ts
import { OpenClawTranscriptLine } from "@beep/repo-ai-metrics"
const line = OpenClawTranscriptLine.make({ event: "gateway_metadata" })
console.log(line.event)
```

**Signature**

```ts
declare class OpenClawTranscriptLine
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L713)

Since v0.0.0

## OutcomeLabel (class)

Human label used by the weekly outcome-heavy scorecard.

**Example**

```ts
import { OutcomeLabel } from "@beep/repo-ai-metrics"
console.log(OutcomeLabel)
```

**Signature**

```ts
declare class OutcomeLabel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L522)

Since v0.0.0

## Scorecard (class)

Derived scorecard for weekly or config-impact review.

**Example**

```ts
import { Scorecard } from "@beep/repo-ai-metrics"
console.log(Scorecard)
```

**Signature**

```ts
declare class Scorecard
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L601)

Since v0.0.0

## ToolInvocation (class)

Tool or shell command invocation measured under an agent task.

**Example**

```ts
import { ToolInvocation } from "@beep/repo-ai-metrics"
console.log(ToolInvocation)
```

**Signature**

```ts
declare class ToolInvocation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L499)

Since v0.0.0

## TranscriptIngestSummary (class)

Summary produced by transcript ingestion.

**Example**

```ts
import { TranscriptIngestSummary } from "@beep/repo-ai-metrics"
console.log(TranscriptIngestSummary)
```

**Signature**

```ts
declare class TranscriptIngestSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/models.ts#L637)

Since v0.0.0
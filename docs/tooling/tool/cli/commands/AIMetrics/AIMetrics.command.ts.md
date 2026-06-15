---
title: AIMetrics.command.ts
nav_order: 5
parent: "@beep/repo-cli"
---

## AIMetrics.command.ts overview

AI metrics command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [commands](#commands)
  - [aiMetricsCommand](#aimetricscommand)
---

# commands

## aiMetricsCommand

AI metrics root command.

**Example**

```ts
import { aiMetricsCommand } from "@beep/repo-cli/commands/AIMetrics/index"
console.log(aiMetricsCommand)
```

**Signature**

```ts
declare const aiMetricsCommand: Command.Command<"ai-metrics", {} | {}, {}, AiMetricsArchiveError | AiMetricsCommandError | AiMetricsConfigSnapshotError | AiMetricsForwarderError | AiMetricsIngestError | AiMetricsInstallConfigurationError | AiMetricsMirrorError | AiMetricsOtlpExportError | AiMetricsPrivacyError | AiMetricsRetentionError | AiMetricsScorecardError | AiMetricsSourceDiscoveryError | AiMetricsStatusExit, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/AIMetrics/AIMetrics.command.ts#L3580)

Since v0.0.0
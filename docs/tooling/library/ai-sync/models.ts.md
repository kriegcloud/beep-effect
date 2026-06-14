---
title: models.ts
nav_order: 6
parent: "@beep/ai-sync"
---

## models.ts overview

Schema-first models for AI agent configuration sync and validation.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiSyncError (class)](#aisyncerror-class)
- [models](#models)
  - [AiSyncAgentId](#aisyncagentid)
  - [AiSyncAgentId (type alias)](#aisyncagentid-type-alias)
  - [AiSyncDomainId](#aisyncdomainid)
  - [AiSyncDomainId (type alias)](#aisyncdomainid-type-alias)
  - [AiSyncDriftFinding (class)](#aisyncdriftfinding-class)
  - [AiSyncDriftMechanism](#aisyncdriftmechanism)
  - [AiSyncDriftMechanism (type alias)](#aisyncdriftmechanism-type-alias)
  - [AiSyncDriftReport (class)](#aisyncdriftreport-class)
  - [AiSyncSchemaCell (class)](#aisyncschemacell-class)
  - [AiSyncSourceMetadata (class)](#aisyncsourcemetadata-class)
  - [AiSyncSourceTier](#aisyncsourcetier)
  - [AiSyncSourceTier (type alias)](#aisyncsourcetier-type-alias)
  - [AiSyncSupportStatus](#aisyncsupportstatus)
  - [AiSyncSupportStatus (type alias)](#aisyncsupportstatus-type-alias)
  - [AiSyncTransformEvidence (class)](#aisynctransformevidence-class)
  - [AiSyncTransformStatus](#aisynctransformstatus)
  - [AiSyncTransformStatus (type alias)](#aisynctransformstatus-type-alias)
- [validation](#validation)
  - [AiSyncValidationResult (class)](#aisyncvalidationresult-class)
---

# errors

## AiSyncError (class)

Typed AI sync operational error.

**Example**

```ts
import { AiSyncError } from "@beep/ai-sync"
const error = AiSyncError.make({ message: "Validation failed" })
console.log(error._tag)
```

**Signature**

```ts
declare class AiSyncError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L417)

Since v0.0.0

# models

## AiSyncAgentId

V1 agent identifiers.

**Example**

```ts
import { AiSyncAgentId } from "@beep/ai-sync"
console.log(AiSyncAgentId.Enum.codex)
```

**Signature**

```ts
declare const AiSyncAgentId: AnnotatedSchema<LiteralKit<readonly ["claude-code", "codex", "grok-build", "jetbrains-ai-assistant", "junie", "mcp", "acp", "rulesync"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L25)

Since v0.0.0

## AiSyncAgentId (type alias)

Runtime type for `AiSyncAgentId`.

**Example**

```ts
import type { AiSyncAgentId } from "@beep/ai-sync"
const agent: AiSyncAgentId = "codex"
console.log(agent)
```

**Signature**

```ts
type AiSyncAgentId = typeof AiSyncAgentId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L52)

Since v0.0.0

## AiSyncDomainId

V1 configuration domains.

**Example**

```ts
import { AiSyncDomainId } from "@beep/ai-sync"
console.log(AiSyncDomainId.Enum["mcp-servers"])
```

**Signature**

```ts
declare const AiSyncDomainId: AnnotatedSchema<LiteralKit<readonly ["skills", "rules", "commands", "hooks", "plugins", "mcp-servers", "config", "settings", "plugin-manifest", "marketplace", "protocol", "unified-config"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L65)

Since v0.0.0

## AiSyncDomainId (type alias)

Runtime type for `AiSyncDomainId`.

**Example**

```ts
import type { AiSyncDomainId } from "@beep/ai-sync"
const domain: AiSyncDomainId = "skills"
console.log(domain)
```

**Signature**

```ts
type AiSyncDomainId = typeof AiSyncDomainId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L96)

Since v0.0.0

## AiSyncDriftFinding (class)

Drift difference for one upstream source.

**Example**

```ts
import { AiSyncDriftFinding } from "@beep/ai-sync"
const finding = AiSyncDriftFinding.make({
  sourceId: "codex-config",
  expectedHash: "old",
  actualHash: "new",
  message: "Source moved"
})
console.log(finding.sourceId)
```

**Signature**

```ts
declare class AiSyncDriftFinding
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L313)

Since v0.0.0

## AiSyncDriftMechanism

Drift check strategy for a source.

**Example**

```ts
import { AiSyncDriftMechanism } from "@beep/ai-sync"
console.log(AiSyncDriftMechanism.Enum.hash)
```

**Signature**

```ts
declare const AiSyncDriftMechanism: AnnotatedSchema<LiteralKit<readonly ["version", "hash", "version_and_hash", "semantic_field_diff", "content_hash", "release_redirect"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L171)

Since v0.0.0

## AiSyncDriftMechanism (type alias)

Runtime type for `AiSyncDriftMechanism`.

**Example**

```ts
import type { AiSyncDriftMechanism } from "@beep/ai-sync"
const mechanism: AiSyncDriftMechanism = "hash"
console.log(mechanism)
```

**Signature**

```ts
type AiSyncDriftMechanism = typeof AiSyncDriftMechanism.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L196)

Since v0.0.0

## AiSyncDriftReport (class)

Drift check report.

**Example**

```ts
import { AiSyncDriftReport } from "@beep/ai-sync"
const report = AiSyncDriftReport.make({ mode: "local", findings: [] })
console.log(report.findings.length)
```

**Signature**

```ts
declare class AiSyncDriftReport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L337)

Since v0.0.0

## AiSyncSchemaCell (class)

Support matrix cell.

**Example**

```ts
import { AiSyncSchemaCell } from "@beep/ai-sync"
const cell = AiSyncSchemaCell.make({
  agent: "codex",
  domain: "config",
  status: "supported",
  rationale: "Codex publishes a JSON schema."
})
console.log(cell.status)
```

**Signature**

```ts
declare class AiSyncSchemaCell
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L283)

Since v0.0.0

## AiSyncSourceMetadata (class)

Metadata for one upstream source.

**Example**

```ts
import { AiSyncSourceMetadata } from "@beep/ai-sync"
const source = AiSyncSourceMetadata.make({
  id: "codex-config",
  agent: "codex",
  domain: "config",
  tier: "tier_1",
  url: "https://example.com/schema.json",
  isOfficial: true,
  driftMechanism: "hash"
})
console.log(source.id)
```

**Signature**

```ts
declare class AiSyncSourceMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L249)

Since v0.0.0

## AiSyncSourceTier

Source evidence tiers.

**Example**

```ts
import { AiSyncSourceTier } from "@beep/ai-sync"
console.log(AiSyncSourceTier.Enum.tier_1)
```

**Signature**

```ts
declare const AiSyncSourceTier: AnnotatedSchema<LiteralKit<readonly ["tier_1", "tier_2", "tier_3", "tier_4"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L109)

Since v0.0.0

## AiSyncSourceTier (type alias)

Runtime type for `AiSyncSourceTier`.

**Example**

```ts
import type { AiSyncSourceTier } from "@beep/ai-sync"
const tier: AiSyncSourceTier = "tier_1"
console.log(tier)
```

**Signature**

```ts
type AiSyncSourceTier = typeof AiSyncSourceTier.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L127)

Since v0.0.0

## AiSyncSupportStatus

Support state for an agent/domain cell.

**Example**

```ts
import { AiSyncSupportStatus } from "@beep/ai-sync"
console.log(AiSyncSupportStatus.Enum.unknown_schema)
```

**Signature**

```ts
declare const AiSyncSupportStatus: AnnotatedSchema<LiteralKit<readonly ["supported", "na", "unknown_schema"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L140)

Since v0.0.0

## AiSyncSupportStatus (type alias)

Runtime type for `AiSyncSupportStatus`.

**Example**

```ts
import type { AiSyncSupportStatus } from "@beep/ai-sync"
const status: AiSyncSupportStatus = "supported"
console.log(status)
```

**Signature**

```ts
type AiSyncSupportStatus = typeof AiSyncSupportStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L158)

Since v0.0.0

## AiSyncTransformEvidence (class)

Transform proof metadata.

**Example**

```ts
import { AiSyncTransformEvidence } from "@beep/ai-sync"
const evidence = AiSyncTransformEvidence.make({
  id: "codex-mcp-to-claude-mcp",
  status: "lossless",
  sourceAgent: "codex",
  targetAgent: "claude-code",
  domain: "mcp-servers",
  rationale: "Both shapes preserve command, args, env, and url."
})
console.log(evidence.status)
```

**Signature**

```ts
declare class AiSyncTransformEvidence
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L366)

Since v0.0.0

## AiSyncTransformStatus

Transform proof status.

**Example**

```ts
import { AiSyncTransformStatus } from "@beep/ai-sync"
console.log(AiSyncTransformStatus.Enum.lossless)
```

**Signature**

```ts
declare const AiSyncTransformStatus: AnnotatedSchema<LiteralKit<readonly ["lossless", "lossy", "declined"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L209)

Since v0.0.0

## AiSyncTransformStatus (type alias)

Runtime type for `AiSyncTransformStatus`.

**Example**

```ts
import type { AiSyncTransformStatus } from "@beep/ai-sync"
const status: AiSyncTransformStatus = "lossless"
console.log(status)
```

**Signature**

```ts
type AiSyncTransformStatus = typeof AiSyncTransformStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L227)

Since v0.0.0

# validation

## AiSyncValidationResult (class)

Validation success record for a repo-local config file.

**Example**

```ts
import { AiSyncValidationResult } from "@beep/ai-sync"
const result = AiSyncValidationResult.make({
  relativePath: ".codex/config.toml",
  schemaId: "codex-config"
})
console.log(result.relativePath)
```

**Signature**

```ts
declare class AiSyncValidationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/models.ts#L395)

Since v0.0.0
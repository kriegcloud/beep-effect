---
title: provenance.ts
nav_order: 21
parent: "@beep/semantic-web"
---

## provenance.ts overview

Provenance projection and export service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [ProvenanceServiceError (class)](#provenanceserviceerror-class)
- [layers](#layers)
  - [ProvenanceServiceLive](#provenanceservicelive)
- [models](#models)
  - [BoundedProvenanceProjection (class)](#boundedprovenanceprojection-class)
  - [ExportProvenanceRequest (class)](#exportprovenancerequest-class)
  - [ProjectProvenanceRequest (class)](#projectprovenancerequest-class)
  - [ProvenanceExportProfile](#provenanceexportprofile)
  - [ProvenanceService (class)](#provenanceservice-class)
  - [ProvenanceServiceShape (interface)](#provenanceserviceshape-interface)
  - [ProvenanceSummary (class)](#provenancesummary-class)
  - [SummarizeProvenanceRequest (class)](#summarizeprovenancerequest-class)
---

# error-handling

## ProvenanceServiceError (class)

Typed provenance service error.

**Example**

```ts
import { ProvenanceServiceError } from "@beep/semantic-web/services/provenance"

console.log(ProvenanceServiceError)
```

**Signature**

```ts
declare class ProvenanceServiceError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L213)

Since v0.0.0

# layers

## ProvenanceServiceLive

Live provenance service implementation for bounded projection and summary work.

**Example**

```ts
import { ProvenanceServiceLive } from "@beep/semantic-web/services/provenance"

console.log(ProvenanceServiceLive)
```

**Signature**

```ts
declare const ProvenanceServiceLive: Layer.Layer<ProvenanceService, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L353)

Since v0.0.0

# models

## BoundedProvenanceProjection (class)

Bounded provenance projection result.

**Example**

```ts
import { BoundedProvenanceProjection } from "@beep/semantic-web/services/provenance"

console.log(BoundedProvenanceProjection)
```

**Signature**

```ts
declare class BoundedProvenanceProjection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L158)

Since v0.0.0

## ExportProvenanceRequest (class)

Provenance export request.

**Example**

```ts
import { ExportProvenanceRequest } from "@beep/semantic-web/services/provenance"

console.log(ExportProvenanceRequest)
```

**Signature**

```ts
declare class ExportProvenanceRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L132)

Since v0.0.0

## ProjectProvenanceRequest (class)

Provenance projection request.

**Example**

```ts
import { ProjectProvenanceRequest } from "@beep/semantic-web/services/provenance"

console.log(ProjectProvenanceRequest)
```

**Signature**

```ts
declare class ProjectProvenanceRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L83)

Since v0.0.0

## ProvenanceExportProfile

Provenance export profile.

**Example**

```ts
import { ProvenanceExportProfile } from "@beep/semantic-web/services/provenance"

console.log(ProvenanceExportProfile)
```

**Signature**

```ts
declare const ProvenanceExportProfile: AnnotatedSchema<LiteralKit<readonly ["prov-core-v1", "prov-core-extensions-v1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L64)

Since v0.0.0

## ProvenanceService (class)

Provenance service tag.

**Example**

```ts
import { ProvenanceService } from "@beep/semantic-web/services/provenance"

console.log(ProvenanceService)
```

**Signature**

```ts
declare class ProvenanceService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L262)

Since v0.0.0

## ProvenanceServiceShape (interface)

Provenance service contract shape.

**Example**

```ts
import type { ProvenanceServiceShape } from "@beep/semantic-web/services/provenance"

const acceptProvenanceServiceShape = (value: ProvenanceServiceShape) => value
console.log(acceptProvenanceServiceShape)
```

**Signature**

```ts
export interface ProvenanceServiceShape {
  readonly exportBundle: (
    request: ExportProvenanceRequest
  ) => Effect.Effect<BoundedProvenanceProjection, ProvenanceServiceError>;
  readonly project: (
    request: ProjectProvenanceRequest
  ) => Effect.Effect<BoundedProvenanceProjection, ProvenanceServiceError>;
  readonly summarize: (request: SummarizeProvenanceRequest) => Effect.Effect<ProvenanceSummary, ProvenanceServiceError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L239)

Since v0.0.0

## ProvenanceSummary (class)

Provenance summary result.

**Example**

```ts
import { ProvenanceSummary } from "@beep/semantic-web/services/provenance"

console.log(ProvenanceSummary)
```

**Signature**

```ts
declare class ProvenanceSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L186)

Since v0.0.0

## SummarizeProvenanceRequest (class)

Provenance summary request.

**Example**

```ts
import { SummarizeProvenanceRequest } from "@beep/semantic-web/services/provenance"

console.log(SummarizeProvenanceRequest)
```

**Signature**

```ts
declare class SummarizeProvenanceRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/provenance.ts#L108)

Since v0.0.0
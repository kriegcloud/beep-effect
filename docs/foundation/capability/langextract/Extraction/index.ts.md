---
title: index.ts
nav_order: 2
parent: "@beep/langextract"
---

## index.ts overview

Extraction models, parser contracts, and typed boundary errors.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [LangExtractError (class)](#langextracterror-class)
  - [LangExtractErrorReason](#langextracterrorreason)
  - [LangExtractErrorReason (type alias)](#langextracterrorreason-type-alias)
- [models](#models)
  - [AlignmentStatus (type alias)](#alignmentstatus-type-alias)
  - [ExtractionCandidate (class)](#extractioncandidate-class)
  - [GroundedExtraction (class)](#groundedextraction-class)
  - [LangExtractDiagnostics (class)](#langextractdiagnostics-class)
  - [LangExtractOptions (class)](#langextractoptions-class)
  - [LangExtractRequest (class)](#langextractrequest-class)
  - [LangExtractResult (class)](#langextractresult-class)
- [parsing](#parsing)
  - [parseModelOutput](#parsemodeloutput)
- [schemas](#schemas)
  - [AlignmentStatus](#alignmentstatus)
---

# errors

## LangExtractError (class)

Sanitized LangExtract capability error.

**Example**

```ts
import { LangExtractError } from "@beep/langextract/Extraction"

console.log(LangExtractError.fromReason("alignment-failed", { message: "Could not align output." }))
```

**Signature**

```ts
declare class LangExtractError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L66)

Since v0.0.0

## LangExtractErrorReason

Machine-readable LangExtract failure reasons.

**Example**

```ts
import { LangExtractErrorReason } from "@beep/langextract/Extraction"

console.log(LangExtractErrorReason.is["alignment-failed"]("alignment-failed"))
```

**Signature**

```ts
declare const LangExtractErrorReason: AnnotatedSchema<LiteralKit<readonly ["model-generation-failed", "model-generation-timeout", "model-output-parse-failed", "model-output-schema-invalid", "alignment-failed", "handoff-failed"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L32)

Since v0.0.0

## LangExtractErrorReason (type alias)

Type for `LangExtractErrorReason`.

**Signature**

```ts
type LangExtractErrorReason = typeof LangExtractErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L51)

Since v0.0.0

# models

## AlignmentStatus (type alias)

Type for `AlignmentStatus`.

**Signature**

```ts
type AlignmentStatus = typeof AlignmentStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L117)

Since v0.0.0

## ExtractionCandidate (class)

Candidate extraction decoded from model output before source alignment.

**Example**

```ts
import { ExtractionCandidate } from "@beep/langextract/Extraction"

console.log(ExtractionCandidate.make({ label: "person", text: "Ada Lovelace", confidence: 0.98 }))
```

**Signature**

```ts
declare class ExtractionCandidate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L156)

Since v0.0.0

## GroundedExtraction (class)

Extraction after deterministic source alignment.

**Example**

```ts
import { GroundedExtraction } from "@beep/langextract/Extraction"
import { Contract } from "@beep/nlp/Handoff"
import { NonNegativeInt } from "@beep/schema"

const span = Contract.Span.make({ start: NonNegativeInt.make(0), end: NonNegativeInt.make(12) })
console.log(GroundedExtraction.make({ alignmentStatus: "match_exact", label: "person", span, text: "Ada Lovelace" }))
```

**Signature**

```ts
declare class GroundedExtraction
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L184)

Since v0.0.0

## LangExtractDiagnostics (class)

Counts emitted with a completed extraction result.

**Example**

```ts
import { LangExtractDiagnostics } from "@beep/langextract/Extraction"
import { NonNegativeInt } from "@beep/schema"

console.log(LangExtractDiagnostics.make({
  alignedCount: NonNegativeInt.make(1),
  candidateCount: NonNegativeInt.make(1),
  promptChars: NonNegativeInt.make(120),
  unalignedCount: NonNegativeInt.make(0)
}))
```

**Signature**

```ts
declare class LangExtractDiagnostics
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L250)

Since v0.0.0

## LangExtractOptions (class)

Options controlling provider-neutral extraction and alignment.

**Example**

```ts
import { LangExtractOptions } from "@beep/langextract/Extraction"
import { NonNegativeInt } from "@beep/schema"

console.log(LangExtractOptions.make({ fuzzyThreshold: 0.9, maxExtractions: NonNegativeInt.make(5) }))
```

**Signature**

```ts
declare class LangExtractOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L133)

Since v0.0.0

## LangExtractRequest (class)

Provider-neutral extraction request.

**Example**

```ts
import { LangExtractRequest } from "@beep/langextract/Extraction"
import { ExtractionTarget } from "@beep/langextract/Target"
import { DocumentId } from "@beep/nlp/Core"

console.log(LangExtractRequest.make({
  documentId: DocumentId.make("doc-1"),
  targets: [ExtractionTarget.make({ kind: "entity", name: "person" })],
  text: "Ada Lovelace wrote notes."
}))
```

**Signature**

```ts
declare class LangExtractRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L218)

Since v0.0.0

## LangExtractResult (class)

Provider-neutral extraction result plus NLP handoff document.

**Example**

```ts
import { LangExtractDiagnostics, LangExtractResult } from "@beep/langextract/Extraction"
import { Contract } from "@beep/nlp/Handoff"
import { DocumentId } from "@beep/nlp/Core"
import { NonNegativeInt } from "@beep/schema"

const provenance = Contract.Provenance.make({ generatedBy: "@beep/langextract", source: "doc-1", timestamp: 0 })
const annotatedDocument = Contract.AnnotatedDocument.make({
  chunks: [],
  entities: [],
  provenance,
  relations: [],
  version: "nlp-ir/1.0"
})
console.log(LangExtractResult.make({
  annotatedDocument,
  diagnostics: LangExtractDiagnostics.make({
    alignedCount: NonNegativeInt.make(0),
    candidateCount: NonNegativeInt.make(0),
    promptChars: NonNegativeInt.make(0),
    unalignedCount: NonNegativeInt.make(0)
  }),
  documentId: DocumentId.make("doc-1"),
  extractions: [],
  text: ""
}))
```

**Signature**

```ts
declare class LangExtractResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L297)

Since v0.0.0

# parsing

## parseModelOutput

Decode a model text response into extraction candidates.

**Example**

```ts
import { parseModelOutput } from "@beep/langextract/Extraction"
import { Effect } from "effect"

const program = parseModelOutput('{"extractions":[{"label":"person","text":"Ada Lovelace"}]}')
Effect.runPromise(program).then(console.log)
```

**Signature**

```ts
declare const parseModelOutput: (text: string) => Effect.Effect<ReadonlyArray<ExtractionCandidate>, LangExtractError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L350)

Since v0.0.0

# schemas

## AlignmentStatus

Alignment status assigned to a parsed extraction candidate.

**Example**

```ts
import { AlignmentStatus } from "@beep/langextract/Extraction"

console.log(AlignmentStatus.is.match_exact("match_exact"))
```

**Signature**

```ts
declare const AlignmentStatus: AnnotatedSchema<LiteralKit<readonly ["match_exact", "match_lesser", "match_fuzzy", "unaligned"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Extraction/index.ts#L105)

Since v0.0.0
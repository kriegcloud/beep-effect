---
title: index.ts
nav_order: 1
parent: "@beep/langextract"
---

## index.ts overview

Deterministic source alignment for parsed extraction candidates.

Since v0.0.0

---
## Exports Grouped by Category
- [mapping](#mapping)
  - [alignCandidate](#aligncandidate)
  - [alignCandidates](#aligncandidates)
---

# mapping

## alignCandidate

Align one extraction candidate against source text.

**Example**

```ts
import { alignCandidate } from "@beep/langextract/Alignment"
import { ExtractionCandidate } from "@beep/langextract/Extraction"

const candidate = ExtractionCandidate.make({ label: "person", text: "Ada Lovelace" })
console.log(alignCandidate("Ada Lovelace wrote notes.", candidate).alignmentStatus)
console.log(alignCandidate(candidate)("Ada Lovelace wrote notes.").alignmentStatus)
```

**Signature**

```ts
declare const alignCandidate: { (sourceText: string, candidate: ExtractionCandidate, options?: LangExtractOptions): GroundedExtraction; (candidate: ExtractionCandidate, options?: LangExtractOptions): (sourceText: string) => GroundedExtraction; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Alignment/index.ts#L203)

Since v0.0.0

## alignCandidates

Align candidates and honor the optional maximum extraction count.

**Example**

```ts
import { alignCandidates } from "@beep/langextract/Alignment"
import { ExtractionCandidate } from "@beep/langextract/Extraction"

const candidates = [ExtractionCandidate.make({ label: "person", text: "Ada Lovelace" })]
console.log(alignCandidates("Ada Lovelace wrote notes.", candidates).length)
console.log(alignCandidates(candidates)("Ada Lovelace wrote notes.").length)
```

**Signature**

```ts
declare const alignCandidates: { (sourceText: string, candidates: ReadonlyArray<ExtractionCandidate>, options?: LangExtractOptions): ReadonlyArray<GroundedExtraction>; (candidates: ReadonlyArray<ExtractionCandidate>, options?: LangExtractOptions): (sourceText: string) => ReadonlyArray<GroundedExtraction>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Alignment/index.ts#L248)

Since v0.0.0
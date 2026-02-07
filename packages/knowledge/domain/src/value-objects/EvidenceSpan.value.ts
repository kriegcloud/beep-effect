import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/EvidenceSpan");

export class EvidenceSpan extends S.Class<EvidenceSpan>($I`EvidenceSpan`)({
  text: S.String,
  startChar: S.NonNegativeInt,
  endChar: S.NonNegativeInt,
  confidence: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))),
}) {}

export declare namespace EvidenceSpan {
  export type Type = typeof EvidenceSpan.Type;
  export type Encoded = typeof EvidenceSpan.Encoded;
}

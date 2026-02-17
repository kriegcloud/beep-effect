import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("values/EvidenceSpan.value");

export class EvidenceSpan extends S.Class<EvidenceSpan>($I`EvidenceSpan`)({
  text: S.String,
  startChar: S.NonNegativeInt,
  endChar: S.NonNegativeInt,
  confidence: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))),
}) {}

const EvidenceSpanFromJsonString = S.parseJson(EvidenceSpan).annotations({
  description: "Legacy JSON-encoded EvidenceSpan payload",
});

const EvidenceSpanFromPlainText = S.transform(S.String, EvidenceSpan, {
  strict: true,
  decode: (text) =>
    new EvidenceSpan({
      text,
      startChar: 0,
      endChar: text.length,
    }),
  encode: (span) => span.text,
}).annotations({
  description: "Legacy plain-text evidence payload with inferred character span",
});

export const EvidenceSpanFromStorage = S.Union(
  EvidenceSpan,
  EvidenceSpanFromJsonString,
  EvidenceSpanFromPlainText
).annotations({
  description: "Evidence span schema compatible with legacy string payloads read from storage",
});

export declare namespace EvidenceSpan {
  export type Type = typeof EvidenceSpan.Type;
  export type Encoded = typeof EvidenceSpan.Encoded;
}

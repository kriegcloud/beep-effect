import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/Attributes");

export class Attributes extends S.Record({
  key: S.String,
  value: S.Union(S.String, S.Number, S.Boolean),
}).annotations(
  $I.annotations("Attributes", {
    title: "Attributes",
    description: "Property-value pairs (literal values only)",
  })
) {}

export declare namespace Attributes {
  export type Type = typeof Attributes.Type;
  export type Encoded = typeof Attributes.Encoded;
}

export class Confidence extends S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)).annotations(
  $I.annotations("Confidence", {
    title: "Confidence",
    description: "Confidence score (0.0-1.0)",
    arbitrary: () => (fc) => fc.float({ min: 0, max: 1 }),
  })
) {}
export declare namespace Confidence {
  export type Type = typeof Confidence.Type;
  export type Encoded = typeof Confidence.Encoded;
}

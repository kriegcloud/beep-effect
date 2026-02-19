import * as S from "effect/Schema";

export class PAGINATION_LIMIT extends S.Literal(100).annotations({
  identifier: "PAGINATION_LIMIT",
  title: "Pagination Limit",
  description: "Default pagination limit for API responses",
  schemaId: Symbol.for("@beep/constants/Pagination"),
}) {
  static readonly Value = 100;
}

export declare namespace PAGINATION_LIMIT {
  export type Type = S.Schema.Type<typeof PAGINATION_LIMIT>;
  export type Encoded = S.Schema.Encoded<typeof PAGINATION_LIMIT>;
}

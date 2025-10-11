import * as S from "effect/Schema";

export class YearEncoded extends S.Number.annotations({
  schemaId: Symbol.for("@beep/schema/custom/YearEncoded"),
  identifier: "YearEncoded",
  title: "Year Encoded",
  description: "A year encoded as a number",
}) {}

export declare namespace YearEncoded {
  export type Type = S.Schema.Type<typeof YearEncoded>;
  export type Encoded = S.Schema.Encoded<typeof YearEncoded>;
}

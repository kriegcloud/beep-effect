import * as S from "effect/Schema";
import { Id } from "./_id";
export class YearEncoded extends S.Number.annotations(
  Id.annotations("YearEncoded", {
    description: "A year encoded as a number",
  })
) {}

export declare namespace YearEncoded {
  export type Type = S.Schema.Type<typeof YearEncoded>;
  export type Encoded = S.Schema.Encoded<typeof YearEncoded>;
}

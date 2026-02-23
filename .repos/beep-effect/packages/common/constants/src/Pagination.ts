import { $ConstantsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $ConstantsId.create("Pagination");

export class PAGINATION_LIMIT extends S.Literal(100).annotations(
  $I.annotations("PAGINATION_LIMIT", {
    description: "Default pagination limit for API responses",
  })
) {
  static readonly Value = 100;
}

export declare namespace PAGINATION_LIMIT {
  export type Type = S.Schema.Type<typeof PAGINATION_LIMIT>;
  export type Encoded = S.Schema.Encoded<typeof PAGINATION_LIMIT>;
}

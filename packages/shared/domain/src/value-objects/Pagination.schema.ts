import { PAGINATION_LIMIT } from "@beep/constants";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
export class Pagination extends BS.Class<Pagination>("Pagination")({
  page: BS.toOptionalWithDefault(S.NumberFromString.pipe(S.int(), S.positive()))(1),
  limit: BS.toOptionalWithDefault(
    S.NumberFromString.pipe(S.int(), S.positive(), S.lessThanOrEqualTo(PAGINATION_LIMIT.Value))
  )(20),
}) {}

export namespace Pagination {
  export type Type = S.Schema.Type<typeof Pagination>;
  export type Encoded = S.Schema.Type<typeof Pagination>;
}

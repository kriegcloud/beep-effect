import { DateTimeFromDate } from "@beep/schema/sql";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("nullables");
export class NullableStr extends S.NullOr(S.String).annotations(
  Id.annotations("NullableStr", {
    description: "A nullable string",
  })
) {}

export declare namespace NullableStr {
  export type Type = typeof NullableStr.Type;
  export type Encoded = typeof NullableStr.Encoded;
}

export class NullableNum extends S.NullOr(S.Number).annotations(
  Id.annotations("NullableNum", {
    description: "A nullable number",
  })
) {}

export declare namespace NullableNum {
  export type Type = typeof NullableNum.Type;
  export type Encoded = typeof NullableNum.Encoded;
}

export class NullableDate extends S.NullOr(DateTimeFromDate()).annotations(
  Id.annotations("NullableDate", {
    description: "A nullable Date",
  })
) {}

export declare namespace NullableDate {
  export type Type = typeof NullableDate.Type;
  export type Encoded = typeof NullableDate.Encoded;
}

export class NullableUnknown extends S.NullOr(S.Unknown).annotations(
  Id.annotations("NullableUnknown", {
    description: "A nullable unknown",
  })
) {}

export declare namespace NullableUnknown {
  export type Type = typeof NullableUnknown.Type;
  export type Encoded = typeof NullableUnknown.Encoded;
}

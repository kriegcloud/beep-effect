import { DateTimeFromDate } from "@beep/schema/sql";
import * as S from "effect/Schema";

export class NullableStr extends S.NullOr(S.String).annotations({
  schemaId: Symbol.for("@beep/schema/custom/Nullables/NullableStr"),
  identifier: "NullableStr",
  title: "Nullable String",
  description: "A nullable string",
}) {}

export declare namespace NullableStr {
  export type Type = typeof NullableStr.Type;
  export type Encoded = typeof NullableStr.Encoded;
}

export class NullableNum extends S.NullOr(S.Number).annotations({
  schemaId: Symbol.for("@beep/schema/custom/Nullables/NullableNum"),
  identifier: "NullableNum",
  title: "Nullable Number",
  description: "A nullable number",
}) {}

export declare namespace NullableNum {
  export type Type = typeof NullableNum.Type;
  export type Encoded = typeof NullableNum.Encoded;
}

export class NullableDate extends S.NullOr(DateTimeFromDate()).annotations({
  schemaId: Symbol.for("@beep/schema/custom/Nullables/NullableDate"),
  identifier: "NullableDate",
  title: "Nullable Date",
  description: "A nullable Date",
}) {}

export declare namespace NullableDate {
  export type Type = typeof NullableDate.Type;
  export type Encoded = typeof NullableDate.Encoded;
}

export class NullableUnknown extends S.NullOr(S.Unknown).annotations({
  schemaId: Symbol.for("@beep/schema/custom/Nullables/NullableUnknown"),
  identifier: "NullableUnknown",
  title: "Nullable Unknown",
  description: "A nullable unknown",
}) {}

export declare namespace NullableUnknown {
  export type Type = typeof NullableUnknown.Type;
  export type Encoded = typeof NullableUnknown.Encoded;
}

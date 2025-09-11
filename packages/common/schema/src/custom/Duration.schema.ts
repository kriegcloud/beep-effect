import { Duration } from "effect";
import * as S from "effect/Schema";

export const DurationFromMinutes = S.transform(S.Number, S.DurationFromSelf, {
  decode: Duration.minutes,
  encode: Duration.toMinutes,
}).annotations({
  schemaId: Symbol.for("@beep/schema/custom/DurationFromMinutes"),
  identifier: "DurationFromMinutes",
  title: "Duration from minutes",
  description: "effect duration from minutes",
});

export namespace DurationFromMinutes {
  export type Type = S.Schema.Type<typeof DurationFromMinutes>;
  export type Encoded = S.Schema.Encoded<typeof DurationFromMinutes>;
}

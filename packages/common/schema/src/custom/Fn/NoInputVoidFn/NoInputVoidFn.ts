import { Fn } from "@beep/schema/custom/Fn/Fn.schema";
import * as S from "effect/Schema";

export const { Schema, implement } = new Fn({
  input: S.Any,
  output: S.Void,
});
export type Type = typeof Schema.Type;
export type Encoded = typeof Schema.Encoded;

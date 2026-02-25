import { String as Str } from "effect";
import * as A from "effect/Array";

export const formalizeValues = <T extends A.NonEmptyReadonlyArray<string>>(values: T) => A.map(values, Str.capitalize);

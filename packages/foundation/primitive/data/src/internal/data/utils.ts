import * as A from "effect/Array";
import * as Str from "effect/String";

export const formalizeValues = <T extends A.NonEmptyReadonlyArray<string>>(values: T) => A.map(values, Str.capitalize);

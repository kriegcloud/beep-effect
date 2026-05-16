import { A } from "@beep/utils";
import * as Str from "effect/String";

export const formalizeValues = <T extends A.NonEmptyReadonlyArray<string>>(values: T) => A.map(values, Str.capitalize);

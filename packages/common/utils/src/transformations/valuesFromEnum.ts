import { invariant } from "@beep/invariant";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";

export type ValuesFromEnum = <K extends string, A extends string>(
  inputEnum: R.ReadonlyRecord<K, A>
) => A.NonEmptyReadonlyArray<A>;

export const valuesFromEnum: ValuesFromEnum = F.flow(
  <K extends string, A extends string>(inputEnum: R.ReadonlyRecord<K, A>): A.NonEmptyReadonlyArray<A> => {
    invariant(!R.isEmptyReadonlyRecord(inputEnum), "Empty enum", {
      file: "packages/common/utils/src/transformations/valuesFromEnum.ts",
      line: 10,
      args: [inputEnum],
    });
    const values = R.values(inputEnum) as readonly (string & A)[];
    invariant(A.isNonEmptyReadonlyArray(values), "Empty enum", {
      file: "packages/common/utils/src/transformations/valuesFromEnum.ts",
      line: 13,
      args: [inputEnum],
    });
    return values;
  }
);

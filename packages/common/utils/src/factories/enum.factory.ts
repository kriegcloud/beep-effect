import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";
import { create } from "mutative";

export type DeriveKeyEnum = <T extends Record<string, unknown>>(
  record: T
) => {
  readonly [K in keyof T]: K;
};
export const deriveKeyEnum: DeriveKeyEnum = <T extends Record<string, unknown>>(record: T) =>
  F.pipe(
    R.keys(record),
    A.reduce(
      {} as { [K in keyof T]: K },
      (acc, k) =>
        create(acc, (draft: { [K in keyof T]: K }) => {
          draft[k as keyof typeof draft] = k;
        }) as { [K in keyof T]: K }
    )
  );

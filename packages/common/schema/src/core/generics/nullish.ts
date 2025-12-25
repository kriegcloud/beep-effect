import * as S from "effect/Schema";
export const Nullish = <A, E, R>(s: S.Schema<A, E, R>) => S.optionalWith(s, { nullable: true });

export const NullishString = S.optionalWith(S.String, { nullable: true });

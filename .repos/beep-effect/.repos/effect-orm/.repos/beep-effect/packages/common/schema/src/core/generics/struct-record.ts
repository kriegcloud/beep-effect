import * as S from "effect/Schema";

export const StructRecord = <F extends S.Struct.Fields>(f: F) => S.Struct(f, S.Record({ key: S.String, value: S.Any }));

import type * as S from "effect/Schema";

export const format = <S extends S.Schema.All>(schema: S): string => String(schema.ast);

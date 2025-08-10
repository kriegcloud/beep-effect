import { Json } from "@beep/common/schema";
import * as S from "effect/Schema";

export const TsConfigSchema = S.Struct(
  {
    references: S.optional(
      S.Array(
        S.Struct({
          path: S.String,
        }),
      ),
    ),
    compilerOptions: S.optional(
      S.Struct(
        {
          paths: S.optional(
            S.Record({
              key: S.TemplateLiteral(`@beep/`, S.String),
              value: S.NonEmptyArray(S.TemplateLiteral(`.`, S.String)),
            }),
          ),
        },
        S.Record({
          key: S.String,
          value: Json.Schema,
        }),
      ),
    ),
  },
  S.Record({
    key: S.String,
    value: Json.Schema,
  }),
);

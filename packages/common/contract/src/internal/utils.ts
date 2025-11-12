import * as S from "effect/Schema";

export const constEmptyStruct = S.Struct({});

export const toSchemaAnyNoContext = <Schema extends S.Schema.All>(
  schema: Schema
): S.Schema<S.Schema.Type<Schema>, S.Schema.Encoded<Schema>, never> =>
  S.asSchema(schema) as S.Schema<S.Schema.Type<Schema>, S.Schema.Encoded<Schema>, never>;

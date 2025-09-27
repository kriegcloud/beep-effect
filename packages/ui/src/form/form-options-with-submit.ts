import type { UnsafeTypes } from "@beep/types";
import { formOptions } from "@tanstack/react-form";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type { ParseError } from "effect/ParseResult";
import * as S from "effect/Schema";
import { makeFormOptions } from "./makeFormOptions";

type Params<
  Fields extends S.Struct.Fields,
  SchemaA,
  SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  SchemaR,
> = {
  schema: S.Schema<SchemaA, SchemaI, SchemaR>;
  onSubmit: (values: Effect.Effect<SchemaA, ParseError, never>) => Promise<void>;
  defaultValues: SchemaI;
};

export const formOptionsWithSubmit = <
  const Fields extends S.Struct.Fields,
  const A,
  const I extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  const SchemaR,
>({
  schema,
  onSubmit,
  defaultValues,
}: Params<Fields, A, I, SchemaR>) =>
  formOptions({
    ...makeFormOptions({
      schema,
      defaultValues,
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => F.pipe(value, S.decode(S.typeSchema(schema)), onSubmit),
  });

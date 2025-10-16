import type { UnsafeTypes } from "@beep/types";
import { formOptions } from "@tanstack/react-form";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type { ParseError } from "effect/ParseResult";
import * as S from "effect/Schema";
import { makeFormOptions } from "./makeFormOptions";

type Params<SchemaA, SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>> = {
  schema: S.Schema<SchemaA, SchemaI>;
  onSubmit: (values: Effect.Effect<SchemaA, ParseError, never>) => Promise<void>;
  defaultValues: SchemaI;
};

export const formOptionsWithSubmit = <const A, const I extends Record<PropertyKey, UnsafeTypes.UnsafeAny>>({
  schema,
  onSubmit,
  defaultValues,
}: Params<A, I>) =>
  formOptions({
    ...makeFormOptions({
      schema,
      defaultValues,
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => F.pipe(value, S.decode(schema), onSubmit),
  });



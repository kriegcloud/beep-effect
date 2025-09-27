import type { UnsafeTypes } from "@beep/types";
import { formOptions } from "@tanstack/react-form";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type { ParseError } from "effect/ParseResult";
import * as S from "effect/Schema";
import { makeFormOptions } from "./makeFormOptions";

type Params<
  Fields extends S.Struct.Fields,
  A extends S.Struct.Type<Fields>,
  I extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  Self extends S.Schema<A, I, never>,
> = {
  schema: S.Schema<A, I, never>;
  onSubmit: (values: Effect.Effect<A, ParseError, never>) => Promise<void>;
  defaultValues: I;
};

export const formOptionsWithSubmit = <
  const Fields extends S.Struct.Fields,
  const A extends S.Struct.Type<Fields>,
  const I extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  const Self extends S.Schema<A, I, never>,
>({
  schema,
  onSubmit,
  defaultValues,
}: Params<Fields, A, I, Self>) =>
  formOptions({
    ...makeFormOptions({
      schema,
      defaultValues,
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => F.pipe(value, S.decode(schema), onSubmit),
  });

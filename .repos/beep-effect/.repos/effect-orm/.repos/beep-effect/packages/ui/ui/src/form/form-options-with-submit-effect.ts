import type { UnsafeTypes } from "@beep/types";
import { formOptions } from "@tanstack/react-form";
import * as S from "effect/Schema";
import { makeFormOptions } from "./makeFormOptions";

type Params<SchemaA, SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>> = {
  readonly schema: S.Schema<SchemaA, SchemaI>;
  readonly onSubmit: (value: SchemaA) => Promise<void>;
  readonly defaultValues: SchemaI;
};

type FormOptionsWithSubmitEffect = <const A, const I extends Record<PropertyKey, UnsafeTypes.UnsafeAny>>(
  params: Params<A, I>
) => ReturnType<typeof makeFormOptions<A, I, "onSubmit">>;

export const formOptionsWithSubmitEffect: FormOptionsWithSubmitEffect = <
  const A,
  const I extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
>({
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
    onSubmit: async ({ value }) => onSubmit(S.decodeUnknownSync(schema)(value)),
  });

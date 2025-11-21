import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import { formOptions } from "@tanstack/react-form";
import * as O from "effect/Option";
import type * as R from "effect/Record";
import * as S from "effect/Schema";
import { makeFormOptions } from "./makeFormOptions";

type Params<SchemaA, SchemaI extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>> = {
  readonly schema: S.Schema<SchemaA, SchemaI>;
  readonly onSubmit: (value: SchemaA) => Promise<void>;
};

type FormOptionsWithDefaults = <
  const SchemaA,
  const SchemaI extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>,
>(
  params: Params<SchemaA, SchemaI>
) => ReturnType<typeof makeFormOptions<SchemaA, SchemaI, "onSubmit">>;

export const formOptionsWithDefaults: FormOptionsWithDefaults = <
  const SchemaA,
  const SchemaI extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>,
>({
  schema,
  onSubmit,
}: Params<SchemaA, SchemaI>) => {
  const defaultValuesOpt = BS.getDefaultFormValuesAnnotation(schema);
  invariant(
    O.isSome(defaultValuesOpt),
    `A schema with no ${BS.DefaultFormValuesAnnotationId.toString()} annotations was provided`,
    {
      file: "@beep/ui/form/form-options-with-defaults.ts",
      line: 29,
      args: [schema],
    }
  );
  const defaultValues = defaultValuesOpt.value;

  return formOptions({
    ...makeFormOptions({
      schema,
      defaultValues,
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => onSubmit(S.decodeUnknownSync(schema)(value)),
  });
};

import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import { formOptions } from "@tanstack/react-form";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type * as R from "effect/Record";
import * as S from "effect/Schema";
import { makeFormOptions } from "./makeFormOptions";

type Params<SchemaA, SchemaI extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>> = {
  readonly schema: S.Schema<SchemaA, SchemaI>;
  readonly onSubmit: (value: SchemaA) => Promise<void>;
  readonly defaultValues?: SchemaI | undefined;
};

type FormOptionsWithDefaults = <
  const SchemaA,
  const SchemaI extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>,
>(
  params: Params<SchemaA, SchemaI>
) => ReturnType<typeof makeFormOptions<SchemaA, SchemaI, "onSubmit">>;

const getDefaultValues = <SchemaA, SchemaI extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>>({
  schema,
  defaultValues,
}: {
  readonly schema: S.Schema<SchemaA, SchemaI>;
  readonly defaultValues?: SchemaI | undefined;
}) =>
  F.pipe(
    defaultValues,
    O.fromNullable,
    O.match({
      onNone: () => {
        const defaultValuesOpt = BS.getDefaultFormValuesAnnotation(schema);
        invariant(
          O.isSome(defaultValuesOpt),
          `A schema with no ${BS.DefaultFormValuesAnnotationId.toString()} annotations was provided`,
          {
            file: "@beep/ui/form/form-options-with-defaults.ts",
            line: 37,
            args: [schema],
          }
        );
        return defaultValuesOpt.value;
      },
      onSome: (defaultValues) => defaultValues,
    })
  );

export const formOptionsWithDefaults: FormOptionsWithDefaults = <
  const SchemaA,
  const SchemaI extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>,
>({
  schema,
  onSubmit,
  defaultValues,
}: Params<SchemaA, SchemaI>) => {
  return formOptions({
    ...makeFormOptions({
      schema,
      defaultValues: getDefaultValues({ schema, defaultValues }),
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => onSubmit(S.decodeUnknownSync(schema)(value)),
  });
};

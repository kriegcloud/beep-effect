import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import type { FormOptions } from "@tanstack/react-form";
import { formOptions } from "@tanstack/react-form";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import { pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import { ArrayFormatter } from "effect/ParseResult";
import type * as R from "effect/Record";
import * as S from "effect/Schema";

type BuildTuple<N extends number, Acc extends ReadonlyArray<unknown> = []> = Acc["length"] extends N
  ? Acc
  : BuildTuple<N, [...Acc, unknown]>;

// Computes N - 1 for a number type N.
type Prev<N extends number> = BuildTuple<N> extends [unknown, ...infer Rest] ? Rest["length"] : 0;

// Recursive type to generate dot-notation paths for a type `Data` up to a depth `Depth`.
type PathsLimited<Data, Path extends string = "", Depth extends number = 3> = Depth extends 0 // Base case: Depth limit reached
  ? `${Path}${Path extends "" ? "" : "."}${string}` | Path // Allow the current path or any string suffix.
  : Data extends ReadonlyArray<infer Element>
    ? // For arrays: Generate paths for numeric indices and recurse on the element type.
        | `${Path}${Path extends "" ? "" : "."}${number}`
        | PathsLimited<Element, `${Path}${Path extends "" ? "" : "."}${number}`, Prev<Depth>>
    : Data extends object
      ? // For objects: Generate paths for keys and recurse on property types.
        {
          [Key in keyof Data]-?: Key extends string | number
            ?
                | `${Path}${Path extends "" ? "" : "."}${Key}`
                | PathsLimited<Data[Key], `${Path}${Path extends "" ? "" : "."}${Key}`, Prev<Depth>>
            : never;
        }[keyof Data]
      : // Primitive/leaf node: Return the accumulated path.
        Path;

export type Paths<Data> = PathsLimited<Data>;

type RootErrorKey = "";
type SchemaValidatorResult<SchemaInput extends Record<PropertyKey, UnsafeTypes.UnsafeAny>> = Partial<
  Record<Paths<SchemaInput> | RootErrorKey, string>
> | null;

export type SchemaValidatorFn<SchemaInput extends Record<PropertyKey, UnsafeTypes.UnsafeAny>> = (submission: {
  value: SchemaInput;
}) => SchemaValidatorResult<SchemaInput>;

export const validateWithSchema =
  <A, I extends Record<PropertyKey, UnsafeTypes.UnsafeAny>>(schema: S.Schema<A, I>): SchemaValidatorFn<I> =>
  (submission: { value: I }): SchemaValidatorResult<I> =>
    S.decodeEither(schema, { errors: "all", onExcessProperty: "ignore" })(submission.value).pipe(
      Either.mapLeft((errors) =>
        pipe(
          errors,
          ArrayFormatter.formatErrorSync,
          A.reduce({} as Record<string, string>, (acc, error) => {
            if (error.path.length === 0) {
              acc[""] = error.message;
            } else if (error.path.length > 0) {
              const key = error.path.join(".");
              acc[key] = error.message;
            }
            return acc;
          }),
          (acc): SchemaValidatorResult<I> => (Object.keys(acc).length > 0 ? acc : null)
        )
      ),
      Either.flip,
      Either.getOrNull
    );

export type HandledValidatorKey = "onSubmit" | "onChange" | "onBlur";
export type MakeFormOptionsReturn<SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>> = FormOptions<
  SchemaI,
  undefined,
  SchemaValidatorFn<SchemaI>,
  SchemaValidatorFn<SchemaI>,
  SchemaValidatorFn<SchemaI>,
  undefined,
  SchemaValidatorFn<SchemaI>,
  SchemaValidatorFn<SchemaI>,
  undefined,
  undefined,
  undefined,
  undefined
>;
export const makeFormOptions = <
  SchemaA,
  SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  ValidatorKey extends HandledValidatorKey,
>(opts: {
  readonly schema: S.Schema<SchemaA, SchemaI>;
  readonly defaultValues: SchemaI;
  readonly validator: ValidatorKey;
}): MakeFormOptionsReturn<SchemaI> => {
  const specificValidatorFn = validateWithSchema(opts.schema);

  const validators = Match.value(opts.validator satisfies HandledValidatorKey).pipe(
    Match.when("onSubmit", () => ({ onSubmit: specificValidatorFn })),
    Match.when("onChange", () => ({ onChange: specificValidatorFn })),
    Match.when("onBlur", () => ({ onBlur: specificValidatorFn })),
    Match.exhaustive
  );

  return formOptions({
    defaultValues: opts.defaultValues,
    validators,
  });
};

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

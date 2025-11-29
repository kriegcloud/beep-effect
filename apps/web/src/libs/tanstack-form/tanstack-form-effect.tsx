"use client";

import { invariant } from "@beep/invariant";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import type { FormOptions } from "@tanstack/react-form";
import { formOptions } from "@tanstack/react-form";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

import type { MakeFormOptionsReturn, SchemaValidatorFn } from "./tanstack-form";
import { makeFormOptions } from "./tanstack-form";

type ClientRuntimeEnv =
  Parameters<ReturnType<typeof makeRunClientPromise>>[0] extends Effect.Effect<
    UnsafeTypes.UnsafeAny,
    UnsafeTypes.UnsafeAny,
    infer R
  >
    ? R
    : never;

type SubmitEffect<SchemaA, SubmitSuccess, SubmitError> = (
  values: SchemaA
) => Effect.Effect<SubmitSuccess, SubmitError, ClientRuntimeEnv>;

type Params<SchemaA, SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>, SubmitSuccess, SubmitError> = {
  readonly schema: S.Schema<SchemaA, SchemaI>;
  readonly submitEffect: SubmitEffect<SchemaA, SubmitSuccess, SubmitError>;
  readonly spanName?: string;
};

type EffectFormOptionsReturn<SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>> =
  MakeFormOptionsReturn<SchemaI> &
    Pick<
      FormOptions<
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
      >,
      "onSubmit"
    >;

export const useEffectFormOptions = <
  SchemaA,
  SchemaI extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  SubmitSuccess,
  SubmitError,
>({
  schema,
  submitEffect,
  spanName = "tanstackForm.submitEffect",
}: Params<SchemaA, SchemaI, SubmitSuccess, SubmitError>): EffectFormOptionsReturn<SchemaI> => {
  const runtime = useRuntime();
  const runClientPromise = makeRunClientPromise(runtime, spanName);

  const defaultValuesOpt = F.pipe(schema, BS.getDefaultFormValuesAnnotation);
  invariant(
    O.isSome(defaultValuesOpt),
    `A schema with no ${BS.DefaultFormValuesAnnotationId.toString()} annotations was provided`,
    {
      file: "apps/web/src/libs/tanstack-form/tanstack-form-effect.tsx",
      line: 39,
      args: [schema],
    }
  );

  const decode = S.decodeUnknownSync(schema);

  return formOptions({
    ...makeFormOptions({
      schema,
      defaultValues: defaultValuesOpt.value,
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      const decoded = decode(value);
      await runClientPromise(submitEffect(decoded));
    },
  });
};

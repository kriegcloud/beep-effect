/**
 * Common types for CSV parsing
 *
 * @module @beep/schema/csv/parse/types
 * @since 0.0.0
 */
import {$SchemaId} from "@beep/identity";
import * as S from "effect/Schema";
import {pipe} from "effect";
import {Fn, type FnSchema, type FnSchemaUnary} from "../../Fn.ts";
import type * as O from "effect/Option";

const $I = $SchemaId.create("csv/parse/types");


/**
 * An array containing possibly nullish strings.
 *
 * @category Validation
 * @since 0.0.0
 */
export const HeaderArray = pipe(
  S.String,
  S.NullishOr,
  S.Array,
  $I.annoteSchema(
    "HeaderArray",
    {
      description: "An array containing possibly nullish strings."
    }
  )
);

/**
 * Type of {@link HeaderArray} {@inheritDoc HeaderArray}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HeaderArray = typeof HeaderArray.Type;

/**
 * An identity funciton taking an array containing possibly nullish strings
 * and returning it.
 *
 * @category Validation
 * @since 0.0.0
 */
export const HeaderTransformFunction = Fn({
  input: HeaderArray,
  output: HeaderArray
})
  .pipe(
    $I.annoteSchema(
      "HeaderTransformFunction",
      {
        description: "An identity funciton taking an array containing possibly nullish strings\nand returning it."
      }
    )
  )

/**
 * Type of {@link HeaderTransformFunction} {@inheritDoc HeaderTransformFunction}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HeaderTransformFunction = typeof HeaderTransformFunction.Type;


export const RowMap = <V extends S.Top = S.Top>(valueSchema: S.Schema<V>) => S.Record(
  S.String,
  valueSchema
);
export type RowMap<V extends S.Top = S.Top> = S.Schema.Type<S.$Record<S.String, S.Schema<V>>>
export const RowArray = <V extends S.Top = S.Top>(valueSchema: S.Schema<V>) => S.Array(valueSchema);
export type RowArray<V extends S.Top = S.Top> = S.Schema.Type<S.$Array<S.Schema<V>>>

export const Row = <V extends S.Top = S.Top>(valueSchema: S.Schema<V>) => S.Union(
  [
    RowMap(valueSchema),
    RowArray(valueSchema)
  ]
);

export type Row<V extends S.Top = S.Top> =
  | RowMap<V>
  | RowArray<V>


export const RowValidationResult = <R extends S.Top>(
  rowSchema: S.Union<readonly [S.$Record<S.String, S.Schema<R>>, S.$Array<S.Schema<R>>]>
) => S.Struct({
  row: S.OptionFromNullOr(rowSchema),
  isValid: S.Boolean,
  reason: S.OptionFromOptionalKey(S.String)
})

export interface RowValidationResult<R extends S.Top> {
  readonly isValid: boolean
  readonly reason: O.Option<string>
  readonly row: Row<R>
}

export const RowValidateCallback = Fn({
  input: S.Struct({
    error: S.OptionFromOptionalKey(S.Error),
    isValid: S.OptionFromOptionalKey(S.Boolean),
    reason: S.OptionFromOptionalKey(S.String)
  }),
  output: S.Void
})

export type RowValidateCallback = typeof RowValidateCallback.Type;



export const SyncRowValidate = <RS extends S.Top>(rowSchema: S.Schema<RS>) => Fn({
  input: rowSchema,
  output: S.Boolean,
});

export type SyncRowValidate<RS extends S.Top> = (row: S.Schema.Type<S.Schema<RS>>) => boolean;

export const AsyncRowValidate = <RS extends S.Top>(
  rowSchema: S.Schema<RS>,
  cb: FnSchema<S.Schema<RS>, S.Boolean, S.Never>
) => {
  const f = Fn({
    input: S.Struct({
      row: rowSchema,
      cb: cb
    }),
    output: S.Void
  })
  return f
}

export declare namespace AsyncRowValidate {
  export type Instance<RS extends S.Top> = FnSchemaUnary<S.Struct<{
    readonly row: S.Schema<RS>;
    readonly cb: FnSchemaUnary<S.Struct<{
      readonly error: S.OptionFromOptionalKey<S.Error>;
      readonly isValid: S.OptionFromOptionalKey<S.Boolean>;
      readonly reason: S.OptionFromOptionalKey<S.String>;
    }>, S.Void, S.Never>;
  }>, S.Void, S.Never>
}


export const RowValidate = <RS extends S.Top>(rowSchema: S.Schema<RS>,) => S.Union(
  [
    AsyncRowValidate(
      rowSchema,
      SyncRowValidate(rowSchema)
    ),
    SyncRowValidate(rowSchema)
  ]
)

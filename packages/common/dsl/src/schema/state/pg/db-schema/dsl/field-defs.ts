import { $DslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Match, Struct } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $DslId.create("pg/db-schema/field-defs");

export class SqlDefaultValue extends S.Class<SqlDefaultValue>($I`SqlDefaultValue`)(
  {
    sql: S.String,
  },
  $I.annotations("SqlDefaultValue", {
    description: "A class representing a default value for a column in a database table",
  })
) {}

/**
 * Type guard for SqlDefaultValue using composed predicates from effect/Predicate
 */
export const isSqlDefaultValue = (value: unknown): value is SqlDefaultValue =>
  P.isNotNull(value) && P.isObject(value) && P.hasProperty(value, "sql") && P.isString(value.sql);

export type ColumnDefaultThunk<T> = () => T;

/**
 * Type guard for ColumnDefaultThunk using P.isFunction
 */
export const isDefaultThunk = <T>(value: unknown): value is ColumnDefaultThunk<T> => P.isFunction(value);

export type ColumnDefaultValue<T> = T | null | ColumnDefaultThunk<T | null> | SqlDefaultValue;

/**
 * Resolve a column default value - invokes thunk if present, otherwise returns value unchanged
 */
export const resolveColumnDefault = <T>(value: ColumnDefaultValue<T>): T | null | SqlDefaultValue =>
  isDefaultThunk<T | null>(value) ? value() : value;

export type ColumnDefinition<TEncoded, TDecoded, TRequirements = never> = {
  readonly columnType: FieldColumnType.Type;
  readonly schema: S.Schema<TDecoded, TEncoded, TRequirements>;
  readonly default: O.Option<ColumnDefaultValue<TDecoded>>;
  /** @default false */
  readonly nullable: boolean;
  /** @default false */
  readonly primaryKey: boolean;
  /** @default false */
  readonly autoIncrement: boolean;
};

export declare namespace ColumnDefinition {
  export type Any = ColumnDefinition<any, any>;
}

export class FieldColumnType extends BS.StringLiteralKit("text", "integer", "real", "blob").annotations(
  $I.annotations("FieldColumnType", {
    description: "Valid column types for a database table",
  })
) {
  static readonly defs = F.pipe(
    this.Options,
    A.reduce(
      {} as {
        readonly [K in FieldColumnType.Type]: ColDefFn<K>;
      },
      (acc, option) =>
        ({
          ...acc,
          [option]: makeColDef(option),
        }) as const
    )
  );
}

export declare namespace FieldColumnType {
  export type Type = typeof FieldColumnType.Type;

  export type Text = typeof FieldColumnType.Enum.text;
  export type Integer = typeof FieldColumnType.Enum.integer;
  export type Real = typeof FieldColumnType.Enum.real;
  export type Blob = typeof FieldColumnType.Enum.blob;
}

export const { text, integer, real, blob } = FieldColumnType.defs;

/**
 * Type guard for valid column types using predicate composition
 */
const isValidColumnType = (ct: unknown): ct is FieldColumnType =>
  P.isString(ct) && F.pipe(FieldColumnType.Options, A.contains(ct));

/**
 * Type guard for ColumnDefinition using P.and and P.hasProperty
 */
export const isColumnDefinition: P.Refinement<unknown, ColumnDefinition.Any> = P.and(
  P.hasProperty("columnType"),
  (v): v is ColumnDefinition.Any => isValidColumnType((v as { columnType: unknown }).columnType)
);

type MaybeNull<T, TNullable extends boolean> = T | (TNullable extends true ? null : never);

type ColumnDefaultArg<T, TNullable extends boolean> =
  | MaybeNull<T, TNullable>
  | ColumnDefaultThunk<MaybeNull<T, TNullable>>
  | SqlDefaultValue
  | NoDefault;

export type ColumnDefinitionInput = {
  readonly schema?: undefined | S.Schema<unknown>;
  readonly default?: undefined | ColumnDefaultArg<unknown, boolean>;
  readonly nullable?: undefined | boolean;
  readonly primaryKey?: undefined | boolean;
  readonly autoIncrement?: undefined | boolean;
};

export const NoDefault = Symbol.for("NoDefault");
export type NoDefault = typeof NoDefault;

/**
 * Type guard for NoDefault using symbol equality
 */
export const isNoDefault = (value: unknown): value is NoDefault => value === NoDefault;

/**
 * Predicate to check if value is absent (undefined or NoDefault)
 */
const isAbsentDefault = P.or(P.isUndefined, isNoDefault);

/**
 * Resolve optional default value to Option using composed predicates
 */
const resolveOptionalDefault = <T>(value: T | undefined | NoDefault): O.Option<T> =>
  isAbsentDefault(value) ? O.none<T>() : O.some(value as T);

export type ColDefFn<TColumnType extends FieldColumnType.Type> = {
  (): {
    columnType: TColumnType;
    schema: S.Schema<DefaultEncodedForColumnType<TColumnType>>;
    default: O.None<never>;
    nullable: false;
    primaryKey: false;
    autoIncrement: false;
  };
  <
    TEncoded extends DefaultEncodedForColumnType<TColumnType>,
    TDecoded = DefaultEncodedForColumnType<TColumnType>,
    const TNullable extends boolean = false,
    const TDefault extends ColumnDefaultArg<NoInfer<TDecoded>, TNullable> = NoDefault,
    const TPrimaryKey extends boolean = false,
    const TAutoIncrement extends boolean = false,
  >(args: {
    schema?: undefined | S.Schema<TDecoded, TEncoded>;
    default?: undefined | TDefault;
    nullable?: undefined | TNullable;
    primaryKey?: undefined | TPrimaryKey;
    autoIncrement?: undefined | TAutoIncrement;
  }): {
    columnType: TColumnType;
    schema: TNullable extends true
      ? S.Schema<NoInfer<TDecoded> | null, NoInfer<TEncoded> | null>
      : S.Schema<NoInfer<TDecoded>, NoInfer<TEncoded>>;
    default: TDefault extends NoDefault ? O.None<never> : O.Some<NoInfer<TDefault>>;
    nullable: NoInfer<TNullable>;
    primaryKey: NoInfer<TPrimaryKey>;
    autoIncrement: NoInfer<TAutoIncrement>;
  };
};

/**
 * Factory for column definitions using functional pattern matching
 */
const makeColDef =
  <TColumnType extends FieldColumnType.Type>(columnType: TColumnType): ColDefFn<TColumnType> =>
  (def?: undefined | ColumnDefinitionInput) => {
    const nullable = def?.nullable ?? false;
    const schemaWithoutNull: S.Schema<any> = def?.schema ?? defaultSchemaForColumnType(columnType);
    const schema = Bool.match(nullable, {
      onTrue: F.constant(S.NullOr(schemaWithoutNull)),
      onFalse: F.constant(schemaWithoutNull),
    });
    const default_ = resolveOptionalDefault(def?.default);

    return {
      columnType,
      schema,
      default: default_,
      nullable,
      primaryKey: def?.primaryKey ?? false,
      autoIncrement: def?.autoIncrement ?? false,
    } as any;
  };

export const column = <TColumnType extends FieldColumnType.Type>(columnType: TColumnType): ColDefFn<TColumnType> =>
  makeColDef(columnType);

/**
 * `NoInfer` is needed for some generics to work properly in certain cases.
 * See full explanation here: https://gist.github.com/schickling/a15e96819826530492b41a10d79d3c04?permalink_comment_id=4805120#gistcomment-4805120
 *
 * Big thanks to @andarist for their help with this!
 */
type NoInfer<T> = [T][T extends any ? 0 : never];

export type SpecializedColDefFn<
  TColumnType extends FieldColumnType.Type,
  TAllowsCustomSchema extends boolean,
  TBaseDecoded,
> = {
  (): {
    columnType: TColumnType;
    schema: S.Schema<TBaseDecoded, DefaultEncodedForColumnType<TColumnType>>;
    default: O.None<never>;
    nullable: false;
    primaryKey: false;
    autoIncrement: false;
  };
  <
    TDecoded = TBaseDecoded,
    const TNullable extends boolean = false,
    const TDefault extends ColumnDefaultArg<NoInfer<TDecoded>, TNullable> = NoDefault,
    const TPrimaryKey extends boolean = false,
    const TAutoIncrement extends boolean = false,
  >(
    args: TAllowsCustomSchema extends true
      ? {
          schema?: undefined | S.Schema<TDecoded, any>;
          default?: undefined | TDefault;
          nullable?: undefined | TNullable;
          primaryKey?: undefined | TPrimaryKey;
          autoIncrement?: undefined | TAutoIncrement;
        }
      : {
          default?: undefined | TDefault;
          nullable?: undefined | TNullable;
          primaryKey?: undefined | TPrimaryKey;
          autoIncrement?: undefined | TAutoIncrement;
        }
  ): {
    columnType: TColumnType;
    schema: TNullable extends true
      ? S.Schema<NoInfer<TDecoded> | null, DefaultEncodedForColumnType<TColumnType> | null>
      : S.Schema<NoInfer<TDecoded>, DefaultEncodedForColumnType<TColumnType>>;
    default: TDefault extends NoDefault ? O.None<never> : O.Some<TDefault>;
    nullable: NoInfer<TNullable>;
    primaryKey: NoInfer<TPrimaryKey>;
    autoIncrement: NoInfer<TAutoIncrement>;
  };
};

type MakeSpecializedColDefFn = {
  <TColumnType extends FieldColumnType.Type, TBaseDecoded>(
    columnType: TColumnType,
    opts: {
      _tag: "baseSchema";
      baseSchema: S.Schema<TBaseDecoded, DefaultEncodedForColumnType<TColumnType>>;
    }
  ): SpecializedColDefFn<TColumnType, false, TBaseDecoded>;
  <TColumnType extends FieldColumnType.Type, TBaseDecoded>(
    columnType: TColumnType,
    opts: {
      _tag: "baseSchemaFn";
      baseSchemaFn: <TDecoded>(
        customSchema: S.Schema<TDecoded, TBaseDecoded> | undefined
      ) => S.Schema<TBaseDecoded, DefaultEncodedForColumnType<TColumnType>>;
    }
  ): SpecializedColDefFn<TColumnType, true, TBaseDecoded>;
};

/**
 * Factory for specialized column definitions using Match.tag for discriminated union
 */
const makeSpecializedColDef: MakeSpecializedColDefFn =
  (columnType, opts) => (def?: undefined | ColumnDefinitionInput) => {
    const nullable = def?.nullable ?? false;

    const schemaWithoutNull = Match.value(opts).pipe(
      Match.tag("baseSchema", Struct.get("baseSchema")),
      Match.tag("baseSchemaFn", Struct.get("baseSchemaFn")(def?.schema as any)),
      Match.exhaustive
    );

    const schema = Bool.match(nullable, {
      onTrue: F.constant(S.NullOr(schemaWithoutNull)),
      onFalse: F.constant(schemaWithoutNull),
    });
    const default_ = resolveOptionalDefault(def?.default);

    return {
      columnType,
      schema,
      default: default_,
      nullable,
      primaryKey: def?.primaryKey ?? false,
      autoIncrement: def?.autoIncrement ?? false,
    } as any;
  };

export const json: SpecializedColDefFn<"text", true, unknown> = makeSpecializedColDef(FieldColumnType.Enum.text, {
  _tag: "baseSchemaFn",
  baseSchemaFn: (customSchema) => S.parseJson(customSchema ?? S.Any),
});

export const datetime: SpecializedColDefFn<"text", false, Date> = makeSpecializedColDef(FieldColumnType.Enum.text, {
  _tag: "baseSchema",
  baseSchema: S.Date,
});

export const datetimeInteger: SpecializedColDefFn<"integer", false, Date> = makeSpecializedColDef(
  FieldColumnType.Enum.integer,
  {
    _tag: "baseSchema",
    baseSchema: S.transform(S.Number, S.DateFromSelf, {
      decode: (ms) => new Date(ms),
      encode: (date) => date.getTime(),
    }),
  }
);

export const boolean: SpecializedColDefFn<"integer", false, boolean> = makeSpecializedColDef(
  FieldColumnType.Enum.integer,
  {
    _tag: "baseSchema",
    baseSchema: S.transform(S.Number, S.Boolean, {
      decode: Eq.equals(1),
      encode: (_) => (_ ? 1 : 0),
    }),
  }
);

export type DefaultEncodedForColumnType<TColumnType extends FieldColumnType.Type> = TColumnType extends "text"
  ? string
  : TColumnType extends "integer"
    ? number
    : TColumnType extends "real"
      ? number
      : TColumnType extends "blob"
        ? Uint8Array<ArrayBuffer>
        : never;

/**
 * Get the default schema for a column type using Match.type for exhaustive pattern matching
 */
export const defaultSchemaForColumnType = <TColumnType extends FieldColumnType.Type>(
  columnType: TColumnType
): S.Schema<DefaultEncodedForColumnType<TColumnType>> => {
  type T = DefaultEncodedForColumnType<TColumnType>;
  const asSchema = <A>(schema: S.Schema<A>) => F.constant(schema as unknown as S.Schema<T>);

  return F.pipe(
    columnType,
    Match.type<FieldColumnType.Type>().pipe(
      Match.when(FieldColumnType.Enum.text, asSchema(S.String)),
      Match.when(FieldColumnType.Enum.integer, asSchema(S.Number)),
      Match.when(FieldColumnType.Enum.real, asSchema(S.Number)),
      Match.when(FieldColumnType.Enum.blob, asSchema(S.Uint8ArrayFromSelf)),
      Match.orElseAbsurd
    )
  );
};

import { invariant } from "@beep/invariant";
import type { SnakeTag } from "@beep/types/tag.types";
// import type { SimpleAnnotations } from "@beep/shared/types";
import { pgEnum } from "drizzle-orm/pg-core";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Equivalence from "effect/Equivalence";
import * as FC from "effect/FastCheck";
import * as JSONSchema from "effect/JSONSchema";
import * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { enumFromStringArray } from "../transformations/enumFromStringArray";
// import type {SnakeTag} from "@beep/shared/schema";
// Type to validate that all literals have a mapping and all mapped values are unique

export type SimpleAnnotations = {
  readonly identifier: string;
  readonly title: string;
  readonly description: string;
  readonly documentation?: AST.DocumentationAnnotation;
  readonly examples?: AST.ExamplesAnnotation<any>;
  readonly jsonSchema?: AST.JSONSchemaAnnotation;
  readonly default?: any;
};

type ValidateEnumMapping<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][],
> = Mapping extends readonly [
  ...infer Rest extends readonly [string, string][],
  readonly [infer Key, infer Value],
]
  ? Key extends Literals[number]
    ? Rest extends readonly []
      ? true
      : Value extends Rest[number][1]
        ? false // Duplicate value found
        : ValidateEnumMapping<Literals, Rest>
    : false // Key not in literals
  : false;

// Type to check if all literals are covered
type AllLiteralsCovered<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][],
> = Literals[number] extends Mapping[number][0] ? true : false;

// Type to extract the mapped values from the tuples
type ExtractMappedValues<T extends readonly [string, string][]> = T[number][1];

// Type to create the enum object type
type CreateEnumType<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][] | undefined,
> = Mapping extends readonly [string, string][]
  ? {
      readonly [K in ExtractMappedValues<Mapping>]: Extract<
        Mapping[number],
        readonly [any, K]
      >[0];
    }
  : { readonly [K in Literals[number]]: K };

// Helper type to ensure mapping is exhaustive and unique
type ValidMapping<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][],
> = ValidateEnumMapping<Literals, Mapping> extends true
  ? AllLiteralsCovered<Literals, Mapping> extends true
    ? Mapping
    : never
  : never;

/**
 * @since 0.1.0
 * @param literals
 * @category factories
 * @description
 * Create schema & utility functions for string literals
 * @example
 * ```
 * const { Schema, Mock, Enum, Options, Equivalence, JSONSchema } = stringLiteralKit(
 *   "A",
 *   "B",
 *   "C",
 * )({
 *   identifier: "CycleCountClass",
 *   title: "Cycle Count Class",
 *   description: "The type of the order",
 * });
 * ```
 */
/**
 * @since 0.1.0
 * @param literals
 * @category factories
 * @description
 * Create schema & utility functions for string literals
 * @example
 * ```
 * const { Schema, Mock, Enum, Options, Equivalence, JSONSchema } = stringLiteralKit(
 *   "A",
 *   "B",
 *   "C",
 * )({
 *   identifier: "CycleCountClass",
 *   title: "Cycle Count Class",
 *   description: "The type of the order",
 * });
 * ```
 */
export function stringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<string>,
>(
  ...literals: Literals
): (annotations: SimpleAnnotations) => {
  Schema: S.Literal<[...Literals]>;
  Options: Literals;
  Enum: CreateEnumType<Literals, undefined>;
  Mock: (qty: number) => [...Literals][number][];
  JSONSchema: JSONSchema.JsonSchema7Root;
  Pretty: (a: [...Literals][number]) => string;
  Equivalence: Equivalence.Equivalence<Literals[number]>;
  pick: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Keys[number]>;
  omit: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;
  derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => (annotations: SimpleAnnotations) => {
    Schema: S.Literal<[...Keys]>;
    Options: Keys;
    Enum: CreateEnumType<Keys, undefined>;
    Mock: (qty: number) => [...Literals][number][];
  };
  toPgEnum: <Name extends string>(
    name: `${SnakeTag<Name>}`,
  ) => ReturnType<typeof pgEnum<Literals[number], Literals>>;
};

export function stringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<string>,
  const Mapping extends readonly [Literals[number], string][],
>(
  ...args: [
    ...literals: Literals,
    options: { enumMapping: ValidMapping<Literals, Mapping> },
  ]
): (annotations: SimpleAnnotations) => {
  Schema: S.Literal<[...Literals]>;
  Options: Literals;
  Enum: CreateEnumType<Literals, Mapping>;
  Mock: (qty: number) => [...Literals][number][];
  JSONSchema: JSONSchema.JsonSchema7Root;
  Pretty: (a: [...Literals][number]) => string;
  Equivalence: Equivalence.Equivalence<Literals[number]>;
  pick: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Keys[number]>;
  omit: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;
  derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => (annotations: SimpleAnnotations) => {
    Schema: S.Literal<[...Keys]>;
    Options: Keys;
    Enum: CreateEnumType<Keys, undefined>;
    Mock: (qty: number) => [...Literals][number][];
  };
  toPgEnum: <Name extends string>(
    name: `${SnakeTag<Name>}_enum`,
  ) => ReturnType<typeof pgEnum<Literals[number], Literals>>;
};

export function stringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<string>,
  const Mapping extends readonly [Literals[number], string][],
>(
  ...args: Literals | [...Literals, { enumMapping?: Mapping }]
): (annotations: SimpleAnnotations) => {
  Schema: S.Literal<[...Literals]>;
  Options: Literals;
  Enum: CreateEnumType<Literals, Mapping | undefined>;
  Mock: (qty: number) => [...Literals][number][];
  JSONSchema: JSONSchema.JsonSchema7Root;
  Pretty: (a: [...Literals][number]) => string;
  Equivalence: Equivalence.Equivalence<Literals[number]>;
  pick: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Keys[number]>;
  omit: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;
  derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => (annotations: SimpleAnnotations) => {
    Schema: S.Literal<[...Keys]>;
    Options: Keys;
    Enum: CreateEnumType<Keys, undefined>;
    Mock: (qty: number) => [...Literals][number][];
  };
  toPgEnum: <Name extends string>(
    name: `${SnakeTag<Name>}_enum`,
  ) => ReturnType<typeof pgEnum<Literals[number], Literals>>;
} {
  // Determine if last argument is options
  const hasOptions =
    args.length > 0 &&
    typeof args[args.length - 1] === "object" &&
    !Array.isArray(args[args.length - 1]) &&
    args[args.length - 1] !== null;

  const literals = (hasOptions ? args.slice(0, -1) : args) as Literals;
  const options = hasOptions
    ? (args[args.length - 1] as { enumMapping?: Mapping })
    : undefined;

  // Create the schema

  // Create the enum object
  let Enum: any;

  if (options?.enumMapping) {
    // Validate at runtime
    const mappingMap = new Map(options.enumMapping);
    const setValues = A.map(options.enumMapping, ([_, v]) => v);
    invariant(
      A.isNonEmptyReadonlyArray(setValues),
      "enumMapping must have unique values",
      {
        file: "packages/common/utils/src/factories/stringLiteralKit.ts",
        line: 226,
        args: [setValues],
      },
    );
    const mappedValues = new Set(setValues);

    // Check all literals are mapped
    for (const literal of literals) {
      if (!mappingMap.has(literal)) {
        throw new Error(`Missing mapping for literal: ${literal}`);
      }
    }

    // Check no duplicate values
    if (mappedValues.size !== options.enumMapping.length) {
      throw new Error("Duplicate values in enumMapping");
    }

    // Create enum with mapped keys
    Enum = {} as any;
    for (const [literal, mappedKey] of options.enumMapping) {
      Enum[mappedKey] = literal;
    }
    Object.freeze(Enum);
  } else {
    // Use the enumFromStringArray utility
    Enum = enumFromStringArray(...literals);
  }

  const pick = <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ): A.NonEmptyReadonlyArray<Keys[number]> => {
    const pickedLiterals = literals.filter((lit) =>
      keys.includes(lit),
    ) as unknown as A.NonEmptyReadonlyArray<Keys[number]>;

    if (pickedLiterals.length === 0) {
      throw new Error("pick operation must result in at least one literal");
    }

    return pickedLiterals;
  };

  const omit = <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ): A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>> => {
    const omittedLiterals = literals.filter(
      (lit) => !keys.includes(lit),
    ) as unknown as A.NonEmptyReadonlyArray<
      Exclude<Literals[number], Keys[number]>
    >;

    if (omittedLiterals.length === 0) {
      throw new Error("omit operation must result in at least one literal");
    }

    return omittedLiterals;
  };

  return (annotations) => {
    const Schema = S.Literal(...literals).annotations({
      ...annotations,
      arbitrary: () => (fc) => fc.constantFrom(...literals),
    });
    return {
      Schema: Schema,
      Options: literals,
      Enum,
      Mock: (qty: number) => FC.sample(Arbitrary.make(Schema), qty),
      JSONSchema: JSONSchema.make(Schema),
      Pretty: Pretty.make(Schema),
      Equivalence: S.equivalence(Schema),
      pick,
      omit,
      toPgEnum: (name) => pgEnum(name, literals),
      derive:
        (...keys) =>
        (annotations) => {
          const Schema = S.Literal(...literals).annotations({
            arbitrary: () => (fc) => fc.constantFrom(...literals),
          });
          return {
            Schema: S.Literal(...keys).annotations({
              ...annotations,
              arbitrary: () => (fc) => fc.constantFrom(...literals),
            }),
            Options: keys,
            Enum: enumFromStringArray(...keys),
            Mock: (qty: number) => FC.sample(Arbitrary.make(Schema), qty),
          };
        },
    } as const;
  };
}

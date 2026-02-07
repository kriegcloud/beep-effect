/**
 * Schema-first State/Event definitions for effect-machine.
 *
 * MachineSchema provides a single source of truth that combines:
 * - Schema for validation/serialization
 * - Variant constructors (like Data.taggedEnum)
 * - $is and $match helpers for pattern matching
 * - Brand integration for compile-time safety
 *
 * @example
 * ```ts
 * import { State, Event, Machine } from "effect-machine"
 *
 * // Define schema-first state
 * const OrderState = State({
 *   Pending: { orderId: Schema.String },
 *   Shipped: { trackingId: Schema.String },
 * })
 *
 * // Infer type from schema
 * type OrderState = typeof OrderState.Type
 *
 * // Use constructors
 * const pending = OrderState.Pending({ orderId: "123" })
 *
 * // Pattern match
 * OrderState.$match(state, {
 *   Pending: (s) => `Order ${s.orderId} pending`,
 *   Shipped: (s) => `Shipped: ${s.trackingId}`,
 * })
 *
 * // Use as Schema for persistence/cluster
 * machine.pipe(Machine.persist({ stateSchema: OrderState, ... }))
 * ```
 *
 * @module
 */
import * as S from "effect/Schema";
import { InvalidSchemaError, MissingMatchHandlerError } from "./errors";
import type { FullEventBrand, FullStateBrand } from "./internal/brands";

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Extract the TypeScript type from a TaggedStruct schema
 */
type TaggedStructType<Tag extends string, Fields extends S.Struct.Fields> = S.Schema.Type<S.TaggedStruct<Tag, Fields>>;

/**
 * Build variant schemas type from definition
 */
type VariantSchemas<D extends Record<string, S.Struct.Fields>> = {
  readonly [K in keyof D & string]: S.TaggedStruct<K, D[K]>;
};

/**
 * Build union type from variant schemas.
 * Used for constraining fluent method type params.
 */
export type VariantsUnion<D extends Record<string, S.Struct.Fields>> = {
  [K in keyof D & string]: TaggedStructType<K, D[K]>;
}[keyof D & string];

/**
 * Check if fields are empty (no required properties)
 */
type IsEmptyFields<Fields extends S.Struct.Fields> = keyof Fields extends never ? true : false;

/**
 * Constructor functions for each variant.
 * Empty structs: plain values with `_tag`: `State.Idle`
 * Non-empty structs require args: `State.Loading({ url })`
 *
 * Each variant also has a `derive` method for constructing from a source object.
 */
/**
 * Constructor functions for each variant.
 * Empty structs: plain values with `_tag`: `State.Idle`
 * Non-empty structs require args: `State.Loading({ url })`
 *
 * Each variant also has a `derive` method for constructing from a source object.
 * The source type uses `object` to accept branded state types without index signature issues.
 */
type VariantConstructors<D extends Record<string, S.Struct.Fields>, Brand> = {
  readonly [K in keyof D & string]: IsEmptyFields<D[K]> extends true
    ? TaggedStructType<K, D[K]> &
        Brand & {
          readonly derive: (source: object) => TaggedStructType<K, D[K]> & Brand;
        }
    : ((args: S.Struct.Constructor<D[K]>) => TaggedStructType<K, D[K]> & Brand) & {
        readonly derive: (
          source: object,
          partial?: undefined | Partial<S.Struct.Constructor<D[K]>>
        ) => TaggedStructType<K, D[K]> & Brand;
        readonly _tag: K;
      };
};

/**
 * Pattern matching cases type
 */
type MatchCases<D extends Record<string, S.Struct.Fields>, R> = {
  readonly [K in keyof D & string]: (value: TaggedStructType<K, D[K]>) => R;
};

/**
 * Base schema interface with pattern matching helpers
 */
interface MachineSchemaBase<D extends Record<string, S.Struct.Fields>, Brand> {
  /**
   * Raw definition record for introspection
   */
  readonly _definition: D;

  /**
   * Per-variant schemas for fine-grained operations
   */
  readonly variants: VariantSchemas<D>;

  /**
   * Type guard: `OrderState.$is("Pending")(value)`
   */
  readonly $is: <Tag extends keyof D & string>(tag: Tag) => (u: unknown) => u is TaggedStructType<Tag, D[Tag]> & Brand;

  /**
   * Pattern matching (curried and uncurried)
   */
  readonly $match: {
    // Curried: $match(cases)(value)
    <R>(cases: MatchCases<D, R>): (value: VariantsUnion<D> & Brand) => R;
    // Uncurried: $match(value, cases)
    <R>(value: VariantsUnion<D> & Brand, cases: MatchCases<D, R>): R;
  };
}

// ============================================================================
// MachineStateSchema Type
// ============================================================================

/**
 * Schema-first state definition that provides:
 * - Schema for encode/decode/validate
 * - Variant constructors: `OrderState.Pending({ orderId: "x" })`
 * - Pattern matching: `$is`, `$match`
 * - Type inference: `typeof OrderState.Type`
 *
 * The D type parameter captures the definition, creating a unique brand
 * per distinct schema definition shape.
 */
export type MachineStateSchema<D extends Record<string, S.Struct.Fields>> = S.Schema<
  VariantsUnion<D> & FullStateBrand<D>,
  VariantsUnion<D>,
  never
> &
  MachineSchemaBase<D, FullStateBrand<D>> &
  VariantConstructors<D, FullStateBrand<D>>;

/**
 * Schema-first event definition (same structure as state, different brand)
 *
 * The D type parameter captures the definition, creating a unique brand
 * per distinct schema definition shape.
 */
export type MachineEventSchema<D extends Record<string, S.Struct.Fields>> = S.Schema<
  VariantsUnion<D> & FullEventBrand<D>,
  VariantsUnion<D>,
  never
> &
  MachineSchemaBase<D, FullEventBrand<D>> &
  VariantConstructors<D, FullEventBrand<D>>;

// ============================================================================
// Implementation
// ============================================================================

/**
 * Build a schema-first definition from a record of tag -> fields
 */
const buildMachineSchema = <D extends Record<string, S.Struct.Fields>>(
  definition: D
): {
  schema: S.Schema<VariantsUnion<D>, VariantsUnion<D>, never>;
  variants: VariantSchemas<D>;
  constructors: Record<string, (args: Record<string, unknown>) => Record<string, unknown>>;
  _definition: D;
  $is: <Tag extends string>(tag: Tag) => (u: unknown) => boolean;
  $match: (valueOrCases: unknown, maybeCases?: undefined | unknown) => unknown;
} => {
  // Build variant schemas
  const variants = {} as Record<string, S.TaggedStruct<string, S.Struct.Fields>>;
  const constructors = {} as Record<string, (args: Record<string, unknown>) => Record<string, unknown>>;

  for (const tag of Object.keys(definition)) {
    const fields = definition[tag];
    if (fields === undefined) continue;

    variants[tag] = S.TaggedStruct(tag, fields);

    // Create constructor that builds tagged struct directly
    // Like Data.taggedEnum, this doesn't validate at construction time
    // Use S.decode for validation when needed
    const fieldNames = new Set(Object.keys(fields));
    const hasFields = fieldNames.size > 0;

    if (hasFields) {
      // Non-empty: constructor function requiring args
      const constructor = (args: Record<string, unknown>) => ({ ...args, _tag: tag });
      constructor._tag = tag;
      constructor.derive = (source: Record<string, unknown>, partial?: undefined | Record<string, unknown>) => {
        const result: Record<string, unknown> = { _tag: tag };
        for (const key of fieldNames) {
          if (key in source) result[key] = source[key];
        }
        if (partial !== undefined) {
          for (const [key, value] of Object.entries(partial)) {
            result[key] = value;
          }
        }
        return result;
      };
      constructors[tag] = constructor;
    } else {
      // Empty: plain value, not callable
      constructors[tag] = { _tag: tag, derive: () => ({ _tag: tag }) } as never;
    }
  }

  // Build union schema from all variants
  const variantArray = Object.values(variants);
  if (variantArray.length === 0) {
    throw new InvalidSchemaError();
  }

  // S.Union requires at least 2 members, handle single variant case
  const unionSchema =
    variantArray.length === 1
      ? variantArray[0]!
      : // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
        S.Union(...(variantArray as [any, any, ...any[]]));

  // Type guard
  const $is =
    <Tag extends string>(tag: Tag) =>
    (u: unknown): boolean =>
      typeof u === "object" && u !== null && "_tag" in u && (u as { _tag: string })._tag === tag;

  // Pattern matching
  const $match = (valueOrCases: unknown, maybeCases?: undefined | unknown): unknown => {
    if (maybeCases !== undefined) {
      // Uncurried: $match(value, cases)
      const value = valueOrCases as { _tag: string };
      const cases = maybeCases as Record<string, (v: unknown) => unknown>;
      const handler = cases[value._tag];
      if (handler === undefined) {
        throw new MissingMatchHandlerError({ tag: value._tag });
      }
      return handler(value);
    }
    // Curried: $match(cases) -> (value) => result
    const cases = valueOrCases as Record<string, (v: unknown) => unknown>;
    return (value: { _tag: string }): unknown => {
      const handler = cases[value._tag];
      if (handler === undefined) {
        throw new MissingMatchHandlerError({ tag: value._tag });
      }
      return handler(value);
    };
  };

  return {
    schema: unionSchema as unknown as S.Schema<VariantsUnion<D>, VariantsUnion<D>, never>,
    variants: variants as unknown as VariantSchemas<D>,
    constructors,
    _definition: definition,
    $is,
    $match,
  };
};

/**
 * Internal helper to create a machine schema (shared by State and Event).
 * Builds the schema object with variants, constructors, $is, and $match.
 */
const createMachineSchema = <D extends Record<string, S.Struct.Fields>>(definition: D) => {
  const { schema, variants, constructors, _definition, $is, $match } = buildMachineSchema(definition);
  return Object.assign(Object.create(schema), {
    variants,
    _definition,
    $is,
    $match,
    ...constructors,
  });
};

/**
 * Create a schema-first State definition.
 *
 * The schema's definition type D creates a unique brand, preventing
 * accidental use of constructors from different state schemas
 * (unless they have identical definitions).
 *
 * @example
 * ```ts
 * const OrderState = MachineS.State({
 *   Pending: { orderId: S.String },
 *   Shipped: { trackingId: S.String },
 * })
 *
 * type OrderState = typeof OrderState.Type
 *
 * // Construct
 * const s = OrderState.Pending({ orderId: "123" })
 *
 * // Pattern match
 * OrderState.$match(s, {
 *   Pending: (v) => v.orderId,
 *   Shipped: (v) => v.trackingId,
 * })
 *
 * // Validate
 * S.decodeUnknownSync(OrderState)(rawJson)
 * ```
 */
export const State = <const D extends Record<string, S.Struct.Fields>>(definition: D): MachineStateSchema<D> =>
  createMachineSchema(definition) as MachineStateSchema<D>;

/**
 * Create a schema-first Event definition.
 *
 * The schema's definition type D creates a unique brand, preventing
 * accidental use of constructors from different event schemas
 * (unless they have identical definitions).
 *
 * @example
 * ```ts
 * const OrderEvent = MachineS.Event({
 *   Ship: { trackingId: S.String },
 *   Cancel: {},
 * })
 *
 * type OrderEvent = typeof OrderEvent.Type
 *
 * // Construct
 * const e = OrderEvent.Ship({ trackingId: "abc" })
 * ```
 */
export const Event = <const D extends Record<string, S.Struct.Fields>>(definition: D): MachineEventSchema<D> =>
  createMachineSchema(definition) as MachineEventSchema<D>;

/**
 * Utilities shared across the contract runtime. These helpers are not exported
 * publicly and primarily exist to keep schema transformations consistent.
 */
import * as S from "effect/Schema";

/**
 * An empty struct schema reused anywhere a contract helper needs to express
 * “no configurable options” without allocating a new schema instance.
 */
export const constEmptyStruct = S.Struct({});

/**
 * Casts a schema to one whose context requirement is `never`. Many contract
 * helpers surface schemas to consumers who should not be forced to provide the
 * context parameter, so this helper centralizes the unsafe cast.
 *
 * @param schema - The schema to cast.
 * @returns The same schema typed with a `never` context requirement.
 */
export const toSchemaAnyNoContext = <Schema extends S.Schema.All>(
  schema: Schema
): S.Schema<S.Schema.Type<Schema>, S.Schema.Encoded<Schema>, never> =>
  S.asSchema(schema) as S.Schema<S.Schema.Type<Schema>, S.Schema.Encoded<Schema>, never>;

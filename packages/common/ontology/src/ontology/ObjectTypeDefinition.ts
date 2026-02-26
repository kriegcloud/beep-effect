/**
 * Ontology object type definition models.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/ObjectTypeDefinition
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/ObjectTypeDefinition");

/**
 * Marker interface for carrying compile-time definition metadata.
 *
 * @since 0.0.0
 * @category models
 */
export interface DefinitionMetadataCarrier {
  readonly __DefinitionMetadata?: S.Struct<S.Struct.Fields>;
}

/**
 * Infer metadata struct schema from a metadata carrier.
 *
 * @since 0.0.0
 * @category models
 */
export type InferDefinitionMetadataStruct<T extends DefinitionMetadataCarrier> = NonNullable<T["__DefinitionMetadata"]>;

/**
 * Extract validated compile-time metadata from a definition carrier.
 *
 * @since 0.0.0
 * @category constructors
 */
export const CompileTimeMetadata = <const T extends DefinitionMetadataCarrier>(
  fields: T
): InferDefinitionMetadataStruct<T> => {
  if (!isCompileTimeMetadata(fields)) {
    throw new Error("Invalid compile time metadata");
  }

  return fields.__DefinitionMetadata;
};

/**
 * Types for {@link CompileTimeMetadata}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace CompileTimeMetadata {
  /**
   * Compile-time metadata schema type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Schema<T extends DefinitionMetadataCarrier> = InferDefinitionMetadataStruct<T>;
}

const FieldValue = S.declare(S.isSchema);
const FieldEntry = S.Tuple([S.PropertyKey, FieldValue]);

/**
 * Predicate that checks whether metadata carrier contains compile-time schema metadata.
 *
 * @since 0.0.0
 * @category predicates
 */
export const isCompileTimeMetadata = <T extends DefinitionMetadataCarrier>(
  fields: T
): fields is T & { readonly __DefinitionMetadata: NonNullable<T["__DefinitionMetadata"]> } =>
  P.hasProperty(fields, "__DefinitionMetadata") &&
  P.isNotNullish(fields.__DefinitionMetadata) &&
  S.isSchema(fields.__DefinitionMetadata) &&
  P.hasProperty(fields.__DefinitionMetadata, "fields") &&
  P.isObject(fields.__DefinitionMetadata.fields) &&
  A.every(R.toEntries(fields.__DefinitionMetadata.fields), S.is(FieldEntry));

/**
 * Base ontology metadata kinds represented by object and interface definitions.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ObjectInterfaceBaseMetadataType = LiteralKit(["object", "interface"]).annotate(
  $I.annote("ObjectInterfaceBaseMetadataType", {
    description: "Literal union of ontology metadata base kinds: object and interface.",
  })
);

/**
 * Temporary compile-time metadata check fixture.
 *
 * @since 0.0.0
 * @category constants
 */
export const dummyTest = CompileTimeMetadata({
  __DefinitionMetadata: S.Struct({
    beep: S.Literal("hole"),
  }),
});

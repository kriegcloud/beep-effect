/**
 * Public entrypoint for the `@beep/identity` namespace builders and helper types.
 *
 * @example
 * import * as Identity from "@beep/identity";
 * import type * as IdentityTypes from "@beep/identity";
 *
 * const schemaAnnotations = Identity.SchemaId.make("annotations");
 * const schemaSymbol: IdentityTypes.IdentitySymbol<"@beep/schema/annotations"> = schemaAnnotations.symbol();
 *
 * @category Identity/Module
 * @since 0.1.0
 */
export { BeepId } from "./BeepId";
export * from "./modules";
export type {
  IdentityAnnotation,
  IdentityAnnotationResult,
  IdentityComposer,
  IdentityString,
  IdentitySymbol,
  ModulePath,
  SchemaAnnotationExtras,
  Segment,
  SegmentTuple,
  SegmentValue,
} from "./types";

/**
 * Object-link accessor typing helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/definitions/LinkDefinitions
 */

import type { ExtractOptions, Osdk } from "../OsdkObjectFrom.js";
import type { Augments, FetchPageArgs, SelectArg } from "../object/FetchPageArgs.js";
import type { Result } from "../object/Result.js";
import type { ObjectSet } from "../objectSet/ObjectSet.js";
import type { InterfaceMetadata } from "../ontology/InterfaceDefinition.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type {
  CompileTimeMetadata,
  ObjectMetadata,
  ObjectTypeDefinition,
  ObjectTypeLinkKeysFrom2,
} from "../ontology/ObjectTypeDefinition.js";
/**
 * The `$link` container shape used on OSDK instances.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OsdkObjectLinksObject<O extends ObjectOrInterfaceDefinition> =
  ObjectTypeLinkKeysFrom2<O> extends never
    ? never
    : {
        readonly [L in ObjectTypeLinkKeysFrom2<O>]: OsdkObjectLinksEntry<O, L>;
      };

/**
 * Resolve accessor type for a specific link entry.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OsdkObjectLinksEntry<Q extends ObjectOrInterfaceDefinition, L extends ObjectTypeLinkKeysFrom2<Q>> =
  CompileTimeMetadata<Q>["links"][L] extends ObjectMetadata.Link<infer T, infer M>
    ? M extends false
      ? SingleLinkAccessor<T>
      : ObjectSet<T>
    : CompileTimeMetadata<Q>["links"][L] extends InterfaceMetadata.Link<infer T, infer _M>
      ? ObjectSet<T>
      : never;

/**
 * Convert `undefined`/missing booleans to false at the type level.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DefaultToFalse<B extends boolean | undefined> = false extends B
  ? false
  : undefined extends B
    ? false
    : true;

/**
 * Accessor contract for a single-valued link.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface SingleLinkAccessor<T extends ObjectTypeDefinition> {
  /** Load the linked object without a result wrapper. */
  fetchOne: <const A extends SelectArg<T, PropertyKeys<T>, boolean>>(
    options?: A
  ) => Promise<
    A extends FetchPageArgs<T, infer L, infer R, Augments, infer S>
      ? Osdk.Instance<T, ExtractOptions<R, S>, L & PropertyKeys<T>>
      : Osdk.Instance<T>
  >;

  /** Load the linked object with a result wrapper. */
  fetchOneWithErrors: <const A extends SelectArg<T, PropertyKeys<T>, boolean>>(
    options?: A
  ) => Promise<
    Result<
      A extends FetchPageArgs<T, infer L, infer R, Augments, infer S>
        ? Osdk.Instance<T, ExtractOptions<R, S>, L>
        : Osdk.Instance<T>
    >
  >;
}

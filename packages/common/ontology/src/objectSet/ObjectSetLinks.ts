/**
 * Object-set link paging and lightweight link instance helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/objectSet/ObjectSetLinks
 */

import type { ObjectIdentifiers } from "../OsdkBase.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
/**
 * Link type API names present on a definition.
 *
 * @since 0.0.0
 * @category models
 */
export type LinkTypeApiNamesFor<Q extends ObjectOrInterfaceDefinition> = Extract<
  keyof CompileTimeMetadata<Q>["links"],
  string
>;

type LinkedObjectType<
  Q extends ObjectOrInterfaceDefinition,
  LINK_TYPE_API_NAME extends LinkTypeApiNamesFor<Q>,
> = NonNullable<CompileTimeMetadata<Q>["links"][LINK_TYPE_API_NAME]["__OsdkLinkTargetType"]>;

/**
 * Minimal directed link instance carrying source/target identities.
 *
 * @since 0.0.0
 * @category models
 */
export type MinimalDirectedObjectLinkInstance<
  Q extends ObjectOrInterfaceDefinition,
  LINK_TYPE_API_NAME extends LinkTypeApiNamesFor<Q>,
> = {
  source: ObjectIdentifiers<Q>;
  target: ObjectIdentifiers<LinkedObjectType<Q, LINK_TYPE_API_NAME>>;
  linkType: LINK_TYPE_API_NAME;
};

/**
 * Paginated link-fetch result payload.
 *
 * @since 0.0.0
 * @category models
 */
export type FetchLinksPageResult<Q extends ObjectOrInterfaceDefinition, LINK_TYPE extends LinkTypeApiNamesFor<Q>> = {
  data: Array<MinimalDirectedObjectLinkInstance<Q, LINK_TYPE>>;
  nextPageToken?: string;
};

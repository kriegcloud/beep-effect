/**
 * Experimental multi-object fetch-by-rid capability token.
 *
 * @since 0.0.0
 * @module @beep/ontology/experimental/fetchPageByRid
 */

import type { Augments, FetchPageArgs, NullabilityAdherence } from "../object/FetchPageArgs.js";
import type { FetchPageResult } from "../object/FetchPageResult.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { Experiment } from "./Experiment.js";

/**
 * Typed fetch-page-by-rid function.
 *
 * @since 0.0.0
 * @category DomainModel
 */
type FetchPageByRidFn = <
  Q extends ObjectOrInterfaceDefinition,
  const L extends PropertyKeys<Q>,
  const R extends boolean,
  const S extends NullabilityAdherence,
  const T extends boolean,
  const A extends Augments = never,
>(
  objectType: Q,
  rids: string[],
  options?: FetchPageArgs<Q, L, R, A, S, T>
) => Promise<FetchPageResult<Q, L, R, S, T>>;

/**
 * Untyped fetch-page-by-rid function for mixed-type RID sets.
 *
 * @since 0.0.0
 * @category DomainModel
 */
type FetchPageByRidNoTypeFn = <
  const R extends boolean,
  const S extends NullabilityAdherence,
  const T extends boolean,
  const A extends Augments = never,
>(
  rids: readonly string[],
  options?: FetchPageArgs<ObjectOrInterfaceDefinition, string, R, A, S, T>
) => Promise<FetchPageResult<ObjectOrInterfaceDefinition, string, R, S, T>>;

/**
 * Experiment payload for fetch-page-by-rid support.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FetchPageByRidPayload = {
  fetchPageByRid: FetchPageByRidFn;
  fetchPageByRidNoType: FetchPageByRidNoTypeFn;
};

/**
 * Experiment token for fetch-page-by-rid support.
 *
 * @since 0.0.0
 * @category Uncategorized
 */
export const __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchPageByRid: Experiment<
  "2.2.0",
  "__EXPERIMENTAL__NOT_SUPPORTED_YET__fetchPageByRid",
  FetchPageByRidPayload
> = {
  name: "__EXPERIMENTAL__NOT_SUPPORTED_YET__fetchPageByRid",
  type: "experiment",
  version: "2.2.0",
};

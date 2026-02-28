/**
 * Experimental single-object fetch-by-rid capability token.
 *
 * @since 0.0.0
 * @module @beep/ontology/experimental/fetchOneByRid
 */

import type { ExtractOptions, Osdk } from "../OsdkObjectFrom.js";
import type { NullabilityAdherence, SelectArg } from "../object/FetchPageArgs.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { Experiment } from "./Experiment.js";

/**
 * Fetches a single object by RID for a concrete ontology type.
 *
 * @since 0.0.0
 * @category models
 */
type FetchOneByRidFn = <
  Q extends ObjectOrInterfaceDefinition,
  const L extends PropertyKeys<Q>,
  const R extends boolean,
  const S extends false | "throw" = NullabilityAdherence.Default,
>(
  objectType: Q,
  rid: string,
  options?: SelectArg<Q, L, R, S>
) => Promise<Osdk.Instance<Q, ExtractOptions<R, S>, L>>;

/**
 * Experiment token for fetch-one-by-rid support.
 *
 * @since 0.0.0
 * @category experimental
 */
export const __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchOneByRid: Experiment<
  "2.1.0",
  "__EXPERIMENTAL__NOT_SUPPORTED_YET__fetchOneByRid",
  { fetchOneByRid: FetchOneByRidFn }
> = {
  name: "__EXPERIMENTAL__NOT_SUPPORTED_YET__fetchOneByRid",
  type: "experiment",
  version: "2.1.0",
};

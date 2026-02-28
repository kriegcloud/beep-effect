/**
 * Experimental bulk-link traversal capability token.
 *
 * @since 0.0.0
 * @module @beep/ontology/experimental/getBulkLinks
 */

import type { Osdk } from "../OsdkObjectFrom.js";
import type { EXPERIMENTAL_BulkLinkResult } from "../objectSet/BulkLinkResult.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { Experiment } from "./Experiment.js";

/**
 * Streams link results for a batch of ontology objects.
 *
 * @since 0.0.0
 * @category models
 */
type GetBulkLinksFn = <T extends ObjectOrInterfaceDefinition>(
  objs: Osdk.Instance<T>[],
  links: string[]
) => AsyncGenerator<EXPERIMENTAL_BulkLinkResult, void, undefined>;

/**
 * Experiment token for bulk-link retrieval support.
 *
 * @since 0.0.0
 * @category experimental
 */
export const __EXPERIMENTAL__NOT_SUPPORTED_YET__getBulkLinks: Experiment<
  "2.0.8",
  "__EXPERIMENTAL__NOT_SUPPORTED_YET__getBulkLinks",
  { getBulkLinks: GetBulkLinksFn }
> = {
  name: "__EXPERIMENTAL__NOT_SUPPORTED_YET__getBulkLinks",
  type: "experiment",
  version: "2.0.8",
};

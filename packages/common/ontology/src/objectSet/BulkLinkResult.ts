/**
 * Experimental bulk-link operation result payload.
 *
 * @since 0.0.0
 * @module @beep/ontology/objectSet/BulkLinkResult
 */

import type { OsdkBase } from "../OsdkBase.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";

/**
 * Bulk-link response row.
 *
 * @since 0.0.0
 * @category models
 */
export interface EXPERIMENTAL_BulkLinkResult {
  object: OsdkBase<ObjectOrInterfaceDefinition>;
  linkApiName: string;
  otherObjectApiName: string | null | undefined;
  otherObjectPk: unknown;
}

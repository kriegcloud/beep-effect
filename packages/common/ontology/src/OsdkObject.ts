/**
 * Legacy OSDK object compatibility type.
 *
 * @since 0.0.0
 * @module @beep/ontology/OsdkObject
 */
import type { PropertyValueWireToClient } from "./mapping/PropertyValueMapping.js";
import type { PrimaryKeyTypes } from "./ontology/PrimaryKeyTypes.js";

/**
 * Deprecated compatibility surface for legacy OSDK object instances.
 *
 * @since 0.0.0
 * @category models
 * @deprecated Use `OsdkBase`-family types.
 */
export type OsdkObject<N extends string> = {
  readonly $apiName: N;
  readonly $objectType: string;
  readonly $primaryKey: PropertyValueWireToClient[PrimaryKeyTypes];
};

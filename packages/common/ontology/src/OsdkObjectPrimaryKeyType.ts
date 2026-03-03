/**
 * Primary-key type helpers for OSDK object definitions.
 *
 * @since 0.0.0
 * @module @beep/ontology/OsdkObjectPrimaryKeyType
 */
import type { DataValueWireToClient } from "./mapping/DataValueMapping.js";
import type { PrimaryKeyTypes } from "./ontology/PrimaryKeyTypes.js";

type ExtractMetadataPrimaryKey<Q> = Q extends {
  readonly __DefinitionMetadata?: {
    readonly primaryKeyType: infer Key;
  };
}
  ? Key extends keyof DataValueWireToClient
    ? DataValueWireToClient[Key]
    : unknown
  : unknown;

/**
 * Primary-key runtime value type for an OSDK object/interface definition.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OsdkObjectPrimaryKeyType<Q> = ExtractMetadataPrimaryKey<Q> & DataValueWireToClient[PrimaryKeyTypes];

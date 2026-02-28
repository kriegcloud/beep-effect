/**
 * Base OSDK object identifiers and primary-key helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/OsdkBase
 */
import type { PropertyValueWireToClient } from "./mapping/PropertyValueMapping.js";
import type { OsdkObjectPrimaryKeyType } from "./OsdkObjectPrimaryKeyType.js";
import type { ObjectOrInterfaceDefinition } from "./ontology/ObjectOrInterface.js";
import type { ObjectSpecifier } from "./ontology/ObjectSpecifier.js";
import type { ObjectTypeDefinition } from "./ontology/ObjectTypeDefinition.js";
import type { PrimaryKeyTypes } from "./ontology/PrimaryKeyTypes.js";

/**
 * Canonical object identity fields for ontology-backed objects.
 *
 * @since 0.0.0
 * @category models
 */
export type ObjectIdentifiers<Q extends ObjectOrInterfaceDefinition> = {
  readonly $apiName: Q["apiName"];
  readonly $primaryKey: PrimaryKeyType<Q>;
};

/**
 * Common OSDK object base payload.
 *
 * @since 0.0.0
 * @category models
 */
export type OsdkBase<Q extends ObjectOrInterfaceDefinition> = ObjectIdentifiers<Q> & {
  readonly $objectSpecifier: ObjectSpecifier<Q>;
  readonly $objectType: string;
  readonly $title: string | undefined;
};

/**
 * Resolve primary-key runtime value type for a given object or interface definition.
 *
 * @since 0.0.0
 * @category models
 */
export type PrimaryKeyType<Q extends ObjectOrInterfaceDefinition> = (Q extends ObjectTypeDefinition
  ? OsdkObjectPrimaryKeyType<Q>
  : unknown) &
  PropertyValueWireToClient[PrimaryKeyTypes];

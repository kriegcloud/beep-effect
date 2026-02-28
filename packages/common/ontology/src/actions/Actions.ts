/**
 * Action parameter and option conversion helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/actions/Actions
 */
import type { DataValueClientToWire } from "../mapping/DataValueMapping.js";
import type { ObjectIdentifiers } from "../OsdkBase.js";
import type { OsdkObjectPrimaryKeyType } from "../OsdkObjectPrimaryKeyType.js";
import type { ObjectSet } from "../objectSet/ObjectSet.js";
import type { InterfaceDefinition } from "../ontology/InterfaceDefinition.js";
import type { CompileTimeMetadata, ObjectTypeDefinition } from "../ontology/ObjectTypeDefinition.js";
import type { ActionResults, ValidateActionResponseV2 } from "./ActionResults.js";
import type { NULL_VALUE } from "./NullValue.js";
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("actions/Actions");
/**
 * Apply-action options for single action execution.
 *
 * @since 0.0.0
 * @category models
 */
export type ApplyActionOptions =
  | { $returnEdits?: true; $validateOnly?: false }
  | { $validateOnly?: true; $returnEdits?: false };

/**
 * Apply-action options for batch action execution.
 *
 * @since 0.0.0
 * @category models
 */
export type ApplyBatchActionOptions = { $returnEdits?: boolean };

/**
 * Action parameter conversion helper namespace.
 *
 * @since 0.0.0
 * @category models
 */
export namespace ActionParam {
  /**
   * Resolve primitive action parameter type from wire primitive key.
   *
   * @since 0.0.0
   * @category models
   */
  export type PrimitiveType<T extends keyof DataValueClientToWire> = DataValueClientToWire[T];

  /**
   * Resolve object action parameter type.
   *
   * @since 0.0.0
   * @category models
   */
  export type ObjectType<T extends ObjectTypeDefinition> = ObjectIdentifiers<T> | OsdkObjectPrimaryKeyType<T>;

  /**
   * Resolve object-set action parameter type.
   *
   * @since 0.0.0
   * @category models
   */
  export type ObjectSetType<T extends ObjectTypeDefinition> = ObjectSet<T>;

  /**
   * Resolve interface action parameter type.
   *
   * @since 0.0.0
   * @category models
   */
  export type InterfaceType<T extends InterfaceDefinition> = {
    $objectType: CompileTimeMetadata<T> extends { implementedBy: infer U }
      ? U extends ReadonlyArray<never>
        ? string
        : U extends ReadonlyArray<string>
          ? U[number]
          : string
      : string;
    $primaryKey: string | number;
  };

  /**
   * Resolve struct parameter type from wire primitive map.
   *
   * @since 0.0.0
   * @category models
   */
  export type StructType<T extends Record<string, keyof DataValueClientToWire>> = {
    [K in keyof T]: DataValueClientToWire[T[K]];
  };

  /**
   * Sentinel type used to pass explicit null for nullable action parameters.
   *
   * @since 0.0.0
   * @category models
   */
  export type NullValueType = typeof NULL_VALUE;
}

/**
 * Action edit response alias.
 *
 * @since 0.0.0
 * @category models
 */
export type ActionEditResponse = ActionResults;

/**
 * Action validation response alias.
 *
 * @since 0.0.0
 * @category models
 */
export type ActionValidationResponse = ValidateActionResponseV2;

/**
 * Ontology interface definition models.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/InterfaceDefinition
 */
import type { OsdkMetadata } from "../OsdkMetadata.js";
import type {
  ObjectInterfaceBaseMetadata,
  ObjectInterfaceCompileDefinition,
  ObjectTypeDefinition,
} from "./ObjectTypeDefinition.js";
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/InterfaceDefinition");
/**
 * Metadata carried by ontology interface definitions.
 *
 * @since 0.0.0
 * @category models
 */
export interface InterfaceMetadata extends ObjectInterfaceBaseMetadata {
  readonly type: "interface";
  readonly implementedBy?: ReadonlyArray<string>;
  readonly links: Record<string, InterfaceMetadata.Link<ObjectTypeDefinition | InterfaceDefinition, boolean>>;
}

/**
 * Compile-time description of an ontology interface definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface InterfaceDefinition {
  readonly type: "interface";
  readonly apiName: string;
  readonly osdkMetadata?: OsdkMetadata;
  readonly __DefinitionMetadata?: InterfaceMetadata & ObjectInterfaceCompileDefinition;
}

/**
 * Types for {@link InterfaceMetadata}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace InterfaceMetadata {
  /**
   * Compile-time link metadata for interface link targets.
   *
   * @since 0.0.0
   * @category models
   */
  export interface Link<Q extends ObjectTypeDefinition | InterfaceDefinition, M extends boolean> {
    readonly __OsdkLinkTargetType?: Q;
    readonly targetTypeApiName: Q["apiName"];
    readonly multiplicity: M;
    readonly targetType: Q["type"];
  }
}

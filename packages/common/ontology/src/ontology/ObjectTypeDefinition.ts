/**
 * Ontology object type definition models and compile-time metadata helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/ObjectTypeDefinition
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import type { OsdkMetadata } from "../OsdkMetadata.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "./ObjectOrInterface.js";
import type { PrimaryKeyTypes } from "./PrimaryKeyTypes.js";
import type { VersionString } from "./VersionString.js";
import type { PropertyValueFormattingRule } from "./valueFormatting/PropertyValueFormattingRule.js";
import type { WirePropertyTypes } from "./WirePropertyTypes.js";

const $I = $OntologyId.create("ontology/ObjectTypeDefinition");

/**
 * Runtime schema for object/interface metadata discriminator.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ObjectInterfaceBaseMetadataType = LiteralKit(["object", "interface"]).pipe(
  S.annotate(
    $I.annote("ObjectInterfaceBaseMetadataType", {
      description: "Literal union for ontology metadata base kinds.",
    })
  )
);

/**
 * Extract compile-time definition metadata from a definition carrier.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CompileTimeMetadata<T extends { __DefinitionMetadata?: object }> = NonNullable<T["__DefinitionMetadata"]>;

/**
 * Property-definition extraction helper from compile-time metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ObjectTypePropertyDefinitionFrom2<
  Q extends ObjectOrInterfaceDefinition,
  P extends PropertyKeys<Q>,
> = CompileTimeMetadata<Q>["properties"][P];

/**
 * Shared metadata fields for object and interface definitions.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface ObjectInterfaceBaseMetadata {
  readonly type: "object" | "interface";
  readonly apiName: string;
  readonly displayName: string;
  readonly description: string | undefined;
  readonly properties: Record<string, ObjectMetadata.Property>;
  readonly rid: string;
  /**
   * Represents implemented interfaces for object definitions.
   */
  readonly implements?: ReadonlyArray<string>;
}

/**
 * Additional compile-time-only definition metadata used by generated code.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface ObjectInterfaceCompileDefinition {
  readonly type: "object" | "interface";
  readonly objectSet?: unknown;
  readonly props?: unknown;
  readonly strictProps?: unknown;
  readonly linksType?: unknown;
}

/**
 * Version expectation marker for client-generated definitions.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface VersionBound<V extends VersionString<number, number, number>> {
  readonly __expectedClientVersion?: V;
}

/**
 * Metadata carried by ontology object definitions.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface ObjectMetadata extends ObjectInterfaceBaseMetadata {
  readonly type: "object";
  readonly primaryKeyApiName: keyof this["properties"];
  readonly titleProperty: keyof this["properties"];
  readonly links: Record<string, ObjectMetadata.Link<ObjectTypeDefinition, boolean>>;
  readonly primaryKeyType: PrimaryKeyTypes;
  readonly icon: Icon | undefined;
  readonly visibility: ObjectTypeVisibility | undefined;
  readonly pluralDisplayName: string;
  readonly status: ReleaseStatus | undefined;
  readonly interfaceMap: Record<string, Record<string, string>>;
  readonly inverseInterfaceMap: Record<string, Record<string, string>>;
}

/**
 * Types for {@link ObjectMetadata}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace ObjectMetadata {
  /**
   * Property metadata for ontology object properties.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface Property {
    readonly readonly?: boolean;
    readonly displayName?: string;
    readonly description?: string;
    readonly type: WirePropertyTypes;
    readonly multiplicity?: boolean;
    readonly nullable?: boolean;
    readonly valueTypeApiName?: string;
    readonly valueFormatting?: PropertyValueFormattingRule;
  }

  /**
   * Link metadata for object definition links.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export interface Link<Q extends ObjectTypeDefinition, M extends boolean> {
    readonly __OsdkLinkTargetType?: Q;
    readonly targetType: Q["apiName"];
    readonly multiplicity: M;
  }
}

/**
 * Compile-time description of an ontology object definition.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface ObjectTypeDefinition {
  readonly type: "object";
  readonly apiName: string;
  readonly osdkMetadata?: OsdkMetadata;
  readonly __DefinitionMetadata?: ObjectMetadata & ObjectInterfaceCompileDefinition;
}

/**
 * Link-key extraction helper from compile-time metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ObjectTypeLinkKeysFrom2<Q extends ObjectOrInterfaceDefinition> = keyof CompileTimeMetadata<Q>["links"] &
  string;

/**
 * Canonical property metadata constructor type.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface PropertyDef<
  T extends WirePropertyTypes,
  N extends "nullable" | "non-nullable" = "nullable",
  M extends "array" | "single" = "single",
> extends ObjectMetadata.Property {
  readonly type: T;
  readonly multiplicity: M extends "array" ? true : false;
  readonly nullable: N extends "nullable" ? true : false;
}

/**
 * Supported object release statuses.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ReleaseStatus = "ACTIVE" | "EXPERIMENTAL" | "DEPRECATED" | "ENDORSED";

type ObjectTypeVisibility = "NORMAL" | "PROMINENT" | "HIDDEN";

type BlueprintIcon = {
  readonly type: "blueprint";
  readonly color: string;
  readonly name: string;
};

type Icon = BlueprintIcon;

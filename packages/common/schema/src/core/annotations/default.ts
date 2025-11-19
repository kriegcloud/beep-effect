/**
 * Default annotation symbols and helpers that back schema metadata.
 *
 * This module mirrors the previous schema package but funnels through identity helpers.
 *
 * @example
 * import * as S from "effect/Schema";
 * import * as CoreAnnotations from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [CoreAnnotations.BSFieldName]: "email" });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
import type { UnsafeTypes } from "@beep/types";
import type * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type * as Pretty from "effect/Pretty";
import * as AST from "effect/SchemaAST";
import { Id } from "./_id";

declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [LabelAnnotationId]?: string;
      [BSFieldName]?: string;
      [BSCustomField]?: boolean;
      [BSSkipField]?: boolean;
      [BSEntity]?: Schema.Any;
      [BSEdge]?: BSEdgeAnnotation;
      [BSFolder]?: BSFolderAnnotation;
      [BSSkipEntity]?: boolean;
      [BSTransformer]?: unknown;
      [BSFolderType]?: string;
      [BSTable]?: unknown;
      [BSUIConfig]?: FieldConfig;
      [BSRelations]?: ReadonlyArray<RelationConfig>;
      [BSForeignKey]?: {
        targetEntityTag: string;
      };
      [BSFilterFn]?: (entity: A) => boolean;
    }

    interface Doc<A> extends AST.Annotations {
      [BSFieldName]?: string;
      [BSCustomField]?: boolean;
      [BSSkipField]?: boolean;
      [BSEntity]?: Schema.Any;
      [BSEdge]?: BSEdgeAnnotation;
      [BSFolder]?: BSFolderAnnotation;
      [BSSkipEntity]?: boolean;
      [BSTransformer]?: unknown;
      [BSFolderType]?: string;
      [BSTable]?: unknown;
      [BSUIConfig]?: FieldConfig;
      [BSRelations]?: ReadonlyArray<RelationConfig>;
      [BSForeignKey]?: {
        targetEntityTag: string;
      };
      [BSFilterFn]?: (entity: A) => boolean;
    }
  }
}

/**
 * Annotation symbol used to attach human-readable labels to schemas.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { LabelAnnotationId } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [LabelAnnotationId]: "First Name" });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const LabelAnnotationId = Id.compose("LabelAnnotation").symbol();

/**
 * Annotation symbol identifying canonical BS field names.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSFieldName } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [BSFieldName]: "email" });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSFieldName = Id.compose("fieldName").symbol();

/**
 * Annotation symbol toggling bespoke UI control rendering.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSCustomField } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [BSCustomField]: true });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSCustomField = Id.compose("customField").symbol();

/**
 * Annotation symbol that omits a schema field from generated forms.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSSkipField } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [BSSkipField]: true });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSSkipField = Id.compose("skipField").symbol();

/**
 * Annotation symbol pointing to the entity schema for a field.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSEntity } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [BSEntity]: S.Struct({ id: S.String }) });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSEntity = Id.compose("entity").symbol();

/**
 * Annotation symbol describing edge metadata for graph relationships.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSEdge } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({
 *   [BSEdge]: { relationshipType: "memberOf", targetEntityTypeTag: "group" },
 * });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSEdge = Id.compose("edge").symbol();

/**
 * Annotation symbol describing folder metadata for grouping entities.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSFolder } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [BSFolder]: { folderType: "directory" } });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSFolder = Id.compose("folder").symbol();

/**
 * Annotation symbol toggling whether an entity should be omitted from sync flows.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSSkipEntity } from "@beep/schema/core/annotations/default";
 *
 * const person = S.Struct({ id: S.String }).annotations({ [BSSkipEntity]: true });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSSkipEntity = Id.compose("skipEntity").symbol();

/**
 * Annotation symbol carrying transformation hints for runtime processing.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSTransformer } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [BSTransformer]: (value: string) => value.trim() });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSTransformer = Id.compose("transformer").symbol();

/**
 * Annotation symbol for predicate filters that decide whether an entity syncs.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSFilterFn } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.Struct({ active: S.Boolean }).annotations({
 *   [BSFilterFn]: (entity: { readonly active: boolean }) => entity.active === true,
 * });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSFilterFn = Id.compose("filterFn").symbol();

/**
 * Annotation symbol for tagging folders with semantic folder types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSFolderType } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({ [BSFolderType]: "giving" });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSFolderType = Id.compose("folderType").symbol();

/**
 * Annotation symbol for mapping schema fields to backing database tables.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSTable } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.Struct({ id: S.String }).annotations({ [BSTable]: "people" });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSTable = Id.compose("table").symbol();

/**
 * Annotation symbol for attaching UI metadata (forms, tables, navigation) to schemas.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSUIConfig } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({
 *   [BSUIConfig]: { field: { type: "email", label: "Email" } },
 * });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSUIConfig = Id.compose("uiConfig").symbol();

/**
 * Annotation symbol describing relation metadata for entity schemas.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSRelations } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.Struct({ id: S.String }).annotations({
 *   [BSRelations]: [{ key: "groups", targetEntityTag: "group" }],
 * });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSRelations = Id.compose("relations").symbol();

/**
 * Annotation symbol describing a foreign key target for a field.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { BSForeignKey } from "@beep/schema/core/annotations/default";
 *
 * const schema = S.String.annotations({
 *   [BSForeignKey]: { targetEntityTag: "person" },
 * });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const BSForeignKey = Id.compose("foreignKey").symbol();

/**
 * Edge metadata encoding a relationship type and target entity tag.
 *
 * @example
 * import type { BSEdgeAnnotation } from "@beep/schema/core/annotations/default";
 *
 * const metadata: BSEdgeAnnotation = {
 *   relationshipType: "memberOf",
 *   targetEntityTypeTag: "group",
 * };
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type BSEdgeAnnotation = {
  relationshipType: string;
  targetEntityTypeTag: string;
};

/**
 * Folder metadata describing how an entity renders in navigation or explorers.
 *
 * @example
 * import type { BSFolderAnnotation } from "@beep/schema/core/annotations/default";
 *
 * const folder: BSFolderAnnotation = { folderType: "domain" };
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type BSFolderAnnotation = {
  folderType: string;
};

/**
 * UI configuration type for form, table, and navigation metadata.
 *
 * @example
 * import type { FieldConfig } from "@beep/schema/core/annotations/default";
 *
 * const config: FieldConfig = {
 *   field: { type: "email", label: "Email" },
 *   table: { header: "Email", sortable: true },
 * };
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export interface FieldConfig {
  field?: {
    type?:
      | "text"
      | "email"
      | "password"
      | "slug"
      | "textarea"
      | "number"
      | "select"
      | "combobox"
      | "singleCombobox"
      | "switch"
      | "date"
      | "datetime"
      | "tags"
      | "otp"
      | "addressLocation";
    label?: string;
    placeholder?: string;
    required?: boolean;
    hidden?: boolean;
    options?: ReadonlyArray<{ readonly value: string; readonly label: string }>;
    rows?: number;
    searchable?: boolean;
    creatable?: boolean;
    multiple?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number;
    order?: number;
    composite?: ReadonlyArray<string>;
  };
  table?: {
    header?: string;
    width?: number;
    sortable?: boolean;
    filterable?: boolean;
    cellType?:
      | "text"
      | "email"
      | "number"
      | "boolean"
      | "date"
      | "datetime"
      | "currency"
      | "badge"
      | "avatar"
      | "link"
      | "entityLink";
    hidden?: boolean;
    pinned?: "left" | "right";
    order?: number;
    readonly?: boolean;
  };
  navigation?: {
    enabled: boolean;
    title: string;
    icon?: string;
    url?: string;
    module:
      | "directory"
      | "domain"
      | "collection"
      | "schedule"
      | "giving"
      | "management"
      | "drive"
      | "system"
      | "external";
    order?: number;
    description?: string;
  };

  meta?: {
    disableCreate?: boolean;
    disableEdit?: boolean;
    disableDelete?: boolean;
  };
}

/**
 * Direction of a relationship between two entities.
 *
 * @example
 * import type { RelationDirection } from "@beep/schema/core/annotations/default";
 *
 * const direction: RelationDirection = "outbound";
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type RelationDirection = "outbound" | "inbound" | "both";

/**
 * Table configuration for rendering relationship badges.
 *
 * @example
 * import type { RelationUiTable } from "@beep/schema/core/annotations/default";
 *
 * const table: RelationUiTable = { show: true, header: "Groups" };
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type RelationUiTable = {
  show?: boolean;
  order?: number;
  header?: string;
  pinned?: "left" | "right";
  maxVisibleBadges?: number;
};

/**
 * Form configuration for relation pickers.
 *
 * @example
 * import type { RelationUiForm } from "@beep/schema/core/annotations/default";
 *
 * const form: RelationUiForm = { show: true, input: "combobox" };
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type RelationUiForm = {
  show?: boolean;
  order?: number;
  input: "singleCombobox" | "combobox";
  label?: string;
  required?: boolean;
};

/**
 * Relation metadata describing key, target tag, and UI hints.
 *
 * @example
 * import type { RelationConfig } from "@beep/schema/core/annotations/default";
 *
 * const relation: RelationConfig = {
 *   key: "members",
 *   targetEntityTag: "person",
 *   direction: "outbound",
 * };
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type RelationConfig = {
  key: string;
  targetEntityTag: string;
  direction?: RelationDirection;
  label?: string;
  table?: RelationUiTable;
  form?: RelationUiForm;
};

/**
 * Annotation metadata bag with optional documentation, defaults, and helpers.
 *
 * @example
 * import type { DefaultAnnotations } from "@beep/schema/core/annotations/default";
 *
 * const annotations: DefaultAnnotations<string> = {
 *   title: "Custom String",
 *   description: "Annotated string",
 * };
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type DefaultAnnotations<A, TypeParameters extends ReadonlyArray<UnsafeTypes.UnsafeAny> = readonly []> = {
  readonly identifier?: AST.IdentifierAnnotation;
  readonly title: AST.TitleAnnotation;
  readonly description: AST.DescriptionAnnotation;
  readonly documentation?: AST.DocumentationAnnotation;
  readonly examples?: AST.ExamplesAnnotation<A>;
  readonly default?: AST.DefaultAnnotation<A>;
  readonly jsonSchema?: AST.JSONSchemaAnnotation;
  readonly message?: AST.MessageAnnotation;
  readonly schemaId?: AST.SchemaIdAnnotation;
  readonly arbitrary?: Arbitrary.ArbitraryAnnotation<A, TypeParameters>;
  readonly pretty?: Pretty.PrettyAnnotation<A, TypeParameters>;
  readonly equivalence?: AST.EquivalenceAnnotation<A, TypeParameters>;
  readonly concurrency?: AST.ConcurrencyAnnotation;
  readonly batching?: AST.BatchingAnnotation;
  readonly parseIssueTitle?: AST.ParseIssueTitleAnnotation;
  readonly parseOptions?: AST.ParseOptions;
  readonly decodingFallback?: AST.DecodingFallbackAnnotation<A>;
};

/**
 * Derives the underlying primitive type for a schema AST node.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { getUnderlyingType } from "@beep/schema/core/annotations/default";
 *
 * const ast = S.String.ast;
 * const type = getUnderlyingType(ast);
 * // type === "string"
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const getUnderlyingType = (ast: AST.AST): "string" | "number" | "boolean" | "unknown" => {
  if (AST.isUnion(ast)) {
    const nonNullType = F.pipe(
      ast.types,
      A.findFirst((type) => type._tag !== "Literal" || (type._tag === "Literal" && type.literal !== null)),
      O.getOrUndefined
    );

    if (nonNullType) {
      return getUnderlyingType(nonNullType);
    }
  }

  if (AST.isRefinement(ast)) {
    return getUnderlyingType(ast.from);
  }

  if (AST.isTransformation(ast)) {
    return getUnderlyingType(ast.from);
  }

  switch (ast._tag) {
    case "StringKeyword":
      return "string" as const;
    case "NumberKeyword":
      return "number" as const;
    case "BooleanKeyword":
      return "boolean" as const;
    case "Literal":
      if (typeof ast.literal === "string") {
        return "string" as const;
      }
      if (typeof ast.literal === "number") {
        return "number" as const;
      }
      if (typeof ast.literal === "boolean") {
        return "boolean" as const;
      }
      return "unknown" as const;
    default:
      return "unknown" as const;
  }
};

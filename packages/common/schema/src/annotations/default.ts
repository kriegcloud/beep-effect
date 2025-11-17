import { Id } from "@beep/schema/annotations/_id";
import type { UnsafeTypes } from "@beep/types";
import type * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type * as Pretty from "effect/Pretty";
import * as AST from "effect/SchemaAST";

export const LabelAnnotationId = Id.compose("LabelAnnotation").symbol();
export const BSFieldName = Id.compose("fieldName").symbol();
export const BSCustomField = Id.compose("customField").symbol();
export const BSSkipField = Id.compose("skipField").symbol();
export const BSEntity = Id.compose("entity").symbol();
export const BSEdge = Id.compose("edge").symbol();
export const BSFolder = Id.compose("folder").symbol();
export const BSSkipEntity = Id.compose("skipEntity").symbol();
export const BSTransformer = Id.compose("transformer").symbol();

// Predicate to filter out entities that have data we don't want to sync.
export const BSFilterFn = Id.compose("filterFn").symbol();
export const BSFolderType = Id.compose("folderType").symbol();
export const BSTable = Id.compose("table").symbol();
export const BSUIConfig = Id.compose("uiConfig").symbol();
export const BSRelations = Id.compose("relations").symbol();
export const BSForeignKey = Id.compose("foreignKey").symbol();

export type BSEdgeAnnotation = {
  relationshipType: string;
  targetEntityTypeTag: string;
};

export type BSFolderAnnotation = {
  folderType: string;
};

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
    options?: Array<{ value: string; label: string }>;
    rows?: number;
    searchable?: boolean;
    creatable?: boolean;
    multiple?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number;
    order?: number;
    composite?: Array<string>;
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

export type RelationDirection = "outbound" | "inbound" | "both";

export type RelationUiTable = {
  show?: boolean;
  order?: number;
  header?: string;
  pinned?: "left" | "right";
  maxVisibleBadges?: number;
};

export type RelationUiForm = {
  show?: boolean;
  order?: number;
  input: "singleCombobox" | "combobox";
  label?: string;
  required?: boolean;
};

export type RelationConfig = {
  key: string;
  targetEntityTag: string;
  direction?: RelationDirection;
  label?: string;
  table?: RelationUiTable;
  form?: RelationUiForm;
};

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

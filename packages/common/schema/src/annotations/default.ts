import type { UnsafeTypes } from "@beep/types";
import type * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type * as Pretty from "effect/Pretty";
import * as AST from "effect/SchemaAST";

export const LabelAnnotationId = Symbol.for("@beep/schema/annotations/LabelAnnotation");
export const BSFieldName = Symbol.for("@beep/schema/fieldName");
export const BSCustomField = Symbol.for("@beep/schema/customField");
export const BSSkipField = Symbol.for("@beep/schema/skipField");
export const BSEntity = Symbol.for("@beep/schema/entity");
export const BSEdge = Symbol.for("@beep/schema/edge");
export const BSFolder = Symbol.for("@beep/schema/folder");
export const BSSkipEntity = Symbol.for("@beep/schema/skipEntity");
export const BSTransformer = Symbol.for("@beep/schema/transformer");
export const BSPartialTransformer = Symbol.for("@beep/schema/partialTransformer");

// Predicate to filter out entities that have data we don't want to sync.
export const BSFilterFn = Symbol.for("@beep/schema/filterFn");
export const BSFolderType = Symbol.for("@beep/schema/folderType");
export const BSTable = Symbol.for("@beep/schema/table");
export const BSUIConfig = Symbol.for("@beep/schema/uiConfig");
export const BSRelations = Symbol.for("@beep/schema/relations");
export const BSForeignKey = Symbol.for("@beep/schema/foreignKey");

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

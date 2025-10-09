import { BSTable, type FieldConfig } from "@beep/schema/annotations";
import * as bS from "@beep/schema/entity-s";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import type { EntityId } from "./EntityId";
// Dynamic union type that includes all schemas with _tag field that represent business entities
// This mirrors the logic in discoverEntitySchemas() but at the type level
export type EntityUnion = {
  [K in keyof typeof bS]: (typeof bS)[K] extends S.Schema<infer A, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
    ? A extends { _tag: string; id: string; orgId: string }
      ? IsBusinessEntity<A> extends true
        ? A
        : never
      : never
    : never;
}[keyof typeof bS];

// Helper type to determine if a type is a business entity (not a system entity)
// This excludes system entities like Edge, ExternalLink, Field types, etc.
type IsBusinessEntity<T> = T extends { _tag: infer Tag }
  ? Tag extends "edge" | "externalLink" | "field" | "fieldOption" | "adapterWebhook"
    ? false
    : true
  : false;

// Runtime utility to get all entity schemas that have both _tag and BSTable (final entity classes)
export const discoverEntitySchemas = () => {
  return F.pipe(
    bS,
    R.toEntries,
    A.filterMap(([name, schema]) => {
      if (!S.isSchema(schema)) {
        return O.none();
      }

      const schemaObj = schema as S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, never>;

      // Check if it has a _tag field
      const tagOpt = extractEntityTagOpt(schemaObj);
      if (O.isNone(tagOpt)) {
        return O.none();
      }

      // Check if it has BSTable annotation (indicates it's a final entity class)
      const hasTableAnnotation = F.pipe(getAnnotationFromSchema(BSTable, schemaObj.ast), O.isSome);

      if (!hasTableAnnotation) {
        return O.none();
      }

      return O.some({
        name,
        schema: schemaObj,
        tag: tagOpt.value,
      });
    })
  );
};

// Helper function to get annotations from schema, handling class-based schemas
const getAnnotationFromSchema = <A>(annotationId: symbol, ast: AST.AST): O.Option<A> => {
  // First try direct annotation
  const directOpt = AST.getAnnotation<A>(annotationId)(ast);
  if (O.isSome(directOpt)) {
    return directOpt;
  }

  // If not found and this is a Transformation, check the Surrogate
  if (ast._tag === "Transformation") {
    const surrogateOpt = AST.getAnnotation<AST.AST>(AST.SurrogateAnnotationId)(ast);
    if (O.isSome(surrogateOpt)) {
      return AST.getAnnotation<A>(annotationId)(surrogateOpt.value);
    }
  }

  return O.none();
};

/**
 * Get schema for an entity type by tag (case-insensitive)
 * This function can be used on both frontend and backend
 */
export const getSchemaByEntityType = (
  entityType: string
): O.Option<S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, never>> => {
  const entities = discoverEntitySchemas();

  return F.pipe(
    entities,
    A.findFirst((entity) => F.pipe(entity.tag, Str.toLowerCase) === F.pipe(entityType, Str.toLowerCase)),
    O.map((entity) => entity.schema)
  );
};

export interface EntityUiConfig<TTableName extends string, TBrand extends string> {
  schema: S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, never>;
  tag: EntityId.EntityIdSchemaInstance<TTableName, TBrand>;
  navConfig: NonNullable<FieldConfig["navigation"]>;
  navItem: {
    iconName?: string;
    title: string;
    url: string;
  };
  meta: {
    disableCreate: boolean;
    disableDelete: boolean;
    disableEdit: boolean;
  };
}

const extractEntityTagOpt = (schema: { ast: AST.AST }): O.Option<string> => {
  const extractFromTypeLiteral = (ast: AST.AST): O.Option<string> => {
    if (AST.isTypeLiteral(ast)) {
      const propertySignatures = ast.propertySignatures;
      const tagProperty = F.pipe(
        propertySignatures,
        A.findFirst((prop) => prop.name === "_tag")
      );

      if (O.isSome(tagProperty)) {
        const tagAST = tagProperty.value.type;
        if (AST.isLiteral(tagAST) && typeof tagAST.literal === "string") {
          return O.some(tagAST.literal);
        }
      }
    }
    return O.none();
  };

  // First try the direct AST
  const directResult = extractFromTypeLiteral(schema.ast);
  if (O.isSome(directResult)) {
    return directResult;
  }

  // If this is a Transformation (class-based schema), check the 'from' AST
  if (schema.ast._tag === "Transformation") {
    return extractFromTypeLiteral(schema.ast.from);
  }

  return O.none();
};

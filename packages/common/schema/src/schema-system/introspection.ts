import { BSUIConfig, type FieldConfig } from "@beep/schema/annotations/default";
import { IsoStringToTimestamp, TimestampToIsoString } from "@beep/schema/custom/dates";
import { BaseIdentifiedEntity, BaseSystemFields } from "@beep/schema/schema-system/SystemSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import type { EntityId } from "../EntityId";
/**
 * Helper function to get annotation from schema, handling both old and new formats
 */
export const getAnnotationFromSchema = <A>(annotationId: symbol | any, ast: AST.AST | any): O.Option<A> => {
  if (!ast) {
    return O.none();
  }

  // Try direct annotation access first
  const directAnnotation = AST.getAnnotation<A>(annotationId)(ast);
  if (O.isSome(directAnnotation)) {
    return directAnnotation;
  }

  // For PropertySignature, try the type
  if (ast.type) {
    return AST.getAnnotation<A>(annotationId)(ast.type);
  }

  // For Transformation AST, check the Surrogate annotation
  // This handles branded types, refined types, and other transformations
  if (ast._tag === "Transformation") {
    const surrogateOpt = AST.getAnnotation<AST.AST>(AST.SurrogateAnnotationId)(ast);
    if (O.isSome(surrogateOpt)) {
      return AST.getAnnotation<A>(annotationId)(surrogateOpt.value);
    }
  }

  // For class-based schemas, try to get from the constructor or prototype
  if (ast.constructor?.ast) {
    return AST.getAnnotation<A>(annotationId)(ast.constructor.ast);
  }

  return O.none();
};

export interface ExtractedField {
  key: string;
  schema: AST.PropertySignature;
  isOptional: boolean;
  isNullable: boolean;
}

/**
 * Extracts field information from a S.Struct or class-based schema
 */
export const extractSchemaFields = <T>(schema: S.Schema<T> | { ast: AST.AST }): Array<ExtractedField> => {
  const ast = schema.ast;

  // Helper function to extract fields from a TypeLiteral AST
  const extractFromTypeLiteral = (typeLiteralAst: AST.AST): Array<ExtractedField> => {
    if (typeLiteralAst._tag !== "TypeLiteral") {
      throw new Error("Expected TypeLiteral AST");
    }

    return F.pipe(
      typeLiteralAst.propertySignatures,
      A.map((prop) => ({
        isNullable: isNullableSchema(prop.type),
        isOptional: prop.isOptional,
        key: prop.name as string,
        schema: prop,
      }))
    );
  };

  // Handle direct TypeLiteral (old S.Struct format)
  if (ast._tag === "TypeLiteral") {
    return extractFromTypeLiteral(ast);
  }

  // Handle Transformation (class-based schema format)
  if (ast._tag === "Transformation") {
    return extractFromTypeLiteral(ast.from);
  }

  throw new Error(`Can only extract fields from Struct schemas or class-based schemas, got: ${ast._tag}`);
};

/**
 * Checks if a schema allows null values using Effect-TS patterns
 */
const isNullableSchema = (ast: AST.AST): boolean => {
  if (AST.isUnion(ast)) {
    return F.pipe(
      ast.types,
      A.some((t) => t._tag === "Literal" && t.literal === null)
    );
  }
  return false;
};

/**
 * Gets UI configuration from schema annotations
 */
export const getUiConfig = (schema: S.Schema.AnyNoContext): FieldConfig | undefined => {
  return F.pipe(AST.getAnnotation<FieldConfig>(BSUIConfig)(schema.ast), O.getOrUndefined);
};

const isNullOrUndefined = (ast: AST.AST): boolean =>
  (ast._tag === "Literal" && ast.literal === null) || ast._tag === "UndefinedKeyword";

const getUiConfigFromASTOption = (ast: AST.AST): O.Option<FieldConfig> => {
  return F.pipe(
    getAnnotationFromSchema<FieldConfig>(BSUIConfig, ast),
    O.orElse(() =>
      AST.isUnion(ast)
        ? F.pipe(
            ast.types,
            A.findFirst((type) => !isNullOrUndefined(type)),
            O.flatMap((type) => getUiConfigFromASTOption(type))
          )
        : O.none()
    )
  );
};

/**
 * Extracts literal values from a union of literals with proper capitalization
 */
export const extractLiteralOptions = (ast: AST.AST): Array<{ value: any; label: string }> => {
  if (AST.isUnion(ast)) {
    const literalValues: Array<{ value: any; label: string }> = [];

    for (const type of ast.types) {
      if (type._tag === "Literal") {
        const literal = type.literal;
        if (typeof literal === "string") {
          literalValues.push({
            label: F.pipe(literal, Str.capitalize),
            value: literal,
          });
        } else if (typeof literal === "number" || typeof literal === "boolean") {
          literalValues.push({
            label: `${literal}`,
            value: literal,
          });
        }
      }
    }

    return literalValues;
  }

  if (ast._tag === "Literal") {
    const literal = ast.literal;
    if (typeof literal === "string") {
      return [
        {
          label: F.pipe(literal, Str.capitalize),
          value: literal,
        },
      ];
    }
    if (typeof literal === "number" || typeof literal === "boolean") {
      return [
        {
          label: `${literal}`,
          value: literal,
        },
      ];
    }
  }

  return [];
};

/**
 * Gets UI configuration from AST annotations
 * Handles both PropertySignature and regular AST types
 * Handles Union types created by S.NullOr by recursively traversing nested unions
 * Written in Effect-TS style using functional composition
 */
export const getUiConfigFromAST = (ast: any): FieldConfig | undefined => {
  if (ast && typeof ast === "object" && "annotations" in ast && "type" in ast) {
    const directAnnotation = getAnnotationFromSchema<FieldConfig>(BSUIConfig, ast);
    if (O.isSome(directAnnotation)) {
      return directAnnotation.value;
    }

    return getUiConfigFromAST(ast.type);
  }

  return F.pipe(
    getAnnotationFromSchema<FieldConfig>(BSUIConfig, ast),
    O.orElse(() =>
      AST.isUnion(ast)
        ? F.pipe(
            ast.types,
            A.findFirst((type) => !isNullOrUndefined(type)),
            O.flatMap((type) => getUiConfigFromASTOption(type))
          )
        : O.none()
    ),
    O.getOrUndefined
  );
};

/**
 * Checks if a schema has an email pattern in its refinements
 */
export const hasEmailPattern = (ast: AST.AST): boolean => {
  if (AST.isRefinement(ast)) {
    return false;
  }
  return false;
};

/**
 * Extracts the entity tag from a schema AST
 * Handles both TypeLiteral (old S.Struct) and Transformation (class-based) ASTs
 */
export const extractEntityTagOpt = (ast: AST.AST): O.Option<string> => {
  const extractFromTypeLiteral = (typeLiteralAst: AST.AST): O.Option<string> => {
    if (!AST.isTypeLiteral(typeLiteralAst)) {
      return O.none();
    }

    const propertySignatures = typeLiteralAst.propertySignatures;
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

    return O.none();
  };

  // Handle direct TypeLiteral (old S.Struct format)
  if (AST.isTypeLiteral(ast)) {
    return extractFromTypeLiteral(ast);
  }

  // Handle Transformation (class-based schema format)
  if (ast._tag === "Transformation") {
    return extractFromTypeLiteral(ast.from);
  }

  return O.none();
};

/**
 * Helper function to extract the AST from a PropertySignature or return the AST as-is
 */
export const extractAST = (schema: AST.AST | AST.PropertySignature): AST.AST => {
  return "type" in schema ? schema.type : schema;
};

/**
 * Extracts entity information from a schema, including entity name and tag
 */
export const extractEntityInfo = (schema: S.Schema.AnyNoContext): { entityName: string; entityTag?: string } => {
  // Get entity annotation if present
  const entityAnnotation = F.pipe(extractEntityName(schema), O.getOrUndefined);

  // Get entity tag from _tag field if present
  const entityTag = F.pipe(extractEntityTagOpt(schema.ast), O.getOrUndefined);

  return {
    entityName: entityAnnotation || "item",
    entityTag: entityAnnotation || entityTag,
  };
};

export const extractEntityName = (schema: S.Schema.Any): O.Option<string> => {
  // Try to get the title annotation from the schema
  const titleOpt = getAnnotationFromSchema<string>(AST.TitleAnnotationId, schema.ast);

  if (O.isSome(titleOpt)) {
    return titleOpt;
  }

  // Fallback: try to get the constructor name
  const constructorName = schema.constructor?.name;
  if (constructorName) {
    return O.some(constructorName.toLowerCase());
  }

  return O.none();
};

export const getCreateSchema = <A, I = A, R = never>(
  schema: S.Schema<A, I, R>
): S.Schema<Omit<A, keyof typeof BaseSystemFields.fields & keyof typeof BaseIdentifiedEntity.fields & "_tag">, I, R> =>
  F.pipe(
    schema,
    S.omit(
      ...(Object.keys(BaseSystemFields.fields) as Array<keyof A & keyof I>),
      ...(Object.keys(BaseIdentifiedEntity.fields) as Array<keyof A & keyof I>),
      "_tag" as keyof A & keyof I
    )
  ) as any;

export const getUpdateSchema = <A, I = A, R = never>(schema: S.Schema<A, I, R>): S.Schema<A, I, R> => {
  // Check if this is a class schema (has .fields property)
  if ("fields" in schema && typeof schema.fields === "object") {
    // For class schemas: omit id, make partial, then extend with required id
    return S.Struct(schema.fields as any).pipe(S.omit("id"), S.partial, S.extend(S.Struct({ id: S.String }))) as any;
  }

  // For regular Struct schemas: omit id, make partial, then extend with required id
  return F.pipe(schema, S.omit("id" as any), S.partial, S.extend(S.Struct({ id: S.String }))) as any;
};

export const getDeleteSchema = <A, I = A, R = never>(_schema: S.Schema<A, I, R>) =>
  S.Struct({
    deletedAt: TimestampToIsoString,
    deletedBy: S.String,
    id: S.String,
    orgId: S.String,
    updatedAt: TimestampToIsoString,
    updatedBy: S.String,
  });

/**
 * Transforms a schema for server-side Zero mutations by converting timestamp fields
 * from ISO strings to Unix timestamps (numbers).
 *
 * Zero expects timestamps as numbers (milliseconds since epoch) and converts them to
 * PostgreSQL timestamps using `to_timestamp(value / 1000.0)`.
 *
 * This function:
 * 1. Extracts all fields from the schema
 * 2. Identifies fields using TimestampToIsoString transformation
 * 3. Replaces them with a schema that accepts ISO strings and encodes to numbers
 * 4. Preserves all other fields as-is
 *
 * @param schema - The entity schema with TimestampToIsoString fields
 * @returns A new schema that converts ISO strings to numbers for Zero
 */
export const getZeroMutationSchema = <A, I = A, R = never>(schema: S.Schema<A, I, R>): S.Schema<any, any, R> => {
  const fields = extractSchemaFields(schema);

  const transformedFields: Record<string, any> = {};

  for (const field of fields) {
    const fieldAst = extractAST(field.schema);

    if (isTimestampToIsoStringField(fieldAst)) {
      if (field.isOptional) {
        transformedFields[field.key] = S.optionalWith(IsoStringToTimestamp, { exact: true });
      } else if (field.isNullable) {
        transformedFields[field.key] = F.pipe(IsoStringToTimestamp, S.NullOr);
      } else {
        transformedFields[field.key] = IsoStringToTimestamp;
      }
    } else {
      transformedFields[field.key] = S.make(fieldAst);
    }
  }

  return S.Struct(transformedFields) as any;
};

/**
 * Helper function to detect if a field uses TimestampToIsoString transformation
 */
const isTimestampToIsoStringField = (ast: AST.AST): boolean => {
  if (ast._tag === "Transformation") {
    const from = ast.from;
    const to = ast.to;

    if (
      from._tag === "Union" &&
      to._tag === "StringKeyword" &&
      F.pipe(
        from.types,
        A.some((type) => type._tag === "NumberKeyword")
      ) &&
      F.pipe(
        from.types,
        A.some((type) => type._tag === "StringKeyword")
      )
    ) {
      return true;
    }
  }

  if (ast._tag === "Union") {
    return F.pipe(
      ast.types,
      A.some((type) => isTimestampToIsoStringField(type))
    );
  }

  return false;
};

export const enrichMutationData = Effect.fn("enrichMutationData")(function* <
  TableName extends string,
  Brand extends string,
>(params: {
  data: Array<Record<string, any>>;
  operation: "delete" | "insert" | "update" | "upsert";
  orgId: string;
  userId: string;
  entitySchema: EntityId.EntityIdSchemaInstance<TableName, Brand>;
  schema: S.Schema<any>;
}) {
  const { data, operation, orgId, userId, entitySchema, schema } = params;
  const mutatedAt = new Date().toISOString();

  switch (operation) {
    case "upsert":
    case "insert": {
      const result = yield* S.decodeUnknown(S.Array(getZeroMutationSchema(schema)), {
        errors: "all",
        onExcessProperty: "preserve",
      })(
        F.pipe(
          data,
          A.map((item) => ({
            // Base data only for insert/upsert operations
            _tag: entitySchema.tableName,
            createdAt: mutatedAt,
            createdBy: userId,
            customFields: [],
            externalIds: [],
            id: entitySchema.create(),
            orgId,
            status: "active",
            tags: [],

            ...item,

            // Always update these fields
            updatedAt: mutatedAt,
            updatedBy: userId,
          }))
        )
      );

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>;
    }

    case "update": {
      const result = yield* S.decodeUnknown(
        S.Array(
          getZeroMutationSchema(
            F.pipe(getUpdateSchema(schema), S.omit("orgId"), S.extend(S.Struct({ orgId: S.String })))
          )
        ),
        {
          errors: "all",
          onExcessProperty: "preserve",
        }
      )(
        F.pipe(
          data,
          A.map((item) => ({
            ...item,
            orgId,
            updatedAt: mutatedAt,
            updatedBy: userId,
          }))
        )
      );

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>;
    }

    case "delete": {
      const result = yield* S.decodeUnknown(S.Array(getZeroMutationSchema(getDeleteSchema(schema))), {
        errors: "all",
        onExcessProperty: "preserve",
      })(
        F.pipe(
          data,
          A.map((item) => ({
            ...item,
            deletedAt: mutatedAt,
            deletedBy: userId,
            orgId,
            updatedAt: mutatedAt,
            updatedBy: userId,
          }))
        )
      );

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>;
    }
  }
});

export const validateMutationData = Effect.fn("validateMutationData")(function* (params: {
  data: Array<Record<string, any>>;
  operation: "delete" | "insert" | "update" | "upsert";
  schema: S.Schema<any>;
}) {
  const { data, operation, schema } = params;

  switch (operation) {
    case "upsert":
    case "insert": {
      const result = yield* S.decodeUnknown(S.Array(getZeroMutationSchema(schema)), {
        errors: "all",
        onExcessProperty: "preserve",
      })(data);

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>;
    }

    case "update": {
      const result = yield* S.decodeUnknown(
        S.Array(
          getZeroMutationSchema(
            F.pipe(getUpdateSchema(schema), S.omit("orgId"), S.extend(S.Struct({ orgId: S.String })))
          )
        ),
        {
          errors: "all",
          onExcessProperty: "preserve",
        }
      )(data, {});

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>;
    }

    case "delete": {
      const result = yield* S.decodeUnknown(S.Array(getZeroMutationSchema(getDeleteSchema(schema))), {
        errors: "all",
        onExcessProperty: "preserve",
      })(data);

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>;
    }
  }
});

import { $AiSdkId } from "@beep/identity/packages";
import { Effect, SchemaAST as AST } from "effect";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { z } from "zod";

const $I = $AiSdkId.create("core/internal/schemaToZod");

/**
 * @since 0.0.0
 */
export class SchemaToZodError extends S.TaggedErrorClass<SchemaToZodError>($I`SchemaToZodError`)(
  "SchemaToZodError",
  {
    message: S.String,
    location: S.String,
  },
  $I.annote("SchemaToZodError", {
    description: "Raised when an Effect schema cannot be compiled to a compatible Zod schema.",
  })
) {
  static readonly make = (message: string, path: ReadonlyArray<string>) =>
    new SchemaToZodError({
      message,
      location: path.length === 0 ? "root" : path.join("."),
    });
}

const unsupported = <A>(message: string, path: ReadonlyArray<string>): Result.Result<A, SchemaToZodError> =>
  Result.fail(SchemaToZodError.make(message, path));

const compileUnion = (
  ast: AST.Union,
  path: ReadonlyArray<string>
): Result.Result<z.ZodType, SchemaToZodError> => {
  const members = ast.types;
  if (members.length === 0) {
    return Result.succeed(z.never());
  }
  if (members.length === 1) {
    return compile(members[0], path);
  }

  const undefinedIndex = members.findIndex(AST.isUndefined);
  if (undefinedIndex >= 0 && members.length === 2) {
    const other = members[undefinedIndex === 0 ? 1 : 0];
    return Result.map(compile(other, path), (compiled: z.ZodType) => compiled.optional());
  }

  const compiledMembers: Array<z.ZodType> = [];
  for (const member of members) {
    const compiled = compile(member, path);
    if (Result.isFailure(compiled)) {
      return compiled;
    }
    compiledMembers.push(compiled.success);
  }

  const [head, next, ...rest] = compiledMembers;
  if (!head || !next) {
    return Result.succeed(z.never());
  }

  let schema: z.ZodType = z.union([head, next]);
  for (const item of rest) {
    schema = z.union([schema, item]);
  }
  return Result.succeed(schema);
};

const compileObjects = (
  ast: AST.Objects,
  path: ReadonlyArray<string>
): Result.Result<z.ZodType, SchemaToZodError> => {
  const shape: Record<string, z.ZodType> = {};

  for (const property of ast.propertySignatures) {
    const key = String(property.name);
    const schema = compile(property.type, path.concat(key));
    if (Result.isFailure(schema)) {
      return schema;
    }
    shape[key] = AST.isOptional(property.type) ? schema.success.optional() : schema.success;
  }

  const base = z.object(shape);

  if (ast.indexSignatures.length === 0) {
    return Result.succeed(base.strict());
  }

  if (ast.indexSignatures.length === 1) {
    const index = ast.indexSignatures[0];
    if (!AST.isString(index.parameter)) {
      return unsupported("Unsupported index signature parameter", path);
    }
    const valueSchema = compile(index.type, path.concat("[key]"));
    if (Result.isFailure(valueSchema)) {
      return valueSchema;
    }
    return Result.succeed(base.catchall(valueSchema.success));
  }

  return unsupported("Multiple index signatures are unsupported", path);
};

const compileArrays = (
  ast: AST.Arrays,
  path: ReadonlyArray<string>
): Result.Result<z.ZodType, SchemaToZodError> => {
  if (ast.elements.length === 0 && ast.rest.length === 1) {
    return Result.map(compile(ast.rest[0], path), (schema: z.ZodType) => z.array(schema));
  }

  if (ast.elements.length === 0 && ast.rest.length === 0) {
    return Result.succeed(z.tuple([]));
  }

  if (ast.elements.length > 0 && ast.rest.length === 0) {
    return Result.succeed(z.array(z.unknown()));
  }

  if (ast.rest.length === 1) {
    return Result.map(compile(ast.rest[0], path.concat("[rest]")), (schema: z.ZodType) => z.array(schema));
  }

  return unsupported("Array shape is not supported", path);
};

const compileEnum = (ast: AST.Enum): Result.Result<z.ZodType, SchemaToZodError> => {
  const literals = ast.enums.map((entry) => z.literal(entry[1]));

  if (literals.length === 0) {
    return Result.succeed(z.never());
  }

  if (literals.length === 1) {
    return Result.succeed(literals[0]);
  }

  const [head, next, ...rest] = literals;
  if (!head || !next) {
    return Result.succeed(z.never());
  }

  let schema: z.ZodType = z.union([head, next]);
  for (const literal of rest) {
    schema = z.union([schema, literal]);
  }
  return Result.succeed(schema);
};

const compile = (ast: AST.AST, path: ReadonlyArray<string>): Result.Result<z.ZodType, SchemaToZodError> => {
  if (AST.isDeclaration(ast)) return Result.succeed(z.unknown());
  if (AST.isString(ast)) return Result.succeed(z.string());
  if (AST.isNumber(ast)) return Result.succeed(z.number());
  if (AST.isBoolean(ast)) return Result.succeed(z.boolean());
  if (AST.isBigInt(ast)) return Result.succeed(z.bigint());
  if (AST.isSymbol(ast) || AST.isUniqueSymbol(ast)) return Result.succeed(z.symbol());
  if (AST.isLiteral(ast)) return Result.succeed(z.literal(ast.literal));
  if (AST.isEnum(ast)) return compileEnum(ast);
  if (AST.isArrays(ast)) return compileArrays(ast, path);
  if (AST.isObjects(ast)) return compileObjects(ast, path);
  if (AST.isUnion(ast)) return compileUnion(ast, path);
  if (AST.isSuspend(ast)) {
    return Result.succeed(
      z.lazy(() => {
        const suspended = compile(ast.thunk(), path);
        return Result.isSuccess(suspended) ? suspended.success : z.never();
      })
    );
  }
  if (AST.isTemplateLiteral(ast)) return Result.succeed(z.string());
  if (AST.isUndefined(ast)) return Result.succeed(z.undefined());
  if (AST.isVoid(ast)) return Result.succeed(z.void());
  if (AST.isNever(ast)) return Result.succeed(z.never());
  if (AST.isUnknown(ast) || AST.isAny(ast)) return Result.succeed(z.unknown());
  if (AST.isObjectKeyword(ast)) return Result.succeed(z.record(z.string(), z.unknown()));
  return unsupported(`Unsupported schema (${ast._tag})`, path);
};

const fromResult = <A, E>(value: Result.Result<A, E>): Effect.Effect<A, E> =>
  Result.match(value, {
    onFailure: (failure) => Effect.fail(failure),
    onSuccess: (success) => Effect.succeed(success),
  });

/**
 * @since 0.0.0
 */
export const schemaToZod = (schema: S.Top): Effect.Effect<z.ZodType, SchemaToZodError> =>
  fromResult(compile(schema.ast, []));

/**
 * @since 0.0.0
 */
export const schemaToZodObject = (schema: S.Top): Effect.Effect<z.ZodObject<z.ZodRawShape>, SchemaToZodError> =>
  schemaToZod(schema).pipe(
    Effect.flatMap((compiled) =>
      compiled instanceof z.ZodObject
        ? Effect.succeed(compiled)
        : Effect.fail(SchemaToZodError.make("Tool parameters schema must be an object", []))
    )
  );

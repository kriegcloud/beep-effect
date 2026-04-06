import { $AiSdkId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { SchemaAST as AST, Effect, Result } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Z from "zod";

const $I = $AiSdkId.create("core/internal/schemaToZod");

/**
 * @since 0.0.0
 */
export class SchemaToZodError extends TaggedErrorClass<SchemaToZodError>($I`SchemaToZodError`)(
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

const compileUnion = (ast: AST.Union, path: ReadonlyArray<string>): Result.Result<Z.ZodType, SchemaToZodError> => {
  const members = ast.types;
  if (members.length === 0) {
    return Result.succeed(Z.never());
  }
  if (members.length === 1) {
    return compile(members[0], path);
  }

  const undefinedIndex = members.findIndex(AST.isUndefined);
  if (undefinedIndex >= 0 && members.length === 2) {
    const other = members[undefinedIndex === 0 ? 1 : 0];
    return Result.map(compile(other, path), (compiled: Z.ZodType) => compiled.optional());
  }

  const compiledMembers: Array<Z.ZodType> = [];
  for (const member of members) {
    const compiled = compile(member, path);
    if (Result.isFailure(compiled)) {
      return compiled;
    }
    compiledMembers.push(compiled.success);
  }

  const [head, next, ...rest] = compiledMembers;
  if (head === undefined || next === undefined) {
    return Result.succeed(Z.never());
  }

  let schema: Z.ZodType = Z.union([head, next]);
  for (const item of rest) {
    schema = Z.union([schema, item]);
  }
  return Result.succeed(schema);
};

const compileObjects = (ast: AST.Objects, path: ReadonlyArray<string>): Result.Result<Z.ZodType, SchemaToZodError> => {
  const shape: Record<string, Z.ZodType> = {};

  for (const property of ast.propertySignatures) {
    const key = String(property.name);
    const schema = compile(property.type, path.concat(key));
    if (Result.isFailure(schema)) {
      return schema;
    }
    shape[key] = AST.isOptional(property.type) ? schema.success.optional() : schema.success;
  }

  const base = Z.object(shape);

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

const compileArrays = (ast: AST.Arrays, path: ReadonlyArray<string>): Result.Result<Z.ZodType, SchemaToZodError> => {
  if (ast.elements.length === 0 && ast.rest.length === 1) {
    return Result.map(compile(ast.rest[0], path), (schema: Z.ZodType) => Z.array(schema));
  }

  if (ast.elements.length === 0 && ast.rest.length === 0) {
    return Result.succeed(Z.tuple([]));
  }

  if (ast.elements.length > 0 && ast.rest.length === 0) {
    const compiledElements: Array<Z.ZodType> = [];
    for (let index = 0; index < ast.elements.length; index += 1) {
      const element = ast.elements[index];
      if (element === undefined) {
        continue;
      }
      const compiled = compile(element, path.concat(`[${index}]`));
      if (Result.isFailure(compiled)) {
        return compiled;
      }
      compiledElements.push(compiled.success);
    }
    const [first, ...rest] = compiledElements;
    if (first === undefined) {
      return Result.succeed(Z.tuple([]));
    }
    return Result.succeed(Z.tuple([first, ...rest]));
  }

  if (ast.elements.length > 0 && ast.rest.length === 1) {
    const compiledElements: Array<Z.ZodType> = [];
    for (let index = 0; index < ast.elements.length; index += 1) {
      const element = ast.elements[index];
      if (element === undefined) {
        continue;
      }
      const compiled = compile(element, path.concat(`[${index}]`));
      if (Result.isFailure(compiled)) {
        return compiled;
      }
      compiledElements.push(compiled.success);
    }
    const compiledRest = compile(ast.rest[0], path.concat("[rest]"));
    if (Result.isFailure(compiledRest)) {
      return compiledRest;
    }
    const [first, ...rest] = compiledElements;
    if (first === undefined) {
      return Result.succeed(Z.array(compiledRest.success));
    }
    return Result.succeed(Z.tuple([first, ...rest]).rest(compiledRest.success));
  }

  if (ast.rest.length === 1) {
    return Result.map(compile(ast.rest[0], path.concat("[rest]")), (schema: Z.ZodType) => Z.array(schema));
  }

  return unsupported("Array shape is not supported", path);
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const templatePartRegex = (part: AST.AST): string | undefined => {
  if (AST.isLiteral(part) && P.isString(part.literal)) {
    return escapeRegex(part.literal);
  }
  if (AST.isString(part)) {
    return ".*";
  }
  if (AST.isNumber(part)) {
    return "[+-]?(?:\\d+|\\d*\\.\\d+)(?:[eE][+-]?\\d+)?";
  }
  if (AST.isBoolean(part)) {
    return "(?:true|false)";
  }
  if (AST.isBigInt(part)) {
    return "[+-]?\\d+n";
  }
  return undefined;
};

const compileTemplateLiteral = (
  ast: AST.TemplateLiteral,
  path: ReadonlyArray<string>
): Result.Result<Z.ZodType, SchemaToZodError> => {
  const fragments: Array<string> = [];
  for (const part of ast.parts) {
    const regex = templatePartRegex(part);
    if (regex === undefined) {
      return unsupported("Unsupported template literal part", path);
    }
    fragments.push(regex);
  }
  const pattern = new RegExp(`^${fragments.join("")}$`);
  return Result.succeed(Z.string().regex(pattern));
};

const compileEnum = (ast: AST.Enum): Result.Result<Z.ZodType, SchemaToZodError> => {
  const literals = ast.enums.map((entry) => Z.literal(entry[1]));

  if (literals.length === 0) {
    return Result.succeed(Z.never());
  }

  if (literals.length === 1) {
    return Result.succeed(literals[0]);
  }

  const [head, next, ...rest] = literals;
  if (head === undefined || next === undefined) {
    return Result.succeed(Z.never());
  }

  let schema: Z.ZodType = Z.union([head, next]);
  for (const literal of rest) {
    schema = Z.union([schema, literal]);
  }
  return Result.succeed(schema);
};

const compile = (ast: AST.AST, path: ReadonlyArray<string>): Result.Result<Z.ZodType, SchemaToZodError> => {
  if (AST.isDeclaration(ast)) return Result.succeed(Z.unknown());
  if (AST.isString(ast)) return Result.succeed(Z.string());
  if (AST.isNumber(ast)) return Result.succeed(Z.number());
  if (AST.isBoolean(ast)) return Result.succeed(Z.boolean());
  if (AST.isBigInt(ast)) return Result.succeed(Z.bigint());
  if (AST.isSymbol(ast) || AST.isUniqueSymbol(ast)) return Result.succeed(Z.symbol());
  if (AST.isLiteral(ast)) return Result.succeed(Z.literal(ast.literal));
  if (AST.isEnum(ast)) return compileEnum(ast);
  if (AST.isArrays(ast)) return compileArrays(ast, path);
  if (AST.isObjects(ast)) return compileObjects(ast, path);
  if (AST.isUnion(ast)) return compileUnion(ast, path);
  if (AST.isSuspend(ast)) {
    return Result.succeed(
      Z.lazy(() => {
        const suspended = compile(ast.thunk(), path);
        return Result.isSuccess(suspended) ? suspended.success : Z.never();
      })
    );
  }
  if (AST.isTemplateLiteral(ast)) return compileTemplateLiteral(ast, path);
  if (AST.isUndefined(ast)) return Result.succeed(Z.undefined());
  if (AST.isVoid(ast)) return Result.succeed(Z.void());
  if (AST.isNever(ast)) return Result.succeed(Z.never());
  if (AST.isUnknown(ast) || AST.isAny(ast)) return Result.succeed(Z.unknown());
  if (AST.isObjectKeyword(ast)) return Result.succeed(Z.record(Z.string(), Z.unknown()));
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
export const schemaToZod = (schema: S.Top): Effect.Effect<Z.ZodType, SchemaToZodError> =>
  fromResult(compile(schema.ast, []));

/**
 * @since 0.0.0
 */
export const schemaToZodObject = (schema: S.Top): Effect.Effect<Z.ZodObject<Z.ZodRawShape>, SchemaToZodError> =>
  schemaToZod(schema).pipe(
    Effect.flatMap((compiled) =>
      compiled instanceof Z.ZodObject
        ? Effect.succeed(compiled)
        : Effect.fail(SchemaToZodError.make("Tool parameters schema must be an object", []))
    )
  );

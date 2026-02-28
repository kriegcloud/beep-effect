import type * as Schema from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { z } from "zod";

const unsupported = (message: string, path: ReadonlyArray<string>): never => {
  const location = path.length === 0 ? "root" : path.join(".");
  throw new Error(`${message} at ${location}`);
};

const compileUnion = (ast: AST.Union, path: ReadonlyArray<string>): z.ZodTypeAny => {
  const members = ast.types;
  if (members.length === 0) {
    return z.never();
  }
  if (members.length === 1) {
    return compile(members[0], path);
  }

  const undefinedIndex = members.findIndex(AST.isUndefined);
  if (undefinedIndex >= 0 && members.length === 2) {
    const other = members[undefinedIndex === 0 ? 1 : 0];
    return compile(other, path).optional();
  }

  const compiled = members.map((member) => compile(member, path));
  let result: z.ZodTypeAny = z.union([compiled[0], compiled[1]]);
  for (let index = 2; index < compiled.length; index += 1) {
    result = z.union([result, compiled[index]]);
  }
  return result;
};

const compileObjects = (ast: AST.Objects, path: ReadonlyArray<string>): z.ZodTypeAny => {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const property of ast.propertySignatures) {
    const key = String(property.name);
    const schema = compile(property.type, path.concat(key));
    shape[key] = AST.isOptional(property.type) ? schema.optional() : schema;
  }

  const base = z.object(shape);

  if (ast.indexSignatures.length === 0) {
    return base.strict();
  }

  if (ast.indexSignatures.length === 1) {
    const index = ast.indexSignatures[0];
    if (!AST.isString(index.parameter)) {
      unsupported("Unsupported index signature parameter", path);
    }
    const valueSchema = compile(index.type, path.concat("[key]"));
    return base.catchall(valueSchema);
  }

  return unsupported("Multiple index signatures are unsupported", path);
};

const compileArrays = (ast: AST.Arrays, path: ReadonlyArray<string>): z.ZodTypeAny => {
  if (ast.elements.length === 0 && ast.rest.length === 1) {
    return z.array(compile(ast.rest[0], path));
  }

  if (ast.elements.length === 0 && ast.rest.length === 0) {
    return z.tuple([]);
  }

  if (ast.elements.length > 0 && ast.rest.length === 0) {
    return z.array(z.any());
  }

  if (ast.rest.length === 1) {
    return z.array(compile(ast.rest[0], path.concat("[rest]")));
  }

  return unsupported("Array shape is not supported", path);
};

const compileEnum = (ast: AST.Enum): z.ZodTypeAny => {
  const literals = ast.enums.map((entry) => z.literal(entry[1]));

  if (literals.length === 0) {
    return z.never();
  }

  if (literals.length === 1) {
    return literals[0];
  }

  let result: z.ZodTypeAny = z.union([literals[0], literals[1]]);
  for (let index = 2; index < literals.length; index += 1) {
    result = z.union([result, literals[index]]);
  }
  return result;
};

const compile = (ast: AST.AST, path: ReadonlyArray<string>): z.ZodTypeAny => {
  if (AST.isDeclaration(ast)) return z.any();
  if (AST.isString(ast)) return z.string();
  if (AST.isNumber(ast)) return z.number();
  if (AST.isBoolean(ast)) return z.boolean();
  if (AST.isBigInt(ast)) return z.bigint();
  if (AST.isSymbol(ast) || AST.isUniqueSymbol(ast)) return z.symbol();
  if (AST.isLiteral(ast)) return z.literal(ast.literal);
  if (AST.isEnum(ast)) return compileEnum(ast);
  if (AST.isArrays(ast)) return compileArrays(ast, path);
  if (AST.isObjects(ast)) return compileObjects(ast, path);
  if (AST.isUnion(ast)) return compileUnion(ast, path);
  if (AST.isSuspend(ast)) return z.lazy(() => compile(ast.thunk(), path));
  if (AST.isTemplateLiteral(ast)) return z.string();
  if (AST.isUndefined(ast)) return z.undefined();
  if (AST.isVoid(ast)) return z.void();
  if (AST.isNever(ast)) return z.never();
  if (AST.isUnknown(ast) || AST.isAny(ast)) return z.any();
  if (AST.isObjectKeyword(ast)) return z.record(z.string(), z.any());
  return unsupported(`Unsupported schema (${ast._tag})`, path);
};

export const schemaToZod = (schema: Schema.Top): z.ZodTypeAny => compile(schema.ast, []);

export const schemaToZodObject = (schema: Schema.Top): z.ZodObject<any> => {
  const compiled = schemaToZod(schema);
  if (compiled instanceof z.ZodObject) {
    return compiled;
  }
  throw new Error("Tool parameters schema must be an object");
};

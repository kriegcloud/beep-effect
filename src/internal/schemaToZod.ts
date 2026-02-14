import * as AST from "effect/SchemaAST"
import * as Option from "effect/Option"
import type * as Schema from "effect/Schema"
import { z } from "zod"

const unsupported = (message: string, path: ReadonlyArray<string>): never => {
  const location = path.length === 0 ? "root" : path.join(".")
  throw new Error(`${message} at ${location}`)
}

const compileUnion = (ast: AST.Union, path: ReadonlyArray<string>): z.ZodTypeAny => {
  const members = ast.types
  if (members.length === 0) {
    return z.never()
  }
  if (members.length === 1) {
    return compile(members[0], path)
  }
  const undefinedIndex = members.findIndex(AST.isUndefinedKeyword)
  if (undefinedIndex >= 0 && members.length === 2) {
    const other = members[undefinedIndex === 0 ? 1 : 0]
    return compile(other, path).optional()
  }
  const compiled = members.map((member) => compile(member, path))
  return z.union(compiled as [z.ZodTypeAny, z.ZodTypeAny, ...Array<z.ZodTypeAny>])
}

const compileTypeLiteral = (ast: AST.TypeLiteral, path: ReadonlyArray<string>): z.ZodTypeAny => {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const ps of ast.propertySignatures) {
    const key = String(ps.name)
    const schema = compile(ps.type, path.concat(key))
    shape[key] = ps.isOptional ? schema.optional() : schema
  }
  const base = z.object(shape)
  if (ast.indexSignatures.length === 0) {
    return base.strict()
  }
  if (ast.indexSignatures.length === 1) {
    const index = ast.indexSignatures[0]!
    if (!AST.isStringKeyword(index.parameter)) {
      unsupported("Unsupported index signature parameter", path)
    }
    const valueSchema = compile(index.type, path.concat("[key]"))
    return base.catchall(valueSchema)
  }
  return unsupported("Multiple index signatures are unsupported", path)
}

const compileTuple = (ast: AST.TupleType, path: ReadonlyArray<string>): z.ZodTypeAny => {
  if (ast.elements.length === 0 && ast.rest.length === 1) {
    return z.array(compile(ast.rest[0]!.type, path))
  }
  const items = ast.elements.map((el, index) => {
    const item = compile(el.type, path.concat(String(index)))
    return el.isOptional ? item.optional() : item
  })
  const tuple = z.tuple(items as [z.ZodTypeAny, ...Array<z.ZodTypeAny>])
  if (ast.rest.length === 1) {
    return tuple.rest(compile(ast.rest[0]!.type, path.concat("[rest]")))
  }
  if (ast.rest.length > 1) {
    unsupported("Tuple rest with multiple schemas is unsupported", path)
  }
  return tuple
}

const compileEnums = (ast: AST.Enums): z.ZodTypeAny => {
  const values = ast.enums.map((entry) => entry[1])
  const literals = values.map((value) => z.literal(value))
  if (literals.length === 0) {
    return z.never()
  }
  if (literals.length === 1) {
    return literals[0]!
  }
  return z.union(
    literals as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...Array<z.ZodTypeAny>]
  )
}

const compile = (ast: AST.AST, path: ReadonlyArray<string>): z.ZodTypeAny => {
  if (AST.isDeclaration(ast)) {
    const surrogate = AST.getSurrogateAnnotation(ast)
    return Option.isSome(surrogate) ? compile(surrogate.value, path) : z.any()
  }
  if (AST.isStringKeyword(ast)) return z.string()
  if (AST.isNumberKeyword(ast)) return z.number()
  if (AST.isBooleanKeyword(ast)) return z.boolean()
  if (AST.isBigIntKeyword(ast)) return z.bigint()
  if (AST.isSymbolKeyword(ast)) return z.symbol()
  if (AST.isUniqueSymbol(ast)) return z.symbol()
  if (AST.isLiteral(ast)) return z.literal(ast.literal)
  if (AST.isEnums(ast)) return compileEnums(ast)
  if (AST.isTupleType(ast)) return compileTuple(ast, path)
  if (AST.isTypeLiteral(ast)) return compileTypeLiteral(ast, path)
  if (AST.isUnion(ast)) return compileUnion(ast, path)
  if (AST.isRefinement(ast)) return compile(ast.from, path)
  if (AST.isTransformation(ast)) return compile(ast.from, path)
  if (AST.isSuspend(ast)) {
    return z.lazy(() => compile(ast.f(), path))
  }
  if (AST.isTemplateLiteral(ast)) {
    return z.string().regex(AST.getTemplateLiteralRegExp(ast))
  }
  if (AST.isUndefinedKeyword(ast)) return z.undefined()
  if (AST.isVoidKeyword(ast)) return z.void()
  if (AST.isNeverKeyword(ast)) return z.never()
  if (AST.isUnknownKeyword(ast) || AST.isAnyKeyword(ast)) return z.any()
  if (AST.isObjectKeyword(ast)) return z.record(z.string(), z.any())
  const tag = (ast as AST.AST)._tag
  return unsupported(`Unsupported schema (${tag})`, path)
}

export const schemaToZod = (schema: Schema.Schema.Any): z.ZodTypeAny =>
  compile(schema.ast, [])

export const schemaToZodObject = (schema: Schema.Schema.Any): z.ZodObject<any> => {
  const compiled = schemaToZod(schema)
  if (compiled instanceof z.ZodObject) {
    return compiled
  }
  throw new Error("Tool parameters schema must be an object")
}

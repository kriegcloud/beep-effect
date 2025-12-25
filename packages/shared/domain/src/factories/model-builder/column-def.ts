// import * as M from "@effect/sql/Model";
// import {BS} from "@beep/schema";
// import * as F from "effect/Function";
// import * as S from "effect/Schema";
// import * as Match from "effect/Schema";
// import * as AST from "effect/SchemaAST";
// import {Organization} from "@beep/shared-domain/entities";
// import * as O from "effect/Option";
// import type {DBFieldAttributeConfig} from "@better-auth/core/db";
// import * as MutableHashMap from "effect/MutableHashMap";
// import * as P from "effect/Predicate";
// import {DbFieldAttributeConfig} from "./column-annotations";
// import {AutoIncrement, Default, PrimaryKeyId, ColumnType, Unique} from "./column-annotations";
//
// export const shouldNeverHappen = (msg?: string, ...args: any[]): never => {
//   console.error(msg, ...args)
//
//   throw new Error(`This should never happen: ${msg}`)
// }
// const defaultTableFields = {
//   _rowId: {
//     type: "number",
//     required: false
//   }
// };
//
// const hasPropertyAnnotation = <T>(
//   propertySignature: AST.PropertySignature,
//   annotationId: symbol,
// ): O.Option<T> => {
//   if ("annotations" in propertySignature && propertySignature.annotations) {
//     const annotation = AST.getAnnotation<T>(annotationId)(propertySignature as any);
//     if (O.isSome(annotation)) return annotation;
//   }
//   return AST.getAnnotation<T>(annotationId)(propertySignature.type);
// };
// const hasUndefined = (ast: AST.AST): boolean => {
//   if (AST.isUndefinedKeyword(ast)) return true;
//   if (AST.isUnion(ast)) {
//     return ast.types.some((type) => hasUndefined(type));
//   }
//   return false;
// };
// const checkNullUndefined = (ast: AST.AST): { hasNull: boolean; hasUndefined: boolean } => {
//   let hasNull = false;
//   let hasUndefined = false;
//
//   const visit = (type: AST.AST): void => {
//     if (AST.isUndefinedKeyword(type)) hasUndefined = true;
//     else if (AST.isLiteral(type) && type.literal === null) hasNull = true;
//     else if (AST.isUnion(type)) type.types.forEach(visit);
//   };
//
//   visit(ast);
//   return {hasNull, hasUndefined};
// };
// const hasNull = (ast: AST.AST): boolean => {
//   if (AST.isLiteral(ast) && ast.literal === null) return true;
//   if (AST.isUnion(ast)) {
//     return ast.types.some((type) => hasNull(type));
//   }
//   return false;
// };
// const getDBFieldAttributeConfigForSchema = <Schema extends S.Schema.All>(
//   schema: Schema,
//   propertySignature?: undefined | AST.PropertySignature,
//   forceNullable = false,
// ) => {
//   const ast = schema.ast;
//
//   // Extract annotations
//   const getAnnotation = <T>(annotationId: symbol): O.Option<T> =>
//     propertySignature
//       ? hasPropertyAnnotation<T>(propertySignature, annotationId)
//       : AST.getAnnotation<T>(annotationId)(ast);
//
//   const columnType = AST.getAnnotation<DbFieldAttributeConfig.Type>(ColumnType)(ast);
//
//   // Check if schema has null (e.g., Schema.NullOr) or undefined or if it's forced nullable (optional field)
//   const isNullable = forceNullable || hasNull(ast) || hasUndefined(ast);
//
//
// };
//
//
// // type BetterAuthSchemaFromModel<Model extends M.Any> = {
// //   [K in keyof Model["fields"]]: Model["fields"][K] extends
// // }
//
// const betterAuthSchemaFromModel = <Model extends M.Any>(model: Model) => {
//   const fields = model.ast;
// };

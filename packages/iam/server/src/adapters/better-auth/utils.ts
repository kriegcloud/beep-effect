// import * as M from "@effect/sql/Model";
// import { BS } from "@beep/schema";
// import * as F from "effect/Function";
// import * as S from "effect/Schema";
// import * as Match from "effect/Schema";
// import * as AST from "effect/SchemaAST";
// import { Organization } from "@beep/shared-domain/entities";
// import * as O from "effect/Option";
// import type { DBFieldAttributeConfig} from "@better-auth/core/db";
// import * as MutableHashMap from "effect/MutableHashMap";
// import * as P from "effect/Predicate";
// const defaultTableFields = {
//   _rowId: {
//     type: "number",
//     required: false
//   }
// }
//
// const hasPropertyAnnotation = <T>(
//   propertySignature: AST.PropertySignature,
//   annotationId: symbol,
// ): O.Option<T> => {
//   if ('annotations' in propertySignature && propertySignature.annotations) {
//     const annotation = AST.getAnnotation<T>(annotationId)(propertySignature as any)
//     if (O.isSome(annotation)) return annotation
//   }
//   return AST.getAnnotation<T>(annotationId)(propertySignature.type)
// }
//
// const getDBFieldAttributeConfigForSchema = <Field extends S.Struct.Field>(
//   fieldSchema: Field,
//   propertySignature?: undefined | AST.PropertySignature,
//   forceNullable = false,
// ) => {
//   const ast = schema.ast;
//
//   // Extract annotations
//   const getAnnotation = <T>(annotationId: symbol): O.Option<T> =>
//     propertySignature
//       ? hasPropertyAnnotation<T>(propertySignature, annotationId)
//       : AST.getAnnotation<T>(annotationId)(ast)
// }
//
//
// // type BetterAuthSchemaFromModel<Model extends M.Any> = {
// //   [K in keyof Model["fields"]]: Model["fields"][K] extends
// // }
//
// const betterAuthSchemaFromModel = <Model extends M.Any>(model: Model) => {
//   const fields = model.ast;
// }

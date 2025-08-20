// import * as Either from "effect/Either";
// import * as O from "effect/Option";
// import * as ParseResult from "effect/ParseResult";
// import * as S from "effect/Schema";
// import get from "lodash.get";
// import { create } from "mutative";
// import { RootUnion, Union, NewUnion } from "./union";
// import { Rule } from "./rules"
// import * as Validators from "./validators";
// import { v4 as uuid } from "uuid";
// type NormalizeOptions = {
//   removeFailedValidations?: boolean;
//   removeEmptyUnions?: boolean;
//   promoteSingleRuleUnions?: boolean;
//   updateParentIds?: boolean;
// };
//
// export function createRoot(newUnion: NewUnion.Type): RootUnion.Type {
//   return { ...newUnion, entity: "rootUnion", id: uuid(), rules: [] };
// }
//
// export function normalize<T extends Union.Type | RootUnion.Type>(
//   union: T,
//   options: NormalizeOptions = {},
// ): T {
//   const {
//     removeFailedValidations = true,
//     removeEmptyUnions = true,
//     promoteSingleRuleUnions = true,
//     updateParentIds = true,
//   } = options;
//
//   return create(union, (draft) => {
//     draft.rules = draft.rules.reduce((acc: RuleOrUnion[], item) => {
//       if (item.entity === "union") {
//         const normalizedItem = normalize(item, options);
//         if (removeEmptyUnions && normalizedItem.rules.length === 0) return acc;
//         if (promoteSingleRuleUnions && normalizedItem.rules.length === 1) {
//           const promoted = { ...normalizedItem.rules[0], parentId: draft.id };
//           acc.push(promoted);
//           return acc;
//         }
//         if (updateParentIds) normalizedItem.parentId = draft.id;
//         acc.push(normalizedItem);
//       } else {
//         if (removeFailedValidations && !S.decodeOption(Rule)(item)) return acc;
//         if (updateParentIds) item.parentId = draft.id;
//         acc.push(item);
//       }
//       return acc;
//     }, []);
//   });
// }
//
// export function run(union: RootUnion.Type | Union.Type, value: any): boolean {
//   const validated = S.decodeSync(S.Union(RootUnion.Schema, Union.Schema))(union);
//   if (validated.rules.length === 0) return true;
//
//   const evaluate = (item: RuleOrUnion): boolean => {
//     if (item.entity === "union" || item.entity === "root_union") {
//       return run(item, value);
//     }
//     const resolved = get(value, item.field);
//     return Validators.validateRule(item, resolved);
//   };
//
//   return validated.logicalOp === "and"
//     ? validated.rules.every(evaluate)
//     : validated.rules.some(evaluate);
// }
//
// export function validate(
//   root: RootUnion.Type,
// ): { isValid: true } | { isValid: false; reason: string } {
//   const result = S.decodeEither(RootUnion.Schema)(root);
//   if (Either.isLeft(result)) {
//     const error = Either.getLeft(result);
//     const reason = O.isSome(error)
//       ? ParseResult.ArrayFormatter.formatErrorSync(error.value).join("\n")
//       : "Unknown error";
//     return { isValid: false, reason };
//   }
//   return { isValid: true };
// }
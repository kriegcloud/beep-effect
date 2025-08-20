// import * as A from "effect/Array";
// import * as S from "effect/Schema";
// import {v4 as uuid} from "uuid";
// import {create} from "mutative";
// import {RuleInput, Rule} from "./rules";
// import {RootUnion, Union, NewUnion} from "./union";
//
// /**
//  * Adds a rule or union to a parent union immutably.
//  * @param parent The parent union.
//  * @param newItem The new rule or union to add.
//  * @returns A new parent union with the item added.
//  */
// export function addToUnion(parent: RootUnion.Type | Union.Type, newItem: RuleInput | NewUnion.Type): RootUnion.Type | Union.Type {
//   return create(parent, (draft) => {
//     const id = uuid();
//     const item = S.is(RuleInput)(newItem)
//       ? S.decodeSync(Rule)({...newItem, id, parentId: draft.id, entity: "rule"})
//       : S.decodeSync(Union.Schema)({...newItem, id, parentId: draft.id, entity: "union", rules: []});
//     draft.rules.push(item);
//   });
// }
//
// /**
//  * Adds multiple rules or unions to a parent union immutably.
//  * @param parent The parent union.
//  * @param newItems The new rules or unions to add.
//  * @returns A new parent union with the items added.
//  */
// export function addManyToUnion(parent: RootUnion.Type | Union.Type, newItems: (RuleInput | NewUnion.Type)[]): RootUnion.Type | Union.Type {
//   return A.reduce(
//     newItems,
//     parent,
//     (acc, item) => addToUnion(acc, item),
//   );
// }
//
// /**
//  * Finds any rule or union by ID using iterative traversal.
//  * @param union The starting union.
//  * @param id The ID to find.
//  * @returns The found item or undefined.
//  */
// export function findById(union: RootUnion.Type | Union.Type, id: string): (Union.Type | Rule) | undefined {
//   if (union.id === id) return union;
//   const queue = [...union.rules];
//   while (queue.length > 0) {
//     const item = queue.shift()!;
//     if (item.id === id) return item;
//     if (item.entity === "union" || item.entity === "rootUnion") {
//       queue.push(...item.rules);
//     }
//   }
//   return undefined;
// }
//
// /**
//  * Removes all items with the given ID immutably using iterative traversal.
//  * @param union The starting union.
//  * @param id The ID to remove.
//  * @returns A new union with items removed.
//  */
// export function removeById<T extends RootUnion.Type | Union.Type>(union: T, id: string): T {
//   return create(union, (draft) => {
//     const queue = [draft];
//     while (queue.length > 0) {
//       const current = queue.shift()!;
//       current.rules = current.rules.filter((item) => {
//         if (item.id === id) return false;
//         if (item.entity === "union") queue.push(item);
//         return true;
//       });
//     }
//   });
// }
//
// /**
//  * Updates a rule by ID immutably.
//  * @param root The root union.
//  * @param id The rule ID.
//  * @param values The updates.
//  * @returns The updated root or undefined if not found.
//  */
// export function updateRuleById(root: RootUnion.Type, id: string, values: Partial<RuleInput>): RootUnion.Type | undefined {
//   const found = findById(root, id);
//   if (!found || found.entity !== "rule") return undefined;
//   return create(root, (draftRoot) => {
//     const parent = findById(draftRoot, found.parentId) as Union.Type | RootUnion.Type;
//     if (!parent) return;
//     const index = parent.rules.findIndex((item) => item.id === id);
//     if (index !== -1) {
//       parent.rules[index] = { ...parent.rules[index], ...values };
//     }
//   });
// }
//
// /**
//  * Updates a union by ID immutably.
//  * @param root The root union.
//  * @param id The union ID.
//  * @param values The updates.
//  * @returns The updated root or undefined if not found.
//  */
// export function updateUnionById(root: RootUnion.Type, id: string, values: Partial<NewUnion.Type>): RootUnion.Type | undefined {
//   const found = findById(root, id);
//   if (!found || (found.entity !== "union" && found.entity !== "rootUnion")) return undefined;
//   if (found.entity === "rootUnion") {
//     return { ...found, ...values };
//   }
//   return create(root, (draftRoot) => {
//     const parent = findById(draftRoot, found.parentId) as Union.Type | RootUnion.Type;
//     if (!parent) return;
//     const index = parent.rules.findIndex((item) => item.id === id);
//     if (index !== -1) {
//       parent.rules[index] = { ...parent.rules[index], ...values };
//     }
//   });
// }
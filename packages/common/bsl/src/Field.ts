import { $BslId } from "@beep/identity/packages";

// import type { Pipeable } from "effect/Pipeable";
const $I = $BslId.create("Field");

export const TypeId: unique symbol = Symbol.for($I`FieldTypeId`);
export type TypeId = typeof TypeId;

export type Field = {};

// export interface Any extends Pipeable {
//   [TypeId]: {
//     readonly column:
//   }
// }

export declare namespace Field {}

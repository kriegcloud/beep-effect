/**
 * Derived kits (collections, literal helpers, etc.).
 *
 * @example
 * import * as Derived from "@beep/schema/derived";
 *
 * const StatusKit = Derived.StringLiteralKit("pending", "active");
 *
 * @category Surface/Derived
 * @since 0.1.0
 *
 */

export * from "./ArrayLookup";
export * from "./KeyOrderLookup";
export * from "./kits";
export * from "./OptionArrayToOptionStruct";
export * from "./OptionArrayToOptionTuple";
export * from "./StructToTuple";
export * from "./TupleToStruct";

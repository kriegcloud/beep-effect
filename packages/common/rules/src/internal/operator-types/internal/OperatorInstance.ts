// import {FieldType} from "./FieldType";
// import {ValueType} from "./ValueType";
// import type {OperatorType} from "./OperatorType";
// import * as Data from "effect/Data";
// import type * as A from "effect/Array";
// import type {StringTypes, StructTypes} from "@beep/types";
// import {BS} from "@beep/schema";
// import * as S from "effect/Schema";
//
// export namespace OperatorInstance {
//   export type Config<
//     TypeConfig extends OperatorType.TypeConfig,
//     AcceptedFieldTypes extends A.NonEmptyReadonlyArray<FieldType.Type>,
//     ValueType extends ValueType.Type,
//     Fields extends StructTypes.StructFieldsWithStringKeys,
//   > = {
//     readonly _: OperatorType.Metadata<TypeConfig>["_"];
//     readonly acceptedFieldTypes: AcceptedFieldTypes;
//     readonly acceptedValueType: ValueType;
//     readonly example: StringTypes.NonEmptyString<string>;
//     readonly fields: Fields;
//   }
//
//   export type Metadata<
//     TypeConfig extends OperatorType.TypeConfig,
//     AcceptedFieldTypes extends A.NonEmptyReadonlyArray<FieldType.Type>,
//     ValueType extends ValueType.Type,
//     Fields extends StructTypes.StructFieldsWithStringKeys,
//   > = {
//     [K in keyof Config<TypeConfig, AcceptedFieldTypes, ValueType, Fields>]: Config<TypeConfig, AcceptedFieldTypes, ValueType, Fields>[K];
//   }
//
//   export class InstanceFactory<
//     const TypeConfig extends OperatorType.TypeConfig,
//     const AcceptedFieldTypes extends A.NonEmptyReadonlyArray<FieldType.Type>,
//     const ValueType extends ValueType.Type,
//     const Fields extends StructTypes.StructFieldsWithStringKeys,
//   > extends Data.TaggedClass("OperatorInstanceFactory")<Metadata<TypeConfig, AcceptedFieldTypes, ValueType, Fields>> {
//
//     constructor(args: Metadata<TypeConfig, AcceptedFieldTypes, ValueType, Fields>) {
//       super(args);
//     }
//   }
// }
//

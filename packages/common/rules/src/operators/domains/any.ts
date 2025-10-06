import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { DomainFactory } from "../../internal/OperatorFactory";
import { TypeOps } from "../categories";

export const anyFactory = new DomainFactory({
  domain: {
    type: "any",
    description: "Any type operators",
    fields: {},
  },
  category: TypeOps.Factory,
});

const common = {
  fields: {},
} as const;

const IsStringOp = anyFactory.createOperator(common, TypeOps.IsString);

export class IsString extends BS.Class<IsString>(IsStringOp.identifier)(IsStringOp.Schema) {
  static readonly config = IsStringOp;
}

// export class IsString extends BS.Class<IsString>(IsStringOp.)

export namespace IsString {
  export type Type = S.Schema.Type<typeof IsString>;
  export type Encoded = S.Schema.Encoded<typeof IsString>;
}

export const IsNotStringOp = anyFactory.createOperator(common, TypeOps.IsNotString);

export class IsNotString extends BS.Class<IsNotString>(IsNotStringOp.identifier)(IsNotStringOp.Schema) {
  static readonly config = IsNotStringOp;
}

export namespace IsNotString {
  export type Type = S.Schema.Type<typeof IsNotString>;
  export type Encoded = S.Schema.Encoded<typeof IsNotString>;
}

export const IsTrueOp = anyFactory.createOperator(common, TypeOps.IsTrue);

export class IsTrue extends BS.Class<IsTrue>(IsTrueOp.identifier)(IsTrueOp.Schema) {
  static readonly config = IsTrueOp;
}

export namespace IsTrue {
  export type Type = S.Schema.Type<typeof IsTrue>;
  export type Encoded = S.Schema.Encoded<typeof IsTrue>;
}

export const IsFalseOp = anyFactory.createOperator(common, TypeOps.IsFalse);

export class IsFalse extends BS.Class<IsFalse>(IsFalseOp.identifier)(IsFalseOp.Schema) {
  static readonly config = IsFalseOp;
}

export namespace IsFalse {
  export type Type = S.Schema.Type<typeof IsFalse>;
  export type Encoded = S.Schema.Encoded<typeof IsFalse>;
}

export const IsNumberOp = anyFactory.createOperator(common, TypeOps.IsNumber);

export class IsNumber extends BS.Class<IsNumber>(IsNumberOp.identifier)(IsNumberOp.Schema) {
  static readonly config = IsNumberOp;
}

export namespace IsNumber {
  export type Type = S.Schema.Type<typeof IsNumber>;
  export type Encoded = S.Schema.Encoded<typeof IsNumber>;
}

export const IsNotNumberOp = anyFactory.createOperator(common, TypeOps.IsNotNumber);

export class IsNotNumber extends BS.Class<IsNotNumber>(IsNotNumberOp.identifier)(IsNotNumberOp.Schema) {
  static readonly config = IsNotNumberOp;
}

export namespace IsNotNumber {
  export type Type = S.Schema.Type<typeof IsNotNumber>;
  export type Encoded = S.Schema.Encoded<typeof IsNotNumber>;
}

export const IsTruthyOp = anyFactory.createOperator(common, TypeOps.IsTruthy);

export class IsTruthy extends BS.Class<IsTruthy>(IsTruthyOp.identifier)(IsTruthyOp.Schema) {
  static readonly config = IsTruthyOp;
}

export namespace IsTruthy {
  export type Type = S.Schema.Type<typeof IsTruthy>;
  export type Encoded = S.Schema.Encoded<typeof IsTruthy>;
}

export const IsNotTruthyOp = anyFactory.createOperator(common, TypeOps.IsNotTruthy);

export class IsNotTruthy extends BS.Class<IsNotTruthy>(IsNotTruthyOp.identifier)(IsNotTruthyOp.Schema) {
  static readonly config = IsNotTruthyOp;
}

export namespace IsNotTruthy {
  export type Type = S.Schema.Type<typeof IsNotTruthy>;
  export type Encoded = S.Schema.Encoded<typeof IsNotTruthy>;
}

export const IsFalsyOp = anyFactory.createOperator(common, TypeOps.IsFalsy);

export class IsFalsy extends BS.Class<IsFalsy>(IsFalsyOp.identifier)(IsFalsyOp.Schema) {
  static readonly config = IsFalsyOp;
}

export namespace IsFalsy {
  export type Type = S.Schema.Type<typeof IsFalsy>;
  export type Encoded = S.Schema.Encoded<typeof IsFalsy>;
}

export const IsNotFalsyOp = anyFactory.createOperator(common, TypeOps.IsNotFalsy);

export class IsNotFalsy extends BS.Class<IsNotFalsy>(IsNotFalsyOp.identifier)(IsNotFalsyOp.Schema) {
  static readonly config = IsNotFalsyOp;
}

export namespace IsNotFalsy {
  export type Type = S.Schema.Type<typeof IsNotFalsy>;
  export type Encoded = S.Schema.Encoded<typeof IsNotFalsy>;
}

export const IsNullOp = anyFactory.createOperator(common, TypeOps.IsNull);

export class IsNull extends BS.Class<IsNull>(IsNullOp.identifier)(IsNullOp.Schema) {
  static readonly config = IsNullOp;
}

export namespace IsNull {
  export type Type = S.Schema.Type<typeof IsNull>;
  export type Encoded = S.Schema.Encoded<typeof IsNull>;
}

export const IsNotNullOp = anyFactory.createOperator(common, TypeOps.IsNotNull);

export class IsNotNull extends BS.Class<IsNotNull>(IsNotNullOp.identifier)(IsNotNullOp.Schema) {
  static readonly config = IsNotNullOp;
}

export namespace IsNotNull {
  export type Type = S.Schema.Type<typeof IsNotNull>;
  export type Encoded = S.Schema.Encoded<typeof IsNotNull>;
}

export const IsUndefinedOp = anyFactory.createOperator(common, TypeOps.IsUndefined);

export class IsUndefined extends BS.Class<IsUndefined>(IsUndefinedOp.identifier)(IsUndefinedOp.Schema) {
  static readonly config = IsUndefinedOp;
}

export namespace IsUndefined {
  export type Type = S.Schema.Type<typeof IsUndefined>;
  export type Encoded = S.Schema.Encoded<typeof IsUndefined>;
}

export const IsDefinedOp = anyFactory.createOperator(common, TypeOps.IsDefined);

export class IsDefined extends BS.Class<IsDefined>(IsDefinedOp.identifier)(IsDefinedOp.Schema) {
  static readonly config = IsDefinedOp;
}

export namespace IsDefined {
  export type Type = S.Schema.Type<typeof IsDefined>;
}

export const IsBooleanOp = anyFactory.createOperator(common, TypeOps.IsBoolean);

export class IsBoolean extends BS.Class<IsBoolean>(IsBooleanOp.identifier)(IsBooleanOp.Schema) {
  static readonly config = IsBooleanOp;
}

export const IsNotBooleanOp = anyFactory.createOperator(common, TypeOps.IsNotBoolean);

export class IsNotBoolean extends BS.Class<IsNotBoolean>(IsNotBooleanOp.identifier)(IsNotBooleanOp.Schema) {
  static readonly config = IsNotBooleanOp;
}

export namespace IsNotBoolean {
  export type Type = S.Schema.Type<typeof IsNotBoolean>;
  export type Encoded = S.Schema.Encoded<typeof IsNotBoolean>;
}

export const IsArrayOp = anyFactory.createOperator(common, TypeOps.IsArray);

export class IsArray extends BS.Class<IsArray>(IsArrayOp.identifier)(IsArrayOp.Schema) {
  static readonly config = IsArrayOp;
}

export namespace IsArray {
  export type Type = S.Schema.Type<typeof IsArray>;
  export type Encoded = S.Schema.Encoded<typeof IsArray>;
}

export const IsNotArrayOp = anyFactory.createOperator(common, TypeOps.IsNotArray);

export class IsNotArray extends BS.Class<IsNotArray>(IsNotArrayOp.identifier)(IsNotArrayOp.Schema) {
  static readonly config = IsNotArrayOp;
}

export namespace IsNotArray {
  export type Type = S.Schema.Type<typeof IsNotArray>;
  export type Encoded = S.Schema.Encoded<typeof IsNotArray>;
}

export const IsObjectOp = anyFactory.createOperator(common, TypeOps.IsObject);

export class IsObject extends BS.Class<IsObject>(IsObjectOp.identifier)(IsObjectOp.Schema) {
  static readonly config = IsObjectOp;
}

export namespace IsObject {
  export type Type = S.Schema.Type<typeof IsObject>;
  export type Encoded = S.Schema.Encoded<typeof IsObject>;
}

export const IsNotObjectOp = anyFactory.createOperator(common, TypeOps.IsNotObject);

export class IsNotObject extends BS.Class<IsNotObject>(IsNotObjectOp.identifier)(IsNotObjectOp.Schema) {
  static readonly config = IsNotObjectOp;
}

export namespace IsNotObject {
  export type Type = S.Schema.Type<typeof IsNotObject>;
  export type Encoded = S.Schema.Encoded<typeof IsNotObject>;
}

export const IsNullishOp = anyFactory.createOperator(common, TypeOps.IsNullish);

export class IsNullish extends BS.Class<IsNullish>(IsNullishOp.identifier)(IsNullishOp.Schema) {
  static readonly config = IsNullishOp;
}

export namespace IsNullish {
  export type Type = S.Schema.Type<typeof IsNullish>;
  export type Encoded = S.Schema.Encoded<typeof IsNullish>;
}

export const IsNotNullishOp = anyFactory.createOperator(common, TypeOps.IsNotNullish);

export class IsNotNullish extends BS.Class<IsNotNullish>(IsNotNullishOp.identifier)(IsNotNullishOp.Schema) {
  static readonly config = IsNotNullishOp;
}

export namespace IsNotNullish {
  export type Type = S.Schema.Type<typeof IsNotNullish>;
  export type Encoded = S.Schema.Encoded<typeof IsNotNullish>;
}

export const IsIntegerOp = anyFactory.createOperator(common, TypeOps.IsInteger);

export class IsInteger extends BS.Class<IsInteger>(IsIntegerOp.identifier)(IsIntegerOp.Schema) {
  static readonly config = IsIntegerOp;
}

export namespace IsInteger {
  export type Type = S.Schema.Type<typeof IsInteger>;
  export type Encoded = S.Schema.Encoded<typeof IsInteger>;
}

export const IsNotIntegerOp = anyFactory.createOperator(common, TypeOps.IsNotInteger);

export class IsNotInteger extends BS.Class<IsNotInteger>(IsNotIntegerOp.identifier)(IsNotIntegerOp.Schema) {
  static readonly config = IsNotIntegerOp;
}

export namespace IsNotInteger {
  export type Type = S.Schema.Type<typeof IsNotInteger>;
  export type Encoded = S.Schema.Encoded<typeof IsNotInteger>;
}

export const IsFiniteOp = anyFactory.createOperator(common, TypeOps.IsFinite);

export class IsFinite extends BS.Class<IsFinite>(IsFiniteOp.identifier)(IsFiniteOp.Schema) {
  static readonly config = IsFiniteOp;
}

export namespace IsFinite {
  export type Type = S.Schema.Type<typeof IsFinite>;
  export type Encoded = S.Schema.Encoded<typeof IsFinite>;
}

export const IsNotFiniteOp = anyFactory.createOperator(common, TypeOps.IsNotFinite);

export class IsNotFinite extends BS.Class<IsNotFinite>(IsNotFiniteOp.identifier)(IsNotFiniteOp.Schema) {
  static readonly config = IsNotFiniteOp;
}

export namespace IsNotFinite {
  export type Type = S.Schema.Type<typeof IsNotFinite>;
  export type Encoded = S.Schema.Encoded<typeof IsNotFinite>;
}

export const IsNaNOp = anyFactory.createOperator(common, TypeOps.IsNaN);

export class IsNaN extends BS.Class<IsNaN>(IsNaNOp.identifier)(IsNaNOp.Schema) {
  static readonly config = IsNaNOp;
}

export namespace IsNaN {
  export type Type = S.Schema.Type<typeof IsNaN>;
  export type Encoded = S.Schema.Encoded<typeof IsNaN>;
}

export const IsNotNaNOp = anyFactory.createOperator(common, TypeOps.IsNotNaN);

export class IsNotNaN extends BS.Class<IsNotNaN>(IsNotNaNOp.identifier)(IsNotNaNOp.Schema) {
  static readonly config = IsNotNaNOp;
}

export namespace IsNotNaN {
  export type Type = S.Schema.Type<typeof IsNotNaN>;
  export type Encoded = S.Schema.Encoded<typeof IsNotNaN>;
}

export const IsEvenOp = anyFactory.createOperator(common, TypeOps.IsEven);

export class IsEven extends BS.Class<IsEven>(IsEvenOp.identifier)(IsEvenOp.Schema) {
  static readonly config = IsEvenOp;
}

export namespace IsEven {
  export type Type = S.Schema.Type<typeof IsEven>;
  export type Encoded = S.Schema.Encoded<typeof IsEven>;
}

export const IsOddOp = anyFactory.createOperator(common, TypeOps.IsOdd);

export class IsOdd extends BS.Class<IsOdd>(IsOddOp.identifier)(IsOddOp.Schema) {
  static readonly config = IsOddOp;
}

export namespace IsOdd {
  export type Type = S.Schema.Type<typeof IsOdd>;
  export type Encoded = S.Schema.Encoded<typeof IsOdd>;
}

export const IsPositiveOp = anyFactory.createOperator(common, TypeOps.IsPositive);

export class IsPositive extends BS.Class<IsPositive>(IsPositiveOp.identifier)(IsPositiveOp.Schema) {
  static readonly config = IsPositiveOp;
}

export namespace IsPositive {
  export type Type = S.Schema.Type<typeof IsPositive>;
  export type Encoded = S.Schema.Encoded<typeof IsPositive>;
}

export const IsNonPositiveOp = anyFactory.createOperator(common, TypeOps.IsNonPositive);

export class IsNonPositive extends BS.Class<IsNonPositive>(IsNonPositiveOp.identifier)(IsNonPositiveOp.Schema) {
  static readonly config = IsNonPositiveOp;
}

export namespace IsNonPositive {
  export type Type = S.Schema.Type<typeof IsNonPositive>;
  export type Encoded = S.Schema.Encoded<typeof IsNonPositive>;
}

export const IsNegativeOp = anyFactory.createOperator(common, TypeOps.IsNegative);

export class IsNegative extends BS.Class<IsNegative>(IsNegativeOp.identifier)(IsNegativeOp.Schema) {
  static readonly config = IsNegativeOp;
}

export namespace IsNegative {
  export type Type = S.Schema.Type<typeof IsNegative>;
  export type Encoded = S.Schema.Encoded<typeof IsNegative>;
}

export const IsNonNegativeOp = anyFactory.createOperator(common, TypeOps.IsNonNegative);

export class IsNonNegative extends BS.Class<IsNonNegative>(IsNonNegativeOp.identifier)(IsNonNegativeOp.Schema) {
  static readonly config = IsNonNegativeOp;
}

export namespace IsNonNegative {
  export type Type = S.Schema.Type<typeof IsNonNegative>;
  export type Encoded = S.Schema.Encoded<typeof IsNonNegative>;
}

export class TypeOperator extends S.Union(
  IsString,
  IsNotString,
  IsTrue,
  IsFalse,
  IsNumber,
  IsNotNumber,
  IsTruthy,
  IsNotTruthy,
  IsFalsy,
  IsNotFalsy,
  IsNull,
  IsNotNull,
  IsUndefined,
  IsDefined,
  IsBoolean,
  IsNotBoolean,
  IsArray,
  IsNotArray,
  IsObject,
  IsNotObject,
  IsNullish,
  IsNotNullish,
  IsInteger,
  IsNotInteger,
  IsFinite,
  IsNotFinite,
  IsNaN,
  IsNotNaN,
  IsEven,
  IsOdd,
  IsPositive,
  IsNonPositive,
  IsNegative,
  IsNonNegative
) {}

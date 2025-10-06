// import { BS } from "@beep/schema";
// import { faker } from "@faker-js/faker";
// import * as It from "effect/Iterable";
// import * as Match from "effect/Match";
// import type * as R from "effect/Record";
// import * as S from "effect/Schema";
// import * as Str from "effect/String";
// import * as Struct from "effect/Struct";
// import { has } from "./common";
// import { OperatorType } from "./index";
//
// export namespace ComparisonOperators {
//   const factory = OperatorType.makeCategory("comparison", {});
//   export const Eq = factory.make("eq", {});
//
//   export const Ne = factory.make("ne", {});
//
//   export const Gt = factory.make("gt", {});
//
//   export const Gte = factory.make("gte", {});
//
//   export const Lt = factory.make("lt", {});
//
//   export const Lte = factory.make("lte", {});
//
//   export const Between = factory.make("between", {});
//
//   export const NotBetween = factory.make("notBetween", {});
//
//   export const Contains = factory.make("contains", {});
//
//   export const NotContains = factory.make("notContains", {});
// }
//
// export namespace PatternOperators {
//   const factory = OperatorType.makeCategory("pattern", {
//     field: S.String.annotations({
//       arbitrary: () => (fc) =>
//         fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//     }),
//   });
//
//   export const StartsWith = factory.make("startsWith", {});
//   export const NotStartsWith = factory.make("notStartsWith", {});
//   export const EndsWith = factory.make("endsWith", {});
//   export const NotEndsWith = factory.make("notEndsWith", {});
//   export const Matches = factory.make("matches", {});
//   export const NotMatches = factory.make("notMatches", {});
// }
//
// export namespace StructureOperators {
//   const factory = OperatorType.makeCategory("structure", {});
//
//   export const HasKey = factory.make("hasKey", {
//     value: S.String.annotations({
//       arbitrary: () => (fc) =>
//         fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//     }),
//   });
//
//   export const HasValue = factory.make("hasValue", {
//     value: BS.Json,
//   });
//
//   export const HasEntry = factory.make("hasEntry", {
//     value: BS.Struct({
//       key: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//       value: BS.Json,
//     }),
//   });
// }
//
// export namespace StringOperators {
//   const handleCase = (ignoreCase: boolean) => (value: string) =>
//     ignoreCase ? Str.trim(Str.toLowerCase(value)) : Str.trim(value);
//
//   export class Eq extends BS.Class<Eq>("StringOperators.Eq")(
//     ComparisonOperators.Eq.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/Eq"),
//       identifier: "StringOperators.Eq",
//       description: "Checks if the string is equal to the constraint value",
//       title: "String Equal To",
//       [BS.SymbolAnnotationId]: "===",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return caseValue === caseRuleValue;
//     };
//   }
//
//   export namespace Eq {
//     export type Type = S.Schema.Type<typeof Eq>;
//     export type Encoded = S.Schema.Encoded<typeof Eq>;
//   }
//
//   export class Ne extends BS.Class<Ne>("StringOperators.Ne")(
//     ComparisonOperators.Ne.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/Ne"),
//       identifier: "StringOperators.Ne",
//       description: "Checks if the string is not equal to the constraint value",
//       title: "String Not Equal To",
//       [BS.SymbolAnnotationId]: "!==",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return caseValue !== caseRuleValue;
//     };
//   }
//
//   export namespace Ne {
//     export type Type = S.Schema.Type<typeof Ne>;
//     export type Encoded = S.Schema.Encoded<typeof Ne>;
//   }
//
//   export class Contains extends BS.Class<Contains>("StringOperators.Contains")(
//     ComparisonOperators.Contains.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/Contains"),
//       identifier: "StringOperators.Contains",
//       description: "Checks if the string contains the constraint value",
//       title: "String Contains",
//       [BS.SymbolAnnotationId]: "∋",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return caseValue.includes(caseRuleValue);
//     };
//   }
//
//   export namespace Contains {
//     export type Type = S.Schema.Type<typeof Contains>;
//     export type Encoded = S.Schema.Encoded<typeof Contains>;
//   }
//
//   export class NotContains extends BS.Class<NotContains>("StringOperators.NotContains")(
//     ComparisonOperators.NotContains.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/NotContains"),
//       identifier: "StringOperators.NotContains",
//       description: "Checks if the string does not contain the constraint value",
//       title: "String Not Contains",
//       [BS.SymbolAnnotationId]: "∌",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return !caseValue.includes(caseRuleValue);
//     };
//   }
//
//   export namespace NotContains {
//     export type Type = S.Schema.Type<typeof NotContains>;
//     export type Encoded = S.Schema.Encoded<typeof NotContains>;
//   }
//
//   export class StartsWith extends BS.Class<StartsWith>("StringOperators.StartsWith")(
//     PatternOperators.StartsWith.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/StartsWith"),
//       identifier: "StringOperators.StartsWith",
//       description: "Checks if the string starts with the constraint value",
//       title: "String Starts With",
//       [BS.SymbolAnnotationId]: "prefix⋯",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return caseValue.startsWith(caseRuleValue);
//     };
//   }
//
//   export namespace StartsWith {
//     export type Type = S.Schema.Type<typeof StartsWith>;
//     export type Encoded = S.Schema.Encoded<typeof StartsWith>;
//   }
//
//   export class NotStartsWith extends BS.Class<NotStartsWith>("StringOperators.NotStartsWith")(
//     PatternOperators.NotStartsWith.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/NotStartsWith"),
//       identifier: "StringOperators.NotStartsWith",
//       description: "Checks if the string does not start with the constraint value",
//       title: "String Does Not Starts With",
//       [BS.SymbolAnnotationId]: "¬prefix⋯",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return !caseValue.startsWith(caseRuleValue);
//     };
//   }
//
//   export namespace NotStartsWith {
//     export type Type = S.Schema.Type<typeof NotStartsWith>;
//     export type Encoded = S.Schema.Encoded<typeof NotStartsWith>;
//   }
//
//   export class EndsWith extends BS.Class<EndsWith>("StringOperators.EndsWith")(
//     PatternOperators.EndsWith.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/EndsWith"),
//       identifier: "StringOperators.EndsWith",
//       description: "Checks if the string ends with the constraint value",
//       title: "String Ends With",
//       [BS.SymbolAnnotationId]: "⋯suffix",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return caseValue.endsWith(caseRuleValue);
//     };
//   }
//
//   export namespace EndsWith {
//     export type Type = S.Schema.Type<typeof EndsWith>;
//     export type Encoded = S.Schema.Encoded<typeof EndsWith>;
//   }
//
//   export class NotEndsWith extends BS.Class<NotEndsWith>("StringOperators.NotEndsWith")(
//     PatternOperators.NotEndsWith.make({
//       type: BS.LiteralWithDefault("string"),
//       ignoreCase: BS.toOptionalWithDefault(S.Boolean)(false),
//       value: S.String,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/NotEndsWith"),
//       identifier: "StringOperators.NotEndsWith",
//       description: "Checks if the string does not end with the constraint value",
//       title: "String Does Not Ends With",
//       [BS.SymbolAnnotationId]: "⋯¬suffix",
//     })
//   ) {
//     readonly evaluate = (value: string) => {
//       const caseValue = handleCase(this.ignoreCase)(value);
//       const caseRuleValue = handleCase(this.ignoreCase)(this.value);
//
//       return !caseValue.endsWith(caseRuleValue);
//     };
//   }
//
//   export namespace NotEndsWith {
//     export type Type = S.Schema.Type<typeof NotEndsWith>;
//     export type Encoded = S.Schema.Encoded<typeof NotEndsWith>;
//   }
//
//   export class Matches extends BS.Class<Matches>("StringOperators.Matches")(
//     PatternOperators.Matches.make({
//       type: BS.LiteralWithDefault("string"),
//       regex: BS.RegexFromString,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/Matches"),
//       identifier: "StringOperators.Matches",
//       description: "Checks if the string matches the constraint regex",
//       title: "String Matches",
//       [BS.SymbolAnnotationId]: "~",
//     })
//   ) {
//     readonly evaluate = (value: string) => this.regex.test(value);
//   }
//
//   export namespace Matches {
//     export type Type = S.Schema.Type<typeof Matches>;
//     export type Encoded = S.Schema.Encoded<typeof Matches>;
//   }
//
//   export class NotMatches extends BS.Class<NotMatches>("StringOperators.NotMatches")(
//     PatternOperators.NotMatches.make({
//       type: BS.LiteralWithDefault("string"),
//       regex: BS.RegexFromString,
//       field: S.String.annotations({
//         arbitrary: () => (fc) =>
//           fc.constantFrom(null).map(() => faker.helpers.arrayElement(["name", "username", "email"])),
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/string/NotMatches"),
//       identifier: "StringOperators.NotMatches",
//       description: "Checks if the string does not match the constraint regex",
//       title: "String Matches",
//       [BS.SymbolAnnotationId]: "¬~",
//     })
//   ) {
//     readonly evaluate = (value: string) => !this.regex.test(value);
//   }
//
//   export namespace NotMatches {
//     export type Type = S.Schema.Type<typeof NotMatches>;
//     export type Encoded = S.Schema.Encoded<typeof NotMatches>;
//   }
//
//   export class All extends S.Union(
//     Eq,
//     Ne,
//     StartsWith,
//     NotStartsWith,
//     EndsWith,
//     NotEndsWith,
//     Matches,
//     NotMatches,
//     Contains,
//     NotContains
//   ) {}
//
//   export namespace All {
//     export type Type = S.Schema.Type<typeof All>;
//     export type Encoded = S.Schema.Encoded<typeof All>;
//   }
//
//   export const match = (value: string) =>
//     Match.type<All.Type>().pipe(
//       Match.discriminatorsExhaustive("operator")({
//         eq: (op) => op.evaluate(value),
//         ne: (op) => op.evaluate(value),
//         startsWith: (op) => op.evaluate(value),
//         endsWith: (op) => op.evaluate(value),
//         matches: (op) => op.evaluate(value),
//         notMatches: (op) => op.evaluate(value),
//         contains: (op) => op.evaluate(value),
//         notContains: (op) => op.evaluate(value),
//         notStartsWith: (op) => op.evaluate(value),
//         notEndsWith: (op) => op.evaluate(value),
//       })
//     );
// }
//
// export namespace NumberOperators {
//   const field = S.String.annotations({
//     arbitrary: () => (fc) =>
//       fc.constantFrom(null).map(() => faker.helpers.arrayElement(["age", "salary", "height", "weight"])),
//   });
//
//   export class Eq extends BS.Class<Eq>("NumberOperators.Eq")(
//     ComparisonOperators.Eq.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Number,
//       field,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/number/Ne"),
//       identifier: "NumberOperators.Eq",
//       description: "Checks if the number is equal to the constraint value",
//       title: "Number Equal To",
//       [BS.SymbolAnnotationId]: "===",
//     })
//   ) {}
//
//   export namespace Eq {
//     export type Type = S.Schema.Type<typeof Eq>;
//     export type Encoded = S.Schema.Encoded<typeof Eq>;
//   }
//
//   export class Ne extends BS.Class<Ne>("Ne")(
//     ComparisonOperators.Ne.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Number,
//       field,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/number/Ne"),
//       identifier: "NumberOperators.Ne",
//       description: "Checks if the number is not equal to the constraint value",
//       title: "Number Not Equal To",
//       [BS.SymbolAnnotationId]: "!==",
//     })
//   ) {
//     readonly evaluate = (value: number) => {
//       return value !== this.value;
//     };
//   }
//
//   export namespace Ne {
//     export type Type = S.Schema.Type<typeof Ne>;
//     export type Encoded = S.Schema.Encoded<typeof Ne>;
//   }
//
//   export class Gt extends BS.Class<Gt>("NumberOperators.Gt")(
//     ComparisonOperators.Gt.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Number.annotations({
//         arbitrary: () => (fc) => fc.integer(),
//       }),
//       field,
//     })({
//       identifier: "NumberOperators.Gt",
//       schemaId: Symbol.for("@beep/rules/operators/number/Gt"),
//       description: "Checks if the number is greater than the constraint value",
//       title: "Number Greater Than",
//       examples: [
//         {
//           value: 1,
//           operator: "gt",
//           category: "comparison",
//           type: "number",
//           field: "value",
//         },
//       ],
//       [BS.SymbolAnnotationId]: ">",
//     })
//   ) {
//     readonly evaluate = (value: number) => {
//       return value > this.value;
//     };
//   }
//
//   export namespace Gt {
//     export type Type = S.Schema.Type<typeof Gt>;
//     export type Encoded = S.Schema.Encoded<typeof Gt>;
//   }
//
//   export class Gte extends BS.Class<Gte>("NumberOperators.Gte")(
//     ComparisonOperators.Gte.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Number,
//       field,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/number/Gte"),
//       identifier: "NumberOperators.Gte",
//       description: "Checks if the number is greater than or equal to the constraint value",
//       title: "Number Greater Than or Equal To",
//       [BS.SymbolAnnotationId]: ">=",
//     })
//   ) {
//     readonly evaluate = (value: number) => {
//       return value >= this.value;
//     };
//   }
//
//   export namespace Gte {
//     export type Type = S.Schema.Type<typeof Gte>;
//     export type Encoded = S.Schema.Encoded<typeof Gte>;
//   }
//
//   export class Lt extends BS.Class<Lt>("NumberOperators.Lt")(
//     ComparisonOperators.Lt.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Number,
//       field,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/number/Lt"),
//       identifier: "NumberOperators.Lt",
//       description: "Checks if the number is less than the constraint value",
//       title: "Number Less Than",
//       [BS.SymbolAnnotationId]: "<",
//     })
//   ) {
//     readonly evaluate = (value: number) => {
//       return value < this.value;
//     };
//   }
//
//   export namespace Lt {
//     export type Type = S.Schema.Type<typeof Lt>;
//     export type Encoded = S.Schema.Encoded<typeof Lt>;
//   }
//
//   export class Lte extends BS.Class<Lte>("NumberOperators.Lte")(
//     ComparisonOperators.Lte.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Number,
//       field,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/number/Lte"),
//       identifier: "NumberOperators.Lte",
//       description: "Checks if the number is less than or equal to the constraint value",
//       title: "Number Less Than or Equal To",
//       [BS.SymbolAnnotationId]: "<=",
//     })
//   ) {
//     readonly evaluate = (value: number) => {
//       return value <= this.value;
//     };
//   }
//
//   export namespace Lte {
//     export type Type = S.Schema.Type<typeof Lte>;
//     export type Encoded = S.Schema.Encoded<typeof Lte>;
//   }
//
//   export class Between extends BS.Class<Between>("NumberOperators.Between")(
//     ComparisonOperators.Between.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Struct({
//         min: S.Number,
//         max: S.Number,
//       }).pipe(S.filter(({ min, max }) => min <= max)),
//       field,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/number/Between"),
//       identifier: "NumberOperators.Between",
//       description: "Checks if the number is between the constraint values",
//       title: "Number Between",
//       [BS.SymbolAnnotationId]: `x ∈ [a, b]`,
//     })
//   ) {
//     readonly evaluate = (value: number) => {
//       return value >= this.value.min && value <= this.value.max;
//     };
//   }
//
//   export namespace Between {
//     export type Type = S.Schema.Type<typeof Between>;
//     export type Encoded = S.Schema.Encoded<typeof Between>;
//   }
//
//   export class NotBetween extends BS.Class<NotBetween>("NumberOperators.NotBetween")(
//     ComparisonOperators.NotBetween.make({
//       type: BS.LiteralWithDefault("number"),
//       value: S.Struct({
//         min: S.Number,
//         max: S.Number,
//       }).pipe(S.filter(({ min, max }) => min <= max)),
//       field,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/number/NotBetween"),
//       identifier: "NumberOperators.NotBetween",
//       description: "Checks if the number is not between the constraint values",
//       title: "Number Not Between",
//       [BS.SymbolAnnotationId]: `x ∉ [a, b]`,
//     })
//   ) {
//     readonly evaluate = (value: number) => {
//       return value < this.value.min || value > this.value.max;
//     };
//   }
//
//   export namespace NotBetween {
//     export type Type = S.Schema.Type<typeof NotBetween>;
//     export type Encoded = S.Schema.Encoded<typeof NotBetween>;
//   }
//
//   export class All extends S.Union(Eq, Ne, Gt, Gte, Lt, Lte, Between, NotBetween) {}
//
//   export namespace All {
//     export type Type = S.Schema.Type<typeof All>;
//     export type Encoded = S.Schema.Encoded<typeof All>;
//   }
// }
//
// export namespace ObjectOperators {
//   export class HasKey extends BS.Class<HasKey>("ObjectOperators.HasKey")(
//     StructureOperators.HasKey.make({
//       type: BS.LiteralWithDefault("object"),
//       value: S.String,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/object/HasKey"),
//       identifier: "ObjectOperators.HasKey",
//       description: "Checks if the object has a key",
//       title: "Object Has Key",
//       [BS.SymbolAnnotationId]: "∋ key",
//     })
//   ) {
//     readonly evaluate = (keys: ReadonlyArray<string>) => has(keys, this.value);
//   }
//
//   export namespace HasKey {
//     export type Type = S.Schema.Type<typeof HasKey>;
//     export type Encoded = S.Schema.Encoded<typeof HasKey>;
//   }
//
//   export class HasValue extends BS.Class<HasValue>("ObjectOperators.HasValue")(
//     StructureOperators.HasValue.make({
//       type: BS.LiteralWithDefault("object"),
//       value: BS.Json,
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/object/HasValue"),
//       identifier: "ObjectOperators.HasValue",
//       description: "Checks if a field in the object has a value",
//       title: "Object Has Value",
//       [BS.SymbolAnnotationId]: "∋ value",
//     })
//   ) {
//     readonly evaluate = (values: ReadonlyArray<BS.Json.Type>) => has(values, this.value);
//   }
//
//   export namespace HasValue {
//     export type Type = S.Schema.Type<typeof HasValue>;
//     export type Encoded = S.Schema.Encoded<typeof HasValue>;
//   }
//   export const KV = S.Struct({ key: S.String, value: BS.Json });
//
//   namespace KV {
//     export type Type = S.Schema.Type<typeof KV>;
//     export type Encoded = S.Schema.Encoded<typeof KV>;
//   }
//
//   export class HasEntry extends BS.Class<HasEntry>("ObjectOperators.HasEntry")(
//     StructureOperators.HasEntry.make({
//       type: BS.LiteralWithDefault("object"),
//       value: S.Struct({
//         key: S.String,
//         value: KV,
//       }),
//     })({
//       schemaId: Symbol.for("@beep/rules/operators/object/HasEntry"),
//       identifier: "ObjectOperators.HasEntry",
//       description: "Checks if the object contains a key-value pair",
//       title: "Object Has Entry",
//       [BS.SymbolAnnotationId]: "∋ {k:v}",
//     })
//   ) {
//     readonly evaluate = (value: R.ReadonlyRecord<string, BS.Json.Type>) => {
//       const kvs = Struct.entries(value).map(([key, v]) => ({ key, value: v }));
//       // Deep equality for { key, value } using the schema:
//       const eqKV = S.equivalence(KV); // (a, b) => boolean
//
//       // Helpers leveraging Effect's set ops with custom equivalence
//       const containsKV = (pair: KV.Type) => It.containsWith(eqKV)(pair)(kvs);
//
//       return containsKV(this.value);
//     };
//   }
//
//   export namespace HasEntry {
//     export type Type = S.Schema.Type<typeof HasEntry>;
//     export type Encoded = S.Schema.Encoded<typeof HasEntry>;
//   }
//
//   export class All extends S.Union(HasKey, HasValue, HasEntry) {}
//
//   export namespace All {
//     export type Type = S.Schema.Type<typeof All>;
//     export type Encoded = S.Schema.Encoded<typeof All>;
//   }
// }
//
// export class Union extends S.Union(StringOperators.All, NumberOperators.All, ObjectOperators.All) {}
//
// export namespace Union {
//   export type Type = S.Schema.Type<typeof Union>;
//   export type Encoded = S.Schema.Encoded<typeof Union>;
// }
//
// export type UnionType = typeof Union.Type;
//
// export const match = (value: unknown) => {
//   if (typeof value === "string") {
//     return StringOperators.match(value);
//   }
// };

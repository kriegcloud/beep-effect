import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
export declare const errorMessageWithFormattedIssue: (message: string) => (issue: ParseResult.ParseIssue) => `${string}: ${string}`;
declare const EntityIdFormatSchema_base: S.filter<S.filter<S.filter<S.filter<typeof S.NonEmptyTrimmedString>>>>;
export declare class EntityIdFormatSchema extends EntityIdFormatSchema_base {
    static readonly enforceInvariant: (input: EntityIdFormatSchema.Type) => string;
}
export declare namespace EntityIdFormatSchema {
    type Type = typeof EntityIdFormatSchema.Type;
    type Encoded = typeof EntityIdFormatSchema.Encoded;
}
export declare const makeEntityId: <const Brand extends `${Capitalize<string>}Id`>(brand: Brand, annotations: Readonly<{
    description: string;
}>) => S.brand<S.refine<number, typeof S.NonNegative>, Brand>;
export {};
//# sourceMappingURL=utils.d.ts.map
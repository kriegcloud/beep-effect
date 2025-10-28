import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {invariant} from "@/app/tech-interview/invariant";
import type {NonEmptyString} from "./util-types";

export const errorMessageWithFormattedIssue = F.flow(
  (message: string) => (issue: ParseResult.ParseIssue) =>
    F.pipe(
      message,
      Str.concat(`: ${ParseResult.TreeFormatter.formatIssueSync(issue)}`),
    )
);

export class EntityIdFormatSchema extends S.NonEmptyTrimmedString.pipe(
  S.pattern(/^[^\x00-\x1F\x7F]+$/, {
    message: errorMessageWithFormattedIssue("EntityId must not contain control characters")
  }),
  // alpha characters only refinement
  S.pattern(
    /^[a-zA-Z]+$/,
    {
      message: errorMessageWithFormattedIssue("EntityId must be alpha characters only")
    }
  ),
  S.capitalized({message: errorMessageWithFormattedIssue("EntityId must be capitalized")}),
  S.endsWith("Id", {
    message: errorMessageWithFormattedIssue("EntityId must end with `Id`")
  })
) {
  static readonly enforceInvariant = (input: EntityIdFormatSchema.Type) => {
    invariant(S.is(EntityIdFormatSchema)(input), "[Invariant Violation]: Invalid EntityId format");
    return input;
  };
}

export declare namespace EntityIdFormatSchema {
  export type Type = typeof EntityIdFormatSchema.Type;
  export type Encoded = typeof EntityIdFormatSchema.Encoded
}

const makeEntityIdTitleAnnotation = <const Brand extends `${Capitalize<NonEmptyString>}Id`>(
  brand: Brand
) => F.pipe(
  F.pipe(brand, Str.split("Id"), A.head),
  O.getOrThrowWith(() => new Error("Invalid EntityId Format")),
  (entityName) => Str.concat(" Id")(Str.capitalize(entityName))
);
export const makeEntityId = <
  const Brand extends  `${Capitalize<string>}Id`
>(brand: Brand, annotations: Readonly<{
  description: string;
}>) => {
  EntityIdFormatSchema.enforceInvariant(brand);
  return S.NonNegativeInt.pipe(
    S.brand(brand)
  ).annotations({
    identifier: brand,
    title: makeEntityIdTitleAnnotation(brand),
    description: annotations.description,
    arbitrary: () => (fc) => fc.integer({
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
    }).map((i) => i as B.Branded<number, Brand>)
  });
};
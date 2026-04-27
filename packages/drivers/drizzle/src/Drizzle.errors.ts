/**
 * Drizzle ORM Error schemas
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $DrizzleId } from "@beep/identity";
import { SchemaUtils, TaggedErrorClass } from "@beep/schema";
import { O } from "@beep/utils";
import * as Driz from "drizzle-orm";
import { pipe } from "effect";
import * as S from "effect/Schema";

const $I = $DrizzleId.create("Drizzle.errors");

export const DrizzleError = S.instanceOf(Driz.DrizzleError).pipe(
  $I.annoteSchema("DrizzleError", {
    description: "Base error schema for Drizzle ORM errors",
  }),
  SchemaUtils.withStatics((schema) => ({
    optionFromUnknown: (u: unknown) =>
      pipe(
        u,
        O.liftPredicate((u): u is DrizzleError => S.is(schema)(u))
      ),
  }))
);

export type DrizzleError = typeof DrizzleError.Type;

export const DrizzleQueryError = S.instanceOf(Driz.DrizzleQueryError).pipe(
  $I.annoteSchema("DrizzleQueryError", {
    description: "Base error schema for Drizzle ORM query errors",
  }),
  SchemaUtils.withStatics((schema) => ({
    optionFromUnknown: (u: unknown) =>
      pipe(
        u,
        O.liftPredicate((u): u is DrizzleQueryError => S.is(schema)(u))
      ),
  }))
);

export type DrizzleQueryError = typeof DrizzleQueryError.Type;

export class QueryError extends TaggedErrorClass<QueryError>($I`QueryError`)(
  "QueryError",
  {
    drizzleQueryError: S.Option(DrizzleQueryError),
    cause: S.DefectWithStack,
  },
  $I.annote("QueryError", {
    description: "Base error class for Drizzle ORM query errors",
  })
) {
  static readonly fromUnknown = (u: unknown) => {
    const drizzleQueryErrorOpt = DrizzleQueryError.optionFromUnknown(u);
    return new QueryError({
      drizzleQueryError: drizzleQueryErrorOpt,
      cause: u,
    });
  };
}

export class ORMError extends TaggedErrorClass<ORMError>($I`ORMError`)(
  "ORMError",
  {
    drizzleError: S.Option(DrizzleError),
    cause: S.DefectWithStack,
  },
  $I.annote("ORMError", {
    description: "Base error class for Drizzle ORM errors",
  })
) {
  static readonly fromUnknown = (u: unknown) => {
    const drizzleErrorOpt = DrizzleError.optionFromUnknown(u);
    return new ORMError({
      drizzleError: drizzleErrorOpt,
      cause: u,
    });
  };
}

export const DrizzleProviderError = S.Union([ORMError, QueryError]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("DrizzleProviderError", {
    description: "Union schema for Drizzle ORM provider errors",
  })
);

export type ProviderError = typeof DrizzleProviderError.Type;

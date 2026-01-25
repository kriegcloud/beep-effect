import * as S from "effect/Schema";

export const OptionalAsOption = <A, E, R>(schema: S.Schema<A, E, R>) => S.optionalWith(schema, { as: "Option" });

export const ExactOptionalAsOption = <A, E, R>(schema: S.Schema<A, E, R>) =>
  S.optionalWith(schema, { as: "Option", exact: true });

export const NullableOptionalAsOption = <A, E, R>(schema: S.Schema<A, E, R>) =>
  S.optionalWith(schema, { as: "Option", nullable: true });

export const ExactNullableOptionalAsOption = <A, E, R>(schema: S.Schema<A, E, R>) =>
  S.optionalWith(schema, { as: "Option", nullable: true });

export const OptionalNullable = <A, E, R>(schema: S.Schema<A, E, R>) => S.optionalWith(schema, { nullable: true });

export const ExactOptionalNullable = <A, E, R>(schema: S.Schema<A, E, R>) =>
  S.optionalWith(schema, {
    nullable: true,
    exact: true,
  });

export const ExactOptional = <A, E, R>(schema: S.Schema<A, E, R>) => S.optionalWith(schema, { exact: true });

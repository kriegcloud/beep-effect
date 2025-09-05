import * as S from "effect/Schema";

export const toOptionalWithDefault =
  <const A, const I, const R>(schema: S.Schema<A, I, R>) =>
  (defaultValue: Exclude<S.Schema.Type<S.Schema<A, I, R>>, undefined>) =>
    schema.pipe(
      S.optional,
      S.withDefaults({
        constructor: () => defaultValue,
        decoding: () => defaultValue,
      })
    );

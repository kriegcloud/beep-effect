import * as F from "effect/Function";
import * as S from "effect/Schema";

export namespace WithDefaultsThunk {
  export type Type<A, I, R> = S.PropertySignature<":", Exclude<A, undefined>, never, "?:", I | undefined, true, R>;
  export type Maker<A, I, R> = (defaultValue: Exclude<A, undefined>) => Type<A, I, R>;
  export const make =
    <const A, const I, const R>(self: S.optional<S.Schema<A, I, R>>): Maker<A, I, R> =>
    (defaultValue: Exclude<A, undefined>): Type<A, I, R> => {
      const thunk = F.pipe(
        F.constant<typeof defaultValue>(defaultValue),
        (thunk) => ({ decoding: thunk, constructor: thunk }) as const
      );

      return self.pipe(S.withDefaults(thunk));
    };
}

export const toOptionalWithDefault =
  <const A, const I, const R>(schema: S.Schema<A, I, R>) =>
  (
    defaultValue: Exclude<S.Schema.Type<S.Schema<A, I, R>>, undefined>
  ): S.PropertySignature<":", Exclude<A, undefined>, never, "?:", I | undefined, true, R> =>
    WithDefaultsThunk.make(S.optional(schema))(defaultValue);

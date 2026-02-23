import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export const OptionFromOptionalProperty = <A, E, R>(
  self: S.Schema<A, E, R>
): S.PropertySignature<":", O.Option<A>, never, "?:", E | undefined, true, R> =>
  F.pipe(
    self,
    S.OptionFromUndefinedOr,
    S.optional,
    S.withDefaults({
      constructor: O.none<A>,
      decoding: O.none<A>,
    })
  );

export const OptionFromNullableOptionalProperty = <A, E, R>(
  self: S.Schema<A, E, R>
): S.PropertySignature<":", O.Option<A>, never, "?:", E | null | undefined, true, R> =>
  F.pipe(
    self,
    S.OptionFromNullOr,
    S.optional,
    S.withDefaults({
      constructor: O.none<A>,
      decoding: O.none<A>,
    })
  );
// S.PropertySignature<":", O.Option<A>, never, "?:", E | null | undefined, true, R>

export const OptionFromNullishOptionalProperty = <A, E, R>(
  self: S.Schema<A, E, R>,
  onNoneEncoding: null | undefined
): S.PropertySignature<":", O.Option<A>, never, "?:", E | null | undefined, true, R> =>
  F.pipe(
    S.OptionFromNullishOr(self, onNoneEncoding),
    S.optional,
    S.withDefaults({
      constructor: O.none<A>,
      decoding: O.none<A>,
    })
  );

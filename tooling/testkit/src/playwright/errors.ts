import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {errors} from "playwright-core";

export class PlaywrightCoreTimoutError extends S.instanceOf(errors.TimeoutError) {

}

export declare namespace PlaywrightCoreTimoutError {
  export type Type = S.Schema.Type<typeof PlaywrightCoreTimoutError>
}

export class PlaywrightTimeoutError extends S.TaggedError<PlaywrightTimeoutError>()("TimeoutError", {
  reason: S.tag("Timeout"),
  cause: PlaywrightCoreTimoutError
}) {
  static readonly new = (cause: PlaywrightCoreTimoutError.Type) => new PlaywrightTimeoutError({cause: cause});
  static readonly $is = S.is(PlaywrightTimeoutError);
}

export class PlaywrightUnknownError extends S.TaggedError<PlaywrightUnknownError>()("UnknownError", {
  reason: S.tag("Unknown"),
  cause: S.Defect
}) {
  static readonly new = (cause: S.Schema.Type<typeof S.Defect>) => new PlaywrightUnknownError({cause: cause});
  static readonly $is = S.is(PlaywrightUnknownError);
}


export declare namespace PlaywrightError {
  export type Type = PlaywrightTimeoutError | PlaywrightUnknownError
  export type Encoded = S.Schema.Encoded<typeof PlaywrightError>
}

export class PlaywrightError extends S.Union(
  PlaywrightTimeoutError,
  PlaywrightUnknownError
) {
  static readonly wrap = (cause: unknown) => F.pipe(
    cause,
    O.liftPredicate(S.is(S.instanceOf(errors.TimeoutError))),
    O.map(PlaywrightTimeoutError.new),
    O.flatMap(S.decodeOption(PlaywrightError)),
    O.match({
      onNone: () => PlaywrightUnknownError.new(cause),
      onSome: (cause) => cause,
    }),
  );

}

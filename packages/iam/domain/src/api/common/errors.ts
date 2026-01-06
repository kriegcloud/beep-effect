import { $IamDomainId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import type * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

const $I = $IamDomainId.create("api/common/errors");

type IamAuthErrorContext = {
  readonly operation: string;
  readonly payload?: unknown;
} & R.ReadonlyRecord<string, unknown>;

const getMessage = Struct.get("message");

/**
 * Authentication error with optional context.
 *
 * Used for all authentication operation failures including
 * sign-up, sign-in, session, and password reset errors.
 *
 * @since 1.0.0
 * @category Errors
 *
 * @example
 * ```ts
 * new IamAuthError({
 *   message: "Failed to sign in",
 *   context: { email: "user@example.com" }
 * })
 * ```
 */
export class IamAuthError extends S.TaggedError<IamAuthError>()($I`IamAuthError`, {
  message: S.String,
  cause: S.optional(S.Defect),
  context: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {
  static readonly $matchUnknownMessage = (e: unknown) =>
    Match.value(e).pipe(
      Match.when(
        (i: unknown): i is Error => i instanceof Error,
        (i) => i.message
      ),
      Match.when((i: unknown): i is ParseResult.ParseError => i instanceof ParseResult.ParseError, getMessage),
      Match.when(P.compose(P.or(P.isObject, P.isRecord), P.hasProperty("message")), getMessage),
      Match.orElse((i) => `Unknown error: ${String(i)}`)
    );

  static readonly selfOrMap =
    ({ operation, payload, ...rest }: IamAuthErrorContext) =>
    (error: unknown) =>
      S.is(this)(error)
        ? error
        : new IamAuthError({
            message: this.$matchUnknownMessage(error),
            cause: error,
            context: {
              operation,
              payload,
              ...rest,
            },
          });

  static readonly mapError = (ctx: IamAuthErrorContext) => Effect.mapError(this.selfOrMap(ctx));

  static readonly flowMap =
    (operation: string) =>
    <I, A, E, R>(effect: Effect.Effect<A, E, R>, n: I) =>
      effect.pipe(
        this.mapError({ operation, payload: n }),
        Effect.annotateLogs({
          arguments: n,
        }),
        Effect.withSpan(operation, {
          attributes: {
            payload: n,
          },
        }),
        Effect.tapError(Effect.logError)
      );
}

import { $SharedIntegrationsId } from "@beep/identity/packages";
import { noOp } from "@beep/utils";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/gmail/errors");

/**
 * Extract HTTP status code from HTTP client errors.
 *
 * Google API clients often throw errors with a `status` and/or `response.status` shape.
 *
 * @param error - The unknown error to extract status from
 * @returns The HTTP status code if available, O.None<number> otherwise
 */
export class HttpStatusOptionFromUnknown extends S.transform(S.Unknown, S.Option(S.Number), {
  decode: Match.type<unknown>().pipe(
    Match.not(P.isRecord, O.none<number>),
    Match.when(S.is(S.Struct({ status: S.Number })), ({ status }) => O.some(status)),
    Match.when(
      S.is(
        S.Struct({
          response: S.Struct({
            status: S.Number,
          }),
        })
      ),
      ({ response }) => O.some(response.status)
    ),
    Match.orElse(O.none<number>)
  ),
  encode: F.identity,
}).annotations(
  $I.annotations("HttpStatusFromUnknown", {
    description: "Extract HTTP status code from HTTP client errors.",
  })
) {
  static readonly decode = S.decodeUnknown(HttpStatusOptionFromUnknown);

  static readonly decodeUnknown = S.decodeUnknown(HttpStatusOptionFromUnknown);
}

export class GmailOperationError extends S.TaggedError<GmailOperationError>($I`GmailOperationError`)(
  "GmailOperationError",
  {
    operation: S.optional(S.String),
    message: S.String,
    status: S.optional(S.Number),
    suggestion: S.optional(S.String),
  },
  $I.annotations("GmailOperationError", {
    description: "Gmail operation error",
  })
) {}

export class GmailTaskError extends S.TaggedError<GmailTaskError>($I`GmailTaskError`)(
  "GmailTaskError",
  {
    taskId: S.String,
    operation: S.String,
    message: S.String,
    suggestion: S.optional(S.String),
  },
  $I.annotations("GmailTaskError", {
    description: "Gmail Task error",
  })
) {}

export class GmailAuthenticationError extends S.TaggedError<GmailAuthenticationError>($I`GmailAuthenticationError`)(
  "GmailAuthenticationError",
  {
    message: S.String,
    suggestion: S.optional(S.String),
  },
  $I.annotations("GmailAuthenticationError", {
    description: "Gmail Authentication error",
  })
) {}

export class GmailMethodError extends S.Union(GmailOperationError, GmailAuthenticationError).annotations(
  $I.annotations("GmailMethodError", {
    description: "Gmail method error",
  })
) {
  static readonly fromUnknown = (failureMessage: string) => (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const statusOpt = S.decodeUnknownOption(HttpStatusOptionFromUnknown)(err).pipe(O.flatten);

    const isStatus401 = F.pipe(statusOpt, O.flatMap(O.liftPredicate(Eq.equals(401))), O.isSome);
    // Check if this is an authentication error (invalid_grant, unauthorized, etc.)
    if (
      errorMessage.includes("invalid_grant") ||
      errorMessage.includes("invalid_token") ||
      errorMessage.includes("unauthorized") ||
      isStatus401
    ) {
      return new GmailAuthenticationError({
        message: `${failureMessage}: ${errorMessage}`,
        suggestion: "Please run 'bun run cli auth google login' to re-authenticate.",
      });
    }

    return new GmailOperationError({
      message: `${failureMessage}: ${errorMessage}`,
      ...statusOpt.pipe(
        O.map((status) => ({ status }) as const),
        O.getOrElse(noOp)
      ),
    });
  };
}

export declare namespace GmailMethodError {
  export type Type = S.Schema.Type<typeof GmailMethodError>;
  export type Encoded = S.Schema.Encoded<typeof GmailMethodError>;
}

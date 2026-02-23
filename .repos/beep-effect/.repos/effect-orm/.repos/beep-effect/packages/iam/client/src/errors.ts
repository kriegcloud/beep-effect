import { BeepError } from "@beep/errors/client";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { BetterAuthError } from "./adapters";

export class IamErrorMetadata extends S.Class<IamErrorMetadata>("@beep/iam-client/errors/IamErrorMetadata")({
  code: S.optional(S.String),
  status: S.optional(S.Number),
  statusText: S.optional(S.String),
  plugin: S.optional(S.String),
  method: S.optional(S.String),
  domain: S.optional(S.String),
  authCause: S.optional(S.Unknown),
}) {}

export class IamError extends S.TaggedError<IamError>("@beep/iam-client/errors/IamError")("IamError", {
  customMessage: S.String,
  cause: S.Unknown,
  code: S.optional(S.String),
  status: S.optional(S.Number),
  statusText: S.optional(S.String),
  plugin: S.optional(S.String),
  method: S.optional(S.String),
  authCause: S.optional(S.Unknown),
}) {
  static readonly new = (cause: unknown, customMessage: string, metadata: IamErrorMetadata = {}) => {
    const normalizedMessage = customMessage ?? "Unknown Error has occurred";
    return new IamError({
      customMessage: normalizedMessage,
      cause,
      ...metadata,
      code: metadata.code,
      status: metadata.status,
      statusText: metadata.statusText,
      plugin: metadata.plugin,
      method: metadata.method,
      authCause: metadata.authCause,
    });
  };

  static readonly match = (error: unknown, metadata: IamErrorMetadata = {}) => {
    if (error instanceof BetterAuthError) {
      return IamError.new(error.cause, error.message, metadata);
    }

    const customMessage =
      P.hasProperty("message")(error) && P.isString(error.message) ? error.message : "Unknown Error has occurred";
    const cause = new BeepError.UnknownError({
      cause: error,
      customMessage,
    });

    return IamError.new(cause, customMessage, metadata);
  };

  override get message() {
    return this.customMessage ?? "Unknown Error has occurred";
  }
}

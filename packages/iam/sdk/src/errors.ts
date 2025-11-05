import { BeepError } from "@beep/errors/client";
import * as Data from "effect/Data";
import * as P from "effect/Predicate";
import { BetterAuthError } from "./adapters";

export interface IamErrorMetadata {
  readonly code?: string | undefined;
  readonly status?: number | undefined;
  readonly statusText?: string | undefined;
  readonly plugin?: string | undefined;
  readonly method?: string | undefined;
  readonly domain?: string | undefined;
  readonly authCause?: unknown | undefined;
}

export class IamError extends Data.TaggedError("IamError")<{
  readonly customMessage: string;
  readonly cause: unknown;
  readonly code?: string | undefined;
  readonly status?: number | undefined;
  readonly statusText?: string | undefined;
  readonly plugin?: string | undefined;
  readonly method?: string | undefined;
  readonly authCause?: unknown | undefined;
}> {
  override readonly code?: string | undefined;
  override readonly status?: number | undefined;
  override readonly statusText?: string | undefined;
  override readonly plugin?: string | undefined;
  override readonly method?: string | undefined;
  override readonly authCause?: unknown | undefined;

  constructor(cause: unknown, customMessage: string, metadata: IamErrorMetadata = {}) {
    const normalizedMessage = customMessage ?? "Unknown Error has occurred";
    super({
      customMessage: normalizedMessage,
      cause,
      ...metadata,
    });

    this.code = metadata.code;
    this.status = metadata.status;
    this.statusText = metadata.statusText;
    this.plugin = metadata.plugin;
    this.method = metadata.method;
    this.authCause = metadata.authCause;
  }

  static readonly match = (error: unknown, metadata: IamErrorMetadata = {}) => {
    if (error instanceof BetterAuthError) {
      return new IamError(error.cause, error.message, metadata);
    }

    const customMessage =
      P.hasProperty("message")(error) && P.isString(error.message) ? error.message : "Unknown Error has occurred";
    const cause = new BeepError.UnknownError({
      cause: error,
      customMessage,
    });

    return new IamError(cause, customMessage, metadata);
  };

  override get message() {
    return this.customMessage ?? "Unknown Error has occurred";
  }
}

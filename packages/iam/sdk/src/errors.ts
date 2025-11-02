import { BeepError } from "@beep/errors/client";
import * as Data from "effect/Data";
import * as P from "effect/Predicate";
import { BetterAuthError } from "./adapters";

export interface IamErrorMetadata {
  readonly code?: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly plugin?: string;
  readonly method?: string;
  readonly domain?: string;
  readonly authCause?: unknown;
}

export class IamError extends Data.TaggedError("IamError")<{
  readonly customMessage: string;
  readonly cause: unknown;
  readonly code?: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly plugin?: string;
  readonly method?: string;
  readonly authCause?: unknown;
}> {
  readonly code?: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly plugin?: string;
  readonly method?: string;
  readonly authCause?: unknown;

  constructor(
    readonly cause: unknown,
    readonly customMessage: string,
    readonly metadata: IamErrorMetadata = {}
  ) {
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

  get message() {
    return this.customMessage ?? "Unknown Error has occurred";
  }
}

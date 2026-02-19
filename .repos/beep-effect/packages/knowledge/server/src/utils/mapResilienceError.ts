import type { CircuitOpenError, RateLimitError } from "@beep/knowledge-domain/errors";
import type { TimeoutError } from "@beep/knowledge-server/LlmControl/StageTimeout";
import * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";

import * as P from "effect/Predicate";
import { getErrorMessage } from "./getErrorMessage";
import { getErrorTag } from "./getErrorTag";

type ResilienceError =
  | AiError.AiError
  | HttpServerError.RequestError
  | RateLimitError
  | CircuitOpenError
  | TimeoutError;

export const mapResilienceError = (
  method: string,
  error: ResilienceError
): AiError.AiError | HttpServerError.RequestError => {
  if (P.isTagged(error, "RequestError")) {
    return error;
  }
  if (
    P.isTagged(error, "HttpRequestError") ||
    P.isTagged(error, "HttpResponseError") ||
    P.isTagged(error, "MalformedInput") ||
    P.isTagged(error, "MalformedOutput")
  ) {
    return error;
  }
  return new AiError.UnknownError({
    module: "EntityExtractor",
    method,
    description: `${getErrorTag(error)} ${getErrorMessage(error)}`,
    cause: error,
  });
};

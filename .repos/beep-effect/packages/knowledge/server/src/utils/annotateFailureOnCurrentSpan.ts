import * as Effect from "effect/Effect";
import { getErrorMessage } from "./getErrorMessage";
import { getErrorTag } from "./getErrorTag";

export const annotateFailureOnCurrentSpan = (error: unknown): Effect.Effect<void> =>
  Effect.all([
    Effect.annotateCurrentSpan("outcome.success", false),
    Effect.annotateCurrentSpan("error.tag", getErrorTag(error)),
    Effect.annotateCurrentSpan("error.message", getErrorMessage(error)),
  ]);

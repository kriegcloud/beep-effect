import { render } from "@react-email/render";
import * as Effect from "effect/Effect";
import type React from "react";
import { EmailTemplateRenderError } from "./errors";

export const renderEmail = Effect.fn("renderEmail")(
  function* (element: React.ReactElement) {
    return yield* Effect.tryPromise({
      try: () => render(element),
      catch: (error) =>
        new EmailTemplateRenderError({
          operation: "sendSignInOtpEmail",
          cause: error,
        }),
    });
  },
  Effect.tapErrorTag("EmailTemplateRenderError", Effect.logError)
);

import { GmailClient } from "@beep/google-workspace-client";
import { GoogleApiError } from "@beep/google-workspace-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const GmailClientLive = Layer.succeed(
  GmailClient,
  GmailClient.of({
    listMessages: (_query) =>
      Effect.fail(
        new GoogleApiError({
          message: "Not implemented - Phase 2 will add Gmail API integration",
          statusCode: 501,
          endpoint: "gmail.users.messages.list",
        })
      ),
  })
);

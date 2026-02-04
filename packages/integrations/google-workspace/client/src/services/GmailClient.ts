import type { GoogleApiError } from "@beep/google-workspace-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

export class GmailClient extends Context.Tag("GmailClient")<
  GmailClient,
  {
    readonly listMessages: (query?: string) => Effect.Effect<ReadonlyArray<unknown>, GoogleApiError>;
  }
>() {}

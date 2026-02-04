import type { GoogleApiError } from "@beep/google-workspace-domain";
import { $GoogleWorkspaceClientId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

const $I = $GoogleWorkspaceClientId.create("services/GmailClient");
export class GmailClient extends Context.Tag($I`GmailClient`)<
  GmailClient,
  {
    readonly listMessages: (query?: string) => Effect.Effect<ReadonlyArray<unknown>, GoogleApiError>;
  }
>() {}

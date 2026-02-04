import type { GoogleApiError } from "@beep/google-workspace-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

export class GoogleDriveClient extends Context.Tag("GoogleDriveClient")<
  GoogleDriveClient,
  {
    readonly listFiles: (query?: string) => Effect.Effect<ReadonlyArray<unknown>, GoogleApiError>;
  }
>() {}

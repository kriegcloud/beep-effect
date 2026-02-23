import type { GoogleApiError } from "@beep/google-workspace-domain";
import { $GoogleWorkspaceClientId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

const $I = $GoogleWorkspaceClientId.create("services/GoogleDriveClient");
export class GoogleDriveClient extends Context.Tag($I`GoogleDriveClient`)<
  GoogleDriveClient,
  {
    readonly listFiles: (query?: string) => Effect.Effect<ReadonlyArray<unknown>, GoogleApiError>;
  }
>() {}

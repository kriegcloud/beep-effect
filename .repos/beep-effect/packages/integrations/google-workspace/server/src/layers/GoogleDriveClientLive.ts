import { GoogleDriveClient } from "@beep/google-workspace-client";
import { GoogleApiError } from "@beep/google-workspace-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const GoogleDriveClientLive = Layer.succeed(
  GoogleDriveClient,
  GoogleDriveClient.of({
    listFiles: (_query) =>
      Effect.fail(
        new GoogleApiError({
          message: "Not implemented - Phase 2 will add Google Drive API integration",
          statusCode: 501,
          endpoint: "drive.files.list",
        })
      ),
  })
);

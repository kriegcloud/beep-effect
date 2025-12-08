import { File } from "@beep/shared-domain/entities";
import { UploadThingApi } from "@beep/shared-infra/internal/upload/uploadthing-api";
import { Effect } from "effect";

export const FilesRpcLive = File.FileRpc.toLayer(
  Effect.gen(function* () {
    const uploadThingApi = yield* UploadThingApi;

    return File.FileRpc.of({
      files_initiateUpload: (payload) =>
        uploadThingApi.initiateUpload(payload).pipe(
          Effect.map(({ key, url, fields }) => ({
            presignedUrl: url,
            fields,
            fileKey: key,
          }))
        ),
    });
  })
);

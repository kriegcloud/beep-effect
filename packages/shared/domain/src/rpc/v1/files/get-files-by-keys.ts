import { $SharedDomainId } from "@beep/identity/packages";
import { File } from "@beep/shared-domain/entities";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/files/get-files-by-keys");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    uploadKeys: S.Array(File.UploadKey).pipe(
      S.maxItems(100, { description: "Maximum of 100 files can be retrieved at once." })
    ),
  },
  $I.annotations("GetFilesByKeysPayload", {
    description: "Request payload for retrieving files by their upload keys",
  })
) {}

export const Contract = Rpc.make("getFilesByKeys", {
  payload: Payload,
  success: S.Array(S.NullOr(File.Model)),
});

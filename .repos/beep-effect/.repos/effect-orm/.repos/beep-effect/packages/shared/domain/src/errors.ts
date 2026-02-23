import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("errors");

export class UploadError extends S.TaggedError<UploadError>($I`UploadError`)(
  "UploadError",
  {
    message: S.String,
    cause: S.Defect,
  },
  $I.annotations("UploadError", {
    description: "An error occuring in the upload process",
  })
) {}

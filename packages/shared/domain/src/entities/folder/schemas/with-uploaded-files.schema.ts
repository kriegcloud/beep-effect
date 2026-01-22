import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as File from "../../file";
import { Model } from "../folder.model";

const $I = $SharedDomainId.create("shared/domain/entities/Folder/schemas");

export class WithUploadedFiles extends S.Class<WithUploadedFiles>($I`WithUploadedFiles`)(
  {
    ...Model.fields,
    uploadedFiles: S.Array(File.Model),
  },
  $I.annotations("WithUploadedFiles", {
    description: "Folder model extended with its associated uploaded files",
  })
) {}

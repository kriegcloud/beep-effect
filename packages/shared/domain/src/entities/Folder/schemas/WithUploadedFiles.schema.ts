import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Model as FileModel } from "../../File/File.model";
import { Model } from "../Folder.model";

const $I = $SharedDomainId.create("entities/Folder/schemas/WithUploadedFiles");

export class WithUploadedFiles extends S.Class<WithUploadedFiles>($I`WithUploadedFiles`)(
  {
    ...Model.fields,
    uploadedFiles: S.Array(FileModel),
  },
  $I.annotations("WithUploadedFiles", {
    description: "Folder model extended with its associated uploaded files",
  })
) {}

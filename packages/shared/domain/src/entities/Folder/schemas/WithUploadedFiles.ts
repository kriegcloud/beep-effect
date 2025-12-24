import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as File from "../../File";
import { Model } from "../Folder.model";

const $I = $SharedDomainId.create("shared/domain/entities/Folder/schemas");

export class WithUploadedFiles extends S.Class<WithUploadedFiles>($I`WithUploadedFiles`)({
  ...Model.fields,
  uploadedFiles: S.Array(File.Model),
}) {}

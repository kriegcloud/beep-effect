import { EnvValue } from "@beep/constants";
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { AnyEntityId, EntityKind, SharedEntityIds } from "../../entity-ids";
import * as Organization from "../Organization";
import { UploadKey } from "./schemas";

const $I = $SharedDomainId.create("entities/File/File.model");

export class Model extends M.Class<Model>($I`FileModel`)(
  {
    ...makeFields(SharedEntityIds.FileId, {
      organizationId: SharedEntityIds.OrganizationId,
      key: UploadKey.to,
      url: BS.URLString,
    }),
    name: S.NonEmptyTrimmedString,
    size: S.Int,
    mimeType: BS.MimeType,
    uploadedByUserId: SharedEntityIds.UserId,
    userId: SharedEntityIds.UserId,
    folderId: SharedEntityIds.FolderId,
    metadata: M.JsonFromString(
      BS.NormalizedFile.pipe(
        S.pick(
          "name",
          "size",
          "lastModified",
          "webkitRelativePath",
          "fileSizeSI",
          "fileSizeIEC",
          "fileSizeBitsSI",
          "fileSizeBitsIEC",
          "exif",
          "mimeType",
          "audioMetadata",
          "width",
          "extension",
          "height",
          "md5Hash",
          "aspectRatio",
          "duration"
        )
      )
    ),
  },
  $I.annotations("FileModel", {
    description: "The FileModel entity. This is the primary entity for representing files in the database.",
  })
) {
  static readonly utils = modelKit(Model);

  static readonly createUploadKeyInputFromNormalizedFile = Effect.fn("createUploadKeyInputFromNormalizedFile")(
    function* (input: CreateUploadKeyInput.Type) {
      const normalizedFile = yield* S.decode(BS.NormalizedFileFromSelf)(input.file);
      const env = yield* S.Config("APP_ENV", EnvValue);

      const extension = normalizedFile.extension;
      const fileId = SharedEntityIds.FileId.create();

      const uploadKeyInput: UploadKey.Encoded = {
        env,
        fileId,
        organizationType: input.organizationType,
        organizationId: input.organizationId,
        entityKind: input.entityKind,
        entityIdentifier: input.entityIdentifier,
        entityAttribute: input.entityAttribute,
        extension,
      };

      return uploadKeyInput;
    }
  );
}

export class CreateUploadKeyInput extends S.Class<CreateUploadKeyInput>($I`CreateUploadKeyInput`)(
  {
    entityKind: EntityKind,
    organizationId: SharedEntityIds.OrganizationId,
    organizationType: Organization.OrganizationType,
    entityIdentifier: AnyEntityId,
    entityAttribute: S.NonEmptyTrimmedString,
    file: BS.FileFromSelf,
  },
  $I.annotations("CreateUploadKeyInput", {
    description: "The CreateUploadKeyInput schema. This is used to create a new upload key.",
  })
) {}

export declare namespace CreateUploadKeyInput {
  export type Type = S.Schema.Type<typeof CreateUploadKeyInput>;
  export type Encoded = S.Schema.Encoded<typeof CreateUploadKeyInput>;
}

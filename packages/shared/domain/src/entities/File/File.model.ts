import { EnvValue } from "@beep/constants";
import { BS } from "@beep/schema";
import { FileType, NativeFileInstance } from "@beep/schema/integrations/files/FileInstance";
import { MonthIntToNumber } from "@beep/schema/primitives/temporal";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import { DateTime, Effect, pipe } from "effect";
import * as S from "effect/Schema";
import { AnyEntityId, EntityKind, SharedEntityIds } from "../../entity-ids";
import { modelKit } from "../../factories";
import { OrganizationType } from "../Organization";
import { Filename, FileStatus, OriginalFilename, ShardPrefix, UploadPath } from "./schemas";
export class Model extends M.Class<Model>(`FileModel`)(
  makeFields(SharedEntityIds.FileId, {
    /** Organization ID Reference */
    organizationId: SharedEntityIds.OrganizationId,
    /** File Path */
    key: UploadPath.to,
    /** Url */
    url: BS.URLString,
    filename: Filename,
    originalFilename: OriginalFilename,
    environment: EnvValue,
    shardPrefix: ShardPrefix,
    organizationType: OrganizationType,
    entityKind: EntityKind,
    entityIdentifier: AnyEntityId,
    entityAttribute: S.NonEmptyTrimmedString,
    uploadMonth: BS.MonthNumber,
    extension: BS.FileExtension,
    mimeType: BS.MimeType,
    size: S.NonNegativeInt,
    sizeFormatted: S.String,
    fileType: FileType,
    /** Status */
    status: BS.toOptionalWithDefault(FileStatus)(FileStatus.Enum.PENDING),
  })
) {
  static readonly utils = modelKit(Model);

  static readonly create = Effect.fn("File.Model.create")(function* (params: {
    readonly file: BS.NativeFileInstance.Type;
    readonly config: {
      readonly env: EnvValue.Type;
      readonly bucketName: string;
      readonly chunkSize?: undefined | number;
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
      readonly entityKind: EntityKind.Type;
      readonly entityIdentifier: AnyEntityId.Type;
      readonly entityAttribute: string;
      readonly organizationType: OrganizationType.Type;
      readonly createdBy: string;
    };
  }) {
    const { formattedSize, fileInstance, nativeFile } = yield* NativeFileInstance.validateFile(
      params.file,
      params.config.chunkSize
    );
    const env = params.config.env;
    const originalFilename = yield* OriginalFilename.fromFileInstance(fileInstance);
    const extension = fileInstance.fileExtension;
    const id = SharedEntityIds.FileId.create();
    const shardPrefix = ShardPrefix.fromFileId(id);
    const filename = `${id}.${extension}` as const;
    const now = yield* pipe(DateTime.now, Effect.map(DateTime.toUtc));

    const uploadMonth = yield* S.decodeUnknown(MonthIntToNumber)(DateTime.getPart(now, "month"));

    const key = yield* S.decode(UploadPath)({
      env,
      fileId: id,
      organizationType: params.config.organizationType,
      organizationId: params.config.organizationId,
      entityKind: params.config.entityKind,
      entityIdentifier: params.config.entityIdentifier,
      entityAttribute: params.config.entityAttribute,
      fileItemExtension: extension,
    });

    const url = `https://${params.config.bucketName}${key}` as const;

    return Model.insert.make({
      id,
      key,
      url,
      organizationId: params.config.organizationId,
      filename,
      originalFilename,
      environment: env,
      shardPrefix,
      organizationType: params.config.organizationType,
      entityKind: params.config.entityKind,
      entityIdentifier: params.config.entityIdentifier,
      entityAttribute: params.config.entityAttribute,
      uploadMonth,
      extension: fileInstance.fileExtension,
      mimeType: fileInstance.mimeType,
      size: nativeFile.size,
      sizeFormatted: formattedSize,
      fileType: fileInstance.mediaType,
      status: FileStatus.Enum.PENDING,
      createdBy: params.config.createdBy,
    });
  });
}

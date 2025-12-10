import {EntityKind, Policy} from "@beep/shared-domain";
import {
  FilesRpc,
  InitiateUploadPayload,
  DeleteFilesPayload,
  DeleteFoldersPayload,
  MoveFilesPayload,
  GetFilesByKeysPayload,
  CreateFolderPayload,
} from "@beep/shared-domain/api/files-rpc";
import * as A from "effect/Array";
import {
  Effect,
  Layer,
  Stream
} from "effect";
import * as O from "effect/Option";
import {FileRepo} from "@beep/shared-infra/repos/File.repo";
import {FolderRepo} from "@beep/shared-infra/repos/Folder.repo";
import {BS} from "@beep/schema";
import {File} from "@beep/shared-domain/entities";
import {EnvValue} from "@beep/constants";
import * as S from "effect/Schema";
import {SharedEntityIds} from "@beep/shared-domain";


export const FilesRpcLive = FilesRpc.toLayer(Effect.gen(function* () {
  const fileRepo = yield* FileRepo;
  const folderRepo = yield* FolderRepo;

  return FilesRpc.of({
    files_initiateUpload: Effect.fn("files_initiateUpload")(function* (payload: typeof InitiateUploadPayload.Type) {
      const {user, session, organization} = yield* Policy.AuthContext;
      yield* Effect.logInfo(payload);
      const env = yield* S.Config("APP_ENV", EnvValue);
      const extension = payload.metadata.extension;

      const key = yield* S.decode(File.UploadKey)({
        entityKind: EntityKind.Enum.user,
        fileId: SharedEntityIds.FileId.create(),
        organizationId: session.activeOrganizationId,
        organizationType: organization.type,
        entityIdentifier: user.id,
        entityAttribute: "image",
        env,
        extension,
      });


      return {
        presignedUrl: BS.URLString.make("https://example.com/presigned-url"),
        fileKey: key,
        metadata: payload.metadata,
      };
    }, Effect.catchTags({
      ParseError: Effect.die,
      ConfigError: Effect.die,
    })),
    files_createFolder: Effect.fn("files_createFolder")(function* (payload: CreateFolderPayload) {
      const {user, organization} = yield* Policy.AuthContext;
      return yield* folderRepo.insert({
        id: SharedEntityIds.FolderId.create(),
        source: O.some("user"),
        createdBy: user.id,
        updatedBy: user.id,
        deletedAt: O.none(),
        deletedBy: O.none(),
        organizationId: organization.id,
        userId: user.id,
        name: payload.folderName,
      });
    }, Effect.catchTags({
      DatabaseError: Effect.die,
    })),
    files_deleteFolders: Effect.fn("files_deleteFolders")(function* (payload: typeof DeleteFoldersPayload.Type) {
      yield* folderRepo.deleteFolders(payload);
    }, Effect.catchTags({
      DatabaseError: Effect.die,
    })),
    files_moveFiles: Effect.fn("files_moveFiles")(function* (payload: MoveFilesPayload) {
      const {user} = yield* Policy.AuthContext;


      yield* fileRepo.moveFiles({
        fileIds: payload.fileIds,
        folderId: payload.folderId,
        userId: user.id,
      });
    }, Effect.catchTags({
      DatabaseError: Effect.die,
    })),
    files_list: Effect.fnUntraced(function* () {
      const {user} = yield* Policy.AuthContext;

      const limit = 100;
      return Stream.paginateEffect(0, (offset) =>
        fileRepo
          .listPaginated({
            userId: user.id,
            offset,
            limit,
          })
          .pipe(
            Effect.catchTags({
              DatabaseError: Effect.die,
            }),
            Effect.map(
              (result) =>
                [
                  {rootFiles: result.rootFiles, folders: result.folders},
                  result.hasNext ? O.some(offset + limit) : O.none<number>(),
                ] as const,
            ),
          ),
      );
    }, Stream.unwrap),
    files_getFilesByKeys:
      Effect.fn("files_getFilesByKeys")(function* (payload: GetFilesByKeysPayload) {
        const {user} = yield* Policy.AuthContext;


        return yield* fileRepo.getFilesByKeys({
          keys: payload.uploadKeys,
          userId: user.id,
        });
      }, Effect.catchTags({
        DatabaseError: Effect.die,
      })),
    files_deleteFiles: Effect.fn("files_deleteFiles")(function* (payload: DeleteFilesPayload) {
      const {user} = yield* Policy.AuthContext;

      const keys = yield* fileRepo.deleteFiles({
        fileIds: payload.fileIds,
        userId: user.id,
      });
      if (A.isNonEmptyReadonlyArray(keys)) {
        yield* Effect.logInfo("delete in s3");
      }
    }, Effect.catchTags({
      DatabaseError: Effect.die,
    })),
  })
    ;
})).pipe(
  Layer.provide([
    FileRepo.Default,
    FolderRepo.Default,
  ]),
);


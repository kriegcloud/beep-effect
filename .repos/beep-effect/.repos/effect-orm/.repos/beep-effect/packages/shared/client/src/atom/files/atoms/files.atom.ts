import { runtime } from "@beep/shared-client/atom/files/runtime";
import type { FileCacheUpdate } from "@beep/shared-client/atom/files/types";
import { FilesApi } from "@beep/shared-client/atom/services";
import type { File, Folder } from "@beep/shared-domain/entities";
import { Atom, Result } from "@effect-atom/atom-react";
import { Effect, Stream } from "effect";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import { filesEventStreamAtom } from "./filesEventStream.atom";
export const filesAtom = (() => {
  const remoteAtom = runtime.atom(
    Stream.unwrap(
      Effect.gen(function* () {
        const api = yield* FilesApi.Service;

        return api.list();
      })
    ).pipe(
      Stream.scan({ rootFiles: A.empty<File.Model>(), folders: A.empty<Folder.WithUploadedFiles>() }, (acc, curr) => ({
        rootFiles: A.appendAll(acc.rootFiles, curr.rootFiles),
        folders: A.appendAll(acc.folders, curr.folders),
      }))
    )
  );

  return Atom.writable(
    (get) => {
      get.mount(filesEventStreamAtom);
      return get(remoteAtom);
    },
    (ctx, update: FileCacheUpdate) => {
      const current = ctx.get(filesAtom);
      if (current._tag !== "Success") return;

      const nextValue = Match.type<FileCacheUpdate>().pipe(
        Match.tagsExhaustive({
          DeleteFolders: (update) => ({
            ...current.value,
            folders: A.filter(current.value.folders, (folder) => !A.contains(update.folderIds, folder.id)),
          }),
          DeleteFiles: (update) => ({
            rootFiles: A.filter(current.value.rootFiles, (file) => !A.contains(update.fileIds, file.id)),
            folders: A.map(current.value.folders, (folder) => ({
              ...folder,
              files: A.filter(folder.uploadedFiles, (file) => !A.contains(update.fileIds, file.id)),
            })),
          }),
          CreateFolder: (update) => ({
            ...current.value,
            folders: A.append(current.value.folders, { ...update.folder, files: A.empty() }),
          }),
          MoveFiles: (update) => {
            const idsToMove = new Set(update.fileIds);
            const movedFiles = A.empty<File.Model>();

            for (const file of current.value.rootFiles) {
              if (idsToMove.has(file.id)) {
                movedFiles.push(file);
              }
            }
            for (const folder of current.value.folders) {
              for (const file of folder.uploadedFiles) {
                if (idsToMove.has(file.id)) {
                  movedFiles.push(file);
                }
              }
            }

            const rootFilesWithoutMoved = A.filter(current.value.rootFiles, (file) => !idsToMove.has(file.id));
            const foldersWithoutMoved = A.map(current.value.folders, (folder) => ({
              ...folder,
              files: A.filter(folder.uploadedFiles, (file) => !idsToMove.has(file.id)),
            }));

            if (update.toFolderId === null) {
              return {
                rootFiles: A.appendAll(
                  rootFilesWithoutMoved,
                  A.map(movedFiles, (file) => ({ ...file, folderId: null }))
                ),
                folders: foldersWithoutMoved,
              };
            }

            return {
              rootFiles: rootFilesWithoutMoved,
              folders: A.map(foldersWithoutMoved, (folder) => {
                if (folder.id === update.toFolderId) {
                  return {
                    ...folder,
                    files: A.appendAll(
                      folder.files,
                      A.map(movedFiles, (file) => ({ ...file, folderId: update.toFolderId }))
                    ),
                  };
                }
                return folder;
              }),
            };
          },
          AddFile: (update) => {
            if (update.folderId === null) {
              return {
                ...current.value,
                rootFiles: A.prepend(current.value.rootFiles, update.file),
              };
            }

            return {
              ...current.value,
              folders: A.map(current.value.folders, (folder) => {
                if (folder.id === update.folderId) {
                  return {
                    ...folder,
                    files: A.prepend(folder.uploadedFiles, update.file),
                  };
                }
                return folder;
              }),
            };
          },
        })
      );

      ctx.setSelf(Result.success(nextValue(update)));
    },
    (refresh) => {
      refresh(remoteAtom);
    }
  );
})();

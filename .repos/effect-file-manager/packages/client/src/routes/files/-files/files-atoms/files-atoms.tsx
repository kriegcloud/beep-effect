import { makeAtomRuntime } from "@/lib/atom";
import { DomainRpcClient } from "@/lib/domain-rpc-client";
import { EventStream, makeEventStreamAtom } from "@/lib/event-stream-atoms";
import { Atom, Registry, Result } from "@effect-atom/atom-react";
import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpBody from "@effect/platform/HttpBody";
import * as HttpClient from "@effect/platform/HttpClient";
import * as RpcClient from "@effect/rpc/RpcClient";
import {
  CreateFolderRpc,
  DeleteFilesRpc,
  DeleteFoldersRpc,
  FilesEvent,
  Folder,
  FolderId,
  GetFilesByKeysRpc,
  InitiateUploadRpc,
  MoveFilesRpc,
  UploadedFile,
  UploadedFileId,
} from "@example/domain/api/files/files-rpc";
import * as Arr from "effect/Array";
import * as Data from "effect/Data";
import * as DateTime from "effect/DateTime";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { ImageCompressionRpc } from "./internal/image-compression-rpc";
import ImageCompressionWorker from "./internal/image-compression-worker?worker";

// ================================
// Api Service
// ================================

export class Api extends Effect.Service<Api>()(
  "@example/client/routes/files/-files/files-atoms/Api",
  {
    dependencies: [DomainRpcClient.Default],
    effect: Effect.gen(function* () {
      const rpc = yield* DomainRpcClient;
      return {
        list: () => rpc.files_list(),
        initiateUpload: (payload: (typeof InitiateUploadRpc)["payloadSchema"]["Type"]) =>
          rpc.files_initiateUpload(payload),
        deleteFiles: (payload: (typeof DeleteFilesRpc)["payloadSchema"]["Type"]) =>
          rpc.files_deleteFiles(payload),
        deleteFolders: (payload: (typeof DeleteFoldersRpc)["payloadSchema"]["Type"]) =>
          rpc.files_deleteFolders(payload),
        createFolder: (payload: (typeof CreateFolderRpc)["payloadSchema"]["Type"]) =>
          rpc.files_createFolder(payload),
        moveFiles: (payload: (typeof MoveFilesRpc)["payloadSchema"]["Type"]) =>
          rpc.files_moveFiles(payload),
        getFilesByKeys: (payload: (typeof GetFilesByKeysRpc)["payloadSchema"]["Type"]) =>
          rpc.files_getFilesByKeys(payload),
      };
    }),
  },
) {}

// ================================
// Image Compression Client
// ================================

const ImageCompressionProtocol = RpcClient.layerProtocolWorker({
  size: 2,
  concurrency: 1,
}).pipe(
  Layer.provide(BrowserWorker.layerPlatform(() => new ImageCompressionWorker())),
  Layer.orDie,
);

export class ImageCompressionClient extends Effect.Service<ImageCompressionClient>()(
  "@example/client/routes/files/-files/files-atoms/ImageCompressionClient",
  {
    dependencies: [ImageCompressionProtocol],
    scoped: Effect.gen(function* () {
      return { client: yield* RpcClient.make(ImageCompressionRpc) };
    }),
  },
) {}

// ================================
// Upload Types
// ================================

export class ImageTooLargeAfterCompression extends Data.TaggedError(
  "ImageTooLargeAfterCompression",
)<{
  readonly fileName: string;
  readonly originalSizeBytes: number;
  readonly compressedSizeBytes: number;
}> {}

export type UploadPhase = Data.TaggedEnum<{
  Compressing: {};
  Uploading: {};
  Syncing: {};
  Done: {};
}>;
const UploadPhase = Data.taggedEnum<UploadPhase>();

export type ActiveUpload = {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly folderId: FolderId | null;
};

type UploadInput = {
  readonly file: File;
  readonly folderId: FolderId | null;
};

type UploadState = Data.TaggedEnum<{
  Idle: { input: UploadInput };
  Compressing: { input: UploadInput };
  Uploading: { input: UploadInput; fileToUpload: File };
  Syncing: { input: UploadInput; fileKey: string };
  Done: {};
}>;
const UploadState = Data.taggedEnum<UploadState>();

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

export class FileSync extends Effect.Service<FileSync>()(
  "@example/client/routes/files/-files/files-atoms/FileSync",
  {
    dependencies: [Api.Default],
    scoped: Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;
      const api = yield* Api;

      const completionSignals = new Map<
        string,
        {
          readonly uploadId: string;
          readonly deferred: Deferred.Deferred<void>;
          readonly addedAt: DateTime.Utc;
        }
      >();

      const signalFileArrived = (uploadthingKey: string) => {
        const entry = completionSignals.get(uploadthingKey);
        if (!entry) return;
        Deferred.unsafeDone(entry.deferred, Exit.void);
        completionSignals.delete(uploadthingKey);
      };

      const waitForFile = (uploadthingKey: string, uploadId: string) =>
        Effect.gen(function* () {
          const deferred = yield* Deferred.make<void>();
          completionSignals.set(uploadthingKey, {
            uploadId,
            deferred,
            addedAt: yield* DateTime.now,
          });
          yield* Deferred.await(deferred);
          registry.set(
            activeUploadsAtom,
            Arr.filter(registry.get(activeUploadsAtom), (u) => u.id !== uploadId),
          );
        });

      yield* Effect.forkScoped(
        Effect.gen(function* () {
          if (completionSignals.size === 0) return;
          const now = yield* DateTime.now;
          const fiveSecondsAgo = DateTime.subtract(now, { seconds: 5 });

          const fileKeys = Array.from(completionSignals.entries())
            .filter(([_, entry]) => DateTime.lessThan(entry.addedAt, fiveSecondsAgo))
            .map(([key]) => key);

          if (fileKeys.length === 0) return;

          const files = yield* api.getFilesByKeys({ uploadthingKeys: fileKeys });
          for (const file of files) {
            if (file !== null) {
              registry.set(filesAtom, AddFile({ file, folderId: file.folderId }));
              signalFileArrived(file.uploadthingKey);
            }
          }
        }).pipe(Effect.repeat({ schedule: Schedule.spaced("5 seconds") })),
      );

      return {
        completionSignals,
        signalFileArrived,
        waitForFile,
      };
    }),
  },
) {}

export class FilePicker extends Effect.Service<FilePicker>()(
  "@example/client/routes/files/-files/files-atoms/FilePicker",
  {
    scoped: Effect.gen(function* () {
      const fileRef = yield* Effect.acquireRelease(
        Effect.sync(() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.style.display = "none";
          document.body.appendChild(input);
          return input;
        }),
        (input) =>
          Effect.sync(() => {
            input.remove();
          }),
      );

      return {
        open: Effect.async<Option.Option<File>>((resume) => {
          const changeHandler = (e: Event) => {
            const selectedFile = (e.target as HTMLInputElement).files?.[0];
            resume(Effect.succeed(Option.fromNullable(selectedFile)));
            fileRef.value = "";
          };

          const cancelHandler = () => {
            resume(Effect.succeed(Option.none()));
          };

          fileRef.addEventListener("change", changeHandler, { once: true });
          fileRef.addEventListener("cancel", cancelHandler, { once: true });
          fileRef.click();

          return Effect.sync(() => {
            fileRef.removeEventListener("change", changeHandler);
            fileRef.removeEventListener("cancel", cancelHandler);
          });
        }),
      };
    }),
  },
) {}

export const runtime = makeAtomRuntime(
  Layer.mergeAll(
    Api.Default,
    FetchHttpClient.layer,
    FilePicker.Default,
    EventStream.Default,
    FileSync.Default,
    ImageCompressionClient.Default,
  ),
);

export const selectedFilesAtom = Atom.make({
  folderIds: Arr.empty<FolderId>(),
  fileIds: Arr.empty<UploadedFileId>(),
});

// ================================
// Active Uploads (for UI rendering)
// ================================

export const activeUploadsAtom = Atom.make<ReadonlyArray<ActiveUpload>>(Arr.empty());

// ================================
// Upload Atom Family
// ================================

const makeUploadStream = (uploadId: string, input: UploadInput) =>
  Effect.gen(function* () {
    const api = yield* Api;
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk,
      HttpClient.retryTransient({
        times: 3,
        schedule: Schedule.exponential("250 millis", 1.5),
      }),
    );
    const fileSync = yield* FileSync;
    const imageCompression = yield* ImageCompressionClient;

    const transition = (state: UploadState) =>
      Effect.gen(function* () {
        switch (state._tag) {
          case "Idle": {
            // If file is too large and is an image, compress first
            if (
              state.input.file.size > MAX_FILE_SIZE_BYTES &&
              state.input.file.type.startsWith("image/")
            ) {
              return Option.some<readonly [UploadPhase, UploadState]>([
                UploadPhase.Compressing(),
                UploadState.Compressing({ input: state.input }),
              ]);
            }
            // Otherwise, upload directly
            return Option.some<readonly [UploadPhase, UploadState]>([
              UploadPhase.Uploading(),
              UploadState.Uploading({ input: state.input, fileToUpload: state.input.file }),
            ]);
          }

          case "Compressing": {
            const maxAttempts = 3;

            const compressed = yield* Effect.iterate(
              {
                data: new Uint8Array(yield* Effect.promise(() => state.input.file.arrayBuffer())),
                mimeType: state.input.file.type,
                attempt: 0,
              },
              {
                while: (s) => s.data.length > MAX_FILE_SIZE_BYTES && s.attempt < maxAttempts,
                body: (s) =>
                  Effect.map(
                    imageCompression.client.compress({
                      data: s.data,
                      mimeType: s.mimeType,
                      fileName: state.input.file.name,
                      maxSizeMB: 1,
                    }),
                    (result) => ({
                      data: result.data,
                      mimeType: result.mimeType,
                      attempt: s.attempt + 1,
                    }),
                  ),
              },
            );

            if (compressed.data.length > MAX_FILE_SIZE_BYTES) {
              return yield* new ImageTooLargeAfterCompression({
                fileName: state.input.file.name,
                originalSizeBytes: state.input.file.size,
                compressedSizeBytes: compressed.data.length,
              });
            }

            const compressedFile = new File([compressed.data], state.input.file.name, {
              type: compressed.mimeType,
            });

            return Option.some<readonly [UploadPhase, UploadState]>([
              UploadPhase.Uploading(),
              UploadState.Uploading({ input: state.input, fileToUpload: compressedFile }),
            ]);
          }

          case "Uploading": {
            const { presignedUrl, fields, fileKey } = yield* api.initiateUpload({
              fileName: state.fileToUpload.name,
              fileSize: state.fileToUpload.size,
              mimeType: state.fileToUpload.type,
              folderId: state.input.folderId,
            });

            const formData = new FormData();
            for (const [key, value] of Object.entries(fields)) {
              formData.append(key, value);
            }
            formData.append("file", state.fileToUpload);

            yield* httpClient.post(presignedUrl, { body: HttpBody.formData(formData) });

            return Option.some<readonly [UploadPhase, UploadState]>([
              UploadPhase.Syncing(),
              UploadState.Syncing({ input: state.input, fileKey }),
            ]);
          }

          case "Syncing": {
            yield* fileSync.waitForFile(state.fileKey, uploadId);
            return Option.some<readonly [UploadPhase, UploadState]>([
              UploadPhase.Done(),
              UploadState.Done(),
            ]);
          }

          case "Done": {
            return Option.none();
          }
        }
      }).pipe(
        Effect.catchTags({
          Unauthorized: (e) => Effect.die(e),
          RpcClientError: (e) => Effect.die(e),
          RequestError: (e) => Effect.die(e),
          ResponseError: (e) => Effect.die(e),
        }),
      );

    return Stream.unfoldEffect(UploadState.Idle({ input }) as UploadState, transition);
  }).pipe(Stream.unwrap);

export const uploadAtom = Atom.family((uploadId: string) =>
  runtime.fn((input: UploadInput) => makeUploadStream(uploadId, input)),
);

// ================================
// Start Upload Atom
// ================================

export const startUploadAtom = runtime.fn(
  Effect.fn(function* (payload: { _tag: "Root" } | { _tag: "Folder"; id: FolderId }) {
    const registry = yield* Registry.AtomRegistry;
    const filePicker = yield* FilePicker;

    const selectedFile = yield* filePicker.open.pipe(
      Effect.flatten,
      Effect.catchTag("NoSuchElementException", () => Effect.interrupt),
    );

    const uploadId = crypto.randomUUID();
    const folderId = payload._tag === "Folder" ? payload.id : null;

    registry.set(
      activeUploadsAtom,
      Arr.append(registry.get(activeUploadsAtom), {
        id: uploadId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        folderId,
      }),
    );

    registry.set(uploadAtom(uploadId), {
      file: selectedFile,
      folderId,
    });
  }),
);

// ================================
// Cancel Upload Atom
// ================================

export const cancelUploadAtom = runtime.fn(
  Effect.fnUntraced(function* (uploadId: string) {
    const registry = yield* Registry.AtomRegistry;

    registry.set(uploadAtom(uploadId), Atom.Interrupt);
    registry.set(
      activeUploadsAtom,
      Arr.filter(registry.get(activeUploadsAtom), (u) => u.id !== uploadId),
    );
  }),
);

// ================================
// Selection Management
// ================================

export const toggleFileSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* (fileId: UploadedFileId) {
    const registry = yield* Registry.AtomRegistry;
    const current = registry.get(selectedFilesAtom);
    registry.set(selectedFilesAtom, {
      ...current,
      fileIds: Arr.contains(current.fileIds, fileId)
        ? Arr.filter(current.fileIds, (id) => id !== fileId)
        : Arr.append(current.fileIds, fileId),
    });
  }),
);

export const toggleFolderSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* (payload: {
    readonly folderId: FolderId;
    readonly fileIdsInFolder: readonly UploadedFileId[];
  }) {
    const registry = yield* Registry.AtomRegistry;
    const current = registry.get(selectedFilesAtom);
    const isFolderSelected = Arr.contains(current.folderIds, payload.folderId);

    if (isFolderSelected) {
      registry.set(selectedFilesAtom, {
        folderIds: Arr.filter(current.folderIds, (id) => id !== payload.folderId),
        fileIds: Arr.filter(
          current.fileIds,
          (fileId) => !Arr.contains(payload.fileIdsInFolder, fileId),
        ),
      });
    } else {
      registry.set(selectedFilesAtom, {
        folderIds: Arr.append(current.folderIds, payload.folderId),
        fileIds: Arr.appendAll(current.fileIds, payload.fileIdsInFolder),
      });
    }
  }),
);

export const clearSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* () {
    const registry = yield* Registry.AtomRegistry;
    registry.set(selectedFilesAtom, {
      folderIds: Arr.empty<FolderId>(),
      fileIds: Arr.empty<UploadedFileId>(),
    });
  }),
);

// ================================
// Delete Files and Folders
// ================================

export const deleteFilesAtom = runtime.fn(
  Effect.fn(function* () {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* Api;
    const { fileIds, folderIds } = registry.get(selectedFilesAtom);
    yield* Effect.zip(
      api.deleteFiles({ fileIds }).pipe(Effect.unless(() => Arr.isEmptyArray(fileIds))),
      api.deleteFolders({ folderIds }).pipe(Effect.unless(() => Arr.isEmptyArray(folderIds))),
      {
        concurrent: true,
      },
    );

    if (Arr.isNonEmptyArray(folderIds)) {
      registry.set(filesAtom, DeleteFolders({ folderIds }));
    }
    if (Arr.isNonEmptyArray(fileIds)) {
      registry.set(filesAtom, DeleteFiles({ fileIds }));
    }

    registry.refresh(selectedFilesAtom);
  }),
);

// ================================
// List Files Atom
// ================================

type FileCacheUpdate = Data.TaggedEnum<{
  DeleteFolders: { folderIds: readonly FolderId[] };
  DeleteFiles: { fileIds: readonly UploadedFileId[] };
  CreateFolder: { folder: Folder.WithUploadedFiles };
  MoveFiles: {
    fileIds: readonly UploadedFileId[];
    fromFolderId: FolderId | null;
    toFolderId: FolderId | null;
  };
  AddFile: {
    file: UploadedFile;
    folderId: FolderId | null;
  };
}>;
const { DeleteFolders, DeleteFiles, CreateFolder, MoveFiles, AddFile } =
  Data.taggedEnum<FileCacheUpdate>();

export const filesAtom = (() => {
  const remoteAtom = runtime.atom(
    Stream.unwrap(
      Effect.gen(function* () {
        const api = yield* Api;
        return api.list();
      }),
    ).pipe(
      Stream.scan(
        { rootFiles: Arr.empty<UploadedFile>(), folders: Arr.empty<Folder.WithUploadedFiles>() },
        (acc, curr) => ({
          rootFiles: Arr.appendAll(acc.rootFiles, curr.rootFiles),
          folders: Arr.appendAll(acc.folders, curr.folders),
        }),
      ),
    ),
  );

  return Atom.writable(
    (get) => {
      get.mount(filesEventStreamAtom);
      return get(remoteAtom);
    },
    (ctx, update: FileCacheUpdate) => {
      const current = ctx.get(filesAtom);
      if (current._tag !== "Success") return;

      const nextValue = (() => {
        switch (update._tag) {
          case "DeleteFolders": {
            return {
              ...current.value,
              folders: Arr.filter(
                current.value.folders,
                (folder) => !Arr.contains(update.folderIds, folder.id),
              ),
            };
          }
          case "DeleteFiles": {
            return {
              rootFiles: Arr.filter(
                current.value.rootFiles,
                (file) => !Arr.contains(update.fileIds, file.id),
              ),
              folders: Arr.map(current.value.folders, (folder) => ({
                ...folder,
                files: Arr.filter(folder.files, (file) => !Arr.contains(update.fileIds, file.id)),
              })),
            };
          }
          case "CreateFolder": {
            return {
              ...current.value,
              folders: Arr.append(current.value.folders, { ...update.folder, files: Arr.empty() }),
            };
          }
          case "MoveFiles": {
            const idsToMove = new Set(update.fileIds);
            const movedFiles = Arr.empty<UploadedFile>();

            for (const file of current.value.rootFiles) {
              if (idsToMove.has(file.id)) {
                movedFiles.push(file);
              }
            }
            for (const folder of current.value.folders) {
              for (const file of folder.files) {
                if (idsToMove.has(file.id)) {
                  movedFiles.push(file);
                }
              }
            }

            const rootFilesWithoutMoved = Arr.filter(
              current.value.rootFiles,
              (file) => !idsToMove.has(file.id),
            );
            const foldersWithoutMoved = Arr.map(current.value.folders, (folder) => ({
              ...folder,
              files: Arr.filter(folder.files, (file) => !idsToMove.has(file.id)),
            }));

            if (update.toFolderId === null) {
              return {
                rootFiles: Arr.appendAll(
                  rootFilesWithoutMoved,
                  Arr.map(movedFiles, (file) => ({ ...file, folderId: null })),
                ),
                folders: foldersWithoutMoved,
              };
            }

            return {
              rootFiles: rootFilesWithoutMoved,
              folders: Arr.map(foldersWithoutMoved, (folder) => {
                if (folder.id === update.toFolderId) {
                  return {
                    ...folder,
                    files: Arr.appendAll(
                      folder.files,
                      Arr.map(movedFiles, (file) => ({ ...file, folderId: update.toFolderId })),
                    ),
                  };
                }
                return folder;
              }),
            };
          }
          case "AddFile": {
            if (update.folderId === null) {
              return {
                ...current.value,
                rootFiles: Arr.prepend(current.value.rootFiles, update.file),
              };
            }

            return {
              ...current.value,
              folders: Arr.map(current.value.folders, (folder) => {
                if (folder.id === update.folderId) {
                  return {
                    ...folder,
                    files: Arr.prepend(folder.files, update.file),
                  };
                }
                return folder;
              }),
            };
          }
        }
      })();

      ctx.setSelf(Result.success(nextValue));
    },
    (refresh) => {
      refresh(remoteAtom);
    },
  );
})();

// ================================
// Files Event Stream Subscription
// ================================

const filesEventStreamAtom = makeEventStreamAtom({
  runtime,
  identifier: "Files",
  predicate: Schema.is(FilesEvent),
  handler: (event: FilesEvent) =>
    Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;
      const fileSync = yield* FileSync;

      fileSync.signalFileArrived(event.file.uploadthingKey);

      registry.set(
        filesAtom,
        AddFile({
          file: event.file,
          folderId: event.file.folderId,
        }),
      );
    }),
});

// ================================
// Create Folder Atom
// ================================

export const createFolderAtom = runtime.fn(
  Effect.fn(function* (folderName: string) {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* Api;
    const folder = yield* api.createFolder({ folderName });

    registry.set(filesAtom, CreateFolder({ folder: { ...folder, files: Arr.empty() } }));

    return folder;
  }),
);

// ================================
// Move Files Atom
// ================================

export const moveFilesAtom = runtime.fn(
  Effect.fn(function* (payload: {
    readonly fileIds: readonly UploadedFileId[];
    readonly folderId: FolderId | null;
  }) {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* Api;

    const filesState = registry.get(filesAtom);
    let fromFolderId: FolderId | null = null;

    if (filesState && filesState._tag === "Success") {
      const inRoot = Arr.some(filesState.value.rootFiles, (file) =>
        Arr.contains(payload.fileIds, file.id),
      );

      if (!inRoot) {
        const sourceFolder = Arr.findFirst(filesState.value.folders, (folder) =>
          Arr.some(folder.files, (file) => Arr.contains(payload.fileIds, file.id)),
        );
        if (sourceFolder._tag === "Some") {
          fromFolderId = sourceFolder.value.id;
        }
      }
    }

    yield* api.moveFiles(payload);

    registry.set(
      filesAtom,
      MoveFiles({
        fileIds: payload.fileIds,
        fromFolderId,
        toFolderId: payload.folderId,
      }),
    );

    registry.refresh(selectedFilesAtom);
  }),
);

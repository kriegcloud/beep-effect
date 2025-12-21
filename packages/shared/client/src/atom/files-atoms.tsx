import { $WebId } from "@beep/identity/packages";
import { makeAtomRuntime } from "@beep/runtime-client";
import { ImageCompressionRpc } from "@beep/runtime-client/workers/image-compression-rpc";
import { BS } from "@beep/schema";
import { AnyEntityId, EntityKind, SharedEntityIds } from "@beep/shared-domain";
import type { Folder } from "@beep/shared-domain/entities";
import { File as BeepFile } from "@beep/shared-domain/entities";
import { Events } from "@beep/shared-domain/rpc/v1";
import { InitiateUpload } from "@beep/shared-domain/rpc/v1/files/_rpcs";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpBody from "@effect/platform/HttpBody";
import * as HttpClient from "@effect/platform/HttpClient";
import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
import * as RpcClient from "@effect/rpc/RpcClient";
import { Atom, Registry, Result } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as DateTime from "effect/DateTime";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Struct from "effect/Struct";
import { ApiClient } from "./api-client.ts";
import { EventStream, makeEventStreamAtom } from "./event-stream-atoms";

const $I = $WebId.create("atoms/files-atoms");

export class Api extends Effect.Service<Api>()($I`Api`, {
  dependencies: [ApiClient.Default],
  effect: Effect.gen(function* () {
    const { rpc } = yield* ApiClient;

    return {
      list: F.flow(rpc.files_list),
      initiateUpload: F.flow(rpc.files_initiateUpload),
      deleteFiles: F.flow(rpc.files_deleteFiles),
      deleteFolders: F.flow(rpc.files_deleteFolders),
      createFolder: F.flow(rpc.files_createFolder),
      moveFiles: F.flow(rpc.files_moveFiles),
      getFilesByKeys: F.flow(rpc.files_getFilesByKeys),
    };
  }),
}) {}

const ImageCompressionProtocol = RpcClient.layerProtocolWorker({
  size: 2,
  concurrency: 1,
}).pipe(
  Layer.provide(
    BrowserWorker.layerPlatform(
      () =>
        new Worker(new URL("@beep/runtime-client/workers/image-compression-worker.ts?worker", import.meta.url), {
          type: "module",
        })
    )
  ),
  Layer.orDie
);

export class ImageCompressionClient extends Effect.Service<ImageCompressionClient>()($I`ImageCompressionClient`, {
  dependencies: [ImageCompressionProtocol],
  scoped: Effect.gen(function* () {
    return { client: yield* RpcClient.make(ImageCompressionRpc) };
  }),
}) {}

export class ImageTooLargeAfterCompression extends Data.TaggedError("ImageTooLargeAfterCompression")<{
  readonly fileName: string;
  readonly originalSizeBytes: number;
  readonly compressedSizeBytes: number;
}> {}

export type UploadPhase = Data.TaggedEnum<{
  readonly Compressing: {};
  readonly Uploading: {};
  readonly Syncing: {};
  readonly Done: {};
}>;

const UploadPhase = Data.taggedEnum<UploadPhase>();

type UploadInput = {
  readonly file: File;
  readonly folderId: SharedEntityIds.FolderId.Type | null;
  readonly entityKind: EntityKind.Type;
  readonly entityIdentifier: AnyEntityId.Type;
  readonly entityAttribute: string;
  readonly metadata: typeof BeepFile.Model.fields.metadata.Type;
};

type UploadState = Data.TaggedEnum<{
  readonly Idle: { readonly input: UploadInput };
  readonly Compressing: { readonly input: UploadInput };
  readonly Uploading: { readonly input: UploadInput; readonly fileToUpload: File };
  readonly Syncing: { readonly input: UploadInput; readonly fileKey: BeepFile.UploadKey.Type };
  readonly Done: {};
}>;

const UploadState = Data.taggedEnum<UploadState>();

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

export class FileSync extends Effect.Service<FileSync>()($I`FileSync`, {
  dependencies: [Api.Default],
  scoped: Effect.gen(function* () {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* Api;

    const completionSignals = new Map<
      BeepFile.UploadKey.Type,
      {
        readonly uploadId: string;
        readonly deferred: Deferred.Deferred<void>;
        readonly addedAt: DateTime.Utc;
      }
    >();

    const signalFileArrived = (key: BeepFile.UploadKey.Type) => {
      const entry = completionSignals.get(key);
      if (!entry) return;
      Deferred.unsafeDone(entry.deferred, Exit.void);
      completionSignals.delete(key);
    };

    const waitForFile = (key: BeepFile.UploadKey.Type, uploadId: string) =>
      Effect.gen(function* () {
        const deferred = yield* Deferred.make<void>();
        completionSignals.set(key, {
          uploadId,
          deferred,
          addedAt: yield* DateTime.now,
        });
        yield* Deferred.await(deferred);
        registry.set(
          activeUploadsAtom,
          A.filter(registry.get(activeUploadsAtom), (u) => u.id !== uploadId)
        );
      });

    yield* Effect.forkScoped(
      Effect.gen(function* () {
        if (completionSignals.size === 0) return;
        const now = yield* DateTime.now;
        const fiveSecondsAgo = DateTime.subtract(now, { seconds: 5 });

        const fileKeys = F.pipe(
          Array.from(completionSignals.entries()),
          A.filter(([_, entry]) => DateTime.lessThan(entry.addedAt, fiveSecondsAgo)),
          A.map(([key]) => key)
        );

        if (fileKeys.length === 0) return;

        const files = yield* api.getFilesByKeys({ uploadKeys: fileKeys });
        for (const file of files) {
          if (file !== null) {
            registry.set(filesAtom, AddFile({ file, folderId: file.folderId }));
            signalFileArrived(file.key);
          }
        }
      }).pipe(Effect.repeat({ schedule: Schedule.spaced("5 seconds") }))
    );

    return {
      completionSignals,
      signalFileArrived,
      waitForFile,
    };
  }),
}) {}

export type ActiveUpload = {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly folderId: SharedEntityIds.FolderId.Type | null;
};

type FileCacheUpdate = Data.TaggedEnum<{
  readonly DeleteFolders: { readonly folderIds: readonly SharedEntityIds.FolderId.Type[] };
  readonly DeleteFiles: { readonly fileIds: readonly SharedEntityIds.FileId.Type[] };
  readonly CreateFolder: { readonly folder: Folder.WithUploadedFiles };
  readonly MoveFiles: {
    readonly fileIds: readonly SharedEntityIds.FileId.Type[];
    readonly fromFolderId: SharedEntityIds.FolderId.Type | null;
    readonly toFolderId: SharedEntityIds.FolderId.Type | null;
  };
  readonly AddFile: {
    readonly file: BeepFile.Model;
    readonly folderId: SharedEntityIds.FolderId.Type | null;
  };
}>;

const { DeleteFiles, DeleteFolders, CreateFolder, MoveFiles, AddFile } = Data.taggedEnum<FileCacheUpdate>();

export class FilePicker extends Effect.Service<FilePicker>()($I`FilePicker`, {
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
        })
    );

    return {
      open: Effect.async<O.Option<File>>((resume) => {
        const changeHandler = (e: Event) => {
          const selectedFile = (e.target as HTMLInputElement).files?.[0];
          resume(Effect.succeed(O.fromNullable(selectedFile)));
          fileRef.value = "";
        };

        const cancelHandler = () => {
          resume(Effect.succeed(O.none()));
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
}) {}

// ================================
// Active Uploads (for UI rendering)
// ================================
export const runtime = makeAtomRuntime(
  Layer.mergeAll(
    Api.Default,
    FetchHttpClient.layer,
    EventStream.Default,
    FileSync.Default,
    ImageCompressionClient.Default,
    FilePicker.Default
  )
);

export const selectedFilesAtom = Atom.make({
  folderIds: A.empty<SharedEntityIds.FolderId.Type>(),
  fileIds: A.empty<SharedEntityIds.FileId.Type>(),
});
export const activeUploadsAtom = Atom.make<ReadonlyArray<ActiveUpload>>(A.empty());

// ================================
// Delete Files and Folders
// ================================

export const deleteFilesAtom = runtime.fn(
  Effect.fn(function* () {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* Api;
    const { fileIds, folderIds } = registry.get(selectedFilesAtom);
    yield* Effect.zip(
      api.deleteFiles({ fileIds }).pipe(Effect.unless(() => A.isEmptyArray(fileIds))),
      api.deleteFolders({ folderIds }).pipe(Effect.unless(() => A.isEmptyArray(folderIds))),
      {
        concurrent: true,
      }
    );

    if (A.isNonEmptyArray(folderIds)) {
      registry.set(filesAtom, DeleteFolders({ folderIds }));
    }
    if (A.isNonEmptyArray(fileIds)) {
      registry.set(filesAtom, DeleteFiles({ fileIds }));
    }

    registry.refresh(selectedFilesAtom);
  })
);

export const filesAtom = (() => {
  const remoteAtom = runtime.atom(
    Stream.unwrap(
      Effect.gen(function* () {
        const api = yield* Api;

        return api.list();
      })
    ).pipe(
      Stream.scan(
        { rootFiles: A.empty<BeepFile.Model>(), folders: A.empty<Folder.WithUploadedFiles>() },
        (acc, curr) => ({
          rootFiles: A.appendAll(acc.rootFiles, curr.rootFiles),
          folders: A.appendAll(acc.folders, curr.folders),
        })
      )
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
            const movedFiles = A.empty<BeepFile.Model>();

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

const filesEventStreamAtom = makeEventStreamAtom({
  runtime,
  identifier: "Files",
  predicate: Schema.is(Events.Event),
  handler: (event: Events.Event.Type) =>
    Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;
      const fileSync = yield* FileSync;

      fileSync.signalFileArrived(event.file.key);

      registry.set(
        filesAtom,
        AddFile({
          file: event.file,
          folderId: event.file.folderId,
        })
      );
    }),
});

export const createFolderAtom = runtime.fn(
  Effect.fn(function* (folderName: string) {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* Api;
    const folder = yield* api.createFolder({ folderName });

    registry.set(filesAtom, CreateFolder({ folder: { ...folder, uploadedFiles: A.empty() } }));

    return folder;
  })
);

export const moveFilesAtom = runtime.fn(
  Effect.fn(function* (payload: {
    readonly fileIds: readonly SharedEntityIds.FileId.Type[];
    readonly folderId: SharedEntityIds.FolderId.Type | null;
  }) {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* Api;

    const filesState = registry.get(filesAtom);
    let fromFolderId: SharedEntityIds.FolderId.Type | null = null;

    if (filesState && filesState._tag === "Success") {
      const inRoot = A.some(filesState.value.rootFiles, (file) => A.contains(payload.fileIds, file.id));

      if (!inRoot) {
        const sourceFolder = A.findFirst(filesState.value.folders, (folder) =>
          A.some(folder.uploadedFiles, (file) => A.contains(payload.fileIds, file.id))
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
      })
    );

    registry.refresh(selectedFilesAtom);
  })
);

const makeUploadStream = (uploadId: string, input: UploadInput) =>
  Effect.gen(function* () {
    const api = yield* Api;
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk,
      HttpClient.retryTransient({
        times: 3,
        schedule: Schedule.exponential("250 millis", 1.5),
      })
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
              F.pipe(state.input.file.type, BS.MimeType.isImageMimeType)
            ) {
              return O.some<readonly [UploadPhase, UploadState]>([
                UploadPhase.Compressing(),
                UploadState.Compressing({ input: state.input }),
              ]);
            }
            // Otherwise, upload directly
            return O.some<readonly [UploadPhase, UploadState]>([
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
                      data: new Uint8Array(result.data),
                      mimeType: result.mimeType,
                      attempt: s.attempt + 1,
                    })
                  ),
              }
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

            return O.some<readonly [UploadPhase, UploadState]>([
              UploadPhase.Uploading(),
              UploadState.Uploading({ input: state.input, fileToUpload: compressedFile }),
            ]);
          }

          case "Uploading": {
            const payload = yield* S.decodeUnknown(InitiateUpload.Payload)({
              fileName: state.fileToUpload.name,
              fileSize: state.fileToUpload.size,
              mimeType: state.fileToUpload.type,
              folderId: state.input.folderId,
              fields: {},
            });
            const { presignedUrl, fileKey } = yield* api.initiateUpload(payload);

            const formData = new FormData();
            for (const [key, value] of Struct.entries(payload.fields)) {
              formData.append(key, value);
            }
            formData.append("file", state.fileToUpload);

            yield* httpClient.post(presignedUrl, { body: HttpBody.formData(formData) });

            return O.some<readonly [UploadPhase, UploadState]>([
              UploadPhase.Syncing(),
              UploadState.Syncing({ input: state.input, fileKey }),
            ]);
          }

          case "Syncing": {
            yield* fileSync.waitForFile(state.fileKey, uploadId);
            return O.some<readonly [UploadPhase, UploadState]>([UploadPhase.Done(), UploadState.Done()]);
          }

          case "Done": {
            return O.none();
          }
        }
      }).pipe(
        Effect.catchTags({
          Unauthorized: (e) => Effect.die(e),
          RpcClientError: (e) => Effect.die(e),
          RequestError: (e) => Effect.die(e),
          ResponseError: (e) => Effect.die(e),
        })
      );

    return Stream.unfoldEffect(UploadState.Idle({ input }) as UploadState, transition);
  }).pipe(Stream.unwrap);

export const uploadAtom = Atom.family((uploadId: string) =>
  runtime.fn((input: UploadInput) => makeUploadStream(uploadId, input))
);

// ================================
// Selection Management
// ================================

export const toggleFileSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* (fileId: SharedEntityIds.FileId.Type) {
    const registry = yield* Registry.AtomRegistry;
    const current = registry.get(selectedFilesAtom);
    registry.set(selectedFilesAtom, {
      ...current,
      fileIds: A.contains(current.fileIds, fileId)
        ? A.filter(current.fileIds, (id) => id !== fileId)
        : A.append(current.fileIds, fileId),
    });
  })
);

export const toggleFolderSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* (payload: {
    readonly folderId: SharedEntityIds.FolderId.Type;
    readonly fileIdsInFolder: readonly SharedEntityIds.FileId.Type[];
  }) {
    const registry = yield* Registry.AtomRegistry;
    const current = registry.get(selectedFilesAtom);
    const isFolderSelected = A.contains(current.folderIds, payload.folderId);

    if (isFolderSelected) {
      registry.set(selectedFilesAtom, {
        folderIds: A.filter(current.folderIds, (id) => id !== payload.folderId),
        fileIds: A.filter(current.fileIds, (fileId) => !A.contains(payload.fileIdsInFolder, fileId)),
      });
    } else {
      registry.set(selectedFilesAtom, {
        folderIds: A.append(current.folderIds, payload.folderId),
        fileIds: A.appendAll(current.fileIds, payload.fileIdsInFolder),
      });
    }
  })
);

export const clearSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* () {
    const registry = yield* Registry.AtomRegistry;
    registry.set(selectedFilesAtom, {
      folderIds: A.empty<SharedEntityIds.FolderId.Type>(),
      fileIds: A.empty<SharedEntityIds.FileId.Type>(),
    });
  })
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
      A.filter(registry.get(activeUploadsAtom), (u) => u.id !== uploadId)
    );
  })
);

// ================================
// Start Upload Atom
// ================================

const startUploadFieldsShared = {
  entityKind: EntityKind,
  entityIdentifier: AnyEntityId,
  entityAttribute: S.String,
  metadata: BeepFile.Model.fields.metadata,
} as const;

export class StartUploadRoot extends S.TaggedClass<StartUploadRoot>($I`StartUploadRoot`)(
  "Root",
  startUploadFieldsShared,
  $I.annotations("StartUploadRoot", {
    description: "Start upload for a root entity",
  })
) {}

export class StartUploadFolder extends S.TaggedClass<StartUploadFolder>($I`StartUploadFolder`)("Folder", {
  ...startUploadFieldsShared,
  id: SharedEntityIds.FolderId,
}) {}

export class StartUploadInput extends S.Union(StartUploadFolder, StartUploadRoot).annotations(
  $I.annotations("StartUploadInput", {
    description: "Start upload for a root entity or a folder",
  })
) {
  static readonly makeFolder = (input: Omit<StartUploadFolder, "_tag">) => new StartUploadFolder(input);
  static readonly makeRoot = (input: Omit<StartUploadRoot, "_tag">) => new StartUploadRoot(input);
}

export declare namespace StartUploadInput {
  export type Type = typeof StartUploadInput.Type;
  export type Encoded = typeof StartUploadInput.Encoded;
}

export const startUploadAtom = runtime.fn(
  Effect.fn(function* (payload: StartUploadInput.Type) {
    const registry = yield* Registry.AtomRegistry;
    const filePicker = yield* FilePicker;

    const selectedFile = yield* filePicker.open.pipe(
      Effect.flatten,
      Effect.catchTag("NoSuchElementException", () => Effect.interrupt)
    );

    const uploadId = crypto.randomUUID();
    const folderId = payload._tag === "Folder" ? payload.id : null;

    registry.set(
      activeUploadsAtom,
      A.append(registry.get(activeUploadsAtom), {
        id: uploadId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        folderId,
      })
    );

    registry.set(uploadAtom(uploadId), {
      file: selectedFile,
      folderId,
      entityKind: payload.entityKind,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
      metadata: payload.metadata,
    });
  })
);

import { $SharedClientId } from "@beep/identity/packages";
import { AddFile, type ActiveUpload, type FileCacheUpdate } from "@beep/shared-client/atom/files/types";
import type { File } from "@beep/shared-domain/entities";
import { Atom, Registry } from "@effect-atom/atom-react";
import { DateTime, Effect, MutableHashMap, Schedule } from "effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { FilesApi } from "../../services";
import * as FileCompletionSignals from "./FileCompletionSignals.ts";

// Lazy imports to break circular dependency:
// runtime.ts → FileSync.service.ts → files.atom.ts → runtime.ts
// We use explicit return type annotations to break the type inference cycle
const getFilesAtom = (): Promise<unknown> =>
  import("../atoms/files.atom.ts").then((m) => m.filesAtom);
const getActiveUploadsAtom = (): Promise<unknown> =>
  import("../atoms/activeUploads.atom.ts").then((m) => m.activeUploadsAtom);

const $I = $SharedClientId.create("atom/files/services/FileSync");

export class Service extends Effect.Service<Service>()($I`Service`, {
  dependencies: [FilesApi.layer],
  scoped: Effect.gen(function* () {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* FilesApi.Service;

    // Resolve atoms lazily to avoid circular import at module load time
    // Type assertions are safe here - the actual atom types are known at runtime
    const filesAtom = (yield* Effect.promise(getFilesAtom)) as Atom.Writable<unknown, FileCacheUpdate>;
    const activeUploadsAtom = (yield* Effect.promise(getActiveUploadsAtom)) as Atom.Writable<
      ReadonlyArray<ActiveUpload>,
      ReadonlyArray<ActiveUpload>
    >;

    const waitForFile = (key: File.UploadKey.Type, uploadId: string) =>
      Effect.gen(function* () {
        yield* FileCompletionSignals.waitForFile(key, uploadId);
        registry.set(
          activeUploadsAtom,
          A.filter(registry.get(activeUploadsAtom), (u) => u.id !== uploadId)
        );
      });

    yield* Effect.forkScoped(
      Effect.gen(function* () {
        if (MutableHashMap.isEmpty(FileCompletionSignals.completionSignals)) return;
        const now = yield* DateTime.now;
        const fiveSecondsAgo = DateTime.subtract(now, { seconds: 5 });

        const fileKeys = F.pipe(
          FileCompletionSignals.completionSignals,
          A.fromIterable,
          A.filter(([_, entry]) => DateTime.lessThan(entry.addedAt, fiveSecondsAgo)),
          A.map(([key]) => key),
          (fileKeys) => ({ uploadKeys: fileKeys }) as const
        );

        if (A.isEmptyArray(fileKeys.uploadKeys)) return;

        const files = yield* api.getFilesByKeys(fileKeys);
        for (const file of files) {
          if (file !== null) {
            registry.set(filesAtom, AddFile({ file, folderId: file.folderId }));
            FileCompletionSignals.signalFileArrived(file.key);
          }
        }
      }).pipe(Effect.repeat({ schedule: Schedule.spaced("5 seconds") }))
    );

    return {
      signalFileArrived: FileCompletionSignals.signalFileArrived,
      waitForFile,
    };
  }),
}) {}

export const layer = Service.Default;

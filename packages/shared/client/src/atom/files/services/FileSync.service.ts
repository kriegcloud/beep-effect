import { $SharedClientId } from "@beep/identity/packages";
import { AddFile } from "@beep/shared-client/atom/files/types";
import type { File } from "@beep/shared-domain/entities";
import { Registry } from "@effect-atom/atom-react";
import { DateTime, Effect, MutableHashMap, Schedule } from "effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { FilesApi } from "../../services";
import { activeUploadsAtom } from "../atoms/activeUploads.atom.ts";
import { filesAtom } from "../atoms/files.atom.ts";
import * as FileCompletionSignals from "./FileCompletionSignals.ts";

const $I = $SharedClientId.create("atom/files/services/FileSync");

export class Service extends Effect.Service<Service>()($I`Service`, {
  dependencies: [FilesApi.layer],
  scoped: Effect.gen(function* () {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* FilesApi.Service;

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

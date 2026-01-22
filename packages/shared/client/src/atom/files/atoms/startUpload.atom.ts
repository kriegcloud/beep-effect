import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { runtime } from "../runtime";
import { FilePicker } from "../services";
import type { StartUploadInput } from "../types";
import { activeUploadsAtom } from "./activeUploads.atom";
import { uploadAtom } from "./upload.atom";
export const startUploadAtom = runtime.fn(
  Effect.fn(function* (payload: StartUploadInput.Type) {
    yield* Effect.logInfo(`[Upload] Starting file picker`, {
      payloadTag: payload._tag,
      entityKind: payload.entityKind,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
      folderId: payload._tag === "Folder" ? payload.id : null,
    });

    const registry = yield* Registry.AtomRegistry;
    const filePicker = yield* FilePicker.Service;

    yield* Effect.logDebug(`[Upload] Opening file picker dialog`);

    const selectedFile = yield* filePicker.open.pipe(
      Effect.flatten,
      Effect.tap((file) =>
        Effect.logInfo(`[Upload] File selected`, {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })
      ),
      Effect.catchTag(
        "NoSuchElementException",
        Effect.fn(function* () {
          yield* Effect.logWarning(`[Upload] No file selected (user cancelled)`);
          return yield* Effect.interrupt;
        })
      )
    );

    const uploadId = globalThis.crypto.randomUUID();
    const folderId = P.isTagged(payload, "Folder") ? payload.id : null;

    yield* Effect.logInfo(`[Upload] Generated upload ID`, {
      uploadId,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.type,
      folderId,
    });

    yield* Effect.logDebug(`[Upload] Adding to active uploads atom`, {
      uploadId,
      currentActiveUploads: registry.get(activeUploadsAtom).length,
    });

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

    yield* Effect.logInfo(`[Upload] Setting upload atom`, {
      uploadId,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.type,
      folderId,
      entityKind: payload.entityKind,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
    });

    registry.set(uploadAtom(uploadId), {
      file: selectedFile,
      folderId,
      entityKind: payload.entityKind,
      entityIdentifier: payload.entityIdentifier,
      entityAttribute: payload.entityAttribute,
      metadata: payload.metadata,
    });

    yield* Effect.logInfo(`[Upload] Upload initiated successfully`, {
      uploadId,
      fileName: selectedFile.name,
    });
  })
);

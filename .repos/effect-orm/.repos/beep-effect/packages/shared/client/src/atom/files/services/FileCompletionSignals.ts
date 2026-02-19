import type { File } from "@beep/shared-domain/entities";
import * as Thunk from "@beep/utils/thunk";
import { DateTime, Deferred, Effect, Exit, MutableHashMap } from "effect";
import * as F from "effect/Function";
import * as O from "effect/Option";

export interface CompletionEntry {
  readonly uploadId: string;
  readonly deferred: Deferred.Deferred<void>;
  readonly addedAt: DateTime.Utc;
}

export const completionSignals = MutableHashMap.empty<File.UploadKey.Type, CompletionEntry>();

export const signalFileArrived = (key: File.UploadKey.Type) => {
  F.pipe(
    completionSignals,
    MutableHashMap.get(key),
    O.match({
      onNone: Thunk.thunkVoid,
      onSome: (entry) => {
        Deferred.unsafeDone(entry.deferred, Exit.void);
        MutableHashMap.remove(completionSignals, key);
      },
    })
  );
};

export const waitForFile = (key: File.UploadKey.Type, uploadId: string) =>
  Effect.gen(function* () {
    const deferred = yield* Deferred.make<void>();
    MutableHashMap.set(completionSignals, key, {
      uploadId,
      deferred,
      addedAt: yield* DateTime.now,
    });
    yield* Deferred.await(deferred);
    return uploadId;
  });

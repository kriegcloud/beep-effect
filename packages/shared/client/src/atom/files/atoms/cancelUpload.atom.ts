import { UploadRegistry } from "@beep/shared-client/atom/services";
import { Atom, Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import { runtime } from "../runtime";
import { activeUploadsAtom } from "./activeUploads.atom.ts";
import { uploadAtom } from "./upload.atom.ts";

export const cancelUploadAtom = runtime.fn(
  Effect.fnUntraced(function* (uploadId: string) {
    const registry = yield* Registry.AtomRegistry;
    const uploadRegistry = yield* UploadRegistry;

    // Cancel via the upload registry (aborts XHR)
    yield* uploadRegistry.cancel(uploadId);

    registry.set(uploadAtom(uploadId), Atom.Interrupt);
    registry.set(
      activeUploadsAtom,
      A.filter(registry.get(activeUploadsAtom), (u) => u.id !== uploadId)
    );
  })
);

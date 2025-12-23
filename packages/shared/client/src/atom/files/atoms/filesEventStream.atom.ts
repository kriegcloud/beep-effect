import { filesAtom } from "@beep/shared-client/atom";
import { runtime } from "@beep/shared-client/atom/files/runtime";
import { AddFile } from "@beep/shared-client/atom/files/types";
import { Events } from "@beep/shared-domain";
import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as S from "effect/Schema";
import * as FileCompletionSignals from "../services/FileCompletionSignals.ts";
import { makeEventStreamAtom } from "./event-stream.atom.tsx";

export const filesEventStreamAtom = makeEventStreamAtom({
  runtime,
  identifier: "Files",
  predicate: S.is(Events.Event),
  handler: (event: Events.Event.Type) =>
    Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;

      FileCompletionSignals.signalFileArrived(event.file.key);

      registry.set(
        filesAtom,
        AddFile({
          file: event.file,
          folderId: event.file.folderId,
        })
      );
    }),
});

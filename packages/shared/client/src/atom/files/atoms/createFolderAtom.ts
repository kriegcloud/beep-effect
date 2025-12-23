import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import { FilesApi } from "../../services";
import { runtime } from "../runtime";
import { CreateFolder } from "../types.ts";
import { filesAtom } from "./files.atom.ts";

export const createFolderAtom = runtime.fn(
  Effect.fn(function* (folderName: string) {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* FilesApi.Service;
    const folder = yield* api.createFolder({ folderName });

    registry.set(filesAtom, CreateFolder({ folder: { ...folder, uploadedFiles: A.empty() } }));

    return folder;
  })
);

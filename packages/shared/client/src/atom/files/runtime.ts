import { makeAtomRuntime } from "@beep/runtime-client";
import { BS } from "@beep/schema";
import { DEFAULT_POOL_SIZE, makeLayerWithSpawner } from "@beep/utils/md5";
import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient";
import type * as Atom from "@effect-atom/atom/Atom";
import * as Layer from "effect/Layer";
import { UploadRegistry } from "../services";
import * as FilesApi from "../services/FilesApi.service";
import * as FilesEventStream from "../services/FilesEventStream.service";
import * as ImageCompressionClient from "../services/ImageCompressionClient.service";
import * as FilePicker from "./services/FilePicker.service";
import * as FileSync from "./services/FileSync.service";

const ParallelHasherLayer = makeLayerWithSpawner({
  spawner: () =>
    new Worker(new URL("@beep/runtime-client/workers/md5-hasher-worker.ts?worker", import.meta.url), {
      type: "module",
    }),
  poolSize: DEFAULT_POOL_SIZE,
});

const _filesRuntimeLayer = Layer.mergeAll(
  FilesApi.layer,
  BrowserHttpClient.layerXMLHttpRequest,
  FilesEventStream.layer,
  FileSync.layer,
  ImageCompressionClient.layer,
  FilePicker.layer,
  UploadRegistry.Default,
  BS.MetadataService.Default,
  ParallelHasherLayer
);

type FilesRuntimeLayer = typeof _filesRuntimeLayer;

export type FilesRuntimeR = Layer.Layer.Success<FilesRuntimeLayer>;
export type FilesRuntimeE = Layer.Layer.Error<FilesRuntimeLayer>;

export const runtime: Atom.AtomRuntime<FilesRuntimeR, FilesRuntimeE> = makeAtomRuntime(_filesRuntimeLayer);

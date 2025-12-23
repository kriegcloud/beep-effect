import { makeAtomRuntime } from "@beep/runtime-client";
import { BS } from "@beep/schema";
import { DEFAULT_POOL_SIZE, makeLayerWithSpawner } from "@beep/utils/md5";
import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient";
import * as Layer from "effect/Layer";
import { FilesApi, FilesEventStream, ImageCompressionClient, UploadRegistry } from "../services";
import { FilePicker, FileSync } from "./services";

const ParallelHasherLayer = makeLayerWithSpawner({
  spawner: () =>
    new Worker(new URL("@beep/runtime-client/workers/md5-hasher-worker.ts?worker", import.meta.url), {
      type: "module",
    }),
  poolSize: DEFAULT_POOL_SIZE,
});

export const runtime = makeAtomRuntime(
  Layer.mergeAll(
    FilesApi.layer,
    BrowserHttpClient.layerXMLHttpRequest,
    FilesEventStream.layer,
    FileSync.layer,
    ImageCompressionClient.layer,
    FilePicker.layer,
    UploadRegistry.Default,
    BS.MetadataService.Default,
    ParallelHasherLayer
  )
);

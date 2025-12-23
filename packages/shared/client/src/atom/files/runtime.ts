import { makeAtomRuntime } from "@beep/runtime-client";
import { BS } from "@beep/schema";
import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient";
import * as Layer from "effect/Layer";
import { FilesApi, FilesEventStream, ImageCompressionClient, UploadRegistry } from "../services";
import { FilePicker, FileSync } from "./services";
export const runtime = makeAtomRuntime(
  Layer.mergeAll(
    FilesApi.layer,
    BrowserHttpClient.layerXMLHttpRequest,
    FilesEventStream.layer,
    FileSync.layer,
    ImageCompressionClient.layer,
    FilePicker.layer,
    UploadRegistry.Default,
    BS.MetadataService.Default
  )
);

import * as BrowserRuntime from "@effect/platform-browser/BrowserRuntime";
import * as BrowserWorkerRunner from "@effect/platform-browser/BrowserWorkerRunner";
import * as RpcServer from "@effect/rpc/RpcServer";
import imageCompression from "browser-image-compression";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ImageCompressionRpc } from "./image-compression-rpc";

const Live = ImageCompressionRpc.toLayer(
  Effect.gen(function* () {
    yield* Effect.log("[ImageCompressionWorker] Worker started");

    return {
      compress: Effect.fn("ImageCompressionWorker.compress")(function* (payload) {
        yield* Effect.log(`Compressing "${payload.fileName}" (${(payload.data.length / 1024 / 1024).toFixed(2)} MB)`);

        // Create a new Uint8Array backed by a regular ArrayBuffer
        // to satisfy the BlobPart type requirement (excludes SharedArrayBuffer)
        const buffer = new Uint8Array(payload.data);
        const file = new File([buffer], payload.fileName, {
          type: payload.mimeType,
        });

        const compressed = yield* Effect.promise<File>(() =>
          imageCompression(file, {
            maxSizeMB: payload.maxSizeMB,
            useWebWorker: false, // We're already in a worker
          })
        );

        const arrayBuffer = yield* Effect.promise<ArrayBuffer>(() => compressed.arrayBuffer());

        yield* Effect.log(
          `Compressed "${payload.fileName}" to ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`
        );

        return {
          data: new Uint8Array(arrayBuffer),
          mimeType: compressed.type,
        };
      }),
    };
  })
);

const Server = RpcServer.layer(ImageCompressionRpc).pipe(
  Layer.provide(Live),
  Layer.provide(RpcServer.layerProtocolWorkerRunner),
  Layer.provide(BrowserWorkerRunner.layer)
);

BrowserRuntime.runMain(Layer.launch(Server));

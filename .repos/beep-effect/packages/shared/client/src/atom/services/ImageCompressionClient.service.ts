import { $SharedClientId } from "@beep/identity/packages";
import { ImageCompressionRpc } from "@beep/runtime-client/workers/image-compression-rpc";
import { thunk } from "@beep/utils";
import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";

const $I = $SharedClientId.create("atom/services/ImageCompressionClient");

// Worker must be created lazily to avoid "Worker is not defined" during SSR
const makeWorker = () =>
  new Worker(new URL("@beep/runtime-client/workers/image-compression-worker.ts?worker", import.meta.url), {
    type: "module",
  });

const ImageCompressionProtocol = RpcClient.layerProtocolWorker({
  size: 2,
  concurrency: 1,
}).pipe(Layer.provide(BrowserWorker.layerPlatform(makeWorker)), Layer.orDie);

export class Service extends Effect.Service<Service>()($I`Service`, {
  dependencies: [ImageCompressionProtocol],
  scoped: pipe(Effect.Do, Effect.bind("client", thunk(RpcClient.make(ImageCompressionRpc)))),
}) {}

export const layer = Service.Default.pipe(Layer.provide(ImageCompressionProtocol));

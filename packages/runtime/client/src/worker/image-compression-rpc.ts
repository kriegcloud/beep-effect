import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Schema from "effect/Schema";

export class ImageCompressionRpc extends RpcGroup.make(
  Rpc.make("compress", {
    success: Schema.Struct({
      data: Schema.Uint8Array,
      mimeType: Schema.String,
    }),
    payload: Schema.Struct({
      data: Schema.Uint8Array,
      mimeType: Schema.String,
      fileName: Schema.String,
      maxSizeMB: Schema.Number,
    }),
  })
) {}

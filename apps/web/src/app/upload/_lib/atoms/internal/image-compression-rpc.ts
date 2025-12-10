import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";

export class ImageCompressionRpc extends RpcGroup.make(
  Rpc.make("compress", {
    success: S.Struct({
      data: S.Uint8Array,
      mimeType: S.String,
    }),
    payload: S.Struct({
      data: S.Uint8Array,
      mimeType: S.String,
      fileName: S.String,
      maxSizeMB: S.Number,
    }),
  })
) {}

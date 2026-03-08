import { Entity } from "effect/unstable/cluster"
import { GetHistoryRpc, GetStatusRpc, InitializeRpc, ReceiveMessageRpc, SetModelPreferenceRpc } from "./AdapterProtocol.js"
import { makeChannelAdapterLayer } from "./ChannelAdapterLayer.js"
import { CHANNEL_ADAPTER_PROFILES } from "./ChannelAdapterProfiles.js"

export const WebChatAdapterEntity = Entity.make("WebChatAdapter", [
  InitializeRpc,
  ReceiveMessageRpc,
  GetHistoryRpc,
  GetStatusRpc,
  SetModelPreferenceRpc
])

export const layer = WebChatAdapterEntity.toLayer(
  makeChannelAdapterLayer({
    module: "WebChatAdapterEntity",
    ...CHANNEL_ADAPTER_PROFILES.WebChat
  })
)

import { Entity } from "effect/unstable/cluster"
import { GetHistoryRpc, GetStatusRpc, InitializeRpc, ReceiveMessageRpc, SetModelPreferenceRpc } from "./AdapterProtocol.js"
import { makeChannelAdapterLayer } from "./ChannelAdapterLayer.js"
import { CHANNEL_ADAPTER_PROFILES } from "./ChannelAdapterProfiles.js"

export const CLIAdapterEntity = Entity.make("CLIAdapter", [
  InitializeRpc,
  ReceiveMessageRpc,
  GetHistoryRpc,
  GetStatusRpc,
  SetModelPreferenceRpc
])

export const layer = CLIAdapterEntity.toLayer(
  makeChannelAdapterLayer({
    module: "CLIAdapterEntity",
    ...CHANNEL_ADAPTER_PROFILES.CLI
  })
)

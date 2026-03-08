import type { ChannelCapability, ChannelType } from "@template/domain/status"

type ChannelAdapterProfile = {
  readonly channelType: ChannelType
  readonly capabilities: ReadonlyArray<ChannelCapability>
}

export const CHANNEL_ADAPTER_PROFILES = {
  CLI: {
    channelType: "CLI",
    capabilities: ["SendText"]
  },
  WebChat: {
    channelType: "WebChat",
    capabilities: ["SendText", "Typing", "StreamingDelivery"]
  }
} as const satisfies Record<"CLI" | "WebChat", ChannelAdapterProfile>

export type SupportedChannelAdapterType = keyof typeof CHANNEL_ADAPTER_PROFILES

export const isSupportedChannelAdapterType = (
  channelType: ChannelType
): channelType is SupportedChannelAdapterType =>
  channelType === "CLI" || channelType === "WebChat"

export const channelCapabilitiesForType = (
  channelType: SupportedChannelAdapterType
): ReadonlyArray<ChannelCapability> =>
  CHANNEL_ADAPTER_PROFILES[channelType].capabilities

import type { PluginConfig } from "platejs";
import type { Dispatch, SetStateAction } from "react";

export const CHUNK_PLUGIN_KEY = "chunk" as const;

export type ChunkPluginConfig = PluginConfig<
  typeof CHUNK_PLUGIN_KEY,
  {
    readonly setExpandedChunks?: undefined | Dispatch<SetStateAction<number[]>>;
  }
>;

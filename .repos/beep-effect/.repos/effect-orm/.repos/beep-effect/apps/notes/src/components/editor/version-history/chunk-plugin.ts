import { createTPlatePlugin } from "platejs/react";

import { BlockChunk } from "./chunk-node";
import { CHUNK_PLUGIN_KEY, type ChunkPluginConfig } from "./chunk-types";
import { withGetFragmentExcludeProps } from "./diff-plugin";

export type { ChunkPluginConfig } from "./chunk-types";

export const ChunkPlugin = createTPlatePlugin<ChunkPluginConfig>({
  key: CHUNK_PLUGIN_KEY,
  options: {
    setExpandedChunks: () => {},
  },
  render: {
    aboveNodes: BlockChunk,
  },
}).overrideEditor(withGetFragmentExcludeProps("chunkCollapsed"));

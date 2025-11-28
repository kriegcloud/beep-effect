import type { PluginConfig } from "platejs";
import { createTPlatePlugin } from "platejs/react";
import type { Dispatch, SetStateAction } from "react";

import { BlockChunk } from "./chunk-node";
import { withGetFragmentExcludeProps } from "./diff-plugin";

export type ChunkPluginConfig = PluginConfig<
  "chunk",
  {
    setExpandedChunks?: Dispatch<SetStateAction<number[]>>;
  }
>;

export const ChunkPlugin = createTPlatePlugin<ChunkPluginConfig>({
  key: "chunk",
  options: {
    setExpandedChunks: () => {},
  },
  render: {
    aboveNodes: BlockChunk,
  },
}).overrideEditor(withGetFragmentExcludeProps("chunkCollapsed"));

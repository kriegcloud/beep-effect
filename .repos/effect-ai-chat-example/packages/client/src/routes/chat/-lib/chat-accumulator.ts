import type { ChatEvent } from "@app/domain/api/chat-rpc";
import type { ContentBlock, StreamState, ToolStatus } from "./chat-types.js";

export const accumulateEvent = (state: StreamState, event: ChatEvent): StreamState => {
  switch (event._tag) {
    case "Chunk": {
      const lastBlock = state.contentBlocks[state.contentBlocks.length - 1];
      if (lastBlock && lastBlock._tag === "text") {
        const updatedBlock: ContentBlock = {
          _tag: "text",
          content: lastBlock.content + event.delta,
        };
        return { contentBlocks: [...state.contentBlocks.slice(0, -1), updatedBlock] };
      }
      return { contentBlocks: [...state.contentBlocks, { _tag: "text", content: event.delta }] };
    }

    case "ReasoningChunk": {
      const lastBlock = state.contentBlocks[state.contentBlocks.length - 1];
      if (lastBlock && lastBlock._tag === "reasoning") {
        const updatedBlock: ContentBlock = {
          _tag: "reasoning",
          content: lastBlock.content + event.delta,
        };
        return { contentBlocks: [...state.contentBlocks.slice(0, -1), updatedBlock] };
      }
      return {
        contentBlocks: [...state.contentBlocks, { _tag: "reasoning", content: event.delta }],
      };
    }

    case "ToolStart": {
      const tool: ToolStatus = {
        id: crypto.randomUUID(),
        toolName: event.toolName,
        status: "start",
        input: event.input,
        output: null,
      };
      const lastBlock = state.contentBlocks[state.contentBlocks.length - 1];
      if (lastBlock && lastBlock._tag === "tool_group") {
        const updatedBlock: ContentBlock = {
          _tag: "tool_group",
          tools: [...lastBlock.tools, tool],
        };
        return { contentBlocks: [...state.contentBlocks.slice(0, -1), updatedBlock] };
      }
      return { contentBlocks: [...state.contentBlocks, { _tag: "tool_group", tools: [tool] }] };
    }

    case "ToolSuccess": {
      return updateFirstMatchingTool(state, event.toolName, (tool) => ({
        ...tool,
        status: "success",
        output: event.output,
      }));
    }

    case "ToolFailure": {
      return updateFirstMatchingTool(state, event.toolName, (tool) => ({
        ...tool,
        status: "failure",
      }));
    }
  }
};

const updateFirstMatchingTool = (
  state: StreamState,
  toolName: string,
  updater: (tool: ToolStatus) => ToolStatus,
): StreamState => {
  const blocks = [...state.contentBlocks];
  for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
    const block = blocks[blockIdx]!;
    if (block._tag !== "tool_group") continue;

    const toolIdx = block.tools.findIndex(
      (t) => t.toolName === toolName && t.status === "start",
    );
    if (toolIdx === -1) continue;

    const updatedTools = [...block.tools];
    updatedTools[toolIdx] = updater(updatedTools[toolIdx]!);
    blocks[blockIdx] = { _tag: "tool_group", tools: updatedTools };
    return { contentBlocks: blocks };
  }
  return state;
};

export const extractText = (contentBlocks: readonly ContentBlock[]): string =>
  contentBlocks
    .filter((b): b is ContentBlock & { _tag: "text"; } => b._tag === "text")
    .map((b) => b.content)
    .join("");

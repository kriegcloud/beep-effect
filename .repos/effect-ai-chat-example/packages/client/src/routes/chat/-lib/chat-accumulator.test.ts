import type { ChatEvent } from "@app/domain/api/chat-rpc";
import { describe, expect, it } from "@effect/vitest";
import { accumulateEvent, extractText } from "./chat-accumulator.js";
import type { StreamState } from "./chat-types.js";

const emptyState: StreamState = { contentBlocks: [] };

describe("accumulateEvent", () => {
  it("appends chunk to last text block", () => {
    const state: StreamState = { contentBlocks: [{ _tag: "text", content: "Hello" }] };
    const result = accumulateEvent(state, { _tag: "Chunk", delta: " world" } as ChatEvent);
    expect(result.contentBlocks).toEqual([{ _tag: "text", content: "Hello world" }]);
  });

  it("creates new text block when last block is not text", () => {
    const state: StreamState = {
      contentBlocks: [{ _tag: "reasoning", content: "thinking" }],
    };
    const result = accumulateEvent(state, { _tag: "Chunk", delta: "Hello" } as ChatEvent);
    expect(result.contentBlocks).toHaveLength(2);
    expect(result.contentBlocks[1]).toEqual({ _tag: "text", content: "Hello" });
  });

  it("creates new text block from empty state", () => {
    const result = accumulateEvent(emptyState, { _tag: "Chunk", delta: "Hi" } as ChatEvent);
    expect(result.contentBlocks).toEqual([{ _tag: "text", content: "Hi" }]);
  });

  it("appends reasoning chunk to last reasoning block", () => {
    const state: StreamState = {
      contentBlocks: [{ _tag: "reasoning", content: "think" }],
    };
    const result = accumulateEvent(state, {
      _tag: "ReasoningChunk",
      delta: "ing",
    } as ChatEvent);
    expect(result.contentBlocks).toEqual([{ _tag: "reasoning", content: "thinking" }]);
  });

  it("creates new reasoning block when last block is not reasoning", () => {
    const state: StreamState = { contentBlocks: [{ _tag: "text", content: "hi" }] };
    const result = accumulateEvent(state, {
      _tag: "ReasoningChunk",
      delta: "let me think",
    } as ChatEvent);
    expect(result.contentBlocks).toHaveLength(2);
    expect(result.contentBlocks[1]).toEqual({ _tag: "reasoning", content: "let me think" });
  });

  it("appends tool to existing tool_group", () => {
    const state: StreamState = {
      contentBlocks: [
        {
          _tag: "tool_group",
          tools: [
            {
              id: "t1",
              toolName: "getWeather",
              status: "start",
              input: "{}",
              output: null,
            },
          ],
        },
      ],
    };
    const result = accumulateEvent(state, {
      _tag: "ToolStart",
      toolName: "getCurrentDateTime",
      input: "{}",
    } as ChatEvent);
    const group = result.contentBlocks[0]!;
    expect(group._tag).toBe("tool_group");
    if (group._tag === "tool_group") {
      expect(group.tools).toHaveLength(2);
      expect(group.tools[1]!.toolName).toBe("getCurrentDateTime");
    }
  });

  it("creates new tool_group when last block is not tool_group", () => {
    const state: StreamState = { contentBlocks: [{ _tag: "text", content: "hi" }] };
    const result = accumulateEvent(state, {
      _tag: "ToolStart",
      toolName: "getWeather",
      input: "{\"city\":\"NY\"}",
    } as ChatEvent);
    expect(result.contentBlocks).toHaveLength(2);
    const group = result.contentBlocks[1]!;
    expect(group._tag).toBe("tool_group");
    if (group._tag === "tool_group") {
      expect(group.tools).toHaveLength(1);
      expect(group.tools[0]!.status).toBe("start");
    }
  });

  it("updates first matching tool on ToolSuccess", () => {
    const state: StreamState = {
      contentBlocks: [
        {
          _tag: "tool_group",
          tools: [
            { id: "t1", toolName: "getWeather", status: "start", input: "{}", output: null },
            {
              id: "t2",
              toolName: "getWeather",
              status: "start",
              input: "{\"city\":\"LA\"}",
              output: null,
            },
          ],
        },
      ],
    };
    const result = accumulateEvent(state, {
      _tag: "ToolSuccess",
      toolName: "getWeather",
      output: "sunny",
    } as ChatEvent);
    const group = result.contentBlocks[0]!;
    if (group._tag === "tool_group") {
      expect(group.tools[0]!.status).toBe("success");
      expect(group.tools[0]!.output).toBe("sunny");
      expect(group.tools[1]!.status).toBe("start");
    }
  });

  it("updates first matching tool on ToolFailure", () => {
    const state: StreamState = {
      contentBlocks: [
        {
          _tag: "tool_group",
          tools: [
            { id: "t1", toolName: "getWeather", status: "start", input: "{}", output: null },
          ],
        },
      ],
    };
    const result = accumulateEvent(state, {
      _tag: "ToolFailure",
      toolName: "getWeather",
    } as ChatEvent);
    const group = result.contentBlocks[0]!;
    if (group._tag === "tool_group") {
      expect(group.tools[0]!.status).toBe("failure");
    }
  });

  it("accumulates multiple chunks correctly", () => {
    let state = emptyState;
    state = accumulateEvent(state, { _tag: "Chunk", delta: "Hello" } as ChatEvent);
    state = accumulateEvent(state, { _tag: "Chunk", delta: " " } as ChatEvent);
    state = accumulateEvent(state, { _tag: "Chunk", delta: "world" } as ChatEvent);
    expect(state.contentBlocks).toEqual([{ _tag: "text", content: "Hello world" }]);
  });

  it("handles mixed events creating correct block sequence", () => {
    let state = emptyState;
    state = accumulateEvent(state, { _tag: "Chunk", delta: "Hi" } as ChatEvent);
    state = accumulateEvent(state, {
      _tag: "ToolStart",
      toolName: "getWeather",
      input: "{}",
    } as ChatEvent);
    state = accumulateEvent(state, {
      _tag: "ToolSuccess",
      toolName: "getWeather",
      output: "sunny",
    } as ChatEvent);
    state = accumulateEvent(state, { _tag: "Chunk", delta: " result" } as ChatEvent);

    expect(state.contentBlocks).toHaveLength(3);
    expect(state.contentBlocks[0]!._tag).toBe("text");
    expect(state.contentBlocks[1]!._tag).toBe("tool_group");
    expect(state.contentBlocks[2]!._tag).toBe("text");
  });
});

describe("extractText", () => {
  it("joins text blocks and ignores others", () => {
    const result = extractText([
      { _tag: "reasoning", content: "thinking..." },
      { _tag: "text", content: "Hello" },
      { _tag: "tool_group", tools: [] },
      { _tag: "text", content: " world" },
    ]);
    expect(result).toBe("Hello world");
  });

  it("returns empty string for no text blocks", () => {
    expect(extractText([{ _tag: "reasoning", content: "hmm" }])).toBe("");
    expect(extractText([])).toBe("");
  });
});

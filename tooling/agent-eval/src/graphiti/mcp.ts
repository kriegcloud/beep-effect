/**
 * Minimal MCP HTTP helpers for Graphiti add/search calls.
 *
 * @since 0.0.0
 * @module
 */

import { AgentEvalProtocolError } from "../errors.js";

/**
 * Graphiti client options.
 *
 * @since 0.0.0
 * @category models
 */
export interface GraphitiMcpOptions {
  readonly url: string;
  readonly groupId: string;
}

const parseFactsFromJsonText = (text: string): ReadonlyArray<string> => {
  const regex = /"fact"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
  const facts: Array<string> = [];

  for (const match of text.matchAll(regex)) {
    const value = match[1] ?? "";
    if (!facts.includes(value)) {
      facts.push(value);
    }
  }

  return facts;
};

const initializeSession = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "initialize",
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "agent-eval",
          version: "0.0.0",
        },
      },
    }),
  });

  const sessionId = response.headers.get("mcp-session-id");
  if (!sessionId) {
    throw new AgentEvalProtocolError({
      message: "Graphiti MCP initialize missing mcp-session-id",
    });
  }

  return sessionId;
};

const callTool = async (url: string, sessionId: string, toolName: string, args: unknown): Promise<string> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${toolName}-call`,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  return response.text();
};

/**
 * Search memory facts from Graphiti via MCP HTTP transport.
 *
 * @param options - Graphiti MCP endpoint and group configuration.
 * @param query - Search query string sent to the Graphiti memory tool.
 * @param maxFacts - Maximum number of facts requested from Graphiti.
 * @returns Deduplicated fact strings extracted from the MCP response text.
 * @since 0.0.0
 * @category functions
 */
export const searchMemoryFacts = async (
  options: GraphitiMcpOptions,
  query: string,
  maxFacts: number
): Promise<ReadonlyArray<string>> => {
  const sessionId = await initializeSession(options.url);
  const text = await callTool(options.url, sessionId, "search_memory_facts", {
    query,
    group_ids: [options.groupId],
    max_facts: maxFacts,
  });
  return parseFactsFromJsonText(text);
};

/**
 * Add a structured memory episode to Graphiti via MCP HTTP transport.
 *
 * @param options - Graphiti MCP endpoint and group configuration.
 * @param name - Episode title used as the Graphiti memory name.
 * @param episodeBody - Full episode content to persist in Graphiti memory.
 * @returns Resolves when the add-memory tool call completes.
 * @since 0.0.0
 * @category functions
 */
export const addMemoryEpisode = async (
  options: GraphitiMcpOptions,
  name: string,
  episodeBody: string
): Promise<void> => {
  const sessionId = await initializeSession(options.url);
  await callTool(options.url, sessionId, "add_memory", {
    name,
    episode_body: episodeBody,
    group_id: options.groupId,
    source: "text",
    source_description: "agent-eval benchmark run",
  });
};

import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { GraphitiProtocolError, GraphitiToolCallError } from "./errors.js";

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);
const parseJson = S.decodeUnknownSync(S.UnknownFromJsonString);

/**
 * Parse the latest JSON-RPC payload from an MCP response body.
 *
 * Supports direct JSON responses and `text/event-stream` responses with `data:` lines.
 *
 * @param body - Raw HTTP response body returned by an MCP endpoint.
 * @returns The last valid JSON-RPC record found in the response body, if present.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const parseMcpPayload = (body: string): O.Option<Record<string, unknown>> => {
  const trimmed = body.trim();
  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6).trim())
    .filter((line) => line.length > 0);

  const parseRecord = (value: string): O.Option<Record<string, unknown>> => {
    let decoded: unknown;
    try {
      decoded = parseJson(value);
    } catch {
      return O.none();
    }
    return isRecord(decoded) ? O.some(decoded) : O.none();
  };

  if (dataLines.length > 0) {
    for (let index = dataLines.length - 1; index >= 0; index -= 1) {
      const candidate = dataLines[index];
      if (candidate === undefined) {
        continue;
      }
      const parsed = parseRecord(candidate);
      if (O.isSome(parsed)) {
        return parsed;
      }
    }
    return O.none();
  }

  return parseRecord(trimmed);
};

const recordValue = (record: Readonly<Record<string, unknown>>, key: string): O.Option<Record<string, unknown>> => {
  const value = record[key];
  return isRecord(value) ? O.some(value) : O.none();
};

const stringValue = (record: Readonly<Record<string, unknown>>, key: string): O.Option<string> => {
  const value = record[key];
  return P.isString(value) ? O.some(value) : O.none();
};

/**
 * Summary of one MCP tools/call response.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export interface McpToolResult {
  readonly isError: boolean;
  readonly message: string;
  readonly payload: O.Option<Record<string, unknown>>;
}

/**
 * Parse a Graphiti MCP tools/call response and derive an error summary.
 *
 * @param status - HTTP status code from the MCP tools/call request.
 * @param responseText - Raw response body text from the MCP tools/call request.
 * @returns A normalized tool-call result summary with error classification and parsed payload.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const parseMcpToolResult = (status: number, responseText: string): McpToolResult => {
  const payload = parseMcpPayload(responseText);
  if (status < 200 || status >= 300) {
    return {
      isError: true,
      message: `Graphiti MCP HTTP ${String(status)}`,
      payload,
    };
  }

  if (O.isNone(payload)) {
    return {
      isError: true,
      message: "Graphiti MCP response could not be parsed as JSON payload",
      payload,
    };
  }

  const top = payload.value;
  const topError = recordValue(top, "error");
  if (O.isSome(topError)) {
    return {
      isError: true,
      message: O.getOrElse(stringValue(topError.value, "message"), () => "Graphiti MCP response error"),
      payload,
    };
  }

  const result = recordValue(top, "result");
  if (O.isNone(result)) {
    return {
      isError: false,
      message: "",
      payload,
    };
  }

  if (result.value.isError === true) {
    const structured = recordValue(result.value, "structuredContent");
    if (O.isSome(structured)) {
      const structuredResult = recordValue(structured.value, "result");
      if (O.isSome(structuredResult)) {
        const structuredMessage = stringValue(structuredResult.value, "message");
        if (O.isSome(structuredMessage)) {
          return {
            isError: true,
            message: structuredMessage.value,
            payload,
          };
        }
      }
    }
    return {
      isError: true,
      message: "Graphiti MCP tool call failed (isError=true)",
      payload,
    };
  }

  const structured = recordValue(result.value, "structuredContent");
  if (O.isSome(structured)) {
    const structuredResult = recordValue(structured.value, "result");
    if (O.isSome(structuredResult)) {
      const structuredMessage = stringValue(structuredResult.value, "message");
      if (O.isSome(structuredMessage)) {
        return {
          isError: false,
          message: structuredMessage.value,
          payload,
        };
      }
    }
  }

  return {
    isError: false,
    message: "",
    payload,
  };
};

/**
 * Base POST helper for Graphiti MCP JSON-RPC requests.
 *
 * @param url - MCP endpoint URL.
 * @param payload - JSON-RPC payload body.
 * @param sessionId - Optional MCP session id header.
 * @param timeoutMs - Optional request timeout in milliseconds.
 * @returns The raw `fetch` response.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const mcpPost = async (
  url: string,
  payload: unknown,
  sessionId: O.Option<string>,
  timeoutMs: O.Option<number> = O.none()
): Promise<Response> => {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
  };

  if (O.isSome(sessionId)) {
    headers["mcp-session-id"] = sessionId.value;
  }

  const request: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  };

  if (O.isSome(timeoutMs)) {
    request.signal = AbortSignal.timeout(timeoutMs.value);
  }

  return fetch(url, request);
};

/**
 * Initialize an MCP session and return `mcp-session-id`.
 *
 * @param url - MCP endpoint URL.
 * @param clientName - Client name sent in the initialize handshake.
 * @param clientVersion - Client version sent in the initialize handshake.
 * @param timeoutMs - Optional request timeout in milliseconds.
 * @returns The established MCP session id header value.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const initializeMcpSession = async (
  url: string,
  clientName: string,
  clientVersion: string,
  timeoutMs: O.Option<number> = O.none()
): Promise<string> => {
  const initialize = await mcpPost(
    url,
    {
      jsonrpc: "2.0",
      id: `${clientName}-init`,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: clientName, version: clientVersion },
      },
    },
    O.none(),
    timeoutMs
  );

  if (!initialize.ok) {
    const body = await initialize.text();
    throw new GraphitiProtocolError({
      message: `Graphiti MCP initialize failed with HTTP ${String(initialize.status)}: ${body.slice(0, 300)}`,
    });
  }

  const sessionId = initialize.headers.get("mcp-session-id");
  if (sessionId === null || sessionId.length === 0) {
    throw new GraphitiProtocolError({ message: "Graphiti MCP initialize missing mcp-session-id" });
  }

  const initialized = await mcpPost(
    url,
    { jsonrpc: "2.0", method: "notifications/initialized" },
    O.some(sessionId),
    timeoutMs
  );

  if (!initialized.ok) {
    const body = await initialized.text();
    throw new GraphitiProtocolError({
      message: `Graphiti MCP initialized notification failed with HTTP ${String(initialized.status)}: ${body.slice(0, 300)}`,
    });
  }

  return sessionId;
};

/**
 * Call an MCP tool and return the raw response payload.
 *
 * @param url - MCP endpoint URL.
 * @param sessionId - Previously negotiated MCP session id.
 * @param toolName - MCP tool name to invoke.
 * @param args - Tool call arguments payload.
 * @param requestId - JSON-RPC request identifier.
 * @param timeoutMs - Optional request timeout in milliseconds.
 * @returns Response status, raw body, and parsed result summary.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const callMcpTool = async (
  url: string,
  sessionId: string,
  toolName: string,
  args: Record<string, unknown>,
  requestId: string,
  timeoutMs: O.Option<number> = O.none()
): Promise<{ readonly status: number; readonly body: string; readonly result: McpToolResult }> => {
  const response = await mcpPost(
    url,
    {
      jsonrpc: "2.0",
      id: requestId,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    },
    O.some(sessionId),
    timeoutMs
  );

  const body = await response.text();
  return {
    status: response.status,
    body,
    result: parseMcpToolResult(response.status, body),
  };
};

/**
 * Call an MCP tool and fail when Graphiti returns an error summary.
 *
 * @param url - MCP endpoint URL.
 * @param sessionId - Previously negotiated MCP session id.
 * @param toolName - MCP tool name to invoke.
 * @param args - Tool call arguments payload.
 * @param requestId - JSON-RPC request identifier.
 * @param timeoutMs - Optional request timeout in milliseconds.
 * @returns Parsed MCP payload when the tool call succeeds.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const callMcpToolOrFail = async (
  url: string,
  sessionId: string,
  toolName: string,
  args: Record<string, unknown>,
  requestId: string,
  timeoutMs: O.Option<number> = O.none()
): Promise<O.Option<Record<string, unknown>>> => {
  const response = await callMcpTool(url, sessionId, toolName, args, requestId, timeoutMs);
  if (response.result.isError) {
    throw new GraphitiToolCallError({
      message: response.result.message,
      status: response.status,
      bodySnippet: response.body.slice(0, 400),
    });
  }

  return response.result.payload;
};

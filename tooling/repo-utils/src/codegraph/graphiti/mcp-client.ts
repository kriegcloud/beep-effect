// cspell:ignore codegraph
import { Effect, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { GraphitiProtocolError, GraphitiToolCallError } from "./errors.js";

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);
const decodeJson = S.decodeUnknownOption(S.UnknownFromJsonString);
const encodeJson = S.encodeUnknownOption(S.UnknownFromJsonString);
const sseDataPrefix = "data: ";

const parseRecord = (value: string): O.Option<Record<string, unknown>> => pipe(value, decodeJson, O.filter(isRecord));

/**
 * Parse the latest JSON-RPC payload from an MCP response body.
 *
 * Supports direct JSON responses and `text/event-stream` responses with `data:` lines.
 *
 * @param body - Raw HTTP response body returned by an MCP endpoint.
 * @returns The last valid JSON-RPC record found in the response body, if present.
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const parseMcpPayload = (body: string): O.Option<Record<string, unknown>> => {
  const trimmed = pipe(body, Str.trim);
  const dataLines = pipe(
    trimmed,
    Str.linesIterator,
    A.fromIterable,
    A.filter(Str.startsWith(sseDataPrefix)),
    A.map((line) => pipe(line, Str.slice(sseDataPrefix.length), Str.trim)),
    A.filter(Str.isNonEmpty)
  );

  if (A.isReadonlyArrayNonEmpty(dataLines)) {
    return pipe(
      dataLines,
      A.findLast((line) => O.isSome(parseRecord(line))),
      O.flatMap(parseRecord)
    );
  }

  return parseRecord(trimmed);
};

const recordValue = (record: Readonly<Record<string, unknown>>, key: string): O.Option<Record<string, unknown>> => {
  return pipe(record, R.get(key), O.filter(isRecord));
};

const stringValue = (record: Readonly<Record<string, unknown>>, key: string): O.Option<string> => {
  return pipe(record, R.get(key), O.filter(P.isString));
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
 * @returns Effect that performs MCP POST and yields the raw `fetch` response.
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const mcpPost = Effect.fn("Graphiti.mcpPost")(function* (
  url: string,
  payload: unknown,
  sessionId: O.Option<string>,
  timeoutMs: O.Option<number> = O.none()
) {
  const encoded = encodeJson(payload);
  if (O.isNone(encoded)) {
    return yield* new GraphitiProtocolError({
      message: "Graphiti MCP request payload could not be encoded as JSON.",
    });
  }

  const body = encoded.value;
  const headers = pipe(
    sessionId,
    O.match({
      onNone: (): Record<string, string> => ({
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      }),
      onSome: (id): Record<string, string> => ({
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-session-id": id,
      }),
    })
  );
  const request = pipe(
    timeoutMs,
    O.match({
      onNone: (): RequestInit => ({
        method: "POST",
        headers,
        body,
      }),
      onSome: (milliseconds): RequestInit => ({
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(milliseconds),
      }),
    })
  );
  if (P.isUndefined(request.body) || !P.isString(request.body)) {
    return yield* new GraphitiProtocolError({ message: "Graphiti MCP request payload body is missing." });
  }

  return yield* Effect.tryPromise({
    try: () => fetch(url, request),
    catch: (cause) =>
      new GraphitiProtocolError({
        message: `Graphiti MCP POST failed for ${url}`,
        cause,
      }),
  });
});

/**
 * Initialize an MCP session and return `mcp-session-id`.
 *
 * @param url - MCP endpoint URL.
 * @param clientName - Client name sent in the initialize handshake.
 * @param clientVersion - Client version sent in the initialize handshake.
 * @param timeoutMs - Optional request timeout in milliseconds.
 * @returns Effect yielding established MCP session id header value.
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const initializeMcpSession = Effect.fn("Graphiti.initializeMcpSession")(function* (
  url: string,
  clientName: string,
  clientVersion: string,
  timeoutMs: O.Option<number> = O.none()
) {
  const initialize = yield* mcpPost(
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
    const body = yield* Effect.tryPromise({
      try: () => initialize.text(),
      catch: (cause) =>
        new GraphitiProtocolError({
          message: `Graphiti MCP initialize failed with HTTP ${String(initialize.status)} and unreadable body`,
          cause,
        }),
    });
    return yield* new GraphitiProtocolError({
      message: `Graphiti MCP initialize failed with HTTP ${String(initialize.status)}: ${pipe(body, Str.slice(0, 300))}`,
    });
  }

  const sessionId = initialize.headers.get("mcp-session-id");
  if (sessionId === null || sessionId.length === 0) {
    return yield* new GraphitiProtocolError({ message: "Graphiti MCP initialize missing mcp-session-id" });
  }

  const initialized = yield* mcpPost(
    url,
    { jsonrpc: "2.0", method: "notifications/initialized" },
    O.some(sessionId),
    timeoutMs
  );

  if (!initialized.ok) {
    const body = yield* Effect.tryPromise({
      try: () => initialized.text(),
      catch: (cause) =>
        new GraphitiProtocolError({
          message: `Graphiti MCP initialized notification failed with HTTP ${String(initialized.status)} and unreadable body`,
          cause,
        }),
    });
    return yield* new GraphitiProtocolError({
      message: `Graphiti MCP initialized notification failed with HTTP ${String(initialized.status)}: ${pipe(body, Str.slice(0, 300))}`,
    });
  }

  return sessionId;
});

/**
 * Call an MCP tool and return the raw response payload.
 *
 * @param url - MCP endpoint URL.
 * @param sessionId - Previously negotiated MCP session id.
 * @param toolName - MCP tool name to invoke.
 * @param args - Tool call arguments payload.
 * @param requestId - JSON-RPC request identifier.
 * @param timeoutMs - Optional request timeout in milliseconds.
 * @returns Effect yielding response status, raw body, and parsed result summary.
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const callMcpTool = Effect.fn("Graphiti.callMcpTool")(function* (
  url: string,
  sessionId: string,
  toolName: string,
  args: Record<string, unknown>,
  requestId: string,
  timeoutMs: O.Option<number> = O.none()
) {
  const response = yield* mcpPost(
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

  const body = yield* Effect.tryPromise({
    try: () => response.text(),
    catch: (cause) =>
      new GraphitiProtocolError({
        message: `Graphiti MCP tools/call response body read failed for ${toolName}`,
        cause,
      }),
  });
  return {
    status: response.status,
    body,
    result: parseMcpToolResult(response.status, body),
  };
});

/**
 * Call an MCP tool and fail when Graphiti returns an error summary.
 *
 * @param url - MCP endpoint URL.
 * @param sessionId - Previously negotiated MCP session id.
 * @param toolName - MCP tool name to invoke.
 * @param args - Tool call arguments payload.
 * @param requestId - JSON-RPC request identifier.
 * @param timeoutMs - Optional request timeout in milliseconds.
 * @returns Effect yielding parsed MCP payload when the tool call succeeds.
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const callMcpToolOrFail = Effect.fn("Graphiti.callMcpToolOrFail")(function* (
  url: string,
  sessionId: string,
  toolName: string,
  args: Record<string, unknown>,
  requestId: string,
  timeoutMs: O.Option<number> = O.none()
) {
  const response = yield* callMcpTool(url, sessionId, toolName, args, requestId, timeoutMs);
  if (response.result.isError) {
    return yield* new GraphitiToolCallError({
      message: response.result.message,
      status: response.status,
      bodySnippet: pipe(response.body, Str.slice(0, 400)),
    });
  }

  return response.result.payload;
});

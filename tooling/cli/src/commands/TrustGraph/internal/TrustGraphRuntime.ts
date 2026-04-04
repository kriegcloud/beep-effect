/**
 * TrustGraph CLI runtime and MCP client helpers.
 *
 * @module
 * @since 0.0.0
 */

import { createHash, randomUUID } from "node:crypto";
import { $RepoCliId } from "@beep/identity/packages";
import { DomainError, FsUtils, findRepoRoot, GlobOptions, jsonParse, jsonStringifyCompact } from "@beep/repo-utils";
import { TaggedErrorClass } from "@beep/schema";
import {
  Config,
  Console,
  DateTime,
  Duration,
  Effect,
  FileSystem,
  HashSet,
  Inspectable,
  Path,
  pipe,
  Redacted,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Headers, HttpBody, HttpClient, HttpClientRequest, HttpClientResponse } from "effect/unstable/http";

const $I = $RepoCliId.create("commands/TrustGraph/internal/TrustGraphRuntime");

const defaultTrustGraphUrl = "https://dankserver.tailc7c348.ts.net:8444" as const;
const defaultTrustGraphCollection = "beep-effect" as const;
const defaultTrustGraphFlow = "default" as const;
const defaultTrustGraphUser = "trustgraph" as const;
const managedDocumentIdPrefix = "urn:beep-effect:doc:" as const;
const generatedOverviewRelativePath = "generated/repo-overview.md" as const;
const curatedSyncStateRelativePath = ".beep/trustgraph/curated-sync-state.json" as const;
const curatedSyncStateVersion = 3 as const;
const curatedSyncTransport = "librarian-processing" as const;
const initializeProtocolVersion = "2024-11-05" as const;
const trustGraphStatusDocumentRagQuestion =
  "Summarize the expert-memory big picture in beep-effect in 3 sentences." as const;
const trustGraphStatusGraphRagQuestion =
  "How does the beep-effect expert-memory architecture connect curated documentation, repository context, and durable agent knowledge?" as const;
const repoCliCommandGroups = [
  "agents",
  "claude",
  "codex",
  "codegen",
  "create-package",
  "docgen",
  "docs",
  "graphiti",
  "laws",
  "lint",
  "purge",
  "sync-data-to-ts",
  "topo-sort",
  "trustgraph",
  "tsconfig-sync",
  "version-sync",
] as const;
const curatedSourcePatterns = [
  "AGENTS.md",
  "CLAUDE.md",
  "tooling/configs/ai-context.md",
  "specs/pending/expert-memory-big-picture/**/*.md",
  "specs/pending/repo-codegraph-jsdoc/OVERVIEW*.md",
] as const;

class TrustGraphCliError extends TaggedErrorClass<TrustGraphCliError>($I`TrustGraphCliError`)(
  "TrustGraphCliError",
  {
    message: S.String,
    cause: S.optionalKey(S.DefectWithStack),
  },
  $I.annote("TrustGraphCliError", {
    description: "Structured runtime error for TrustGraph CLI integration failures.",
  })
) {}

class CuratedSyncStateDocument extends S.Class<CuratedSyncStateDocument>($I`CuratedSyncStateDocument`)(
  {
    hash: S.String,
    relativePath: S.String,
    title: S.String,
    syncedAt: S.String,
  },
  $I.annote("CuratedSyncStateDocument", {
    description: "Persisted sync metadata for one curated TrustGraph document.",
  })
) {}

class CuratedSyncState extends S.Class<CuratedSyncState>($I`CuratedSyncState`)(
  {
    version: S.Number,
    transport: S.String,
    collection: S.String,
    documents: S.Record(S.String, CuratedSyncStateDocument),
  },
  $I.annote("CuratedSyncState", {
    description: "Local sync state used to avoid redundant TrustGraph uploads.",
  })
) {}

const decodeCuratedSyncState = S.decodeUnknownSync(CuratedSyncState);

type TrustGraphConfig = {
  readonly apiBaseUrl: string;
  readonly authToken: O.Option<Redacted.Redacted>;
  readonly collection: string;
  readonly flow: string;
  readonly mcpUrl: string;
  readonly user: string;
};

type TrustGraphSession = {
  readonly config: TrustGraphConfig;
  readonly sessionId: string;
};

type CuratedDocument = {
  readonly content: string;
  readonly documentId: string;
  readonly hash: string;
  readonly isGenerated: boolean;
  readonly relativePath: string;
  readonly tags: ReadonlyArray<string>;
  readonly title: string;
};

type TrustGraphDocumentMetadata = {
  readonly comments: string | undefined;
  readonly id: string;
  readonly mimeType: string | undefined;
  readonly tags: ReadonlyArray<string>;
  readonly title: string | undefined;
};

type TrustGraphProcessingMetadata = {
  readonly collection: string | undefined;
  readonly documentId: string | undefined;
  readonly flow: string | undefined;
  readonly id: string;
  readonly tags: ReadonlyArray<string>;
  readonly user: string | undefined;
};

type RootPackageMetadata = {
  readonly name: string;
  readonly packageManager: string;
  readonly scripts: Readonly<Record<string, string>>;
  readonly workspaces: ReadonlyArray<string>;
};

type WorkspacePackageMetadata = {
  readonly name: string;
  readonly relativePath: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !Array.isArray(value);

const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

const asStringArray = (value: unknown): ReadonlyArray<string> =>
  Array.isArray(value) ? A.filter(value, P.isString) : A.empty();

const mkEmptyCuratedSyncState = (collection: string): CuratedSyncState =>
  new CuratedSyncState({
    collection,
    documents: {},
    transport: curatedSyncTransport,
    version: curatedSyncStateVersion,
  });

const parseJsonObject = (label: string, text: string): Effect.Effect<Record<string, unknown>, DomainError> =>
  jsonParse(text).pipe(
    Effect.flatMap((parsed) =>
      isRecord(parsed)
        ? Effect.succeed(parsed)
        : Effect.fail(new DomainError({ message: `${label} must decode to a JSON object.` }))
    )
  );

const stringifyCliJson = (label: string, value: unknown): Effect.Effect<string, TrustGraphCliError> =>
  jsonStringifyCompact(value).pipe(
    Effect.mapError(
      (cause) =>
        new TrustGraphCliError({
          message: `Failed to serialize ${label} as JSON.`,
          cause,
        })
    )
  );

const stringifyDomainJson = (label: string, value: unknown): Effect.Effect<string, DomainError> =>
  jsonStringifyCompact(value).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Failed to serialize ${label} as JSON.`,
          cause,
        })
    )
  );

const messageFromUnknown = (error: unknown): string => {
  const message = isRecord(error) ? asString(error.message) : undefined;
  return message ?? Inspectable.toStringUnknown(error, 0);
};

const causeFromUnknown = (error: unknown): unknown | undefined =>
  isRecord(error) && "cause" in error ? error.cause : undefined;

const sha256 = (content: string): string => createHash("sha256").update(content).digest("hex");

const nextTrustGraphRpcId = (prefix: string): string => `${prefix}-${randomUUID()}`;

const normalizeOptionalString = (value: O.Option<string>, fallback: string): string =>
  pipe(
    value,
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.getOrElse(() => fallback)
  );

const normalizeOptionalRedactedOption = (value: O.Option<Redacted.Redacted>): O.Option<Redacted.Redacted> =>
  pipe(
    value,
    O.filter((redacted) => Str.isNonEmpty(Str.trim(Redacted.value(redacted))))
  );

const normalizeTrustGraphMcpUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/mcp")) {
    return trimmed;
  }
  return `${trimmed}/mcp`;
};

const normalizeTrustGraphApiBaseUrl = (value: string): string => value.trim().replace(/\/+$/, "");

const trustGraphRestBaseUrlFromMcpUrl = (mcpUrl: string): string => mcpUrl.replace(/\/mcp$/, "/api/v1");

/**
 * Load TrustGraph runtime configuration from Effect Config-backed environment values.
 *
 * @returns {Effect.Effect<TrustGraphConfig, TrustGraphCliError>} - An Effect that resolves with normalized TrustGraph CLI configuration.
 */
const loadTrustGraphConfig: Effect.Effect<TrustGraphConfig, TrustGraphCliError> = Effect.gen(function* () {
  const mcpUrlOption = yield* Config.option(Config.string("TRUSTGRAPH_URL"));
  const apiBaseUrlOption = yield* Config.option(Config.string("TRUSTGRAPH_API_URL"));
  const authTokenOption = yield* Config.option(Config.redacted("TRUSTGRAPH_TOKEN"));
  const collectionOption = yield* Config.option(Config.string("TRUSTGRAPH_COLLECTION"));
  const flowOption = yield* Config.option(Config.string("TRUSTGRAPH_FLOW"));
  const userOption = yield* Config.option(Config.string("TRUSTGRAPH_USER"));

  const mcpUrl = normalizeTrustGraphMcpUrl(normalizeOptionalString(mcpUrlOption, defaultTrustGraphUrl));

  return {
    apiBaseUrl: normalizeTrustGraphApiBaseUrl(
      normalizeOptionalString(apiBaseUrlOption, trustGraphRestBaseUrlFromMcpUrl(mcpUrl))
    ),
    authToken: normalizeOptionalRedactedOption(authTokenOption),
    collection: normalizeOptionalString(collectionOption, defaultTrustGraphCollection),
    flow: normalizeOptionalString(flowOption, defaultTrustGraphFlow),
    mcpUrl,
    user: normalizeOptionalString(userOption, defaultTrustGraphUser),
  } satisfies TrustGraphConfig;
}).pipe(
  Effect.mapError(
    (cause) =>
      new TrustGraphCliError({
        message: "Failed to load TrustGraph CLI configuration.",
        cause,
      })
  )
);

const managedDocumentIdFromRelativePath = (relativePath: string): string =>
  `${managedDocumentIdPrefix}${relativePath.replace(/^\.?\//, "")}`;

const managedGeneratedOverviewDocumentId = (): string =>
  managedDocumentIdFromRelativePath(generatedOverviewRelativePath);

const buildMcpHeaders = (config: TrustGraphConfig, sessionId?: string): Headers.Headers =>
  Headers.fromInput({
    Accept: "application/json, text/event-stream",
    Authorization: pipe(
      config.authToken,
      O.map((authToken) => `Bearer ${Redacted.value(authToken)}`),
      O.getOrUndefined
    ),
    "Content-Type": "application/json",
    "mcp-session-id": sessionId,
  });

const buildRestHeaders = (config: TrustGraphConfig): Headers.Headers =>
  Headers.fromInput({
    Accept: "application/json",
    Authorization: pipe(
      config.authToken,
      O.map((authToken) => `Bearer ${Redacted.value(authToken)}`),
      O.getOrUndefined
    ),
    "Content-Type": "application/json",
  });

const parseTrustGraphJsonRecord = (
  description: string,
  payload: string
): Effect.Effect<Record<string, unknown>, TrustGraphCliError> =>
  jsonParse(payload).pipe(
    Effect.mapError(
      (cause) =>
        new TrustGraphCliError({
          message: `Failed to parse TrustGraph ${description} payload as JSON.`,
          cause,
        })
    ),
    Effect.flatMap((parsed) =>
      isRecord(parsed)
        ? Effect.succeed(parsed)
        : Effect.fail(
            new TrustGraphCliError({
              message: `TrustGraph ${description} payload did not decode to a JSON object.`,
              cause: parsed,
            })
          )
    )
  );

const readResponseText = (
  response: HttpClientResponse.HttpClientResponse,
  description: string
): Effect.Effect<string, TrustGraphCliError> =>
  response.text.pipe(
    Effect.mapError(
      (cause) =>
        new TrustGraphCliError({
          message: `TrustGraph ${description} returned an unreadable response body.`,
          cause,
        })
    )
  );

const parseSseJsonMessages = (
  payload: string,
  description: string
): Effect.Effect<ReadonlyArray<Record<string, unknown>>, TrustGraphCliError> =>
  Effect.gen(function* () {
    const trimmed = Str.trim(payload);
    if (trimmed.length === 0) {
      return A.empty<Record<string, unknown>>();
    }

    if (Str.startsWith("{")(trimmed)) {
      return A.make(yield* parseTrustGraphJsonRecord(description, trimmed));
    }

    const lines = payload.split(/\r?\n/);
    const eventPayloads: Array<string> = [];
    let dataLines: Array<string> = [];

    const flush = () => {
      if (dataLines.length === 0) {
        return;
      }

      eventPayloads.push(dataLines.join("\n"));
      dataLines = [];
    };

    for (const line of lines) {
      if (Str.startsWith("data: ")(line)) {
        dataLines.push(line.slice("data: ".length));
        continue;
      }

      if (Str.startsWith("data:")(line)) {
        dataLines.push(Str.trimStart(line.slice("data:".length)));
        continue;
      }

      if (Str.trim(line).length === 0) {
        flush();
      }
    }

    flush();

    return yield* Effect.forEach(
      eventPayloads,
      (eventPayload) => parseTrustGraphJsonRecord(`${description} SSE event`, eventPayload),
      { concurrency: "unbounded" }
    );
  });

const extractJsonRpcResult = (
  messages: ReadonlyArray<Record<string, unknown>>,
  description: string
): Effect.Effect<Record<string, unknown>, TrustGraphCliError> => {
  for (const message of messages) {
    const error = message.error;
    if (isRecord(error)) {
      return Effect.fail(
        new TrustGraphCliError({
          message: `TrustGraph ${description} failed: ${asString(error.message) ?? "unknown RPC error"}`,
          cause: error,
        })
      );
    }
  }

  const resultMessage = [...messages].reverse().find((message) => isRecord(message.result));

  if (resultMessage === undefined) {
    return Effect.fail(
      new TrustGraphCliError({
        message: `TrustGraph ${description} did not return a JSON-RPC result.`,
        cause: messages,
      })
    );
  }

  return Effect.succeed(resultMessage.result as Record<string, unknown>);
};

const initializeTrustGraphSession = Effect.fn(function* (config: TrustGraphConfig) {
  const initializeBody = yield* stringifyCliJson("TrustGraph initialize payload", {
    jsonrpc: "2.0",
    id: nextTrustGraphRpcId("trustgraph-init"),
    method: "initialize",
    params: {
      protocolVersion: initializeProtocolVersion,
      capabilities: {},
      clientInfo: {
        name: "beep-effect-trustgraph-cli",
        version: "0.0.0",
      },
    },
  });

  const request = HttpClientRequest.post(config.mcpUrl, {
    headers: buildMcpHeaders(config),
  }).pipe(HttpClientRequest.setBody(HttpBody.text(initializeBody, "application/json")));

  const response = yield* HttpClient.execute(request).pipe(
    Effect.mapError(
      (cause) =>
        new TrustGraphCliError({
          message: `Failed to initialize a TrustGraph MCP session at ${config.mcpUrl}.`,
          cause,
        })
    ),
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.mapError(
      (cause) =>
        new TrustGraphCliError({
          message: `TrustGraph MCP initialization returned a non-2xx response.`,
          cause,
        })
    )
  );

  const sessionIdOption = Headers.get(response.headers, "mcp-session-id");
  if (O.isNone(sessionIdOption)) {
    return yield* new TrustGraphCliError({
      message: "TrustGraph MCP initialization succeeded but no mcp-session-id header was returned.",
    });
  }

  const initializePayload = yield* readResponseText(response, "initialize");
  const initializeMessages = yield* parseSseJsonMessages(initializePayload, "initialize");
  yield* extractJsonRpcResult(initializeMessages, "initialize");

  const initializedNotification = yield* stringifyCliJson("TrustGraph initialized notification", {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });

  const initializedRequest = HttpClientRequest.post(config.mcpUrl, {
    headers: buildMcpHeaders(config, sessionIdOption.value),
  }).pipe(HttpClientRequest.setBody(HttpBody.text(initializedNotification, "application/json")));

  yield* HttpClient.execute(initializedRequest).pipe(
    Effect.mapError(
      (cause) =>
        new TrustGraphCliError({
          message: "Failed to acknowledge TrustGraph MCP initialization.",
          cause,
        })
    ),
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.mapError(
      (cause) =>
        new TrustGraphCliError({
          message: "TrustGraph MCP initialized notification returned a non-2xx response.",
          cause,
        })
    ),
    Effect.flatMap((ackResponse) => readResponseText(ackResponse, "initialized notification")),
    Effect.flatMap((ackPayload) => parseSseJsonMessages(ackPayload, "initialized notification")),
    Effect.asVoid
  );

  return {
    config,
    sessionId: sessionIdOption.value,
  } satisfies TrustGraphSession;
});

const withTrustGraphSession = <A, E, R>(
  use: (session: TrustGraphSession) => Effect.Effect<A, E, R | HttpClient.HttpClient>
): Effect.Effect<A, E | TrustGraphCliError, R | HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const config = yield* loadTrustGraphConfig;
    const session = yield* initializeTrustGraphSession(config);
    return yield* use(session);
  });

const callTrustGraphTool = (
  session: TrustGraphSession,
  name: string,
  arguments_: Record<string, unknown>
): Effect.Effect<Record<string, unknown>, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const toolBody = yield* stringifyCliJson(`TrustGraph tool ${name} request`, {
      jsonrpc: "2.0",
      id: nextTrustGraphRpcId(`trustgraph-${name}`),
      method: "tools/call",
      params: {
        name,
        arguments: arguments_,
      },
    });

    const request = HttpClientRequest.post(session.config.mcpUrl, {
      headers: buildMcpHeaders(session.config, session.sessionId),
    }).pipe(HttpClientRequest.setBody(HttpBody.text(toolBody, "application/json")));

    const response = yield* HttpClient.execute(request).pipe(
      Effect.mapError(
        (cause) =>
          new TrustGraphCliError({
            message: `TrustGraph tool ${name} could not be reached.`,
            cause,
          })
      ),
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.mapError(
        (cause) =>
          new TrustGraphCliError({
            message: `TrustGraph tool ${name} returned a non-2xx response.`,
            cause,
          })
      )
    );

    const payload = yield* readResponseText(response, `tool ${name}`);
    const messages = yield* parseSseJsonMessages(payload, `tool ${name}`);
    const result = yield* extractJsonRpcResult(messages, `tool ${name}`);

    if (result.isError === true) {
      return yield* new TrustGraphCliError({
        message: `TrustGraph tool ${name} reported an application error.`,
        cause: result,
      });
    }

    return result;
  });

const callTrustGraphRestJson = (
  session: TrustGraphSession,
  path: string,
  payload: Record<string, unknown>,
  description: string
): Effect.Effect<Record<string, unknown>, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const body = yield* stringifyCliJson(`TrustGraph REST ${description} payload`, payload);
    const request = HttpClientRequest.post(`${session.config.apiBaseUrl}${path}`, {
      headers: buildRestHeaders(session.config),
    }).pipe(HttpClientRequest.setBody(HttpBody.text(body, "application/json")));

    const response = yield* HttpClient.execute(request).pipe(
      Effect.mapError(
        (cause) =>
          new TrustGraphCliError({
            message: `TrustGraph REST ${description} could not be reached.`,
            cause,
          })
      ),
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.mapError(
        (cause) =>
          new TrustGraphCliError({
            message: `TrustGraph REST ${description} returned a non-2xx response.`,
            cause,
          })
      )
    );

    const responseText = yield* readResponseText(response, `REST ${description}`);
    if (Str.trim(responseText).length === 0) {
      return {};
    }

    return yield* parseTrustGraphJsonRecord(`REST ${description} response`, responseText);
  });

const extractStructuredContent = (
  result: Record<string, unknown>,
  description: string
): Effect.Effect<Record<string, unknown>, TrustGraphCliError> => {
  const structuredContent = result.structuredContent;
  if (!isRecord(structuredContent)) {
    return Effect.fail(
      new TrustGraphCliError({
        message: `TrustGraph ${description} returned no structuredContent payload.`,
        cause: result,
      })
    );
  }
  return Effect.succeed(structuredContent);
};

const getTrustGraphDocuments = (
  session: TrustGraphSession
): Effect.Effect<ReadonlyArray<TrustGraphDocumentMetadata>, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const result = yield* callTrustGraphTool(session, "get_documents", { user: session.config.user });
    const structuredContent = yield* extractStructuredContent(result, "get_documents");
    const documentMetadatas = Array.isArray(structuredContent.document_metadatas)
      ? structuredContent.document_metadatas
      : [];

    return documentMetadatas.flatMap((entry): ReadonlyArray<TrustGraphDocumentMetadata> => {
      if (!isRecord(entry)) {
        return [];
      }

      const id = asString(entry.id);
      if (id === undefined) {
        return [];
      }

      return [
        {
          comments: asString(entry.comments),
          id,
          mimeType: asString(entry["mime-type"]),
          tags: asStringArray(entry.tags),
          title: asString(entry.title),
        },
      ] as const;
    });
  });

const getTrustGraphProcessingEntries = (
  session: TrustGraphSession
): Effect.Effect<ReadonlyArray<TrustGraphProcessingMetadata>, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const result = yield* callTrustGraphTool(session, "get_processing", { user: session.config.user });
    const structuredContent = yield* extractStructuredContent(result, "get_processing");
    const processingMetadatas = Array.isArray(structuredContent.processing_metadatas)
      ? structuredContent.processing_metadatas
      : [];

    return processingMetadatas.flatMap((entry): ReadonlyArray<TrustGraphProcessingMetadata> => {
      if (!isRecord(entry)) {
        return [];
      }

      const id = asString(entry.id);
      if (id === undefined) {
        return [];
      }

      return [
        {
          collection: asString(entry.collection),
          documentId: asString(entry["document-id"]),
          flow: asString(entry.flow),
          id,
          tags: asStringArray(entry.tags),
          user: asString(entry.user),
        },
      ] as const;
    });
  });

const getTrustGraphFlows = (
  session: TrustGraphSession
): Effect.Effect<ReadonlyArray<string>, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const result = yield* callTrustGraphTool(session, "get_flows", {});
    const structuredContent = yield* extractStructuredContent(result, "get_flows");
    return asStringArray(structuredContent.flow_ids);
  });

const trustGraphEnsureCollection = (
  session: TrustGraphSession,
  collection: string
): Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient> =>
  callTrustGraphRestJson(
    session,
    "/collection-management",
    {
      collection,
      description: "Curated repository knowledge base for Codex and repo context.",
      name: collection,
      operation: "update-collection",
      tags: ["codex", "repo", "trustgraph"],
      user: session.config.user,
    },
    `collection-management update-collection ${collection}`
  ).pipe(Effect.asVoid);

const trustGraphDeleteCollection = (
  session: TrustGraphSession,
  collection: string
): Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient> =>
  callTrustGraphRestJson(
    session,
    "/collection-management",
    {
      collection,
      operation: "delete-collection",
      user: session.config.user,
    },
    `collection-management delete-collection ${collection}`
  ).pipe(Effect.asVoid);

const trustGraphRemoveDocument = (
  session: TrustGraphSession,
  documentId: string
): Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient> =>
  callTrustGraphTool(session, "remove_document", {
    document_id: documentId,
    user: session.config.user,
  }).pipe(Effect.asVoid);

const trustGraphStopProcessingEntry = (
  session: TrustGraphSession,
  processingId: string
): Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient> =>
  callTrustGraphRestJson(
    session,
    "/librarian",
    {
      operation: "remove-processing",
      "processing-id": processingId,
      user: session.config.user,
    },
    `librarian remove-processing ${processingId}`
  ).pipe(Effect.asVoid);

const trustGraphLoadDocument = (
  session: TrustGraphSession,
  document: CuratedDocument
): Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient> =>
  callTrustGraphTool(session, "load_document", {
    comments: `Curated repository context from ${document.relativePath}`,
    // TrustGraph's librarian/gateway expect base64 payloads even for text documents.
    document: Buffer.from(document.content, "utf8").toString("base64"),
    document_id: document.documentId,
    mime_type: "text/plain",
    title: document.title,
    user: session.config.user,
  }).pipe(Effect.asVoid);

const processingIdFromDocument = (document: CuratedDocument): string =>
  `${document.documentId}:processing:${document.hash.slice(0, 16)}`;

const trustGraphQueueDocumentProcessing = (
  session: TrustGraphSession,
  document: CuratedDocument
): Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient> =>
  callTrustGraphTool(session, "add_processing", {
    collection: session.config.collection,
    flow: session.config.flow,
    document_id: document.documentId,
    processing_id: processingIdFromDocument(document),
    tags: Array.from(document.tags),
    user: session.config.user,
  }).pipe(Effect.asVoid);

const trustGraphDocumentRag = (
  session: TrustGraphSession,
  question: string
): Effect.Effect<string, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const result = yield* callTrustGraphRestJson(
      session,
      `/flow/${encodeURIComponent(session.config.flow)}/service/document-rag`,
      {
        collection: session.config.collection,
        "doc-limit": 8,
        query: question,
        streaming: false,
        user: session.config.user,
      },
      `${session.config.flow} document-rag`
    );

    return asString(result.response) ?? "";
  });

const trustGraphGraphRag = (
  session: TrustGraphSession,
  question: string
): Effect.Effect<string, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const result = yield* callTrustGraphTool(session, "graph_rag", {
      collection: session.config.collection,
      entity_limit: "8",
      flow_id: session.config.flow,
      max_path_length: "2",
      max_subgraph_size: "24",
      question,
      triple_limit: "16",
      user: session.config.user,
    });

    const structuredContent = yield* extractStructuredContent(result, "graph_rag");
    return asString(structuredContent.response) ?? "";
  });

const trustGraphTriplesQuery = (
  session: TrustGraphSession,
  limit: number
): Effect.Effect<ReadonlyArray<unknown>, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const result = yield* callTrustGraphTool(session, "triples_query", {
      collection: session.config.collection,
      flow_id: session.config.flow,
      limit: String(limit),
      user: session.config.user,
    });

    const structuredContent = yield* extractStructuredContent(result, "triples_query");
    return Array.isArray(structuredContent.triples) ? structuredContent.triples : [];
  });

const trustGraphRepositoryContext = (
  session: TrustGraphSession,
  question: string
): Effect.Effect<string, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const documentResponse = yield* trustGraphDocumentRag(session, question).pipe(
      Effect.timeoutOption(Duration.seconds(8)),
      Effect.catch(() => Effect.succeed(O.none()))
    );

    if (O.isSome(documentResponse) && documentResponse.value.trim().length > 0) {
      return documentResponse.value;
    }

    return yield* trustGraphGraphRag(session, question);
  });

const readCuratedSyncState = (
  absoluteStatePath: string
): Effect.Effect<CuratedSyncState, DomainError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(absoluteStatePath).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to check ${absoluteStatePath}`,
            cause,
          })
      )
    );

    if (!exists) {
      return mkEmptyCuratedSyncState(defaultTrustGraphCollection);
    }

    const text = yield* fs.readFileString(absoluteStatePath).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to read ${absoluteStatePath}`,
            cause,
          })
      )
    );
    const parsed = yield* jsonParse(text);

    if (!isRecord(parsed)) {
      return yield* new DomainError({
        message: `Invalid TrustGraph sync state: ${absoluteStatePath} did not contain a JSON object.`,
      });
    }

    const parsedVersion = typeof parsed.version === "number" ? parsed.version : 0;
    const parsedTransport = asString(parsed.transport);
    if (parsedVersion !== curatedSyncStateVersion || parsedTransport !== curatedSyncTransport) {
      return mkEmptyCuratedSyncState(asString(parsed.collection) ?? defaultTrustGraphCollection);
    }

    return yield* Effect.try({
      try: () => decodeCuratedSyncState(parsed),
      catch: (cause) =>
        new DomainError({
          message: `Invalid TrustGraph sync state: ${messageFromUnknown(cause)}`,
          cause,
        }),
    });
  });

const writeCuratedSyncState = (
  absoluteStatePath: string,
  state: CuratedSyncState
): Effect.Effect<void, DomainError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    yield* fs.makeDirectory(path.dirname(absoluteStatePath), { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to create ${absoluteStatePath} parent directory`,
            cause,
          })
      )
    );
    const serialized = yield* stringifyDomainJson("TrustGraph sync state", state);
    yield* fs.writeFileString(absoluteStatePath, `${serialized}\n`).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to write ${absoluteStatePath}`,
            cause,
          })
      )
    );
  });

const deriveMarkdownTitle = (relativePath: string, content: string): string => {
  const heading = pipe(
    content.split(/\r?\n/),
    A.findFirst((line) => Str.startsWith("# ")(line)),
    O.map((line) => line.replace(/^#\s+/, "")),
    O.map(Str.trim)
  );

  if (O.isSome(heading)) {
    return heading.value;
  }

  const segments = relativePath.split("/");
  return segments.at(-1)?.replace(/\.md$/i, "") ?? relativePath;
};

const readRootPackageMetadata = (
  repoRoot: string
): Effect.Effect<RootPackageMetadata, DomainError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const packageJsonText = yield* fs.readFileString(path.join(repoRoot, "package.json")).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to read root package.json in ${repoRoot}`,
            cause,
          })
      )
    );
    const parsed = yield* parseJsonObject("Root package.json", packageJsonText);
    const workspaces = Array.isArray(parsed.workspaces)
      ? parsed.workspaces.filter((entry): entry is string => typeof entry === "string")
      : [];
    const scripts = isRecord(parsed.scripts)
      ? Object.fromEntries(
          Object.entries(parsed.scripts).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : []))
        )
      : {};

    return {
      name: asString(parsed.name) ?? "@beep/root",
      packageManager: asString(parsed.packageManager) ?? "unknown",
      scripts,
      workspaces,
    } satisfies RootPackageMetadata;
  });

const readWorkspacePackages = (
  repoRoot: string,
  rootPackage: RootPackageMetadata
): Effect.Effect<ReadonlyArray<WorkspacePackageMetadata>, DomainError, FileSystem.FileSystem | FsUtils | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const fsUtils = yield* FsUtils;

    const workspacePackageJsonPatterns = rootPackage.workspaces.map((workspace) =>
      workspace.includes("*") ? `${workspace}/package.json` : `${workspace}/package.json`
    );

    const packageJsonPaths = yield* fsUtils.globFiles(
      workspacePackageJsonPatterns,
      new GlobOptions({
        cwd: repoRoot,
        dot: true,
      })
    );

    const packages = yield* Effect.forEach(
      packageJsonPaths,
      Effect.fn(function* (relativePackageJsonPath) {
        const absolutePackageJsonPath = path.join(repoRoot, relativePackageJsonPath);
        const text = yield* fs.readFileString(absolutePackageJsonPath).pipe(
          Effect.mapError(
            (cause) =>
              new DomainError({
                message: `Failed to read ${absolutePackageJsonPath}`,
                cause,
              })
          )
        );
        const parsed = yield* parseJsonObject(relativePackageJsonPath, text);
        const packageName = asString(parsed.name);
        if (packageName === undefined) {
          return O.none<WorkspacePackageMetadata>();
        }
        const relativePath = relativePackageJsonPath.replace(/\/package\.json$/, "");
        return O.some({
          name: packageName,
          relativePath,
        } satisfies WorkspacePackageMetadata);
      }),
      { concurrency: "unbounded" }
    );

    return packages
      .flatMap((entry) => (O.isSome(entry) ? [entry.value] : []))
      .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  });

const buildGeneratedRepoOverview = (
  rootPackage: RootPackageMetadata,
  workspacePackages: ReadonlyArray<WorkspacePackageMetadata>,
  config: TrustGraphConfig
): string => {
  const trustGraphScripts = Object.keys(rootPackage.scripts)
    .filter(
      (scriptName) =>
        scriptName === "beep" || scriptName.startsWith("trustgraph:") || scriptName.startsWith("codex:hook:")
    )
    .sort((left, right) => left.localeCompare(right));

  const workspaceLines = workspacePackages
    .map((workspace) => `- \`${workspace.relativePath}\` -> \`${workspace.name}\``)
    .join("\n");
  const workspacePatternLines = rootPackage.workspaces.map((workspace) => `- \`${workspace}\``).join("\n");
  const scriptLines = trustGraphScripts
    .map((scriptName) => `- \`${scriptName}\` -> \`${rootPackage.scripts[scriptName]}\``)
    .join("\n");
  const commandLines = repoCliCommandGroups.map((command) => `- \`${command}\``).join("\n");

  return [
    "# beep-effect Repository Overview",
    "",
    "This document is generated by `bun run trustgraph:sync-curated` and is meant to seed TrustGraph with stable repository context for Codex.",
    "",
    "## TrustGraph Defaults",
    `- MCP endpoint: \`${config.mcpUrl}\``,
    `- API endpoint: \`${config.apiBaseUrl}\``,
    `- User: \`${config.user}\``,
    `- Collection: \`${config.collection}\``,
    `- Flow: \`${config.flow}\``,
    "",
    "## Root Package",
    `- Package: \`${rootPackage.name}\``,
    `- Package manager: \`${rootPackage.packageManager}\``,
    `- Workspace patterns: ${rootPackage.workspaces.length}`,
    `- Workspace packages discovered: ${workspacePackages.length}`,
    "",
    "## Workspace Patterns",
    workspacePatternLines,
    "",
    "## Workspace Package Inventory",
    workspaceLines,
    "",
    "## CLI Command Groups",
    commandLines,
    "",
    "## High-Signal Root Scripts",
    scriptLines,
    "",
    "## Knowledge Base Policy",
    "- TrustGraph is the primary durable repository knowledge base for `beep-effect`.",
    "- Graphiti remains available as a fallback for legacy session-memory and effect-v4 knowledge graph workflows.",
    "- The initial TrustGraph corpus is curated documentation plus this generated overview, not raw source-code ingestion.",
  ].join("\n");
};

const collectCuratedDocuments = (
  repoRoot: string,
  config: TrustGraphConfig
): Effect.Effect<ReadonlyArray<CuratedDocument>, DomainError, FileSystem.FileSystem | FsUtils | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const fsUtils = yield* FsUtils;

    const relativePaths = yield* fsUtils.globFiles(
      curatedSourcePatterns,
      new GlobOptions({
        cwd: repoRoot,
        dot: true,
      })
    );
    const sortedRelativePaths = [...relativePaths].sort((left, right) => left.localeCompare(right));

    const curatedFiles = yield* Effect.forEach(
      sortedRelativePaths,
      Effect.fn(function* (relativePath) {
        const absolutePath = path.join(repoRoot, relativePath);
        const content = yield* fs.readFileString(absolutePath).pipe(
          Effect.mapError(
            (cause) =>
              new DomainError({
                message: `Failed to read curated TrustGraph source ${absolutePath}`,
                cause,
              })
          )
        );
        return {
          content,
          documentId: managedDocumentIdFromRelativePath(relativePath),
          hash: sha256(content),
          isGenerated: false,
          relativePath,
          tags: ["beep-effect", "curated-doc", "trustgraph"],
          title: deriveMarkdownTitle(relativePath, content),
        } satisfies CuratedDocument;
      }),
      { concurrency: "unbounded" }
    );

    const rootPackage = yield* readRootPackageMetadata(repoRoot);
    const workspacePackages = yield* readWorkspacePackages(repoRoot, rootPackage);
    const generatedOverviewContent = buildGeneratedRepoOverview(rootPackage, workspacePackages, config);
    const generatedOverview = {
      content: generatedOverviewContent,
      documentId: managedDocumentIdFromRelativePath(generatedOverviewRelativePath),
      hash: sha256(generatedOverviewContent),
      isGenerated: true,
      relativePath: generatedOverviewRelativePath,
      tags: ["beep-effect", "generated", "trustgraph"],
      title: "beep-effect Repository Overview",
    } satisfies CuratedDocument;

    return [...curatedFiles, generatedOverview] as const;
  });

const managedStateFromDocuments = (
  documents: ReadonlyArray<CuratedDocument>,
  collection: string,
  syncedAt: string
): CuratedSyncState =>
  new CuratedSyncState({
    collection,
    documents: Object.fromEntries(
      A.map(documents, (document) => [
        document.documentId,
        new CuratedSyncStateDocument({
          hash: document.hash,
          relativePath: document.relativePath,
          syncedAt,
          title: document.title,
        }),
      ])
    ),
    transport: curatedSyncTransport,
    version: curatedSyncStateVersion,
  });

const filterManagedDocuments = (
  documents: ReadonlyArray<TrustGraphDocumentMetadata>
): ReadonlyArray<TrustGraphDocumentMetadata> =>
  A.filter(documents, (document) => Str.startsWith(managedDocumentIdPrefix)(document.id));

const filterManagedProcessingEntries = (
  processing: ReadonlyArray<TrustGraphProcessingMetadata>,
  config: TrustGraphConfig
): ReadonlyArray<TrustGraphProcessingMetadata> =>
  A.filter(
    processing,
    (entry) =>
      pipe(entry.documentId, O.fromUndefinedOr, O.exists(Str.startsWith(managedDocumentIdPrefix))) &&
      entry.collection === config.collection
  );

const isProbeDocumentId = (documentId: string): boolean =>
  Str.startsWith("tg-smoke-beep-effect")(documentId) ||
  Str.startsWith("tg-default-smoke-")(documentId) ||
  Str.startsWith("codex-temp-probe-trustgraph")(documentId) ||
  documentId === "urn:test:tg-debug";

const filterRepoProbeDocuments = (
  documents: ReadonlyArray<TrustGraphDocumentMetadata>
): ReadonlyArray<TrustGraphDocumentMetadata> =>
  A.filter(documents, (document) => {
    const hasTemporaryTag = A.some(document.tags, (tag) => tag === "temporary" || tag === "smoke");

    return hasTemporaryTag || isProbeDocumentId(document.id);
  });

const filterRepoProbeProcessingEntries = (
  processing: ReadonlyArray<TrustGraphProcessingMetadata>
): ReadonlyArray<TrustGraphProcessingMetadata> =>
  A.filter(processing, (entry) => {
    const hasTemporaryTag = A.some(entry.tags, (tag) => tag === "temporary" || tag === "smoke");

    return hasTemporaryTag || pipe(entry.documentId, O.fromUndefinedOr, O.exists(isProbeDocumentId));
  });

const trustGraphPublicDocumentRagSmoke = (
  session: TrustGraphSession
): Effect.Effect<string, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const responseOption = yield* trustGraphDocumentRag(session, trustGraphStatusDocumentRagQuestion).pipe(
      Effect.timeoutOption(Duration.seconds(45)),
      Effect.mapError(
        (cause) =>
          new TrustGraphCliError({
            message: "TrustGraph public document-rag health check failed.",
            cause,
          })
      )
    );

    if (O.isNone(responseOption)) {
      return yield* new TrustGraphCliError({
        message: "TrustGraph public document-rag health check timed out after 45 seconds.",
      });
    }

    const response = responseOption.value.trim();
    if (response.length === 0) {
      return yield* new TrustGraphCliError({
        message: "TrustGraph public document-rag health check returned an empty response.",
      });
    }

    return response;
  });

const trustGraphGraphRagSmoke = (
  session: TrustGraphSession
): Effect.Effect<string, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const responseOption = yield* trustGraphGraphRag(session, trustGraphStatusGraphRagQuestion).pipe(
      Effect.timeoutOption(Duration.seconds(45)),
      Effect.mapError(
        (cause) =>
          new TrustGraphCliError({
            message: "TrustGraph graph-rag health check failed.",
            cause,
          })
      )
    );

    if (O.isNone(responseOption)) {
      return yield* new TrustGraphCliError({
        message: "TrustGraph graph-rag health check timed out after 45 seconds.",
      });
    }

    const response = responseOption.value.trim();
    if (response.length === 0) {
      return yield* new TrustGraphCliError({
        message: "TrustGraph graph-rag health check returned an empty response.",
      });
    }

    return response;
  });

const trustGraphTriplesSmoke = (
  session: TrustGraphSession
): Effect.Effect<ReadonlyArray<unknown>, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const triplesOption = yield* trustGraphTriplesQuery(session, 1).pipe(
      Effect.timeoutOption(Duration.seconds(20)),
      Effect.mapError(
        (cause) =>
          new TrustGraphCliError({
            message: "TrustGraph triples health check failed.",
            cause,
          })
      )
    );

    if (O.isNone(triplesOption)) {
      return yield* new TrustGraphCliError({
        message: "TrustGraph triples health check timed out after 20 seconds.",
      });
    }

    if (triplesOption.value.length === 0) {
      return yield* new TrustGraphCliError({
        message: "TrustGraph triples health check returned no triples.",
      });
    }

    return triplesOption.value;
  });

const summarizeSyncDiff = (
  documents: ReadonlyArray<CuratedDocument>,
  state: CuratedSyncState,
  remoteDocumentIds?: HashSet.HashSet<string>
) => {
  const stateDocuments = state.documents as Readonly<Record<string, CuratedSyncStateDocument | undefined>>;
  const desiredDocumentIds = pipe(
    documents,
    A.map((document) => document.documentId),
    HashSet.fromIterable
  );
  const staleDocumentIds = A.filter(
    Object.keys(stateDocuments),
    (documentId) => !HashSet.has(desiredDocumentIds, documentId)
  );
  const uploadCandidates = A.filter(documents, (document) => {
    const previous = stateDocuments[document.documentId];
    return (
      previous === undefined ||
      previous.hash !== document.hash ||
      (remoteDocumentIds !== undefined && !HashSet.has(remoteDocumentIds, document.documentId))
    );
  });
  const unchanged = A.filter(
    documents,
    (document) => !A.some(uploadCandidates, (candidate) => candidate.documentId === document.documentId)
  );

  return {
    staleDocumentIds,
    unchanged,
    uploadCandidates,
  } as const;
};

const resetManagedRepositoryState = (
  session: TrustGraphSession,
  managedDocuments: ReadonlyArray<TrustGraphDocumentMetadata>,
  managedProcessing: ReadonlyArray<TrustGraphProcessingMetadata>,
  probeDocuments: ReadonlyArray<TrustGraphDocumentMetadata>,
  probeProcessing: ReadonlyArray<TrustGraphProcessingMetadata>
): Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    yield* Console.log(
      `[trustgraph:sync-curated] resetting repo-managed TrustGraph state for collection ${session.config.collection} (managedDocs=${managedDocuments.length}, managedProcessing=${managedProcessing.length}, probeDocs=${probeDocuments.length}, probeProcessing=${probeProcessing.length})`
    );

    for (const entry of [...probeProcessing, ...managedProcessing]) {
      yield* trustGraphStopProcessingEntry(session, entry.id).pipe(
        Effect.catch((error) =>
          Console.error(
            `[trustgraph:sync-curated] warning: failed to stop processing ${entry.id}: ${messageFromUnknown(error)}`
          )
        )
      );
    }

    yield* trustGraphDeleteCollection(session, session.config.collection);

    for (const document of [...probeDocuments, ...managedDocuments]) {
      yield* trustGraphRemoveDocument(session, document.id).pipe(
        Effect.catch((error) =>
          Console.error(
            `[trustgraph:sync-curated] warning: failed to remove document ${document.id}: ${messageFromUnknown(error)}`
          )
        )
      );
    }
  });

const readHookInput = (): Effect.Effect<Record<string, unknown> | undefined, DomainError> =>
  Effect.gen(function* () {
    if (process.stdin.isTTY) {
      return undefined;
    }

    const stdinText = yield* Effect.tryPromise({
      try: () =>
        new Promise<string>((resolve, reject) => {
          let buffer = "";
          process.stdin.setEncoding("utf8");
          process.stdin.on("data", (chunk) => {
            buffer += chunk;
          });
          process.stdin.on("end", () => resolve(buffer));
          process.stdin.on("error", reject);
        }),
      catch: (cause) =>
        new DomainError({
          message: "Failed to read Codex SessionStart hook input from stdin.",
          cause,
        }),
    });

    const trimmed = stdinText.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    return yield* parseJsonObject("Codex SessionStart hook input", trimmed);
  });

const buildSessionStartQuestion = (source: string, cwd: string | undefined): string =>
  [
    "Provide a concise startup briefing for a coding agent entering the beep-effect repository.",
    `The session source is "${source}".`,
    cwd === undefined ? undefined : `The current working directory is "${cwd}".`,
    "Focus on repository purpose, TrustGraph/Graphiti memory conventions, high-signal command surfaces, and architectural context likely to matter early in a session.",
    "Keep the answer under 220 words.",
  ]
    .filter((entry): entry is string => entry !== undefined)
    .join(" ");

const buildSessionStartHookOutput = (additionalContext: string): Effect.Effect<string, TrustGraphCliError> =>
  stringifyCliJson("Codex SessionStart hook output", {
    continue: true,
    hookSpecificOutput: {
      additionalContext,
      hookEventName: "SessionStart",
    },
  });

/**
 * Inspect TrustGraph flow availability, curated corpus sync state, and retrieval health for the repo collection.
 *
 * @returns {Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient>} - An Effect that prints TrustGraph status and fails the process when the repo corpus is unhealthy.
 * @category UseCase
 * @since 0.0.0
 */
export const runTrustGraphStatus = withTrustGraphSession((session) =>
  Effect.gen(function* () {
    const repoRoot = yield* findRepoRoot();
    const path = yield* Path.Path;
    const state = yield* readCuratedSyncState(path.join(repoRoot, curatedSyncStateRelativePath));
    const localDocuments = yield* collectCuratedDocuments(repoRoot, session.config);
    const flows = yield* getTrustGraphFlows(session);
    const libraryDocuments = filterManagedDocuments(yield* getTrustGraphDocuments(session));
    const libraryProcessing = filterManagedProcessingEntries(
      yield* getTrustGraphProcessingEntries(session),
      session.config
    );
    const managedDocumentIds = HashSet.fromIterable(libraryDocuments.map((document) => document.id));
    const expectedManagedDocumentIds = HashSet.fromIterable(localDocuments.map((document) => document.documentId));
    const diff = summarizeSyncDiff(localDocuments, state, managedDocumentIds);
    const missingManagedDocuments = pipe(
      localDocuments,
      A.filter((document) => !HashSet.has(managedDocumentIds, document.documentId)),
      A.map((document) => document.relativePath)
    );
    const extraManagedDocuments = pipe(
      libraryDocuments,
      A.filter((document) => !HashSet.has(expectedManagedDocumentIds, document.id)),
      A.map((document) => document.id)
    );
    const failures: string[] = [];

    yield* Console.log(
      `[trustgraph:status] endpoint=${session.config.mcpUrl} collection=${session.config.collection} user=${session.config.user} flow=${session.config.flow}`
    );
    yield* Console.log(
      `[trustgraph:status] flows=${flows.length} localDocs=${localDocuments.length} syncedStateEntries=${Object.keys(state.documents).length} libraryDocs=${libraryDocuments.length} libraryProcessingEntries=${libraryProcessing.length}`
    );
    yield* Console.log(
      `[trustgraph:status] uploadCandidates=${diff.uploadCandidates.length} staleStateEntries=${diff.staleDocumentIds.length} unchanged=${diff.unchanged.length}`
    );

    if (!flows.includes(session.config.flow)) {
      failures.push(
        `missing flow "${session.config.flow}" on ${session.config.mcpUrl}; available flows: ${flows.join(", ")}`
      );
    }

    if (Object.keys(state.documents).length === 0) {
      yield* Console.log(
        `[trustgraph:status] no curated sync state exists yet. Run "bun run trustgraph:sync-curated" to seed the collection.`
      );
    }

    if (diff.staleDocumentIds.length > 0) {
      yield* Console.log(
        `[trustgraph:status] stale local sync state entries were found. The next sync will try to remove the matching managed documents from TrustGraph before reseeding.`
      );
    }

    if (Object.keys(state.documents).length !== localDocuments.length) {
      failures.push(
        `local sync state tracks ${Object.keys(state.documents).length} document(s), but the curated corpus currently expects ${localDocuments.length}.`
      );
    }

    if (diff.staleDocumentIds.length > 0) {
      failures.push(
        `local sync state contains ${diff.staleDocumentIds.length} stale document entr${diff.staleDocumentIds.length === 1 ? "y" : "ies"}.`
      );
    }

    if (missingManagedDocuments.length > 0) {
      failures.push(
        `TrustGraph is missing ${missingManagedDocuments.length} managed document(s): ${missingManagedDocuments.join(", ")}`
      );
    }

    if (extraManagedDocuments.length > 0) {
      failures.push(
        `TrustGraph contains ${extraManagedDocuments.length} unexpected managed document(s): ${extraManagedDocuments.join(", ")}`
      );
    }

    if (!HashSet.has(managedDocumentIds, managedGeneratedOverviewDocumentId())) {
      failures.push(
        `TrustGraph is missing the generated repository overview document ${generatedOverviewRelativePath}.`
      );
    }

    if (diff.uploadCandidates.length > 0) {
      failures.push(
        `TrustGraph still needs ${diff.uploadCandidates.length} curated document upload(s) before the repo corpus is fully in sync.`
      );
    }

    const documentRagCheck = yield* trustGraphPublicDocumentRagSmoke(session).pipe(
      Effect.map((response) => ({
        ok: true as const,
        response,
      })),
      Effect.catch((error) =>
        Effect.succeed({
          error: messageFromUnknown(error),
          ok: false as const,
        })
      )
    );
    if (!documentRagCheck.ok) {
      failures.push(documentRagCheck.error);
    }

    const graphRagCheck = yield* trustGraphGraphRagSmoke(session).pipe(
      Effect.map((response) => ({
        ok: true as const,
        response,
      })),
      Effect.catch((error) =>
        Effect.succeed({
          error: messageFromUnknown(error),
          ok: false as const,
        })
      )
    );
    if (!graphRagCheck.ok) {
      failures.push(graphRagCheck.error);
    }

    const triplesCheck = yield* trustGraphTriplesSmoke(session).pipe(
      Effect.map((triples) => ({
        ok: true as const,
        triples,
      })),
      Effect.catch((error) =>
        Effect.succeed({
          error: messageFromUnknown(error),
          ok: false as const,
        })
      )
    );
    if (!triplesCheck.ok) {
      failures.push(triplesCheck.error);
    }

    if (failures.length > 0) {
      for (const failure of failures) {
        yield* Console.error(`[trustgraph:status] ${failure}`);
      }
      process.exitCode = 1;
      return;
    }

    yield* Console.log("[trustgraph:status] TrustGraph repo corpus and graph checks are healthy.");
  }).pipe(
    Effect.catch((error) =>
      Effect.gen(function* () {
        yield* Console.error(`[trustgraph:status] ${messageFromUnknown(error)}`);
        process.exitCode = 1;
      })
    )
  )
);

/**
 * Sync the curated documentation corpus into TrustGraph for the configured repo collection.
 *
 * @param {object} options - Sync options controlling whether repo-managed TrustGraph state is reseeded from scratch first.
 * @param {boolean} options.reset - Whether to delete and reseed repo-managed TrustGraph state before syncing the curated corpus.
 * @returns {Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient>} - An Effect that uploads curated documents and queues TrustGraph processing work.
 * @category UseCase
 * @since 0.0.0
 */
export const runTrustGraphSyncCurated = (options: { readonly reset: boolean }) =>
  withTrustGraphSession((session) =>
    Effect.gen(function* () {
      const repoRoot = yield* findRepoRoot();
      const path = yield* Path.Path;
      const absoluteStatePath = path.join(repoRoot, curatedSyncStateRelativePath);
      const localDocuments = yield* collectCuratedDocuments(repoRoot, session.config);
      const remoteDocuments = yield* getTrustGraphDocuments(session);
      const existingManagedDocuments = filterManagedDocuments(remoteDocuments);
      const probeDocuments = filterRepoProbeDocuments(remoteDocuments);
      const remoteProcessingEntries = yield* getTrustGraphProcessingEntries(session);
      let existingManagedDocumentIds = options.reset
        ? HashSet.empty<string>()
        : HashSet.fromIterable(existingManagedDocuments.map((document) => document.id));
      const existingManagedProcessing = filterManagedProcessingEntries(remoteProcessingEntries, session.config);
      const existingProbeProcessing = filterRepoProbeProcessingEntries(remoteProcessingEntries);
      const previousState = options.reset
        ? mkEmptyCuratedSyncState(session.config.collection)
        : yield* readCuratedSyncState(absoluteStatePath);

      if (options.reset) {
        yield* resetManagedRepositoryState(
          session,
          existingManagedDocuments,
          existingManagedProcessing,
          probeDocuments,
          existingProbeProcessing
        );
        yield* writeCuratedSyncState(absoluteStatePath, mkEmptyCuratedSyncState(session.config.collection));
      }

      const diff = summarizeSyncDiff(localDocuments, previousState, existingManagedDocumentIds);

      yield* Console.log(
        `[trustgraph:sync-curated] discovered ${localDocuments.length} curated document(s) for collection ${session.config.collection}`
      );

      yield* trustGraphEnsureCollection(session, session.config.collection);

      for (const documentId of diff.staleDocumentIds) {
        if (HashSet.has(existingManagedDocumentIds, documentId)) {
          yield* trustGraphRemoveDocument(session, documentId);
          existingManagedDocumentIds = HashSet.remove(existingManagedDocumentIds, documentId);
          yield* Console.log(`[trustgraph:sync-curated] removed stale remote document ${documentId}`);
        }
        yield* Console.log(`[trustgraph:sync-curated] dropped stale local state entry ${documentId}`);
      }

      for (const document of diff.uploadCandidates) {
        if (HashSet.has(existingManagedDocumentIds, document.documentId)) {
          yield* trustGraphRemoveDocument(session, document.documentId);
        }
        yield* trustGraphLoadDocument(session, document);
        yield* trustGraphQueueDocumentProcessing(session, document);
        yield* Console.log(`[trustgraph:sync-curated] queued ${document.relativePath}`);
      }

      const syncedAt = yield* DateTime.now.pipe(
        Effect.map(DateTime.toDateUtc),
        Effect.map((date) => date.toISOString())
      );
      const nextState = managedStateFromDocuments(localDocuments, session.config.collection, syncedAt);
      yield* writeCuratedSyncState(absoluteStatePath, nextState);

      yield* Console.log(
        `[trustgraph:sync-curated] synced ${diff.uploadCandidates.length} document(s), skipped ${diff.unchanged.length}, dropped ${diff.staleDocumentIds.length} stale local state entr${
          diff.staleDocumentIds.length === 1 ? "y" : "ies"
        }`
      );
      yield* Console.log(
        `[trustgraph:sync-curated] note: curated sync now uploads library documents and queues processing jobs, so retrieval depends on the TrustGraph processing pipeline finishing successfully after upload.`
      );
    }).pipe(
      Effect.catch((error) =>
        Effect.gen(function* () {
          yield* Console.error(`[trustgraph:sync-curated] ${messageFromUnknown(error)}`);
          const cause = causeFromUnknown(error);
          if (cause !== undefined) {
            yield* Console.error(`[trustgraph:sync-curated] cause=${Inspectable.toStringUnknown(cause, 0)}`);
          }
          process.exitCode = 1;
        })
      )
    )
  );

/**
 * Query TrustGraph for repository context using the configured collection and flow.
 *
 * @param {string} prompt - The natural-language prompt to answer with TrustGraph-backed repository context.
 * @returns {Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient>} - An Effect that prints the retrieved context or a helpful empty-state message.
 * @category UseCase
 * @since 0.0.0
 */
export const runTrustGraphContext = (prompt: string) =>
  withTrustGraphSession((session) =>
    Effect.gen(function* () {
      const response = yield* trustGraphRepositoryContext(session, prompt);
      if (response.trim().length === 0) {
        yield* Console.log(
          `TrustGraph returned no context for this prompt in collection "${session.config.collection}". Run "bun run trustgraph:sync-curated" if the collection is still empty.`
        );
        return;
      }

      yield* Console.log(response.trim());
    }).pipe(
      Effect.catch((error) =>
        Effect.gen(function* () {
          yield* Console.error(`[trustgraph:context] ${messageFromUnknown(error)}`);
          process.exitCode = 1;
        })
      )
    )
  );

/**
 * Emit Codex SessionStart hook output enriched with TrustGraph repository startup context.
 *
 * @returns {Effect.Effect<void, TrustGraphCliError, HttpClient.HttpClient>} - An Effect that prints SessionStart hook JSON for Codex.
 * @category UseCase
 * @since 0.0.0
 */
export const runCodexSessionStartHook = withTrustGraphSession((session) =>
  Effect.gen(function* () {
    const hookInput = yield* readHookInput();
    const source = asString(hookInput?.source) ?? "startup";
    const cwd = asString(hookInput?.cwd);
    const prompt = buildSessionStartQuestion(source, cwd);

    const response = yield* trustGraphRepositoryContext(session, prompt).pipe(
      Effect.catch((error) =>
        Effect.succeed(
          `TrustGraph startup context unavailable for collection "${session.config.collection}": ${messageFromUnknown(error)}`
        )
      )
    );

    const additionalContext =
      response.trim().length > 0
        ? response.trim()
        : `TrustGraph has no startup context yet for collection "${session.config.collection}". Run "bun run trustgraph:sync-curated" to seed the curated repository knowledge base.`;

    const output = yield* buildSessionStartHookOutput(additionalContext);
    yield* Console.log(output);
  }).pipe(
    Effect.catch((error) =>
      Effect.gen(function* () {
        const fallbackOutput = yield* buildSessionStartHookOutput(
          `TrustGraph startup context failed softly: ${messageFromUnknown(error)}`
        );
        yield* Console.log(fallbackOutput);
      })
    )
  )
);

// Generation-2 mock ACP agent for client integration tests, run with `bun run`. Ported from
// t3code effect-acp `test/fixtures/acp-mock-peer.ts` (31dcc7c513); behaviour is selected by the
// `ACP_MOCK_*` environment variables read through `effect/Config` below.
import * as AcpAgent from "@beep/acp/agent";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const sessionId = "mock-session-1";

const flag = (name: string) => Config.Boolean(name).pipe(Config.withDefault(false));

const MockPeerConfig = Config.all({
  badTypedRequest: flag("ACP_MOCK_BAD_TYPED_REQUEST"),
  customAuth: flag("ACP_MOCK_CUSTOM_AUTH"),
  envVarAuth: flag("ACP_MOCK_ENV_VAR_AUTH"),
  exitImmediatelyCode: Config.option(Config.Int("ACP_MOCK_EXIT_IMMEDIATELY_CODE")),
  malformedOutput: flag("ACP_MOCK_MALFORMED_OUTPUT"),
  malformedOutputExitCode: Config.Int("ACP_MOCK_MALFORMED_OUTPUT_EXIT_CODE").pipe(Config.withDefault(0)),
  mcpOverAcp: flag("ACP_MOCK_MCP_OVER_ACP"),
  stdoutPrefix: Config.option(Config.String("ACP_MOCK_STDOUT_PREFIX")),
  unknownVariants: flag("ACP_MOCK_UNKNOWN_VARIANTS"),
  v2Diff: flag("ACP_MOCK_V2_DIFF"),
  v2Management: flag("ACP_MOCK_V2_MANAGEMENT"),
});

type MockPeerConfig = Config.Success<typeof MockPeerConfig>;

const writeStdout = (text: string) => Effect.sync(() => process.stdout.write(text));
const exitWith = (code: number) => Effect.sync(() => process.exit(code));

// Runs before the agent starts, so the prefix precedes every protocol frame.
const preflight = Effect.fnUntraced(function* (config: MockPeerConfig) {
  yield* O.match(config.stdoutPrefix, { onNone: () => Effect.void, onSome: writeStdout });
  if (config.malformedOutput) {
    yield* writeStdout("{not-json}\n");
    return yield* exitWith(config.malformedOutputExitCode);
  }
  yield* O.match(config.exitImmediatelyCode, { onNone: () => Effect.void, onSome: exitWith });
});

const authMethods = (config: MockPeerConfig) => {
  if (config.customAuth) {
    return { authMethods: [{ type: "custom_future", methodId: "custom", name: "Future auth" }] };
  }
  if (config.envVarAuth) {
    return {
      authMethods: [
        {
          type: "env_var",
          methodId: "api_key",
          name: "API key",
          vars: [{ name: "MOCK_API_KEY", label: "Mock API key" }],
          link: "https://example.test/keys",
        },
      ],
    };
  }
  return {};
};

const runMcpOverAcp = Effect.fnUntraced(function* (agent: AcpAgent.AcpAgentShape) {
  const connected = yield* agent.client.connectMcp({ serverId: "test-server" });
  yield* agent.client.messageMcp({ connectionId: connected.connectionId, method: "tools/list" });
  yield* agent.client.notifyMcp({ connectionId: connected.connectionId, method: "notifications/initialized" });
  yield* agent.client.disconnectMcp({ connectionId: connected.connectionId });
});

const sendUnknownVariants = Effect.fnUntraced(function* (agent: AcpAgent.AcpAgentShape) {
  yield* agent.client.sessionUpdate({
    sessionId,
    update: {
      sessionUpdate: "agent_message_chunk",
      messageId: "future-content",
      content: { type: "chart", points: [] },
    },
  });
  yield* agent.client.sessionUpdate({ sessionId, update: { sessionUpdate: "timeline_update", entries: [] } });
});

const sendDiff = (agent: AcpAgent.AcpAgentShape) =>
  agent.client.sessionUpdate({
    sessionId,
    update: {
      sessionUpdate: "tool_call_update",
      toolCallId: "tool-diff",
      content: [
        {
          type: "diff",
          changes: [
            {
              operation: "move",
              oldPath: "/workspace/old.ts",
              path: "/workspace/new.ts",
              fileType: "text",
              mimeType: "text/typescript",
            },
          ],
          patch: {
            format: "git_patch",
            text: "diff --git a/old.ts b/new.ts\nsimilarity index 100%\nrename from old.ts\nrename to new.ts\n",
          },
        },
      ],
    },
  });

const runPrompt = Effect.fnUntraced(function* (agent: AcpAgent.AcpAgentShape, config: MockPeerConfig) {
  if (config.mcpOverAcp) {
    yield* runMcpOverAcp(agent);
  }
  if (config.unknownVariants) {
    yield* sendUnknownVariants(agent);
  }

  yield* agent.client.requestPermission({
    sessionId,
    title: "Read project files",
    options: [{ optionId: "allow", name: "Allow", kind: "allow_once" }],
    subject: { type: "tool_call", toolCall: { toolCallId: "tool-1", title: "Read project files" } },
  });

  yield* agent.client.elicit({
    sessionId,
    message: "Need confirmation before continuing.",
    mode: "form",
    requestedSchema: {
      type: "object",
      title: "Need confirmation",
      properties: { approved: { type: "boolean", title: "Approved" } },
      required: ["approved"],
    },
  });

  yield* agent.client.sessionUpdate({
    sessionId,
    update: {
      sessionUpdate: "plan_update",
      plan: {
        type: "items",
        planId: "mock-plan",
        entries: [{ content: "Inspect the repository", priority: "high", status: "in_progress" }],
      },
    },
  });

  if (config.v2Diff) {
    yield* sendDiff(agent);
  }

  yield* agent.client.elicitationComplete({ elicitationId: "elicitation-1" });
  yield* agent.client.extRequest("x/typed_request", {
    message: config.badTypedRequest ? 123 : "hello from typed request",
  });
  yield* agent.client.extNotification("x/typed_notification", { count: 2 });
  yield* agent.client.sessionUpdate({
    sessionId,
    update: { sessionUpdate: "state_update", state: "idle", stopReason: "end_turn" },
  });
  return {};
});

const registerHandlers = Effect.fnUntraced(function* (config: MockPeerConfig) {
  const agent = yield* AcpAgent.AcpAgent;

  yield* agent.handleInitialize(() =>
    Effect.succeed({
      protocolVersion: 2,
      capabilities: {
        session: {
          ...(config.v2Management ? { delete: {} } : {}),
          ...(config.mcpOverAcp ? { mcp: { acp: {} } } : {}),
        },
        ...(config.v2Management ? { providers: {} } : {}),
      },
      info: { name: "mock-agent", version: "0.0.0" },
      ...authMethods(config),
    })
  );
  yield* agent.handleAuthenticate(() => Effect.succeed({}));
  yield* agent.handleLogout(() => Effect.succeed({}));
  yield* agent.handleCreateSession(() => Effect.succeed({ sessionId }));
  yield* agent.handleLoadSession(() => Effect.succeed({}));
  yield* agent.handleListSessions(() => Effect.succeed({ sessions: [{ sessionId, cwd: process.cwd() }] }));
  yield* agent.handleDeleteSession(() => Effect.succeed({}));
  yield* agent.handleListProviders(() =>
    Effect.succeed({
      providers: [{ providerId: "mock-provider", supported: ["openai"], required: false, current: null }],
    })
  );
  yield* agent.handleSetProvider(() => Effect.succeed({}));
  yield* agent.handleDisableProvider(() => Effect.succeed({}));
  yield* agent.handlePrompt(() => runPrompt(agent, config));
  yield* agent.handleUnknownExtRequest((method, params) =>
    Effect.succeed({ echoedMethod: method, echoedParams: params ?? null })
  );
});

const main = Effect.gen(function* () {
  const config = yield* MockPeerConfig;
  yield* preflight(config);
  return yield* Layer.effectDiscard(registerHandlers(config)).pipe(
    Layer.provide(AcpAgent.layerStdio()),
    Layer.provide(NodeServices.layer),
    Layer.launch
  );
});

NodeRuntime.runMain(main);

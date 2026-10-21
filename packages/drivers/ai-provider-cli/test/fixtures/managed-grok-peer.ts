import { AcpRequestError } from "@beep/acp/errors";
import * as SchemaV1 from "@beep/acp/schema-v1";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Ref from "effect/Ref";
import * as Str from "effect/String";
import { decodeV1, initializeV1, replyV1, runManagedV1Peer } from "./managed-acp-v1-peer.ts";
import { fixtureMode } from "./session-options.ts";
import type { ManagedV1Peer, ManagedV1Route } from "./managed-acp-v1-peer.ts";

const permissionPrefix = "permission:";
const offeredToolName = (testCase: string) =>
  testCase === "wrong-server"
    ? "foreign__agent_message_acknowledge"
    : testCase === "builtin"
      ? "shell"
      : testCase === "unknown"
        ? "peer__unknown"
        : "peer__agent_message_acknowledge";

const routes = Effect.fnUntraced(function* (peer: ManagedV1Peer) {
  const authenticated = yield* Ref.make(false);
  const answerText = Effect.fnUntraced(function* (sessionId: string, text: string) {
    if (!Str.startsWith(permissionPrefix)(text)) return yield* peer.sendText(sessionId, text);
    const testCase = Str.slice(permissionPrefix.length)(text);
    const decision = yield* peer.requestPermission({
      sessionId: testCase === "wrong-session" ? "foreign-session" : sessionId,
      toolCall: {
        toolCallId: "synthetic-tool",
        title: "synthetic",
        rawInput: { tool_name: offeredToolName(testCase) },
      },
      options: [{ optionId: "allow", name: "Allow once", kind: "allow_once" }],
    });
    yield* peer.sendText(sessionId, decision.outcome.outcome);
  });
  const prompt: ManagedV1Route = Effect.fnUntraced(function* (params) {
    const request = yield* decodeV1(SchemaV1.PromptRequest)(params);
    // The process reports a credential failure on stderr and ends while the client still waits
    // for the prompt result.
    if (fixtureMode === "exit-on-prompt") {
      const home = yield* Config.String("HOME").pipe(Effect.orDie);
      return yield* Effect.callback<never>(() => {
        process.stderr.write(`fatal: ${home}/.grok/auth.json rejected Bearer synthetic-secret-token\n`, () =>
          process.exit(3)
        );
      });
    }
    for (const block of request.prompt) {
      if (block.type === "text") yield* answerText(request.sessionId, block.text);
    }
    return yield* replyV1(SchemaV1.PromptResponse)({ stopReason: "end_turn" });
  });
  // Grok's headless managed login is the generation-1 `cached_token` method; anything else is refused.
  const authenticate: ManagedV1Route = (params) =>
    peer.checkpoint("authenticate").pipe(
      Effect.andThen(decodeV1(SchemaV1.AuthenticateRequest)(params)),
      Effect.filterOrFail(
        (request) => request.methodId === "cached_token",
        () => AcpRequestError.invalidParams("Unsupported authentication method.")
      ),
      Effect.andThen(Ref.set(authenticated, true)),
      Effect.andThen(replyV1(SchemaV1.AuthenticateResponse)({}))
    );
  return HashMap.make(
    ["initialize", initializeV1(peer)],
    ["authenticate", authenticate],
    [
      "session/new",
      (params: unknown) =>
        peer.checkpoint("session/new").pipe(
          Effect.andThen(decodeV1(SchemaV1.NewSessionRequest)(params)),
          Effect.andThen(Ref.get(authenticated)),
          Effect.flatMap((isAuthenticated) =>
            replyV1(SchemaV1.NewSessionResponse)({
              sessionId: isAuthenticated ? "owned-grok" : "unauthenticated",
              // The removed unstable model-selection API, which the managed policy readback still reads.
              models: {
                currentModelId: fixtureMode === "wrong-model" ? "foreign" : "grok-4.7",
                availableModels: A.make({ modelId: "grok-4.7", name: "synthetic" }),
              },
              configOptions: [
                {
                  id: "reasoning_effort",
                  name: "Effort",
                  type: "select",
                  currentValue: fixtureMode === "wrong-effort" ? "high" : "medium",
                  options: [{ value: "medium", name: "Medium" }],
                },
              ],
            })
          )
        ),
    ],
    [
      "session/set_mode",
      (params: unknown) =>
        peer
          .checkpoint("session/set_mode")
          .pipe(
            Effect.andThen(decodeV1(SchemaV1.SetSessionModeRequest)(params)),
            Effect.andThen(replyV1(SchemaV1.SetSessionModeResponse)({}))
          ),
    ],
    ["session/prompt", prompt]
  );
});

runManagedV1Peer(routes);

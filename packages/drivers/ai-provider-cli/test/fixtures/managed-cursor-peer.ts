import * as SchemaV1 from "@beep/acp/schema-v1";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import { decodeV1, replyV1, runManagedV1Peer } from "./managed-acp-v1-peer.ts";
import { fixtureMode } from "./session-options.ts";
import type { ManagedV1Peer, ManagedV1Route } from "./managed-acp-v1-peer.ts";

const model = "claude-opus-5-5[context=300k,effort=medium,fast=false]";
const denial =
  fixtureMode === "quoted-denial"
    ? 'The documentation says "Upgrade your plan to continue"; this is quoted output.'
    : "Upgrade your plan to continue";

const routes = (peer: ManagedV1Peer) => {
  const prompt: ManagedV1Route = Effect.fnUntraced(function* (params) {
    const request = yield* decodeV1(SchemaV1.PromptRequest)(params);
    yield* peer.sendText(request.sessionId, denial);
    return yield* replyV1(SchemaV1.PromptResponse)({ stopReason: "end_turn" });
  });
  return Effect.succeed(
    HashMap.make(
      [
        "initialize",
        () =>
          peer
            .checkpoint("initialize")
            .pipe(Effect.andThen(replyV1(SchemaV1.InitializeResponse)({ protocolVersion: 1, agentCapabilities: {} }))),
      ],
      [
        "session/new",
        () =>
          peer.checkpoint("session/new").pipe(
            Effect.andThen(
              replyV1(SchemaV1.NewSessionResponse)({
                sessionId: "owned-cursor",
                // The removed unstable model-selection API, which the managed policy readback still reads.
                models: {
                  currentModelId: fixtureMode === "wrong-model" ? "foreign" : model,
                  availableModels: A.make({ modelId: model, name: "synthetic" }),
                },
              })
            )
          ),
      ],
      [
        "session/set_mode",
        () => peer.checkpoint("session/set_mode").pipe(Effect.andThen(replyV1(SchemaV1.SetSessionModeResponse)({}))),
      ],
      ["session/prompt", prompt]
    )
  );
};

runManagedV1Peer(routes);

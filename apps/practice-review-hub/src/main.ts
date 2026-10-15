import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunServices from "@effect/platform-bun/BunServices";
import { Command } from "effect/cli";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { decodeReviewHubConfig, reviewHubFlags } from "./Config.ts";
import { makeReviewHubServer } from "./runtime/Layer.ts";

// One command: resolve the settings from flags or the environment, then serve
// until interrupted. Portless injects PORT for practice-review-hub.beep.localhost.
const serve = Command.make("practice-review-hub", reviewHubFlags, (flags) =>
  Effect.flatMap(decodeReviewHubConfig(flags), (config) => Layer.launch(makeReviewHubServer(config)))
);

Layer.effectDiscard(Command.run(serve, { version: "0.0.0" })).pipe(
  Layer.provide(BunServices.layer),
  Layer.build,
  Effect.scoped,
  BunRuntime.runMain
);

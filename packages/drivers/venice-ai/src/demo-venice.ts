import {BunRuntime} from "@effect/platform-bun";
import {Console, Effect, Layer, pipe} from "effect";
import {
  VENICE_CHAT_MODEL, VENICE_FAVORITE_JOKE_PROMPT, VeniceAiChat,
} from "./VeniceAI.service.ts";

const program = Effect.gen(function* () {
  const venice = yield* VeniceAiChat;
  const response = yield* venice.chat(VENICE_FAVORITE_JOKE_PROMPT);

  yield* Console.log(`Model: ${VENICE_CHAT_MODEL}`);
  yield* Console.log(`You: ${VENICE_FAVORITE_JOKE_PROMPT}`);
  yield* Console.log(`Venice: ${response}`);
});

const main = Effect.scoped(pipe(
  VeniceAiChat.layer,
  Layer.build,
  Effect.flatMap((context) => program.pipe(Effect.provide(context))),
))


BunRuntime.runMain(main);

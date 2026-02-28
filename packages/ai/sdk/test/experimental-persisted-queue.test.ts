import * as PersistedQueue from "@beep/ai-sdk/experimental/PersistedQueue";
import { makeUserMessage } from "@beep/ai-sdk/internal/messages";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";

test("PersistedQueue input adapter yields offered messages", async () => {
  const message = makeUserMessage("hello");
  const queueName = `test-queue-${Date.now()}`;
  const queue = await Effect.runPromise(
    PersistedQueue.makeUserMessageQueue({ name: queueName }).pipe(Effect.provide(PersistedQueue.layerMemory))
  );
  const adapter = await Effect.runPromise(PersistedQueue.makeInputAdapter(queue));

  await Effect.runPromise(adapter.send(message));

  const iterator = adapter.input[Symbol.asyncIterator]();
  const result = await iterator.next();
  await iterator.return?.();

  expect(result.value).toEqual(message);
});

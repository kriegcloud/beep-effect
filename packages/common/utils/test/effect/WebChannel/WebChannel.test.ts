import * as TestKit from "@beep/testkit";
import * as WebChannel from "@beep/utils/browser/WebChannelBrowser.ts";
import { Effect, Schema, Stream } from "effect";
import { JSDOM } from "jsdom";

TestKit.describe("WebChannel", () => {
  TestKit.describe("windowChannel", () => {
    TestKit.scopedLive("should work with 2 windows", () =>
      Effect.gen(function* () {
        const windowA = new JSDOM().window as unknown as globalThis.Window;
        const windowB = new JSDOM().window as unknown as globalThis.Window;

        const codeSideA = Effect.gen(function* () {
          const channelToB = yield* WebChannel.windowChannel({
            listenWindow: windowA,
            sendWindow: windowB,
            ids: { own: "a", other: "b" },
            schema: Schema.Number,
          });

          const msgFromBFiber = yield* channelToB.listen.pipe(
            Stream.flatten(),
            Stream.runHead,
            Effect.flatten,
            Effect.fork
          );

          yield* channelToB.send(1);

          TestKit.expect(yield* msgFromBFiber).toEqual(2);
        });

        const codeSideB = Effect.gen(function* () {
          const channelToA = yield* WebChannel.windowChannel({
            listenWindow: windowB,
            sendWindow: windowA,
            ids: { own: "b", other: "a" },
            schema: Schema.Number,
          });

          const msgFromAFiber = yield* channelToA.listen.pipe(
            Stream.flatten(),
            Stream.runHead,
            Effect.flatten,
            Effect.fork
          );

          yield* channelToA.send(2);

          TestKit.expect(yield* msgFromAFiber).toEqual(1);
        });

        yield* Effect.all([codeSideA, codeSideB], { concurrency: "unbounded" });
      })
    );

    TestKit.scopedLive("should work with the same window", () =>
      Effect.gen(function* () {
        const window = new JSDOM().window as unknown as globalThis.Window;

        const codeSideA = Effect.gen(function* () {
          const channelToB = yield* WebChannel.windowChannel({
            listenWindow: window,
            sendWindow: window,
            ids: { own: "a", other: "b" },
            schema: Schema.Number,
          });

          const msgFromBFiber = yield* channelToB.listen.pipe(
            Stream.flatten(),
            Stream.runHead,
            Effect.flatten,
            Effect.fork
          );

          yield* channelToB.send(1);

          TestKit.expect(yield* msgFromBFiber).toEqual(2);
        });

        const codeSideB = Effect.gen(function* () {
          const channelToA = yield* WebChannel.windowChannel({
            listenWindow: window,
            sendWindow: window,
            ids: { own: "b", other: "a" },
            schema: Schema.Number,
          });

          const msgFromAFiber = yield* channelToA.listen.pipe(
            Stream.flatten(),
            Stream.runHead,
            Effect.flatten,
            Effect.fork
          );

          yield* channelToA.send(2);

          TestKit.expect(yield* msgFromAFiber).toEqual(1);
        });

        yield* Effect.all([codeSideA, codeSideB], { concurrency: "unbounded" });
      })
    );
  });
});

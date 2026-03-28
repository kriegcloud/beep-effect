import { Effect, Semaphore, Sink, Stream } from "effect";
import type { SDKMessage, SDKUserMessage } from "../Schema/Message.js";
import type { SessionError } from "../Session.js";

const isTurnTerminalMessage = (message: SDKMessage) => message.type === "result";

const turnBoundarySink = Sink.takeUntil(isTurnTerminalMessage);

const takeTurn = (stream: Stream.Stream<SDKMessage, SessionError>) =>
  stream.pipe(
    Stream.transduce(turnBoundarySink),
    Stream.take(1),
    Stream.flatMap((messages) => Stream.fromIterable(messages))
  );

/**
 * @since 0.0.0
 */
export const makeTurnStream = (
  _label: string,
  send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>,
  stream: Stream.Stream<SDKMessage, SessionError>
) =>
  Effect.gen(function* () {
    const turnLock = yield* Semaphore.make(1);

    return (message: string | SDKUserMessage) =>
      Stream.unwrap(
        Effect.gen(function* () {
          yield* turnLock.take(1);
          yield* Effect.addFinalizer(() => turnLock.release(1));
          yield* send(message);
          return takeTurn(stream);
        })
      );
  });

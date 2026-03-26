import { Effect } from "effect";
import * as O from "effect/Option";
import * as SocketServer from "effect/unstable/socket/SocketServer";
import { describe, expect, it } from "vitest";
import { DevToolsRelayService, makeDevToolsRelayService } from "../src/experimental/server/index.ts";

const fakeSocketServer = SocketServer.SocketServer.of({
  address: {
    _tag: "TcpAddress",
    hostname: "127.0.0.1",
    port: 3437,
  },
  run: () => Effect.never,
});

describe("DevToolsRelay", () => {
  it("ingests spans, events, and metrics snapshots", async () => {
    const snapshot = await Effect.runPromise(
      Effect.gen(function* () {
        const relay = yield* DevToolsRelayService;

        yield* relay.ingest({
          _tag: "Span",
          spanId: "span-1",
          traceId: "trace-1",
          name: "example",
          sampled: true,
          attributes: new Map(),
          status: {
            _tag: "Started",
            startTime: 1n,
          },
          parent: O.none(),
        });
        yield* relay.ingest({
          _tag: "SpanEvent",
          traceId: "trace-1",
          spanId: "span-1",
          name: "tick",
          startTime: 2n,
          attributes: undefined,
        });
        yield* relay.ingest({
          _tag: "MetricsSnapshot",
          metrics: [],
        });

        return yield* relay.snapshot;
      }).pipe(
        Effect.provideServiceEffect(DevToolsRelayService, makeDevToolsRelayService),
        Effect.provideService(SocketServer.SocketServer, fakeSocketServer)
      )
    );

    expect(snapshot.spanCount).toBe(1);
    expect(snapshot.spanEventCount).toBe(1);
    expect(snapshot.metricCount).toBe(0);
  });
});

/**
 * Bun sidecar entry for the desktop chat surface.
 *
 * SPEC (increment 6b-3): serve the {@link ChatRpcs} group over rpc-on-http
 * (ndjson) on loopback `:3939`, backed by the app-local {@link RuntimeLive}
 * runtime (live assistant-turn kernel + Drizzle ThreadStore + Drizzle
 * usage-record sink, all over one PGlite-backed database with migrations applied
 * on boot). This is the same rpc-over-http idiom as the POC `server/main.ts`:
 * `RpcServer.layer` over `RpcServer.layerProtocolHttp({ path: "/rpc" })` +
 * `RpcSerialization.layerNdjson`, served by the Bun HTTP server with permissive
 * CORS and a generous `idleTimeout` so streamed turns are not severed during
 * silent tails.
 *
 * Run keyless for dev with `bun run dev:sidecar` (sets `CHAT_AGENT=fixture`); the
 * default `CHAT_AGENT=anthropic` requires `AI_ANTHROPIC_API_KEY`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ChatRpcs } from "@beep/agents-use-cases/public";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { RuntimeLive } from "@/runtime/Layer";

// Loopback rpc port; defaults to 3939 (the desktop chat surface's sidecar
// port). Configurable via CHAT_SIDECAR_PORT for tests/dev that need a free port.
const PORT = Effect.runSync(Config.port("CHAT_SIDECAR_PORT").pipe(Config.withDefault(3939)));

// All route registrations resolve to the module-level HttpRouter.layer via layer
// memoization, so the rpc protocol and the CORS middleware share one router with
// HttpRouter.serve.
const Protocol = RpcServer.layerProtocolHttp({ path: "/rpc" }).pipe(Layer.provide(HttpRouter.layer));

const App = Layer.mergeAll(
  Protocol,
  HttpRouter.cors({
    allowedOrigins: ["*"],
    allowedMethods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["*"],
  }).pipe(Layer.provide(HttpRouter.layer))
);

const Main = RpcServer.layer(ChatRpcs).pipe(
  // RuntimeLive fully provides the ChatRpcs handler group
  // (AgentTurnKernel | ThreadStore | UsageRecordSink), so only the rpc/http
  // transport remains to be added here.
  Layer.provide(RuntimeLive),
  Layer.provideMerge(App),
  Layer.provide(HttpRouter.serve(App)),
  // Bun's default 10s idleTimeout severs streamed responses during the silent
  // tail of a turn (no bytes flow while the kernel thinks); 255s is Bun's max
  // and covers the turn budget. Mirrors the POC.
  Layer.provide(BunHttpServer.layer({ port: PORT, idleTimeout: 255 })),
  Layer.provide(RpcSerialization.layerNdjson)
);

BunRuntime.runMain(Layer.launch(Main));

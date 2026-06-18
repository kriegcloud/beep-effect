/**
 * Sidecar IPC-transport stdio round-trip (gated).
 *
 * Spawns the REAL bun sidecar in ipc mode (`CHAT_TRANSPORT=ipc`, keyless
 * `CHAT_AGENT=fixture`) and bridges the child's stdio into an Effect
 * {@link Socket} — exactly what `src-tauri/src/lib.rs` does, but from Node, so no
 * Tauri runtime is required. Driving {@link ChatRpcs} over
 * `RpcClient.layerProtocolSocket` then proves the `RpcServer.layerProtocolStdio`
 * server ↔ socket client ndjson framing carries a streaming `SendMessage` across
 * a real OS pipe (logs ride stderr, so stdout stays a clean frame stream).
 *
 * The in-process handler/streaming proof lives in `sidecar-smoke.test.ts`; this
 * suite is specifically the transport proof. Gated on `BEEP_TEST_SIDECAR_IPC=1`
 * (it builds a PGlite db and boots a subprocess), opt-in like the other
 * integration suites.
 */

// Node builtins are used for test fixture setup (a throwaway PGlite dir).
// @effect-diagnostics-next-line nodeBuiltinImport:off
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
// @effect-diagnostics-next-line nodeBuiltinImport:off
import { join } from "node:path";
import { ChatRpcs } from "@beep/agents-use-cases/public";
import * as Md from "@beep/md/Md.model";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { describe, expect, it } from "@effect/vitest";
import { Chunk, Effect, Layer } from "effect";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { Socket } from "effect/unstable/socket";

const shouldRun = Bun.env.BEEP_TEST_SIDECAR_IPC === "1";

const decodeWorkspaceId = S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId);
const userDocument = (text: string): Md.Document.Type =>
  Md.Document.make({ children: [Md.P.make({ children: [Md.Text.make({ value: text })] })] });

const ipcStdio = Effect.gen(function* () {
  const dbDir = mkdtempSync(join(tmpdir(), "ipc-stdio-"));

  // Boot the real sidecar; kill it when the scope closes.
  const proc = yield* Effect.acquireRelease(
    Effect.sync(() =>
      Bun.spawn(["bun", "run", "server/main.ts"], {
        cwd: process.cwd(),
        env: { ...process.env, CHAT_TRANSPORT: "ipc", CHAT_AGENT: "fixture", CHAT_DB_PATH: dbDir },
        stdin: "pipe",
        stdout: "pipe",
        stderr: "inherit",
      })
    ),
    (child) => Effect.sync(() => child.kill())
  );

  // Bridge the child's stdio into an Effect Socket: stdout → inbound frames,
  // stdin ← outbound frames (verbatim ndjson, encoded UTF-8 by fromTransformStream).
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      proc.stdin.write(chunk);
      proc.stdin.flush();
    },
  });
  const socketStream: Socket.InputTransformStream = { readable: proc.stdout, writable };
  const SocketLive = Layer.effect(Socket.Socket, Socket.fromTransformStream(Effect.sync(() => socketStream)));
  const ProtocolLive = RpcClient.layerProtocolSocket().pipe(Layer.provide([RpcSerialization.layerNdjson, SocketLive]));

  const program = Effect.gen(function* () {
    const client = yield* RpcClient.make(ChatRpcs);
    const workspaceId = decodeWorkspaceId(1);

    const thread = yield* client.CreateThread({ workspaceId, title: "ipc stdio" });
    expect(thread.title).toBe("ipc stdio");

    const blocks = yield* client
      .SendMessage({ threadId: thread.id, content: userDocument("hello over stdio") })
      .pipe(Stream.runCollect, Effect.map(Chunk.fromIterable));
    expect(Chunk.size(blocks)).toBeGreaterThan(0);
    // @effect-diagnostics-next-line strictEffectProvide:off
  }).pipe(Effect.scoped, Effect.provide(ProtocolLive));

  // PGlite migrations run on boot, so give the first round-trip headroom.
  yield* program.pipe(Effect.timeout("30 seconds"));
}).pipe(Effect.scoped);

if (!shouldRun) {
  describe.skip("Professional desktop sidecar ipc stdio (set BEEP_TEST_SIDECAR_IPC=1)", () => {});
} else {
  describe("Professional desktop sidecar ipc stdio", { concurrent: false }, () => {
    it.effect("streams a fixture turn over the stdio rpc transport", () => ipcStdio);
  });
}

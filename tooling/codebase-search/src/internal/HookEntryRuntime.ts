import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";

export const HookEntryPlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

export const readStdinWithIdleTimeout = (idleTimeoutMs = 250): Effect.Effect<string> =>
  Effect.callback<string>((resume) => {
    const chunks = A.empty<Buffer>();
    let resolved = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = (): void => {
      process.stdin.off("data", onData);
      process.stdin.off("end", onEnd);
      process.stdin.off("error", onError);
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer);
      }
    };

    const resolve = (): void => {
      if (resolved) {
        return;
      }
      resolved = true;
      cleanup();
      resume(Effect.succeed(Buffer.concat(chunks).toString("utf8")));
    };

    const scheduleIdleResolve = (): void => {
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(resolve, idleTimeoutMs);
    };

    const onData = (chunk: string | Buffer): void => {
      chunks.push(Buffer.from(chunk));
      scheduleIdleResolve();
    };

    const onEnd = (): void => {
      resolve();
    };

    const onError = (): void => {
      resolve();
    };

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", onData);
    process.stdin.on("end", onEnd);
    process.stdin.on("error", onError);

    // Resolve empty payloads quickly when stdin provides no data.
    scheduleIdleResolve();
  });

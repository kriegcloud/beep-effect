import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Stdio from "effect/Stdio";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { fixtureMode } from "./session-options.ts";

const Frame = S.Struct({
  type: S.String,
  request_id: S.optionalKey(S.String),
  message: S.optionalKey(S.Struct({ content: S.String })),
});
const encode = S.encodeEffect(S.fromJsonString(S.Unknown));
const Startup = S.Struct({ restricted: S.Literal(true), safeMode: S.Literal(false), settingSources: S.Literal("") });
const Settings = S.Struct({ claudeMdExcludes: S.Tuple([S.Literal("**")]), autoMemoryEnabled: S.Literal(false) });
const JsonSettings = S.fromJsonString(Settings);
const JsonFrame = S.fromJsonString(Frame);
const decodeSettings = S.decodeUnknownEffect(JsonSettings);
const decodeFrame = S.decodeEffect(JsonFrame);
const program = Effect.gen(function* () {
  const mode = fixtureMode;
  const home = yield* Config.String("HOME");
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const stdio = yield* Stdio.Stdio;
  const sessionId = process.argv[process.argv.indexOf("--session-id") + 1];
  yield* S.decodeUnknownEffect(Startup)({
    restricted: process.argv.includes("--restricted"),
    safeMode: process.argv.includes("--safe-mode"),
    settingSources: process.argv[process.argv.indexOf("--setting-sources") + 1],
  }).pipe(Effect.orDie);
  yield* decodeSettings(process.argv[process.argv.indexOf("--settings") + 1]).pipe(Effect.orDie);
  const emit = (value: unknown) =>
    encode(value).pipe(Effect.flatMap((line) => Stream.make(`${line}\n`).pipe(Stream.run(stdio.stdout()))));
  yield* stdio.stdin.pipe(
    Stream.decodeText(),
    Stream.splitLines,
    Stream.runForEach((line) =>
      Effect.gen(function* () {
        const frame = yield* decodeFrame(line);
        if (frame.type === "control_request") {
          if (mode === "active-exit" && frame.request_id === "beep-interrupt") process.exit(0);
          yield* emit({
            type: "control_response",
            response: {
              subtype: "success",
              request_id: "beep-initialize",
              response: { current_permission_mode: "dontAsk" },
            },
          });
        } else if (frame.type === "user") {
          if (mode === "idle-exit" || mode === "active-exit")
            yield* fs.writeFileString(path.join(home, "received-prompt"), frame.message?.content ?? "");
          if (mode === "oversized")
            return yield* Stream.make(Str.repeat(1048577)("x")).pipe(Stream.run(stdio.stdout()));
          if (mode === "no-init") {
            yield* emit({ type: "result", subtype: "success", is_error: false, session_id: sessionId });
            return;
          }
          yield* emit({
            type: "system",
            subtype: "init",
            session_id: sessionId,
            model: "claude-opus-5-5",
            permissionMode: mode === "wrong-policy" ? "default" : "dontAsk",
          });
          if (mode === "active-exit") return;
          if (mode === "control") {
            yield* emit({ type: "control_request", request_id: "synthetic-denied", request: {} });
          }
          if (mode === "unknown") yield* emit({ unrelated: true });
          yield* emit({
            type: "result",
            subtype: "success",
            is_error: mode === "error",
            session_id: mode === "wrong-session" ? "foreign" : sessionId,
            ...(mode === "empty-result" ? {} : { result: frame.message?.content ?? "" }),
          });
          if (mode === "idle-exit") process.exit(0);
        }
      })
    )
  );
});
NodeServices.layer.pipe(
  Layer.build,
  Effect.flatMap((context) => program.pipe(Effect.provide(context))),
  Effect.scoped,
  NodeRuntime.runMain
);

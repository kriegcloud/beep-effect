import { CaptureCommandTimedOutError, runSpooledStreams } from "@beep/repo-cli/test/Process";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })(
  "private complete trial streams",
  (it) => {
    it.effect("retains both streams beyond bounded capture and protects file modes", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const directory = yield* fs.makeTempDirectoryScoped();
          const stdoutPath = path.join(directory, "out");
          const stderrPath = path.join(directory, "err");
          const exit = yield* runSpooledStreams({
            command: process.execPath,
            args: ["-e", "process.stdout.write('x'.repeat(200000));process.stderr.write('y'.repeat(180000))"],
            stdoutPath,
            stderrPath,
            timeout: "10 seconds",
          });
          expect(exit).toBe(0);
          expect((yield* fs.readFile(stdoutPath)).length).toBe(200000);
          expect((yield* fs.readFile(stderrPath)).length).toBe(180000);
          expect((yield* fs.stat(stdoutPath)).mode & 0o777).toBe(0o600);
          expect((yield* fs.stat(stderrPath)).mode & 0o777).toBe(0o600);
          const duplicate = yield* runSpooledStreams({ command: "/bin/true", args: [], stdoutPath, stderrPath }).pipe(
            Effect.result
          );
          expect(duplicate._tag).toBe("Failure");
          expect((yield* fs.readFile(stdoutPath)).length).toBe(200000);
        })
      )
    );
    it.effect(
      "retains partial output and kills a child that ignores TERM at deadline",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const directory = yield* fs.makeTempDirectoryScoped();
            const stdoutPath = path.join(directory, "out");
            const stderrPath = path.join(directory, "err");
            const result = yield* runSpooledStreams({
              command: process.execPath,
              args: ["-e", "process.on('SIGTERM',()=>{});process.stdout.write('retained');setInterval(()=>{},1000)"],
              stdoutPath,
              stderrPath,
              timeout: "300 millis",
              forceKillAfter: "100 millis",
            }).pipe(Effect.result);
            expect(result._tag).toBe("Failure");
            if (result._tag === "Failure") expect(result.failure).toBeInstanceOf(CaptureCommandTimedOutError);
            expect(yield* fs.readFileString(stdoutPath)).toBe("retained");
          })
        ),
      { timeout: 10000 }
    );
  }
);

import { CaptureCommandTimedOutError, runSpooledStreams } from "@beep/repo-cli/test/Process";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as Stream from "effect/Stream";

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })(
  "private complete trial streams",
  (it) => {
    it.effect("waits for late stdin chunks and fails a producer even when the child exits zero", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const input = `${root}/input`;
          yield* fs.writeFileString(input, "first\0last\0");
          const data = yield* fs.readFile(input);
          const stream = Stream.concat(
            Stream.succeed(data.slice(0, 6)),
            Stream.fromEffect(Effect.sleep("50 millis").pipe(Effect.as(data.slice(6))))
          );
          const code = yield* runSpooledStreams({
            command: process.execPath,
            args: [
              "-e",
              "process.stdin.on('data',b=>process.stdout.write(b));process.stdin.on('end',()=>process.exit(0))",
            ],
            stdinStream: stream,
            stdoutPath: `${root}/out`,
            stderrPath: `${root}/err`,
            timeout: "5 seconds",
          });
          expect(code).toBe(0);
          expect(yield* fs.readFileString(`${root}/out`)).toBe("first\0last\0");
          const failed = yield* runSpooledStreams({
            command: process.execPath,
            args: ["-e", "process.stdout.write('child-zero');process.exit(0)"],
            stdinStream: Stream.fromEffect(
              Effect.sleep("200 millis").pipe(Effect.andThen(fs.readFile(`${root}/missing`)))
            ),
            stdoutPath: `${root}/failed-out`,
            stderrPath: `${root}/failed-err`,
            timeout: "5 seconds",
          }).pipe(Effect.result);
          expect(failed._tag).toBe("Failure");
          expect(yield* fs.readFileString(`${root}/failed-out`)).toBe("child-zero");
          const early = yield* runSpooledStreams({
            command: process.execPath,
            args: [
              "-e",
              "require('node:fs').closeSync(0);process.stdout.write('early-close');setTimeout(()=>process.exit(0),500)",
            ],
            stdinStream: Stream.fromEffect(Effect.sleep("150 millis").pipe(Effect.as(new Uint8Array(1024 * 1024)))),
            stdoutPath: `${root}/early-out`,
            stderrPath: `${root}/early-err`,
            timeout: "5 seconds",
          }).pipe(Effect.result);
          expect(early._tag).toBe("Failure");
          expect(yield* fs.readFileString(`${root}/early-out`)).toBe("early-close");
          const timeout = yield* runSpooledStreams({
            command: process.execPath,
            args: ["-e", "process.stdout.write('partial');setInterval(()=>{},1000)"],
            stdinStream: Stream.never,
            stdoutPath: `${root}/timeout-out`,
            stderrPath: `${root}/timeout-err`,
            timeout: "300 millis",
            forceKillAfter: "100 millis",
          }).pipe(Effect.result);
          expect(timeout._tag).toBe("Failure");
          expect(yield* fs.readFileString(`${root}/timeout-out`)).toBe("partial");
        })
      )
    );
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

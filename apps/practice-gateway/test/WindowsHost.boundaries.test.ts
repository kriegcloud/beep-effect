import { MemoryFileSystem } from "@beep/memfs/MemoryFileSystem";
import { WindowsHostFailure } from "@beep/practice-gateway/PracticeGateway.errors";
import { WindowsHost, YesNoQuestion } from "@beep/practice-gateway/WindowsHost";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import { settingsLayer } from "./fixtures.ts";
import type * as Context from "effect/Context";

const question = YesNoQuestion.make({
  title: 'Practice "gateway"',
  message: "Install Box Drive?\nKeep 'quoted' text as data.",
});

const handle = (stdout: string, exitCode: number) =>
  ChildProcessSpawner.makeHandle({
    all: Stream.empty,
    exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(exitCode)),
    getInputFd: () => Sink.drain,
    getOutputFd: () => Stream.empty,
    isRunning: Effect.succeed(false),
    kill: () => Effect.void,
    pid: ChildProcessSpawner.ProcessId(1),
    stderr: Stream.empty,
    stdin: Sink.drain,
    stdout: Stream.make(new TextEncoder().encode(stdout)),
    unref: Effect.succeed(Effect.void),
  });

const hostLayer = (spawner: Context.Service.Shape<typeof ChildProcessSpawner.ChildProcessSpawner>, isWindows = true) =>
  WindowsHost.layer.pipe(
    Layer.provide(
      Layer.mergeAll(
        MemoryFileSystem.layer,
        settingsLayer({ isWindows }),
        Layer.succeed(ChildProcessSpawner.ChildProcessSpawner, spawner)
      )
    )
  );

const ask = WindowsHost.use((host) => host.askYesNo(question));

const successfulSpawner = ChildProcessSpawner.make((command) =>
  Effect.sync(() => {
    if (!ChildProcess.isStandardCommand(command)) {
      throw new Error("Expected one standard Windows dialog command");
    }
    expect(command.command).toBe("powershell.exe");
    expect(A.take(command.args, 4)).toEqual(["-NoProfile", "-NonInteractive", "-STA", "-Command"]);
    expect(command.args).toHaveLength(5);
    expect(command.args[4]).toContain("$env:BEEP_ASK_MESSAGE");
    expect(command.args[4]).toContain("$env:BEEP_ASK_TITLE");
    expect(command.args[4]).not.toContain(question.title);
    expect(command.args[4]).not.toContain(question.message);
    expect(command.options.env).toEqual({ BEEP_ASK_TITLE: question.title, BEEP_ASK_MESSAGE: question.message });
    expect(command.options.extendEnv).toBe(true);
    return handle("yes\r\n", 0);
  })
);

describe("Windows dialog process boundary", () => {
  it.layer(hostLayer(successfulSpawner), { timeout: "10 seconds" })((it) => {
    it.effect("passes question text as environment data and accepts a successful yes", () =>
      ask.pipe(Effect.map((answer) => expect(answer).toBe(true)))
    );
  });

  it.layer(hostLayer(ChildProcessSpawner.make(() => Effect.succeed(handle("no\r\n", 0)))), { timeout: "10 seconds" })(
    (it) => {
      it.effect("refuses a no answer", () => ask.pipe(Effect.map((answer) => expect(answer).toBe(false))));
    }
  );

  it.layer(hostLayer(ChildProcessSpawner.make(() => Effect.succeed(handle("yes\r\n", 1)))), { timeout: "10 seconds" })(
    (it) => {
      it.effect("refuses a yes answer from an unsuccessful process", () =>
        ask.pipe(Effect.map((answer) => expect(answer).toBe(false)))
      );
    }
  );

  it.layer(
    hostLayer(
      ChildProcessSpawner.make(() => Effect.die("A non-Windows dialog must not spawn")),
      false
    ),
    { timeout: "10 seconds" }
  )((it) => {
    it.effect("refuses a dialog off Windows without launching a process", () =>
      Effect.gen(function* () {
        const error = yield* ask.pipe(Effect.flip);
        expect(error).toBeInstanceOf(WindowsHostFailure);
        expect(error.message).toBe("Asking in a Windows dialog is only available on Windows.");
      })
    );
  });
});

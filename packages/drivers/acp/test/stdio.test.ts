import * as AcpError from "@beep/acp/errors";
import { makeTerminationError } from "@beep/acp/protocol";
import { assert, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as PlatformError from "effect/PlatformError";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";

const exitStatusFailure = (cause: unknown) =>
  PlatformError.systemError({
    _tag: "Unknown",
    cause,
    method: "exitCode",
    module: "ChildProcess",
  });

it.effect(
  "retains the process identifier and exact exit-status cause",
  Effect.fnUntraced(function* () {
    const rootCause = new Error("private process diagnostics");
    const cause = exitStatusFailure(rootCause);
    const error = yield* makeTerminationError({
      exitCode: Effect.fail(cause),
      pid: ChildProcessSpawner.ProcessId(42),
    });

    assert.instanceOf(error, AcpError.AcpTransportError);
    if (error._tag !== "AcpTransportError") {
      return assert.fail("expected a transport error");
    }
    assertSome(error.pid, 42);
    assertSome(error.operation, "read-process-exit-status");
    assertSome(error.cause, cause);
    assert.equal(error.message, "ACP transport operation read-process-exit-status failed.");
    assert.notInclude(error.message, rootCause.message);
  })
);

it.effect(
  "classifies a signal exit reported by the spawner as a process exit with that signal",
  Effect.fnUntraced(function* () {
    const cause = exitStatusFailure(new Error("Process interrupted due to receipt of signal: 'SIGTERM'"));
    const error = yield* makeTerminationError({
      exitCode: Effect.fail(cause),
      pid: ChildProcessSpawner.ProcessId(43),
    });

    if (error._tag !== "AcpProcessExitedError") {
      return assert.fail("expected a process exit error");
    }
    assertSome(error.signal, "SIGTERM");
    assertSome(error.pid, 43);
    assertNone(error.code);
    assertSome(error.cause, cause);
    assert.equal(error.message, "ACP process exited after signal SIGTERM");
  })
);

it.effect(
  "reports a numeric exit with its code and process identifier",
  Effect.fnUntraced(function* () {
    const error = yield* makeTerminationError({
      exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(7)),
      pid: ChildProcessSpawner.ProcessId(44),
    });

    if (error._tag !== "AcpProcessExitedError") {
      return assert.fail("expected a process exit error");
    }
    assertSome(error.code, 7);
    assertSome(error.pid, 44);
    assertNone(error.signal);
    assert.equal(error.message, "ACP process exited with code 7");
  })
);

import { AcpClientTerminalLimits, make } from "@beep/acp/terminals";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, it } from "@effect/vitest";
import { assertNone, assertSome, assertTrue } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Result from "effect/Result";

const node = process.execPath;
const script = (source: string) => ({ command: node, args: ["-e", source] });
const cwd = process.cwd();

it.layer(NodeServices.layer, { timeout: "30 seconds" })("AcpClientTerminals", (it) => {
  it.effect(
    "runs a command, buffers output, and reports the exit status",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({ defaultCwd: cwd });
      const { terminalId } = yield* terminals.create({
        sessionId: "session",
        ...script("console.log('hello from acp'); process.exit(3);"),
      });

      const exit = yield* terminals.waitForExit({ sessionId: "session", terminalId });
      assert.strictEqual(exit.exitCode, 3);
      assert.isNull(exit.signal);

      const output = yield* terminals.output({ sessionId: "session", terminalId });
      assert.include(output.output, "hello from acp");
      assert.isFalse(output.truncated);
      assert.strictEqual(output.exitStatus?.exitCode, 3);
      assertSome(terminals.commandLine(terminalId), `${node} -e console.log('hello from acp'); process.exit(3);`);
    })
  );

  it.effect(
    "layers session and request variables over a complete base environment",
    Effect.fnUntraced(function* () {
      const terminals = yield* make(
        { defaultCwd: cwd, environment: O.some({ BASE_ONLY: "base", OVERRIDDEN: "base" }) },
        (sessionId) => ({ OVERRIDDEN: `session-${sessionId}` })
      );
      const read = Effect.fnUntraced(function* (
        sessionId: string,
        env: ReadonlyArray<{ name: string; value: string }>
      ) {
        const { terminalId } = yield* terminals.create({
          sessionId,
          env,
          ...script(
            "process.stdout.write([process.env.BASE_ONLY, process.env.OVERRIDDEN, process.env.HOME ?? 'no-home'].join(','))"
          ),
        });
        yield* terminals.waitForExit({ sessionId, terminalId });
        return (yield* terminals.output({ sessionId, terminalId })).output;
      });

      assert.strictEqual(yield* read("a", []), "base,session-a,no-home");
      assert.strictEqual(yield* read("b", [{ name: "OVERRIDDEN", value: "request" }]), "base,request,no-home");
    })
  );

  it.effect(
    "runs shell source when shell commands are enabled",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({ defaultCwd: cwd, shellCommands: true }, () => ({ ACP_PROBE: "mailbox-probe" }));
      const { terminalId } = yield* terminals.create({
        sessionId: "shell",
        command: 'printf "%s\\n" "$ACP_PROBE" | tr a-z A-Z',
      });
      const exit = yield* terminals.waitForExit({ sessionId: "shell", terminalId });
      const output = yield* terminals.output({ sessionId: "shell", terminalId });

      assert.strictEqual(exit.exitCode, 0);
      assert.strictEqual(output.output.trim(), "MAILBOX-PROBE");
    })
  );

  it.effect(
    "truncates from the beginning at the byte limit on a character boundary",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({ defaultCwd: cwd });
      const ascii = yield* terminals.create({
        sessionId: "session",
        outputByteLimit: 16,
        ...script("process.stdout.write('a'.repeat(64) + 'TAIL');"),
      });
      // Each euro sign is three bytes, so a 16-byte limit cuts through one of them.
      const multiByte = yield* terminals.create({
        sessionId: "session",
        outputByteLimit: 16,
        ...script("process.stdout.write('\\u20ac'.repeat(20));"),
      });
      yield* terminals.waitForExit({ sessionId: "session", ...ascii });
      yield* terminals.waitForExit({ sessionId: "session", ...multiByte });

      const asciiOutput = yield* terminals.output({ sessionId: "session", ...ascii });
      assert.isTrue(asciiOutput.truncated);
      assert.strictEqual(asciiOutput.output, `${"a".repeat(12)}TAIL`);

      const multiByteOutput = yield* terminals.output({ sessionId: "session", ...multiByte });
      assert.isTrue(multiByteOutput.truncated);
      assert.strictEqual(multiByteOutput.output, "€".repeat(5));
    })
  );

  it.effect(
    "kills a running command and rejects the released handle while keeping its snapshot",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({ defaultCwd: cwd });
      const { terminalId } = yield* terminals.create({
        sessionId: "session",
        ...script("setInterval(() => {}, 1000);"),
      });

      yield* terminals.kill({ sessionId: "session", terminalId });
      const exit = yield* terminals.waitForExit({ sessionId: "session", terminalId });
      if (process.platform === "win32") assert.isNull(exit.signal);
      else assert.strictEqual(exit.signal, "SIGTERM");

      yield* terminals.release({ sessionId: "session", terminalId });
      const rejected = yield* Effect.flip(terminals.output({ sessionId: "session", terminalId }));
      assert.include(rejected.message, "unknown terminal ID");
      assert.strictEqual(rejected.code, -32603);
      assertSome(terminals.readOutputSnapshot("session", terminalId), {
        output: "",
        truncated: false,
        exitStatus: exit,
      });
    })
  );

  it.effect(
    "reserves live-terminal capacity across concurrent creates",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({ defaultCwd: cwd, limits: AcpClientTerminalLimits.make({ maxLiveTerminals: 3 }) });
      const results = yield* Effect.all(
        A.makeBy(4, () =>
          terminals.create({ sessionId: "session", ...script("setInterval(() => {}, 1000);") }).pipe(Effect.result)
        ),
        { concurrency: "unbounded" }
      );

      assert.lengthOf(A.filter(results, Result.isSuccess), 3);
      assert.lengthOf(A.filter(results, Result.isFailure), 1);
    })
  );

  it.effect(
    "bounds unreleased terminals without invalidating existing ids",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({
        defaultCwd: cwd,
        limits: AcpClientTerminalLimits.make({ maxUnreleasedTerminals: 3 }),
      });
      const ids = yield* Effect.forEach(A.range(0, 2), (index) =>
        terminals
          .create({ sessionId: "session", ...script(`process.stdout.write('${index}');`) })
          .pipe(Effect.tap((created) => terminals.waitForExit({ sessionId: "session", ...created })))
      );

      const rejected = yield* terminals.create({ sessionId: "session", ...script("") }).pipe(Effect.flip);
      assert.include(rejected.message, "3 unreleased terminals");
      for (const [index, { terminalId }] of ids.entries())
        assertSome(terminals.readOutputSnapshot("session", terminalId), {
          output: `${index}`,
          truncated: false,
          exitStatus: { exitCode: 0, signal: null },
        });
    })
  );

  it.effect(
    "bounds output retained across terminals and prunes old released snapshots",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({
        defaultCwd: cwd,
        limits: AcpClientTerminalLimits.make({ maxRetainedOutputBytes: 1024, maxRetainedReleasedTerminals: 1 }),
      });
      const ids = yield* Effect.forEach(A.range(0, 2), () =>
        terminals
          .create({ sessionId: "session", ...script("process.stdout.write('x'.repeat(1000));") })
          .pipe(Effect.tap((created) => terminals.waitForExit({ sessionId: "session", ...created })))
      );
      const retained = A.reduce(
        A.filterMap(ids, ({ terminalId }) =>
          Result.fromOption(terminals.readOutputSnapshot("session", terminalId), () => undefined)
        ),
        0,
        (total, snapshot) => total + snapshot.output.length
      );
      assert.isAtMost(retained, 1024);

      yield* Effect.forEach(ids, ({ terminalId }) => terminals.release({ sessionId: "session", terminalId }));
      assertNone(terminals.readOutputSnapshot("session", ids[0]?.terminalId ?? ""));
      // Trimming takes the oldest output first, so the newest terminal keeps all of its output.
      assertSome(terminals.readOutputSnapshot("session", ids[2]?.terminalId ?? ""), {
        output: "x".repeat(1000),
        truncated: false,
        exitStatus: { exitCode: 0, signal: null },
      });
    })
  );

  it.effect(
    "rejects terminal handles from a different session",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({ defaultCwd: cwd });
      const { terminalId } = yield* terminals.create({
        sessionId: "owner",
        ...script("process.stdout.write('owned');"),
      });
      const foreign = { sessionId: "foreign", terminalId };
      const results = yield* Effect.all(
        [
          Effect.result(terminals.output(foreign)),
          Effect.result(terminals.waitForExit(foreign)),
          Effect.result(terminals.kill(foreign)),
          Effect.result(terminals.release(foreign)),
        ],
        { concurrency: "unbounded" }
      );

      assertTrue(A.every(results, Result.isFailure));
      yield* terminals.waitForExit({ sessionId: "owner", terminalId });
      assertNone(terminals.readOutputSnapshot("foreign", terminalId));
      assertSome(terminals.readOutputSnapshot("owner", terminalId), {
        output: "owned",
        truncated: false,
        exitStatus: { exitCode: 0, signal: null },
      });
    })
  );

  it.effect(
    "reports a command that cannot start as an internal error",
    Effect.fnUntraced(function* () {
      const terminals = yield* make({ defaultCwd: cwd });
      const error = yield* terminals
        .create({ sessionId: "session", command: "/nonexistent/acp-terminal-command" })
        .pipe(Effect.flip);

      assert.strictEqual(error.code, -32603);
      assert.include(error.message, "Could not start terminal command");
    })
  );
});

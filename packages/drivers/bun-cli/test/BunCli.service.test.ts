import { BunCli, BunCliError, BunCliProcessResult } from "@beep/bun-cli";
import { describe, expect, layer } from "@effect/vitest";
import { Effect } from "effect";

const successRunner = (command: string, args: ReadonlyArray<string>) =>
  Effect.succeed(
    new BunCliProcessResult({
      exitCode: 0,
      stderr: "",
      stdout: args[0] === "--version" ? "1.3.11\n" : "upgraded\n",
    })
  );

const missingRunner = () =>
  Effect.fail(
    BunCliError.fromUnknown("run", "Failed to execute the Bun CLI.", {
      command: "bun",
    })
  );

const failedUpgradeRunner = (command: string, args: ReadonlyArray<string>) =>
  Effect.succeed(
    new BunCliProcessResult({
      exitCode: args[0] === "upgrade" ? 1 : 0,
      stderr: args[0] === "upgrade" ? "network unavailable" : "",
      stdout: args[0] === "--version" ? "1.3.11\n" : "",
    })
  );

describe("@beep/bun-cli", () => {
  layer(BunCli.makeLayerFromRunner(successRunner))((it) => {
    it.effect("probes Bun version and upgrades successfully", () =>
      Effect.gen(function* () {
        const bunCli = yield* BunCli;
        const probe = yield* bunCli.probe();

        expect(probe.status).toBe("present");
        expect(probe.version._tag).toBe("Some");
        yield* bunCli.upgrade();
      })
    );
  });

  layer(BunCli.makeLayerFromRunner(missingRunner))((it) => {
    it.effect("treats a missing Bun command as a missing probe result", () =>
      Effect.gen(function* () {
        const bunCli = yield* BunCli;
        const probe = yield* bunCli.probe();

        expect(probe.status).toBe("missing");
        expect(probe.version._tag).toBe("None");
      })
    );
  });

  layer(BunCli.makeLayerFromRunner(failedUpgradeRunner))((it) => {
    it.effect("returns typed driver errors for failed upgrades", () =>
      Effect.gen(function* () {
        const bunCli = yield* BunCli;
        const error = yield* bunCli.upgrade().pipe(Effect.flip);

        expect(error).toBeInstanceOf(BunCliError);
        expect(error.operation).toBe("upgrade");
        expect(error.stderr).toBe("network unavailable");
      })
    );
  });
});

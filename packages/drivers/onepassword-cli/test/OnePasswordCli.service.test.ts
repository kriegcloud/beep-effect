import { OnePasswordCli, OnePasswordCliError, OnePasswordCliProcessResult } from "@beep/onepassword-cli";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Redacted } from "effect";
import * as A from "effect/Array";

const successRunner = (_command: string, args: ReadonlyArray<string>) =>
  Effect.succeed(
    new OnePasswordCliProcessResult({
      exitCode: 0,
      stderr: "",
      stdout: A.contains(args, "whoami") ? "example.1password.com\n" : "discord-token-value",
    })
  );

const missingRunner = (_command: string, _args: ReadonlyArray<string>) =>
  Effect.succeed(
    new OnePasswordCliProcessResult({
      exitCode: 1,
      stderr: "secret not found",
      stdout: "",
    })
  );

describe("@beep/onepassword-cli", () => {
  layer(OnePasswordCli.makeLayerFromRunner(successRunner))((it) => {
    it.effect(
      "probes signed-in state and reference metadata without exposing the secret",
      Effect.fnUntraced(function* () {
        const onePassword = yield* OnePasswordCli;

        const account = yield* onePassword.whoami;
        const value = yield* onePassword.read("op://Private/Discord Bot/token");
        const probe = yield* onePassword.probeReference("op://Private/Discord Bot/token");

        expect(account.signedIn).toBe(true);
        expect(account.account).toBe("example.1password.com");
        expect(Redacted.value(value)).toBe("discord-token-value");
        expect(probe.byteLength).toBe("discord-token-value".length);
        expect(probe.status).toBe("resolved");
      })
    );
  });

  layer(OnePasswordCli.makeLayerFromRunner(missingRunner))((it) => {
    it.effect(
      "returns typed driver errors for unresolved references",
      Effect.fnUntraced(function* () {
        const onePassword = yield* OnePasswordCli;
        const result = yield* onePassword.probeReference("op://Private/Missing/token").pipe(Effect.flip);

        expect(result).toBeInstanceOf(OnePasswordCliError);
        expect(result.operation).toBe("read");
        expect(result.stderr).toBe("secret not found");
      })
    );
  });
});

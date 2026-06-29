/**
 * LIVE POC entrypoint: authenticates against PACER QA and runs a real search.
 *
 * Credentials are read from the environment via `effect/Config` — resolve the
 * 1Password `op://` refs with `op run` (see README). Because the QA account is
 * MFA-enrolled (authenticator-app only), pass the current 6-digit code via
 * `--otp`; it expires in ~30s, so run immediately after reading it. (Without
 * `--otp`, the `PACER_OTP` config value is used if present.)
 *
 * Run:
 *   op run --env-file scratchpad/pacer/pacer.env -- \
 *     bun scratchpad/pacer/run-live.ts --otp 123456
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Console, Effect, Redacted } from "effect";
import * as O from "effect/Option";
import { FetchHttpClient } from "effect/unstable/http";
import { loadPacerConfig } from "./Pacer.config.ts";
import { searchDemo } from "./Demo.ts";
import { makePacerLayer } from "./transport/Layers.ts";

const readOtpArg = (): O.Option<Redacted.Redacted<string>> => {
  const args = process.argv.slice(2);
  const index = args.indexOf("--otp");
  const value = index >= 0 && index + 1 < args.length ? args[index + 1] : undefined;
  return value !== undefined && value.length > 0 ? O.some(Redacted.make(value)) : O.none();
};

const program = Effect.gen(function* () {
  yield* Console.log("=== PACER POC — LIVE against QA (qa-login + qa-pcl) ===\n");

  const otpCode = readOtpArg();
  if (O.isNone(otpCode)) {
    yield* Console.log(
      "⚠ No --otp <code> passed; relying on PACER_OTP if set. An MFA-enrolled account fails with loginResult 13 otherwise.\n"
    );
  }

  const cfg = yield* loadPacerConfig({ environment: "qa", otpCode });
  yield* Console.log(`auth: ${cfg.authBaseUrl}   pcl: ${cfg.pclBaseUrl}\n`);

  yield* searchDemo.pipe(
    // This runner is the application entry point: compose + provide the layer here.
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(makePacerLayer(cfg, FetchHttpClient.layer).full)
  );

  yield* Console.log("\n=== done ===");
});

Effect.runPromise(program.pipe(Effect.catch((error) => Effect.logError("PACER live run failed", error))));

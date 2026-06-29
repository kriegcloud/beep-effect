/**
 * Default POC entrypoint: runs the full auth → search → logout spine plus the
 * two typed error paths against the deterministic mock transport. No network,
 * no credentials.
 *
 * Run: `bun scratchpad/pacer/run-mock.ts`
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import { mockPacerConfig } from "./Pacer.config.ts";
import { PacerAuth } from "./auth/PacerAuth.service.ts";
import { CourtCaseSearchDto } from "./pcl/Pcl.models.ts";
import { PclClient } from "./pcl/PclClient.service.ts";
import { searchDemo } from "./Demo.ts";
import { makePacerLayer } from "./transport/Layers.ts";
import { makePacerMockHttpClient } from "./transport/Mock.ts";

const cfg = mockPacerConfig();

const program = Effect.gen(function* () {
  yield* Console.log("=== PACER POC — mock transport (no network, no creds) ===\n");

  yield* Console.log("[1] Happy path: login (scoped) → paginated search → logout on scope close");
  yield* searchDemo.pipe(
    // This runner is the application entry point: compose + provide the layer here.
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(makePacerLayer(cfg, makePacerMockHttpClient()).full)
  );

  yield* Console.log("\n[2] Auth error: cso-auth returns loginResult 13");
  yield* Effect.gen(function* () {
    const auth = yield* PacerAuth;
    return yield* auth.login;
  }).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(makePacerLayer(cfg, makePacerMockHttpClient({ auth: "invalid" })).auth),
    Effect.matchEffect({
      onFailure: (error) =>
        Console.log(`  ✓ typed ${error._tag}: reason=${error.reason} loginResult=${error.loginResult ?? ""}`),
      onSuccess: () => Console.log("  ✗ unexpected success"),
    })
  );

  yield* Console.log("\n[3] PCL error: /cases/find returns HTTP 406");
  yield* Effect.gen(function* () {
    const pcl = yield* PclClient;
    return yield* pcl.findCasesPage(CourtCaseSearchDto.make({}), 0);
  }).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(makePacerLayer(cfg, makePacerMockHttpClient({ cases: "invalid-parameter" })).full),
    Effect.matchEffect({
      onFailure: (error) => Console.log(`  ✓ typed ${error._tag}: reason=${error.reason}`),
      onSuccess: () => Console.log("  ✗ unexpected success"),
    })
  );

  yield* Console.log("\n=== done ===");
});

Effect.runPromise(program.pipe(Effect.catch((error) => Effect.logError("run-mock failed", error))));

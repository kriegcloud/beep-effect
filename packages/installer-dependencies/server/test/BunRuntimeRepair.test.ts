import type { BunCliProbe } from "@beep/bun-cli";
import { makeInstallerDependenciesConfigTestLayer } from "@beep/installer-dependencies-config/test";
import {
  BunRuntimeAlreadyHealthy,
  BunRuntimeRepairApprovalRequired,
  BunRuntimeRepairFailed,
  BunRuntimeRepairRequest,
} from "@beep/installer-dependencies-use-cases/public";
import {
  BunRuntimeCommandPort,
  BunRuntimeCommandPortError,
  InstallerDependenciesUseCases,
} from "@beep/installer-dependencies-use-cases/server";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";
import { makeInstallerDependenciesServer } from "../src/Layer.js";

const makeProbe = (version: O.Option<string>): BunCliProbe => ({
  command: "bun",
  status: O.isSome(version) ? "present" : "missing",
  version,
});

const healthyPort = Layer.succeed(
  BunRuntimeCommandPort,
  BunRuntimeCommandPort.of({
    probe: () => Effect.succeed(makeProbe(O.some("1.3.14"))),
    upgrade: () => Effect.void,
  })
);

const repairingPort = (() => {
  let upgraded = false;

  return Layer.succeed(
    BunRuntimeCommandPort,
    BunRuntimeCommandPort.of({
      probe: () => Effect.succeed(makeProbe(O.some(upgraded ? "1.3.14" : "1.3.11"))),
      upgrade: () =>
        Effect.sync(() => {
          upgraded = true;
        }),
    })
  );
})();

const failedRepairPort = Layer.succeed(
  BunRuntimeCommandPort,
  BunRuntimeCommandPort.of({
    probe: () => Effect.succeed(makeProbe(O.some("1.3.11"))),
    upgrade: () =>
      Effect.fail(
        new BunRuntimeCommandPortError({
          message: "Bun upgrade failed.",
          operation: "upgrade",
        })
      ),
  })
);

const missingBunPort = Layer.succeed(
  BunRuntimeCommandPort,
  BunRuntimeCommandPort.of({
    probe: () => Effect.succeed(makeProbe(O.none())),
    upgrade: () => Effect.void,
  })
);

const makeTestLayer = (portLayer: Layer.Layer<BunRuntimeCommandPort>) =>
  Layer.effect(InstallerDependenciesUseCases, makeInstallerDependenciesServer()).pipe(
    Layer.provideMerge(portLayer),
    Layer.provideMerge(makeInstallerDependenciesConfigTestLayer("1.3.14"))
  );

describe("@beep/installer-dependencies-server Bun repair flow", () => {
  layer(makeTestLayer(healthyPort))((it) => {
    it.effect(
      "reports Bun as healthy when the detected version meets the minimum",
      Effect.fnUntraced(function* () {
        const dependencies = yield* InstallerDependenciesUseCases;
        const result = yield* dependencies.inspectBunRuntime();

        expect(result.state).toBe("healthy");
        expect(result.summary).toContain("satisfies the required version");
      })
    );

    it.effect(
      "rejects repair when Bun is already healthy",
      Effect.fnUntraced(function* () {
        const dependencies = yield* InstallerDependenciesUseCases;
        const error = yield* dependencies
          .repairBunRuntime(
            new BunRuntimeRepairRequest({
              approved: true,
            })
          )
          .pipe(Effect.flip);

        expect(error).toBeInstanceOf(BunRuntimeAlreadyHealthy);
      })
    );
  });

  layer(makeTestLayer(repairingPort))((it) => {
    it.effect(
      "runs Bun repair and returns before/after evidence",
      Effect.fnUntraced(function* () {
        const dependencies = yield* InstallerDependenciesUseCases;
        const result = yield* dependencies.repairBunRuntime(
          new BunRuntimeRepairRequest({
            approved: true,
          })
        );

        expect(result.before.state).toBe("repair-required");
        expect(result.after.state).toBe("healthy");
        expect(result.command).toBe("bun upgrade");
      })
    );
  });

  layer(makeTestLayer(healthyPort))((it) => {
    it.effect(
      "requires explicit approval before mutating Bun",
      Effect.fnUntraced(function* () {
        const dependencies = yield* InstallerDependenciesUseCases;
        const error = yield* dependencies
          .repairBunRuntime(
            new BunRuntimeRepairRequest({
              approved: false,
            })
          )
          .pipe(Effect.flip);

        expect(error).toBeInstanceOf(BunRuntimeRepairApprovalRequired);
      })
    );
  });

  layer(makeTestLayer(failedRepairPort))((it) => {
    it.effect(
      "translates failed upgrades into public repair failures",
      Effect.fnUntraced(function* () {
        const dependencies = yield* InstallerDependenciesUseCases;
        const error = yield* dependencies
          .repairBunRuntime(
            new BunRuntimeRepairRequest({
              approved: true,
            })
          )
          .pipe(Effect.flip);

        expect(error).toBeInstanceOf(BunRuntimeRepairFailed);
      })
    );
  });

  layer(makeTestLayer(missingBunPort))((it) => {
    it.effect(
      "keeps missing Bun outside the repair-only success path",
      Effect.fnUntraced(function* () {
        const dependencies = yield* InstallerDependenciesUseCases;
        const error = yield* dependencies
          .repairBunRuntime(
            new BunRuntimeRepairRequest({
              approved: true,
            })
          )
          .pipe(Effect.flip);

        expect(error).toBeInstanceOf(BunRuntimeRepairFailed);
        expect(error.reason).toContain("existing Bun install");
      })
    );
  });
});

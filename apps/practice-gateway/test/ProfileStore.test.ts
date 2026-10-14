import { SetupDoctor } from "@beep/law-practice-use-cases/PracticeSetup";
import { ElicitedApprovals } from "@beep/practice-gateway/Approvals";
import { SelfCheckFailure } from "@beep/practice-gateway/PracticeGateway.errors";
import { GatewaySetupProbes } from "@beep/practice-gateway/Probes";
import { PROFILE_FILE_NAME, ProfileStore } from "@beep/practice-gateway/ProfileStore";
import {
  GatewaySelfCheckRefusal,
  GatewaySelfCheckReport,
  printGatewaySelfCheck,
  runGatewaySelfCheck,
} from "@beep/practice-gateway/SelfCheck";
import { it } from "@beep/test-runner";
import { provideScopedLayer } from "@beep/test-utils";
import { WindowsSecretStore } from "@beep/windows-secrets";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { fakeHost, fullProfile, settingsLayer } from "./fixtures.ts";

const Platform = Layer.mergeAll(BunFileSystem.layer, BunPath.layer);
const isString = S.is(S.String);

// Gateway services over a temporary data directory and a bare fake Windows machine.
const servicesAt = (dataDir: string) => {
  const settings = settingsLayer({ dataDir });
  const probes = GatewaySetupProbes.pipe(
    Layer.provide(Layer.mergeAll(fakeHost({ bitLocker: "on" }), settings, Platform, WindowsSecretStore.layerMemory))
  );
  return Layer.mergeAll(
    SetupDoctor.layer.pipe(Layer.provide(Layer.merge(probes, ElicitedApprovals))),
    ProfileStore.layer.pipe(Layer.provide(Layer.merge(settings, Platform)))
  );
};

const withDataDir = <A, E, R>(use: (dataDir: string) => Effect.Effect<A, E, R>) =>
  FileSystem.FileSystem.use((fs) => fs.makeTempDirectoryScoped({ prefix: "practice-gateway-" })).pipe(
    Effect.flatMap(use),
    Effect.scoped,
    provideScopedLayer(Platform)
  );

const printed = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.all({ value: self, lines: TestConsole.logLines.pipe(Effect.map(A.filter(isString))) }).pipe(
    Effect.provideServiceEffect(Console.Console, TestConsole.make)
  );

describe("ProfileStore", () => {
  it.effect("reads none before saving and round-trips a saved profile", () =>
    withDataDir((dataDir) =>
      Effect.gen(function* () {
        const store = yield* ProfileStore;
        expect(yield* store.get).toEqual(O.none());
        yield* store.save(fullProfile);
        const saved = yield* store.get;
        expect(O.map(saved, (profile) => profile.choices.length)).toEqual(O.some(3));
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        expect(yield* fs.exists(path.join(dataDir, `${PROFILE_FILE_NAME}.tmp`))).toBe(false);
      }).pipe(provideScopedLayer(servicesAt(dataDir)))
    )
  );

  it.effect("fails with a typed error on a corrupt profile file", () =>
    withDataDir((dataDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        yield* fs.writeFileString(path.join(dataDir, PROFILE_FILE_NAME), "{not json");
        const error = yield* ProfileStore.use((store) => store.get).pipe(Effect.flip);
        expect(error._tag).toBe("ProfileStoreFailure");
      }).pipe(provideScopedLayer(servicesAt(dataDir)))
    )
  );
});

describe("--self-check", () => {
  it.effect("prints one decodable report line for the saved profile", () =>
    withDataDir((dataDir) =>
      Effect.gen(function* () {
        yield* ProfileStore.use((store) => store.save(fullProfile));
        const { lines } = yield* printGatewaySelfCheck(runGatewaySelfCheck).pipe(printed);
        expect(lines).toHaveLength(1);
        const line = yield* S.decodeEffect(S.fromJsonString(GatewaySelfCheckReport))(lines[0] ?? "");
        expect(line.profileSaved).toBe(true);
        expect(line.report.checks).toHaveLength(10);
        expect(line.summary).toContain("You need to: Open Claude and sign in with your Claude account.");
      }).pipe(provideScopedLayer(servicesAt(dataDir)))
    )
  );

  it.effect("prints a refusal line and fails when the profile cannot be read", () =>
    withDataDir((dataDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        yield* fs.writeFileString(path.join(dataDir, PROFILE_FILE_NAME), "{}");
        const { lines, value } = yield* printGatewaySelfCheck(runGatewaySelfCheck).pipe(Effect.flip, printed);
        expect(value).toBeInstanceOf(SelfCheckFailure);
        expect(lines).toHaveLength(1);
        const refusal = yield* S.decodeEffect(S.fromJsonString(GatewaySelfCheckRefusal))(lines[0] ?? "");
        expect(refusal.message).toContain("could not be read");
      }).pipe(provideScopedLayer(servicesAt(dataDir)))
    )
  );
});

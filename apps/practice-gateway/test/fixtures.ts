import { CapabilityGap, CapabilitySupported, ItLimits, PracticeProfile } from "@beep/law-practice-domain";
import { GatewaySettings, GatewaySettingsValues } from "@beep/practice-gateway/GatewaySettings";
import { WindowsHostFailure } from "@beep/practice-gateway/PracticeGateway.errors";
import { BitLockerProtection, WindowsHost, WindowsHostShape } from "@beep/practice-gateway/WindowsHost";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type { KnownFolder, RegistryValueQuery } from "@beep/practice-gateway/WindowsHost";

const folders = HashMap.make<ReadonlyArray<readonly [KnownFolder, string]>>(
  ["ProgramFiles", "/pf"],
  ["LOCALAPPDATA", "/local"],
  ["APPDATA", "/roaming"],
  ["USERPROFILE", "/home/lawyer"]
);

export interface FakeMachine {
  readonly bitLocker?: BitLockerProtection;
  readonly fileBytes?: ReadonlyArray<readonly [string, Uint8Array]>;
  readonly files?: ReadonlyArray<string>;
  readonly isWindows?: boolean;
  readonly processes?: ReadonlyArray<string>;
  readonly registry?: ReadonlyArray<readonly [string, string]>;
  readonly registryFails?: boolean;
}

// A Windows machine described as data: paths use the folders above.
export const fakeHost = (machine: FakeMachine) => {
  const files = HashSet.fromIterable([...(machine.files ?? []), ...A.map(machine.fileBytes ?? [], ([path]) => path)]);
  const bytes = HashMap.fromIterable(machine.fileBytes ?? []);
  const registry = HashMap.fromIterable(machine.registry ?? []);
  const processes = HashSet.fromIterable(machine.processes ?? []);
  return Layer.succeed(
    WindowsHost,
    WindowsHostShape.make({
      isWindows: machine.isWindows ?? true,
      folder: Effect.fn("FakeWindowsHost.folder")((name: KnownFolder) => Effect.succeed(HashMap.get(folders, name))),
      exists: Effect.fn("FakeWindowsHost.exists")((path: string) => Effect.succeed(HashSet.has(files, path))),
      readFile: Effect.fn("FakeWindowsHost.readFile")((path: string) => Effect.succeed(HashMap.get(bytes, path))),
      registryValue: Effect.fn("FakeWindowsHost.registryValue")(function* ({ key, name }: RegistryValueQuery) {
        if (machine.registryFails === true) {
          return yield* WindowsHostFailure.make({ message: "reg.exe could not be run." });
        }
        return HashMap.get(registry, `${key}|${name}`);
      }),
      bitLocker: Effect.fn("FakeWindowsHost.bitLocker")((_drive: string) =>
        Effect.succeed(machine.bitLocker ?? BitLockerProtection.Enum.unknown)
      ),
      processRunning: Effect.fn("FakeWindowsHost.processRunning")((imageName: string) =>
        Effect.succeed(HashSet.has(processes, imageName))
      ),
    })
  );
};

export const settingsLayer = (overrides: {
  readonly dataDir?: string;
  readonly isWindows?: boolean;
  readonly bundleDir?: string;
}) =>
  GatewaySettings.layerFixed(
    GatewaySettingsValues.make({
      dataDir: overrides.dataDir ?? "/data",
      isWindows: overrides.isWindows ?? true,
      bundleDir: O.fromUndefinedOr(overrides.bundleDir),
      corpusRoot: O.none(),
    })
  );

export const itLimits = ItLimits.make({ adminRights: "available", proxy: "none" });

export const fullProfile = PracticeProfile.make({
  choices: [
    CapabilitySupported.make({ capability: "documents", provider: "box-drive" }),
    CapabilitySupported.make({ capability: "mail-calendar", provider: "microsoft-365" }),
    CapabilitySupported.make({ capability: "knowledge-graph", provider: "practice-kg" }),
  ],
  itLimits,
  recordedAt: DateTime.makeUnsafe(1_760_000_000_000),
});

export const gapProfile = PracticeProfile.make({
  choices: [
    CapabilityGap.make({ capability: "documents", namedProvider: "NetDocuments", fallback: O.some("box-drive") }),
  ],
  itLimits,
  recordedAt: DateTime.makeUnsafe(1_760_000_000_000),
});

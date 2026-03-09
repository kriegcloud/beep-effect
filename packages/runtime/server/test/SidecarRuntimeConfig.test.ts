import path from "node:path";
import { fileURLToPath } from "node:url";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { expect, test } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { loadSidecarOtlpConfig, resolveSidecarAppDataDir } from "../src/internal/SidecarRuntimeConfig.js";

const configLayer = (entries: Record<string, string>) => ConfigProvider.layerAdd(ConfigProvider.fromUnknown(entries));
const platformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const serverPackageRoot = path.join(repoRoot, "packages", "runtime", "server");

const loadConfig = (entries: Record<string, string>) =>
  loadSidecarOtlpConfig("1.2.3-test").pipe(Effect.provide(configLayer(entries)));

test("loadSidecarRuntimeConfig uses OTEL defaults when env values are absent or blank", async () => {
  const config = await Effect.runPromise(
    loadConfig({
      OTEL_SERVICE_NAME: "   ",
      OTEL_SERVICE_VERSION: "",
      OTEL_RESOURCE_ATTRIBUTES: "   ",
    })
  );

  expect(config.otlpServiceName).toBe("beep-repo-memory-sidecar");
  expect(config.otlpServiceVersion).toBe("1.2.3-test");
  expect(config.otlpResourceAttributes).toEqual({});
});

test("loadSidecarRuntimeConfig trims OTEL values and ignores malformed OTEL_RESOURCE_ATTRIBUTES pairs", async () => {
  const config = await Effect.runPromise(
    loadConfig({
      OTEL_SERVICE_NAME: "  repo-memory-sidecar  ",
      OTEL_SERVICE_VERSION: "  9.9.9  ",
      OTEL_RESOURCE_ATTRIBUTES:
        " deployment.environment = dev , invalid , service.instance.id = abc123 , empty=   , =missing-key , keyOnly= , valid = yes ",
    })
  );

  expect(config.otlpServiceName).toBe("repo-memory-sidecar");
  expect(config.otlpServiceVersion).toBe("9.9.9");
  expect(config.otlpResourceAttributes).toEqual({
    "deployment.environment": "dev",
    "service.instance.id": "abc123",
    valid: "yes",
  });
});

test("loadSidecarRuntimeConfig anchors the default app data directory at the repo root", async () => {
  const previousCwd = process.cwd();
  process.chdir(serverPackageRoot);

  try {
    const appDataDir = await Effect.runPromise(resolveSidecarAppDataDir(O.none()).pipe(Effect.provide(platformLayer)));
    expect(appDataDir).toBe(path.join(repoRoot, ".beep", "repo-memory"));
  } finally {
    process.chdir(previousCwd);
  }
});

test("loadSidecarRuntimeConfig keeps explicit app data directory overrides relative to the current working directory", async () => {
  const previousCwd = process.cwd();
  process.chdir(serverPackageRoot);

  try {
    const appDataDir = await Effect.runPromise(
      resolveSidecarAppDataDir(O.some(".beep/custom-memory")).pipe(Effect.provide(platformLayer))
    );

    expect(appDataDir).toBe(path.join(serverPackageRoot, ".beep", "custom-memory"));
  } finally {
    process.chdir(previousCwd);
  }
});

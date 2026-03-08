import { loadSidecarOtlpConfig } from "../src/internal/SidecarRuntimeConfig.js";
import { expect, test } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";

const configLayer = (entries: Record<string, string>) => ConfigProvider.layerAdd(ConfigProvider.fromUnknown(entries));

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

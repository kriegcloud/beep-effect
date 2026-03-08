import { expect, test } from "@effect/vitest";
import { Config, pipe } from "effect";
import * as A from "effect/Array";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { loadSidecarOtlpConfig } from "../src/internal/SidecarRuntimeConfig.js";

const configLayer = (entries: Record<string, string>) => ConfigProvider.layerAdd(ConfigProvider.fromUnknown(entries));
const defaultOtlpServiceName = "beep-repo-memory-sidecar";

const normalizeOptionalText = (value: O.Option<string>) =>
  O.flatMap(value, (text) => {
    const normalized = Str.trim(text);
    return Str.isNonEmpty(normalized) ? O.some(normalized) : O.none();
  });

const parseOtlpResourceAttributes = (value: O.Option<string>): Record<string, string> =>
  pipe(
    value,
    normalizeOptionalText,
    O.match({
      onNone: () => R.fromEntries(A.empty<readonly [string, string]>()),
      onSome: (encoded) =>
        pipe(
          encoded,
          Str.split(","),
          A.reduce(A.empty<readonly [string, string]>(), (entries, pair) => {
            const separatorIndex = pipe(pair, Str.indexOf("="), (index) => index ?? -1);
            if (separatorIndex <= 0) {
              return entries;
            }

            const key = pipe(pair, Str.slice(0, separatorIndex), Str.trim);
            const value = pipe(pair, Str.slice(separatorIndex + 1), Str.trim);

            return Str.isNonEmpty(key) && Str.isNonEmpty(value) ? A.append(entries, [key, value] as const) : entries;
          }),
          R.fromEntries
        ),
    })
  );

const loadSidecarOtlpConfig = Effect.fn("SidecarRuntimeConfig.test.loadSidecarOtlpConfig")(function* (version: string) {
  const otlpServiceNameValue = yield* Config.option(Config.string("OTEL_SERVICE_NAME"));
  const otlpServiceVersionValue = yield* Config.option(Config.string("OTEL_SERVICE_VERSION"));
  const otlpResourceAttributesValue = yield* Config.option(Config.string("OTEL_RESOURCE_ATTRIBUTES"));

  return {
    otlpServiceName: O.getOrElse(normalizeOptionalText(otlpServiceNameValue), () => defaultOtlpServiceName),
    otlpServiceVersion: O.getOrElse(normalizeOptionalText(otlpServiceVersionValue), () => version),
    otlpResourceAttributes: parseOtlpResourceAttributes(otlpResourceAttributesValue),
  };
});

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

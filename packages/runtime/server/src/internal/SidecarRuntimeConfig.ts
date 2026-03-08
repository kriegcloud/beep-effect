import { $RuntimeServerId } from "@beep/identity/packages";
import { Config, Effect, flow, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RuntimeServerId.create("internal/SidecarRuntimeConfig");
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
      onSome: flow(
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

/**
 * Typed OTEL configuration resolved for the sidecar runtime boundary.
 *
 * @since 0.0.0
 * @category Models
 */
export class SidecarOtlpConfig extends S.Class<SidecarOtlpConfig>($I`SidecarOtlpConfig`)(
  {
    otlpServiceName: S.String,
    otlpServiceVersion: S.String,
    otlpResourceAttributes: S.Record(S.String, S.String),
  },
  $I.annote("SidecarOtlpConfig", {
    description: "Resolved OTEL service naming and resource attributes for the sidecar runtime boundary.",
  })
) {}

/**
 * Load OTEL configuration for the sidecar runtime from the ambient config provider.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const loadSidecarOtlpConfig = Effect.fn("SidecarRuntime.loadOtlpConfig")(function* (version: string) {
  const otlpServiceNameValue = yield* Config.option(Config.string("OTEL_SERVICE_NAME"));
  const otlpServiceVersionValue = yield* Config.option(Config.string("OTEL_SERVICE_VERSION"));
  const otlpResourceAttributesValue = yield* Config.option(Config.string("OTEL_RESOURCE_ATTRIBUTES"));

  return new SidecarOtlpConfig({
    otlpServiceName: O.getOrElse(normalizeOptionalText(otlpServiceNameValue), () => defaultOtlpServiceName),
    otlpServiceVersion: O.getOrElse(normalizeOptionalText(otlpServiceVersionValue), () => version),
    otlpResourceAttributes: parseOtlpResourceAttributes(otlpResourceAttributesValue),
  });
});

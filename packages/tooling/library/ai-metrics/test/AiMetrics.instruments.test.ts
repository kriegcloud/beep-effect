import {
  AttributeKeyName,
  allowedAttributes,
  InstrumentDeclarations,
  MetricInstrument,
  MetricName,
  mergeDeclarations,
  ObservabilityInstruments,
  PackageName,
  UcumUnit,
} from "@beep/observability/catalog";
import {
  AgentHarness,
  AgentProvider,
  AgentRoute,
  AiMetricsInstruments,
  TelemetryEmitter,
} from "@beep/repo-ai-metrics/AiMetrics.instruments";
import { it } from "@beep/test-runner";
import { describe } from "@effect/vitest";
import { assertTrue, deepStrictEqual } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import * as S from "effect/Schema";

const roundTrip = S.encodeEffect(InstrumentDeclarations);
const decode = S.decodeUnknownEffect(InstrumentDeclarations);

describe("AiMetricsInstruments", () => {
  it.effect("decodes from its encoded form", () =>
    Effect.gen(function* () {
      const decoded = yield* roundTrip(AiMetricsInstruments).pipe(Effect.flatMap(decode));
      deepStrictEqual(
        A.map(decoded.attributes, ({ key }) => key),
        [
          "beep.harness",
          "beep.provider",
          "beep.provider_account",
          "beep.route",
          "beep.model_role",
          "beep.emitter",
          "beep.lane",
          "beep.session",
        ]
      );
    })
  );

  it("declares each closed value list from its literal domain", () => {
    const valuesOf = (key: string) =>
      A.findFirst(AiMetricsInstruments.attributes, (attribute) => attribute.key === key).pipe(
        O.flatMap((attribute) => attribute.values)
      );
    deepStrictEqual(valuesOf("beep.harness"), O.some(AgentHarness.literals));
    deepStrictEqual(valuesOf("beep.provider"), O.some(AgentProvider.literals));
    deepStrictEqual(valuesOf("beep.route"), O.some(AgentRoute.literals));
    deepStrictEqual(valuesOf("beep.emitter"), O.some(TelemetryEmitter.literals));
  });

  it("merges with the kernel and keeps standard-tier keys out of the shape-only allowlist", () => {
    const merged = mergeDeclarations([ObservabilityInstruments, AiMetricsInstruments], []);
    merged.pipe(Result.isSuccess, assertTrue);
    deepStrictEqual(
      merged.pipe(
        Result.map((catalog) => allowedAttributes(catalog, "span", "shape-only")),
        Result.map((keys) =>
          A.map(["beep.harness", "beep.provider_account", "beep.lane", "beep.session"], (key) =>
            HashSet.has(keys, AttributeKeyName.make(key))
          )
        )
      ),
      Result.succeed([true, false, false, false])
    );
  });

  it("rejects lane and session as metric labels", () => {
    const metric = (key: string) =>
      InstrumentDeclarations.make({
        instruments: [
          MetricInstrument.make({
            name: MetricName.make("beep.agent.turns"),
            owner: PackageName.make("@beep/repo-ai-metrics"),
            attributes: [AttributeKeyName.make(key)],
            minTier: "standard",
            description: "Agent turns.",
            kind: "counter",
            unit: UcumUnit.make("{turn}"),
          }),
        ],
      });
    const tagsFor = (key: string) =>
      Result.match(mergeDeclarations([AiMetricsInstruments, metric(key)], []), {
        onSuccess: () => [],
        onFailure: (conflicts) => A.map(conflicts, ({ _tag }) => _tag),
      });
    assertTrue(A.contains(tagsFor("beep.lane"), "UnboundedMetricLabel"));
    assertTrue(A.contains(tagsFor("beep.session"), "UnboundedMetricLabel"));
    deepStrictEqual(tagsFor("beep.harness"), []);
  });
});

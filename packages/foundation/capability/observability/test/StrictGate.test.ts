import { effectiveTier, StrictDesktop, TelemetryTier } from "@beep/observability/catalog";
import {
  coarsenMetricValue,
  durationBucketOf,
  GateRule,
  GateRules,
  layerInMemoryEgressSink,
  layerStrictOtlp,
  makeStrictGate,
  ShapeOnlySpan,
  StrictEgressSink,
  StrictGate,
  StrictGateRulesOn,
} from "@beep/observability/strict";
import { it } from "@beep/test-runner";
import { fcRuns } from "@beep/test-utils";
import { describe, expect } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Metric from "effect/Metric";
import * as O from "effect/Option";
import * as OtlpExporter from "effect/observability/OtlpExporter";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  batchCanary,
  representativeLogs,
  representativeMetrics,
  representativeTraces,
} from "./support/StrictGate.batches.ts";
import { bodyJson, bodyText, demoConfig, layerTestSalt } from "./support/StrictGate.harness.ts";
import type { TelemetryRefusalTag } from "@beep/observability/catalog";

const SpanBody = S.Struct({
  resourceSpans: S.Array(
    S.Struct({
      resource: S.Unknown,
      scopeSpans: S.Array(S.Struct({ scope: S.Unknown, spans: S.Array(S.Unknown) })),
    })
  ),
});
const decodeSpanBody = S.decodeUnknownEffect(SpanBody);
const decodeShapeOnlySpan = S.decodeUnknownEffect(ShapeOnlySpan);
const decodeSpans = (spans: ReadonlyArray<unknown>) =>
  Effect.forEach(spans, (span) => decodeShapeOnlySpan(span, { onExcessProperty: "error" }));

type Gate = Effect.Success<ReturnType<typeof makeStrictGate>>;

const countOf = (ledger: HashMap.HashMap<TelemetryRefusalTag, number>, tag: TelemetryRefusalTag): number =>
  O.getOrElse(HashMap.get(ledger, tag), () => 0);

const exportedSpans = Effect.fnUntraced(function* (gate: Gate) {
  const body = yield* bodyJson(gate.serialization.traces(representativeTraces())).pipe(Effect.flatMap(decodeSpanBody));
  return A.flatMap(body.resourceSpans, (resource) => A.flatMap(resource.scopeSpans, (scope) => scope.spans));
});

// Rules that guard content; span ids, timestamps and names guard linkage and
// are checked by their own test.
const contentRules = A.filter(
  GateRule.literals,
  (rule) => rule !== "span-ids" && rule !== "span-timestamps" && rule !== "span-name" && rule !== "metric-values"
);

const MetricsBody = S.fromJsonString(
  S.Struct({
    resourceMetrics: S.Array(
      S.Struct({
        scopeMetrics: S.Array(S.Struct({ metrics: S.Array(S.Record(S.String, S.Unknown)) })),
      })
    ),
  })
);
const decodeMetricsBody = S.decodeUnknownEffect(MetricsBody);

// The exported metric entries with the given name, as decoded JSON records.
const exportedMetrics = Effect.fnUntraced(function* (rules: GateRules, name: string) {
  const gate = yield* makeStrictGate(demoConfig(rules));
  const body = yield* decodeMetricsBody(bodyText(gate.serialization.metrics(representativeMetrics())));
  const metrics = A.flatMap(body.resourceMetrics, (resource) =>
    A.flatMap(resource.scopeMetrics, (scope) => scope.metrics)
  );
  return { gate, metrics: A.filter(metrics, (metric) => metric.name === name) };
});

const leaks = Effect.fnUntraced(function* (rules: GateRules) {
  const gate = yield* makeStrictGate(demoConfig(rules));
  return A.some(
    [
      bodyText(gate.serialization.traces(representativeTraces())),
      bodyText(gate.serialization.metrics(representativeMetrics())),
      bodyText(gate.serialization.logs(representativeLogs())),
    ],
    Str.includes(batchCanary())
  );
});

const encodeUnknownJson = S.encodeUnknownEffect(S.fromJsonString(S.Unknown));

describe("StrictGate", () => {
  it.layer(layerTestSalt, { timeout: "10 seconds" })((it) => {
    it.effect("exports only tool spans, in the shape-only wire shape, under their tool ids", () =>
      Effect.gen(function* () {
        const gate = yield* makeStrictGate(demoConfig());
        const spans = yield* exportedSpans(gate).pipe(Effect.flatMap(decodeSpans));
        expect(A.map(spans, (span) => span.name)).toEqual(["lookup", "search"]);
        for (const span of spans) {
          expect(span.events).toEqual([]);
          expect(span.links).toEqual([]);
          expect(span.status).toEqual({ code: span.name === "search" ? 2 : 1 });
          expect([span.startTimeUnixNano, span.endTimeUnixNano]).toEqual([
            "1700000100000000000",
            "1700000100000000000",
          ]);
        }
        expect(A.map(spans, (span) => A.map(span.attributes, (attribute) => attribute.key))).toEqual([
          ["beep.privacy_tier", "beep.demo.tool", "beep.duration_bucket"],
          ["beep.demo.tool", "beep.duration_bucket"],
        ]);
        expect(A.map(spans, (span) => A.map(span.attributes, (attribute) => attribute.value.stringValue))).toEqual([
          ["shape-only", "lookup", "50ms"],
          ["search", "5s"],
        ]);
      })
    );

    it.effect("keys ids per batch: parent links hold inside a batch and nothing links across batches", () =>
      Effect.gen(function* () {
        const gate = yield* makeStrictGate(demoConfig());
        const first = yield* exportedSpans(gate).pipe(Effect.flatMap(decodeSpans));
        const second = yield* exportedSpans(gate).pipe(Effect.flatMap(decodeSpans));
        const idsOf = A.flatMap((span: ShapeOnlySpan) => [span.traceId, span.spanId]);
        // The handler span still names the dispatch span as its parent, and both share one trace.
        expect(A.map(first, (span) => span.parentSpanId)).toEqual(
          expect.arrayContaining(A.map(A.take(first, 1), (span) => span.spanId))
        );
        expect(A.dedupe(A.map(first, (span) => span.traceId))).toHaveLength(1);
        expect(idsOf(first)).not.toContain("b7ad6b7169203331");
        expect(A.intersection(idsOf(first), idsOf(second))).toEqual([]);
      })
    );

    it.effect("counts every span-level drop under its refusal tag", () =>
      Effect.gen(function* () {
        const gate = yield* makeStrictGate(demoConfig());
        yield* exportedSpans(gate);
        const ledger = yield* gate.ledger;
        expect(countOf(ledger, "span-name-not-allowed")).toBe(1);
        expect(countOf(ledger, "attribute-not-allowed")).toBe(3);
        expect(countOf(ledger, "span-event-dropped")).toBe(1);
        expect(countOf(ledger, "span-link-dropped")).toBe(1);
        expect(countOf(ledger, "span-status-message-dropped")).toBe(1);
        expect(countOf(ledger, "resource-rebuilt")).toBe(1);
      })
    );

    it.effect("rebuilds the resource from constants and names no host", () =>
      Effect.gen(function* () {
        const gate = yield* makeStrictGate(demoConfig());
        const text = bodyText(gate.serialization.traces(representativeTraces()));
        expect(Str.includes(batchCanary())(text)).toBe(false);
        expect(Str.includes("host.name")(text)).toBe(false);
        expect(Str.includes('"key":"beep.key_epoch"')(text)).toBe(true);
      })
    );

    it.effect("keeps allowlisted metric points, refuses the rest, and appends the refusal counter", () =>
      Effect.gen(function* () {
        const gate = yield* makeStrictGate(demoConfig());
        const text = bodyText(gate.serialization.metrics(representativeMetrics()));
        const ledger = yield* gate.ledger;
        expect(countOf(ledger, "metric-not-allowed")).toBe(2);
        expect(countOf(ledger, "metric-attribute-not-allowed")).toBe(1);
        expect(Str.includes(batchCanary())(text)).toBe(false);
        expect(Str.includes('"name":"beep.demo.calls"')(text)).toBe(true);
        expect(Str.includes('"name":"beep.telemetry.refused"')(text)).toBe(true);
        expect(Str.includes('"stringValue":"metric-not-allowed"')(text)).toBe(true);
      })
    );

    it.effect("drops every log record and counts each one", () =>
      Effect.gen(function* () {
        const gate = yield* makeStrictGate(demoConfig());
        const text = bodyText(gate.serialization.logs(representativeLogs()));
        expect(text).toBe('{"resourceLogs":[]}');
        expect(countOf(yield* gate.ledger, "log-record-dropped")).toBe(2);
      })
    );

    it.effect("leaks nothing with every rule on and lets the canary through when any content rule is off", () =>
      Effect.gen(function* () {
        expect(yield* leaks(StrictGateRulesOn)).toBe(false);
        for (const rule of contentRules) {
          expect([rule, yield* leaks({ ...StrictGateRulesOn, [rule]: false })]).toEqual([rule, true]);
        }
      })
    );

    it.effect.prop(
      "leaks the canary exactly when some content rule is off, for any rule table",
      [Arbitrary.schema(GateRules)],
      ([rules]) =>
        Effect.gen(function* () {
          expect(yield* leaks(rules)).toBe(A.some(contentRules, (rule) => !rules[rule]));
        }),
      { arbitrary: fcRuns(25) }
    );

    it.effect("floors every number point and histogram count onto the 1/2.5/5 ladder", () =>
      Effect.gen(function* () {
        expect(A.map([0, 0.4, 1, 2.4, 3.7, 9, 24, 26, 1_234_567, 9e15, -42], coarsenMetricValue)).toEqual([
          0, 0, 1, 2, 2, 5, 10, 25, 1_000_000, 1_000_000_000_000, -25,
        ]);
        const { metrics } = yield* exportedMetrics(StrictGateRulesOn, "beep.demo.calls");
        const text = yield* encodeUnknownJson(metrics);
        expect(Str.includes('"asInt":1000000')(text)).toBe(true);
        expect(Str.includes('"asDouble":2')(text)).toBe(true);
        expect(Str.includes("1234567")(text)).toBe(false);
        expect(Str.includes("3.7")(text)).toBe(false);
      })
    );

    it.effect("keeps histogram bounds, coarsens its counts and drops sum, min and max", () =>
      Effect.gen(function* () {
        const { gate, metrics } = yield* exportedMetrics(StrictGateRulesOn, "beep.demo.latency");
        const text = yield* encodeUnknownJson(metrics);
        expect(Str.includes('"count":1000')(text)).toBe(true);
        expect(Str.includes('"bucketCounts":[2,10,1000]')(text)).toBe(true);
        expect(Str.includes('"explicitBounds":[10,100]')(text)).toBe(true);
        for (const key of ['"sum":', '"min":', '"max":']) {
          expect([key, Str.includes(key)(text)]).toEqual([key, false]);
        }
        expect(countOf(yield* gate.ledger, "metric-value-dropped")).toBe(3);
      })
    );

    it.effect("refuses an exponential histogram series and counts it", () =>
      Effect.gen(function* () {
        const { gate, metrics } = yield* exportedMetrics(StrictGateRulesOn, "beep.demo.latency");
        expect(Str.includes("exponentialHistogram")(yield* encodeUnknownJson(metrics))).toBe(false);
        // The exponential series and the unknown metric name.
        expect(countOf(yield* gate.ledger, "metric-not-allowed")).toBe(2);
      })
    );

    it.effect("exports raw values and histogram aggregates when the metric-values rule is off", () =>
      Effect.gen(function* () {
        const { metrics: calls } = yield* exportedMetrics(
          { ...StrictGateRulesOn, "metric-values": false },
          "beep.demo.calls"
        );
        const { metrics: latency } = yield* exportedMetrics(
          { ...StrictGateRulesOn, "metric-values": false },
          "beep.demo.latency"
        );
        expect(Str.includes('"asInt":1234567')(yield* encodeUnknownJson(calls))).toBe(true);
        const latencyText = yield* encodeUnknownJson(latency);
        expect(Str.includes('"sum":98765.4')(latencyText)).toBe(true);
        expect(Str.includes("exponentialHistogram")(latencyText)).toBe(true);
      })
    );

    it.effect("exports raw ids, raw times and unmapped names when those rules are off", () =>
      Effect.gen(function* () {
        const off = (rule: "span-ids" | "span-timestamps" | "span-name") =>
          makeStrictGate(demoConfig({ ...StrictGateRulesOn, [rule]: false })).pipe(
            Effect.flatMap(exportedSpans),
            Effect.flatMap(encodeUnknownJson)
          );
        expect(Str.includes('"spanId":"b7ad6b7169203331"')(yield* off("span-ids"))).toBe(true);
        expect(Str.includes('"startTimeUnixNano":"1700000123456789000"')(yield* off("span-timestamps"))).toBe(true);
        expect(Str.includes('"name":"db.query"')(yield* off("span-name"))).toBe(true);
      })
    );
  });
});

describe("strict tier", () => {
  it.effect("never lets a strict desktop resolve above shape-only", () =>
    Effect.sync(() => {
      for (const identitySource of ["vouched", "self-claimed"] as const) {
        const context = StrictDesktop.make({ identitySource });
        for (const requested of TelemetryTier.literals) {
          expect(effectiveTier(context, requested)).toBe("shape-only");
        }
      }
    })
  );

  it.effect("buckets durations by their upper bound", () =>
    Effect.sync(() => {
      expect(A.map([0, 10, 11, 999, 1_000, 2_501, 10_000, 10_001], durationBucketOf)).toEqual([
        "10ms",
        "10ms",
        "50ms",
        "1s",
        "1s",
        "5s",
        "10s",
        "over-10s",
      ]);
    })
  );
});

const demoCalls = Metric.counter("beep.demo.calls", { description: "Demo tool calls by tool." });

const strictOtlp = layerStrictOtlp(demoConfig()).pipe(
  Layer.provideMerge(layerInMemoryEgressSink()),
  Layer.provide(layerTestSalt)
);

describe("layerStrictOtlp", () => {
  it.layer(strictOtlp, { timeout: "10 seconds" })((it) => {
    it.effect("exports through the gate, holds every body back, and counts the refused egress", () =>
      Effect.gen(function* () {
        yield* Effect.logError(batchCanary()).pipe(Effect.withSpan("mcp.tool.call.lookup"));
        yield* Metric.update(Metric.withAttributes(demoCalls, { "beep.demo.tool": "lookup" }), 1);
        yield* (yield* OtlpExporter.Flusher).flush;
        const ledger = yield* (yield* StrictGate).ledger;
        expect(countOf(ledger, "egress-refused")).toBeGreaterThanOrEqual(3);
        expect(countOf(ledger, "log-record-dropped")).toBe(1);

        const records = yield* (yield* StrictEgressSink).records;
        expect(A.dedupe(A.map(records, (record) => record.signal))).toEqual(
          expect.arrayContaining(["traces", "metrics", "logs"])
        );
        expect(A.some(records, (record) => Str.includes(batchCanary())(record.body))).toBe(false);
        expect(
          A.some(records, (record) => record.signal === "traces" && Str.includes('"name":"lookup"')(record.body))
        ).toBe(true);
        expect(
          A.some(
            records,
            (record) => record.signal === "metrics" && Str.includes('"name":"beep.demo.calls"')(record.body)
          )
        ).toBe(true);
      })
    );
  });
});

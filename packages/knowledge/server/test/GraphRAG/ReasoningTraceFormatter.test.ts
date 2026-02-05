import { InferenceProvenance, InferenceResult, InferenceStats } from "@beep/knowledge-domain/value-objects";
import { InferenceStep, ReasoningTrace } from "@beep/knowledge-server/GraphRAG/AnswerSchemas";
import {
  ReasoningTraceFormatter,
  ReasoningTraceFormatterLive,
} from "@beep/knowledge-server/GraphRAG/ReasoningTraceFormatter";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Str from "effect/String";

const createEmptyInferenceResult = (): InferenceResult =>
  new InferenceResult({
    derivedTriples: [],
    provenance: {},
    stats: new InferenceStats({
      iterations: 0,
      triplesInferred: 0,
      durationMs: 0,
    }),
  });

const createSingleInferenceResult = (
  tripleId: string,
  ruleId: string,
  sourceQuads: ReadonlyArray<string>
): InferenceResult =>
  new InferenceResult({
    derivedTriples: [],
    provenance: {
      [tripleId]: new InferenceProvenance({
        ruleId,
        sourceQuads: [...sourceQuads],
      }),
    },
    stats: new InferenceStats({
      iterations: 1,
      triplesInferred: 1,
      durationMs: 10,
    }),
  });

const createChainedInferenceResult = (): InferenceResult =>
  new InferenceResult({
    derivedTriples: [],
    provenance: {
      triple3: new InferenceProvenance({
        ruleId: "rdfs:subClassOf-chain",
        sourceQuads: ["triple2"],
      }),
      triple2: new InferenceProvenance({
        ruleId: "rdfs:domain",
        sourceQuads: ["triple1"],
      }),
    },
    stats: new InferenceStats({
      iterations: 2,
      triplesInferred: 2,
      durationMs: 20,
    }),
  });

const createMultiSourceInferenceResult = (): InferenceResult =>
  new InferenceResult({
    derivedTriples: [],
    provenance: {
      derived1: new InferenceProvenance({
        ruleId: "owl:sameAs-transitivity",
        sourceQuads: ["source1", "source2", "source3"],
      }),
    },
    stats: new InferenceStats({
      iterations: 1,
      triplesInferred: 1,
      durationMs: 10,
    }),
  });

describe("ReasoningTraceFormatter", () => {
  describe("formatReasoningTrace", () => {
    effect(
      "returns None for explicit fact (not in provenance)",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const result = createEmptyInferenceResult();

        const trace = formatter.formatReasoningTrace(result, "explicit_triple");

        assertTrue(O.isNone(trace));
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "returns Some(ReasoningTrace) for inferred triple",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const result = createSingleInferenceResult("inferred_triple", "rdfs:subClassOf", ["source_quad"]);

        const trace = formatter.formatReasoningTrace(result, "inferred_triple");

        assertTrue(O.isSome(trace));
        if (O.isSome(trace)) {
          assertTrue(A.length(trace.value.inferenceSteps) > 0);
          assertTrue(trace.value.depth >= 1);
        }
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "includes rule name in inference steps",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const result = createSingleInferenceResult("inferred_triple", "rdfs:domain", ["source1"]);

        const trace = formatter.formatReasoningTrace(result, "inferred_triple");

        assertTrue(O.isSome(trace));
        if (O.isSome(trace)) {
          const firstStep = A.head(trace.value.inferenceSteps);
          assertTrue(O.isSome(firstStep));
          if (O.isSome(firstStep)) {
            strictEqual(firstStep.value.rule, "rdfs:domain");
          }
        }
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "includes source quads as premises",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const result = createMultiSourceInferenceResult();

        const trace = formatter.formatReasoningTrace(result, "derived1");

        assertTrue(O.isSome(trace));
        if (O.isSome(trace)) {
          const firstStep = A.head(trace.value.inferenceSteps);
          assertTrue(O.isSome(firstStep));
          if (O.isSome(firstStep)) {
            strictEqual(A.length(firstStep.value.premises), 3);
            assertTrue(A.contains(firstStep.value.premises, "source1"));
            assertTrue(A.contains(firstStep.value.premises, "source2"));
            assertTrue(A.contains(firstStep.value.premises, "source3"));
          }
        }
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "collects steps from inference chain",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const result = createChainedInferenceResult();

        const trace = formatter.formatReasoningTrace(result, "triple3");

        assertTrue(O.isSome(trace));
        if (O.isSome(trace)) {
          strictEqual(A.length(trace.value.inferenceSteps), 2);
        }
      }, Effect.provide(ReasoningTraceFormatterLive))
    );
  });

  describe("calculateDepth", () => {
    effect(
      "returns 0 for explicit facts",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const provenanceMap: Record<string, InferenceProvenance> = {};

        const depth = formatter.calculateDepth(provenanceMap, "explicit_triple");

        strictEqual(depth, 0);
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "returns 1 for directly inferred triple",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const provenanceMap: Record<string, InferenceProvenance> = {
          inferred: new InferenceProvenance({
            ruleId: "rdfs:subClassOf",
            sourceQuads: ["explicit_source"],
          }),
        };

        const depth = formatter.calculateDepth(provenanceMap, "inferred");

        strictEqual(depth, 1);
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "returns 2 for triple inferred from another inferred triple",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const provenanceMap: Record<string, InferenceProvenance> = {
          level2: new InferenceProvenance({
            ruleId: "rule2",
            sourceQuads: ["level1"],
          }),
          level1: new InferenceProvenance({
            ruleId: "rule1",
            sourceQuads: ["explicit"],
          }),
        };

        const depth = formatter.calculateDepth(provenanceMap, "level2");

        strictEqual(depth, 2);
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "returns correct depth for deep chains",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const provenanceMap: Record<string, InferenceProvenance> = {
          level5: new InferenceProvenance({
            ruleId: "rule5",
            sourceQuads: ["level4"],
          }),
          level4: new InferenceProvenance({
            ruleId: "rule4",
            sourceQuads: ["level3"],
          }),
          level3: new InferenceProvenance({
            ruleId: "rule3",
            sourceQuads: ["level2"],
          }),
          level2: new InferenceProvenance({
            ruleId: "rule2",
            sourceQuads: ["level1"],
          }),
          level1: new InferenceProvenance({
            ruleId: "rule1",
            sourceQuads: ["explicit"],
          }),
        };

        const depth = formatter.calculateDepth(provenanceMap, "level5");

        strictEqual(depth, 5);
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "handles cycles gracefully without infinite loop",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const provenanceMap: Record<string, InferenceProvenance> = {
          cycleA: new InferenceProvenance({
            ruleId: "rule1",
            sourceQuads: ["cycleB"],
          }),
          cycleB: new InferenceProvenance({
            ruleId: "rule2",
            sourceQuads: ["cycleA"],
          }),
        };

        const depth = formatter.calculateDepth(provenanceMap, "cycleA");

        assertTrue(depth >= 0);
        assertTrue(depth < 100);
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "takes maximum depth when multiple source quads",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const provenanceMap: Record<string, InferenceProvenance> = {
          target: new InferenceProvenance({
            ruleId: "join-rule",
            sourceQuads: ["shallow", "deep"],
          }),
          shallow: new InferenceProvenance({
            ruleId: "rule1",
            sourceQuads: ["explicit"],
          }),
          deep: new InferenceProvenance({
            ruleId: "rule2",
            sourceQuads: ["deeper"],
          }),
          deeper: new InferenceProvenance({
            ruleId: "rule3",
            sourceQuads: ["explicit"],
          }),
        };

        const depth = formatter.calculateDepth(provenanceMap, "target");

        strictEqual(depth, 3);
      }, Effect.provide(ReasoningTraceFormatterLive))
    );
  });

  describe("summarizeTrace", () => {
    effect(
      "formats single step trace",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const trace = new ReasoningTrace({
          inferenceSteps: [
            new InferenceStep({
              rule: "rdfs:subClassOf",
              premises: ["premise1"],
            }),
          ],
          depth: 1,
        });

        const summary = formatter.summarizeTrace(trace);

        assertTrue(Str.includes("1 step")(summary));
        assertTrue(Str.includes("rdfs:subClassOf")(summary));
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "formats multi-step trace with arrow separator",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const trace = new ReasoningTrace({
          inferenceSteps: [
            new InferenceStep({
              rule: "sameAs transitivity",
              premises: ["p1"],
            }),
            new InferenceStep({
              rule: "knows direct",
              premises: ["p2"],
            }),
            new InferenceStep({
              rule: "sameAs transitivity",
              premises: ["p3"],
            }),
          ],
          depth: 3,
        });

        const summary = formatter.summarizeTrace(trace);

        assertTrue(Str.includes("3 steps")(summary));
        assertTrue(Str.includes("sameAs transitivity -> knows direct -> sameAs transitivity")(summary));
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "uses plural 'steps' for multiple steps",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const trace = new ReasoningTrace({
          inferenceSteps: [
            new InferenceStep({
              rule: "rule1",
              premises: [],
            }),
            new InferenceStep({
              rule: "rule2",
              premises: [],
            }),
          ],
          depth: 2,
        });

        const summary = formatter.summarizeTrace(trace);

        assertTrue(Str.includes("2 steps")(summary));
        assertTrue(!Str.includes("2 step:")(summary));
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "uses singular 'step' for single step",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const trace = new ReasoningTrace({
          inferenceSteps: [
            new InferenceStep({
              rule: "rule1",
              premises: [],
            }),
          ],
          depth: 1,
        });

        const summary = formatter.summarizeTrace(trace);

        assertTrue(Str.includes("1 step:")(summary));
        assertTrue(!Str.includes("1 steps")(summary));
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "handles empty steps gracefully",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const trace = {
          inferenceSteps: [] as ReadonlyArray<InferenceStep>,
          depth: 1,
        } as ReasoningTrace;

        const summary = formatter.summarizeTrace(trace);

        strictEqual(summary, "No inference steps recorded");
      }, Effect.provide(ReasoningTraceFormatterLive))
    );

    effect(
      "starts with 'Inferred via'",
      Effect.fn(function* () {
        const formatter = yield* ReasoningTraceFormatter;
        const trace = new ReasoningTrace({
          inferenceSteps: [
            new InferenceStep({
              rule: "test-rule",
              premises: [],
            }),
          ],
          depth: 1,
        });

        const summary = formatter.summarizeTrace(trace);

        assertTrue(Str.startsWith("Inferred via")(summary));
      }, Effect.provide(ReasoningTraceFormatterLive))
    );
  });
});

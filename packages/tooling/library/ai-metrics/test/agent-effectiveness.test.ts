import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import {
  AgentEffectivenessAnnotationPlan,
  AgentEffectivenessAnnotationPlanInput,
  AgentEffectivenessDoctorInput,
  AgentEffectivenessPlannedAnnotation,
  AgentEffectivenessStatus,
  agentEffectivenessAnnotationPlanToJson,
  ensureAiMetricsDerivedStorage,
  makeAgentEffectivenessAnnotationCheckReport,
  makeAgentEffectivenessAnnotationPlan,
  makeAgentEffectivenessDoctorReport,
} from "@beep/repo-ai-metrics";
import { A, O } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path, pipe } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return yield* fs.makeTempDirectory();
    }),
    use,
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  );

const writeText = Effect.fn("AgentEffectivenessTest.writeText")(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

const seedScorecardWithCoverageGaps = Effect.fn("AgentEffectivenessTest.seedScorecardWithCoverageGaps")(function* (
  coverageGapsJson: string
) {
  const duckdb = yield* DuckDb;
  yield* ensureAiMetricsDerivedStorage;
  yield* duckdb.run(
    `INSERT OR REPLACE INTO ai_metrics_scorecards (
      scorecard_id,
      config_snapshot_id,
      window_start_epoch_ms,
      window_end_epoch_ms,
      total_score,
      outcome_score,
      flow_score,
      cost_score,
      task_count,
      label_count,
      benchmark_run_count,
      completion_ready,
      coverage_gaps_json
    ) VALUES (
      $scorecardId,
      $configSnapshotId,
      $windowStartEpochMillis,
      $windowEndEpochMillis,
      $totalScore,
      $outcomeScore,
      $flowScore,
      $costScore,
      $taskCount,
      $labelCount,
      $benchmarkRunCount,
      $completionReady,
      $coverageGapsJson
    )`,
    {
      benchmarkRunCount: 0,
      completionReady: false,
      configSnapshotId: "config-snapshot-test",
      costScore: 0,
      coverageGapsJson,
      flowScore: 0,
      labelCount: 0,
      outcomeScore: 0,
      scorecardId: "scorecard-test",
      taskCount: 1,
      totalScore: 0,
      windowEndEpochMillis: 2,
      windowStartEpochMillis: 1,
    }
  );
});

const seedOutcomeLabel = Effect.fn("AgentEffectivenessTest.seedOutcomeLabel")(function* ({
  labelId,
  labeledAtEpochMillis,
}: {
  readonly labelId: string;
  readonly labeledAtEpochMillis: number;
}) {
  const duckdb = yield* DuckDb;
  yield* ensureAiMetricsDerivedStorage;
  yield* duckdb.run(
    `INSERT OR REPLACE INTO ai_metrics_outcome_labels (
      label_id,
      agent_task_id,
      rating,
      passed,
      quality_gate,
      intervention_count,
      follow_up_fix,
      note,
      labeled_at_epoch_ms
    ) VALUES (
      $labelId,
      $agentTaskId,
      $rating,
      $passed,
      $qualityGate,
      $interventionCount,
      $followUpFix,
      $note,
      $labeledAtEpochMillis
    )`,
    {
      agentTaskId: "agent-task-relabeled",
      followUpFix: false,
      interventionCount: 0,
      labelId,
      labeledAtEpochMillis,
      note: null,
      passed: true,
      qualityGate: "passed",
      rating: 1,
    }
  );
});

const workerReportJson = `{
  "cleanup": { "deleteStatus": "completed", "stopStatus": "completed" },
  "otlp": { "status": "exported" },
  "workerEval": {
    "summary": { "completed": 2, "failed": 0, "selectedPackets": 2, "timedOut": 0 },
    "policyViolations": [{ "code": "missing-example" }]
  }
}`;

const workerReportJsonWithTwoViolations = `{
  "cleanup": { "deleteStatus": "completed", "stopStatus": "completed" },
  "otlp": { "status": "exported" },
  "workerEval": {
    "summary": { "completed": 2, "failed": 0, "selectedPackets": 2, "timedOut": 0 },
    "policyViolations": [{ "code": "missing-example" }, { "code": "missing-since" }]
  }
}`;

const runtimeLayer = (duckDbPath: string) =>
  Layer.mergeAll(
    NodeServices.layer,
    FetchHttpClient.layer,
    DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: duckDbPath }))
  );

const phoenixInventoryHttpLayer = Layer.succeed(
  HttpClient.HttpClient,
  HttpClient.make((request) =>
    Effect.gen(function* () {
      const url = HttpClientRequest.toUrl(request).pipe(
        O.map((value) => value.toString()),
        O.getOrElse(() => request.url)
      );
      const response =
        request.method === "POST" && url === "https://phoenix.test/graphql"
          ? Response.json({
              data: {
                datasetCount: 0,
                evaluatorCount: 0,
                projectCount: 1,
                projects: {
                  edges: [
                    {
                      node: {
                        hasTraces: true,
                        name: "beep-jsdoc-worker-eval",
                        recordCount: 12,
                        sessionAnnotationNames: [],
                        spanAnnotationNames: ["agent.loop.status"],
                        traceAnnotationsNames: ["agent.outcome"],
                        traceCount: 3,
                      },
                    },
                  ],
                },
                promptCount: 0,
                serverStatus: { insufficientStorage: false },
              },
            })
          : Response.json(
              { ok: true },
              {
                headers: {
                  "x-phoenix-server-version": "9.9.9-test",
                },
              }
            );

      return HttpClientResponse.fromWeb(request, response);
    })
  )
);

const phoenixRuntimeLayer = (duckDbPath: string) =>
  Layer.mergeAll(
    NodeServices.layer,
    phoenixInventoryHttpLayer,
    DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: duckDbPath }))
  );

describe("@beep/repo-ai-metrics agent-effectiveness", () => {
  it.effect("reports unavailable evidence as data instead of failing", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        yield* Effect.gen(function* () {
          const dataRoot = path.join(tmpDir, "metrics");
          const report = yield* makeAgentEffectivenessDoctorReport(
            new AgentEffectivenessDoctorInput({
              dataRoot,
              noPhoenix: true,
              workerEvalReportPath: path.join(tmpDir, "missing-worker-report.json"),
            })
          );

          expect(report.phoenix.status).toBe(AgentEffectivenessStatus.Enum.unavailable);
          expect(report.aiMetrics.status).toBe(AgentEffectivenessStatus.Enum.unavailable);
          expect(report.jsdocWorkerEval.status).toBe(AgentEffectivenessStatus.Enum.unavailable);
          expect(report.summary.status).toBe(AgentEffectivenessStatus.Enum.warning);
        }).pipe(provideScopedLayer(runtimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );

  it.effect("decodes the live Phoenix trace annotation field shape", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        yield* Effect.gen(function* () {
          const dataRoot = path.join(tmpDir, "metrics");
          const report = yield* makeAgentEffectivenessDoctorReport(
            new AgentEffectivenessDoctorInput({
              dataRoot,
              noPhoenix: false,
              phoenixBaseUrl: "https://phoenix.test",
              workerEvalReportPath: path.join(tmpDir, "missing-worker-report.json"),
            })
          );

          expect(report.phoenix.status).toBe(AgentEffectivenessStatus.Enum.passed);
          expect(report.phoenix.projectCount).toBe(1);
          expect(report.phoenix.version).toBe("9.9.9-test");
          expect(report.phoenix.projects[0]?.traceAnnotationNames).toEqual(["agent.outcome"]);
        }).pipe(provideScopedLayer(phoenixRuntimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );

  it.effect("resolves the default worker-eval manifest to the latest raw report", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        yield* Effect.gen(function* () {
          const dataRoot = path.join(tmpDir, "metrics");
          const initiativeRoot = path.join(tmpDir, "jsdoc-worker-eval");
          const manifestPath = path.join(initiativeRoot, "ops", "manifest.json");
          const rawReportPath = path.join(initiativeRoot, "history", "outputs", "latest-worker-eval.json");
          yield* writeText(rawReportPath, workerReportJson);
          yield* writeText(
            manifestPath,
            `{
              "evidence": [
                { "raw": "history/outputs/older-worker-eval.json" },
                { "raw": "history/outputs/latest-worker-eval.json" }
              ]
            }`
          );

          const report = yield* makeAgentEffectivenessDoctorReport(
            new AgentEffectivenessDoctorInput({
              dataRoot,
              noPhoenix: true,
              workerEvalReportPath: manifestPath,
            })
          );

          expect(report.jsdocWorkerEval.reportPath).toBe(rawReportPath);
          expect(report.jsdocWorkerEval.completedPackets).toBe(2);
          expect(report.jsdocWorkerEval.policyViolationCodes).toEqual(["missing-example"]);
        }).pipe(provideScopedLayer(runtimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );

  it.effect("plans sanitized worker annotations without draft JSDoc bodies", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        yield* Effect.gen(function* () {
          const dataRoot = path.join(tmpDir, "metrics");
          const workerReportPath = path.join(tmpDir, "worker-eval.json");
          yield* writeText(workerReportPath, workerReportJson);

          const plan = yield* makeAgentEffectivenessAnnotationPlan(
            new AgentEffectivenessAnnotationPlanInput({
              doctor: new AgentEffectivenessDoctorInput({
                dataRoot,
                noPhoenix: true,
                workerEvalReportPath: workerReportPath,
              }),
            })
          );
          const json = yield* agentEffectivenessAnnotationPlanToJson(plan);
          const check = makeAgentEffectivenessAnnotationCheckReport(plan);

          expect(json).not.toContain("draftJsDoc");
          expect(json).not.toContain("@example");
          expect(check.status).toBe(AgentEffectivenessStatus.Enum.passed);
          expect(
            pipe(
              plan.annotations,
              A.some((annotation) => annotation.name === "worker.policy_violation")
            )
          ).toBe(true);
        }).pipe(provideScopedLayer(runtimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );

  it.effect("disambiguates multi-entry scorecard and worker annotation ids", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        yield* Effect.gen(function* () {
          const dataRoot = path.join(tmpDir, "metrics");
          const workerReportPath = path.join(tmpDir, "worker-eval.json");
          yield* writeText(workerReportPath, workerReportJsonWithTwoViolations);
          yield* writeText(path.join(dataRoot, "derived", ".keep"), "");
          yield* seedScorecardWithCoverageGaps(`["no_labels","no_benchmark_runs"]`);

          const plan = yield* makeAgentEffectivenessAnnotationPlan(
            new AgentEffectivenessAnnotationPlanInput({
              doctor: new AgentEffectivenessDoctorInput({
                dataRoot,
                noPhoenix: true,
                workerEvalReportPath: workerReportPath,
              }),
            })
          );
          const annotationIds = pipe(
            plan.annotations,
            A.map((annotation) => annotation.annotationId)
          );
          const gapIds = pipe(
            plan.annotations,
            A.filter((annotation) => annotation.name === "scorecard.gap"),
            A.map((annotation) => annotation.annotationId)
          );
          const workerViolationIds = pipe(
            plan.annotations,
            A.filter((annotation) => annotation.name === "worker.policy_violation"),
            A.map((annotation) => annotation.annotationId)
          );

          expect(A.length(annotationIds)).toBe(A.length(A.dedupe(annotationIds)));
          expect(gapIds).toEqual([
            "ai-metrics:scorecard:scorecard-test:scorecard.gap:no_labels",
            "ai-metrics:scorecard:scorecard-test:scorecard.gap:no_benchmark_runs",
          ]);
          expect(workerViolationIds).toEqual([
            "jsdoc-worker-eval:worker-report:jsdoc-worker-eval-latest:worker.policy_violation:missing-example",
            "jsdoc-worker-eval:worker-report:jsdoc-worker-eval-latest:worker.policy_violation:missing-since",
          ]);
        }).pipe(provideScopedLayer(runtimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );

  it.effect("disambiguates relabeled task annotations by label id", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        yield* Effect.gen(function* () {
          const dataRoot = path.join(tmpDir, "metrics");
          yield* writeText(path.join(dataRoot, "derived", ".keep"), "");
          yield* seedOutcomeLabel({ labeledAtEpochMillis: 1, labelId: "label-first" });
          yield* seedOutcomeLabel({ labeledAtEpochMillis: 2, labelId: "label-second" });

          const plan = yield* makeAgentEffectivenessAnnotationPlan(
            new AgentEffectivenessAnnotationPlanInput({
              doctor: new AgentEffectivenessDoctorInput({
                dataRoot,
                noPhoenix: true,
                workerEvalReportPath: path.join(tmpDir, "missing-worker-report.json"),
              }),
            })
          );
          const labelIds = pipe(
            plan.annotations,
            A.filter((annotation) => annotation.targetRef === "agent-task-relabeled"),
            A.map((annotation) => annotation.annotationId)
          );
          const check = makeAgentEffectivenessAnnotationCheckReport(plan);

          expect(check.status).toBe(AgentEffectivenessStatus.Enum.passed);
          expect(A.length(labelIds)).toBe(8);
          expect(A.length(labelIds)).toBe(A.length(A.dedupe(labelIds)));
          expect(labelIds).toEqual([
            "ai-metrics:agent-task:agent-task-relabeled:agent.outcome.passed:label-second",
            "ai-metrics:agent-task:agent-task-relabeled:agent.outcome.rating:label-second",
            "ai-metrics:agent-task:agent-task-relabeled:agent.interventions:label-second",
            "ai-metrics:agent-task:agent-task-relabeled:agent.follow_up_fix:label-second",
            "ai-metrics:agent-task:agent-task-relabeled:agent.outcome.passed:label-first",
            "ai-metrics:agent-task:agent-task-relabeled:agent.outcome.rating:label-first",
            "ai-metrics:agent-task:agent-task-relabeled:agent.interventions:label-first",
            "ai-metrics:agent-task:agent-task-relabeled:agent.follow_up_fix:label-first",
          ]);
        }).pipe(provideScopedLayer(runtimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );

  it.effect("rejects forbidden private content in planned annotations", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        yield* Effect.gen(function* () {
          const dataRoot = path.join(tmpDir, "metrics");
          const basePlan = yield* makeAgentEffectivenessAnnotationPlan(
            new AgentEffectivenessAnnotationPlanInput({
              doctor: new AgentEffectivenessDoctorInput({
                dataRoot,
                noPhoenix: true,
                workerEvalReportPath: path.join(tmpDir, "missing-worker-report.json"),
              }),
            })
          );
          const plan = new AgentEffectivenessAnnotationPlan({
            annotations: [
              new AgentEffectivenessPlannedAnnotation({
                annotationId: "bad",
                metadata: { path: "/home/elpresidank/private.txt" },
                name: "agent.outcome.note",
                optimization: "minimize",
                source: "test",
                targetKind: "agent-task",
                targetRef: "task",
                value: "api_key=oops",
              }),
              new AgentEffectivenessPlannedAnnotation({
                annotationId: "bad",
                metadata: {},
                name: "agent.outcome.note",
                optimization: "minimize",
                source: "test",
                targetKind: "agent-task",
                targetRef: "task-duplicate",
                value: "safe",
              }),
            ],
            doctor: basePlan.doctor,
            generatedAt: basePlan.generatedAt,
            mutationPolicy: basePlan.mutationPolicy,
            schemaVersion: basePlan.schemaVersion,
            summary: basePlan.summary,
          });

          const report = makeAgentEffectivenessAnnotationCheckReport(plan);
          expect(report.status).toBe(AgentEffectivenessStatus.Enum.failed);
          expect(
            pipe(
              report.findings,
              A.map((finding) => finding.code)
            )
          ).toContain("private-home-path");
          expect(
            pipe(
              report.findings,
              A.map((finding) => finding.code)
            )
          ).toContain("secret-shaped-value");
          expect(
            pipe(
              report.findings,
              A.map((finding) => finding.code)
            )
          ).toContain("duplicate-annotation-id");
        }).pipe(provideScopedLayer(runtimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );

  it.effect("rejects forbidden private content in the embedded doctor report", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const plan = yield* makeAgentEffectivenessAnnotationPlan(
          new AgentEffectivenessAnnotationPlanInput({
            doctor: new AgentEffectivenessDoctorInput({
              dataRoot: "/home/beep-private/metrics",
              noPhoenix: true,
              workerEvalReportPath: "/home/beep-private/worker-eval.json",
            }),
          })
        );

        const report = makeAgentEffectivenessAnnotationCheckReport(plan);

        expect(report.status).toBe(AgentEffectivenessStatus.Enum.failed);
        expect(
          pipe(
            report.findings,
            A.map((finding) => finding.annotationId)
          )
        ).toContain("plan.doctor.dataRoot");
        expect(
          pipe(
            report.findings,
            A.map((finding) => finding.code)
          )
        ).toContain("private-home-path");
      }).pipe(provideScopedLayer(runtimeLayer(`${tmpDir}/metrics/derived/ai-metrics.duckdb`)))
    ).pipe(provideScopedLayer(NodeServices.layer))
  );
});

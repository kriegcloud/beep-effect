import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import {
  AgentEffectivenessAnnotationPlan,
  AgentEffectivenessAnnotationPlanInput,
  AgentEffectivenessDoctorInput,
  AgentEffectivenessPlannedAnnotation,
  AgentEffectivenessStatus,
  agentEffectivenessAnnotationPlanToJson,
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

const workerReportJson = `{
  "cleanup": { "deleteStatus": "completed", "stopStatus": "completed" },
  "otlp": { "status": "exported" },
  "workerEval": {
    "summary": { "completed": 2, "failed": 0, "selectedPackets": 2, "timedOut": 0 },
    "policyViolations": [{ "code": "missing-example" }]
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
                value: "SECRET_TOKEN=oops",
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
        }).pipe(provideScopedLayer(runtimeLayer(path.join(tmpDir, "metrics/derived/ai-metrics.duckdb"))));
      })
    ).pipe(provideScopedLayer(NodeServices.layer))
  );
});

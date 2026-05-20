import { AgentEffectivenessAnnotationCheckReport, AgentEffectivenessDoctorReport } from "@beep/repo-ai-metrics";
import { agentEffectivenessCommand } from "@beep/repo-cli/commands/AgentEffectiveness/index";
import { A } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path, pipe } from "effect";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";

const runAgentEffectivenessCommand = Command.runWith(agentEffectivenessCommand, { version: "0.0.0" });
const CommandTestLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);
const decodeDoctorReport = S.decodeUnknownEffect(S.fromJsonString(AgentEffectivenessDoctorReport));
const decodeAnnotationCheckReport = S.decodeUnknownEffect(S.fromJsonString(AgentEffectivenessAnnotationCheckReport));

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const workerReportJson = `{
  "cleanup": { "deleteStatus": "completed", "stopStatus": "completed" },
  "otlp": { "status": "exported" },
  "workerEval": {
    "summary": { "completed": 1, "failed": 0, "selectedPackets": 1, "timedOut": 0 },
    "policyViolations": []
  }
}`;

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      process.exitCode = 0;
      return yield* fs.makeTempDirectory();
    }),
    use,
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        process.exitCode = 0;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  ).pipe(provideScopedLayer(CommandTestLayer));

const writeText = Effect.fn("AgentEffectivenessCommandTest.writeText")(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

const lastLoggedLine = Effect.fn("AgentEffectivenessCommandTest.lastLoggedLine")(function* () {
  const last = pipe(yield* TestConsole.logLines, A.last);
  if (last._tag === "Some") {
    return last.value;
  }

  return "";
});

describe("agent-effectiveness command", () => {
  it.effect("emits report-only doctor JSON with offline Phoenix", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        const dataRoot = path.join(tmpDir, "metrics");
        const workerReportPath = path.join(tmpDir, "worker-eval.json");
        yield* writeText(workerReportPath, workerReportJson);

        yield* runAgentEffectivenessCommand([
          "doctor",
          "--data-root",
          dataRoot,
          "--worker-eval-report",
          workerReportPath,
          "--no-phoenix",
          "--json",
        ]);

        const output = yield* lastLoggedLine();
        const report = yield* decodeDoctorReport(output);
        expect(report.phoenix.status).toBe("unavailable");
        expect(report.jsdocWorkerEval.completedPackets).toBe(1);
        expect(process.exitCode).toBe(0);
      })
    )
  );

  it.effect("emits report-only annotation check JSON", () =>
    withTempDirectory((tmpDir) =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        const dataRoot = path.join(tmpDir, "metrics");
        const workerReportPath = path.join(tmpDir, "worker-eval.json");
        yield* writeText(workerReportPath, workerReportJson);

        yield* runAgentEffectivenessCommand([
          "annotations",
          "check",
          "--data-root",
          dataRoot,
          "--worker-eval-report",
          workerReportPath,
          "--no-phoenix",
          "--json",
        ]);

        const output = yield* lastLoggedLine();
        const report = yield* decodeAnnotationCheckReport(output);
        expect(report.status).toBe("passed");
        expect(report.annotationCount).toBeGreaterThan(0);
        expect(process.exitCode).toBe(0);
      })
    )
  );
});

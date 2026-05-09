import { appendTurboSummary } from "@beep/repo-cli/commands/Ci";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { describe, expect, it } from "vitest";

const TestLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const withTempRepo = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      const previousGithubStepSummary = process.env.GITHUB_STEP_SUMMARY;

      process.chdir(tmpDir);
      delete process.env.GITHUB_STEP_SUMMARY;
      yield* fs.makeDirectory(".git", { recursive: true });

      return { fs, previousCwd, previousGithubStepSummary, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, previousGithubStepSummary, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        if (previousGithubStepSummary === undefined) {
          delete process.env.GITHUB_STEP_SUMMARY;
        } else {
          process.env.GITHUB_STEP_SUMMARY = previousGithubStepSummary;
        }
        yield* fs.remove(tmpDir, { recursive: true });
      })
  ).pipe(Effect.provide(TestLayer));

describe("CI commands", () => {
  it("renders current Turbo summary files whose tasks are arrays", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const summaryPath = path.join(process.cwd(), ".turbo", "runs", "summary.json");

          yield* fs.makeDirectory(path.dirname(summaryPath), { recursive: true });
          yield* fs.writeFileString(
            summaryPath,
            encodeJson({
              execution: {
                attempted: 1,
                command: "turbo run test",
                endTime: 2_000,
                startTime: 0,
                success: 1,
              },
              tasks: [
                {
                  cache: {
                    local: true,
                    remote: false,
                    status: "HIT",
                  },
                  execution: {
                    endTime: 1_250,
                    startTime: 250,
                  },
                  resolvedTaskDefinition: {
                    cache: true,
                  },
                  taskId: "@beep/repo-cli#test",
                },
              ],
            })
          );

          yield* appendTurboSummary(O.some(summaryPath));

          const output = (yield* TestConsole.logLines).join("\n");
          expect(output).toContain("## Turbo Summary");
          expect(output).toContain("Attempted tasks: 1");
          expect(output).toContain("`@beep/repo-cli#test`");
        })
      )
    );
  });
});

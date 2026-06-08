import {
  buildQualityIssueIndex,
  buildYeetRunPlanForTesting,
  commandTextForStep,
  decodeTurboPlanTasksFromQueryJsonForTesting,
  gitPathListFromNulOutputForTesting,
  jsonObjectTextFromMixedOutputForTesting,
  publishPathsOutsideIntentForTesting,
  publishRestagePathsForTesting,
  qualityIssuesFromStepResult,
  RepoPlanStep,
  RepoRunContext,
  RepoStepRunResult,
  renderPackageQualityPacketMarkdown,
  repoProofStepDefinition,
  TurboPlanSnapshot,
  TurboPlanTask,
  TurboWorkspacePackage,
} from "@beep/repo-cli/test/Yeet";
import { Effect } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import { describe, expect, it } from "vitest";

const turboTask = (
  task: string,
  packageName = "@beep/repo-cli",
  packagePath = "packages/tooling/tool/cli"
): TurboPlanTask =>
  TurboPlanTask.make({
    taskId: `${packageName}#${task}`,
    packageName,
    packagePath,
    task,
  });

const turboPackage = (name: string, path: string): TurboWorkspacePackage =>
  TurboWorkspacePackage.make({
    name,
    path,
  });

const turboPackageFromTask = (task: TurboPlanTask): O.Option<TurboWorkspacePackage> =>
  task.packageName !== undefined && task.packagePath !== undefined
    ? O.some(turboPackage(task.packageName, task.packagePath))
    : O.none();

const turboPackagesFromTasks = (tasks: ReadonlyArray<TurboPlanTask>): ReadonlyArray<TurboWorkspacePackage> =>
  pipe(
    tasks,
    A.map(turboPackageFromTask),
    A.getSomes,
    A.dedupeWith((left, right) => left.name === right.name && left.path === right.path)
  );

const turboSnapshot = (
  tasks: ReadonlyArray<TurboPlanTask>,
  packages: ReadonlyArray<TurboWorkspacePackage> = turboPackagesFromTasks(tasks)
): TurboPlanSnapshot =>
  TurboPlanSnapshot.make({
    graphHealthStatus: "ok",
    graphHealthWarnings: [],
    turboVersion: "2.9.16",
    packages,
    tasks,
  });

const contextWithTasks = (
  tasks: ReadonlyArray<TurboPlanTask>,
  packages: ReadonlyArray<TurboWorkspacePackage> = turboPackagesFromTasks(tasks)
): RepoRunContext =>
  RepoRunContext.make({
    repoRoot: "/repo",
    cwd: "/repo",
    base: "origin/main",
    head: "feature/head",
    branch: "repo-cli-yeet",
    packetDir: ".beep/yeet",
    originalArgv: [],
    turbo: turboSnapshot(tasks, packages),
  });

const context = contextWithTasks([turboTask("build"), turboTask("check"), turboTask("lint"), turboTask("test")]);

const feedbackStep = (label: string, task: string): RepoPlanStep =>
  RepoPlanStep.make({
    id: `feedback:test-${task}`,
    label,
    phase: "feedback",
    command: "bun",
    args: ["run", task],
    cwd: "/repo",
    scope: "package",
    mutability: "readonly",
    resume: "fingerprint-match",
    packageName: "@beep/repo-cli",
    packagePath: "packages/tooling/tool/cli",
    task,
  });

const repoScopedFeedbackStep = (label: string, task: string, filters: ReadonlyArray<string>): RepoPlanStep =>
  RepoPlanStep.make({
    id: `feedback:test-${task}`,
    label,
    phase: "feedback",
    command: "bun",
    args: ["run", task, "--", ...filters],
    cwd: "/repo",
    scope: "repo",
    mutability: "readonly",
    resume: "never",
    task,
  });

const findStep = (steps: ReadonlyArray<RepoPlanStep>, label: string): RepoPlanStep =>
  pipe(
    steps,
    A.findFirst((step) => step.label === label),
    O.getOrThrow
  );

describe("yeet planner", () => {
  it("builds publish as commit, pre-push proof, then push", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.some("feat(repo-cli): add yeet") });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual(["commit:git:commit", "full:pre-push", "publish:git:push"]);
    expect(
      pipe(
        plan.steps,
        A.map((step) => step.phase),
        A.dedupe
      )
    ).toEqual(["commit", "full", "publish"]);

    const commit = findStep(plan.steps, "commit:git:commit");
    const proof = findStep(plan.steps, "full:pre-push");
    const push = findStep(plan.steps, "publish:git:push");

    expect(commit.args).toEqual(["commit", "-m", "feat(repo-cli): add yeet"]);
    expect(proof.args).toEqual(["run", "beep", "quality", "github-checks", "pre-push"]);
    expect(proof.mutability).toBe("readonly");
    expect(push.args).toEqual(["push", "-u", "origin", "HEAD"]);
    expect(
      pipe(
        plan.steps,
        A.map((step) => step.args)
      )
    ).not.toContainEqual(["add", "-A"]);
  });

  it("builds verify as only the canonical pre-push proof", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.none(), mode: "verify" });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual(["full:pre-push"]);
    expect(
      pipe(
        plan.steps,
        A.map((step) => step.mutability),
        A.dedupe
      )
    ).toEqual(["readonly"]);
  });

  it("builds review-fix verify as the targeted review proof", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.none(), mode: "verify", tier: "review-fix" });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual(["full:review-fix"]);
    expect(findStep(plan.steps, "full:review-fix").args).toEqual([
      "run",
      "beep",
      "quality",
      "github-checks",
      "review-fix",
      "--base",
      "origin/main",
      "--head",
      "feature/head",
    ]);
  });

  it("builds closeout as PR context plus review gates", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.none(), mode: "closeout" });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual(["closeout:pr-context", "closeout:review-gates"]);
    expect(findStep(plan.steps, "closeout:pr-context").args).toEqual([
      "pr",
      "view",
      "--json",
      "number,headRefName,state,url,headRefOid,isDraft",
    ]);
  });

  it("builds amend no-edit publish without requiring a new message", () => {
    const plan = buildYeetRunPlanForTesting({
      amend: true,
      context,
      message: O.none(),
      mode: "publish",
      noEdit: true,
    });

    expect(findStep(plan.steps, "commit:git:commit:amend").args).toEqual(["commit", "--amend", "--no-edit"]);
  });

  it("builds monitor as current branch PR context plus check watching", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.none(), mode: "monitor" });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual(["monitor:pr-context", "monitor:pr-checks:watch"]);
    expect(findStep(plan.steps, "monitor:pr-context").args).toEqual([
      "pr",
      "view",
      "--json",
      "number,headRefName,state",
    ]);
    expect(findStep(plan.steps, "monitor:pr-checks:watch").args).toEqual(["pr", "checks", "--watch"]);
  });

  it("builds fast-plus-monitor publish without the local full proof", () => {
    const plan = buildYeetRunPlanForTesting({
      context,
      fast: true,
      message: O.some("feat(repo-cli): add yeet"),
      monitor: true,
    });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual(["commit:git:commit", "publish:git:push", "monitor:pr-context", "monitor:pr-checks:watch"]);
    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).not.toContain("full:pre-push");
  });

  it("keeps publish monitor on the full local proof unless fast is explicit", () => {
    const plan = buildYeetRunPlanForTesting({
      context,
      message: O.some("feat(repo-cli): add yeet"),
      monitor: true,
    });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual([
      "commit:git:commit",
      "full:pre-push",
      "publish:git:push",
      "monitor:pr-context",
      "monitor:pr-checks:watch",
    ]);
  });

  it("exposes the review-fix repo proof surface", () => {
    expect(repoProofStepDefinition("review-fix")).toMatchObject({
      args: ["quality", "github-checks", "review-fix"],
      label: "full:review-fix",
      surface: "review-fix",
    });
  });

  it("builds repair as deterministic generators plus affected feedback", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.none(), mode: "repair" });

    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual([
      "prepare:lint:fix",
      "prepare:docgen",
      "prepare:repo-exports:catalog",
      "feedback:build",
      "feedback:check",
      "feedback:lint",
      "feedback:test",
    ]);
    expect(findStep(plan.steps, "prepare:docgen").args).toEqual(["run", "docgen"]);
    expect(findStep(plan.steps, "prepare:repo-exports:catalog").args).toEqual(["run", "repo-exports:catalog"]);
  });

  it("uses the shared pre-push proof definition for Yeet parity", () => {
    const proof = repoProofStepDefinition("pre-push");

    expect(proof.args).toEqual(["quality", "github-checks", "pre-push"]);
    expect(proof.label).toBe("full:pre-push");
  });

  it("threads task-aware affected filters into repair feedback runs", () => {
    const scopedContext = contextWithTasks([
      turboTask("build"),
      turboTask("check"),
      turboTask("check", "@beep/schema", "packages/foundation/modeling/schema"),
      turboTask("lint"),
      turboTask("test"),
    ]);
    const plan = buildYeetRunPlanForTesting({
      context: scopedContext,
      message: O.some("feat(repo-cli): add yeet"),
      mode: "repair",
    });

    expect(findStep(plan.steps, "feedback:check").args).toEqual([
      "run",
      "check",
      "--",
      "--filter=@beep/repo-cli",
      "--filter=@beep/schema",
      "--concurrency=3",
      "--continue=dependencies-successful",
      "--summarize",
      "--ui=stream",
    ]);
    expect(findStep(plan.steps, "feedback:check").args).not.toContain("--affected");
    expect(findStep(plan.steps, "feedback:check").scope).toBe("repo");
    expect(findStep(plan.steps, "feedback:test").args).toEqual([
      "run",
      "test",
      "--",
      "--unit",
      "--types",
      "--filter=@beep/repo-cli",
      "--concurrency=3",
      "--continue=dependencies-successful",
      "--summarize",
      "--ui=stream",
    ]);
  });

  it("uses changed-file lint fix for write-mode repair", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.none(), mode: "repair" });
    const step = findStep(plan.steps, "prepare:lint:fix");

    expect(step.args).toEqual(["run", "lint:fix"]);
    expect(step.env).toBeUndefined();
  });

  it("omits repair feedback steps whose task has no affected packages", () => {
    const plan = buildYeetRunPlanForTesting({
      context: contextWithTasks([turboTask("build"), turboTask("lint")]),
      message: O.some("feat(repo-cli): add yeet"),
      mode: "repair",
    });

    expect(
      pipe(
        plan.steps,
        A.filter((step) => step.phase === "feedback"),
        A.map((step) => step.label)
      )
    ).toEqual(["feedback:build", "feedback:lint"]);
  });

  it("keeps repair feedback as a no-op instead of falling back to all packages", () => {
    const plan = buildYeetRunPlanForTesting({
      context: contextWithTasks([]),
      message: O.some("feat(repo-cli): add yeet"),
      mode: "repair",
    });

    expect(
      pipe(
        plan.steps,
        A.filter((step) => step.phase === "feedback")
      )
    ).toEqual([]);
    expect(
      pipe(
        plan.steps,
        A.map((step) => step.label)
      )
    ).toEqual(["prepare:lint:fix", "prepare:docgen", "prepare:repo-exports:catalog"]);
  });

  it("filters publish paths against the reviewed staged intent", () => {
    expect(gitPathListFromNulOutputForTesting("src/z.ts\0src/a.ts\0src/a.ts\0")).toEqual(["src/a.ts", "src/z.ts"]);
    expect(publishPathsOutsideIntentForTesting(["src/a.ts", "src/z.ts"], ["src/a.ts", "secrets/local.env"])).toEqual([
      "secrets/local.env",
    ]);
  });

  it("omits reviewed deletion paths from publish restaging", () => {
    expect(
      publishRestagePathsForTesting(
        ["scripts/removed.ts", "src/changed.ts", "src/new.ts"],
        ["src/changed.ts", "src/new.ts"]
      )
    ).toEqual(["src/changed.ts", "src/new.ts"]);
  });

  it("decodes Turbo affected query JSON into plan task metadata", () => {
    const tasks = Effect.runSync(
      decodeTurboPlanTasksFromQueryJsonForTesting(
        `{
          "data": {
            "affectedTasks": {
              "items": [
                {
                  "name": "check",
                  "fullName": "@beep/repo-cli#check",
                  "package": { "name": "@beep/repo-cli" },
                  "reason": { "__typename": "TaskFileChanged" }
                },
                {
                  "name": "lint",
                  "fullName": "@beep/schema#lint",
                  "package": { "name": "@beep/schema" },
                  "reason": { "__typename": "TaskDependencyChanged" }
                }
              ],
              "length": 2
            }
          }
        }`,
        `{
          "packageManager": "bun",
          "packages": {
            "count": 2,
            "items": [
              { "name": "@beep/repo-cli", "path": "packages/tooling/tool/cli" },
              { "name": "@beep/schema", "path": "packages/foundation/modeling/schema" }
            ]
          }
        }`
      )
    );

    expect(tasks).toEqual([
      expect.objectContaining({
        taskId: "@beep/repo-cli#check",
        packageName: "@beep/repo-cli",
        packagePath: "packages/tooling/tool/cli",
        task: "check",
      }),
      expect.objectContaining({
        taskId: "@beep/schema#lint",
        packageName: "@beep/schema",
        packagePath: "packages/foundation/modeling/schema",
        task: "lint",
      }),
    ]);
  });

  it("extracts the last decodable Turbo JSON object from mixed output", () => {
    const payload = `{"data":{"affectedTasks":{"items":[],"length":0},"message":"keeps } inside strings"}}`;
    const extracted = jsonObjectTextFromMixedOutputForTesting(
      `turbo warning {not-json}\n{"ignored":true}\n${payload}\ntrailing warning {still-not-json}`
    );

    expect(O.getOrThrow(extracted)).toBe(payload);
  });

  it("does not enable fingerprint resume until runtime skip execution exists", () => {
    const repairPlan = buildYeetRunPlanForTesting({ context, message: O.none(), mode: "repair" });
    const publishPlan = buildYeetRunPlanForTesting({ context, message: O.some("feat(repo-cli): add yeet") });

    expect(findStep(repairPlan.steps, "feedback:check").resume).toBe("never");
    expect(findStep(publishPlan.steps, "full:pre-push").resume).toBe("never");
    expect(findStep(publishPlan.steps, "commit:git:commit").resume).toBe("never");
  });

  it("quotes command text without changing argv", () => {
    const plan = buildYeetRunPlanForTesting({ context, message: O.some("feat(repo-cli): add yeet") });
    const commit = findStep(plan.steps, "commit:git:commit");

    expect(commit.args).toEqual(["commit", "-m", "feat(repo-cli): add yeet"]);
    expect(commandTextForStep(commit)).toBe("git commit -m 'feat(repo-cli): add yeet'");
  });
});

describe("yeet quality issue index", () => {
  it("parses known TypeScript diagnostics and falls back to raw command failures", () => {
    const checkStep = feedbackStep("feedback:check", "check");
    const testStep = feedbackStep("feedback:test", "test");
    const structuredIssues = qualityIssuesFromStepResult(
      context,
      checkStep,
      RepoStepRunResult.make({
        stepId: checkStep.id,
        commandText: "bun run check",
        exitCode: 1,
        output: "packages/tooling/tool/cli/src/example.ts:12:8 - error TS90001: unsafe effect(service) usage",
        rawOutputRef: ".beep/yeet/logs/check.log",
      })
    );
    const rawIssues = qualityIssuesFromStepResult(
      context,
      testStep,
      RepoStepRunResult.make({
        stepId: testStep.id,
        commandText: "bun run test",
        exitCode: 1,
        output: "FAIL packages/tooling/tool/cli/test/yeet.test.ts",
        rawOutputRef: ".beep/yeet/logs/test.log",
      })
    );

    expect(structuredIssues).toHaveLength(1);
    expect(structuredIssues[0]).toMatchObject({
      category: "effect-tsgo-policy",
      confidence: "structured",
      file: "packages/tooling/tool/cli/src/example.ts",
      line: 12,
      column: 8,
      packageName: "@beep/repo-cli",
    });
    expect(rawIssues).toHaveLength(1);
    expect(rawIssues[0]).toMatchObject({
      category: "test",
      confidence: "raw",
      packageName: "@beep/repo-cli",
    });

    const index = buildQualityIssueIndex([...rawIssues, ...structuredIssues]);

    expect(index.rawOutputRefs).toEqual([".beep/yeet/logs/check.log", ".beep/yeet/logs/test.log"]);
    expect(index.packages).toHaveLength(1);
    expect(index.packages[0]).toMatchObject({
      packageName: "@beep/repo-cli",
      packagePath: "packages/tooling/tool/cli",
      issueCount: 2,
      blockingCount: 2,
    });
  });

  it("renders deterministic per-package Markdown packets", () => {
    const checkStep = feedbackStep("feedback:check", "check");
    const lintStep = feedbackStep("feedback:lint", "lint");
    const firstIssues = qualityIssuesFromStepResult(
      context,
      checkStep,
      RepoStepRunResult.make({
        stepId: checkStep.id,
        commandText: "bun run check",
        exitCode: 1,
        output: "packages/tooling/tool/cli/src/example.ts:12:8 - error TS90001: unsafe effect(service) usage",
      })
    );
    const secondIssues = qualityIssuesFromStepResult(
      context,
      lintStep,
      RepoStepRunResult.make({
        stepId: lintStep.id,
        commandText: "bun run lint",
        exitCode: 1,
        output: "lint failed",
      })
    );
    const report = O.getOrThrow(A.head(buildQualityIssueIndex([...firstIssues, ...secondIssues]).packages));
    const reversedReport = O.getOrThrow(A.head(buildQualityIssueIndex([...secondIssues, ...firstIssues]).packages));
    const markdown = Result.getOrThrow(renderPackageQualityPacketMarkdown(report));
    const reversedMarkdown = Result.getOrThrow(renderPackageQualityPacketMarkdown(reversedReport));

    expect(markdown).toBe(reversedMarkdown);
    expect(markdown).toContain("# Yeet Quality Packet: @beep/repo\\-cli");
    expect(markdown).toContain("Effect tsgo diagnostic");
    expect(markdown).toContain("bun run check");
    expect(markdown).toContain("bun run lint");
  });

  it("keeps repo-scoped filtered raw failures attached to filtered packages", () => {
    const scopedContext = contextWithTasks([
      turboTask("test"),
      turboTask("test", "@beep/schema", "packages/foundation/modeling/schema"),
    ]);
    const step = repoScopedFeedbackStep("feedback:test", "test", ["--filter=@beep/repo-cli", "--filter=@beep/schema"]);
    const issues = qualityIssuesFromStepResult(
      scopedContext,
      step,
      RepoStepRunResult.make({
        stepId: step.id,
        commandText: "bun run test -- --filter=@beep/repo-cli --filter=@beep/schema",
        exitCode: 1,
        output: "FAIL unknown test output without a diagnostic path",
      })
    );
    const index = buildQualityIssueIndex(issues);

    expect(
      pipe(
        index.packages,
        A.map((report) => report.packageName)
      )
    ).toEqual(["@beep/repo-cli", "@beep/schema"]);
    expect(index.packages).toEqual([
      expect.objectContaining({
        packageName: "@beep/repo-cli",
        packagePath: "packages/tooling/tool/cli",
        issueCount: 1,
      }),
      expect.objectContaining({
        packageName: "@beep/schema",
        packagePath: "packages/foundation/modeling/schema",
        issueCount: 1,
      }),
    ]);
    expect(
      new Set(
        pipe(
          index.issues,
          A.map((issue) => issue.id)
        )
      ).size
    ).toBe(2);
    expect(
      pipe(
        index.issues,
        A.map((issue) => issue.id)
      )
    ).toEqual([
      "feedback:test-test::test::package:@beep/repo-cli::0::feedback:test failed with exit code 1.",
      "feedback:test-test::test::package:@beep/schema::0::feedback:test failed with exit code 1.",
    ]);
  });

  it("uses the workspace package catalog for full-proof diagnostic package attribution", () => {
    const fullContext = contextWithTasks(
      [turboTask("check")],
      [
        turboPackage("@beep/repo-cli", "packages/tooling/tool/cli"),
        turboPackage("@beep/schema", "packages/foundation/modeling/schema"),
      ]
    );
    const step = RepoPlanStep.make({
      id: "full:pre-push",
      label: "full:pre-push",
      phase: "full",
      command: "bun",
      args: ["run", "beep", "quality", "github-checks", "pre-push"],
      cwd: "/repo",
      scope: "repo",
      mutability: "readonly",
      resume: "never",
    });
    const issues = qualityIssuesFromStepResult(
      fullContext,
      step,
      RepoStepRunResult.make({
        stepId: step.id,
        commandText: "bun run beep quality github-checks pre-push",
        exitCode: 1,
        output: "packages/foundation/modeling/schema/src/example.ts:3:1 - error TS2322: nope",
      })
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      file: "packages/foundation/modeling/schema/src/example.ts",
      packageName: "@beep/schema",
      packagePath: "packages/foundation/modeling/schema",
    });
  });
});

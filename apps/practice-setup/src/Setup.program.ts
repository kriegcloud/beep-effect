/**
 * The bootstrapper run: install Claude Desktop if missing, let the lawyer
 * sign in, hand Claude the practice gateway, then open a new chat with the
 * onboarding message. It stops at the first failed step and always writes
 * its report.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import {
  ClaudeDesktopInstaller,
  ClaudeInstall,
  newChatLink,
  ONBOARDING_FIRST_MESSAGE,
  OPEN_CLAUDE_LINK,
  SetupReport,
  StepDone,
  StepFailed,
  StepOutcome,
  StepSkipped,
} from "./Setup.models.ts";
import { GatewayBundle, InstallerDownload, InstallWaitSchedule, Lawyer, SetupHost } from "./Setup.services.ts";
import type { SetupFailure } from "./Setup.errors.ts";
import type { SetupStep } from "./Setup.models.ts";

/**
 * File name of the run report inside the bootstrapper's state folder.
 *
 * **Example** (Read the report name)
 *
 * ```ts
 * import { REPORT_FILE } from "@/Setup.program"
 *
 * console.log(REPORT_FILE) // "last-run.json"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const REPORT_FILE = "last-run.json";

const failedAs =
  (step: SetupStep) =>
  <R>(effect: Effect.Effect<StepOutcome, SetupFailure, R>): Effect.Effect<StepOutcome, never, R> =>
    Effect.catchTag(effect, "SetupFailure", (failure) =>
      Effect.succeed(StepFailed.make({ step, detail: failure.message }))
    );

const installClaude = Effect.gen(function* () {
  const host = yield* SetupHost;
  const lawyer = yield* Lawyer;
  const download = yield* InstallerDownload;
  const path = yield* Path.Path;
  const step = "claude-desktop" as const;

  if ((yield* host.claudeInstall) !== ClaudeInstall.Enum.missing) {
    return StepSkipped.make({ step, detail: "Claude Desktop is already installed." });
  }
  yield* lawyer.tell("Installing Claude. This takes a minute or two.");
  const installer = path.join(yield* host.stateDir, `Claude-Setup-${ClaudeDesktopInstaller.version}.exe`);
  yield* download.fetch(ClaudeDesktopInstaller, installer);
  const exitCode = yield* host.runInstaller(installer, ClaudeDesktopInstaller.silentArgs);
  const schedule = yield* InstallWaitSchedule;
  const install = yield* host.claudeInstall.pipe(
    Effect.repeat({ schedule, until: (found) => found !== ClaudeInstall.Enum.missing })
  );
  return install === ClaudeInstall.Enum.missing
    ? StepFailed.make({
        step,
        detail: `Claude did not finish installing (installer exit code ${exitCode}). Install it from claude.com/download, then run this setup again.`,
      })
    : StepDone.make({ step, detail: `Claude Desktop ${ClaudeDesktopInstaller.version} is installed.` });
}).pipe(failedAs("claude-desktop"));

const signIn = Effect.gen(function* () {
  const host = yield* SetupHost;
  const lawyer = yield* Lawyer;
  yield* host.open(OPEN_CLAUDE_LINK);
  yield* lawyer.waitFor(
    "Claude is opening. Sign in with your Claude account there. When you can see Claude's message box, come back to this window."
  );
  return StepDone.make({ step: "claude-sign-in", detail: "Claude opened; the lawyer confirmed they are signed in." });
}).pipe(failedAs("claude-sign-in"));

const installGateway = Effect.gen(function* () {
  const host = yield* SetupHost;
  const lawyer = yield* Lawyer;
  const bundle = yield* GatewayBundle;
  const file = yield* bundle.materialize(yield* host.stateDir);
  yield* host.open(file);
  yield* lawyer.waitFor(
    [
      "Claude is showing the Beep Practice Gateway. Click Install and confirm, then come back to this window.",
      `If Claude did not show it, open Claude's Settings, choose Extensions, and drag this file onto that page: ${file}`,
    ].join("\n")
  );
  return StepDone.make({
    step: "gateway-extension",
    detail: "The gateway was handed to Claude; the lawyer confirmed the install.",
  });
}).pipe(failedAs("gateway-extension"));

const handOff = Effect.gen(function* () {
  const host = yield* SetupHost;
  const lawyer = yield* Lawyer;
  yield* host.open(newChatLink(ONBOARDING_FIRST_MESSAGE));
  yield* lawyer.tell(
    "Claude has your first message ready. Press Send in Claude and it will take you through the rest. You can close this window."
  );
  return StepDone.make({ step: "onboarding-handoff", detail: "Claude opened a new chat with the onboarding message." });
}).pipe(failedAs("onboarding-handoff"));

const runUntilFailure = <R>(
  pending: ReadonlyArray<Effect.Effect<StepOutcome, never, R>>,
  done: ReadonlyArray<StepOutcome>
): Effect.Effect<ReadonlyArray<StepOutcome>, never, R> =>
  A.matchLeft(pending, {
    onEmpty: () => Effect.succeed(done),
    onNonEmpty: (head, tail) =>
      Effect.flatMap(head, (outcome) =>
        StepOutcome.guards.failed(outcome)
          ? Effect.succeed(A.append(done, outcome))
          : runUntilFailure(tail, A.append(done, outcome))
      ),
  });

const encodeReport = S.encodeEffect(S.fromJsonString(SetupReport, { space: 2 }));

const writeReport = Effect.fnUntraced(function* (report: SetupReport) {
  const host = yield* SetupHost;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const file = path.join(yield* host.stateDir, REPORT_FILE);
  yield* fs.writeFileString(file, `${yield* encodeReport(report)}\n`);
});

/**
 * Run every bootstrapper step in order, stopping at the first failure, and
 * write the report to the state folder.
 *
 * **Details**
 *
 * The bootstrapper stays dumb (SPEC): it installs, opens and waits; the
 * onboarding agent inside Claude does everything else. A report that cannot
 * be written is logged, never fatal.
 *
 * **Example** (Run with fakes)
 *
 * ```ts
 * import { runSetup } from "@/Setup.program"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(runSetup))
 * ```
 *
 * @category programs
 * @since 0.0.0
 */
export const runSetup = Effect.gen(function* () {
  const lawyer = yield* Lawyer;
  yield* lawyer.tell("Setting up this computer for your practice.");
  const steps: ReadonlyArray<
    Effect.Effect<StepOutcome, never, SetupHost | Lawyer | InstallerDownload | GatewayBundle | Path.Path>
  > = [installClaude, signIn, installGateway, handOff];
  const outcomes = yield* runUntilFailure(steps, []);
  // runUntilFailure stops only at a failure, so no failure means every step ran.
  const failure = A.findFirst(outcomes, StepOutcome.guards.failed);
  const complete = O.isNone(failure);
  const report = SetupReport.make({ outcomes, complete, finishedAt: yield* DateTime.now });
  yield* writeReport(report).pipe(
    Effect.catchCause((cause) => Effect.logWarning("The setup report could not be written.", cause))
  );
  yield* O.match(failure, {
    onNone: () => Effect.void,
    // The console closes when the program exits, so hold it until the lawyer has read why.
    onSome: (failed) => Effect.ignore(lawyer.waitFor(`Setup stopped: ${failed.detail}`)),
  });
  return report;
}).pipe(Effect.withSpan("PracticeSetup.run"));

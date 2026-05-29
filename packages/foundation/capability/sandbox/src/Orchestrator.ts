/**
 * Agent iteration orchestration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { A, O, Str } from "@beep/utils";
import { Clock, DateTime, Duration, Effect, pipe } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { IterationUsage } from "./Agent.provider.ts";
import { AgentStreamEmitter, AgentStreamEvent } from "./AgentStreamEmitter.ts";
import { Display } from "./Display.ts";
import { ExpandPromptShellExpressionsOptions, expandPromptShellExpressions } from "./Prompt.ts";
import { AgentError, AgentIdleTimeoutError } from "./Sandbox.errors.ts";
import { profileSandboxPhase, redactSensitiveText } from "./Sandbox.observability.ts";
import { SandboxExecOptions } from "./Sandbox.provider.ts";
import type { AgentProvider } from "./Agent.provider.ts";
import type { SandboxError } from "./Sandbox.errors.ts";
import type { ExecResult, SandboxHandle } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("Orchestrator");
const DEFAULT_COMPLETION_SIGNAL = "<promise>COMPLETE</promise>";

/**
 * Per-iteration run result.
 *
 * @category models
 * @since 0.0.0
 */
export class IterationResult extends S.Class<IterationResult>($I`IterationResult`)(
  {
    sessionFilePath: S.optionalKey(S.String),
    sessionId: S.optionalKey(S.String),
    usage: S.optionalKey(IterationUsage),
  },
  $I.annote("IterationResult", {
    description: "Per-iteration run result.",
  })
) {}

/**
 * Commit summary produced by a run.
 *
 * @category models
 * @since 0.0.0
 */
export class CommitSummary extends S.Class<CommitSummary>($I`CommitSummary`)(
  {
    sha: S.String,
  },
  $I.annote("CommitSummary", {
    description: "Commit summary produced by a run.",
  })
) {}

/**
 * Result of orchestrating agent iterations.
 *
 * @category models
 * @since 0.0.0
 */
export class OrchestrateResult extends S.Class<OrchestrateResult>($I`OrchestrateResult`)(
  {
    branch: S.String,
    commits: S.Array(CommitSummary),
    completionSignal: S.optionalKey(S.String),
    iterations: S.Array(IterationResult),
    preservedWorktreePath: S.optionalKey(S.String),
    stdout: S.String,
  },
  $I.annote("OrchestrateResult", {
    description: "Result of orchestrating agent iterations.",
  })
) {}

/**
 * Options for orchestrating agent iterations against a sandbox handle.
 *
 * @category services
 * @since 0.0.0
 */
export interface OrchestrateOptions<R = never> {
  readonly branch: string;
  readonly completionSignal?: string | ReadonlyArray<string>;
  readonly idleTimeoutMs?: Duration.Duration;
  readonly iterations: number;
  readonly name?: string;
  readonly prompt: string;
  readonly promptExpansionTimeoutMs?: Duration.Duration;
  readonly provider: AgentProvider;
  readonly sandbox: SandboxHandle<R>;
  readonly sandboxRepoDir: string;
}

const completionSignals = (input: string | ReadonlyArray<string> | undefined): ReadonlyArray<string> => {
  if (P.isUndefined(input)) {
    return A.make(DEFAULT_COMPLETION_SIGNAL);
  }

  if (P.isString(input)) {
    return A.of(input);
  }

  return input;
};

const firstMatchedSignal = (output: string, signals: ReadonlyArray<string>): string | undefined =>
  pipe(
    signals,
    A.findFirst((signal) => Str.includes(signal)(output)),
    (option) => (O.isSome(option) ? option.value : undefined)
  );

const runAgentIteration: <R>(
  options: OrchestrateOptions<R>,
  index: number
) => Effect.Effect<ExecResult, SandboxError, R | Display> = Effect.fn("Orchestrator.runAgentIteration")(function* <R>(
  options: OrchestrateOptions<R>,
  index: number
) {
  const display = yield* Display;
  const label = (message: string): string => (P.isUndefined(options.name) ? message : `[${options.name}] ${message}`);

  yield* display.status(label(`Iteration ${index}/${options.iterations}`), "Info");
  const prompt = yield* expandPromptShellExpressions(
    options.sandbox,
    ExpandPromptShellExpressionsOptions.make({
      cwd: options.sandboxRepoDir,
      prompt: options.prompt,
      ...(P.isUndefined(options.promptExpansionTimeoutMs) ? {} : { timeoutMs: options.promptExpansionTimeoutMs }),
    })
  );
  const command = options.provider.buildPrintCommand({
    dangerouslySkipPermissions: true,
    prompt,
  });
  const clock = yield* Clock.Clock;
  let lastOutputAtMs = clock.currentTimeMillisUnsafe();
  const onLine = (): void => {
    lastOutputAtMs = clock.currentTimeMillisUnsafe();
  };
  const exec = options.sandbox.exec(
    command.command,
    SandboxExecOptions.make({
      cwd: options.sandboxRepoDir,
      onLine,
      ...(P.isUndefined(command.stdin) ? {} : { stdin: command.stdin }),
    })
  );

  const idleTimeoutMs = options.idleTimeoutMs;

  if (P.isUndefined(idleTimeoutMs)) {
    return yield* exec;
  }

  const idleTimeoutMillis = Duration.toMillis(idleTimeoutMs);
  const failWhenIdle = Effect.fn("Orchestrator.failWhenIdle")(function* () {
    while (true) {
      yield* Effect.sleep(idleTimeoutMs);
      const nowMs = yield* Clock.currentTimeMillis;
      if (nowMs - lastOutputAtMs >= idleTimeoutMillis) {
        return yield* AgentIdleTimeoutError.new(
          "agent idle timeout",
          `${options.provider.name} produced no output for ${idleTimeoutMillis.toString()}ms.`,
          {
            preservedWorktreePath: options.sandbox.worktreePath,
            timeoutMs: idleTimeoutMs,
          }
        );
      }
    }
  });

  return yield* Effect.raceFirst(exec, failWhenIdle());
});

/**
 * Run an agent provider for the requested number of iterations.
 *
 * @category combinators
 * @since 0.0.0
 */
export const orchestrate: <R>(
  options: OrchestrateOptions<R>
) => Effect.Effect<OrchestrateResult, SandboxError, R | Display | AgentStreamEmitter> = Effect.fn(
  "Orchestrator.orchestrate"
)(function* <R>(options: OrchestrateOptions<R>) {
  const display = yield* Display;
  const streamEmitter = yield* AgentStreamEmitter;
  const signals = completionSignals(options.completionSignal);
  const iterations = A.empty<IterationResult>();
  let stdout = "";
  let completionSignal: string | undefined;

  for (let index = 1; index <= options.iterations; index++) {
    const result = yield* runAgentIteration(options, index).pipe(
      profileSandboxPhase({
        attributes: {
          iteration: index.toString(),
          provider: options.provider.name,
          sandboxRepoDir: options.sandboxRepoDir,
        },
        phase: "sandbox.agent.iteration",
      })
    );

    if (result.exitCode !== 0) {
      const errorDetail = redactSensitiveText(
        result.stderr || result.stdout || `${options.provider.name} produced no error output`
      );

      return yield* AgentError.new(
        errorDetail,
        `${options.provider.name} exited with code ${result.exitCode}: ${errorDetail}`,
        {}
      );
    }

    stdout = `${stdout}${result.stdout}`;
    let sessionId: string | undefined;

    for (const line of Str.split("\n")(result.stdout)) {
      for (const event of options.provider.parseStreamLine(line)) {
        if (P.isTagged(event, "Text")) {
          const timestamp = yield* DateTime.now;
          yield* display.text(event.text);
          yield* streamEmitter.emit(
            AgentStreamEvent.cases.Text.make({
              iteration: index,
              message: event.text,
              timestamp,
            })
          );
        } else if (P.isTagged(event, "ToolCall")) {
          const timestamp = yield* DateTime.now;
          yield* display.toolCall(event.name, event.args);
          yield* streamEmitter.emit(
            AgentStreamEvent.cases.ToolCall.make({
              formattedArgs: event.args,
              iteration: index,
              name: event.name,
              timestamp,
            })
          );
        } else if (P.isTagged(event, "SessionId")) {
          sessionId = event.sessionId;
        }
      }
    }

    A.appendInPlace(iterations, IterationResult.make({ ...(sessionId === undefined ? {} : { sessionId }) }));
    completionSignal = firstMatchedSignal(stdout, signals);
    if (P.isNotUndefined(completionSignal)) {
      break;
    }
  }

  return OrchestrateResult.make({
    branch: options.branch,
    commits: [],
    ...(P.isUndefined(completionSignal) ? {} : { completionSignal }),
    iterations,
    stdout,
  });
});

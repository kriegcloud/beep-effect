/**
 * Agent iteration orchestration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { A, O } from "@beep/utils";
import { DateTime, Effect, pipe } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { AgentProvider } from "./Agent.provider.ts";
import { IterationUsage } from "./Agent.provider.ts";
import { AgentStreamEmitter } from "./AgentStreamEmitter.ts";
import { Display } from "./Display.ts";
import { AgentError, type SandboxError } from "./Sandbox.errors.ts";
import type { SandboxHandle } from "./Sandbox.provider.ts";
import { SandboxExecOptions } from "./Sandbox.provider.ts";

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
  readonly iterations: number;
  readonly name?: string;
  readonly prompt: string;
  readonly provider: AgentProvider;
  readonly sandbox: SandboxHandle<R>;
  readonly sandboxRepoDir: string;
}

const completionSignals = (input: string | ReadonlyArray<string> | undefined): ReadonlyArray<string> =>
  input === undefined ? [DEFAULT_COMPLETION_SIGNAL] : typeof input === "string" ? [input] : input;

const firstMatchedSignal = (output: string, signals: ReadonlyArray<string>): string | undefined =>
  pipe(
    signals,
    A.findFirst((signal) => Str.includes(signal)(output)),
    (option) => (O.isSome(option) ? option.value : undefined)
  );

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
  const label = (message: string): string => (options.name === undefined ? message : `[${options.name}] ${message}`);
  const iterations: Array<IterationResult> = [];
  let stdout = "";
  let completionSignal: string | undefined;

  for (let index = 1; index <= options.iterations; index++) {
    yield* display.status(label(`Iteration ${index}/${options.iterations}`), "Info");
    const command = options.provider.buildPrintCommand({
      dangerouslySkipPermissions: true,
      prompt: options.prompt,
    });
    const result = yield* options.sandbox.exec(
      command.command,
      new SandboxExecOptions({
        cwd: options.sandboxRepoDir,
        ...(command.stdin === undefined ? {} : { stdin: command.stdin }),
      })
    );

    if (result.exitCode !== 0) {
      return yield* AgentError.new(
        result.stderr || result.stdout,
        `${options.provider.name} exited with code ${result.exitCode}`,
        {}
      );
    }

    stdout = `${stdout}${result.stdout}`;
    let sessionId: string | undefined;

    for (const line of Str.split("\n")(result.stdout)) {
      for (const event of options.provider.parseStreamLine(line)) {
        if (event._tag === "Text") {
          const timestamp = yield* DateTime.now;
          yield* display.text(event.text);
          yield* streamEmitter.emit({
            _tag: "Text",
            iteration: index,
            message: event.text,
            timestamp,
          });
        } else if (event._tag === "ToolCall") {
          const timestamp = yield* DateTime.now;
          yield* display.toolCall(event.name, event.args);
          yield* streamEmitter.emit({
            _tag: "ToolCall",
            formattedArgs: event.args,
            iteration: index,
            name: event.name,
            timestamp,
          });
        } else if (event._tag === "SessionId") {
          sessionId = event.sessionId;
        }
      }
    }

    iterations.push(new IterationResult({ ...(sessionId === undefined ? {} : { sessionId }) }));
    completionSignal = firstMatchedSignal(stdout, signals);
    if (completionSignal !== undefined) {
      break;
    }
  }

  return new OrchestrateResult({
    branch: options.branch,
    commits: [],
    ...(completionSignal === undefined ? {} : { completionSignal }),
    iterations,
    stdout,
  });
});

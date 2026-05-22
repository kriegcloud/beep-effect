/**
 * Interactive agent entrypoint.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Effect, type FileSystem, type Path } from "effect";
import * as S from "effect/Schema";
import { AgentCommandOptions } from "./Agent.provider.ts";
import { createSandbox } from "./createSandbox.ts";
import type { Display } from "./Display.ts";
import {
  BUILT_IN_PROMPT_ARG_KEY_SET,
  ResolvePromptOptions,
  resolvePrompt,
  substitutePromptArgs,
  validateNoArgsWithInlinePrompt,
  validateNoBuiltInArgOverride,
} from "./Prompt.ts";
import type { RunOptions } from "./Run.ts";
import { resolveCwd } from "./resolveCwd.ts";
import { AgentError, type SandboxError } from "./Sandbox.errors.ts";

const $I = $SandboxId.create("interactive");

/**
 * Result of an interactive agent session.
 *
 * @category models
 * @since 0.0.0
 */
export class InteractiveResult extends S.Class<InteractiveResult>($I`InteractiveResult`)(
  {
    exitCode: S.Number,
  },
  $I.annote("InteractiveResult", {
    description: "Result of an interactive agent session.",
  })
) {}

/**
 * Start an interactive agent session.
 *
 * @remarks
 * This conservative foundation resolves the same prompt and sandbox inputs as
 * the non-interactive runner, then requires provider-level interactive
 * execution support before handing the current process streams to the sandbox.
 *
 * @category combinators
 * @since 0.0.0
 */
export const interactive: <R>(
  options: RunOptions<R>
) => Effect.Effect<InteractiveResult, SandboxError, R | FileSystem.FileSystem | Path.Path | Display> = Effect.fn(
  "interactive.interactive"
)(function* <R>(options: RunOptions<R>) {
  if (options.agent.buildInteractiveArgs === undefined) {
    return yield* AgentError.new(
      "interactive arguments unsupported",
      `Agent provider "${options.agent.name}" does not support interactive sessions.`,
      {}
    );
  }

  const hostRepoDir = yield* resolveCwd(options.cwd);
  const promptArgs = options.promptArgs ?? {};
  const resolvedPrompt = yield* resolvePrompt(
    ResolvePromptOptions.make({
      ...(options.prompt === undefined ? {} : { prompt: options.prompt }),
      ...(options.promptFile === undefined ? {} : { promptFile: options.promptFile }),
    })
  );

  yield* validateNoBuiltInArgOverride(promptArgs);
  if (resolvedPrompt.source === "Inline") {
    yield* validateNoArgsWithInlinePrompt(promptArgs);
  }

  const prompt =
    resolvedPrompt.source === "Inline"
      ? resolvedPrompt.text
      : yield* substitutePromptArgs(
          resolvedPrompt.text,
          {
            ...promptArgs,
            SOURCE_BRANCH: "",
            TARGET_BRANCH: "",
          },
          BUILT_IN_PROMPT_ARG_KEY_SET
        );
  const args = options.agent.buildInteractiveArgs(
    AgentCommandOptions.make({
      dangerouslySkipPermissions: true,
      prompt,
    })
  );
  const result = yield* Effect.acquireUseRelease(
    createSandbox({
      cwd: hostRepoDir,
      env: options.agent.env,
      ...(options.mounts === undefined ? {} : { mounts: options.mounts }),
      sandbox: options.sandbox,
      worktreePath: hostRepoDir,
    }),
    Effect.fn("interactive.useSandbox")(function* (sandbox) {
      const interactiveExec = sandbox.interactiveExec;

      if (interactiveExec === undefined) {
        return yield* AgentError.new(
          "interactive sandbox execution unsupported",
          `Sandbox provider "${options.sandbox.name}" does not support interactive sessions.`,
          {}
        );
      }

      return yield* interactiveExec(args, {
        cwd: sandbox.worktreePath,
        stderr: process.stderr,
        stdin: process.stdin,
        stdout: process.stdout,
      });
    }),
    (sandbox) => sandbox.close
  );

  return InteractiveResult.make({ exitCode: result.exitCode });
});

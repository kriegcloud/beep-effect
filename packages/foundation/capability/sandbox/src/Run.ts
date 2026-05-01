import {$SandboxId} from "@beep/identity";
import {PosInt} from "@beep/schema";
import {Duration, Effect} from "effect";
import * as S from "effect/Schema";

const $I = $SandboxId.create("Run");

/**
 * Override default timeouts for built-in lifecycle steps. Unset keys keep their defaults.
 *
 * @since 0.0.0
 * @category configuration
 */
export class Timeouts extends S.Class<Timeouts>($I`Timeouts`)({
  /** Timeout (ms) for the host-side copy of `copyToWorktree` paths into the worktree. Default: 60_000. */
  copyToWorktreeMs: S.DurationFromMillis.pipe(
    S.withDecodingDefaultKey(Effect.succeed(
      60_000)),
    S.withConstructorDefault(Effect.succeed(Duration.millis(60_000))),
    S.annotateKey({
      description: "Timeout (ms) for the host-side copy of `copyToWorktree` paths into the worktree. Default: 60_000.",
      default: Duration.millis(60_000),
    }),
  ),
}) {
}

export class RunSummaryRowOptions extends S.Class<RunSummaryRowOptions>($I`RunSummaryRowOptions`)({
    name: S.optionalKey(S.String),
    agentName: S.String,
    sandboxName: S.String,
    maxIterations: PosInt,
    branch: S.String,
  },
  $I.annote("RunSummaryRowOptions", {
    description: "",
  }),
) {
}

export class FileDisplayStartupOptions extends S.Class<FileDisplayStartupOptions>(
  $I`FileDisplayStartupOptions`)(
  {
    logPath: S.String,
    agentName: S.optionalKey(S.String),
    branch: S.optionalKey(S.String),
    /**
     * Resolved host repo directory. When it differs from `process.cwd()`, the
     * log-file hint is printed as an absolute path so it can be pasted into any
     * terminal. When it equals `process.cwd()` (or is omitted), a relative path
     * is printed instead.
     */
    hostRepoDir: S.optionalKey(S.String).annotateKey({
      description: "Resolved host repo directory. When it differs from `process.cwd()`, the\nlog-file hint is printed as an absolute path so it can be pasted into any\nterminal. When it equals `process.cwd()` (or is omitted), a relative path\nis printed instead.",
    }),
  },
  $I.annote("FileDisplayStartupOptions", {
    description: "",
  }),
) {
}




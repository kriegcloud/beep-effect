#!/usr/bin/env node
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils";
import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as Command from "@effect/platform/Command";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import color from "picocolors";
import { generateEnvSecrets } from "./generate-env-secrets";

/** Tagged error for bootstrap script failures. */
class BootstrapError extends S.TaggedError<BootstrapError>()("BootstrapError", {
  message: S.String,
}) {}

const CONTENT_WIDTH = 70;
const BORDER = color.gray(`+${"-".repeat(CONTENT_WIDTH + 2)}+`);

const formatLine = (content = "") => {
  const truncated = content.length > CONTENT_WIDTH ? content.slice(0, CONTENT_WIDTH) : content;
  return `| ${truncated.padEnd(CONTENT_WIDTH)} |`;
};

const wrapText = (input: string, width: number): ReadonlyArray<string> => {
  const words = input.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) {
    return [""];
  }

  const lines: Array<string> = [];
  let current = "";

  for (const word of words) {
    const tentativeLength = current.length === 0 ? word.length : current.length + 1 + word.length;

    if (tentativeLength <= width) {
      current = current.length === 0 ? word : `${current} ${word}`;
      continue;
    }

    if (current.length > 0) {
      lines.push(current);
      current = "";
    }

    if (word.length > width) {
      let index = 0;
      while (index < word.length) {
        const chunk = word.slice(index, index + width);
        lines.push(chunk);
        index += width;
      }
    } else {
      current = word;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.length === 0 ? [""] : lines;
};

const renderStagePanel = (title: string, commandPreview: string): string => {
  const lines = [
    BORDER,
    formatLine(`STAGE :: ${title.toUpperCase()}`),
    formatLine(),
    formatLine("COMMAND"),
    ...wrapText(commandPreview, CONTENT_WIDTH).map((line) => formatLine(line)),
    BORDER,
  ];

  return lines.join("\n");
};

const renderStatusLine = (status: "OK" | "WARN" | "FAIL", description: string, code: number): string => {
  const label = status === "OK" ? "[ OK ]" : status === "WARN" ? "[WARN]" : "[FAIL]";
  return `${label} ${description} (exit ${code})`;
};

const completionDivider = "=".repeat(CONTENT_WIDTH + 4);

const devBanner = color.green(`
 /$$$$$$$  /$$$$$$$$ /$$$$$$$$ /$$$$$$$        /$$$$$$$  /$$$$$$$$ /$$$$$$$$ /$$$$$$$  /$$
| $$__  $$| $$_____/| $$_____/| $$__  $$      | $$__  $$| $$_____/| $$_____/| $$__  $$| $$
| $$  \\ $$| $$      | $$      | $$  \\ $$      | $$  \\ $$| $$      | $$      | $$  \\ $$| $$
| $$$$$$$ | $$$$$   | $$$$$   | $$$$$$$/      | $$$$$$$ | $$$$$   | $$$$$   | $$$$$$$/| $$
| $$__  $$| $$__/   | $$__/   | $$____/       | $$__  $$| $$__/   | $$__/   | $$____/ |__/
| $$  \\ $$| $$      | $$      | $$            | $$  \\ $$| $$      | $$      | $$          
| $$$$$$$/| $$$$$$$$| $$$$$$$$| $$            | $$$$$$$/| $$$$$$$$| $$$$$$$$| $$       /$$
|_______/ |________/|________/|__/            |_______/ |________/|________/|__/      |__/

                    The hive is primed. System nominal. time to beep.                     
                                      run \`bun run dev\`                                      

`);

const program = Effect.gen(function* () {
  const repoRoot = yield* findRepoRoot;
  const fsUtils = yield* FsUtils;
  const path = yield* Path.Path;

  // If .env file does not exist at repo root, copy
  yield* fsUtils.copyIfExists(path.join(repoRoot, ".env.example"), path.join(repoRoot, ".env"));

  // generate secrets
  yield* generateEnvSecrets;

  const runCommandWithLogs = Effect.fn(function* (
    command: Command.Command,
    description: string,
    commandPreview: string,
    options?: { readonly allowedExitCodes?: ReadonlyArray<number> | undefined } | undefined
  ) {
    yield* Console.log(renderStagePanel(description, commandPreview));

    const exitCode = yield* Command.exitCode(command);
    const numericExitCode = Number(exitCode);

    const allowedExitCodes = options?.allowedExitCodes ?? [0];
    const status: "OK" | "WARN" | "FAIL" = allowedExitCodes.includes(numericExitCode)
      ? numericExitCode === 0
        ? "OK"
        : "WARN"
      : "FAIL";

    yield* Console.log(renderStatusLine(status, description, numericExitCode));

    if (status === "FAIL") {
      return yield* new BootstrapError({
        message: `${description} failed with exit code ${numericExitCode}.`,
      });
    }
  });

  const dockerComposeUp = F.pipe(
    Command.make("bunx", "dotenvx", "run", "-f", ".env", "--", "docker", "compose", "up", "-d"),
    Command.workingDirectory(repoRoot),
    Command.stdout("inherit"),
    Command.stderr("inherit")
  );

  yield* runCommandWithLogs(
    dockerComposeUp,
    "Bring up local infrastructure",
    "bunx dotenvx run -f .env -- docker compose up -d"
  );

  const runDbMigrate = F.pipe(
    Command.make("bun", "run", "dotenvx", "--", "bunx", "turbo", "run", "db:migrate", "--ui", "stream"),
    Command.workingDirectory(repoRoot),
    Command.stdout("inherit"),
    Command.stderr("inherit")
  );

  yield* runCommandWithLogs(
    runDbMigrate,
    "Apply database migrations",
    "bun run dotenvx -- bunx turbo run db:migrate --ui stream"
  );

  yield* Console.log(completionDivider);
  yield* Console.log("BEEP hive routines complete -- systems are online.");
  yield* Console.log(completionDivider);
  yield* Console.log(devBanner);
});

const layer = Layer.mergeAll(BunContext.layer, FsUtilsLive);

BunRuntime.runMain(
  Effect.scoped(
    program.pipe(
      Effect.provide(layer),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          const message = String(error);
          yield* Console.log(`\nBOOTSTRAP FAILURE :: ${message}`);
          const cause = Cause.fail(error);
          yield* Console.log(`\nTRACE :: ${Cause.pretty(cause)}`);
          return yield* Effect.failCause(cause);
        })
      )
    )
  )
);

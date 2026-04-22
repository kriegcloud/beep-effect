/**
 * Shared Biome-backed JSON rendering for repo-managed config files.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { DomainError, findRepoRoot } from "@beep/repo-utils";
import { Str, thunkEmptyStr } from "@beep/utils";
import { Effect, Path, Stream } from "effect";
import * as S from "effect/Schema";
import { ChildProcess } from "effect/unstable/process";

const require = createRequire(import.meta.url);
const biomeExecutable = require.resolve("@biomejs/biome/bin/biome");
const moduleDir = fileURLToPath(new URL(".", import.meta.url));
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const textEncoder = new TextEncoder();

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(thunkEmptyStr, (text, chunk) => `${text}${chunk}`)
  );

/**
 * Render JSON with the same Biome config that repository lint uses.
 *
 * @param filePath - Workspace-relative or absolute target path used for Biome formatting.
 * @param value - JSON-compatible value to render.
 * @returns Biome-formatted JSON text with a trailing newline.
 * @example
 * ```ts
 * console.log("renderBiomeJson")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const renderBiomeJson = Effect.fn(function* (filePath: string, value: unknown) {
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot(moduleDir).pipe(
    Effect.mapError(
      (cause) => new DomainError({ message: "Failed to locate the repo root for Biome formatting.", cause })
    )
  );
  const biomeConfigPath = path.join(repoRoot, "biome.jsonc");
  const relativeToCwd = path.relative(process.cwd(), filePath);
  const stdinFilePath =
    relativeToCwd.length > 0 && relativeToCwd !== ".." && !Str.startsWith("../")(relativeToCwd)
      ? relativeToCwd
      : filePath;
  const command = ChildProcess.make(
    biomeExecutable,
    ["format", `--config-path=${biomeConfigPath}`, `--stdin-file-path=${stdinFilePath}`],
    {
      stdin: Stream.make(textEncoder.encode(encodeJson(value))),
      stdout: "pipe",
      stderr: "pipe",
    }
  );
  const result = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* command;
      return yield* Effect.all({
        stdout: collectText(handle.stdout),
        stderr: collectText(handle.stderr),
        exitCode: handle.exitCode,
      });
    })
  ).pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to run Biome for "${filePath}".`, cause })));
  const stderr = Str.trim(result.stderr);

  if (result.exitCode !== 0) {
    return yield* new DomainError({
      message:
        stderr.length > 0 ? `Biome failed to format "${filePath}": ${stderr}` : `Biome failed to format "${filePath}".`,
      cause: result.stderr,
    });
  }

  return Str.endsWith("\n")(result.stdout) ? result.stdout : `${result.stdout}\n`;
});

import * as NodeUrl from "node:url";
import { BadArgument } from "@effect/platform/Error";
import * as Path from "@effect/platform/Path";
import { Effect, pipe } from "effect";

export const fromFileUrl = (url: URL | string): Effect.Effect<string, BadArgument> =>
  Effect.try({
    try: () => NodeUrl.fileURLToPath(url),
    catch: (error) =>
      new BadArgument({
        module: "Path",
        method: "fromFileUrl",
        description: `Invalid file URL: ${url}`,
        cause: error,
      }),
  });

export const CurrentFile = fromFileUrl(import.meta.url);

export const CurrentDirectory = pipe(
  Effect.Do,
  Effect.bind("currentFile", () => CurrentFile),
  Effect.bind("path", () => Path.Path),
  Effect.map(({ currentFile, path }) => path.dirname(currentFile))
);

import * as FileSystem from "@effect/platform/FileSystem";
/**
 * @since 0.1.0
 */
import * as Effect from "effect/Effect";
import { NoSuchFileError } from "./errors";

/**
 * @since 0.1.0
 */
export const writeFile = Effect.fn("writeFile")(function* (
  path: string,
  content: string,
) {
  const fs = yield* FileSystem.FileSystem;

  const pathExists = yield* fs.exists(path);

  if (!pathExists) {
    return yield* Effect.fail(
      new NoSuchFileError({
        path: path,
        message: "[writeFile] Invalid file path",
      }),
    );
  }

  yield* fs.writeFileString(path, content);
});

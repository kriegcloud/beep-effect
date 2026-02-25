/**
 * Effect-based file and path helpers.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Path } from "effect";

/**
 * Resolve a file path from process cwd.
 *
 * @since 0.0.0
 * @category functions
 */
export const resolveFromCwd = Effect.fn(function* (filePath: string) {
  const path = yield* Path.Path;
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
});

/**
 * Read UTF-8 file contents.
 *
 * @since 0.0.0
 * @category functions
 */
export const readFileUtf8 = Effect.fn(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const absolutePath = yield* resolveFromCwd(filePath);
  return yield* fs.readFileString(absolutePath, "utf8");
});

/**
 * Write UTF-8 file contents and create parent directories when needed.
 *
 * @since 0.0.0
 * @category functions
 */
export const writeFileUtf8 = Effect.fn(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = yield* resolveFromCwd(filePath);
  yield* fs.makeDirectory(path.dirname(absolutePath), { recursive: true });
  yield* fs.writeFileString(absolutePath, content);
});

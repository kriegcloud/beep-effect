/**
 * Host working-directory resolution helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, FileSystem, Path } from "effect";
import { CwdError } from "./Sandbox.errors.ts";

/**
 * Resolve an optional cwd to an absolute, validated host directory.
 *
 * @example
 * ```ts
 * import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
 * import * as NodePath from "@effect/platform-node/NodePath"
 * import { resolveCwd } from "@beep/sandbox"
 * import { Effect, Layer } from "effect"
 *
 * const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)
 * const program = resolveCwd(".").pipe(Effect.provide(PlatformLayer))
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const resolveCwd: (
  cwd: string | undefined
) => Effect.Effect<string, CwdError, FileSystem.FileSystem | Path.Path> = Effect.fn("resolveCwd")(function* (
  cwd: string | undefined
) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const resolved = cwd === undefined ? path.resolve(process.cwd()) : path.resolve(process.cwd(), cwd);
  const stat = yield* fs.stat(resolved).pipe(
    Effect.mapError((cause) =>
      CwdError.new(cause, `The provided cwd does not exist or cannot be read: ${resolved}`, {
        cwd: resolved,
      })
    )
  );

  if (stat.type !== "Directory") {
    return yield* CwdError.new(
      `cwd is not a directory: ${resolved}`,
      `The provided cwd is not a directory: ${resolved}`,
      {
        cwd: resolved,
      }
    );
  }

  return resolved;
});

import { $RepoWorkspacesId } from "@beep/identity/packages";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
// The layer-bound root lookup every root-consuming service shares.
//
// `WorkspaceDiscovery`, `LockfileReader`, `WorkspaceCatalogs` and
// `WorkspaceSnapshots` each resolve their workspace root from a layer-level
// `cwd` and optional `stopAt`. One implementation means the four cannot
// disagree about which root a layer's options name — discovery refusing an
// enclosing workspace while the lockfile and catalog reads adopt it.

import * as Effect from "effect/Effect";
import type { WorkspaceRootNotFoundError, WorkspaceRootShape } from "../WorkspaceRoot.ts";

const $I = $RepoWorkspacesId.create("internal/layerRoot");

/**
 * Shares the layer-level options every root-consuming service reads its root from.
 *
 * **Example** (Leave the ambient directory unresolved)
 *
 * ```ts
 * import { LayerRootOptions } from "@beep/repo-workspaces/internal/layerRoot";
 * import * as S from "effect/Schema";
 *
 * console.log(S.is(LayerRootOptions)({})); // true
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const LayerRootOptions = S.Struct({
  cwd: S.optionalKey(S.String).pipe(
    $I.annoteKey("LayerRootOptions.cwd", {
      description: "The starting directory, with ambient cwd read only on use when omitted.",
    })
  ),
  stopAt: S.optional(S.String).pipe(
    $I.annoteKey("LayerRootOptions.stopAt", {
      description: "The inclusive root-search boundary, accepting absence or explicit undefined.",
    })
  ),
}).pipe(
  $I.annoteSchema("LayerRootOptions", {
    description: "Plain shared root options with an unresolved ambient cwd default.",
  })
);
/**
 * The root lookup configuration described by {@link LayerRootOptions}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type LayerRootOptions = typeof LayerRootOptions.Type;

/**
 * Resolves the workspace root a layer's options name.
 *
 * **Details**
 *
 * Uses `Effect.suspend` so the ambient `process.cwd()` is read at first use,
 * not at layer construction.
 *
 * **Example** (Resolve an explicit starting directory)
 *
 * ```ts
 * import { findLayerRoot } from "@beep/repo-workspaces/internal/layerRoot";
 * import type { WorkspaceRootShape } from "@beep/repo-workspaces/WorkspaceRoot";
 * import * as Effect from "effect/Effect";
 * import { dual } from "effect/Function";
 *
 * const roots: WorkspaceRootShape = { find: dual((args) => typeof args[0] === "string", (cwd: string) => Effect.succeed(cwd)) };
 * const program = findLayerRoot(roots, { cwd: "/repo" });
 * console.log(Effect.runSync(program)); // /repo
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const findLayerRoot: {
  (
    options: LayerRootOptions | undefined
  ): (roots: WorkspaceRootShape) => Effect.Effect<string, WorkspaceRootNotFoundError>;
  (roots: WorkspaceRootShape, options: LayerRootOptions | undefined): Effect.Effect<string, WorkspaceRootNotFoundError>;
} = dual(
  2,
  (
    roots: WorkspaceRootShape,
    options: LayerRootOptions | undefined
  ): Effect.Effect<string, WorkspaceRootNotFoundError> =>
    Effect.suspend(() => {
      const stopAt = options?.stopAt;
      return roots.find(options?.cwd ?? process.cwd(), stopAt === undefined ? undefined : { stopAt });
    })
);

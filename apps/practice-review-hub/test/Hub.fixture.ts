/**
 * Platform services of the hub tests: the real file system and paths, since
 * the stores under test are files in a temporary directory.
 *
 * @since 0.0.0
 */

import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Layer from "effect/Layer";

/** The Bun file system and path services. */
export const Platform = Layer.merge(BunFileSystem.layer, BunPath.layer);

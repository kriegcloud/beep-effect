/**
 * installer dependencies server test layer.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.0.0
 */

import { makeInstallerDependenciesConfigTestLayer } from "@beep/installer-dependencies-config/test";
import { Layer } from "effect";
import { InstallerDependenciesServerLive } from "./Layer.js";

/**
 * Deterministic test layer for the installer-dependencies slice.
 *
 * @category testing
 * @since 0.0.0
 */
export const InstallerDependenciesServerTest = InstallerDependenciesServerLive.pipe(
  Layer.provideMerge(makeInstallerDependenciesConfigTestLayer("1.3.14"))
);

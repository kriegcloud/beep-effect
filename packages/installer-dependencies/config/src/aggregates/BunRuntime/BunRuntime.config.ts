/**
 * Bun runtime installer configuration contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $I as $PackagesId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $InstallerDependenciesConfigId = $PackagesId.compose(
  "installer-dependencies-config"
).$InstallerDependenciesConfigId;
const $I = $InstallerDependenciesConfigId.create("BunRuntime.config");

/**
 * Server-only Bun runtime configuration contract.
 *
 * @category configuration
 * @since 0.0.0
 */
export class BunRuntimeServerConfig extends S.Class<BunRuntimeServerConfig>($I`BunRuntimeServerConfig`)(
  {
    requiredVersion: S.NonEmptyString,
  },
  $I.annote("BunRuntimeServerConfig", {
    description: "Installer-owned Bun runtime requirement for the app-first repair flow.",
  })
) {}

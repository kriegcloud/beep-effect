#!/usr/bin/env bun

/**
 * Cross-platform MCPB packaging entrypoint for the practice gateway.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { PracticeKgToolkit } from "@beep/law-practice-server";
import {
  McpbManifestFields,
  McpbPackageSpec,
  McpbTool,
  McpbUserConfigField,
  mcpbPackageProgram,
  runMcpbEntrypoint,
} from "@beep/mcpb-kit";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { BoxDriveToolkit } from "./BoxDriveTools.ts";
import { SetupToolkit } from "./SetupTools.ts";
import { PRACTICE_GATEWAY_VERSION } from "./Version.ts";

/*
 * The manifest's tool list derives from the toolkits the gateway serves, so it
 * cannot drift from them. Setup tools are always mounted; practice-kg and Box
 * Drive tools mount when the saved profile selects them.
 */
const manifestTools = A.map(
  [...R.values(SetupToolkit.tools), ...R.values(PracticeKgToolkit.tools), ...R.values(BoxDriveToolkit.tools)],
  (tool) =>
    McpbTool.make({
      name: tool.name,
      description: O.getOrElse(O.fromUndefinedOr(tool.description), () => tool.name),
    })
);

const program = mcpbPackageProgram(
  McpbPackageSpec.make({
    appName: "practice-gateway",
    commandName: "practice-gateway-package",
    repoRoot: Bun.fileURLToPath(new URL("../../..", import.meta.url)),
    forbiddenArchiveFragments: ["package.ts", "src/", "practice-profile.json", ".dpapi"],
    manifest: McpbManifestFields.make({
      name: "beep-practice-gateway",
      displayName: "Beep Practice Gateway",
      version: PRACTICE_GATEWAY_VERSION,
      description:
        "Sets up this computer for the practice (checks, approved repairs, the lawyer's steps) and serves the practice tools the saved profile selects.",
      env: {
        BUNDLE_DIR: "${user_config.bundle_dir}",
        PRACTICE_KG_CORPUS_ROOT: "${user_config.corpus_root}",
      },
      userConfig: {
        bundle_dir: McpbUserConfigField.make({
          type: "directory",
          title: "Practice knowledge-graph bundle",
          description: "Optional. Directory containing bundle.manifest.json, kg.pglite, and practice.duckdb.",
          required: false,
        }),
        corpus_root: McpbUserConfigField.make({
          type: "directory",
          title: "Practice corpus root",
          description: "Optional corpus root used for click-through to source files and email bodies.",
          required: false,
        }),
      },
      tools: manifestTools,
    }),
  })
);
runMcpbEntrypoint({ isMain: import.meta.main, program });

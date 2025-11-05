#!/usr/bin/env node
import { runIconifyCli } from "@beep/repo-scripts/iconify/cli.js";

export * from "@beep/repo-scripts/iconify/client.js";
export * from "@beep/repo-scripts/iconify/registry.js";
export * from "@beep/repo-scripts/iconify/schema.js";
export * from "@beep/repo-scripts/iconify/schema.js";
export { runIconifyCli };
if (import.meta.main) {
  runIconifyCli(process.argv);
}

#!/usr/bin/env node
import { runIconifyCli } from "@beep/repo-scripts/iconify/cli";

export * from "@beep/repo-scripts/iconify/client";
export * from "@beep/repo-scripts/iconify/registry";
export * from "@beep/repo-scripts/iconify/schema";
export * from "@beep/repo-scripts/iconify/schema";
export { runIconifyCli };
if (import.meta.main) {
  runIconifyCli(process.argv);
}

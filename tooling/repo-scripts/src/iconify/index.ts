#!/usr/bin/env node
import { runIconifyCli } from "@beep/repo-scripts/iconify/cli";

export * from "./client";
export * from "./registry";
export * from "./schema";
export * from "./schema";
export { runIconifyCli };
if (import.meta.main) {
  runIconifyCli(process.argv);
}

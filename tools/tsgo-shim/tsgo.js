#!/usr/bin/env node
import * as NodeChildProcess from "node:child_process";
import * as NodeModule from "node:module";
import * as NodePath from "node:path";

// `tsgo` for this repo executes the compiler artifact shipped by the installed
// @effect/tsgo package directly. Do not route this through the mutable
// @typescript/native patch: a preserved `.original` backup can make a newer
// patcher mistake an older Effect compiler for the current one.
// Resolve through the bundled CLI because 0.39 platform packages use upstream
// metadata schema v5 while the package's exported helper still accepts only v4.
const require = NodeModule.createRequire(import.meta.url);
const packageJsonPath = require.resolve("@effect/tsgo/package.json");
const effectTsgoCli = NodePath.join(NodePath.dirname(packageJsonPath), "dist", "effect-tsgo.cjs");
const executable = NodeChildProcess.execFileSync(process.execPath, [effectTsgoCli, "get-exe-path"], {
  encoding: "utf8",
}).trim();

if (process.platform !== "win32" && typeof process.execve === "function") {
  try {
    process.execve(executable, [executable, ...process.argv.slice(2)]);
  } catch {
    // Fall back for runtimes that expose execve without supporting it here.
  }
}

try {
  NodeChildProcess.execFileSync(executable, process.argv.slice(2), { stdio: "inherit" });
} catch (cause) {
  if (cause && typeof cause === "object" && "status" in cause && cause.status) {
    process.exitCode = cause.status;
  } else {
    throw cause;
  }
}

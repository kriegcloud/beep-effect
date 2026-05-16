#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

const argAfter = (name, fallback) => {
  const index = args.indexOf(name);

  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const hasArg = (name) => args.includes(name);

const outputRoot = path.resolve(argAfter("--output-root", "output/stack-installer/p1-live"));
const attempts = Number.parseInt(argAfter("--watch-attempts", "1440"), 10);
const intervalMs = Number.parseInt(argAfter("--watch-interval-ms", "5000"), 10);
const replaceExisting = hasArg("--replace-existing");
const preserveLog = hasArg("--preserve-log");

const pidPath = path.join(outputRoot, "proof-watch.pid");
const logPath = path.join(outputRoot, "proof-watch.log");
const commandPath = path.join(outputRoot, "proof-watch-command.txt");

const processExists = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const stopProcessGroup = (pid) => {
  try {
    process.kill(-pid);
    return;
  } catch {
    // Fall back to the parent PID for platforms/shells without process-group signaling.
  }

  process.kill(pid);
};

const stopExisting = async () => {
  const rawPid = await fs.promises.readFile(pidPath, "utf8").catch(() => "");
  const pid = Number.parseInt(rawPid.trim(), 10);

  if (!Number.isInteger(pid) || !processExists(pid)) {
    return;
  }

  if (!replaceExisting) {
    throw new Error(
      `Proof watcher already appears to be running with pid ${pid}; pass --replace-existing to restart it.`
    );
  }

  stopProcessGroup(pid);
  await new Promise((resolve) => setTimeout(resolve, 500));
};

const writePrivateFile = async (filePath, content) => {
  await fs.promises.writeFile(filePath, content, { mode: 0o600 });
  await fs.promises.chmod(filePath, 0o600);
};

const ensurePrivateFile = async (filePath) => {
  await fs.promises.appendFile(filePath, "", { mode: 0o600 });
  await fs.promises.chmod(filePath, 0o600);
};

await fs.promises.mkdir(outputRoot, { recursive: true });
await stopExisting();

const watchArgs = [
  "run",
  "--filter",
  "@beep/stack-installer",
  "p1:proof:watch",
  "--",
  "--output-root",
  outputRoot,
  "--watch-attempts",
  String(attempts),
  "--watch-interval-ms",
  String(intervalMs),
];

await writePrivateFile(
  commandPath,
  [
    "Stack Installer P1 proof watch command",
    "",
    `bun ${watchArgs.map((arg) => JSON.stringify(arg)).join(" ")}`,
    "",
  ].join("\n")
);
if (preserveLog) {
  await ensurePrivateFile(logPath);
  await fs.promises.appendFile(
    logPath,
    `${new Date().toISOString()} coordinator restarted proof watcher with ${attempts} attempts and ${intervalMs}ms interval.\n`
  );
  await fs.promises.chmod(logPath, 0o600);
} else {
  await writePrivateFile(logPath, "");
}

const logHandle = await fs.promises.open(logPath, "a");
const child = spawn("bun", watchArgs, {
  detached: true,
  stdio: ["ignore", logHandle.fd, logHandle.fd],
});

child.unref();
await logHandle.close();
await writePrivateFile(pidPath, `${child.pid}\n`);

console.log(`Stack Installer proof watcher started for ${outputRoot}`);
console.log(`pid: ${child.pid}`);
console.log(`log: ${preserveLog ? "preserved existing log" : "rotated log"}`);
console.log(`log file: ${logPath}`);
console.log(`command file: ${commandPath}`);

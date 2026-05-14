#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

const argAfter = (name, fallback) => {
  const index = args.indexOf(name);

  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const hasArg = (name) => args.includes(name);

const host = argAfter("--host", "127.0.0.1");
const port = Number.parseInt(argAfter("--port", "8765"), 10);
const outputRoot = path.resolve(argAfter("--output-root", "output/stack-installer/p1-live"));
const failOnMissing = hasArg("--fail-on-missing");

const requiredPlatforms = ["macos", "windows"];
const requiredFiles = ["proof.json", "commands.txt", "sha256sums.txt"];
const tokenLikePattern = /[a-f0-9]{32,}|token=[^<\s'"]+/i;

const fileExists = async (filePath) =>
  fs.promises
    .access(filePath)
    .then(() => true)
    .catch(() => false);

const fileMode = async (filePath) => {
  const stat = await fs.promises.stat(filePath).catch(() => undefined);

  return stat ? (stat.mode & 0o777).toString(8).padStart(3, "0") : "missing";
};

const readText = async (filePath) => fs.promises.readFile(filePath, "utf8").catch(() => "");

const processExists = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const healthStatus = async () => {
  try {
    const response = await fetch(`http://${host}:${port}/health`);
    return {
      ok: response.ok,
      text: `${response.status} ${response.ok ? "ok" : "not-ok"}`,
    };
  } catch (error) {
    return {
      ok: false,
      text: `unreachable: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const platformStatus = async (platform) => {
  const platformDir = path.join(outputRoot, platform);
  const exists = await fileExists(platformDir);

  if (!exists) {
    return {
      message: `- ${platform}: missing directory`,
      ok: false,
    };
  }

  const entries = await fs.promises.readdir(platformDir).catch(() => []);
  const missingFiles = requiredFiles.filter((fileName) => !entries.includes(fileName));
  const hasScreencast = entries.some((entry) => entry.startsWith("screencast."));

  if (!hasScreencast) {
    missingFiles.push("screencast.*");
  }

  return {
    message:
      missingFiles.length === 0
        ? `- ${platform}: required files present`
        : `- ${platform}: incomplete; missing ${missingFiles.join(", ")}`,
    ok: missingFiles.length === 0,
  };
};

const bundleStatus = async () => {
  const macosBundle = path.join(outputRoot, "stack-installer-p1-macos.tgz");
  const windowsBundle = path.join(outputRoot, "stack-installer-p1-windows.zip");
  const macosExists = await fileExists(macosBundle);
  const windowsExists = await fileExists(windowsBundle);

  return {
    messages: [
      `- stack-installer-p1-macos.tgz: ${macosExists ? "present" : "missing"}`,
      `- stack-installer-p1-windows.zip: ${windowsExists ? "present" : "missing"}`,
    ],
    ok: macosExists && windowsExists,
  };
};

const pidPath = path.join(outputRoot, "proof-upload-server.pid");
const tokenPath = path.join(outputRoot, "proof-upload-token.txt");
const commandsPath = path.join(outputRoot, "proof-upload-commands.txt");
const logPath = path.join(outputRoot, "proof-upload-server.log");
const pidText = await readText(pidPath);
const pid = Number.parseInt(pidText.trim(), 10);
const logText = await readText(logPath);
const commandsText = await readText(commandsPath);
const leakScanText = `${logText}\n${commandsText}`;
const logLines = logText.trim() ? logText.trim().split(/\r?\n/).slice(-12) : [];
const health = await healthStatus();
const tokenFileMode = await fileMode(tokenPath);
const commandsFileMode = await fileMode(commandsPath);
const pidFileMode = await fileMode(pidPath);
const hasTokenLikeText = tokenLikePattern.test(leakScanText);
const bundles = await bundleStatus();
const platforms = await Promise.all(requiredPlatforms.map(platformStatus));
const uploadWindowOk =
  health.ok &&
  processExists(pid) &&
  tokenFileMode === "600" &&
  commandsFileMode === "600" &&
  pidFileMode === "600" &&
  !hasTokenLikeText &&
  bundles.ok &&
  platforms.every((platform) => platform.ok);

console.log(`Stack Installer P1 proof upload status for ${outputRoot}`);
console.log(`endpoint: http://${host}:${port}`);
console.log(`health: ${health.text}`);
console.log(`pid: ${Number.isInteger(pid) ? `${pid} (${processExists(pid) ? "running" : "not running"})` : "missing"}`);
console.log(`token file mode: ${tokenFileMode}`);
console.log(`commands file mode: ${commandsFileMode}`);
console.log(`pid file mode: ${pidFileMode}`);
console.log(`log file present: ${await fileExists(logPath)}`);
console.log(`token-like text in logs/commands: ${hasTokenLikeText ? "yes" : "no"}`);
console.log("returned bundles:");
console.log(bundles.messages.join("\n"));
console.log("platform artifacts:");
console.log(platforms.map((platform) => platform.message).join("\n"));
console.log("recent upload log:");
console.log(logLines.length > 0 ? logLines.join("\n") : "- none");

if (failOnMissing && !uploadWindowOk) {
  process.exitCode = 1;
}

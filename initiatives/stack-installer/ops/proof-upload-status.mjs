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

const recentLines = (text, count = 12) => (text.trim() ? text.trim().split(/\r?\n/).slice(-count) : []);

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

const endpointStatus = async (pathname, options = {}) => {
  try {
    const response = await fetch(`http://${host}:${port}${pathname}`, {
      headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
    });
    const text = await response.text();

    return {
      ok: options.expectStatus ? response.status === options.expectStatus : response.ok,
      status: response.status,
      text,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      text: `unreachable: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
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
const watchPidPath = path.join(outputRoot, "proof-watch.pid");
const watchLogPath = path.join(outputRoot, "proof-watch.log");
const watchCommandPath = path.join(outputRoot, "proof-watch-command.txt");
const pidText = await readText(pidPath);
const pid = Number.parseInt(pidText.trim(), 10);
const tokenText = (await readText(tokenPath)).trim();
const logText = await readText(logPath);
const commandsText = await readText(commandsPath);
const leakScanText = `${logText}\n${commandsText}`;
const logLines = recentLines(logText);
const watchPidText = await readText(watchPidPath);
const watchPid = Number.parseInt(watchPidText.trim(), 10);
const watchLogText = await readText(watchLogPath);
const watchCommandText = await readText(watchCommandPath);
const watchLeakScanText = `${watchLogText}\n${watchCommandText}`;
const watchLogLines = recentLines(watchLogText);
const health = await healthStatus();
const landing = await endpointStatus("/");
const statusWithoutToken = await endpointStatus("/status", { expectStatus: 403 });
const statusWithToken = tokenText ? await endpointStatus("/status", { token: tokenText }) : undefined;
const commandsWithoutToken = await endpointStatus("/commands", { expectStatus: 403 });
const commandsWithToken = tokenText ? await endpointStatus("/commands", { token: tokenText }) : undefined;
const nextActionsWithoutToken = await endpointStatus("/next-actions", { expectStatus: 403 });
const nextActionsWithToken = tokenText ? await endpointStatus("/next-actions", { token: tokenText }) : undefined;
const tokenFileMode = await fileMode(tokenPath);
const commandsFileMode = await fileMode(commandsPath);
const pidFileMode = await fileMode(pidPath);
const watchPidFileMode = await fileMode(watchPidPath);
const watchLogFileMode = await fileMode(watchLogPath);
const watchCommandFileMode = await fileMode(watchCommandPath);
const hasTokenLikeText = tokenLikePattern.test(leakScanText);
const hasWatcherTokenLikeText = tokenLikePattern.test(watchLeakScanText);
const statusResponse = statusWithToken ? parseJson(statusWithToken.text) : undefined;
const statusResponseHasExpectedShape =
  statusResponse?.outputRoot === outputRoot &&
  typeof statusResponse?.bundles?.macos === "boolean" &&
  typeof statusResponse?.bundles?.windows === "boolean" &&
  Array.isArray(statusResponse?.platforms?.macos?.missing) &&
  Array.isArray(statusResponse?.platforms?.windows?.missing);
const hasStatusResponseTokenLikeText = statusWithToken ? tokenLikePattern.test(statusWithToken.text) : true;
const hasCommandResponseTokenLikeText = commandsWithToken ? tokenLikePattern.test(commandsWithToken.text) : true;
const commandResponseHasExpectedRoutes = commandsWithToken
  ? commandsWithToken.text.includes("/upload/stack-installer-p1-macos.tgz") &&
    commandsWithToken.text.includes("/upload/stack-installer-p1-windows.zip")
  : false;
const hasNextActionsResponseTokenLikeText = nextActionsWithToken
  ? tokenLikePattern.test(nextActionsWithToken.text)
  : true;
const nextActionsResponseHasExpectedProofSteps = nextActionsWithToken
  ? nextActionsWithToken.text.includes("git checkout feat/stack-installer-p1-live") &&
    nextActionsWithToken.text.includes("/commands") &&
    nextActionsWithToken.text.includes("p1:proof:audit")
  : false;
const bundles = await bundleStatus();
const platforms = await Promise.all(requiredPlatforms.map(platformStatus));
const watcherStarted =
  watchPidFileMode !== "missing" || watchLogFileMode !== "missing" || watchCommandFileMode !== "missing";
const watcherRunning = Number.isInteger(watchPid) && processExists(watchPid);
const watcherPassed = watchLogText.includes("P1 proof watch passed");
const watcherWindowOk =
  !watcherStarted ||
  ((watcherRunning || watcherPassed) &&
    watchPidFileMode === "600" &&
    watchLogFileMode === "600" &&
    watchCommandFileMode === "600" &&
    !hasWatcherTokenLikeText);
const uploadWindowOk =
  health.ok &&
  processExists(pid) &&
  landing.ok &&
  statusWithoutToken.ok &&
  statusWithToken?.ok === true &&
  statusResponseHasExpectedShape &&
  commandsWithoutToken.ok &&
  commandsWithToken?.ok === true &&
  commandResponseHasExpectedRoutes &&
  nextActionsWithoutToken.ok &&
  nextActionsWithToken?.ok === true &&
  nextActionsResponseHasExpectedProofSteps &&
  tokenFileMode === "600" &&
  commandsFileMode === "600" &&
  pidFileMode === "600" &&
  !hasTokenLikeText &&
  !hasStatusResponseTokenLikeText &&
  !hasCommandResponseTokenLikeText &&
  !hasNextActionsResponseTokenLikeText &&
  watcherWindowOk &&
  bundles.ok &&
  platforms.every((platform) => platform.ok);

console.log(`Stack Installer P1 proof upload status for ${outputRoot}`);
console.log(`endpoint: http://${host}:${port}`);
console.log(`health: ${health.text}`);
console.log(`landing page: ${landing.status} ${landing.ok ? "ok" : "not-ok"}`);
console.log(`status endpoint without token: ${statusWithoutToken.status} ${statusWithoutToken.ok ? "ok" : "not-ok"}`);
console.log(
  `status endpoint with token: ${statusWithToken ? `${statusWithToken.status} ${statusWithToken.ok ? "ok" : "not-ok"}` : "missing-token"}`
);
console.log(`status endpoint has expected shape: ${statusResponseHasExpectedShape ? "yes" : "no"}`);
console.log(`token-like text in status endpoint response: ${hasStatusResponseTokenLikeText ? "yes" : "no"}`);
console.log(
  `commands endpoint without token: ${commandsWithoutToken.status} ${commandsWithoutToken.ok ? "ok" : "not-ok"}`
);
console.log(
  `commands endpoint with token: ${commandsWithToken ? `${commandsWithToken.status} ${commandsWithToken.ok ? "ok" : "not-ok"}` : "missing-token"}`
);
console.log(`commands endpoint has upload routes: ${commandResponseHasExpectedRoutes ? "yes" : "no"}`);
console.log(`token-like text in commands endpoint response: ${hasCommandResponseTokenLikeText ? "yes" : "no"}`);
console.log(
  `next-actions endpoint without token: ${nextActionsWithoutToken.status} ${nextActionsWithoutToken.ok ? "ok" : "not-ok"}`
);
console.log(
  `next-actions endpoint with token: ${nextActionsWithToken ? `${nextActionsWithToken.status} ${nextActionsWithToken.ok ? "ok" : "not-ok"}` : "missing-token"}`
);
console.log(`next-actions endpoint has proof steps: ${nextActionsResponseHasExpectedProofSteps ? "yes" : "no"}`);
console.log(`token-like text in next-actions endpoint response: ${hasNextActionsResponseTokenLikeText ? "yes" : "no"}`);
console.log(`pid: ${Number.isInteger(pid) ? `${pid} (${processExists(pid) ? "running" : "not running"})` : "missing"}`);
console.log(`token file mode: ${tokenFileMode}`);
console.log(`commands file mode: ${commandsFileMode}`);
console.log(`pid file mode: ${pidFileMode}`);
console.log(`log file present: ${await fileExists(logPath)}`);
console.log(`token-like text in logs/commands: ${hasTokenLikeText ? "yes" : "no"}`);
console.log("detached proof watcher:");
console.log(
  `- pid: ${Number.isInteger(watchPid) ? `${watchPid} (${watcherRunning ? "running" : "not running"})` : "missing"}`
);
console.log(`- completed: ${watcherPassed ? "yes" : "no"}`);
console.log(`- pid file mode: ${watchPidFileMode}`);
console.log(`- log file mode: ${watchLogFileMode}`);
console.log(`- command file mode: ${watchCommandFileMode}`);
console.log(`- token-like text in watcher log/command: ${hasWatcherTokenLikeText ? "yes" : "no"}`);
console.log("returned bundles:");
console.log(bundles.messages.join("\n"));
console.log("platform artifacts:");
console.log(platforms.map((platform) => platform.message).join("\n"));
console.log("recent upload log:");
console.log(logLines.length > 0 ? logLines.join("\n") : "- none");
console.log("recent watcher log:");
console.log(watchLogLines.length > 0 ? watchLogLines.join("\n") : "- none");

if (failOnMissing && !uploadWindowOk) {
  process.exitCode = 1;
}

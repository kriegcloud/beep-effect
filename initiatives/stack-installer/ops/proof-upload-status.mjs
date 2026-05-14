#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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

const formatDuration = (milliseconds) => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

const parseWatcherProgress = (text) => {
  let progress;

  for (const line of text.trim().split(/\r?\n/)) {
    const pending = line.match(/P1 proof watch attempt (\d+)\/(\d+) pending; sleeping (\d+)ms\./);

    if (pending) {
      progress = {
        attempt: Number.parseInt(pending[1], 10),
        attempts: Number.parseInt(pending[2], 10),
        intervalMs: Number.parseInt(pending[3], 10),
        state: "pending",
      };
      continue;
    }

    const passed = line.match(/P1 proof watch passed on attempt (\d+)\/(\d+)\./);

    if (passed) {
      progress = {
        attempt: Number.parseInt(passed[1], 10),
        attempts: Number.parseInt(passed[2], 10),
        intervalMs: undefined,
        state: "passed",
      };
      continue;
    }

    const exhausted = line.match(/P1 proof watch exhausted (\d+) attempts without passing audit-all\./);

    if (exhausted) {
      const attempts = Number.parseInt(exhausted[1], 10);

      progress = {
        attempt: attempts,
        attempts,
        intervalMs: undefined,
        state: "exhausted",
      };
    }
  }

  return progress;
};

const parseUploadActivity = (text) => {
  const lines = text.trim() ? text.trim().split(/\r?\n/) : [];
  const attempts = lines.filter((line) => /\s(?:PUT|POST)\s\/upload\//.test(line));
  const stored = attempts.filter((line) => /\s201\s/.test(line) && line.includes(" stored"));
  const rejected = attempts.filter((line) => !/\s201\s/.test(line));
  const remoteAddresses = new Set(
    attempts.flatMap((line) => {
      const match = line.match(/^\S+\s+\S+\s+\S+\s+\d+\s+(\S+)\s+/);

      return match ? [match[1]] : [];
    })
  );

  return {
    attempts: attempts.length,
    rejected: rejected.length,
    remoteAddresses: Array.from(remoteAddresses).sort(),
    stored: stored.length,
  };
};

const formatWatcherProgress = (progress) => {
  if (!progress) {
    return "unknown";
  }

  if (progress.state === "pending" && typeof progress.intervalMs === "number") {
    const remainingAttempts = Math.max(progress.attempts - progress.attempt, 0);

    return `${progress.attempt}/${progress.attempts} pending; ${remainingAttempts} attempts remaining; about ${formatDuration(
      remainingAttempts * progress.intervalMs
    )} left`;
  }

  return `${progress.attempt}/${progress.attempts} ${progress.state}`;
};

const formatUploadActivity = (activity) => {
  const remoteText = activity.remoteAddresses.length > 0 ? activity.remoteAddresses.join(", ") : "none";

  return `${activity.attempts} attempts; ${activity.stored} stored; ${activity.rejected} rejected; remotes: ${remoteText}`;
};

const watcherProcesses = (root) => {
  const result = spawnSync("ps", ["-eo", "pid=,ppid=,stat=,command="], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return {
      available: false,
      detail: (result.stderr || result.stdout || "ps unavailable").trim(),
      pids: [],
    };
  }

  const processes = result.stdout
    .split(/\r?\n/)
    .filter(
      (line) => line.includes(root) && (line.includes("p1:proof:watch") || line.includes("capture-p1-manual-proof.ts"))
    )
    .flatMap((line) => {
      const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(.+)$/);

      return match
        ? [
            {
              command: match[4],
              pid: Number.parseInt(match[1], 10),
              ppid: Number.parseInt(match[2], 10),
              stat: match[3],
            },
          ]
        : [];
    });

  return {
    available: true,
    detail:
      processes.length > 0 ? processes.map((entry) => `${entry.pid}/${entry.ppid}/${entry.stat}`).join(", ") : "none",
    pids: processes.map((entry) => entry.pid),
  };
};

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
const uploadActivity = parseUploadActivity(logText);
const watcherProgress = parseWatcherProgress(watchLogText);
const watcherProcessStatus = watcherProcesses(outputRoot);
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
const watcherPassed = watcherProgress?.state === "passed" || watchLogText.includes("P1 proof watch passed");
const watcherProcessOk = !watcherProcessStatus.available || watcherProcessStatus.pids.length <= 2;
const watcherWindowOk =
  !watcherStarted ||
  ((watcherRunning || watcherPassed) &&
    watchPidFileMode === "600" &&
    watchLogFileMode === "600" &&
    watchCommandFileMode === "600" &&
    watcherProcessOk &&
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
console.log(`upload activity: ${formatUploadActivity(uploadActivity)}`);
console.log("detached proof watcher:");
console.log(
  `- pid: ${Number.isInteger(watchPid) ? `${watchPid} (${watcherRunning ? "running" : "not running"})` : "missing"}`
);
console.log(`- progress: ${formatWatcherProgress(watcherProgress)}`);
console.log(`- completed: ${watcherPassed ? "yes" : "no"}`);
console.log(
  `- active processes: ${watcherProcessStatus.available ? watcherProcessStatus.detail : `unknown (${watcherProcessStatus.detail})`}`
);
console.log(`- stale process check: ${watcherProcessOk ? "ok" : "too-many-watchers"}`);
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

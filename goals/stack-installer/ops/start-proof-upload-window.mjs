#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import crypto from "node:crypto";
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
const advertisedUrl = argAfter("--advertised-url", "").replace(/\/+$/, "");
const tokenBytes = Number.parseInt(argAfter("--token-bytes", "24"), 10);
const replaceExisting = hasArg("--replace-existing");
const reuseToken = hasArg("--reuse-token");
const preserveLog = hasArg("--preserve-log");
const serverScript = path.resolve("goals/stack-installer/ops/proof-upload-server.mjs");
const urlBase = `http://${host}:${port}`;

const tokenPath = path.join(outputRoot, "proof-upload-token.txt");
const commandsPath = path.join(outputRoot, "proof-upload-commands.txt");
const inboxReadmePath = path.join(outputRoot, "README.operator-inbox.md");
const nextActionsPath = path.join(outputRoot, "OPERATOR_NEXT_ACTIONS.md");
const pidPath = path.join(outputRoot, "proof-upload-server.pid");
const logPath = path.join(outputRoot, "proof-upload-server.log");

const processExists = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const execFileText = (command, args) =>
  new Promise((resolve) => {
    execFile(command, args, { timeout: 2000 }, (error, stdout) => {
      resolve(error ? "" : String(stdout).trim());
    });
  });

const readProcessCommand = async (pid) =>
  fs.promises
    .readFile(`/proc/${pid}/cmdline`, "utf8")
    .then((text) => text.replaceAll("\u0000", " ").trim())
    .catch(async () => {
      if (process.platform === "win32") {
        return await execFileText("powershell.exe", [
          "-NoProfile",
          "-Command",
          `(Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}").CommandLine`,
        ]);
      }

      return await execFileText("ps", ["-ww", "-o", "command=", "-p", String(pid)]);
    });

const isExpectedUploadServerProcess = async (pid) => {
  if (!Number.isInteger(pid) || pid <= 1) {
    return false;
  }

  const command = await readProcessCommand(pid);

  return command.includes("proof-upload-server.mjs") && command.includes(outputRoot);
};

const stopExisting = async () => {
  const rawPid = await fs.promises.readFile(pidPath, "utf8").catch(() => "");
  const pid = Number.parseInt(rawPid.trim(), 10);

  if (!Number.isInteger(pid) || !processExists(pid)) {
    return;
  }

  if (!(await isExpectedUploadServerProcess(pid))) {
    throw new Error(`Refusing to stop pid ${pid}; it is not the expected proof-upload-server process.`);
  }

  if (!replaceExisting) {
    throw new Error(
      `Upload server already appears to be running with pid ${pid}; pass --replace-existing to restart it.`
    );
  }

  process.kill(pid);
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

const writePublicFile = async (filePath, content) => {
  await fs.promises.writeFile(filePath, content, { mode: 0o644 });
  await fs.promises.chmod(filePath, 0o644);
};

const operatorUrlBase = advertisedUrl || urlBase;

const buildCommandsText = () =>
  [
    "Stack Installer P1 proof upload endpoint",
    "",
    "Coordinator URL base:",
    urlBase,
    ...(advertisedUrl ? ["", "Alternate operator URL base:", advertisedUrl] : []),
    "",
    "Coordinator-local token file, do not commit or paste in public channels:",
    tokenPath,
    "",
    "Before upload health check:",
    `curl -f '${urlBase}/health'`,
    ...(advertisedUrl ? [`curl -f '${advertisedUrl}/health'`] : []),
    "",
    "Remote status check:",
    `curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${urlBase}/status'`,
    ...(advertisedUrl
      ? [`curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${advertisedUrl}/status'`]
      : []),
    "",
    "Fetch current upload commands from a proof machine:",
    `curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${urlBase}/commands'`,
    ...(advertisedUrl
      ? [`curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${advertisedUrl}/commands'`]
      : []),
    "",
    "Fetch current full operator next actions from a proof machine:",
    `curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${urlBase}/next-actions'`,
    ...(advertisedUrl
      ? [`curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${advertisedUrl}/next-actions'`]
      : []),
    "",
    "macOS upload command:",
    'export STACK_INSTALLER_PROOF_UPLOAD_TOKEN="<copy token from coordinator-local token file>"',
    `curl -f --upload-file output/stack-installer/p1-live/stack-installer-p1-macos.tgz -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${urlBase}/upload/stack-installer-p1-macos.tgz'`,
    ...(advertisedUrl
      ? [
          `curl -f --upload-file output/stack-installer/p1-live/stack-installer-p1-macos.tgz -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${advertisedUrl}/upload/stack-installer-p1-macos.tgz'`,
        ]
      : []),
    "",
    "Windows PowerShell upload command:",
    '$env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN = "<copy token from coordinator-local token file>"',
    `Invoke-WebRequest -Method Put -InFile 'output\\stack-installer\\p1-live\\stack-installer-p1-windows.zip' -Headers @{ Authorization = "Bearer $env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN" } -Uri '${urlBase}/upload/stack-installer-p1-windows.zip'`,
    ...(advertisedUrl
      ? [
          `Invoke-WebRequest -Method Put -InFile 'output\\stack-installer\\p1-live\\stack-installer-p1-windows.zip' -Headers @{ Authorization = "Bearer $env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN" } -Uri '${advertisedUrl}/upload/stack-installer-p1-windows.zip'`,
        ]
      : []),
    "",
    "Coordinator intake after upload:",
    "cd apps/stack-installer",
    "bun run p1:proof:intake -- --output-root ../../output/stack-installer/p1-live",
    "bun run p1:proof:audit-all -- --output-root ../../output/stack-installer/p1-live",
    "",
  ].join("\n");

const buildInboxReadmeText = () =>
  [
    "# Stack Installer P1 Proof Inbox",
    "",
    "Place returned proof bundles here:",
    "",
    "- `stack-installer-p1-macos.tgz`",
    "- `stack-installer-p1-windows.zip`",
    "",
    "Current live upload endpoint:",
    "",
    `- URL base: \`${urlBase}\``,
    ...(advertisedUrl ? [`- MagicDNS URL base: \`${advertisedUrl}\``] : []),
    `- Health check: \`curl -f '${urlBase}/health'\``,
    ...(advertisedUrl ? [`- MagicDNS health check: \`curl -f '${advertisedUrl}/health'\``] : []),
    `- Fetch current upload commands: \`curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${operatorUrlBase}/commands'\``,
    `- Fetch full next actions: \`curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${operatorUrlBase}/next-actions'\``,
    `- Inspect coordinator receipt: \`curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${operatorUrlBase}/status'\``,
    `- Coordinator-local token file: \`${path.relative(process.cwd(), tokenPath)}\``,
    `- Generated upload commands: \`${path.relative(process.cwd(), commandsPath)}\``,
    "",
    "Token handling:",
    "",
    "- Put the token in `STACK_INSTALLER_PROOF_UPLOAD_TOKEN` on the proof machine.",
    "- Send it only as `Authorization: Bearer ...`.",
    "- Do not place the token in URLs, chat, commits, screencasts, PR comments, or command transcripts.",
    "",
    "Required archive shapes:",
    "",
    "- macOS archive: top-level `macos/` directory with `proof.json`, `commands.txt`, `sha256sums.txt`, and `screencast.*`.",
    "- Windows archive: top-level `windows/` directory with `proof.json`, `commands.txt`, `sha256sums.txt`, and `screencast.*`.",
    "",
    "Coordinator after upload:",
    "",
    "```bash",
    "cd apps/stack-installer",
    "bun run p1:proof:intake -- --output-root ../../output/stack-installer/p1-live",
    "bun run p1:proof:audit-all -- --output-root ../../output/stack-installer/p1-live",
    "```",
    "",
    "Current blocker if using Taildrop instead of upload:",
    "",
    "```bash",
    "sudo tailscale set --operator=$USER",
    "tailscale file get output/stack-installer/p1-live",
    "```",
    "",
  ].join("\n");

const buildNextActionsText = () =>
  [
    "# Stack Installer P1 Operator Next Actions",
    "",
    "This file is local-only under ignored `output/`. Do not commit it.",
    "",
    "## Goal",
    "",
    "Return exactly these two bundles to this coordinator checkout:",
    "",
    "- `output/stack-installer/p1-live/stack-installer-p1-macos.tgz`",
    "- `output/stack-installer/p1-live/stack-installer-p1-windows.zip`",
    "",
    "The coordinator upload endpoint is live at:",
    "",
    "```text",
    urlBase,
    ...(advertisedUrl ? [advertisedUrl] : []),
    "```",
    "",
    "The one-time token is stored only on the coordinator at:",
    "",
    "```text",
    path.relative(process.cwd(), tokenPath),
    "```",
    "",
    "Do not put the token in URLs, chat, commits, screencasts, PR comments, or captured command transcripts.",
    "Send it only in the `Authorization: Bearer ...` header.",
    "",
    "Proof machines can fetch the current upload commands after setting the token:",
    "",
    "```bash",
    `curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${operatorUrlBase}/commands'`,
    "```",
    "",
    "Proof machines can fetch this full next-actions note after setting the token:",
    "",
    "```bash",
    `curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" '${operatorUrlBase}/next-actions'`,
    "```",
    "",
    "## On Each Proof Machine",
    "",
    "1. Sync the branch:",
    "",
    "```bash",
    "git fetch origin",
    "git checkout feat/stack-installer-p1-live",
    "git pull --ff-only",
    "bun install",
    "```",
    "",
    "2. Run the preflight:",
    "",
    "```bash",
    "bun run config-sync:check",
    "(cd apps/stack-installer && bun run build)",
    "(cd apps/stack-installer/src-tauri && cargo check)",
    "command -v op",
    "command -v claude",
    "command -v codex",
    "op whoami",
    "claude auth status",
    "codex login status",
    "```",
    "",
    "3. Run the P1 capture using the platform-specific command from:",
    "",
    "```text",
    "goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md",
    "```",
    "",
    "4. Add a `screencast.*` file to the platform artifact directory.",
    "",
    "5. Refresh checksums, audit locally, package the platform directory, then upload the bundle.",
    "",
    "macOS, Git Bash, or WSL checksum and audit commands:",
    "",
    "```bash",
    "cd apps/stack-installer",
    'bun run p1:proof:checksums -- --platform "$STACK_INSTALLER_PLATFORM"',
    'bun run p1:proof:audit -- --platform "$STACK_INSTALLER_PLATFORM"',
    "```",
    "",
    "Native Windows PowerShell checksum and audit commands:",
    "",
    "```powershell",
    "Set-Location apps/stack-installer",
    "bun run p1:proof:checksums -- --platform $env:STACK_INSTALLER_PLATFORM",
    "bun run p1:proof:audit -- --platform $env:STACK_INSTALLER_PLATFORM",
    "```",
    "",
    "Use the command endpoint or `proof-upload-commands.txt` for the current exact upload commands.",
    "",
  ].join("\n");

await fs.promises.mkdir(outputRoot, { recursive: true });
await stopExisting();

const existingToken = (await fs.promises.readFile(tokenPath, "utf8").catch(() => "")).trim();
const token = reuseToken && existingToken ? existingToken : crypto.randomBytes(tokenBytes).toString("hex");
await writePrivateFile(tokenPath, `${token}\n`);
await writePrivateFile(commandsPath, `${buildCommandsText()}\n`);
await writePublicFile(inboxReadmePath, `${buildInboxReadmeText()}\n`);
await writePublicFile(nextActionsPath, `${buildNextActionsText()}\n`);
if (preserveLog) {
  await ensurePrivateFile(logPath);
} else {
  await writePrivateFile(logPath, "");
}

const logHandle = await fs.promises.open(logPath, "a");
const child = spawn(
  process.execPath,
  [serverScript, "--host", host, "--port", String(port), "--output-root", outputRoot],
  {
    detached: true,
    env: {
      ...process.env,
      STACK_INSTALLER_PROOF_UPLOAD_TOKEN: token,
    },
    stdio: ["ignore", logHandle.fd, logHandle.fd],
  }
);

child.unref();
await logHandle.close();
await writePrivateFile(pidPath, `${child.pid}\n`);

console.log(`Stack Installer proof upload window started on http://${host}:${port}`);
console.log(`pid: ${child.pid}`);
console.log(`token: ${reuseToken && existingToken ? "reused existing token" : "rotated token"}`);
console.log(`log: ${preserveLog ? "preserved existing log" : "rotated log"}`);
console.log(`token file: ${tokenPath}`);
console.log(`commands file: ${commandsPath}`);
console.log(`operator inbox readme: ${inboxReadmePath}`);
console.log(`operator next actions: ${nextActionsPath}`);
console.log(`log file: ${logPath}`);

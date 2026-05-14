#!/usr/bin/env node

import { spawn } from "node:child_process";
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
const tokenBytes = Number.parseInt(argAfter("--token-bytes", "24"), 10);
const replaceExisting = hasArg("--replace-existing");
const serverScript = path.resolve("initiatives/stack-installer/ops/proof-upload-server.mjs");

const tokenPath = path.join(outputRoot, "proof-upload-token.txt");
const commandsPath = path.join(outputRoot, "proof-upload-commands.txt");
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

const stopExisting = async () => {
  const rawPid = await fs.promises.readFile(pidPath, "utf8").catch(() => "");
  const pid = Number.parseInt(rawPid.trim(), 10);

  if (!Number.isInteger(pid) || !processExists(pid)) {
    return;
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

const buildCommandsText = () =>
  [
    "Stack Installer P1 proof upload endpoint",
    "",
    "Coordinator URL base:",
    `http://${host}:${port}`,
    "",
    "Coordinator-local token file, do not commit or paste in public channels:",
    tokenPath,
    "",
    "Before upload health check:",
    `curl -f 'http://${host}:${port}/health'`,
    "",
    "Remote status check:",
    `curl -f -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" 'http://${host}:${port}/status'`,
    "",
    "macOS upload command:",
    'export STACK_INSTALLER_PROOF_UPLOAD_TOKEN="<copy token from coordinator-local token file>"',
    `curl -f --upload-file output/stack-installer/p1-live/stack-installer-p1-macos.tgz -H "Authorization: Bearer \${STACK_INSTALLER_PROOF_UPLOAD_TOKEN}" 'http://${host}:${port}/upload/stack-installer-p1-macos.tgz'`,
    "",
    "Windows PowerShell upload command:",
    '$env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN = "<copy token from coordinator-local token file>"',
    `Invoke-WebRequest -Method Put -InFile 'output\\stack-installer\\p1-live\\stack-installer-p1-windows.zip' -Headers @{ Authorization = "Bearer $env:STACK_INSTALLER_PROOF_UPLOAD_TOKEN" } -Uri 'http://${host}:${port}/upload/stack-installer-p1-windows.zip'`,
    "",
    "Coordinator intake after upload:",
    "cd apps/stack-installer",
    "bun run p1:proof:intake -- --output-root ../../output/stack-installer/p1-live",
    "bun run p1:proof:audit-all -- --output-root ../../output/stack-installer/p1-live",
    "",
  ].join("\n");

await fs.promises.mkdir(outputRoot, { recursive: true });
await stopExisting();

const token = crypto.randomBytes(tokenBytes).toString("hex");
await writePrivateFile(tokenPath, `${token}\n`);
await writePrivateFile(commandsPath, `${buildCommandsText()}\n`);
await writePrivateFile(logPath, "");

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
console.log(`token file: ${tokenPath}`);
console.log(`commands file: ${commandsPath}`);
console.log(`log file: ${logPath}`);

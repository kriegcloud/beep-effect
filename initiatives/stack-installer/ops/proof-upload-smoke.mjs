#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(import.meta.dirname, "..", "..", "..");
const startScript = path.join(repoRoot, "initiatives", "stack-installer", "ops", "start-proof-upload-window.mjs");
const tokenLikePattern = /[a-f0-9]{32,}|token=[^<\s'"]+/i;

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const freePort = async () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      server.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
          return;
        }

        reject(new Error("Could not allocate a local smoke-test port."));
      });
    });
  });

const readText = async (filePath) => fs.promises.readFile(filePath, "utf8");

const fileMode = async (filePath) => {
  const stat = await fs.promises.stat(filePath);

  return (stat.mode & 0o777).toString(8).padStart(3, "0");
};

const sha256File = async (filePath) =>
  crypto
    .createHash("sha256")
    .update(await fs.promises.readFile(filePath))
    .digest("hex");

const waitForHealth = async (url) => {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      const response = await fetch(`${url}/health`);

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the detached server is listening.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Proof upload smoke server did not become healthy at ${url}.`);
};

const endpoint = async (url, pathname, token) => {
  const response = await fetch(`${url}${pathname}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const text = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    text,
  };
};

const startWindow = (outputRoot, port, args = []) => {
  const result = spawnSync(
    process.execPath,
    [
      startScript,
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--output-root",
      outputRoot,
      "--advertised-url",
      `http://stack-installer-proof-smoke.localhost:${port}`,
      ...args,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
    }
  );

  assert(result.status === 0, `start-proof-upload-window failed:\n${result.stdout}\n${result.stderr}`);
};

const processExists = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const stopPid = (pid) => {
  if (Number.isInteger(pid) && processExists(pid)) {
    process.kill(pid);
  }
};

const outputRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), "stack-installer-proof-upload-smoke-"));
const port = await freePort();
const url = `http://127.0.0.1:${port}`;
let firstPid = Number.NaN;
let secondPid = Number.NaN;

try {
  startWindow(outputRoot, port);
  firstPid = Number.parseInt(await readText(path.join(outputRoot, "proof-upload-server.pid")), 10);
  await waitForHealth(url);

  const firstTokenDigest = await sha256File(path.join(outputRoot, "proof-upload-token.txt"));

  startWindow(outputRoot, port, ["--replace-existing", "--reuse-token"]);
  secondPid = Number.parseInt(await readText(path.join(outputRoot, "proof-upload-server.pid")), 10);
  await waitForHealth(url);

  const secondTokenDigest = await sha256File(path.join(outputRoot, "proof-upload-token.txt"));
  const token = (await readText(path.join(outputRoot, "proof-upload-token.txt"))).trim();
  const commandsText = await readText(path.join(outputRoot, "proof-upload-commands.txt"));
  const inboxReadmeText = await readText(path.join(outputRoot, "README.operator-inbox.md"));
  const nextActionsText = await readText(path.join(outputRoot, "OPERATOR_NEXT_ACTIONS.md"));

  assert(firstPid !== secondPid, "Expected --replace-existing to restart the upload server.");
  assert(firstTokenDigest === secondTokenDigest, "Expected --reuse-token to preserve the upload token.");
  assert((await fileMode(path.join(outputRoot, "proof-upload-token.txt"))) === "600", "Token file must be 0600.");
  assert((await fileMode(path.join(outputRoot, "proof-upload-commands.txt"))) === "600", "Commands file must be 0600.");
  assert((await fileMode(path.join(outputRoot, "proof-upload-server.pid"))) === "600", "PID file must be 0600.");
  assert((await fileMode(path.join(outputRoot, "README.operator-inbox.md"))) === "644", "Inbox README must be 0644.");
  assert(
    (await fileMode(path.join(outputRoot, "OPERATOR_NEXT_ACTIONS.md"))) === "644",
    "Next-actions file must be 0644."
  );

  for (const [fileName, text] of [
    ["proof-upload-commands.txt", commandsText],
    ["README.operator-inbox.md", inboxReadmeText],
    ["OPERATOR_NEXT_ACTIONS.md", nextActionsText],
  ]) {
    assert(text.includes("/commands"), `${fileName} must mention /commands.`);
    assert(text.includes("/next-actions"), `${fileName} must mention /next-actions.`);
    assert(!tokenLikePattern.test(text), `${fileName} must not contain token-like text.`);
  }

  const health = await endpoint(url, "/health");
  const landing = await endpoint(url, "/");
  const statusWithoutToken = await endpoint(url, "/status");
  const statusWithToken = await endpoint(url, "/status", token);
  const commandsWithoutToken = await endpoint(url, "/commands");
  const commandsWithToken = await endpoint(url, "/commands", token);
  const nextActionsWithoutToken = await endpoint(url, "/next-actions");
  const nextActionsWithToken = await endpoint(url, "/next-actions", token);

  assert(health.status === 200, "Expected /health to return 200.");
  assert(landing.status === 200 && landing.text.includes("/next-actions"), "Expected / to advertise /next-actions.");
  assert(statusWithoutToken.status === 403, "Expected /status without token to return 403.");
  assert(statusWithToken.status === 200, "Expected /status with token to return 200.");
  assert(commandsWithoutToken.status === 403, "Expected /commands without token to return 403.");
  assert(commandsWithToken.status === 200, "Expected /commands with token to return 200.");
  assert(nextActionsWithoutToken.status === 403, "Expected /next-actions without token to return 403.");
  assert(nextActionsWithToken.status === 200, "Expected /next-actions with token to return 200.");

  const statusJson = JSON.parse(statusWithToken.text);

  assert(statusJson.outputRoot === outputRoot, "Expected /status outputRoot to match the smoke output root.");
  assert(statusJson.bundles.macos === false, "Expected smoke macOS bundle status to be false.");
  assert(statusJson.bundles.windows === false, "Expected smoke Windows bundle status to be false.");
  assert(commandsWithToken.text.includes("/upload/stack-installer-p1-macos.tgz"), "Expected macOS upload route.");
  assert(commandsWithToken.text.includes("/upload/stack-installer-p1-windows.zip"), "Expected Windows upload route.");
  assert(nextActionsWithToken.text.includes("git checkout feat/stack-installer-p1-live"), "Expected branch sync step.");
  assert(nextActionsWithToken.text.includes("p1:proof:audit"), "Expected proof audit step.");
  assert(!tokenLikePattern.test(statusWithToken.text), "Expected /status response to avoid token-like text.");
  assert(!tokenLikePattern.test(commandsWithToken.text), "Expected /commands response to avoid token-like text.");
  assert(
    !tokenLikePattern.test(nextActionsWithToken.text),
    "Expected /next-actions response to avoid token-like text."
  );

  console.log("Stack Installer proof upload smoke passed.");
  console.log(`port: ${port}`);
  console.log(`output root: ${outputRoot}`);
} finally {
  stopPid(secondPid);
  stopPid(firstPid);
  await fs.promises.rm(outputRoot, { force: true, recursive: true });
}

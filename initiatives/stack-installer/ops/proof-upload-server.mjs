#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const args = process.argv.slice(2);

const argAfter = (name, fallback) => {
  const index = args.indexOf(name);

  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = argAfter("--host", "127.0.0.1");
const port = Number.parseInt(argAfter("--port", "8765"), 10);
const outputRoot = path.resolve(argAfter("--output-root", process.cwd()));
const token = process.env.STACK_INSTALLER_PROOF_UPLOAD_TOKEN ?? "";
const maxBytes = Number.parseInt(argAfter("--max-bytes", `${2 * 1024 * 1024 * 1024}`), 10);
const allowedFileNames = new Set(["stack-installer-p1-macos.tgz", "stack-installer-p1-windows.zip"]);
const requiredPlatforms = ["macos", "windows"];
const requiredArtifactFiles = ["proof.json", "commands.txt", "sha256sums.txt"];
const uploadCommandsPath = path.join(outputRoot, "proof-upload-commands.txt");
const nextActionsPath = path.join(outputRoot, "OPERATOR_NEXT_ACTIONS.md");

if (!token) {
  throw new Error("Missing STACK_INSTALLER_PROOF_UPLOAD_TOKEN.");
}

const logRequest = (request, statusCode, message, details = "") => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
  const remoteAddress = request.socket.remoteAddress ?? "unknown";
  const sanitizedPath = `${requestUrl.pathname}${requestUrl.searchParams.has("token") ? "?token=<redacted>" : ""}`;
  const suffix = details ? ` ${details}` : "";

  console.log(
    `${new Date().toISOString()} ${request.method ?? "UNKNOWN"} ${sanitizedPath} ${statusCode} ${remoteAddress} ${message}${suffix}`
  );
};

const send = (response, statusCode, body) => {
  response.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
  response.end(`${body}\n`);
};

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(body, null, 2)}\n`);
};

const requestToken = (request, requestUrl) => {
  const authorization = request.headers.authorization ?? "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return requestUrl.searchParams.get("token") ?? "";
};

const fileExists = async (filePath) =>
  fs.promises
    .access(filePath)
    .then(() => true)
    .catch(() => false);

const platformArtifactStatus = async (platform) => {
  const platformDir = path.join(outputRoot, platform);
  const exists = await fileExists(platformDir);

  if (!exists) {
    return {
      exists,
      missing: ["directory"],
    };
  }

  const entries = await fs.promises.readdir(platformDir).catch(() => []);
  const missing = requiredArtifactFiles.filter((fileName) => !entries.includes(fileName));

  if (!entries.some((entry) => entry.startsWith("screencast."))) {
    missing.push("screencast.*");
  }

  return {
    exists,
    missing,
  };
};

const uploadStatus = async () => ({
  bundles: {
    macos: await fileExists(path.join(outputRoot, "stack-installer-p1-macos.tgz")),
    windows: await fileExists(path.join(outputRoot, "stack-installer-p1-windows.zip")),
  },
  outputRoot,
  platforms: Object.fromEntries(
    await Promise.all(requiredPlatforms.map(async (platform) => [platform, await platformArtifactStatus(platform)]))
  ),
});

const landingPage = () =>
  [
    "Stack Installer P1 proof upload endpoint",
    "",
    "Public checks:",
    "- GET /health",
    "",
    "Token-protected checks:",
    "- GET /status",
    "- GET /commands",
    "- GET /next-actions",
    "",
    "Allowed uploads:",
    "- PUT or POST /upload/stack-installer-p1-macos.tgz",
    "- PUT or POST /upload/stack-installer-p1-windows.zip",
    "",
    "Use an Authorization: Bearer token header for /status, /commands, /next-actions, and /upload requests.",
    "Do not put the proof upload token in URLs, chat, commits, screencasts, or command transcripts.",
  ].join("\n");

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);

    if (request.method === "GET" && requestUrl.pathname === "/") {
      logRequest(request, 200, "landing");
      send(response, 200, landingPage());
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/next-actions") {
      if (requestToken(request, requestUrl) !== token) {
        logRequest(request, 403, "invalid-token");
        send(response, 403, "Invalid upload token.");
        return;
      }

      const nextActions = await fs.promises.readFile(nextActionsPath, "utf8").catch(() => "");

      if (!nextActions) {
        logRequest(request, 404, "next-actions-missing");
        send(response, 404, "Operator next-actions file is missing.");
        return;
      }

      logRequest(request, 200, "next-actions");
      send(response, 200, nextActions.trimEnd());
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/health") {
      logRequest(request, 200, "health");
      send(response, 200, "ok");
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/status") {
      if (requestToken(request, requestUrl) !== token) {
        logRequest(request, 403, "invalid-token");
        send(response, 403, "Invalid upload token.");
        return;
      }

      logRequest(request, 200, "status");
      sendJson(response, 200, await uploadStatus());
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/commands") {
      if (requestToken(request, requestUrl) !== token) {
        logRequest(request, 403, "invalid-token");
        send(response, 403, "Invalid upload token.");
        return;
      }

      const commands = await fs.promises.readFile(uploadCommandsPath, "utf8").catch(() => "");

      if (!commands) {
        logRequest(request, 404, "commands-missing");
        send(response, 404, "Upload command file is missing.");
        return;
      }

      logRequest(request, 200, "commands");
      send(response, 200, commands.trimEnd());
      return;
    }

    if (request.method !== "PUT" && request.method !== "POST") {
      logRequest(request, 405, "method-not-allowed");
      send(response, 405, "Use PUT or POST.");
      return;
    }

    if (requestToken(request, requestUrl) !== token) {
      logRequest(request, 403, "invalid-token");
      send(response, 403, "Invalid upload token.");
      return;
    }

    const fileName = decodeURIComponent(requestUrl.pathname.replace(/^\/upload\//, ""));

    if (!allowedFileNames.has(fileName)) {
      logRequest(request, 400, "unsupported-file-name", fileName);
      send(response, 400, `Unsupported file name: ${fileName}`);
      return;
    }

    const contentLength = Number.parseInt(String(request.headers["content-length"] ?? "0"), 10);

    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      logRequest(request, 413, "upload-too-large", `${contentLength} bytes`);
      send(response, 413, `Upload is too large: ${contentLength} bytes.`);
      return;
    }

    await fs.promises.mkdir(outputRoot, { recursive: true });

    const destinationPath = path.join(outputRoot, fileName);
    const temporaryPath = path.join(outputRoot, `.${fileName}.uploading`);
    let receivedBytes = 0;

    request.on("data", (chunk) => {
      receivedBytes += chunk.length;

      if (receivedBytes > maxBytes) {
        request.destroy(new Error(`Upload exceeded ${maxBytes} bytes.`));
      }
    });

    await pipeline(request, fs.createWriteStream(temporaryPath, { flags: "w", mode: 0o600 }));
    await fs.promises.rename(temporaryPath, destinationPath);

    logRequest(request, 201, "stored", `${fileName} ${receivedBytes} bytes`);
    send(response, 201, `stored ${fileName} (${receivedBytes} bytes)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    logRequest(request, 500, "error", message);
    send(response, 500, message);
  }
});

server.listen(port, host, () => {
  console.log(`Stack Installer proof upload server listening on http://${host}:${port}`);
  console.log(`Output root: ${outputRoot}`);
  console.log("Allowed files: stack-installer-p1-macos.tgz, stack-installer-p1-windows.zip");
});

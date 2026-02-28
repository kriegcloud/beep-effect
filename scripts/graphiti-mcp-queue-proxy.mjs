#!/usr/bin/env bun

const parsePositiveInt = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }
  return fallback;
};

const listenHost = process.env.GRAPHITI_PROXY_HOST ?? "127.0.0.1";
const listenPort = parsePositiveInt(process.env.GRAPHITI_PROXY_PORT, 8123);
const concurrency = parsePositiveInt(process.env.GRAPHITI_PROXY_CONCURRENCY, 1);
const maxQueue = parsePositiveInt(process.env.GRAPHITI_PROXY_MAX_QUEUE, 500);
const requestTimeoutMs = parsePositiveInt(process.env.GRAPHITI_PROXY_REQUEST_TIMEOUT_MS, 60_000);
const verbose = parseBoolean(process.env.GRAPHITI_PROXY_VERBOSE, false);
const dependencyHealthEnabled = parseBoolean(process.env.GRAPHITI_PROXY_DEPENDENCY_HEALTH_ENABLED, true);
const dependencyHealthTtlMs = parsePositiveInt(process.env.GRAPHITI_PROXY_DEPENDENCY_HEALTH_TTL_MS, 5_000);
const falkorContainer = process.env.GRAPHITI_PROXY_FALKOR_CONTAINER ?? "graphiti-mcp-falkordb-1";
const graphitiContainer = process.env.GRAPHITI_PROXY_GRAPHITI_CONTAINER ?? "graphiti-mcp-graphiti-mcp-1";
const upstreamBase = new URL(process.env.GRAPHITI_PROXY_UPSTREAM ?? "http://127.0.0.1:8000/mcp");

const state = {
  active: 0,
  queue: [],
  peakQueueDepth: 0,
  processed: 0,
  failed: 0,
  rejected: 0,
};

const dependencyState = {
  checkedAtMs: 0,
  status: "unknown",
  details: {
    falkor: "unknown",
    graphiti: "unknown",
  },
};

const logger = {
  info: (message) => {
    console.log(`[graphiti-proxy] ${message}`);
  },
  debug: (message) => {
    if (verbose) {
      console.log(`[graphiti-proxy:debug] ${message}`);
    }
  },
  error: (message) => {
    console.error(`[graphiti-proxy:error] ${message}`);
  },
};

const queueStats = () => ({
  active: state.active,
  queued: state.queue.length,
  peakQueueDepth: state.peakQueueDepth,
  processed: state.processed,
  failed: state.failed,
  rejected: state.rejected,
  concurrency,
  maxQueue,
  upstream: upstreamBase.toString(),
});

const readContainerHealth = (containerName) => {
  if (!dependencyHealthEnabled) {
    return "unknown";
  }

  const result = Bun.spawnSync({
    cmd: ["docker", "inspect", "--format", "{{.State.Health.Status}}", containerName],
    stdout: "pipe",
    stderr: "pipe",
  });

  if (!result.success) {
    return "unknown";
  }

  const value = result.stdout.toString("utf8").trim().toLowerCase();
  if (value === "healthy" || value === "unhealthy" || value === "starting") {
    return value;
  }
  return "unknown";
};

const currentDependencySnapshot = () => {
  const nowMs = Date.now();
  if (nowMs - dependencyState.checkedAtMs < dependencyHealthTtlMs) {
    return {
      status: dependencyState.status,
      details: dependencyState.details,
    };
  }

  const falkor = readContainerHealth(falkorContainer);
  const graphiti = readContainerHealth(graphitiContainer);
  const status =
    dependencyHealthEnabled && (falkor !== "healthy" || graphiti !== "healthy") ? "degraded" : "ok";

  dependencyState.checkedAtMs = nowMs;
  dependencyState.status = status;
  dependencyState.details = {
    falkor,
    graphiti,
  };

  return {
    status,
    details: dependencyState.details,
  };
};

const healthResponse = () => {
  const dependency = currentDependencySnapshot();
  const status = dependency.status === "ok" ? "ok" : "degraded";
  const statusCode = status === "ok" ? 200 : 503;

  return new Response(
    JSON.stringify(
      {
        status,
        ...queueStats(),
        dependencies: dependency.details,
      },
      null,
      2
    ),
    {
      status: statusCode,
      headers: {
        "content-type": "application/json",
      },
    }
  );
};

const forwardToUpstream = async (request) => {
  const inboundUrl = new URL(request.url);
  const destination = new URL(`${inboundUrl.pathname}${inboundUrl.search}`, upstreamBase);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  logger.debug(`forwarding ${method} ${inboundUrl.pathname} -> ${destination.toString()}`);

  const upstreamResponse = await fetch(destination, {
    method,
    headers,
    body,
    redirect: "manual",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.set("x-graphiti-proxy-queued", String(state.queue.length));
  responseHeaders.set("x-graphiti-proxy-active", String(state.active));

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
};

const runNext = () => {
  while (state.active < concurrency && state.queue.length > 0) {
    const next = state.queue.shift();
    if (next === undefined) {
      return;
    }

    state.active += 1;
    Promise.resolve()
      .then(() => forwardToUpstream(next.request))
      .then((response) => {
        state.processed += 1;
        next.resolve(response);
      })
      .catch((cause) => {
        state.failed += 1;
        const message = cause instanceof Error ? cause.message : String(cause);
        logger.error(`upstream request failed: ${message}`);
        next.resolve(
          new Response(
            JSON.stringify(
              {
                error: "upstream_failure",
                message,
              },
              null,
              2
            ),
            {
              status: 502,
              headers: { "content-type": "application/json" },
            }
          )
        );
      })
      .finally(() => {
        state.active -= 1;
        runNext();
      });
  }
};

const enqueueRequest = (request) =>
  new Promise((resolve) => {
    if (state.queue.length >= maxQueue) {
      state.rejected += 1;
      resolve(
        new Response(
          JSON.stringify(
            {
              error: "queue_full",
              message: `Graphiti proxy queue full (max ${String(maxQueue)})`,
            },
            null,
            2
          ),
          {
            status: 503,
            headers: { "content-type": "application/json", "retry-after": "1" },
          }
        )
      );
      return;
    }

    state.queue.push({ request, resolve });
    if (state.queue.length > state.peakQueueDepth) {
      state.peakQueueDepth = state.queue.length;
    }
    runNext();
  });

const server = Bun.serve({
  hostname: listenHost,
  port: listenPort,
  reusePort: true,
  fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/healthz" || pathname === "/metrics") {
      return healthResponse();
    }

    return enqueueRequest(request);
  },
});

logger.info(`listening on http://${listenHost}:${String(server.port)}`);
logger.info(`forwarding to ${upstreamBase.toString()}`);
logger.info(
  `queue settings concurrency=${String(concurrency)} maxQueue=${String(maxQueue)} timeoutMs=${String(requestTimeoutMs)}`
);
logger.info("health endpoint: /healthz");

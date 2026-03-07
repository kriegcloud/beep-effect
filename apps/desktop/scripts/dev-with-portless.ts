import { spawn, spawnSync } from "node:child_process";
import * as https from "node:https";

const portlessProxyPort = Number(process.env.PORTLESS_PORT ?? "1355");
const desktopHost = "desktop.localhost";

const spawnOrThrow = (command: string, args: ReadonlyArray<string>): void => {
  const result = spawnSync(command, args, {
    env: {
      ...process.env,
      PORTLESS_HTTPS: "1",
    },
    stdio: "inherit",
  });

  if (result.status === 0) {
    return;
  }

  process.exit(result.status ?? 1);
};

const proxyServesHttps = async (): Promise<boolean> =>
  await new Promise((resolve) => {
    const request = https.request(
      {
        host: "127.0.0.1",
        method: "HEAD",
        path: "/",
        port: portlessProxyPort,
        rejectUnauthorized: false,
        servername: desktopHost,
      },
      (response) => {
        response.resume();
        resolve(true);
      }
    );

    request.on("error", () => resolve(false));
    request.end();
  });

const ensurePortlessHttps = async (): Promise<void> => {
  if (await proxyServesHttps()) {
    return;
  }

  spawnSync("portless", ["proxy", "stop"], {
    env: process.env,
    stdio: "inherit",
  });
  spawnOrThrow("portless", ["proxy", "start", "--https"]);
};

await ensurePortlessHttps();

const child = spawn("portless", ["desktop", "vite"], {
  env: {
    ...process.env,
    PORTLESS_HTTPS: "1",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

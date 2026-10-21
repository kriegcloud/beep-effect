import * as NodeURL from "node:url";
import type { UserConfig } from "vite";

/** Source alias anchored to the importing application's config file. */
export const appSourceAlias = (moduleUrl: string) => ({
  "@": NodeURL.fileURLToPath(new URL("./src", moduleUrl)),
});

/** Shared React application defaults; portless supplies the port and strictPort. */
export const appViteConfig = (moduleUrl: string): UserConfig => ({
  clearScreen: false,
  resolve: { alias: appSourceAlias(moduleUrl) },
  server: { host: "127.0.0.1" },
});

import { fileURLToPath } from "node:url";
import { defineBeepNextConfig } from "@beep/repo-configs/next";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineBeepNextConfig({
  repoRoot,
  allowedDevOrigins: ["codedank-web.localhost"],
  env: process.env,
});

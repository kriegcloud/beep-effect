import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");
const scriptPath = resolve(__dirname, "../scripts/md-typecheck.ts");

describe("md-typecheck", () => {
  it("all markdown code blocks typecheck", { timeout: 120_000 }, async () => {
    const result = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
      const proc = spawn("bun", [scriptPath], {
        cwd: projectRoot,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        resolve({ code: code ?? 1, stdout, stderr });
      });
    });

    if (result.code !== 0) {
      console.log(result.stdout);
      if (result.stderr) console.error(result.stderr);
    }

    expect(result.code, `md-typecheck failed:\n${result.stdout}`).toBe(0);
  });
});

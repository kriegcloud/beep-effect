import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const rustTripleToBunTarget = new Map<string, string>([
  ["x86_64-unknown-linux-gnu", "bun-linux-x64-modern"],
  ["aarch64-unknown-linux-gnu", "bun-linux-arm64-modern"],
  ["x86_64-apple-darwin", "bun-darwin-x64-modern"],
  ["aarch64-apple-darwin", "bun-darwin-arm64-modern"],
  ["x86_64-pc-windows-msvc", "bun-windows-x64-modern"],
]);

const decode = (buffer: Uint8Array): string => new TextDecoder().decode(buffer).trim();

const rustHostTriple = (): string => {
  const hostTuple = Bun.spawnSync(["rustc", "--print", "host-tuple"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  if (hostTuple.exitCode === 0) {
    return decode(hostTuple.stdout);
  }

  const verboseVersion = Bun.spawnSync(["rustc", "-vV"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  if (verboseVersion.exitCode !== 0) {
    throw new Error(`Failed to inspect rust host triple.\n${decode(verboseVersion.stderr)}`);
  }

  const hostLine = decode(verboseVersion.stdout)
    .split("\n")
    .find((line) => line.startsWith("host: "));

  if (hostLine === undefined) {
    throw new Error("Could not find the rust host triple in `rustc -vV` output.");
  }

  return hostLine.replace("host: ", "").trim();
};

const targetTriple = process.env.TAURI_ENV_TARGET_TRIPLE ?? process.env.CARGO_BUILD_TARGET ?? rustHostTriple();
const bunTarget = rustTripleToBunTarget.get(targetTriple);

if (bunTarget === undefined) {
  throw new Error(`Unsupported rust target triple for Bun standalone sidecar build: ${targetTriple}`);
}

const repoRoot = resolve(import.meta.dir, "../../..");
const isWindows = targetTriple.includes("windows");
const binaryFileName = `repo-memory-sidecar-${targetTriple}${isWindows ? ".exe" : ""}`;
const outputPath = resolve(import.meta.dir, "../src-tauri/binaries", binaryFileName);

mkdirSync(dirname(outputPath), { recursive: true });

const result = Bun.spawnSync(
  [
    "bun",
    "build",
    "packages/runtime/server/src/main.ts",
    "--compile",
    `--target=${bunTarget}`,
    `--outfile=${outputPath}`,
  ],
  {
    cwd: repoRoot,
    stdout: "inherit",
    stderr: "inherit",
  }
);

if (result.exitCode !== 0) {
  process.exit(result.exitCode);
}

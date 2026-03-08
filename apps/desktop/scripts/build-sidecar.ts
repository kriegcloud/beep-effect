import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rustTripleToBunTarget = {
  "x86_64-unknown-linux-gnu": "bun-linux-x64-modern",
  "aarch64-unknown-linux-gnu": "bun-linux-arm64-modern",
  "x86_64-apple-darwin": "bun-darwin-x64-modern",
  "aarch64-apple-darwin": "bun-darwin-arm64-modern",
  "x86_64-pc-windows-msvc": "bun-windows-x64-modern",
} as const satisfies Record<string, string>;

type SupportedRustTargetTriple = keyof typeof rustTripleToBunTarget;

const decode = (buffer: Uint8Array | string | null | undefined): string => {
  if (buffer === undefined || buffer === null) {
    return "";
  }

  return `${buffer}`.trim();
};

const rustHostTriple = (): string => {
  const hostTuple = spawnSync("rustc", ["--print", "host-tuple"], {
    encoding: "utf8",
  });

  if (hostTuple.status === 0) {
    return decode(hostTuple.stdout);
  }

  const verboseVersion = spawnSync("rustc", ["-vV"], {
    encoding: "utf8",
  });

  if (verboseVersion.status !== 0) {
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

const isSupportedRustTargetTriple = (triple: string): triple is SupportedRustTargetTriple =>
  triple in rustTripleToBunTarget;

const resolvedTargetTriple = process.env.TAURI_ENV_TARGET_TRIPLE ?? process.env.CARGO_BUILD_TARGET ?? rustHostTriple();
if (!isSupportedRustTargetTriple(resolvedTargetTriple)) {
  throw new Error(`Unsupported rust target triple for Bun standalone sidecar build: ${resolvedTargetTriple}`);
}

const targetTriple = resolvedTargetTriple;
const bunTarget = rustTripleToBunTarget[targetTriple];

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDirectory, "../../..");
const isWindows = targetTriple.includes("windows");
const binaryFileName = `repo-memory-sidecar-${targetTriple}${isWindows ? ".exe" : ""}`;
const outputPath = resolve(currentDirectory, "../src-tauri/binaries", binaryFileName);

mkdirSync(dirname(outputPath), { recursive: true });

const result = spawnSync(
  "bun",
  ["build", "packages/runtime/server/src/main.ts", "--compile", `--target=${bunTarget}`, `--outfile=${outputPath}`],
  {
    cwd: repoRoot,
    stdio: "inherit",
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

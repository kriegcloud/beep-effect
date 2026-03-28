import { Buffer } from "node:buffer";
import { spawnSync as spawnSyncNode } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { addEqualityTesters } from "@effect/vitest";

addEqualityTesters();

type BunSpawnSyncResult = {
  readonly stdout: Uint8Array;
  readonly stderr: Uint8Array;
  readonly exitCode: number;
};

type BunShim = {
  readonly env: NodeJS.ProcessEnv;
  readonly spawnSync: (options: { readonly cmd: ReadonlyArray<string> }) => BunSpawnSyncResult;
  readonly write: (path: string, content: string | Uint8Array) => Promise<number>;
  readonly file: (path: string) => {
    readonly text: () => Promise<string>;
    readonly delete: () => Promise<void>;
  };
};

const isBunShim = (value: unknown): value is BunShim =>
  typeof value === "object" && value !== null && "spawnSync" in value && "write" in value && "file" in value;

if (!isBunShim(Reflect.get(globalThis, "Bun"))) {
  const bunShim: BunShim = {
    env: process.env,
    spawnSync: ({ cmd }) => {
      const [command, ...args] = cmd;
      if (command === undefined) {
        return {
          stdout: Buffer.from(""),
          stderr: Buffer.from("missing command"),
          exitCode: 1,
        };
      }
      const result = spawnSyncNode(command, args, { stdio: "pipe" });
      const stdout = result.stdout ?? Buffer.from("");
      const stderr = result.stderr ?? Buffer.from("");
      return {
        stdout: typeof stdout === "string" ? Buffer.from(stdout) : stdout,
        stderr: typeof stderr === "string" ? Buffer.from(stderr) : stderr,
        exitCode: result.status ?? 1,
      };
    },
    write: async (path, content) => {
      await writeFile(path, content);
      return typeof content === "string" ? content.length : content.byteLength;
    },
    file: (path) => ({
      text: () => readFile(path, "utf8"),
      delete: () => rm(path, { force: true }),
    }),
  };
  Reflect.set(globalThis, "Bun", bunShim);
}

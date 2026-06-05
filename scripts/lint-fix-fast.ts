const TURBO_SCOPE_PREFIXES = ["--affected", "--filter", "--since"] as const;
const FULL_RUN_ARGS = ["--full", "--repo"] as const;
const CHANGED_PATH_DIFF_FILTER = ["A", "C", "M", "R", "T", "U", "X", "B"].join("");

const unique = (values: ReadonlyArray<string>): ReadonlyArray<string> => Array.from(new Set(values));

const nonEmptyLines = (text: string): ReadonlyArray<string> =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const spawnText = (cmd: ReadonlyArray<string>): string => {
  const [command, ...args] = cmd;
  const result = Bun.spawnSync({
    cmd: [command, ...args],
    stderr: "pipe",
    stdout: "pipe",
  });

  if (!result.success) {
    const stderr = result.stderr.toString().trim();
    console.error(stderr.length > 0 ? stderr : `${cmd.join(" ")} failed with exit code ${result.exitCode}`);
    process.exit(result.exitCode);
  }

  return result.stdout.toString();
};

const passthroughArgs = Bun.argv.slice(2);
const isFullRunArg = (arg: string): boolean => FULL_RUN_ARGS.includes(arg as (typeof FULL_RUN_ARGS)[number]);
const isTurboScopedArg = (arg: string): boolean => TURBO_SCOPE_PREFIXES.some((prefix) => arg.startsWith(prefix));

if (passthroughArgs.some(isFullRunArg) || passthroughArgs.some(isTurboScopedArg)) {
  const turboArgs = passthroughArgs.filter((arg) => !isFullRunArg(arg));
  const result = Bun.spawnSync({
    cmd: ["bunx", "turbo", "run", "lint:fix", ...turboArgs],
    stderr: "inherit",
    stdout: "inherit",
  });
  process.exit(result.exitCode);
}

const changedFiles = unique([
  ...nonEmptyLines(
    spawnText(["git", "diff", "--name-only", `--diff-filter=${CHANGED_PATH_DIFF_FILTER}`, "HEAD", "--"])
  ),
  ...nonEmptyLines(
    spawnText(["git", "diff", "--cached", "--name-only", `--diff-filter=${CHANGED_PATH_DIFF_FILTER}`, "--"])
  ),
  ...nonEmptyLines(spawnText(["git", "ls-files", "--others", "--exclude-standard"])),
]).filter((file) => Bun.file(file).exists());

if (changedFiles.length === 0) {
  console.log("[lint:fix] no changed files");
  process.exit(0);
}

const biome = Bun.which("biome") ?? "./node_modules/.bin/biome";
const result = Bun.spawnSync({
  cmd: [biome, "format", "--write", "--files-ignore-unknown=true", ...changedFiles],
  stderr: "inherit",
  stdout: "inherit",
});

process.exit(result.exitCode);

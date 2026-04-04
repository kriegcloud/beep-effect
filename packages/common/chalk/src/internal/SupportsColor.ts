import os from "node:os";
import process from "node:process";
import tty from "node:tty";
import { type ColorInfo, ColorSupport, type ColorSupportLevel } from "./ChalkSchema.ts";

type StreamLike = {
  readonly isTTY?: boolean | undefined;
};

type SupportsColorOptions = {
  readonly sniffFlags?: boolean | undefined;
};

type RuntimeProcessLike = {
  readonly argv?: ReadonlyArray<string> | undefined;
  readonly env?: Readonly<Record<string, string | undefined>> | undefined;
  readonly osRelease?: string | undefined;
  readonly platform?: string | undefined;
};

const currentRuntimeProcessLike: RuntimeProcessLike = {
  argv: process.argv,
  env: process.env,
  osRelease: os.release(),
  platform: process.platform,
};

const hasFlag = (flag: string, argv: ReadonlyArray<string>): boolean => {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(`${prefix}${flag}`);
  const terminatorPosition = argv.indexOf("--");

  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};

const detectFlagForceColor = (argv: ReadonlyArray<string>): ColorSupportLevel | undefined => {
  if (
    hasFlag("no-color", argv) ||
    hasFlag("no-colors", argv) ||
    hasFlag("color=false", argv) ||
    hasFlag("color=never", argv)
  ) {
    return 0;
  }

  if (
    hasFlag("color", argv) ||
    hasFlag("colors", argv) ||
    hasFlag("color=true", argv) ||
    hasFlag("color=always", argv)
  ) {
    return 1;
  }

  return undefined;
};

const envForceColor = (env: Readonly<Record<string, string | undefined>>): ColorSupportLevel | undefined => {
  if (env.FORCE_COLOR === undefined) {
    return undefined;
  }

  if (env.FORCE_COLOR === "true") {
    return 1;
  }

  if (env.FORCE_COLOR === "false") {
    return 0;
  }

  if (env.FORCE_COLOR.length === 0) {
    return 1;
  }

  const level = Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);

  if (level <= 0) {
    return 0;
  }

  if (level === 1) {
    return 1;
  }

  if (level === 2) {
    return 2;
  }

  return 3;
};

const translateLevel = (level: number): ColorInfo => {
  if (level === 0) {
    return false;
  }

  return new ColorSupport({
    has16m: level >= 3,
    has256: level >= 2,
    hasBasic: true,
    level: level === 1 ? 1 : level === 2 ? 2 : 3,
  });
};

const supportsColorLevel = (
  stream: StreamLike,
  options: SupportsColorOptions,
  runtimeProcessLike: RuntimeProcessLike
): number => {
  const env = runtimeProcessLike.env ?? {};
  const argv = runtimeProcessLike.argv ?? [];
  const noFlagForceColor = envForceColor(env);
  const forceColor = options.sniffFlags === false ? noFlagForceColor : (noFlagForceColor ?? detectFlagForceColor(argv));

  if (forceColor === 0) {
    return 0;
  }

  if (options.sniffFlags !== false) {
    if (hasFlag("color=16m", argv) || hasFlag("color=full", argv) || hasFlag("color=truecolor", argv)) {
      return 3;
    }

    if (hasFlag("color=256", argv)) {
      return 2;
    }
  }

  if (env.TF_BUILD !== undefined && env.AGENT_NAME !== undefined) {
    return 1;
  }

  if (stream.isTTY !== true && forceColor === undefined) {
    return 0;
  }

  const minimumLevel = forceColor ?? 0;

  if (env.TERM === "dumb") {
    return minimumLevel;
  }

  if (runtimeProcessLike.platform === "win32") {
    const [major = "0", , build = "0"] = (runtimeProcessLike.osRelease ?? "0.0.0").split(".");

    if (Number.parseInt(major, 10) >= 10 && Number.parseInt(build, 10) >= 10586) {
      return Number.parseInt(build, 10) >= 14931 ? 3 : 2;
    }

    return 1;
  }

  if (env.CI !== undefined) {
    if (env.GITHUB_ACTIONS !== undefined || env.GITEA_ACTIONS !== undefined || env.CIRCLECI !== undefined) {
      return 3;
    }

    if (
      env.TRAVIS !== undefined ||
      env.APPVEYOR !== undefined ||
      env.GITLAB_CI !== undefined ||
      env.BUILDKITE !== undefined ||
      env.DRONE !== undefined ||
      env.CI_NAME === "codeship"
    ) {
      return 1;
    }

    return minimumLevel;
  }

  if (env.TEAMCITY_VERSION !== undefined) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }

  if (
    env.COLORTERM === "truecolor" ||
    env.TERM === "xterm-kitty" ||
    env.TERM === "xterm-ghostty" ||
    env.TERM === "wezterm"
  ) {
    return 3;
  }

  if (env.TERM_PROGRAM !== undefined) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION ?? "").split(".")[0] ?? "0", 10);

    if (env.TERM_PROGRAM === "iTerm.app") {
      return version >= 3 ? 3 : 2;
    }

    if (env.TERM_PROGRAM === "Apple_Terminal") {
      return 2;
    }

    return 0;
  }

  if (/-256(color)?$/i.test(env.TERM ?? "")) {
    return 2;
  }

  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM ?? "")) {
    return 1;
  }

  if (env.COLORTERM !== undefined) {
    return 1;
  }

  return minimumLevel;
};

export const createSupportsColor = (
  stream: StreamLike = {},
  options: SupportsColorOptions = {},
  runtimeProcessLike: RuntimeProcessLike = currentRuntimeProcessLike
): ColorInfo => translateLevel(supportsColorLevel(stream, options, runtimeProcessLike));

export const detectedSupportsColor = {
  stderr: createSupportsColor({ isTTY: tty.isatty(2) }),
  stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
};

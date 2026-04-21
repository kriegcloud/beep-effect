import os from "node:os";
import process from "node:process";
import tty from "node:tty";
import { Match, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
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

type SupportsColorDecisionInput = {
  readonly argv: ReadonlyArray<string>;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly isTTY?: boolean | undefined;
  readonly osRelease?: string | undefined;
  readonly platform?: string | undefined;
  readonly sniffFlags?: boolean | undefined;
};

type ColorHeuristicInput = SupportsColorDecisionInput & {
  readonly forceColor: O.Option<ColorSupportLevel>;
  readonly minimumLevel: ColorSupportLevel;
};

type ColorLevelHeuristic = (input: ColorHeuristicInput) => O.Option<ColorSupportLevel>;

type WindowsRelease = {
  readonly build: number;
  readonly major: number;
};

type TermProgramInfo = {
  readonly majorVersion: number;
  readonly program: string;
};

const disabledColorFlags = ["no-color", "no-colors", "color=false", "color=never"] as const;

const basicColorFlags = ["color", "colors", "color=true", "color=always"] as const;

const trueColorFlags = ["color=16m", "color=full", "color=truecolor"] as const;

const ansi256ColorFlags = ["color=256"] as const;

const highColorCiEnvironmentKeys = ["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"] as const;

const basicColorCiEnvironmentKeys = ["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"] as const;

const trueColorTerminals: ReadonlyArray<string> = ["xterm-kitty", "xterm-ghostty", "wezterm"];

const level0: ColorSupportLevel = 0;

const level1: ColorSupportLevel = 1;

const level2: ColorSupportLevel = 2;

const level3: ColorSupportLevel = 3;

const flagPrefix = Match.type<string>().pipe(
  Match.when(Str.startsWith("-"), () => ""),
  Match.when(
    (flag) => Str.length(flag) === 1,
    () => "-"
  ),
  Match.orElse(() => "--")
);

const normalizeParsedForceColorLevel: (level: number) => ColorSupportLevel = Match.type<number>().pipe(
  Match.when(
    (level) => level <= 0,
    () => level0
  ),
  Match.when(1, () => level1),
  Match.when(2, () => level2),
  Match.orElse(() => level3)
);

const literalForceColorLevel: (value: string) => O.Option<ColorSupportLevel> = Match.type<string>().pipe(
  Match.when("true", () => O.some(level1)),
  Match.when("false", () => O.some(level0)),
  Match.when(Str.isEmpty, () => O.some(level1)),
  Match.orElse(O.none<ColorSupportLevel>)
);

const colorLevelWhen =
  (level: ColorSupportLevel) =>
  (condition: boolean): O.Option<ColorSupportLevel> =>
    pipe(condition, O.liftPredicate(P.isTruthy), O.as(level));

const matchesPattern =
  (pattern: RegExp) =>
  (value: string): boolean =>
    pipe(value, Str.match(pattern), O.isSome);

const isDisabledColorLevel = (level: ColorSupportLevel): level is 0 => level === 0;

const equalsArgument =
  (expected: string) =>
  (actual: string): boolean =>
    actual === expected;

const isBeforeArgumentTerminator =
  (terminatorPosition: O.Option<number>) =>
  (position: number): boolean =>
    pipe(
      terminatorPosition,
      O.match({
        onNone: () => true,
        onSome: (terminator) => position < terminator,
      })
    );

const hasAnyFlag =
  (flags: ReadonlyArray<string>) =>
  (argv: ReadonlyArray<string>): boolean =>
    A.some(flags, (flag) => hasFlag(flag, argv));

const hasAnyEnvironmentValue =
  (keys: ReadonlyArray<string>) =>
  (env: Readonly<Record<string, string | undefined>>): boolean =>
    A.some(keys, (key) => P.isNotUndefined(env[key]));

const isAzurePipelinesEnvironment = (env: Readonly<Record<string, string | undefined>>): boolean =>
  P.isNotUndefined(env.TF_BUILD) && P.isNotUndefined(env.AGENT_NAME);

const isHighColorCiEnvironment = hasAnyEnvironmentValue(highColorCiEnvironmentKeys);

const isBasicColorCiEnvironment = (env: Readonly<Record<string, string | undefined>>): boolean =>
  hasAnyEnvironmentValue(basicColorCiEnvironmentKeys)(env) || env.CI_NAME === "codeship";

const isModernTeamCityVersion = matchesPattern(/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/);

const isAnsi256Terminal = matchesPattern(/-256(color)?$/i);

const isBasicColorTerminal = matchesPattern(/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i);

const hasTrueColorTerminalName = (term: string | undefined): boolean =>
  pipe(trueColorTerminals, A.contains(term ?? ""));

const readCurrentRuntimeProcessLike = (): RuntimeProcessLike => ({
  argv: process.argv,
  env: process.env,
  osRelease: os.release(),
  platform: process.platform,
});

const currentRuntimeProcessLike: RuntimeProcessLike = readCurrentRuntimeProcessLike();

const hasFlag = (flag: string, argv: ReadonlyArray<string>): boolean => {
  const position = pipe(argv, A.findFirstIndex(equalsArgument(`${flagPrefix(flag)}${flag}`)));
  const terminatorPosition = pipe(argv, A.findFirstIndex(equalsArgument("--")));

  return pipe(position, O.exists(isBeforeArgumentTerminator(terminatorPosition)));
};

const detectFlagForceColor = (argv: ReadonlyArray<string>): O.Option<ColorSupportLevel> =>
  pipe(
    [
      colorLevelWhen(level0)(hasAnyFlag(disabledColorFlags)(argv)),
      colorLevelWhen(level1)(hasAnyFlag(basicColorFlags)(argv)),
    ],
    O.firstSomeOf
  );

const envForceColor = (env: Readonly<Record<string, string | undefined>>): O.Option<ColorSupportLevel> =>
  pipe(
    env.FORCE_COLOR,
    O.fromNullishOr,
    O.flatMap((value) =>
      pipe(
        literalForceColorLevel(value),
        O.orElse(() => O.some(normalizeParsedForceColorLevel(Math.min(Number.parseInt(value, 10), 3))))
      )
    )
  );

const translateLevel = (level: ColorSupportLevel): ColorInfo =>
  Match.type<ColorSupportLevel>().pipe(
    Match.when(level0, () => false as const),
    Match.orElse(
      (enabledLevel) =>
        new ColorSupport({
          has16m: enabledLevel >= 3,
          has256: enabledLevel >= 2,
          hasBasic: true,
          level: enabledLevel,
        })
    )
  )(level);

const resolveForceColor = (input: SupportsColorDecisionInput): O.Option<ColorSupportLevel> =>
  Match.type<boolean>().pipe(
    Match.when(true, () => envForceColor(input.env)),
    Match.orElse(() =>
      pipe(
        envForceColor(input.env),
        O.orElse(() => detectFlagForceColor(input.argv))
      )
    )
  )(input.sniffFlags === false);

const detectForcedOffColorLevel: ColorLevelHeuristic = ({ forceColor }) =>
  pipe(forceColor, O.filter(isDisabledColorLevel));

const detectSniffFlagColorLevel: ColorLevelHeuristic = ({ argv, sniffFlags }) =>
  pipe(
    sniffFlags !== false,
    O.liftPredicate(P.isTruthy),
    O.flatMap(() =>
      pipe(
        [
          colorLevelWhen(level3)(hasAnyFlag(trueColorFlags)(argv)),
          colorLevelWhen(level2)(hasAnyFlag(ansi256ColorFlags)(argv)),
        ],
        O.firstSomeOf
      )
    )
  );

const detectAzurePipelinesColorLevel: ColorLevelHeuristic = ({ env }) =>
  colorLevelWhen(level1)(isAzurePipelinesEnvironment(env));

const detectNonTtyColorLevel: ColorLevelHeuristic = ({ forceColor, isTTY }) =>
  colorLevelWhen(level0)(isTTY !== true && O.isNone(forceColor));

const detectDumbTerminalColorLevel: ColorLevelHeuristic = ({ env, minimumLevel }) =>
  colorLevelWhen(minimumLevel)(env.TERM === "dumb");

const parseWindowsRelease = (osRelease: string | undefined): WindowsRelease => {
  const [major = "0", , build = "0"] = pipe(osRelease ?? "0.0.0", Str.split("."));

  return {
    build: Number.parseInt(build, 10),
    major: Number.parseInt(major, 10),
  };
};

const selectWindowsBuildColorLevel: (build: number) => ColorSupportLevel = Match.type<number>().pipe(
  Match.when(
    (build) => build >= 14931,
    () => level3
  ),
  Match.orElse(() => level2)
);

const selectWindowsReleaseColorLevel: (release: WindowsRelease) => ColorSupportLevel =
  Match.type<WindowsRelease>().pipe(
    Match.when(
      ({ build, major }) => major >= 10 && build >= 10586,
      ({ build }) => selectWindowsBuildColorLevel(build)
    ),
    Match.orElse(() => level1)
  );

const detectWindowsColorLevel: ColorLevelHeuristic = ({ osRelease, platform }) =>
  pipe(
    platform === "win32",
    O.liftPredicate(P.isTruthy),
    O.map(() => selectWindowsReleaseColorLevel(parseWindowsRelease(osRelease)))
  );

const selectCiColorLevel = (minimumLevel: ColorSupportLevel) =>
  Match.type<Readonly<Record<string, string | undefined>>>().pipe(
    Match.when(isHighColorCiEnvironment, () => level3),
    Match.when(isBasicColorCiEnvironment, () => level1),
    Match.orElse(() => minimumLevel)
  );

const detectCiColorLevel: ColorLevelHeuristic = ({ env, minimumLevel }) =>
  pipe(
    env.CI,
    O.fromNullishOr,
    O.map(() => selectCiColorLevel(minimumLevel)(env))
  );

const selectTeamCityColorLevel: (version: string) => ColorSupportLevel = Match.type<string>().pipe(
  Match.when(isModernTeamCityVersion, () => level1),
  Match.orElse(() => level0)
);

const detectTeamCityColorLevel: ColorLevelHeuristic = ({ env }) =>
  pipe(env.TEAMCITY_VERSION, O.fromNullishOr, O.map(selectTeamCityColorLevel));

const isTrueColorTerminal = (env: Readonly<Record<string, string | undefined>>): boolean =>
  env.COLORTERM === "truecolor" || hasTrueColorTerminalName(env.TERM);

const detectTrueColorTerminalLevel: ColorLevelHeuristic = ({ env }) => colorLevelWhen(level3)(isTrueColorTerminal(env));

const firstVersionSegment = (version: string | undefined): string =>
  pipe(
    version ?? "",
    Str.split("."),
    A.head,
    O.getOrElse(() => "0")
  );

const toTermProgramInfo = (program: string, env: Readonly<Record<string, string | undefined>>): TermProgramInfo => ({
  majorVersion: Number.parseInt(firstVersionSegment(env.TERM_PROGRAM_VERSION), 10),
  program,
});

const selectITermColorLevel: (version: number) => ColorSupportLevel = Match.type<number>().pipe(
  Match.when(
    (version) => version >= 3,
    () => level3
  ),
  Match.orElse(() => level2)
);

const selectTermProgramColorLevel: (info: TermProgramInfo) => ColorSupportLevel = Match.type<TermProgramInfo>().pipe(
  Match.when(
    ({ program }) => program === "iTerm.app",
    ({ majorVersion }) => selectITermColorLevel(majorVersion)
  ),
  Match.when(
    ({ program }) => program === "Apple_Terminal",
    () => level2
  ),
  Match.orElse(() => level0)
);

const detectTermProgramColorLevel: ColorLevelHeuristic = ({ env }) =>
  pipe(
    env.TERM_PROGRAM,
    O.fromNullishOr,
    O.map((program) => selectTermProgramColorLevel(toTermProgramInfo(program, env)))
  );

const detectTerminalPatternColorLevel: ColorLevelHeuristic = ({ env }) => {
  const term = env.TERM ?? "";

  return pipe(
    [
      pipe(term, O.liftPredicate(isAnsi256Terminal), O.as(level2)),
      pipe(term, O.liftPredicate(isBasicColorTerminal), O.as(level1)),
      pipe(env.COLORTERM, O.fromNullishOr, O.as(level1)),
    ],
    O.firstSomeOf
  );
};

const supportsColorLevel = ({
  argv,
  env,
  isTTY,
  osRelease,
  platform,
  sniffFlags,
}: SupportsColorDecisionInput): ColorSupportLevel => {
  const forceColor = resolveForceColor({ argv, env, isTTY, osRelease, platform, sniffFlags });
  const heuristicInput: ColorHeuristicInput = {
    argv,
    env,
    forceColor,
    isTTY,
    minimumLevel: pipe(
      forceColor,
      O.getOrElse(() => level0)
    ),
    osRelease,
    platform,
    sniffFlags,
  };

  return pipe(
    [
      detectForcedOffColorLevel(heuristicInput),
      detectSniffFlagColorLevel(heuristicInput),
      detectAzurePipelinesColorLevel(heuristicInput),
      detectNonTtyColorLevel(heuristicInput),
      detectDumbTerminalColorLevel(heuristicInput),
      detectWindowsColorLevel(heuristicInput),
      detectCiColorLevel(heuristicInput),
      detectTeamCityColorLevel(heuristicInput),
      detectTrueColorTerminalLevel(heuristicInput),
      detectTermProgramColorLevel(heuristicInput),
      detectTerminalPatternColorLevel(heuristicInput),
    ],
    O.firstSomeOf,
    O.getOrElse(() => heuristicInput.minimumLevel)
  );
};

export const createSupportsColor = (
  stream: StreamLike = {},
  options: SupportsColorOptions = {},
  runtimeProcessLike: RuntimeProcessLike = currentRuntimeProcessLike
): ColorInfo =>
  translateLevel(
    supportsColorLevel({
      argv: runtimeProcessLike.argv ?? [],
      env: runtimeProcessLike.env ?? {},
      isTTY: stream.isTTY,
      osRelease: runtimeProcessLike.osRelease,
      platform: runtimeProcessLike.platform,
      sniffFlags: options.sniffFlags,
    })
  );

export const detectedSupportsColor = {
  stderr: createSupportsColor({ isTTY: tty.isatty(2) }),
  stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
};

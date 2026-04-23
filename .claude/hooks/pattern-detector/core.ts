import { $ClaudeId } from "@beep/identity/packages";
import { Config, Effect, FileSystem, flow, Path, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import picomatch from "picomatch";
import { type PatternDefinition, PatternFrontmatter } from "../../patterns/schema.ts";

const $I = $ClaudeId.create("hooks/pattern-detector/core");

export class HookInput extends S.Class<HookInput>($I`HookInput`)(
  {
    hook_event_name: S.Literals(["PreToolUse", "PostToolUse"]),
    tool_name: S.String,
    tool_input: S.Record(S.String, S.Unknown),
  },
  $I.annote("HookInput", {
    description: "Pattern detector input payload for pre/post tool hook events.",
  })
) {}

const contentFields = ["command", "new_string", "content", "pattern", "query", "url", "prompt"] as const;
const readCurrentWorkingDirectory = Effect.sync(() => process.cwd());

export const getMatchableContent = (input: Record<string, unknown>): string => {
  const getField = (field: keyof typeof input) => input[field];
  const stringifyInput = () => S.encodeSync(S.fromJsonString(S.Record(S.String, S.Unknown)))(input);
  return pipe(
    contentFields,
    A.findFirst(flow(getField, P.isString)),
    O.flatMap(flow(getField, O.fromNullishOr)),
    O.filter(P.isString),
    O.getOrElse(stringifyInput)
  );
};

export const getFilePath = (input: Record<string, unknown>): O.Option<string> =>
  pipe(O.fromNullishOr(input.file_path), O.filter(P.isString));

const parseYaml = (content: string): Record<string, unknown> => {
  const matched = O.getOrNull(Str.match(/^---\n([\s\S]*?)\n---/)(content));
  if (matched === null || !Str.isNonEmpty(matched[1])) return {};
  return pipe(
    Str.split("\n")(matched[1]),
    A.map((line: string) => {
      const m = O.getOrNull(Str.match(/^(\w+):\s*["']?(.+?)["']?$/)(line));
      return m !== null && Str.isNonEmpty(m[1]) && Str.isNonEmpty(m[2]) ? O.some([m[1], m[2]] as const) : O.none();
    }),
    A.getSomes,
    R.fromEntries
  );
};

const extractBody = (content: string): string => Str.trim(Str.replace(/^---\n[\s\S]*?\n---\n?/, "")(content));

export const testRegex: {
  (text: string, pattern: string): boolean;
  (pattern: string): (text: string) => boolean;
} = dual(2, (text: string, pattern: string): boolean => {
  try {
    return new globalThis.RegExp(pattern).test(text);
  } catch {
    return false;
  }
});

export const testGlob: {
  (filePath: string, glob: string): boolean;
  (glob: string): (filePath: string) => boolean;
} = dual(2, (filePath: string, glob: string): boolean => {
  try {
    return picomatch(glob)(filePath);
  } catch {
    return false;
  }
});

const readPattern = Effect.fn("readPattern")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(filePath);
  const fm = yield* S.decodeUnknownEffect(PatternFrontmatter)(parseYaml(content)).pipe(Effect.option);
  return O.map(
    fm,
    (f): PatternDefinition => ({
      name: f.name,
      description: f.description,
      event: f.event,
      tool: f.tool,
      pattern: f.pattern,
      action: f.action,
      level: f.level,
      body: extractBody(content),
      filePath,
      ...(f.glob === undefined ? {} : { glob: f.glob }),
      ...(f.tag === undefined ? {} : { tag: f.tag }),
    })
  );
});

export const loadPatterns = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // For tests running from .claude, detect and use parent as project root
  const configDir = yield* Config.string("CLAUDE_PROJECT_DIR").pipe(Config.withDefault("."));
  const cwd = yield* readCurrentWorkingDirectory;
  const projectDir = Str.endsWith(".claude")(cwd) ? path.join(cwd, "..") : configDir;
  const root = path.join(projectDir, ".claude", "patterns");

  if (!(yield* fs.exists(root))) return A.empty<PatternDefinition>();

  const walk = (dir: string): Effect.Effect<PatternDefinition[], never, FileSystem.FileSystem> =>
    Effect.gen(function* () {
      const entries: Array<string> = yield* fs.readDirectory(dir).pipe(Effect.orElseSucceed(A.empty<string>));

      const processEntry = (entry: string): Effect.Effect<PatternDefinition[], never, FileSystem.FileSystem> =>
        Effect.gen(function* () {
          const full = path.join(dir, entry);
          const stat = yield* fs.stat(full).pipe(Effect.option);
          if (O.isNone(stat)) return A.empty<PatternDefinition>();

          if (stat.value.type === "Directory") return yield* Effect.suspend(() => walk(full));

          if (Str.endsWith(".md")(entry)) {
            return yield* readPattern(full).pipe(
              Effect.option,
              Effect.map(O.flatten),
              Effect.map(
                O.match({
                  onNone: A.empty<PatternDefinition>,
                  onSome: A.of,
                })
              )
            );
          }

          return A.empty<PatternDefinition>();
        });

      return yield* pipe(entries, A.map(processEntry), Effect.all, Effect.map(A.flatten));
    });

  return yield* walk(root);
});

export const matches: {
  (input: HookInput, p: PatternDefinition): boolean;
  (p: PatternDefinition): (input: HookInput) => boolean;
} = dual(2, (input: HookInput, p: PatternDefinition): boolean => {
  const filePath = getFilePath(input.tool_input);
  const content = getMatchableContent(input.tool_input);
  const glob = p.glob;
  const globMatches =
    glob === undefined || glob === ""
      ? true
      : pipe(
          filePath,
          O.match({
            onNone: () => true,
            onSome: (value) => testGlob(value, glob),
          })
        );

  return (
    p.event === input.hook_event_name &&
    testRegex(input.tool_name, p.tool) &&
    globMatches &&
    testRegex(content, p.pattern)
  );
});

export const findMatches: {
  (input: HookInput, patterns: PatternDefinition[]): PatternDefinition[];
  (patterns: PatternDefinition[]): (input: HookInput) => PatternDefinition[];
} = dual(2, (input: HookInput, patterns: PatternDefinition[]): PatternDefinition[] =>
  pipe(
    patterns,
    A.filter((p) => matches(input, p))
  )
);

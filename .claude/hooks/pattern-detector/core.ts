import { Config, Effect, FileSystem, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import picomatch from "picomatch";
import { type PatternDefinition, PatternFrontmatter } from "../../patterns/schema.ts";

export const HookInput = S.Struct({
  hook_event_name: S.Literals(["PreToolUse", "PostToolUse"]),
  tool_name: S.String,
  tool_input: S.Record(S.String, S.Unknown),
});

export type HookInput = S.Schema.Type<typeof HookInput>;

const contentFields = ["command", "new_string", "content", "pattern", "query", "url", "prompt"] as const;

export const getMatchableContent = (input: Record<string, unknown>): string =>
  pipe(
    contentFields,
    A.findFirst((field) => P.isString(input[field])),
    O.flatMap((field) => O.fromNullishOr(input[field])),
    O.filter(P.isString),
    O.getOrElse(() => JSON.stringify(input))
  );

export const getFilePath = (input: Record<string, unknown>): O.Option<string> =>
  pipe(O.fromNullishOr(input.file_path), O.filter(P.isString));

const parseYaml = (content: string): Record<string, unknown> => {
  const matched = O.getOrNull(O.fromNullishOr(Str.match(/^---\n([\s\S]*?)\n---/)(content)));
  if (!matched || !matched[1]) return {};
  return pipe(
    Str.split("\n")(matched[1]),
    A.map((line: string) => {
      const m = O.getOrNull(O.fromNullishOr(Str.match(/^(\w+):\s*["']?(.+?)["']?$/)(line)));
      return m?.[1] && m[2] ? O.some([m[1], m[2]] as const) : O.none();
    }),
    A.getSomes,
    (pairs) => Object.fromEntries(pairs)
  );
};

const extractBody = (content: string): string => Str.trim(Str.replace(/^---\n[\s\S]*?\n---\n?/, "")(content));

export const testRegex = (text: string, pattern: string): boolean => {
  try {
    return new globalThis.RegExp(pattern).test(text);
  } catch {
    return false;
  }
};

export const testGlob = (filePath: string, glob: string): boolean => {
  try {
    return picomatch(glob)(filePath);
  } catch {
    return false;
  }
};

const readPattern = (filePath: string) =>
  Effect.gen(function* () {
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
        glob: f.glob,
        pattern: f.pattern,
        action: f.action,
        level: f.level,
        tag: f.tag,
        body: extractBody(content),
        filePath,
      })
    );
  });

export const loadPatterns = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // For tests running from .claude, detect and use parent as project root
  const configDir = yield* Config.string("CLAUDE_PROJECT_DIR").pipe(Config.withDefault(() => "."));
  const cwd = process.cwd();
  const projectDir = cwd.endsWith(".claude") ? path.join(cwd, "..") : configDir;
  const root = path.join(projectDir, ".claude", "patterns");

  if (!(yield* fs.exists(root))) return A.empty<PatternDefinition>();

  const walk = (dir: string): Effect.Effect<PatternDefinition[], never, FileSystem.FileSystem> =>
    Effect.gen(function* () {
      const entries: Array<string> = yield* fs.readDirectory(dir).pipe(Effect.orElseSucceed(() => A.empty<string>()));

      const processEntry = (entry: string): Effect.Effect<PatternDefinition[], never, FileSystem.FileSystem> =>
        Effect.gen(function* () {
          const full = path.join(dir, entry);
          const stat = yield* fs.stat(full).pipe(Effect.option);
          if (O.isNone(stat)) return A.empty<PatternDefinition>();

          if (stat.value.type === "Directory") return yield* Effect.suspend(() => walk(full));

          if (entry.endsWith(".md")) {
            return yield* readPattern(full).pipe(
              Effect.option,
              Effect.map(O.flatten),
              Effect.map(
                O.match({
                  onNone: () => A.empty<PatternDefinition>(),
                  onSome: (pattern) => [pattern],
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

export const matches = (input: HookInput, p: PatternDefinition): boolean => {
  const filePath = pipe(getFilePath(input.tool_input), O.getOrUndefined);
  const content = getMatchableContent(input.tool_input);

  return (
    p.event === input.hook_event_name &&
    testRegex(input.tool_name, p.tool) &&
    (!p.glob || !filePath || testGlob(filePath, p.glob)) &&
    testRegex(content, p.pattern)
  );
};

export const findMatches = (input: HookInput, patterns: PatternDefinition[]): PatternDefinition[] =>
  pipe(
    patterns,
    A.filter((p) => matches(input, p))
  );

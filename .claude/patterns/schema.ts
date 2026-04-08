import { Effect } from "effect";
import * as Order from "effect/Order";
import * as S from "effect/Schema";

export const PatternEvent = S.Literals(["PreToolUse", "PostToolUse"]);
export type PatternEvent = S.Schema.Type<typeof PatternEvent>;

export const PatternAction = S.Literals(["context", "ask", "deny"]);
export type PatternAction = S.Schema.Type<typeof PatternAction>;

export const PatternLevel = S.Literals(["critical", "high", "medium", "warning", "info"]);
export type PatternLevel = S.Schema.Type<typeof PatternLevel>;

export const PatternLevelOrder: Order.Order<PatternLevel> = Order.mapInput(
  Order.Number,
  (level: PatternLevel): number => {
    switch (level) {
      case "critical":
        return 0;
      case "high":
        return 1;
      case "medium":
        return 2;
      case "warning":
        return 3;
      case "info":
        return 4;
    }
  }
);

export const PatternFrontmatter = S.Struct({
  name: S.String,
  description: S.String,
  event: PatternEvent.pipe(S.withDecodingDefault(Effect.succeed("PostToolUse" as const))),
  tool: S.String.pipe(S.withDecodingDefault(Effect.succeed(".*"))),
  glob: S.optional(S.String),
  pattern: S.String,
  action: PatternAction.pipe(S.withDecodingDefault(Effect.succeed("context" as const))),
  level: PatternLevel.pipe(S.withDecodingDefault(Effect.succeed("info" as const))),
  tag: S.optional(S.String),
});

export type PatternFrontmatter = S.Schema.Type<typeof PatternFrontmatter>;

export const PatternDefinition = S.Struct({
  name: S.String,
  description: S.String,
  event: PatternEvent,
  tool: S.String,
  glob: S.optional(S.String),
  pattern: S.String,
  action: PatternAction,
  level: PatternLevel,
  tag: S.optional(S.String),
  body: S.String,
  filePath: S.String,
});

export type PatternDefinition = S.Schema.Type<typeof PatternDefinition>;

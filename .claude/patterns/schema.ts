import * as Order from "effect/Order";
import * as Schema from "effect/Schema";

export const PatternEvent = Schema.Literals(["PreToolUse", "PostToolUse"]);
export type PatternEvent = Schema.Schema.Type<typeof PatternEvent>;

export const PatternAction = Schema.Literals(["context", "ask", "deny"]);
export type PatternAction = Schema.Schema.Type<typeof PatternAction>;

export const PatternLevel = Schema.Literals(["critical", "high", "medium", "warning", "info"]);
export type PatternLevel = Schema.Schema.Type<typeof PatternLevel>;

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

export const PatternFrontmatter = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  event: PatternEvent.pipe(Schema.withDecodingDefault(() => "PostToolUse" as const)),
  tool: Schema.String.pipe(Schema.withDecodingDefault(() => ".*")),
  glob: Schema.optional(Schema.String),
  pattern: Schema.String,
  action: PatternAction.pipe(Schema.withDecodingDefault(() => "context" as const)),
  level: PatternLevel.pipe(Schema.withDecodingDefault(() => "info" as const)),
  tag: Schema.optional(Schema.String),
});

export type PatternFrontmatter = Schema.Schema.Type<typeof PatternFrontmatter>;

export const PatternDefinition = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  event: PatternEvent,
  tool: Schema.String,
  glob: Schema.optional(Schema.String),
  pattern: Schema.String,
  action: PatternAction,
  level: PatternLevel,
  tag: Schema.optional(Schema.String),
  body: Schema.String,
  filePath: Schema.String,
});

export type PatternDefinition = Schema.Schema.Type<typeof PatternDefinition>;

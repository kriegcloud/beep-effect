import * as Schema from "effect/Schema"
import * as Order from "effect/Order"

export const PatternEvent = Schema.Literal("PreToolUse", "PostToolUse")
export type PatternEvent = Schema.Schema.Type<typeof PatternEvent>

export const PatternAction = Schema.Literal("context", "ask", "deny")
export type PatternAction = Schema.Schema.Type<typeof PatternAction>

export const PatternLevel = Schema.Literal("critical", "high", "medium", "warning", "info")
export type PatternLevel = Schema.Schema.Type<typeof PatternLevel>

export const PatternLevelOrder: Order.Order<PatternLevel> = Order.mapInput(
  Order.number,
  (level: PatternLevel): number => {
    switch (level) {
      case "critical": return 0
      case "high": return 1
      case "medium": return 2
      case "warning": return 3
      case "info": return 4
    }
  }
)

export const PatternFrontmatter = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  event: Schema.optionalWith(PatternEvent, { default: () => "PostToolUse" as const }),
  tool: Schema.optionalWith(Schema.String, { default: () => ".*" }),
  glob: Schema.optional(Schema.String),
  pattern: Schema.String,
  action: Schema.optionalWith(PatternAction, { default: () => "context" as const }),
  level: Schema.optionalWith(PatternLevel, { default: () => "info" as const }),
  tag: Schema.optional(Schema.String),
}).pipe(Schema.Data)

export type PatternFrontmatter = Schema.Schema.Type<typeof PatternFrontmatter>

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
}).pipe(Schema.Data)

export type PatternDefinition = Schema.Schema.Type<typeof PatternDefinition>


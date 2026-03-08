export const TEST_PROMPT_ENTRIES = {
  "core.turn.system.default": { file: "core/system-default.md" },
  "core.turn.replay.continuation": { file: "core/replay-continuation.md" },
  "memory.trigger.envelope": { file: "memory/trigger-envelope.md" },
  "memory.tier.working": { file: "memory/tier-working.md" },
  "memory.tier.episodic": { file: "memory/tier-episodic.md" },
  "memory.tier.semantic": { file: "memory/tier-semantic.md" },
  "memory.tier.procedural": { file: "memory/tier-procedural.md" },
  "compaction.block.summary": { file: "compaction/block-summary.md" },
  "compaction.block.artifacts": { file: "compaction/block-artifacts.md" },
  "compaction.block.tools": { file: "compaction/block-tools.md" },
  "compaction.block.kept": { file: "compaction/block-kept-context.md" },
  "memory.routine.reflect": { file: "memory/routines/reflect.md" }
} as const

export const withTestPromptsConfig = <T extends Record<string, unknown>>(
  config: T
): T & {
  prompts: {
    rootDir: "prompts"
    entries: typeof TEST_PROMPT_ENTRIES
  }
} => ({
  ...config,
  prompts: {
    rootDir: "prompts",
    entries: TEST_PROMPT_ENTRIES
  }
})

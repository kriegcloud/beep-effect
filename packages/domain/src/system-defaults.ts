import type { SubroutineToolScope } from "./memory.js"
import type { MemoryScope, MemorySource, MemoryTier, SensitivityLevel } from "./status.js"

/** Hard ceiling on maxToolIterations regardless of agent config. */
export const MAX_TOOL_ITERATIONS_CAP = 200

/** Timeout for the tool loop per turn (seconds). */
export const TURN_LOOP_TIMEOUT_SECONDS = 120

/** Default pagination limit for governance/invocation HTTP queries. */
export const DEFAULT_PAGINATION_LIMIT = 100

/** Maximum pagination limit for governance/invocation HTTP queries. */
export const MAX_PAGINATION_LIMIT = 500

/** Scheduler tick interval (seconds). */
export const SCHEDULER_TICK_SECONDS = 10
export const DEFAULT_SCHEDULER_LEASE_DURATION_SECONDS = 120
export const DEFAULT_SCHEDULER_LEASE_RENEW_INTERVAL_SECONDS = 30
export const DEFAULT_SCHEDULER_MAX_DUE_WINDOWS = 128
export const DEFAULT_SCHEDULER_MAX_CLAIMS_PER_TICK = 200

/** Server storage defaults. */
export const DEFAULT_STORAGE_ROOT_DIR = "state"
export const DEFAULT_PROMPT_ROOT_DIR = "prompts"
export const DEFAULT_INLINE_TOOL_RESULT_MAX_BYTES = 262_144
export const DEFAULT_ARTIFACT_PREVIEW_MAX_BYTES = 4_096
export const DEFAULT_ARTIFACT_COMPRESSION = "gzip" as const
export const DEFAULT_COMPACTION_COOLDOWN_SECONDS = 300
export const DEFAULT_COMPACTION_TOKEN_PRESSURE_RATIO = 0.82
export const DEFAULT_COMPACTION_TOOL_RESULT_BYTES = 262_144
export const DEFAULT_COMPACTION_ARTIFACT_BYTES = 1_048_576
export const DEFAULT_COMPACTION_FILE_TOUCHES = 40
export const DEFAULT_COMPACTION_PRUNING_KEEP_RECENT_TURNS = 16
export const DEFAULT_COMPACTION_PRUNING_INCLUDE_ARTIFACT_REFS = true
export const DEFAULT_COMPACTION_PRUNING_INCLUDE_TOOL_REFS = true
export const DEFAULT_COMPACTION_PRUNING_MAX_REFERENCE_ITEMS = 50
export const DEFAULT_COMPACTION_PRUNING_SUMMARY_ENABLED = true
export const DEFAULT_COMPACTION_PRUNING_SUMMARY_MAX_CHARS = 3_000

/** Default token capacity for new agent state. */
export const DEFAULT_TOKEN_CAPACITY = 200_000

/** Default max tool iterations per turn. */
export const DEFAULT_MAX_TOOL_ITERATIONS = 200

/** Memory entity defaults by operation. */
export const DEFAULT_MEMORY_SEARCH_LIMIT = 20
export const DEFAULT_MEMORY_RETRIEVE_LIMIT = 10
export const DEFAULT_MEMORY_LIST_LIMIT = 20
export const DEFAULT_MEMORY_FORGET_LIMIT = 50
export const MAX_MEMORY_RETRIEVE_LIMIT = 50

/** Subroutine defaults. */
export const DEFAULT_SUBROUTINE_QUEUE_CAPACITY = 64
export const DEFAULT_SUBROUTINE_MAX_ITERATIONS = 5
export const DEFAULT_SUBROUTINE_TOOL_CONCURRENCY = "inherit" as const
export const DEFAULT_TRACE_RETENTION_DAYS = 30
export const DEFAULT_SESSION_IDLE_TIMEOUT_SECONDS = 1800
export const DEFAULT_CONTEXT_PRESSURE_RESERVE_TOKENS = 4000
export const DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS = 30
export const DEFAULT_TRANSCRIPT_DIRECTORY = "transcripts"
export const DEFAULT_TRACE_DIRECTORY = "traces/memory"
export const DEFAULT_IDLE_CHECK_INTERVAL_SECONDS = 60

/** Memory domain defaults. */
export const DEFAULT_SUBROUTINE_TOOL_SCOPE: SubroutineToolScope = {
  fileRead: true,
  fileWrite: false,
  shell: false,
  memoryRead: true,
  memoryWrite: true,
  notification: false
}

export const DEFAULT_SENSITIVITY_LEVEL: SensitivityLevel = "Internal"
export const DEFAULT_MEMORY_TIER: MemoryTier = "SemanticMemory"
export const DEFAULT_MEMORY_SCOPE: MemoryScope = "GlobalScope"
export const DEFAULT_MEMORY_SOURCE: MemorySource = "AgentSource"

/** Post-commit workflow execution. */
export const POST_COMMIT_MAX_ATTEMPTS = 5

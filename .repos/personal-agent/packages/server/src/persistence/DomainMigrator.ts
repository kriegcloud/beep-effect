import * as SqliteMigrator from "@effect/sql-sqlite-bun/SqliteMigrator"
import { Effect } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"

const loader = SqliteMigrator.fromRecord({
  "0001_domain_tables": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS schedules (
        schedule_id TEXT PRIMARY KEY,
        owner_agent_id TEXT NOT NULL,
        recurrence_label TEXT NOT NULL,
        cron_expression TEXT,
        interval_seconds INTEGER,
        trigger_tag TEXT NOT NULL,
        action_kind TEXT NOT NULL,
        action_payload_json TEXT NOT NULL,
        schedule_status TEXT NOT NULL,
        concurrency_policy TEXT NOT NULL,
        allows_catch_up INTEGER NOT NULL,
        auto_disable_after_run INTEGER NOT NULL,
        catch_up_window_seconds INTEGER NOT NULL,
        max_catch_up_runs_per_tick INTEGER NOT NULL,
        last_execution_at TEXT,
        next_execution_at TEXT
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS schedules_next_execution_idx
      ON schedules (schedule_status, next_execution_at)
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS scheduled_executions (
        execution_id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL,
        due_at TEXT NOT NULL,
        trigger_source TEXT NOT NULL,
        outcome TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        skip_reason TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS scheduled_executions_schedule_id_idx
      ON scheduled_executions (schedule_id, created_at)
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS audit_entries (
        audit_entry_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        session_id TEXT,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `.unprepared
  }),
  "0002_core_phase1_tables": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS agents (
        agent_id TEXT PRIMARY KEY,
        permission_mode TEXT NOT NULL,
        token_budget INTEGER NOT NULL,
        quota_period TEXT NOT NULL,
        tokens_consumed INTEGER NOT NULL DEFAULT 0,
        budget_reset_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        token_capacity INTEGER NOT NULL,
        tokens_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS sessions_conversation_id_idx
      ON sessions (conversation_id)
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS turns (
        turn_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        conversation_id TEXT NOT NULL,
        turn_index INTEGER NOT NULL,
        participant_role TEXT NOT NULL,
        participant_agent_id TEXT,
        message_id TEXT NOT NULL,
        message_content TEXT NOT NULL,
        content_blocks_json TEXT NOT NULL,
        model_finish_reason TEXT,
        model_usage_json TEXT,
        created_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS turns_session_created_at_idx
      ON turns (session_id, created_at)
    `.unprepared

    yield* sql`
      CREATE UNIQUE INDEX IF NOT EXISTS turns_session_turn_index_idx
      ON turns (session_id, turn_index)
    `.unprepared
  }),
  "0003_channel_tables": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS channels (
        channel_id TEXT PRIMARY KEY,
        channel_type TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        active_session_id TEXT NOT NULL,
        active_conversation_id TEXT NOT NULL,
        capabilities_json TEXT NOT NULL DEFAULT '["SendText"]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared
  }),
  "0004_memory_tables": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS memory_items (
        memory_item_id       TEXT PRIMARY KEY,
        agent_id             TEXT NOT NULL,
        tier                 TEXT NOT NULL CHECK (tier IN ('WorkingMemory', 'EpisodicMemory', 'SemanticMemory', 'ProceduralMemory')),
        scope                TEXT NOT NULL CHECK (scope IN ('SessionScope', 'GlobalScope')),
        source               TEXT NOT NULL CHECK (source IN ('UserSource', 'SystemSource', 'AgentSource')),
        content              TEXT NOT NULL,
        metadata_json        TEXT,
        generated_by_turn_id TEXT,
        session_id           TEXT,
        sensitivity          TEXT NOT NULL DEFAULT 'Internal'
                             CHECK (sensitivity IN ('Public', 'Internal', 'Confidential', 'Restricted')),
        was_generated_by     TEXT,
        was_attributed_to    TEXT,
        governed_by_retention TEXT,
        last_access_time     TEXT,
        created_at           TEXT NOT NULL,
        updated_at           TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_memory_items_agent_tier
      ON memory_items(agent_id, tier)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_memory_items_agent_scope
      ON memory_items(agent_id, scope)
    `.unprepared

    yield* sql`
      CREATE VIRTUAL TABLE IF NOT EXISTS memory_items_fts USING fts5(
        content,
        metadata_json,
        content=memory_items,
        content_rowid=rowid
      )
    `.unprepared

    yield* sql`
      CREATE TRIGGER IF NOT EXISTS memory_items_ai AFTER INSERT ON memory_items BEGIN
        INSERT INTO memory_items_fts(rowid, content, metadata_json)
        VALUES (new.rowid, new.content, new.metadata_json);
      END
    `.unprepared

    yield* sql`
      CREATE TRIGGER IF NOT EXISTS memory_items_ad AFTER DELETE ON memory_items BEGIN
        INSERT INTO memory_items_fts(memory_items_fts, rowid, content, metadata_json)
        VALUES ('delete', old.rowid, old.content, old.metadata_json);
      END
    `.unprepared

    yield* sql`
      CREATE TRIGGER IF NOT EXISTS memory_items_au AFTER UPDATE ON memory_items BEGIN
        INSERT INTO memory_items_fts(memory_items_fts, rowid, content, metadata_json)
        VALUES ('delete', old.rowid, old.content, old.metadata_json);
        INSERT INTO memory_items_fts(rowid, content, metadata_json)
        VALUES (new.rowid, new.content, new.metadata_json);
      END
    `.unprepared
  }),
  "0005_integration_tables": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS external_services (
        service_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        transport TEXT NOT NULL CHECK (transport IN ('stdio', 'sse', 'http')),
        identifier TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS integrations (
        integration_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Connected', 'Disconnected', 'Error', 'Initializing')),
        capabilities_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared

    yield* sql`
      CREATE UNIQUE INDEX IF NOT EXISTS integrations_agent_service_idx
      ON integrations (agent_id, service_id)
    `.unprepared
  }),
  "0006_governance_tool_invocations": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS tool_invocations (
        tool_invocation_id TEXT PRIMARY KEY,
        audit_entry_id TEXT NOT NULL UNIQUE,
        agent_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        conversation_id TEXT NOT NULL,
        turn_id TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        input_json TEXT NOT NULL,
        output_json TEXT NOT NULL,
        decision TEXT NOT NULL CHECK (decision IN ('Allow', 'Deny', 'RequireApproval')),
        compliance_status TEXT NOT NULL CHECK (compliance_status IN ('Compliant', 'NonCompliant')),
        policy_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        invoked_at TEXT NOT NULL,
        completed_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS tool_invocations_session_idx
      ON tool_invocations (session_id, invoked_at, tool_invocation_id)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS tool_invocations_agent_idx
      ON tool_invocations (agent_id, invoked_at, tool_invocation_id)
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS tool_quota_counters (
        agent_id TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        window_start TEXT NOT NULL,
        used_count INTEGER NOT NULL,
        PRIMARY KEY (agent_id, tool_name, window_start)
      )
    `.unprepared
  }),
  "0007_governance_policy_backbone": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient
    const now = new Date().toISOString()
    const defaultAuditLogId = "auditlog:governance:default:v1"

    yield* sql`
      CREATE TABLE IF NOT EXISTS tool_definitions (
        tool_definition_id TEXT PRIMARY KEY,
        tool_name TEXT NOT NULL UNIQUE,
        source_kind TEXT NOT NULL CHECK (source_kind IN ('BuiltIn', 'Integration')),
        integration_id TEXT,
        is_safe_standard INTEGER NOT NULL CHECK (is_safe_standard IN (0, 1)),
        created_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS permission_policies (
        policy_id TEXT PRIMARY KEY,
        action TEXT NOT NULL CHECK (action IN ('InvokeTool')),
        permission_mode TEXT CHECK (permission_mode IN ('Permissive', 'Standard', 'Restrictive')),
        selector TEXT NOT NULL CHECK (selector IN ('AllTools', 'SafeStandardTools', 'ExplicitToolList', 'UnknownTool', 'MissingAgent', 'InvalidRequest', 'GovernanceError')),
        decision TEXT NOT NULL CHECK (decision IN ('Allow', 'Deny', 'RequireApproval')),
        reason_template TEXT NOT NULL,
        precedence INTEGER NOT NULL,
        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS permission_policy_tools (
        policy_id TEXT NOT NULL,
        tool_definition_id TEXT NOT NULL,
        PRIMARY KEY (policy_id, tool_definition_id)
      )
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        audit_log_id TEXT PRIMARY KEY,
        log_name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      ALTER TABLE tool_invocations
      ADD COLUMN tool_definition_id TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      ALTER TABLE tool_invocations
      ADD COLUMN audit_log_id TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      ALTER TABLE audit_entries
      ADD COLUMN audit_log_id TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      ALTER TABLE audit_entries
      ADD COLUMN tool_invocation_id TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      CREATE INDEX IF NOT EXISTS tool_invocations_tool_definition_idx
      ON tool_invocations (tool_definition_id, invoked_at, tool_invocation_id)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS audit_entries_tool_invocation_idx
      ON audit_entries (tool_invocation_id)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS permission_policies_mode_idx
      ON permission_policies (action, permission_mode, active, precedence)
    `.unprepared

    // Legacy bootstrap seed. Runtime sync from ToolCatalog is authoritative for built-in tool definitions.
    // Do not add new built-in tools via migrations; update ToolCatalog and sync tests instead.
    yield* sql`
      INSERT OR IGNORE INTO tool_definitions (
        tool_definition_id,
        tool_name,
        source_kind,
        integration_id,
        is_safe_standard,
        created_at
      ) VALUES
        ('tooldef:time_now:v1', 'time_now', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:math_calculate:v1', 'math_calculate', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:echo_text:v1', 'echo_text', 'BuiltIn', NULL, 1, ${now})
    `.unprepared

    yield* sql`
      INSERT OR IGNORE INTO audit_logs (
        audit_log_id,
        log_name,
        created_at
      ) VALUES (
        ${defaultAuditLogId},
        ${"Governance Default Audit Log"},
        ${now}
      )
    `.unprepared

    yield* sql`
      INSERT OR IGNORE INTO permission_policies (
        policy_id,
        action,
        permission_mode,
        selector,
        decision,
        reason_template,
        precedence,
        active,
        created_at,
        updated_at
      ) VALUES
        ('policy:invoke_tool:permissive:v1', 'InvokeTool', 'Permissive', 'AllTools', 'Allow', 'invoke_tool_permissive_allow', 10, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:allow_safe:v1', 'InvokeTool', 'Standard', 'SafeStandardTools', 'Allow', 'invoke_tool_standard_allow_safe', 10, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:deny_other:v1', 'InvokeTool', 'Standard', 'AllTools', 'Deny', 'invoke_tool_standard_deny_non_safe', 20, 1, ${now}, ${now}),
        ('policy:invoke_tool:restrictive:v1', 'InvokeTool', 'Restrictive', 'AllTools', 'RequireApproval', 'invoke_tool_restrictive_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:invoke_tool:missing_agent:v1', 'InvokeTool', NULL, 'MissingAgent', 'Deny', 'missing_agent_state', 10, 1, ${now}, ${now}),
        ('policy:invoke_tool:invalid_request:v1', 'InvokeTool', NULL, 'InvalidRequest', 'Deny', 'invalid_tool_name', 11, 1, ${now}, ${now}),
        ('policy:invoke_tool:unknown_tool:v1', 'InvokeTool', NULL, 'UnknownTool', 'Deny', 'unknown_tool_definition', 12, 1, ${now}, ${now}),
        ('policy:invoke_tool:system_error:v1', 'InvokeTool', NULL, 'GovernanceError', 'Deny', 'governance_system_error', 13, 1, ${now}, ${now})
    `.unprepared

    yield* sql`
      UPDATE tool_invocations
      SET tool_definition_id = (
        SELECT td.tool_definition_id
        FROM tool_definitions td
        WHERE td.tool_name = tool_invocations.tool_name
        LIMIT 1
      )
      WHERE tool_definition_id IS NULL
    `.unprepared

    yield* sql`
      INSERT OR IGNORE INTO tool_definitions (
        tool_definition_id,
        tool_name,
        source_kind,
        integration_id,
        is_safe_standard,
        created_at
      )
      SELECT
        'tooldef:unknown:' || replace(lower(ti.tool_name), ' ', '_') || ':v1',
        ti.tool_name,
        'BuiltIn',
        NULL,
        0,
        ${now}
      FROM tool_invocations ti
      LEFT JOIN tool_definitions td ON td.tool_name = ti.tool_name
      WHERE td.tool_name IS NULL
    `.unprepared

    yield* sql`
      UPDATE tool_invocations
      SET tool_definition_id = (
        SELECT td.tool_definition_id
        FROM tool_definitions td
        WHERE td.tool_name = tool_invocations.tool_name
        LIMIT 1
      )
      WHERE tool_definition_id IS NULL
    `.unprepared

    yield* sql`
      UPDATE tool_invocations
      SET audit_log_id = ${defaultAuditLogId}
      WHERE audit_log_id IS NULL
    `.unprepared

    yield* sql`
      UPDATE audit_entries
      SET audit_log_id = ${defaultAuditLogId}
      WHERE audit_log_id IS NULL
    `.unprepared

    yield* sql`
      UPDATE audit_entries
      SET tool_invocation_id = (
        SELECT ti.tool_invocation_id
        FROM tool_invocations ti
        WHERE ti.audit_entry_id = audit_entries.audit_entry_id
        LIMIT 1
      )
      WHERE tool_invocation_id IS NULL
    `.unprepared
  }),
  "0008_agent_loop_controls": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      ALTER TABLE agents
      ADD COLUMN max_tool_iterations INTEGER NOT NULL DEFAULT 10
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      UPDATE agents
      SET max_tool_iterations = 10
      WHERE max_tool_iterations IS NULL
    `.unprepared
  }),
  "0009_tool_invocation_idempotency": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      ALTER TABLE tool_invocations
      ADD COLUMN idempotency_key TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      UPDATE tool_invocations
      SET idempotency_key = 'migrated:' || tool_invocation_id
      WHERE idempotency_key IS NULL
    `.unprepared

    yield* sql`
      CREATE UNIQUE INDEX IF NOT EXISTS tool_invocations_idempotency_key_idx
      ON tool_invocations (idempotency_key)
      WHERE idempotency_key IS NOT NULL
    `.unprepared
  }),
  "0010_memory_tool_definitions": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient
    const now = new Date().toISOString()

    // Legacy bootstrap seed. Runtime sync from ToolCatalog is authoritative for built-in tool definitions.
    // Do not add new built-in tools via migrations; update ToolCatalog and sync tests instead.
    yield* sql`
      INSERT OR IGNORE INTO tool_definitions (
        tool_definition_id,
        tool_name,
        source_kind,
        integration_id,
        is_safe_standard,
        created_at
      ) VALUES
        ('tooldef:store_memory:v1', 'store_memory', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:retrieve_memories:v1', 'retrieve_memories', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:forget_memories:v1', 'forget_memories', 'BuiltIn', NULL, 1, ${now})
    `.unprepared
  }),
  "0011_channel_model_override": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      ALTER TABLE channels
      ADD COLUMN model_override_json TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      ALTER TABLE channels
      ADD COLUMN generation_config_override_json TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))
  }),
  "0012_governance_checkpoints_and_actions": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient
    const now = new Date().toISOString()

    // 3a: Create checkpoints table
    yield* sql`
      CREATE TABLE IF NOT EXISTS checkpoints (
        checkpoint_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        turn_id TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('InvokeTool', 'ReadMemory', 'WriteMemory', 'ExecuteSchedule', 'SpawnSubAgent', 'CreateGoal', 'TransitionTask')),
        policy_id TEXT,
        reason TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Deferred', 'Expired', 'Consumed')),
        requested_at TEXT NOT NULL,
        decided_at TEXT,
        decided_by TEXT,
        expires_at TEXT
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_checkpoints_status
      ON checkpoints (status)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_checkpoints_agent_status
      ON checkpoints (agent_id, status)
    `.unprepared

    // 3b: Rebuild permission_policies with expanded action CHECK (fail-fast, no catch)
    yield* sql`ALTER TABLE permission_policies RENAME TO permission_policies_backup`.unprepared

    yield* sql`
      CREATE TABLE permission_policies (
        policy_id TEXT PRIMARY KEY,
        action TEXT NOT NULL CHECK (action IN ('InvokeTool', 'ReadMemory', 'WriteMemory', 'ExecuteSchedule', 'SpawnSubAgent', 'CreateGoal', 'TransitionTask')),
        permission_mode TEXT CHECK (permission_mode IN ('Permissive', 'Standard', 'Restrictive')),
        selector TEXT NOT NULL CHECK (selector IN ('AllTools', 'SafeStandardTools', 'ExplicitToolList', 'UnknownTool', 'MissingAgent', 'InvalidRequest', 'GovernanceError')),
        decision TEXT NOT NULL CHECK (decision IN ('Allow', 'Deny', 'RequireApproval')),
        reason_template TEXT NOT NULL,
        precedence INTEGER NOT NULL,
        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      INSERT INTO permission_policies (
        policy_id, action, permission_mode, selector, decision,
        reason_template, precedence, active, created_at, updated_at
      )
      SELECT
        policy_id, action, permission_mode, selector, decision,
        reason_template, precedence, active, created_at, updated_at
      FROM permission_policies_backup
    `.unprepared

    yield* sql`DROP TABLE permission_policies_backup`.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS permission_policies_mode_idx
      ON permission_policies (action, permission_mode, active, precedence)
    `.unprepared

    // 3c: Seed new governance action policies (6 actions × 3 modes)
    yield* sql`
      INSERT OR IGNORE INTO permission_policies (
        policy_id, action, permission_mode, selector, decision,
        reason_template, precedence, active, created_at, updated_at
      ) VALUES
        ('policy:read_memory:permissive:v1', 'ReadMemory', 'Permissive', 'AllTools', 'Allow', 'read_memory_permissive_allow', 10, 1, ${now}, ${now}),
        ('policy:read_memory:standard:v1', 'ReadMemory', 'Standard', 'AllTools', 'Allow', 'read_memory_standard_allow', 10, 1, ${now}, ${now}),
        ('policy:read_memory:restrictive:v1', 'ReadMemory', 'Restrictive', 'AllTools', 'RequireApproval', 'read_memory_restrictive_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:write_memory:permissive:v1', 'WriteMemory', 'Permissive', 'AllTools', 'Allow', 'write_memory_permissive_allow', 10, 1, ${now}, ${now}),
        ('policy:write_memory:standard:v1', 'WriteMemory', 'Standard', 'AllTools', 'Allow', 'write_memory_standard_allow', 10, 1, ${now}, ${now}),
        ('policy:write_memory:restrictive:v1', 'WriteMemory', 'Restrictive', 'AllTools', 'RequireApproval', 'write_memory_restrictive_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:execute_schedule:permissive:v1', 'ExecuteSchedule', 'Permissive', 'AllTools', 'Allow', 'execute_schedule_permissive_allow', 10, 1, ${now}, ${now}),
        ('policy:execute_schedule:standard:v1', 'ExecuteSchedule', 'Standard', 'AllTools', 'Allow', 'execute_schedule_standard_allow', 10, 1, ${now}, ${now}),
        ('policy:execute_schedule:restrictive:v1', 'ExecuteSchedule', 'Restrictive', 'AllTools', 'RequireApproval', 'execute_schedule_restrictive_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:spawn_sub_agent:permissive:v1', 'SpawnSubAgent', 'Permissive', 'AllTools', 'Allow', 'spawn_sub_agent_permissive_allow', 10, 1, ${now}, ${now}),
        ('policy:spawn_sub_agent:standard:v1', 'SpawnSubAgent', 'Standard', 'AllTools', 'RequireApproval', 'spawn_sub_agent_standard_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:spawn_sub_agent:restrictive:v1', 'SpawnSubAgent', 'Restrictive', 'AllTools', 'RequireApproval', 'spawn_sub_agent_restrictive_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:create_goal:permissive:v1', 'CreateGoal', 'Permissive', 'AllTools', 'Allow', 'create_goal_permissive_allow', 10, 1, ${now}, ${now}),
        ('policy:create_goal:standard:v1', 'CreateGoal', 'Standard', 'AllTools', 'RequireApproval', 'create_goal_standard_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:create_goal:restrictive:v1', 'CreateGoal', 'Restrictive', 'AllTools', 'RequireApproval', 'create_goal_restrictive_requires_approval', 10, 1, ${now}, ${now}),
        ('policy:transition_task:permissive:v1', 'TransitionTask', 'Permissive', 'AllTools', 'Allow', 'transition_task_permissive_allow', 10, 1, ${now}, ${now}),
        ('policy:transition_task:standard:v1', 'TransitionTask', 'Standard', 'AllTools', 'Allow', 'transition_task_standard_allow', 10, 1, ${now}, ${now}),
        ('policy:transition_task:restrictive:v1', 'TransitionTask', 'Restrictive', 'AllTools', 'RequireApproval', 'transition_task_restrictive_requires_approval', 10, 1, ${now}, ${now})
    `.unprepared
  }),
  "0013_test_tool_definitions_and_policies": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient
    const now = new Date().toISOString()

    // Legacy bootstrap seed. Runtime sync from ToolCatalog is authoritative for built-in tool definitions.
    // Do not add new built-in tools via migrations; update ToolCatalog and sync tests instead.
    yield* sql`
      INSERT OR IGNORE INTO tool_definitions (
        tool_definition_id,
        tool_name,
        source_kind,
        integration_id,
        is_safe_standard,
        created_at
      ) VALUES
        ('tooldef:file_read:v1', 'file_read', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:file_ls:v1', 'file_ls', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:file_find:v1', 'file_find', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:file_grep:v1', 'file_grep', 'BuiltIn', NULL, 1, ${now}),
        ('tooldef:file_write:v1', 'file_write', 'BuiltIn', NULL, 0, ${now}),
        ('tooldef:file_edit:v1', 'file_edit', 'BuiltIn', NULL, 0, ${now}),
        ('tooldef:shell_execute:v1', 'shell_execute', 'BuiltIn', NULL, 0, ${now}),
        ('tooldef:send_notification:v1', 'send_notification', 'BuiltIn', NULL, 0, ${now})
    `.unprepared

    // Standard mode: ExplicitToolList → RequireApproval (precedence 15)
    // Sits between SafeStandardTools Allow (10) and AllTools Deny (20)
    yield* sql`
      INSERT OR IGNORE INTO permission_policies (
        policy_id,
        action,
        permission_mode,
        selector,
        decision,
        reason_template,
        precedence,
        active,
        created_at,
        updated_at
      ) VALUES
        ('policy:invoke_tool:standard:allow_file_read:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'Allow', 'file_read_standard_allow', 12, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:allow_file_ls:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'Allow', 'file_ls_standard_allow', 12, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:allow_file_find:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'Allow', 'file_find_standard_allow', 12, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:allow_file_grep:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'Allow', 'file_grep_standard_allow', 12, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:require_file_write:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'RequireApproval', 'file_write_requires_approval', 15, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:require_file_edit:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'RequireApproval', 'file_edit_requires_approval', 15, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:require_shell_execute:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'RequireApproval', 'shell_execute_requires_approval', 15, 1, ${now}, ${now}),
        ('policy:invoke_tool:standard:require_send_notification:v1', 'InvokeTool', 'Standard', 'ExplicitToolList', 'RequireApproval', 'send_notification_requires_approval', 15, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_file_read:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'file_read_permissive_allow', 5, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_file_ls:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'file_ls_permissive_allow', 5, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_file_find:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'file_find_permissive_allow', 5, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_file_grep:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'file_grep_permissive_allow', 5, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_file_write:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'file_write_permissive_allow', 5, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_file_edit:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'file_edit_permissive_allow', 5, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_shell_execute:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'shell_execute_permissive_allow', 5, 1, ${now}, ${now}),
        ('policy:invoke_tool:permissive:allow_send_notification:v1', 'InvokeTool', 'Permissive', 'ExplicitToolList', 'Allow', 'send_notification_permissive_allow', 5, 1, ${now}, ${now})
    `.unprepared

    // Link tools to their ExplicitToolList policies via junction table
    yield* sql`
      INSERT OR IGNORE INTO permission_policy_tools (policy_id, tool_definition_id) VALUES
        ('policy:invoke_tool:standard:allow_file_read:v1', 'tooldef:file_read:v1'),
        ('policy:invoke_tool:standard:allow_file_ls:v1', 'tooldef:file_ls:v1'),
        ('policy:invoke_tool:standard:allow_file_find:v1', 'tooldef:file_find:v1'),
        ('policy:invoke_tool:standard:allow_file_grep:v1', 'tooldef:file_grep:v1'),
        ('policy:invoke_tool:standard:require_file_write:v1', 'tooldef:file_write:v1'),
        ('policy:invoke_tool:standard:require_file_edit:v1', 'tooldef:file_edit:v1'),
        ('policy:invoke_tool:standard:require_shell_execute:v1', 'tooldef:shell_execute:v1'),
        ('policy:invoke_tool:standard:require_send_notification:v1', 'tooldef:send_notification:v1'),
        ('policy:invoke_tool:permissive:allow_file_read:v1', 'tooldef:file_read:v1'),
        ('policy:invoke_tool:permissive:allow_file_ls:v1', 'tooldef:file_ls:v1'),
        ('policy:invoke_tool:permissive:allow_file_find:v1', 'tooldef:file_find:v1'),
        ('policy:invoke_tool:permissive:allow_file_grep:v1', 'tooldef:file_grep:v1'),
        ('policy:invoke_tool:permissive:allow_file_write:v1', 'tooldef:file_write:v1'),
        ('policy:invoke_tool:permissive:allow_file_edit:v1', 'tooldef:file_edit:v1'),
        ('policy:invoke_tool:permissive:allow_shell_execute:v1', 'tooldef:shell_execute:v1'),
        ('policy:invoke_tool:permissive:allow_send_notification:v1', 'tooldef:send_notification:v1')
    `.unprepared
  }),
  "0014_checkpoint_consumption_metadata": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      ALTER TABLE checkpoints
      ADD COLUMN consumed_at TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))

    yield* sql`
      ALTER TABLE checkpoints
      ADD COLUMN consumed_by TEXT
    `.unprepared.pipe(Effect.catch(() => Effect.void))
  }),
  "0015_notifications_table": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id TEXT PRIMARY KEY,
        recipient TEXT NOT NULL,
        message TEXT NOT NULL,
        delivery_status TEXT NOT NULL CHECK (delivery_status IN ('Delivered', 'Failed')),
        created_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at
      ON notifications (created_at DESC)
    `.unprepared
  }),
  "0016_compaction_checkpoints": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS compaction_checkpoints (
        checkpoint_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        subroutine_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        summary TEXT NOT NULL,
        first_kept_turn_id TEXT,
        first_kept_message_id TEXT,
        tokens_before INTEGER,
        tokens_after INTEGER,
        details_json TEXT
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_compaction_checkpoints_agent_session_subroutine
      ON compaction_checkpoints (agent_id, session_id, subroutine_id, created_at DESC)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_compaction_checkpoints_session_only
      ON compaction_checkpoints (session_id, created_at ASC)
    `.unprepared
  }),
  "0017_turn_post_commit_tasks": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS turn_post_commit_tasks (
        task_id TEXT PRIMARY KEY,
        turn_id TEXT NOT NULL UNIQUE,
        agent_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        conversation_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Pending','Claimed','Succeeded','Retry','FailedPermanent')),
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TEXT NOT NULL,
        claimed_at TEXT,
        claim_owner TEXT,
        completed_at TEXT,
        last_error_code TEXT,
        last_error_message TEXT,
        payload_json TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_post_commit_status_next_attempt
      ON turn_post_commit_tasks (status, next_attempt_at)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS idx_post_commit_session_created
      ON turn_post_commit_tasks (session_id, created_at)
    `.unprepared
  }),
  "0018_schedule_action_payloads": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE INDEX IF NOT EXISTS schedules_action_kind_idx
      ON schedules (action_kind)
    `.unprepared
  }),
  "0019_drop_turn_post_commit_outbox": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      DROP INDEX IF EXISTS idx_post_commit_status_next_attempt
    `.unprepared

    yield* sql`
      DROP INDEX IF EXISTS idx_post_commit_session_created
    `.unprepared

    yield* sql`
      DROP TABLE IF EXISTS turn_post_commit_tasks
    `.unprepared
  }),
  "0020_storage_foundation": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS artifacts (
        artifact_id TEXT PRIMARY KEY,
        sha256 TEXT NOT NULL,
        media_type TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        compression TEXT NOT NULL CHECK (compression IN ('none', 'gzip')),
        preview_text TEXT,
        created_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE UNIQUE INDEX IF NOT EXISTS artifacts_sha256_uq
      ON artifacts (sha256)
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS session_artifacts (
        session_artifact_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        artifact_id TEXT NOT NULL,
        purpose TEXT NOT NULL CHECK (purpose IN ('ToolResult', 'SubroutineTrace', 'TranscriptSnapshot', 'CompactionDetail')),
        turn_id TEXT,
        tool_invocation_id TEXT,
        run_id TEXT,
        idempotency_key TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE UNIQUE INDEX IF NOT EXISTS session_artifacts_idempotency_uq
      ON session_artifacts (idempotency_key)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS session_artifacts_session_purpose_created_idx
      ON session_artifacts (session_id, purpose, created_at)
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS session_metrics (
        session_id TEXT PRIMARY KEY,
        token_count INTEGER NOT NULL DEFAULT 0,
        tool_result_bytes INTEGER NOT NULL DEFAULT 0,
        artifact_bytes INTEGER NOT NULL DEFAULT 0,
        file_touches INTEGER NOT NULL DEFAULT 0,
        last_compaction_at TEXT,
        updated_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS session_metrics_updated_idx
      ON session_metrics (updated_at)
    `.unprepared
  }),
  "0021_schedule_memory_subroutine_session_mode": Effect.void,
  "0022_hard_cutover_schedule_schema_reset": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      DROP TABLE IF EXISTS scheduled_executions
    `.unprepared

    yield* sql`
      DROP TABLE IF EXISTS schedules
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS schedules (
        schedule_id TEXT PRIMARY KEY,
        owner_agent_id TEXT NOT NULL,
        recurrence_label TEXT NOT NULL,
        cron_expression TEXT,
        interval_seconds INTEGER,
        trigger_tag TEXT NOT NULL,
        action_kind TEXT NOT NULL,
        action_payload_json TEXT NOT NULL,
        schedule_status TEXT NOT NULL,
        concurrency_policy TEXT NOT NULL,
        allows_catch_up INTEGER NOT NULL,
        auto_disable_after_run INTEGER NOT NULL,
        catch_up_window_seconds INTEGER NOT NULL,
        max_catch_up_runs_per_tick INTEGER NOT NULL,
        last_execution_at TEXT,
        next_execution_at TEXT
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS schedules_next_execution_idx
      ON schedules (schedule_status, next_execution_at)
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS schedules_action_kind_idx
      ON schedules (action_kind)
    `.unprepared

    yield* sql`
      CREATE TABLE IF NOT EXISTS scheduled_executions (
        execution_id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL,
        due_at TEXT NOT NULL,
        trigger_source TEXT NOT NULL,
        outcome TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        skip_reason TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS scheduled_executions_schedule_id_idx
      ON scheduled_executions (schedule_id, created_at)
    `.unprepared
  }),
  "0023_session_compaction_state": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS session_compaction_state (
        session_id TEXT PRIMARY KEY,
        active_turn_id TEXT,
        active_agent_id TEXT,
        active_conversation_id TEXT,
        pending_turn_id TEXT,
        pending_agent_id TEXT,
        pending_conversation_id TEXT,
        pending_triggered_at TEXT,
        updated_at TEXT NOT NULL
      )
    `.unprepared

    yield* sql`
      CREATE INDEX IF NOT EXISTS session_compaction_state_updated_idx
      ON session_compaction_state (updated_at)
    `.unprepared
  })
})

export const run = SqliteMigrator.run({ loader })

export const layer = SqliteMigrator.layer({ loader })

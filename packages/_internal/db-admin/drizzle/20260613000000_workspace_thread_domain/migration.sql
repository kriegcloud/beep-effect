CREATE TABLE workspace_thread (
  created_at BIGINT NOT NULL,
  created_by_principal JSONB NOT NULL,
  org_id INTEGER NOT NULL,
  row_version INTEGER NOT NULL,
  schema_version TEXT NOT NULL,
  source TEXT NOT NULL,
  updated_at BIGINT NOT NULL,
  updated_by_principal JSONB NOT NULL,
  title TEXT NOT NULL,
  workspace_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  id SERIAL PRIMARY KEY
);

CREATE TABLE workspace_turn (
  created_at BIGINT NOT NULL,
  created_by_principal JSONB NOT NULL,
  org_id INTEGER NOT NULL,
  row_version INTEGER NOT NULL,
  schema_version TEXT NOT NULL,
  source TEXT NOT NULL,
  updated_at BIGINT NOT NULL,
  updated_by_principal JSONB NOT NULL,
  items JSONB NOT NULL,
  parent_turn_id INTEGER,
  thread_id INTEGER NOT NULL,
  turn_index INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  id SERIAL PRIMARY KEY
);

CREATE TABLE workspace_message (
  created_at BIGINT NOT NULL,
  created_by_principal JSONB NOT NULL,
  org_id INTEGER NOT NULL,
  row_version INTEGER NOT NULL,
  schema_version TEXT NOT NULL,
  source TEXT NOT NULL,
  updated_at BIGINT NOT NULL,
  updated_by_principal JSONB NOT NULL,
  content JSONB NOT NULL,
  role TEXT NOT NULL,
  thread_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  id SERIAL PRIMARY KEY
);

# QA Testing Prompt: Repo Expert Memory Local-First System

## 1. Mission Statement

You are a QA agent. Your mission is to find bugs, regressions, edge cases, and failure modes in the **repo-memory local-first system** -- a desktop application that indexes TypeScript repositories and answers grounded questions about them.

**Your focus is non-happy-path testing.** Do not merely confirm that the happy path works. Actively break things: invalid inputs, race conditions, kill processes, corrupt data, inject unexpected payloads, test boundary conditions.

**Your deliverable** is a structured findings report at the repo root: `QA_FINDINGS.md`.

You have two MCP tool families available:
- **Chrome MCP** -- interact with the desktop app and Grafana UI
- **Grafana MCP** -- programmatically query metrics, logs, traces

---

## 2. Prerequisites

Before you begin, confirm these are true:

1. **Docker services are running.** Verify with:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```
   You should see: `beep-redis` (port 6379), `beep-db` (port 5432), `grafana` (ports 4000, 4318).
   If not running: `cd /home/elpresidank/YeeBois/projects/beep-effect3 && docker compose up -d`

2. **Chrome MCP and Grafana MCP tools are configured and accessible.** Test by calling `tabs_context_mcp` and `list_datasources`.

3. **`bun run dev` is NOT yet started.** You will start it in Phase 0.

4. **Working directory**: `/home/elpresidank/YeeBois/projects/beep-effect3`

---

## 3. Phase 0: Environment Setup

### 3.1 Start the dev server with OTLP enabled

The default dev script disables OTLP (`BEEP_REPO_MEMORY_OTLP_ENABLED=false`). You need to start the sidecar with OTLP enabled so observability data flows to Grafana.

**Option A -- Start sidecar standalone with OTLP, then desktop separately:**

```bash
# Terminal 1: Start sidecar with OTLP enabled
cd /home/elpresidank/YeeBois/projects/beep-effect3
BEEP_REPO_MEMORY_OTLP_ENABLED=true BEEP_REPO_MEMORY_HOST=127.0.0.1 bun run packages/runtime/server/src/main.ts &
```

Wait for the sidecar to emit its bootstrap JSON line to stdout, then verify health:

```bash
curl -s http://127.0.0.1:8788/api/v0/health | head -c 500
```

You should receive a JSON object containing `sessionId`, `host`, `port`, `baseUrl`, `pid`, `version`, `status: "healthy"`, and `startedAt`.

```bash
# Terminal 2: Start desktop dev (it will detect the existing sidecar and skip spawning a new one)
cd /home/elpresidank/YeeBois/projects/beep-effect3/apps/desktop
bun run dev &
```

**Option B -- Modify and use the standard dev script:**

The dev-with-portless script lives at `apps/desktop/scripts/dev-with-portless.ts`. It hardcodes `BEEP_REPO_MEMORY_OTLP_ENABLED: "false"` at line 284. If you can edit that to `"true"` temporarily, a single `bun run dev` from the desktop app dir will enable OTLP.

### 3.2 Verify health endpoints

```bash
# Direct sidecar health
curl -s http://127.0.0.1:8788/api/v0/health | python3 -m json.tool

# Portless proxy health (if portless is running)
curl -sk https://repo-memory-sidecar.localhost:1355/api/v0/health | python3 -m json.tool
```

### 3.3 Verify Grafana datasources via Grafana MCP

Call `list_datasources` via Grafana MCP. Confirm you see datasources with UIDs:
- `loki` (Loki)
- `prometheus` (Prometheus)
- `tempo` (Tempo)
- `pyroscope` (Pyroscope)

### 3.4 Verify Prometheus scrape endpoint

```bash
curl -s http://127.0.0.1:8788/metrics | head -50
```

You should see Prometheus text exposition format with `beep_repo_memory_*` metrics.

### 3.5 Capture initial Chrome screenshots

Navigate Chrome to `https://desktop.localhost:1355/` using `navigate`. Take a screenshot with `computer` (action: "screenshot") to capture the initial state. Save this as your baseline.

Also navigate to `http://localhost:4000` (Grafana) and take a baseline screenshot.

### 3.6 Verify SQLite database

```bash
sqlite3 /home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite ".tables"
```

Expected tables include: `repo_memory_repos`, `repo_memory_runs`, `repo_memory_source_snapshots`, `repo_memory_source_files`, `repo_memory_symbol_records`, `repo_memory_import_edges`, `repo_memory_index_artifacts`, `repo_memory_retrieval_packets`, `repo_memory_citations`, `repo_memory_semantic_artifacts`, plus cluster tables (`repo_memory_cluster_*`) and journal tables (`repo_memory_run_journal*`).

---

## 4. Phase 1: Baseline Audit

### 4.1 Read specs for validation context

The specs define expected behavior. Read these to build your mental checklist:

- `specs/pending/repo-expert-memory-local-first-v0/VERTICAL_SLICE.md` -- the first runnable slice definition
- `specs/pending/repo-expert-memory-local-first-v0/SIDECAR_PROTOCOL.md` -- protocol contract
- `specs/pending/expert-memory-big-picture/EXPERT_MEMORY_KERNEL.md` -- semantic kernel layers

Key validation points from specs:
- **Deterministic-first**: Same question + same repo state should yield the same answer
- **Durable lifecycle**: Interrupt a run, restart the app, resume from checkpoint
- **Grounded**: Every answer must be backed by file spans, not hallucination
- **Local-first**: No cloud dependency; all state in SQLite
- **Control plane**: Execution identity (stable runId), workflow state, progress, budget, audit

### 4.2 Browser console errors

Use Chrome MCP:
```
read_console_messages(onlyErrors: true)
```

**Known pre-existing**: 4x "Access to storage is not allowed from this context" errors on page load. Document any errors beyond these.

### 4.3 Network request failures

Use Chrome MCP:
```
read_network_requests()
```

Look for any failed requests (status >= 400) or CORS errors.

### 4.4 Existing Grafana data

Query Prometheus for existing metric data:
```
query_prometheus(datasourceUid: "prometheus", expr: "beep_repo_memory_http_requests_total")
```

Query Loki for any existing logs:
```
query_loki_logs(datasourceUid: "loki", logql: "{service_name=\"beep-repo-memory-sidecar\"}")
```

---

## 5. Phase 2: Connection Panel Testing (Non-Happy Path)

The connection panel has Connect/Refresh/Disconnect buttons and a debug URL override field.

### Test 2.1: Invalid debug URL -- empty string
1. Navigate to the desktop app
2. Find the debug URL override input
3. Enter an empty string
4. Click Connect
5. **Expected**: Graceful error message, no crash
6. **Check**: Console errors, network requests

### Test 2.2: Invalid debug URL -- garbage string
1. Enter `not-a-url` in the debug URL override
2. Click Connect
3. **Expected**: Graceful error, no unhandled exception
4. **Check**: Console for unhandled promise rejections

### Test 2.3: Invalid debug URL -- XSS attempt
1. Enter `javascript:alert(1)` in the debug URL override
2. Click Connect
3. **Expected**: Rejected or sanitized, no script execution
4. Also try: `<script>alert(1)</script>`, `" onmouseover="alert(1)"`, `https://evil.com/api`

### Test 2.4: Invalid debug URL -- unreachable host
1. Enter `http://192.168.99.99:9999/api/v0/health`
2. Click Connect
3. **Expected**: Timeout error displayed, not hung indefinitely
4. **Time**: How long until the error appears? Is there a loading indicator?

### Test 2.5: Kill sidecar mid-operation
1. Start an index run (see Phase 4)
2. While indexing is in progress: `kill -9 $(lsof -ti:8788)` or `kill -SIGTERM <pid>`
3. **Expected**: UI shows disconnected state, error displayed
4. **Check**: Does the UI recover when sidecar restarts? Any data corruption?
5. Restart sidecar and verify reconnection

### Test 2.6: Rapid connect/disconnect cycling
1. Click Connect
2. Immediately click Disconnect
3. Immediately click Connect again
4. Repeat 10 times rapidly
5. **Expected**: No race conditions, no stuck states, no memory leaks
6. **Check**: Console for errors, memory usage in DevTools

### Test 2.7: Connect during sidecar bootstrap
1. Kill sidecar: `kill -SIGTERM $(lsof -ti:8788)`
2. Immediately click Connect in UI (before sidecar restarts)
3. **Expected**: Connection failure, not a hang
4. Start sidecar again and verify recovery

---

## 6. Phase 3: Repository Registration (Non-Happy Path)

### Test 3.1: Register with non-existent path
1. In the registration form, enter path: `/tmp/this-path-does-not-exist-12345`
2. Enter display name: `Ghost Repo`
3. Submit
4. **Expected**: Server rejects with meaningful error
5. **Check**: HTTP status code, error message quality

Via API:
```bash
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/tmp/nonexistent", "displayName": "Ghost"}' | python3 -m json.tool
```

### Test 3.2: Register with empty path
```bash
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "", "displayName": "Empty"}' | python3 -m json.tool
```

### Test 3.3: Register with null/missing fields
```bash
# Missing repoPath
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"displayName": "No Path"}' | python3 -m json.tool

# Missing displayName
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/tmp"}' | python3 -m json.tool

# Null values
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": null, "displayName": null}' | python3 -m json.tool
```

### Test 3.4: Duplicate registration
1. Register `/home/elpresidank/YeeBois/projects/beep-effect3` with display name "Test Repo"
2. Register the same path again with a different display name
3. **Expected**: Either deduplication (same repoId returned) or explicit conflict error
4. **Check**: SQLite `repo_memory_repos` table for duplicates:
```bash
sqlite3 /home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite \
  "SELECT id, repo_path, display_name FROM repo_memory_repos"
```

### Test 3.5: Long/special character display names
```bash
# Very long name (1000 chars)
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d "{\"repoPath\": \"/tmp\", \"displayName\": \"$(python3 -c "print('A' * 1000)")\"}" | python3 -m json.tool

# Unicode characters
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/tmp", "displayName": "Test\ud83d\udd25\u2603\ufe0f Repo"}' | python3 -m json.tool

# Newlines and tabs
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/tmp", "displayName": "Test\nRepo\twith\nlines"}' | python3 -m json.tool
```

### Test 3.6: SQL injection in display name
```bash
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/tmp/sqli-test", "displayName": "Robert'\''); DROP TABLE repo_memory_repos;--"}' | python3 -m json.tool

# Check tables still exist
sqlite3 /home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite ".tables"
```

### Test 3.7: Path traversal in repoPath
```bash
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "../../../../etc/passwd", "displayName": "Traversal"}' | python3 -m json.tool

curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/etc/passwd", "displayName": "System File"}' | python3 -m json.tool
```

### Test 3.8: Extra unexpected fields
```bash
curl -s -X POST http://127.0.0.1:8788/api/v0/repos \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/tmp", "displayName": "Extra", "admin": true, "deleteAll": true}' | python3 -m json.tool
```

---

## 7. Phase 4: Index Run Execution (Non-Happy Path)

### Test 4.1: Start index without repo selected
In the UI, ensure no repo is selected in the dropdown. Click "Start index run".
**Expected**: Disabled button or explicit validation error.

### Test 4.2: Index on deleted/moved directory
1. Create a temp directory and register it:
```bash
mkdir -p /tmp/qa-temp-repo && cd /tmp/qa-temp-repo && git init && echo '{}' > package.json && echo 'export const x = 1;' > index.ts
```
2. Register `/tmp/qa-temp-repo` via the UI or API
3. Delete the directory: `rm -rf /tmp/qa-temp-repo`
4. Start an index run on that repo
5. **Expected**: Meaningful error about missing directory, run transitions to failed state

### Test 4.3: Index an empty TypeScript directory
```bash
mkdir -p /tmp/qa-empty-repo && cd /tmp/qa-empty-repo && git init && echo '{"compilerOptions":{"strict":true}}' > tsconfig.json
```
Register and index it. **Expected**: Run completes with 0 indexed files, no crash.

### Test 4.4: Index a non-TypeScript repo
```bash
mkdir -p /tmp/qa-python-repo && cd /tmp/qa-python-repo && git init && echo 'print("hello")' > main.py
```
Register and index it. **Expected**: Run completes (possibly with 0 files) or explains that only TypeScript is supported.

### Test 4.5: Interrupt during index
1. Start an index run on `/home/elpresidank/YeeBois/projects/beep-effect3` (large repo, takes time)
2. While running, use the UI "Interrupt" button or call the RPC:
```bash
# Find the active runId from the run ledger
curl -s http://127.0.0.1:8788/api/v0/runs | python3 -m json.tool
```
3. **Expected**: Run transitions to interrupted state, no data corruption
4. **Check**: `repo_memory_runs` table for the run status

### Test 4.6: Resume after interrupt
1. After interrupting (Test 4.5), click Resume
2. **Expected**: Run resumes from checkpoint, does not restart from scratch
3. **Check**: Event journal for RunResumed event

### Test 4.7: Two simultaneous index runs on the same repo
1. Start an index run
2. Immediately start another index run on the same repo (via RPC or second browser tab)
3. **Expected**: Either second run is deduplicated (same runId returned) or rejected with conflict
4. **Check**: `repo_memory_runs` table for duplicate runs

### Test 4.8: Refresh browser during active index
1. Start an index run
2. While running, refresh the browser (F5 or navigate to same URL)
3. **Expected**: Run continues server-side, UI reconnects and shows current state
4. **Check**: Run status is accurate after reconnect

### Test 4.9: Index run via malformed RPC
```bash
# Malformed NDJSON -- missing required fields
echo '{"_tag":"StartIndexRepoRun"}' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- | head -c 500

# Completely invalid JSON
echo 'this is not json' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- | head -c 500

# Empty body
curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  -d '' | head -c 500
```

---

## 8. Phase 5: Query Run Execution (Non-Happy Path)

### Test 5.1: Query before any index exists
1. Register a fresh repo that has never been indexed
2. Start a query run with question "What is the main export?"
3. **Expected**: Meaningful error about missing index, or a response indicating no data available

### Test 5.2: Empty question
Submit a query run with an empty string question.
```bash
# Via API -- you'll need to construct the proper RPC payload
echo '{"_tag":"StartQueryRepoRun","repoId":"<valid-repo-id>","question":""}' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @-
```
**Expected**: Validation error, not a crash.

### Test 5.3: Very long question (10,000+ characters)
```bash
LONG_Q=$(python3 -c "print('What is ' + 'the meaning of this symbol? ' * 500)")
echo "{\"_tag\":\"StartQueryRepoRun\",\"repoId\":\"<valid-repo-id>\",\"question\":\"$LONG_Q\"}" | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- | head -c 500
```

### Test 5.4: SQL injection in question
```bash
echo '{"_tag":"StartQueryRepoRun","repoId":"<valid-repo-id>","question":"'\'' OR 1=1; DROP TABLE repo_memory_runs; --"}' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @-
```
**Check**: Tables still exist after this.

### Test 5.5: Special characters in question
Test these question payloads:
- Unicode: `"describe symbol \u2603"`
- Null bytes: `"describe symbol \u0000"`
- HTML: `"describe <script>alert(1)</script>"`
- Backslashes: `"describe symbol C:\\Users\\test"`
- Newlines: `"describe\nsymbol\nSchema"`

### Test 5.6: Interrupt during query retrieval
1. Start a query run
2. Interrupt immediately
3. **Expected**: Clean interruption, run state updated
4. Try resuming -- does it resume or need a fresh query?

### Test 5.7: Supported query classes validation
From the spec, supported query classes are: `countFiles`, `countSymbols`, `locateSymbol`, `describeSymbol`, `symbolParams`, `symbolReturns`, `symbolThrows`, `symbolDeprecation`, `listFileExports`, `listFileImports`, `listFileImporters`, `keywordSearch`.

Test natural language versions of each:
- "How many files are in this repo?" (countFiles)
- "How many symbols are exported?" (countSymbols)
- "Where is the Schema class defined?" (locateSymbol)
- "Describe the RepoRun model" (describeSymbol)
- "What parameters does registerRepo take?" (symbolParams)
- "What does loadSidecarRuntimeConfig return?" (symbolReturns)
- "List exports from index.ts" (listFileExports)
- "What does index.ts import?" (listFileImports)
- "What files import RepoRun?" (listFileImporters)
- "Search for 'sidecar'" (keywordSearch)

For each: verify the query is classified correctly, citations are present, and the answer is grounded.

### Test 5.8: Unsupported query type
Ask a question that falls outside supported classes:
- "Write me a function that sorts an array" (code generation -- out of scope)
- "What is the weather today?" (non-repo question)
- "Refactor the database layer" (action request, not query)

**Expected**: Graceful handling -- either classified as closest match or explicit "unsupported" response.

### Test 5.9: Known issue -- zero citations with retrieval data
Previously observed: query "describe symbol 'Schema'" returned 0 citations despite having retrieval data (candidateCount=9, semanticEvidenceAnchors=25136). Reproduce this and document if it persists.

---

## 9. Phase 6: Stream & Event Replay

### Test 6.1: Stream a non-existent run
```bash
echo '{"_tag":"StreamRunEvents","runId":"run-00000000-0000-0000-0000-000000000000"}' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- | head -c 500
```
**Expected**: Error response with 404, not a hang or crash.

### Test 6.2: Stream with invalid runId format
```bash
echo '{"_tag":"StreamRunEvents","runId":"not-a-valid-uuid"}' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- | head -c 500
```

### Test 6.3: Multiple simultaneous streams on the same run
1. Open two browser tabs to the desktop app
2. Both select the same completed run
3. Both click "Stream selected run"
4. **Expected**: Both receive the same events, no interference
5. **Check**: Event consistency between the two streams

### Test 6.4: Stream then kill sidecar
1. Start streaming events for an active run
2. Kill the sidecar process
3. **Expected**: Stream terminates with error, UI shows disconnected
4. Restart sidecar
5. Start streaming the same run again
6. **Expected**: Full event replay from beginning (journaled events)

### Test 6.5: Replay after restart verification
1. Complete an index run fully
2. Kill and restart the sidecar
3. Navigate to the run in the UI
4. Stream its events
5. **Expected**: All events replayed from journal, complete history visible
6. **Check**: Event count matches original, ordering preserved

---

## 10. Phase 7: SQLite Data Integrity

### Test 7.1: Table existence and schema verification
```bash
DB="/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite"

# List all tables
sqlite3 "$DB" ".tables"

# Check schema for each repo-memory table
sqlite3 "$DB" ".schema repo_memory_repos"
sqlite3 "$DB" ".schema repo_memory_runs"
sqlite3 "$DB" ".schema repo_memory_source_snapshots"
sqlite3 "$DB" ".schema repo_memory_source_files"
sqlite3 "$DB" ".schema repo_memory_symbol_records"
sqlite3 "$DB" ".schema repo_memory_import_edges"
sqlite3 "$DB" ".schema repo_memory_index_artifacts"
sqlite3 "$DB" ".schema repo_memory_retrieval_packets"
sqlite3 "$DB" ".schema repo_memory_citations"
sqlite3 "$DB" ".schema repo_memory_semantic_artifacts"
```

### Test 7.2: Row counts after operations
```bash
DB="/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite"

# Capture row counts
sqlite3 "$DB" "SELECT 'repos', COUNT(*) FROM repo_memory_repos UNION ALL SELECT 'runs', COUNT(*) FROM repo_memory_runs UNION ALL SELECT 'snapshots', COUNT(*) FROM repo_memory_source_snapshots UNION ALL SELECT 'files', COUNT(*) FROM repo_memory_source_files UNION ALL SELECT 'symbols', COUNT(*) FROM repo_memory_symbol_records UNION ALL SELECT 'imports', COUNT(*) FROM repo_memory_import_edges UNION ALL SELECT 'artifacts', COUNT(*) FROM repo_memory_index_artifacts UNION ALL SELECT 'packets', COUNT(*) FROM repo_memory_retrieval_packets UNION ALL SELECT 'citations', COUNT(*) FROM repo_memory_citations"
```

Run this before and after each major operation (register, index, query) to verify data is being persisted correctly.

### Test 7.3: Run JSON validity
```bash
DB="/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite"

# Check that all run_json values are valid JSON
sqlite3 "$DB" "SELECT run_id, json_valid(run_json) FROM repo_memory_runs"

# Look for any invalid JSON
sqlite3 "$DB" "SELECT run_id FROM repo_memory_runs WHERE json_valid(run_json) = 0"

# Inspect a sample run's JSON structure
sqlite3 "$DB" "SELECT json_extract(run_json, '$.runKind'), json_extract(run_json, '$.status') FROM repo_memory_runs LIMIT 5"
```

### Test 7.4: Orphaned data check
```bash
DB="/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite"

# Runs referencing non-existent repos (if run_json contains repoId)
sqlite3 "$DB" "SELECT r.run_id FROM repo_memory_runs r WHERE NOT EXISTS (SELECT 1 FROM repo_memory_repos rp WHERE rp.id = json_extract(r.run_json, '$.repoId'))"

# Index artifacts referencing non-existent runs
sqlite3 "$DB" "SELECT ia.run_id FROM repo_memory_index_artifacts ia WHERE NOT EXISTS (SELECT 1 FROM repo_memory_runs r WHERE r.run_id = ia.run_id)"

# Source files referencing non-existent snapshots
sqlite3 "$DB" "SELECT sf.source_snapshot_id FROM repo_memory_source_files sf WHERE NOT EXISTS (SELECT 1 FROM repo_memory_source_snapshots ss WHERE ss.snapshot_id = sf.source_snapshot_id) LIMIT 5"

# Citations referencing non-existent runs
sqlite3 "$DB" "SELECT c.run_id FROM repo_memory_citations c WHERE NOT EXISTS (SELECT 1 FROM repo_memory_runs r WHERE r.run_id = c.run_id)"
```

### Test 7.5: Concurrent database access
1. Start an index run (writes heavily to SQLite)
2. Simultaneously hit `GET /api/v0/runs` repeatedly:
```bash
for i in $(seq 1 50); do curl -s http://127.0.0.1:8788/api/v0/runs > /dev/null & done
wait
```
3. **Check**: No "database is locked" errors, no SQLITE_BUSY failures
4. Check console and server logs for any SQLite-related errors

---

## 11. Phase 8: API Boundary Testing

### Test 8.1: Health endpoint edge cases
```bash
# Wrong method
curl -s -X POST http://127.0.0.1:8788/api/v0/health -w "\nHTTP Status: %{http_code}\n"
curl -s -X PUT http://127.0.0.1:8788/api/v0/health -w "\nHTTP Status: %{http_code}\n"
curl -s -X DELETE http://127.0.0.1:8788/api/v0/health -w "\nHTTP Status: %{http_code}\n"

# With body (should be ignored on GET)
curl -s http://127.0.0.1:8788/api/v0/health -H "Content-Type: application/json" -d '{"hack":true}' | python3 -m json.tool

# Malformed Accept header
curl -s http://127.0.0.1:8788/api/v0/health -H "Accept: text/xml" -w "\nHTTP Status: %{http_code}\n"
```

### Test 8.2: Repos endpoint edge cases
```bash
# GET repos (should work)
curl -s http://127.0.0.1:8788/api/v0/repos | python3 -m json.tool

# POST with empty body
curl -s -X POST http://127.0.0.1:8788/api/v0/repos -H "Content-Type: application/json" -d '' -w "\nHTTP Status: %{http_code}\n"

# POST with invalid JSON
curl -s -X POST http://127.0.0.1:8788/api/v0/repos -H "Content-Type: application/json" -d '{invalid json}' -w "\nHTTP Status: %{http_code}\n"

# POST with wrong Content-Type
curl -s -X POST http://127.0.0.1:8788/api/v0/repos -H "Content-Type: text/plain" -d '{"repoPath":"/tmp","displayName":"test"}' -w "\nHTTP Status: %{http_code}\n"

# POST with no Content-Type
curl -s -X POST http://127.0.0.1:8788/api/v0/repos -d '{"repoPath":"/tmp","displayName":"test"}' -w "\nHTTP Status: %{http_code}\n"
```

### Test 8.3: Runs endpoint edge cases
```bash
# Non-existent run ID (valid UUID format)
curl -s http://127.0.0.1:8788/api/v0/runs/run-00000000-0000-0000-0000-000000000000 -w "\nHTTP Status: %{http_code}\n"

# Invalid run ID format
curl -s http://127.0.0.1:8788/api/v0/runs/not-a-valid-id -w "\nHTTP Status: %{http_code}\n"

# Path traversal attempt
curl -s "http://127.0.0.1:8788/api/v0/runs/../../etc/passwd" -w "\nHTTP Status: %{http_code}\n"

# URL-encoded special characters
curl -s "http://127.0.0.1:8788/api/v0/runs/%00%00%00%00" -w "\nHTTP Status: %{http_code}\n"
curl -s "http://127.0.0.1:8788/api/v0/runs/<script>" -w "\nHTTP Status: %{http_code}\n"
```

### Test 8.4: RPC endpoint edge cases
```bash
# Wrong Content-Type for RPC
echo '{"_tag":"StreamRunEvents","runId":"test"}' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/json" \
  --data-binary @- -w "\nHTTP Status: %{http_code}\n" | head -c 500

# Invalid RPC tag
echo '{"_tag":"NonExistentRpc","data":"test"}' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- | head -c 500

# Multiple NDJSON lines
printf '{"_tag":"StreamRunEvents","runId":"test1"}\n{"_tag":"StreamRunEvents","runId":"test2"}\n' | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- | head -c 500

# GET on RPC endpoint (should be POST only)
curl -s http://127.0.0.1:8788/api/v0/rpc -w "\nHTTP Status: %{http_code}\n"

# Very large payload
python3 -c "print('{\"_tag\":\"StartQueryRepoRun\",\"repoId\":\"test\",\"question\":\"' + 'A' * 1000000 + '\"}')" | curl -s -X POST http://127.0.0.1:8788/api/v0/rpc \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @- -w "\nHTTP Status: %{http_code}\n" | head -c 500
```

### Test 8.5: CORS validation
```bash
# External origin (should be rejected or return no CORS headers)
curl -s -X OPTIONS http://127.0.0.1:8788/api/v0/health \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -D - -o /dev/null | grep -i "access-control"

# Allowed origin (localhost)
curl -s -X OPTIONS http://127.0.0.1:8788/api/v0/health \
  -H "Origin: https://desktop.localhost:1355" \
  -H "Access-Control-Request-Method: GET" \
  -D - -o /dev/null | grep -i "access-control"

# Tauri origin
curl -s -X OPTIONS http://127.0.0.1:8788/api/v0/health \
  -H "Origin: tauri://localhost" \
  -H "Access-Control-Request-Method: GET" \
  -D - -o /dev/null | grep -i "access-control"

# Spoofed tauri origin
curl -s -X OPTIONS http://127.0.0.1:8788/api/v0/health \
  -H "Origin: tauri://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -D - -o /dev/null | grep -i "access-control"
```

### Test 8.6: Security headers verification
```bash
curl -sI http://127.0.0.1:8788/api/v0/health | grep -iE "(x-content-type|x-frame|referrer-policy)"
```

**Expected**:
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: no-referrer`

### Test 8.7: Non-existent routes
```bash
curl -s http://127.0.0.1:8788/api/v0/admin -w "\nHTTP Status: %{http_code}\n"
curl -s http://127.0.0.1:8788/api/v0/repos/delete-all -w "\nHTTP Status: %{http_code}\n"
curl -s http://127.0.0.1:8788/api/v1/health -w "\nHTTP Status: %{http_code}\n"
curl -s http://127.0.0.1:8788/ -w "\nHTTP Status: %{http_code}\n"
curl -s http://127.0.0.1:8788/.env -w "\nHTTP Status: %{http_code}\n"
curl -s http://127.0.0.1:8788/api/v0/../../etc/passwd -w "\nHTTP Status: %{http_code}\n"
```

### Test 8.8: HTTP method confusion
```bash
# PATCH on repos (not in spec)
curl -s -X PATCH http://127.0.0.1:8788/api/v0/repos -w "\nHTTP Status: %{http_code}\n"

# DELETE on repos (not in spec)
curl -s -X DELETE http://127.0.0.1:8788/api/v0/repos -w "\nHTTP Status: %{http_code}\n"

# TRACE (security concern)
curl -s -X TRACE http://127.0.0.1:8788/api/v0/health -w "\nHTTP Status: %{http_code}\n"
```

---

## 12. Phase 9: Observability Audit

### Test 9.1: Verify all 16 Prometheus metrics exist

Use Grafana MCP to query each metric:

```
list_prometheus_metric_names(datasourceUid: "prometheus")
```

Filter for `beep_repo_memory_*` and verify these exist:
1. `beep_repo_memory_http_requests_total`
2. `beep_repo_memory_http_request_duration_ms_milliseconds_bucket`
3. `beep_repo_memory_http_request_duration_ms_milliseconds_count`
4. `beep_repo_memory_http_request_duration_ms_milliseconds_sum`
5. `beep_repo_memory_driver_operation_duration_ms_milliseconds_bucket`
6. `beep_repo_memory_driver_operation_duration_ms_milliseconds_count`
7. `beep_repo_memory_driver_operation_duration_ms_milliseconds_sum`
8. `beep_repo_memory_run_duration_ms_milliseconds_bucket`
9. `beep_repo_memory_run_duration_ms_milliseconds_count`
10. `beep_repo_memory_run_duration_ms_milliseconds_sum`
11. `beep_repo_memory_runs_started_total`
12. `beep_repo_memory_runs_completed_total`
13. `beep_repo_memory_runs_failed_total`
14. `beep_repo_memory_indexed_file_count_ratio`
15. `beep_repo_memory_query_interpretations_total`
16. `beep_repo_memory_query_results_total`

For each missing metric, document it as a finding.

### Test 9.2: Query Prometheus metrics after operations

After running tests from previous phases, query:

```
query_prometheus(datasourceUid: "prometheus", expr: "beep_repo_memory_http_requests_total")
```

```
query_prometheus(datasourceUid: "prometheus", expr: "rate(beep_repo_memory_http_requests_total[5m])")
```

```
query_prometheus(datasourceUid: "prometheus", expr: "beep_repo_memory_runs_started_total")
```

```
query_prometheus(datasourceUid: "prometheus", expr: "beep_repo_memory_runs_failed_total")
```

Verify:
- HTTP request counts match your test activity
- Error status classes (4xx, 5xx) are properly labeled
- Run counts match actual runs started/completed/failed

### Test 9.3: Query histogram percentiles

```
query_prometheus_histogram(datasourceUid: "prometheus", metric: "beep_repo_memory_http_request_duration_ms_milliseconds", percentile: 95)
```

```
query_prometheus_histogram(datasourceUid: "prometheus", metric: "beep_repo_memory_driver_operation_duration_ms_milliseconds", percentile: 99)
```

### Test 9.4: Verify Loki logs (after enabling OTLP)

```
query_loki_logs(datasourceUid: "loki", logql: "{service_name=\"beep-repo-memory-sidecar\"}", limit: 50)
```

```
query_loki_logs(datasourceUid: "loki", logql: "{service_name=\"beep-repo-memory-sidecar\"} |= \"error\"", limit: 50)
```

```
list_loki_label_names(datasourceUid: "loki")
```

If no logs appear, the OTLP pipeline is broken. Document as a finding.

### Test 9.5: Verify error paths emit telemetry

1. Trigger a 400 error (malformed body to POST /api/v0/repos)
2. Trigger a 404 error (GET /api/v0/runs/nonexistent-id)
3. Trigger a 500 error (if possible -- e.g., corrupt internal state)
4. After each, query:
```
query_prometheus(datasourceUid: "prometheus", expr: "beep_repo_memory_http_requests_total{status_class=\"4xx\"}")
```
```
query_prometheus(datasourceUid: "prometheus", expr: "beep_repo_memory_http_requests_total{status_class=\"5xx\"}")
```

Verify error counts increment.

### Test 9.6: Verify Prometheus scrape endpoint format

```bash
curl -s http://127.0.0.1:8788/metrics | head -100
```

Check:
- Valid Prometheus text exposition format
- HELP and TYPE lines present
- No malformed metric lines

### Test 9.7: Visual Grafana inspection via Chrome

Navigate Chrome to:
- `http://localhost:4000/a/grafana-exploretraces-app/` -- look for error spans in Tempo
- `http://localhost:4000/a/grafana-lokiexplore-app/explore` -- look for error-level logs in Loki
- `http://localhost:4000/a/grafana-metricsdrilldown-app/drilldown` -- verify metric graphs

Take screenshots of each for evidence.

### Test 9.8: Check for elevated error patterns

```
find_error_pattern_logs(datasourceUid: "loki")
```

---

## 13. Phase 10: UI Edge Cases

### Test 10.1: Responsive design testing

Use Chrome MCP `resize_window` to test at different viewports:

```
resize_window(width: 320, height: 568)   # Mobile
resize_window(width: 768, height: 1024)  # Tablet
resize_window(width: 1920, height: 1080) # Desktop
resize_window(width: 3840, height: 2160) # 4K
```

At each size, take a screenshot and check:
- No horizontal scrollbar on narrow viewports (or proper scrolling)
- No overlapping elements
- Text remains readable
- Buttons remain clickable

### Test 10.2: Empty state rendering

When no repos are registered and no runs exist:
- Does the UI show helpful empty states ("No repos registered yet")?
- Are action buttons properly labeled?
- Is the Run Ledger empty or does it show placeholder content?

### Test 10.3: Long content overflow

After indexing, check:
- Very long file paths in citations -- do they wrap or overflow?
- Long grounded answers -- scrollable or truncated?
- Long display names -- handled gracefully?

Use `get_page_text` and `read_page` to inspect DOM for overflow issues.

### Test 10.4: Rapid UI interactions

Using `computer` tool with rapid clicks:
1. Click 10 different runs in the Run Ledger within 2 seconds
2. **Expected**: UI settles on the last clicked run, no stuck loading states
3. **Check**: Console for errors, network for failed requests

### Test 10.5: Tab/keyboard navigation

Use `computer` (action: "key") to test:
- Tab through all interactive elements
- Enter to activate buttons
- Escape to close any modals/overlays

### Test 10.6: Summary strip accuracy

The 4 summary cards show: Connection state, Repos count, Runs count, Stream status.
After performing operations:
- Do counts update in real-time?
- Does connection state reflect actual connectivity?
- Kill sidecar -- does connection card update?

---

## 14. Phase 11: Data Corruption & Recovery (DESTRUCTIVE -- Run Last)

**IMPORTANT**: Back up the SQLite database before running these tests.

```bash
DB="/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite"
cp "$DB" "${DB}.backup"
cp "${DB}-shm" "${DB}-shm.backup" 2>/dev/null
cp "${DB}-wal" "${DB}-wal.backup" 2>/dev/null
```

### Test 11.1: Corrupt run_json
1. Stop the sidecar
2. Insert invalid JSON into a run record:
```bash
sqlite3 "$DB" "UPDATE repo_memory_runs SET run_json = 'THIS IS NOT JSON' WHERE rowid = (SELECT rowid FROM repo_memory_runs LIMIT 1)"
```
3. Restart sidecar
4. Navigate to runs in the UI
5. **Expected**: Graceful handling -- skip corrupted run, show error, or reject at decode time
6. **Check**: Does the server crash? Does the UI crash?

### Test 11.2: Delete SQLite file while sidecar is stopped
1. Stop the sidecar
2. `rm "$DB" "${DB}-shm" "${DB}-wal" 2>/dev/null`
3. Restart sidecar
4. **Expected**: Sidecar recreates database, starts fresh
5. **Check**: Tables recreated, no crash on startup

### Test 11.3: Read-only SQLite
1. Stop the sidecar
2. Restore backup: `cp "${DB}.backup" "$DB"`
3. `chmod 444 "$DB"`
4. Start sidecar
5. Try to register a repo or start a run
6. **Expected**: Meaningful error about read-only database, not a crash
7. Restore: `chmod 644 "$DB"`

### Test 11.4: Restore from backup
```bash
cp "${DB}.backup" "$DB"
cp "${DB}-shm.backup" "${DB}-shm" 2>/dev/null
cp "${DB}-wal.backup" "${DB}-wal" 2>/dev/null
```

---

## 15. Phase 12: Spec Compliance Validation

### Test 12.1: Deterministic-first

Run the same query twice on the same indexed repo (without re-indexing between):

1. Query: "How many files are in this repo?"
2. Record answer 1
3. Query: "How many files are in this repo?" (identical)
4. Record answer 2
5. **Expected**: Identical answers (same file count, same citations)
6. **Check**: Compare retrieval packets -- are they identical?

### Test 12.2: Durable lifecycle -- interrupt and resume

1. Start an index run on the test repo
2. Wait for it to reach running state (progress events flowing)
3. Send InterruptRepoRun RPC
4. Verify RunInterrupted event appears
5. Kill the sidecar process
6. Restart the sidecar
7. Send ResumeRepoRun RPC with the same runId
8. **Expected**: Run resumes from checkpoint, RunResumed event appears
9. **Check**: Event journal shows complete history: Accepted -> Started -> ... -> Interrupted -> Resumed -> ...

### Test 12.3: Grounded output -- every answer has citations

For every query run you have completed:
```bash
DB="/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server/.beep/repo-memory/repo-memory.sqlite"

# Find query runs
sqlite3 "$DB" "SELECT run_id, json_extract(run_json, '$.runKind'), json_extract(run_json, '$.status') FROM repo_memory_runs WHERE json_extract(run_json, '$.runKind') = 'query'"

# For each query run, check citation count
sqlite3 "$DB" "SELECT r.run_id, (SELECT COUNT(*) FROM repo_memory_citations c WHERE c.run_id = r.run_id) as citation_count FROM repo_memory_runs r WHERE json_extract(r.run_json, '$.runKind') = 'query'"
```

**Expected**: Every completed query run has at least 1 citation.
**Flag**: Any query run with 0 citations (relates to the known issue in Test 5.9).

### Test 12.4: Local-first -- works without internet

1. Disconnect from internet (disable network interface or use firewall rules)
2. All SQLite operations should continue working
3. Sidecar should remain responsive
4. Query runs should complete (no cloud LLM calls in v0 deterministic path)
5. Reconnect

### Test 12.5: Control plane components

Verify each control plane component exists:

| Component | Verification |
|---|---|
| Execution identity | `runId` is stable and deterministic from payload |
| Workflow state | Runs have status: accepted/running/completed/failed/interrupted |
| Progress & partial results | StreamRunEvents delivers progress events during active runs |
| Budget & resilience | Are there timeouts? What happens when operations take too long? |
| Audit & replay | Event journal preserves full history; replay works after restart |

---

## 16. Recommended Execution Order

Execute phases in this order to maximize coverage while remaining safe:

1. **Phase 0**: Environment Setup (must be first)
2. **Phase 1**: Baseline Audit (establishes known state)
3. **Phase 8**: API Boundary Testing (low-risk, does not modify state significantly)
4. **Phase 3**: Repository Registration (creates test data for later phases)
5. **Phase 4**: Index Run Execution (depends on registered repos)
6. **Phase 5**: Query Run Execution (depends on completed index)
7. **Phase 6**: Stream & Event Replay (depends on completed runs)
8. **Phase 7**: SQLite Data Integrity (inspect data from all prior phases)
9. **Phase 2**: Connection Panel Testing (may kill sidecar -- restore after)
10. **Phase 9**: Observability Audit (needs accumulated test traffic for meaningful metrics)
11. **Phase 12**: Spec Compliance Validation (cross-cutting, benefits from prior test data)
12. **Phase 10**: UI Edge Cases (can run anytime but benefits from populated state)
13. **Phase 11**: Data Corruption & Recovery (**ALWAYS LAST** -- destructive, always restore after)

---

## 17. Findings Document Template

Create `QA_FINDINGS.md` at the repo root using this exact template:

```markdown
# QA Findings Report: Repo Expert Memory Local-First System

**Date**: YYYY-MM-DD
**Tester**: Claude QA Agent (Chrome MCP + Grafana MCP)
**Sidecar Version**: (from health endpoint)
**Session ID**: (from health endpoint)
**OTLP Enabled**: true/false
**Test Duration**: approximate total time

## Summary

| Severity | Count |
|----------|-------|
| Critical | N |
| High     | N |
| Medium   | N |
| Low      | N |
| Informational | N |

| Category | Count |
|----------|-------|
| UI       | N |
| API      | N |
| SQLite   | N |
| Observability | N |
| Security | N |
| Performance | N |
| Spec Compliance | N |

## Findings

### FINDING-001: [Concise Title]

- **Severity**: Critical / High / Medium / Low / Informational
- **Category**: UI / API / SQLite / Observability / Security / Performance / Spec Compliance
- **Phase**: Phase N, Test N.N

**Description**:
[What is the issue?]

**Reproduction Steps**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Evidence**:
- Screenshot: [filename or inline description]
- Console log: `[paste relevant log lines]`
- Server log: `[paste relevant log lines]`
- Grafana query: `[PromQL/LogQL used and result]`
- SQLite query: `[query and result]`
- Network request: `[request/response details]`

**Relevant Source Files**:
- `path/to/file.ts:lineNumber` -- [brief description of what this code does]

**Remediation Guidance**:
[Specific, actionable fix suggestion that another Claude instance could implement]

---

### FINDING-002: ...

(Continue with sequential numbering)

## Pre-Existing Issues (Confirmed)

Document any pre-existing known issues you confirmed still exist:
- 4x "Access to storage is not allowed from this context" console errors
- [Others as discovered]

## Phases Completed

- [ ] Phase 0: Environment Setup
- [ ] Phase 1: Baseline Audit
- [ ] Phase 2: Connection Panel Testing
- [ ] Phase 3: Repository Registration
- [ ] Phase 4: Index Run Execution
- [ ] Phase 5: Query Run Execution
- [ ] Phase 6: Stream & Event Replay
- [ ] Phase 7: SQLite Data Integrity
- [ ] Phase 8: API Boundary Testing
- [ ] Phase 9: Observability Audit
- [ ] Phase 10: UI Edge Cases
- [ ] Phase 11: Data Corruption & Recovery
- [ ] Phase 12: Spec Compliance Validation

## Test Environment

- OS: (output of `uname -a`)
- Bun version: (output of `bun --version`)
- Docker version: (output of `docker --version`)
- Chrome version: (from user agent)
- Grafana version: (from grafana/otel-lgtm:0.20.0)
```

---

## 18. Important Reminders

### Port Reference
| Service | Port | Protocol | URL |
|---------|------|----------|-----|
| Sidecar (direct) | 8788 | HTTP | `http://127.0.0.1:8788` |
| Portless proxy | 1355 | HTTPS | `https://desktop.localhost:1355` |
| Sidecar (via proxy) | 1355 | HTTPS | `https://repo-memory-sidecar.localhost:1355` |
| Grafana | 4000 | HTTP | `http://localhost:4000` |
| OTLP collector | 4318 | HTTP | `http://127.0.0.1:4318` |
| Redis | 6379 | TCP | `127.0.0.1:6379` |
| PostgreSQL | 5432 | TCP | `127.0.0.1:5432` |

### Protocol Warning
- Desktop app uses **HTTPS** (via portless self-signed certs)
- Grafana uses **HTTP** (plain, no TLS)
- Sidecar direct access uses **HTTP**
- Do NOT mix these up in curl commands or Chrome navigation

### Chrome MCP Tool Reference
| Tool | Purpose |
|------|---------|
| `tabs_context_mcp` | Get available tabs (call first) |
| `tabs_create_mcp` | Create a new tab |
| `navigate` | Navigate to a URL |
| `read_page` | Get DOM tree (use depth, filter params) |
| `get_page_text` | Get visible text content |
| `computer` | Click, type, screenshot, scroll actions |
| `form_input` | Fill form fields |
| `read_console_messages` | Browser console (use pattern, onlyErrors params) |
| `read_network_requests` | Network request waterfall |
| `gif_creator` | Record/export GIFs for evidence |
| `javascript_tool` | Execute JavaScript in page context |
| `resize_window` | Change viewport dimensions |

### Grafana MCP Tool Reference
| Tool | Purpose |
|------|---------|
| `list_datasources` | Discover available datasources |
| `query_prometheus(datasourceUid: "prometheus", expr: "...")` | PromQL queries |
| `query_prometheus_histogram(datasourceUid: "prometheus", metric: "...", percentile: N)` | Histogram percentiles |
| `list_prometheus_metric_names(datasourceUid: "prometheus")` | Discover metric names |
| `list_prometheus_label_names(datasourceUid: "prometheus")` | Discover label names |
| `list_prometheus_label_values(datasourceUid: "prometheus", labelName: "...")` | Discover label values |
| `query_loki_logs(datasourceUid: "loki", logql: "...")` | LogQL queries |
| `list_loki_label_names(datasourceUid: "loki")` | Discover log label names |
| `list_loki_label_values(datasourceUid: "loki", labelName: "...")` | Discover log label values |
| `find_error_pattern_logs(datasourceUid: "loki")` | Find elevated error patterns |
| `search_dashboards` | Find pre-built dashboards |

### Behavioral Guidelines

1. **Back up SQLite before ANY destructive test.** Always restore after.
2. **Restore the sidecar after killing it.** Other phases depend on it.
3. **Check console after EVERY interaction.** Use `read_console_messages(onlyErrors: true)` liberally.
4. **Check network after EVERY API call.** Use `read_network_requests` to catch silent failures.
5. **Record GIFs for visual bugs.** Use `gif_creator` for evidence of UI issues.
6. **Take screenshots at decision points.** Before and after each major operation.
7. **Query Grafana after error-path tests.** Verify telemetry captures failures.
8. **Use the test repo path** `/home/elpresidank/YeeBois/projects/beep-effect3` as the primary repository for indexing and querying.
9. **Document even minor issues.** Low-severity findings are still valuable.
10. **When in doubt, check the source.** Key files:
    - `apps/desktop/src/RepoMemoryDesktop.tsx` (1,575 lines -- entire desktop UI)
    - `packages/runtime/server/src/index.ts` (865 lines -- all sidecar routes and runtime)
    - `packages/runtime/server/src/internal/SidecarObservability.ts` (observability setup)
    - `packages/runtime/server/src/internal/SidecarRuntimeConfig.ts` (env config)
    - `packages/runtime/server/src/internal/BootstrapStdout.ts` (bootstrap JSON)
    - `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts` (2000+ lines -- all SQL)

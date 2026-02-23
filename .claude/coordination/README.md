# Coordination System

This directory contains the coordination infrastructure for managing concurrent file access across multiple Claude agents.

## Overview

The coordination system uses file locks to prevent conflicts when multiple agents attempt to modify the same files simultaneously. This is implemented through hooks that intercept tool usage and enforce lock acquisition before file modifications.

## File Structure

### `file-locks.json`

A JSON file containing a map of file paths to lock objects. Each entry represents an active lock on a file.

**Format:**
```json
{
  "/absolute/path/to/file.ts": {
    "agentId": "agent_12345_timestamp",
    "acquiredAt": "2025-11-10T10:30:00.000Z",
    "lastModified": "2025-11-10T10:30:15.000Z"
  }
}
```

**Fields:**
- `agentId`: Unique identifier for the agent holding the lock
- `acquiredAt`: ISO timestamp when the lock was first acquired
- `lastModified`: ISO timestamp of the last modification to the locked file

## Agent ID Format

Agent IDs follow the pattern: `agent_{random}_{timestamp}`

Example: `agent_a7b9c2_1699632000000`

This format ensures:
- Uniqueness across concurrent agents
- Traceability through timestamps
- Easy debugging and auditing

## Lock Lifecycle

### 1. Lock Acquisition
- Agent requests file modification through a tool (Edit, Write, NotebookEdit)
- Pre-tool-use hook intercepts the request
- Hook checks if file is already locked by another agent
- If available, lock is acquired and written to `file-locks.json`
- Tool execution proceeds

### 2. Lock Hold
- Lock remains active while agent works on the file
- `lastModified` timestamp updates on each file modification
- Other agents are blocked from modifying the same file

### 3. Lock Release
- Lock is released when agent completes work
- Can be manual (agent releases) or automatic (timeout)
- Entry is removed from `file-locks.json`

## Hook Interaction Flow

### Pre-User-Prompt Hook
```
User Input → Hook → Parse Prompt → Detect Agent Conflicts → Warn if Needed → Continue
```

**Purpose:** Alert user if multiple agents are working on same files

### Pre-Tool-Use Hook
```
Tool Request → Hook → Extract file_path → Check Lock → Acquire/Block → Execute Tool
```

**Purpose:** Enforce exclusive file access

**Supported Tools:**
- `Edit` - modifies existing files
- `Write` - creates/overwrites files
- `NotebookEdit` - modifies Jupyter notebooks

### Post-Tool-Use Hook
```
Tool Completion → Hook → Update lastModified → Continue
```

**Purpose:** Track when files were last modified

## Lock States

| State | Description | Action |
|-------|-------------|--------|
| Unlocked | No entry in file-locks.json | Acquire lock immediately |
| Locked by Self | agentId matches current agent | Allow access (idempotent) |
| Locked by Other | agentId differs | Block and warn user |
| Stale Lock | lastModified > timeout threshold | Override and acquire |

## Timeout Handling

Locks have a configurable timeout (default: 5 minutes) to prevent deadlocks from crashed agents.

If `lastModified` exceeds the timeout threshold, the lock is considered stale and can be forcibly acquired by another agent.

## Schema Validation

All coordination data structures are validated using Effect Schema (see `../hooks/schemas.ts`):

- `FileLock` - individual lock structure
- `FileLocks` - complete lock registry
- `ToolUseInput` - tool usage parameters
- `UserPromptInput` - user prompt data

## Error Handling

The coordination system handles:

1. **Concurrent writes** - Atomic file operations with retry logic
2. **Corrupted lock file** - Automatic recovery with backup
3. **Missing lock file** - Auto-creation with empty state
4. **Schema validation errors** - Graceful degradation with logging

## Best Practices

1. **Always check locks** before file operations
2. **Release locks promptly** after completing work
3. **Handle lock conflicts gracefully** with user feedback
4. **Set reasonable timeouts** based on task complexity
5. **Monitor lock file size** to prevent resource exhaustion

## Example Usage

### Acquiring a Lock (Pre-Tool-Use Hook)
```typescript
import { FileLock, FileLocks, decodeFileLocks, encodeFileLocks } from '../hooks/schemas'

const agentId = `agent_${randomId()}_${Date.now()}`
const filePath = '/path/to/file.ts'

// Read current locks
const locks = decodeFileLocks(JSON.parse(fs.readFileSync('file-locks.json', 'utf8')))

// Check if file is locked
if (locks[filePath] && locks[filePath].agentId !== agentId) {
  throw new Error(`File locked by ${locks[filePath].agentId}`)
}

// Acquire lock
locks[filePath] = {
  agentId,
  acquiredAt: new Date().toISOString(),
  lastModified: new Date().toISOString()
}

// Write back
fs.writeFileSync('file-locks.json', JSON.stringify(encodeFileLocks(locks), null, 2))
```

## Monitoring

To view active locks:
```bash
cat .claude/coordination/file-locks.json | jq
```

To clear all locks (use with caution):
```bash
echo '{}' > .claude/coordination/file-locks.json
```

## Future Enhancements

- Distributed lock management for multi-machine setups
- Lock priority system for critical operations
- Audit log for lock acquisition/release events
- Real-time lock status dashboard
- Automatic deadlock detection and resolution

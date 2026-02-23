# File Lock Enforcer Hook

PreToolUse hook for enforcing file locking in multi-agent Claude environments.

## Overview

The File Lock Enforcer prevents concurrent file modifications by multiple agents through a locking mechanism. When an agent attempts to write to a file, the hook checks if the file is already locked by another agent and either allows, denies, or acquires the lock accordingly.

## Files

- **file-lock-enforcer.sh** - Bash wrapper script (entry point)
- **file-lock-enforcer.ts** - Effect TypeScript implementation
- **../coordination/file-locks.json** - Lock state storage

## Installation

1. Install dependencies:
```bash
cd /Users/front_depiction/Desktop/Projects/claude-setup
npm install
```

2. Ensure the bash script is executable (already done):
```bash
chmod +x .claude/hooks/file-lock-enforcer.sh
```

3. Configure Claude to use the hook by adding to `.claude/settings.json`:
```json
{
  "hooks": {
    "preToolUse": ".claude/hooks/file-lock-enforcer.sh"
  }
}
```

## How It Works

### Input Format

The hook reads JSON from stdin:
```json
{
  "tool": "Write",
  "file_path": "/path/to/file.ts"
}
```

### Lock Decision Logic

1. **Same Agent** - If the file is locked by the current agent → Allow (exit 0)
2. **Different Agent** - If locked by another agent → Deny (exit 2) with error:
   ```json
   {
     "decision": "deny",
     "reason": "File locked by agent-67890 since 2025-11-10 14:23:15. Suggest coordination."
   }
   ```
3. **Not Locked** - Acquire lock, add comment header, update locks.json → Allow (exit 0)

### Lock File Format

**file-locks.json**:
```json
{
  "/absolute/path/to/file.ts": {
    "agentId": "agent-12345",
    "acquiredAt": "2025-11-10T14:23:15.123Z",
    "lastModified": "2025-11-10T14:23:15.123Z"
  }
}


## Configuration

### Environment Variables

- `AGENT_ID` - Current agent identifier (required, auto-generated if missing)
- `HOME` - Home directory for lock file location

### Monitored Tools

The hook monitors these write operations:
- `Write`
- `Edit`
- `NotebookEdit`

Read operations are not restricted.

## Testing

Test the hook manually:
```bash
# Set agent ID
export AGENT_ID="test-agent-123"

# Test with a write operation
echo '{"tool":"Write","file_path":"/tmp/test.ts"}' | .claude/hooks/file-lock-enforcer.sh

# Check exit code
echo $?  # 0 = allowed, 2 = denied, 1 = error
```

Or use the npm script:
```bash
npm run test:lock
```

## Exit Codes

- **0** - Operation allowed (no conflict or same agent)
- **1** - Internal error (JSON parsing, file system, etc.)
- **2** - Operation denied (file locked by different agent)

## Effect TypeScript Implementation

The TypeScript implementation uses Effect for:
- **Composable operations** - Using `Effect.gen` and `pipe`
- **Type-safe parsing** - Using `@effect/schema` for JSON validation
- **File system operations** - Using `@effect/platform` FileSystem
- **Error handling** - Effect's built-in error handling patterns

## Troubleshooting

### tsx not found

Install tsx globally or locally:
```bash
npm install -g tsx
# or use locally
npx tsx .claude/hooks/file-lock-enforcer.ts
```

### Lock file permissions

Ensure `.claude/coordination/` directory is writable:
```bash
mkdir -p .claude/coordination
chmod 755 .claude/coordination
```

### Agent ID conflicts

Each agent should have a unique `AGENT_ID`. Set it explicitly:
```bash
export AGENT_ID="agent-$(uuidgen)"
```

## Architecture

```
┌─────────────────┐
│  Claude Tool    │
│  (Write/Edit)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PreToolUse Hook │ (file-lock-enforcer.sh)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Effect TS      │ (file-lock-enforcer.ts)
│  Implementation │
└────────┬────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌───────┐  ┌──────────┐
│ stdin │  │ locks.json│
└───────┘  └──────────┘
    │          │
    └────┬─────┘
         ▼
   ┌──────────┐
   │ Decision │
   │ (0/1/2)  │
   └──────────┘
```

## License

Part of the claude-setup project.

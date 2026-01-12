### YYYY-MM-DD - Phase [N]: [Phase Name]

#### What Worked Well

1. **[Technique/Approach]**: [Specific success with evidence]
   - Example: "Using Effect.gen for sequential file operations reduced error handling complexity"

2. **[Tool/Pattern]**: [What made it effective]
   - Example: "Cross-platform path detection worked on first try using @effect/platform"

3. **[Decision]**: [Positive outcome]
   - Example: "Choosing OAuth over API key simplified the setup flow"

#### What Didn't Work

1. **[Problem]**: [What went wrong and why]
   - Example: "Initial approach to config detection used native fs, causing type issues"
   - Impact: [time lost, rework needed]
   - Lesson: [what to do differently]

2. **[Assumption]**: [Invalid assumption and consequence]
   - Example: "Assumed Claude config path was same on all Linux distros"

#### Prompt Refinements

**Original Prompt**:
```
Create a setup command for Supermemory
```

**Problem Encountered**:
- Too vague - unclear what options needed
- No error handling guidance
- No platform considerations

**Refined Prompt**:
```
Create a setup command for Supermemory MCP integration.

Requirements:
1. Options: --oauth (bool, default true), --api-key (optional string), --project (string, default "beep-effect")
2. Detect Claude config path across platforms:
   - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
   - Linux: ~/.config/claude/claude_desktop_config.json
   - Windows: %APPDATA%\Claude\claude_desktop_config.json
3. Read existing config, merge supermemory server entry, write back
4. Handle errors: ConfigNotFound, WriteError, ValidationError
5. Use Effect.gen, Console, FileSystem from @effect/platform

Success criteria:
- [ ] Builds without errors
- [ ] Tests pass
- [ ] Works on macOS (primary)
```

**Improvement Applied**: Added specific requirements, platform paths, error types, and success criteria.

#### Codebase-Specific Insights

1. **Pattern discovered**: [Pattern specific to beep-effect]
   - Example: "Existing CLI commands in tooling/cli/src/commands/sync.ts show exact FileSystem usage pattern"

2. **Dependency note**: [Important dependency behavior]
   - Example: "@effect/platform FileSystem.exists returns boolean Effect, not throwing"

3. **Testing insight**: [How to test effectively]
   - Example: "Can mock FileSystem layer for unit tests without touching real files"

#### Metrics

| Metric | Value |
|--------|-------|
| Time spent | [hours] |
| Files created | [count] |
| Files modified | [count] |
| Tests added | [count] |
| Errors encountered | [count] |

#### Open Questions Resolved

- [x] **Q**: Where does Claude Code store config on Linux?
  - **A**: `~/.config/claude/claude_desktop_config.json`

- [ ] **Q**: [Still open question]

#### Recommendations for Next Phase

1. [Specific recommendation based on learnings]
2. [Tool or approach to try]
3. [Risk to watch for]

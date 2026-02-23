# Claude Code - Opinionated Best Practices & Patterns

> **Curated recommendations, design patterns, and community wisdom**
>
> Last Updated: 2026-01-31
> Sources: 10+ official Claude Code documentation pages + examples

---

## TABLE OF CONTENTS

1. [Hook Design Patterns](#1-hook-design-patterns)
2. [When to Use Which Agent](#2-when-to-use-which-agent)
3. [CLAUDE.md Writing Tips](#3-claudemd-writing-tips)
4. [Plugin Organization](#4-plugin-organization)
5. [Skill Design Patterns](#5-skill-design-patterns)
6. [Permission Strategy](#6-permission-strategy)
7. [Performance & Context Management](#7-performance--context-management)
8. [Team Collaboration](#8-team-collaboration)
9. [Testing & Validation](#9-testing--validation)
10. [Common Anti-Patterns](#10-common-anti-patterns)

---

## 1. HOOK DESIGN PATTERNS

### 1.1 The "Validation Sandwich" Pattern

**When to use**: PreToolUse hooks that need to validate input before allowing execution.

**Structure**:

```python
#!/usr/bin/env python3
import json, sys, re

# 1. READ INPUT
input_data = json.load(sys.stdin)

# 2. EXTRACT CONTEXT
command = input_data.get("tool_input", {}).get("command", "")

# 3. VALIDATE
if not_valid(command):
    print("Reason for blocking", file=sys.stderr)
    sys.exit(2)  # Block

# 4. ALLOW
sys.exit(0)
```

**Why it works**: Clear separation of concerns; easy to test; fails fast.

### 1.2 The "Smart Logger" Pattern

**When to use**: You want detailed logging without cluttering Claude's context.

**Structure**:

```bash
#!/bin/bash
# PostToolUse hook

INPUT=$(cat)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="$CLAUDE_PROJECT_DIR/.claude/audit.jsonl"

# Append structured log
echo "$INPUT" | jq -c ". + {timestamp: \"$TIMESTAMP\"}" >> "$LOG_FILE"

# Return success without output (suppressOutput recommended)
echo '{"suppressOutput": true}'
exit 0
```

**Why it works**: Structured logs for analysis; doesn't pollute context; can be queried later.

### 1.3 The "Context Injector" Pattern

**When to use**: SessionStart/UserPromptSubmit hooks that need to add dynamic context.

**Structure**:

```bash
#!/bin/bash
# SessionStart hook

# Gather current state
ISSUES=$(gh issue list --limit 5 --json number,title)
RECENT_CHANGES=$(git log --oneline -5)

# Format for Claude
cat <<EOF
## Current Project State

### Open Issues
$ISSUES

### Recent Commits
$RECENT_CHANGES
EOF

exit 0
```

**Why it works**: Gives Claude fresh context without manual prompting; updates automatically.

### 1.4 The "Safety Net" Pattern

**When to use**: Protecting critical operations with confirmation.

**Structure**:

```python
#!/usr/bin/env python3
import json, sys

input_data = json.load(sys.stdin)
command = input_data.get("tool_input", {}).get("command", "")

DANGEROUS_PATTERNS = [
    (r"\brm\s+-rf\s+/", "Attempted to delete from root"),
    (r"DROP\s+DATABASE", "Attempted to drop database"),
    (r"git\s+push\s+--force\s+(origin\s+)?(main|master)", "Force push to main/master"),
]

for pattern, reason in DANGEROUS_PATTERNS:
    if re.search(pattern, command, re.IGNORECASE):
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "ask",
                "permissionDecisionReason": f"⚠️  {reason}. Confirm to proceed."
            }
        }
        print(json.dumps(output))
        sys.exit(0)

sys.exit(0)
```

**Why it works**: Catches mistakes before they happen; doesn't block legitimate uses; provides context.

### 1.5 The "Auto-Fix" Pattern

**When to use**: PostToolUse hooks that automatically improve output.

**Structure**:

```bash
#!/bin/bash
# PostToolUse: Edit|Write

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path')

# Only process TypeScript files
if [[ ! "$FILE_PATH" =~ \.tsx?$ ]]; then
    exit 0
fi

# Auto-format
npx prettier --write "$FILE_PATH" 2>/dev/null

# Auto-lint
npx eslint --fix "$FILE_PATH" 2>/dev/null

# Return success silently
echo '{"suppressOutput": true}'
exit 0
```

**Why it works**: Keeps code quality high automatically; no manual intervention; transparent.

### 1.6 Hook Design Principles

**DO**:
- ✅ Keep hooks fast (<5 seconds ideal)
- ✅ Use exit codes for simple cases
- ✅ Use JSON for complex control
- ✅ Log to files, not stdout
- ✅ Fail gracefully with clear errors
- ✅ Use `$CLAUDE_PROJECT_DIR` for paths
- ✅ Suppress output when not needed

**DON'T**:
- ❌ Block every operation (creates friction)
- ❌ Output verbose logs to stdout
- ❌ Use relative paths
- ❌ Assume cwd is project root
- ❌ Parse stdout with regex (use jq)
- ❌ Chain multiple blocking hooks (parallel execution makes order unpredictable)

---

## 2. WHEN TO USE WHICH AGENT

### 2.1 Decision Tree

```
Is this a quick lookup? (< 30 seconds)
├─ Yes → Main conversation
└─ No → Does it need to modify files?
    ├─ Yes → Is it exploratory or has clear requirements?
    │   ├─ Exploratory → general-purpose subagent
    │   └─ Clear requirements → Main conversation or custom agent
    └─ No → Is the output verbose?
        ├─ Yes → Explore subagent (read-only, fast)
        └─ No → Main conversation
```

### 2.2 Built-in Agent Use Cases

**Explore Agent** (Haiku, read-only):
- Finding unused imports across codebase
- Mapping dependency relationships
- Searching for security patterns
- Understanding project structure
- Generating file/directory summaries

**Why Explore**: Fast, cheap, keeps verbose output isolated from main conversation.

**General-purpose Agent** (Inherits, all tools):
- Complex refactoring across multiple files
- Implementing features with unclear requirements
- Multi-step operations (research → plan → execute)
- Tasks requiring both reading and writing

**Why general-purpose**: Full capabilities, isolated context for multi-turn work.

**Plan Agent** (Inherits, read-only):
- Reserved for `/plan` mode
- Don't create custom agents named "Plan"

### 2.3 Custom Agent Design Patterns

**Pattern 1: Domain Specialist**

```yaml
---
name: api-developer
description: Implement REST APIs following team conventions. Use when creating or modifying API endpoints.
tools: Read, Write, Edit, Bash, Grep, Glob
skills:
  - api-conventions
  - error-handling-patterns
---

You are an API development specialist. When implementing endpoints:

1. Follow REST conventions (resource-based URLs)
2. Use standard error response format
3. Include input validation
4. Add OpenAPI documentation
5. Write integration tests

Reference the preloaded skills for team conventions.
```

**When to use**: Domain-specific work with established patterns; preloaded skills provide guardrails.

**Pattern 2: Safety-Constrained Agent**

```yaml
---
name: db-reader
description: Execute read-only SQL queries for data analysis
tools: Bash
permissionMode: dontAsk
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/agents/validate-readonly.sh"
---

You are a data analyst with read-only database access.

Execute SELECT queries only. For analysis requests:
1. Write efficient queries with proper filtering
2. Format results clearly
3. Provide insights and recommendations

You cannot modify data. If asked, explain your read-only constraints.
```

**When to use**: Operations requiring tool restrictions beyond simple allow/deny lists.

**Pattern 3: Workflow Orchestrator**

```yaml
---
name: release-manager
description: Coordinate release process from testing to deployment
model: sonnet
permissionMode: acceptEdits
---

You are a release manager. For release requests:

1. **Verify**: Run full test suite
2. **Prepare**: Update version numbers, CHANGELOG
3. **Tag**: Create git tag with release notes
4. **Build**: Generate production artifacts
5. **Deploy**: Follow deployment checklist
6. **Verify**: Run smoke tests
7. **Announce**: Generate release announcement

After each step, confirm success before proceeding.
If any step fails, stop and report the issue.
```

**When to use**: Multi-step workflows with validation checkpoints.

### 2.4 Agent vs Main Conversation Guidelines

**Use Main Conversation when**:
- Task is < 5 minutes
- You need frequent back-and-forth
- Context from previous conversation matters
- Output is brief (< 1000 tokens)

**Use Subagent when**:
- Output is verbose (test results, logs, file listings)
- Task is self-contained
- You want to enforce specific constraints
- Exploration work can be summarized

**Use Chained Subagents when**:
- Multi-phase work with distinct stages
- Each phase can be summarized for next phase
- Example: research → design → implement

---

## 3. CLAUDE.md WRITING TIPS

### 3.1 Structure Template

```markdown
# Project: [Name]

## Overview
[1-2 sentence project description]

## Architecture
- **Frontend**: [Tech stack]
- **Backend**: [Tech stack]
- **Database**: [Tech]
- **Key patterns**: [e.g., event-driven, microservices]

## Development Workflow

### Setup
```bash
npm install
cp .env.example .env.local
```

### Common Commands
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run build` - Production build

## Code Conventions

### File Organization
- Components: `src/components/[domain]/[ComponentName].tsx`
- Tests: Co-located with source as `*.test.tsx`
- Types: `src/types/[domain].ts`

### Naming
- Components: PascalCase (e.g., `UserProfile`)
- Functions: camelCase (e.g., `fetchUserData`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`)

### Testing
- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for critical user flows

## Git Workflow
- Branch naming: `feature/[name]`, `fix/[name]`
- Commit format: Conventional Commits (feat, fix, docs, etc.)
- PR requirements: Tests pass, code review approval

## Resources
- API docs: `@docs/api.md`
- Design system: `@docs/design-system.md`
- Deployment: `@docs/deployment.md`
```

### 3.2 Best Practices

**DO**:
- ✅ Start with most important info (architecture, setup)
- ✅ Include actual commands (copy-pasteable)
- ✅ Document exceptions to conventions
- ✅ Link to detailed docs with @imports
- ✅ Keep root CLAUDE.md under 500 lines
- ✅ Use `.claude/rules/*.md` for detailed conventions
- ✅ Update when patterns change

**DON'T**:
- ❌ Include obvious info ("use descriptive names")
- ❌ Copy documentation that exists elsewhere (use @imports)
- ❌ Write essays (bullet points preferred)
- ❌ Include outdated information
- ❌ Duplicate info across files

### 3.3 Modular Rules Pattern

**Project structure**:

```
.claude/
├── CLAUDE.md                    # Overview + imports
└── rules/
    ├── typescript-style.md      # Language-specific
    ├── api-design.md            # Domain-specific
    ├── testing.md               # Process-specific
    └── frontend/                # Organized by area
        ├── component-patterns.md
        └── styling.md
```

**CLAUDE.md (orchestration)**:

```markdown
# Project Memory

## Quick Reference
- Setup: `npm install && npm run dev`
- Test: `npm test`
- Deploy: `npm run deploy:staging`

## Detailed Conventions
See `.claude/rules/` for in-depth guidelines:
- TypeScript style
- API design patterns
- Testing strategy
- Component patterns
```

**Path-specific rules** (`.claude/rules/api-design.md`):

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/routes/**/*.ts"
---

# API Design Conventions

## Endpoint Structure
- Use plural nouns: `/api/users`, not `/api/user`
- Versioning: `/api/v1/users`
- Nested resources: `/api/users/:id/posts`

## Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  }
}
```

## Request Validation
- Validate all inputs with Zod schemas
- Return 400 for validation errors
- Include field-level error details
```

**Why this works**: Root CLAUDE.md stays small; detailed rules load only when relevant; rules organized by concern.

### 3.4 Effective @import Usage

**Pattern: Domain Knowledge**

```markdown
# Database Conventions

For complete schema documentation, see @docs/database-schema.md

Quick reference:
- Users table: Handles authentication
- Posts table: Content with versioning
- Migrations: Always reversible
```

**Pattern: Personal Preferences**

```markdown
# Team Conventions
- @docs/team-coding-standards.md

# Personal Preferences
- @~/.claude/my-preferences.md
```

**Pattern: Shared Configuration**

```markdown
# Monorepo Setup

Global conventions:
- @.claude/shared-rules/typescript.md
- @.claude/shared-rules/testing.md

Package-specific:
- @packages/frontend/.claude/CLAUDE.md
- @packages/backend/.claude/CLAUDE.md
```

---

## 4. PLUGIN ORGANIZATION

### 4.1 Directory Structure Patterns

**Pattern 1: Simple Plugin** (single feature)

```
my-formatter/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── format.md
└── scripts/
    └── format-code.sh
```

**Pattern 2: Multi-Feature Plugin** (related commands)

```
deployment-tools/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── deploy-staging.md
│   ├── deploy-production.md
│   └── rollback.md
├── agents/
│   └── deployment-validator.md
├── hooks/
│   └── hooks.json
└── scripts/
    ├── deploy.sh
    ├── validate.sh
    └── rollback.sh
```

**Pattern 3: Domain Suite** (comprehensive functionality)

```
api-development-suite/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── create-endpoint.md
│   ├── generate-docs.md
│   └── validate-openapi.md
├── agents/
│   ├── api-developer.md
│   └── api-tester.md
├── skills/
│   ├── api-conventions/
│   │   └── SKILL.md
│   └── error-handling/
│       └── SKILL.md
├── hooks/
│   └── hooks.json
├── .mcp.json
└── scripts/
    ├── generate-client.js
    ├── validate-spec.py
    └── test-endpoints.sh
```

### 4.2 Plugin Naming Strategy

**Good Names** (descriptive, scoped):
- `acme-deployment-tools`
- `typescript-utilities`
- `database-helpers`
- `security-scanner`

**Bad Names** (too generic):
- `tools`
- `utils`
- `helpers`
- `plugin`

**Why**: Namespace collisions; unclear purpose; hard to search.

### 4.3 Plugin Version Strategy

**Version Bumping Rules**:

| Change Type | Bump | Example |
|------------|------|---------|
| Breaking change (remove command, change behavior) | MAJOR | `1.2.3 → 2.0.0` |
| New feature (add command, add agent) | MINOR | `1.2.3 → 1.3.0` |
| Bug fix (fix script, improve docs) | PATCH | `1.2.3 → 1.2.4` |

**Pre-release Versions**:
- Alpha: `2.0.0-alpha.1` (internal testing)
- Beta: `2.0.0-beta.1` (external testing)
- RC: `2.0.0-rc.1` (release candidate)

### 4.4 Plugin Documentation Pattern

**README.md template**:

```markdown
# [Plugin Name]

> One-line description of what this plugin does

## Features

- ✨ Feature 1
- ✨ Feature 2
- ✨ Feature 3

## Installation

```bash
claude plugin install plugin-name@marketplace
```

## Commands

### `/plugin-name:command-one`

Description of command one.

**Usage**: `/plugin-name:command-one [arg1] [arg2]`

**Example**: `/plugin-name:command-one value1 value2`

### `/plugin-name:command-two`

Description of command two.

## Configuration

Optional configuration in `.claude/settings.json`:

```json
{
  "env": {
    "PLUGIN_NAME_API_KEY": "your-key-here"
  }
}
```

## Troubleshooting

### Issue: Command not found
- Solution: Restart Claude Code after installation

### Issue: Script permission denied
- Solution: `chmod +x ~/.claude/plugins/plugin-name/scripts/*.sh`

## License

MIT
```

---

## 5. SKILL DESIGN PATTERNS

### 5.1 Reference Skills (Background Knowledge)

**Pattern**: Load automatically, provide conventions/context.

```yaml
---
name: api-conventions
description: REST API design conventions for this codebase. Apply when working with API endpoints.
---

## API Design Principles

### URL Structure
- Resources: Plural nouns (`/users`, not `/user`)
- Nesting: Max 2 levels (`/users/:id/posts/:id`)
- Actions: POST to collection, PUT to item

### Response Format
```json
{
  "data": { /* response payload */ },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

### Error Handling
- 400: Client error (invalid input)
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

### Validation
- Use Zod schemas
- Return detailed field errors
- Include error codes for client handling
```

**Why this works**: Loaded when relevant; provides guardrails; reduces back-and-forth.

### 5.2 Task Skills (Actionable Workflows)

**Pattern**: Invoke explicitly, execute multi-step process.

```yaml
---
name: create-endpoint
description: Create a new REST API endpoint with full boilerplate
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash
---

Create REST API endpoint for $ARGUMENTS:

1. **Route file** (`src/routes/$ARGUMENTS.ts`):
   - Define route handler
   - Add request validation (Zod schema)
   - Include error handling
   - Add OpenAPI documentation comments

2. **Service file** (`src/services/$ARGUMENTS.service.ts`):
   - Implement business logic
   - Add database queries
   - Include error handling

3. **Test file** (`src/routes/$ARGUMENTS.test.ts`):
   - Happy path tests
   - Validation error tests
   - Edge cases

4. **Documentation** (`docs/api/$ARGUMENTS.md`):
   - Endpoint description
   - Request/response examples
   - Error codes

5. **Register route** in `src/routes/index.ts`

After creation, run tests to verify.
```

**Why this works**: Comprehensive checklist; prevents forgotten steps; consistent implementation.

### 5.3 Generator Skills (Template-Based)

**Pattern**: Create files from templates with dynamic substitution.

```yaml
---
name: create-component
description: Generate React component with tests and stories
disable-model-invocation: true
---

Create React component $ARGUMENTS:

## Component File (`src/components/$ARGUMENTS.tsx`)

```tsx
import React from 'react';

export interface ${ARGUMENTS}Props {
  // Define props
}

export const $ARGUMENTS: React.FC<${ARGUMENTS}Props> = (props) => {
  return (
    <div className="$ARGUMENTS">
      {/* Implementation */}
    </div>
  );
};
```

## Test File (`src/components/$ARGUMENTS.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react';
import { $ARGUMENTS } from './$ARGUMENTS';

describe('$ARGUMENTS', () => {
  it('renders without crashing', () => {
    render(<$ARGUMENTS />);
    expect(screen.getByText(/something/i)).toBeInTheDocument();
  });
});
```

## Storybook (`src/components/$ARGUMENTS.stories.tsx`)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { $ARGUMENTS } from './$ARGUMENTS';

const meta: Meta<typeof $ARGUMENTS> = {
  component: $ARGUMENTS,
};

export default meta;
type Story = StoryObj<typeof $ARGUMENTS>;

export const Default: Story = {
  args: {},
};
```

After creation:
1. Add to `src/components/index.ts` barrel export
2. Run tests: `npm test $ARGUMENTS`
```

**Why this works**: Consistent structure; includes all artifacts; reduces boilerplate typing.

### 5.4 Dynamic Context Skills

**Pattern**: Fetch live data before skill execution.

```yaml
---
name: pr-summary
description: Summarize pull request changes and discussion
context: fork
agent: Explore
---

## PR Context
- Diff: !`gh pr diff`
- Status: !`gh pr view --json state,title,body`
- Comments: !`gh pr view --comments --json comments`
- CI Status: !`gh pr checks`

## Task

Analyze this pull request:

1. **Summary**: What does this PR change?
2. **Impact**: What areas of the codebase are affected?
3. **Discussion**: What are reviewers concerned about?
4. **CI**: Are there test failures or warnings?
5. **Recommendation**: Ready to merge, needs work, or requires discussion?

Provide a concise 3-5 sentence summary suitable for standup discussion.
```

**Why this works**: Always up-to-date context; no manual data gathering; can run repeatedly as PR evolves.

### 5.5 Skill Arguments Best Practices

**DO**:
- ✅ Use positional args for simple cases: `$0`, `$1`
- ✅ Document expected arguments in description/argument-hint
- ✅ Provide defaults when sensible
- ✅ Validate argument format in prompt
- ✅ Show example usage in skill content

**DON'T**:
- ❌ Require more than 3 positional arguments (use structured input instead)
- ❌ Parse complex structured data from arguments
- ❌ Assume argument order without documentation

**Example with validation**:

```yaml
---
name: migrate-data
description: Migrate data from source to target environment
argument-hint: "[source-env] [target-env]"
disable-model-invocation: true
---

Migrate data from $0 to $1.

**Validation**:
- $0 and $1 must be valid environments: dev, staging, production
- $0 cannot equal $1
- If $1 is production, require explicit confirmation

If validation fails, explain the issue and stop.

**Migration process**:
1. Verify source connection
2. Create target backup
3. Export data from source
4. Transform data (apply any schema changes)
5. Import data to target
6. Run integrity checks
7. Verify migration success

Report progress after each step.
```

---

## 6. PERMISSION STRATEGY

### 6.1 Layered Security Model

**Layer 1: Default Mode** (least restrictive)

```json
{
  "permissions": {
    "ask": ["Bash", "Write", "Edit"],
    "deny": [
      "Bash(rm -rf *)",
      "Read(.env*)",
      "Write(.env*)"
    ]
  }
}
```

**Use for**: Development, exploration, personal projects.

**Layer 2: Guided Mode** (balanced)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Grep",
      "Glob",
      "Bash(npm *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "ask": [
      "Write",
      "Edit",
      "Bash(git commit *)",
      "Bash(git push *)"
    ],
    "deny": [
      "Bash(rm *)",
      "Bash(curl *)",
      "Bash(wget *)",
      "WebFetch",
      "Write(.env*)",
      "Write(*.prod.*)"
    ]
  }
}
```

**Use for**: Team projects, shared codebases, learning environments.

**Layer 3: Restricted Mode** (most restrictive)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Grep",
      "Glob"
    ],
    "ask": [
      "Bash(npm test *)",
      "Bash(npm run lint *)"
    ],
    "deny": [
      "Write",
      "Edit",
      "Bash",
      "WebFetch"
    ]
  }
}
```

**Use for**: Production systems, audit/review, read-only analysis.

### 6.2 Progressive Permission Strategy

**Stage 1: Initial Setup** (first week)

```json
{
  "permissions": {
    "ask": ["*"],  // Prompt for everything
    "allow": ["Read", "Grep", "Glob"]
  }
}
```

**Goal**: Understand Claude's behavior, see what it tries to do.

**Stage 2: Refinement** (week 2-4)

```json
{
  "permissions": {
    "allow": [
      "Read", "Grep", "Glob",
      "Bash(npm *)",
      "Bash(git status)",
      "Bash(git diff *)"
    ],
    "ask": ["Write", "Edit", "Bash"],
    "deny": [/* patterns you've identified as risky */]
  }
}
```

**Goal**: Allow safe operations, prompt for potentially dangerous ones.

**Stage 3: Optimization** (ongoing)

- Monitor prompts via hooks (log every permission request)
- Analyze patterns (what gets approved 100% of the time?)
- Move approved patterns to `allow`
- Add newly discovered risks to `deny`

### 6.3 Domain-Specific Permission Profiles

**Frontend Development**:

```json
{
  "permissions": {
    "allow": [
      "Read", "Grep", "Glob",
      "Bash(npm *)",
      "Bash(yarn *)",
      "Write(src/**/*.{ts,tsx,css,scss})",
      "Edit(src/**/*.{ts,tsx,css,scss})"
    ],
    "ask": [
      "Write(package.json)",
      "Write(tsconfig.json)"
    ],
    "deny": [
      "Bash(rm *)",
      "Write(.env*)"
    ]
  }
}
```

**Backend/Database Work**:

```json
{
  "permissions": {
    "allow": [
      "Read", "Grep", "Glob",
      "Bash(npm *)",
      "Bash(psql -c 'SELECT *)",
      "Write(src/**/*.ts)"
    ],
    "ask": [
      "Bash(psql -c 'INSERT *)",
      "Bash(psql -c 'UPDATE *)",
      "Write(migrations/**/*)"
    ],
    "deny": [
      "Bash(psql -c 'DROP *)",
      "Bash(psql -c 'DELETE *)",
      "Bash(psql -c 'ALTER *)"
    ]
  }
}
```

**DevOps/Infrastructure**:

```json
{
  "permissions": {
    "allow": [
      "Read", "Grep", "Glob",
      "Bash(kubectl get *)",
      "Bash(docker ps *)"
    ],
    "ask": [
      "Bash(kubectl apply *)",
      "Bash(docker build *)"
    ],
    "deny": [
      "Bash(kubectl delete *)",
      "Bash(docker rm *)",
      "Bash(*--force*)"
    ]
  }
}
```

---

## 7. PERFORMANCE & CONTEXT MANAGEMENT

### 7.1 Context Budget Strategies

**Problem**: Claude's context window fills up, requiring compaction.

**Strategy 1: Aggressive Subagent Use**

```
Delegate to subagents early and often:
- File exploration → Explore agent
- Test runs → general-purpose agent
- Documentation generation → general-purpose agent

Result: Main conversation stays focused on high-level decisions
```

**Strategy 2: Skill Modularization**

```
Bad: One giant CLAUDE.md with all conventions (5000 lines)
Good: Modular .claude/rules/*.md (500 lines each, loaded on-demand)

Result: Only relevant rules load into context
```

**Strategy 3: Lazy Loading via @imports**

```markdown
# CLAUDE.md (small, always loaded)

Quick reference for common commands.

Detailed conventions:
- TypeScript: @.claude/rules/typescript.md
- Testing: @.claude/rules/testing.md
- API: @.claude/rules/api.md
```

**Result**: Detailed docs load only when Claude reads relevant files.

### 7.2 Auto-Compaction Tuning

**Default Trigger**: ~95% context usage

**Adjust with**: `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`

**Recommendations**:

| Workload | Threshold | Reasoning |
|----------|-----------|-----------|
| Exploratory (lots of reading) | 70-80% | Compact before filling up |
| Implementation (writing code) | 85-95% | Maximize context for coherent changes |
| Long sessions (multi-hour) | 60-70% | Prevent mid-task compaction |

**Monitor via**: Check transcript for compaction events:

```json
{
  "type": "system",
  "subtype": "compact_boundary",
  "compactMetadata": {
    "trigger": "auto",
    "preTokens": 167189
  }
}
```

### 7.3 Skills Context Management

**Pattern: Progressive Disclosure**

```yaml
---
name: api-design
description: API design patterns (use when working with endpoints)
---

# API Design Principles

## Core Conventions
- REST resources (plural nouns)
- Standard HTTP methods
- Consistent error format

## Detailed Guidelines

For complete specifications, see:
- Request validation: @.claude/rules/api-validation.md
- Error handling: @.claude/rules/api-errors.md
- Authentication: @.claude/rules/api-auth.md

## Quick Examples
[Include 2-3 brief examples here]
```

**Why**: Skill description always in context; full content loads on invoke; detailed docs via @imports.

---

## 8. TEAM COLLABORATION

### 8.1 Team Plugin Strategy

**Structure**:

```
your-repo/
├── .claude/
│   ├── settings.json          # Team defaults (committed)
│   ├── settings.local.json    # Personal overrides (gitignored)
│   ├── agents/                # Team agents (committed)
│   ├── skills/                # Team skills (committed)
│   └── plugins/               # Local plugin directory
│       └── team-tools/        # Custom team plugin (committed)
└── plugins/                   # Alternative: top-level (committed)
    └── deployment-tools/
```

**Workflow**:

1. **Team Lead**: Create plugin with common workflows
2. **Commit to repo**: Plugin is part of project
3. **Team members**: Plugin loads automatically (no `/plugin install` needed)
4. **Personal overrides**: Use `settings.local.json` for individual preferences

### 8.2 Shared CLAUDE.md Patterns

**Root CLAUDE.md** (team conventions):

```markdown
# Project Memory

## Team Conventions
- Code style: @.claude/rules/style.md
- Testing: @.claude/rules/testing.md
- Git workflow: @.claude/rules/git.md

## Common Commands
```bash
npm run dev    # Development server
npm test       # Run tests
npm run deploy # Deploy to staging
```

## Architecture
[High-level architecture diagram/description]

## Personal Preferences
Team members: Add personal preferences to CLAUDE.local.md (gitignored)
```

**CLAUDE.local.md** (personal preferences):

```markdown
# Personal Preferences

- I prefer verbose commit messages
- Always run tests before committing
- Use tabs instead of spaces (personal preference, not team standard)
- Preferred editor keybindings: vim
```

**Why**: Team standards in version control; personal quirks stay private.

### 8.3 Plugin Distribution Strategy

**Option 1: Git Submodule**

```bash
git submodule add https://github.com/acme/team-plugins .claude/plugins/team-tools
```

**Pros**: Versioned; updates controlled; works across projects.
**Cons**: Git submodule complexity.

**Option 2: Marketplace** (recommended for larger teams)

```json
// .claude/settings.json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/claude-plugins",
        "ref": "main"
      }
    }
  }
}
```

**Team members**: `/plugin install deployer@acme-tools`

**Pros**: Centralized; auto-updates; easy to discover.
**Cons**: Requires marketplace setup.

**Option 3: Committed Plugin** (simplest)

```bash
# In project root
mkdir -p .claude/plugins/team-tools
# ... create plugin files ...
git add .claude/plugins/team-tools
git commit -m "Add team tools plugin"
```

**Team members**: Plugin loads automatically (no action needed).

**Pros**: Zero setup; always available; simple.
**Cons**: Not reusable across projects.

### 8.4 Managed Settings for Organizations

**Use Case**: Enforce security policies across all developers.

**Example** (`/etc/claude-code/managed-settings.json`):

```json
{
  "permissions": {
    "deny": [
      "WebFetch",
      "Bash(curl *)",
      "Bash(wget *)",
      "Write(*.prod.*)",
      "Bash(*prod*)"
    ],
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedHooksOnly": true,
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "/usr/local/bin/company-command-validator.sh"
      }]
    }]
  },
  "strictKnownMarketplaces": {
    "approved-plugins": {
      "source": {
        "source": "github",
        "repo": "acme-corp/approved-plugins"
      }
    }
  }
}
```

**Result**: Cannot be overridden by users; enforced security policies.

---

## 9. TESTING & VALIDATION

### 9.1 Hook Testing Pattern

**Test script structure**:

```bash
#!/bin/bash
# test-hook.sh

HOOK_SCRIPT="./hooks/validator.sh"

test_case() {
    local name="$1"
    local input="$2"
    local expected_exit="$3"
    local expected_output="$4"

    echo "Testing: $name"
    output=$(echo "$input" | $HOOK_SCRIPT 2>&1)
    actual_exit=$?

    if [ $actual_exit -eq $expected_exit ]; then
        echo "✅ Exit code correct ($actual_exit)"
    else
        echo "❌ Exit code wrong (expected $expected_exit, got $actual_exit)"
    fi

    if echo "$output" | grep -q "$expected_output"; then
        echo "✅ Output contains expected text"
    else
        echo "❌ Output missing expected text"
        echo "Expected: $expected_output"
        echo "Got: $output"
    fi
}

# Test cases
test_case "Allow safe command" \
    '{"tool_input":{"command":"npm test"}}' \
    0 \
    ""

test_case "Block dangerous command" \
    '{"tool_input":{"command":"rm -rf /"}}' \
    2 \
    "Blocked"

echo "Tests complete"
```

**Run**: `./test-hook.sh`

### 9.2 Skill Testing Pattern

**Manual testing**:

```bash
# 1. Start Claude Code with test flag
claude --plugin-dir ./test-plugins

# 2. Invoke skill directly
/my-skill test-arg

# 3. Verify output
# - Check files created
# - Run tests
# - Verify no errors
```

**Automated testing** (in CI):

```bash
#!/bin/bash
# test-skill.sh

# Create test environment
mkdir -p /tmp/test-project
cd /tmp/test-project

# Initialize Claude Code (mock mode)
export CLAUDE_CODE_TEST_MODE=1

# Invoke skill programmatically
claude --plugin-dir ../plugins \
       --session-id test-session \
       --command "/create-component TestButton" \
       --exit-after-command

# Verify output
if [ -f "src/components/TestButton.tsx" ]; then
    echo "✅ Component created"
else
    echo "❌ Component not created"
    exit 1
fi

if grep -q "export const TestButton" src/components/TestButton.tsx; then
    echo "✅ Component content correct"
else
    echo "❌ Component content incorrect"
    exit 1
fi
```

### 9.3 Agent Testing Pattern

**Test subagent in isolation**:

```bash
# 1. Create test agent
cat > test-agent.md <<EOF
---
name: test-reviewer
description: Test code reviewer
tools: Read, Grep, Glob
---

Review the code and provide feedback.
EOF

# 2. Invoke via CLI
claude --agents '{"test-reviewer": {"description": "Test", "prompt": "Review code"}}' \
       --agent test-reviewer \
       --project-dir /tmp/test-project

# 3. Verify behavior
# - Check transcript for tool calls
# - Verify permissions respected
# - Ensure output quality
```

### 9.4 Integration Testing Pattern

**Full workflow test**:

```bash
#!/bin/bash
# integration-test.sh

set -e

echo "Setting up test environment..."
mkdir -p /tmp/test-project
cd /tmp/test-project
git init

echo "Loading plugins..."
claude --plugin-dir ../plugins \
       --session-id integration-test \
       --command "/create-component Button" \
       --exit-after-command

echo "Verifying files created..."
[ -f "src/components/Button.tsx" ] || exit 1
[ -f "src/components/Button.test.tsx" ] || exit 1

echo "Running tests..."
npm test Button

echo "Verifying lint..."
npm run lint src/components/Button.tsx

echo "✅ Integration test passed"
```

---

## 10. COMMON ANTI-PATTERNS

### 10.1 Hook Anti-Patterns

**❌ Anti-Pattern: Over-Blocking**

```python
# BAD: Blocks everything remotely dangerous
deny_patterns = [
    r"curl",
    r"wget",
    r"rm",
    r"mv",
    r"cp",
    r"chmod",
    r"git push",
    # ... 50 more patterns
]
```

**✅ Solution: Targeted Blocking**

```python
# GOOD: Block specific dangerous patterns
deny_patterns = [
    r"rm\s+-rf\s+/",           # Deleting from root
    r"curl.*\|.*bash",         # Pipe to shell
    r"git push --force origin (main|master)",  # Force push to main
]
```

**❌ Anti-Pattern: Logging to stdout**

```bash
# BAD: Pollutes Claude's context
echo "Command executed: $COMMAND"
echo "Timestamp: $(date)"
echo "Result: success"
```

**✅ Solution: Log to file**

```bash
# GOOD: Logs separately, returns clean JSON
{
    echo "$INPUT"
    echo "timestamp: $(date -u +%s)"
} >> "$CLAUDE_PROJECT_DIR/.claude/audit.log"

echo '{"suppressOutput": true}'
```

**❌ Anti-Pattern: Synchronous External API Calls**

```bash
# BAD: Slows down every tool use
response=$(curl -s https://external-api.com/validate)
```

**✅ Solution: Async or Local Validation**

```bash
# GOOD: Queue for async processing
echo "$INPUT" >> "$CLAUDE_PROJECT_DIR/.claude/validation-queue"
```

### 10.2 Agent Anti-Patterns

**❌ Anti-Pattern: Generic Agent Names**

```yaml
---
name: helper
description: Helps with various tasks
---
```

**✅ Solution: Specific, Descriptive Names**

```yaml
---
name: api-endpoint-creator
description: Creates REST API endpoints with full boilerplate (routes, services, tests, docs)
---
```

**❌ Anti-Pattern: No Tool Restrictions**

```yaml
---
name: data-analyzer
# All tools allowed by default
---
```

**✅ Solution: Principle of Least Privilege**

```yaml
---
name: data-analyzer
tools: Read, Bash(psql -c 'SELECT *)
permissionMode: dontAsk
---
```

**❌ Anti-Pattern: Subagent for Quick Tasks**

```
User: "List all TypeScript files"
Claude: [Spawns subagent]
```

**✅ Solution: Direct Execution**

```
User: "List all TypeScript files"
Claude: [Runs Glob directly]
```

### 10.3 CLAUDE.md Anti-Patterns

**❌ Anti-Pattern: Novel-Length Instructions**

```markdown
# CLAUDE.md (10,000 lines)

## TypeScript Conventions
[500 lines of TypeScript rules]

## Testing Conventions
[800 lines of testing guidelines]

## API Conventions
[1200 lines of API documentation]

[...]
```

**✅ Solution: Modular Rules**

```markdown
# CLAUDE.md (100 lines)

Quick reference:
- Setup: `npm install`
- Test: `npm test`

Detailed conventions: see .claude/rules/
```

**❌ Anti-Pattern: Vague Instructions**

```markdown
- Write good code
- Follow best practices
- Be consistent
```

**✅ Solution: Specific, Actionable Rules**

```markdown
- Component names: PascalCase (UserProfile, not userProfile)
- File location: src/components/[domain]/[ComponentName].tsx
- Tests: Co-located as [ComponentName].test.tsx
- Export: Named export only (no default exports)
```

### 10.4 Skill Anti-Patterns

**❌ Anti-Pattern: Mega-Skill**

```yaml
---
name: do-everything
description: Handles all development tasks
---

This skill can:
- Create components
- Write tests
- Deploy to production
- Fix bugs
- Write documentation
[... 50 more capabilities]
```

**✅ Solution: Single-Responsibility Skills**

```yaml
---
name: create-component
description: Generate React component with tests and Storybook story
---
```

**❌ Anti-Pattern: No Argument Validation**

```yaml
---
name: deploy
---

Deploy $ARGUMENTS to production.
```

**✅ Solution: Validate and Guard**

```yaml
---
name: deploy
---

Deploy $0 to $1.

**Pre-flight checks**:
- $0 must be a valid version tag (vX.Y.Z)
- $1 must be: staging, production, or production-eu
- If $1 is production, require confirmation
- Tests must pass (run: npm test)

If any check fails, stop and explain the issue.
```

### 10.5 Permission Anti-Patterns

**❌ Anti-Pattern: "Allow All" Development**

```json
{
  "permissions": {
    "allow": ["*"]
  }
}
```

**✅ Solution: Incremental Permissioning**

```json
{
  "permissions": {
    "allow": ["Read", "Grep", "Glob"],
    "ask": ["Write", "Edit", "Bash"]
  }
}
```

**❌ Anti-Pattern: Regex Overload**

```json
{
  "permissions": {
    "deny": [
      "Bash((rm|mv|cp|chmod|curl|wget|git|docker|kubectl|...))"
    ]
  }
}
```

**✅ Solution: Specific Patterns**

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf /)",
      "Bash(curl * | bash)",
      "Bash(git push --force * main)",
      "Bash(docker rm *)"
    ]
  }
}
```

---

## APPENDIX: QUICK REFERENCE

### Hook Decision Matrix

| Scenario | Hook Type | Exit Code | Output |
|----------|-----------|-----------|--------|
| Allow operation | PreToolUse | 0 | JSON: `permissionDecision: "allow"` |
| Block operation | PreToolUse | 2 | stderr: reason |
| Log for audit | PostToolUse | 0 | JSON: `suppressOutput: true` |
| Add context | UserPromptSubmit | 0 | Plain text or JSON |
| Auto-format | PostToolUse | 0 | (run formatter, return silently) |

### Agent Selection Matrix

| Task | Agent | Reason |
|------|-------|--------|
| Find all usages | Explore | Fast, read-only, isolated |
| Implement feature | Main | Back-and-forth, context matters |
| Run tests | general-purpose | Verbose output, isolated |
| Multi-file refactor | general-purpose | Complex, needs isolation |
| Quick lookup | Main | < 30 seconds, no isolation needed |

### Skill Pattern Matrix

| Purpose | `context` | `disable-model-invocation` | `user-invocable` |
|---------|-----------|---------------------------|-----------------|
| Background knowledge | (omit) | `false` | `true` |
| Manual workflow | (omit) | `true` | `true` |
| Auto-applied conventions | (omit) | `false` | `false` |
| Isolated task | `fork` | `true` | `true` |

### Context Budget Tips

| Approach | Savings | Trade-off |
|----------|---------|-----------|
| Use subagents | High | Less back-and-forth |
| Modular CLAUDE.md | Medium | Setup complexity |
| Lazy @imports | Medium | Requires file reads |
| Shorter skills | Low | Less comprehensive |
| Auto-compact early | N/A | May lose context |

---

**END OF OPINIONS DOCUMENT**

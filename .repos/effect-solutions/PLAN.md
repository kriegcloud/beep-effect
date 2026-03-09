# Effect Solutions - Project Plan

## Overview
Multi-purpose repository for Effect TypeScript best practices with multiple distribution/usage modes.

## Use Cases

### 1. Documentation Files (Markdown)
- Best practices for setting up Effect applications
- Reference material for developers
- Living documentation that stays current

### 2. Frontend Server
- Web interface to browse best practices
- Read/navigate documentation easily
- Hosted viewing experience

### 3. Automated Doc Validation (Cron Job)
- Runs via GitHub Actions
- Uses Claude Code to verify external links/docs still valid
- Opens issues/PRs when documentation outdated
- Keeps best practices current automatically

### 4. Docs CLI Distribution
- `bunx effect-solutions` is the single entry point for humans/agents
- `list` + `show` commands expose LM-friendly packets sourced from `packages/cli/resources`
- No separate skill artifacts—everything stays in the repository and updates via regular git changes
- Encourage teams to mention the CLI in `CLAUDE.md` / `AGENTS.md` so agents run it first

## Questions to Resolve
- Frontend framework choice?
- Cron frequency for validation?
- Which external sites to validate?
- Topic scope - which Effect areas deserve their own CLI packet?

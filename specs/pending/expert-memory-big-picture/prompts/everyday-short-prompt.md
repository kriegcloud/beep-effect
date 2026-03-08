# Everyday Short Prompt Template

## Usage
Use this for everyday tasks when you want the repo rules carried forward but do not want a long prompt.

Replace the placeholders and keep it terse.

## Copy/Paste Prompt
```text
Work in `/home/elpresidank/YeeBois/projects/beep-effect3`.

Use `$effect-first-development`.

Repo rules:

- Treat `/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4` as the source of truth for all Effect APIs.
- Reuse existing repo patterns before inventing a new one.
- Use `bun` for commands. Use `bun run --filter=@beep/{{PACKAGE_NAME}} <script>` when package-scoped work is appropriate.
- Keep JSDoc/docgen expectations in mind for touched exports.
- Run the narrowest relevant quality checks before finishing.
- Query Graphiti memory first if available, using the `beep-dev` group.

Task:

- Title: `{{TASK_TITLE}}`
- Objective: `{{TASK_OBJECTIVE}}`
- Success criteria: `{{SUCCESS_CRITERIA}}`
- Scope: `{{TARGET_FILES_OR_AREAS}}`
- Local references: `{{LOCAL_REFERENCES}}`
- Constraints: `{{CONSTRAINTS}}`

Do a quick local context pass before editing or answering. If Effect APIs are involved, verify them in `.repos/effect-v4` first.

In the final response, include:

- commands run and whether they passed
- exact local Effect v4 files consulted if any
- repo patterns reused
- any remaining risks or open questions
```

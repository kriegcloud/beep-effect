# Prompt Creator Prompt Template

## Usage
Use this when you want an agent to create or improve prompt artifacts for this repo.

Replace every placeholder and delete any line that does not apply.

## Copy/Paste Prompt
```text
Work in `/home/elpresidank/YeeBois/projects/beep-effect3`.

Your task is to create a high-quality prompt artifact for this repo, not to implement the underlying feature itself unless the task explicitly requires both.

Replace every `{{PLACEHOLDER}}` before starting.

Repo contract:

1. Reuse existing prompt and handoff styles in this repo before inventing a new structure.
2. If the prompt targets repo work, include the repo rules that matter:
   - use `$effect-first-development`
   - treat `.repos/effect-v4` as the Effect v4 source of truth
   - reuse existing repo patterns
   - use `bun` command conventions
   - preserve JSDoc/docgen expectations when code changes are involved
   - run relevant quality commands before claiming completion
3. Query Graphiti memory first if available, using the `beep-dev` group.
4. Read comparable local prompt artifacts before writing the new one.

Prompt artifact request:

- Title: `{{PROMPT_TITLE}}`
- Goal: `{{PROMPT_GOAL}}`
- Prompt type: `{{PROMPT_TYPE}}`
- Intended agent or session: `{{TARGET_AGENT_OR_SESSION}}`
- Output path: `{{PROMPT_ARTIFACT_PATH}}`
- Intended task class:
  - `{{INTENDED_TASKS}}`
- Required local references:
  - `{{LOCAL_REFERENCES}}`
- Comparable prompt artifacts to mirror:
  - `{{PROMPT_PATTERNS_TO_REUSE}}`
- Required placeholders:
  - `{{REQUIRED_PLACEHOLDERS}}`
- Output contract:
  - `{{OUTPUT_CONTRACT}}`
- Constraints:
  - `{{CONSTRAINTS}}`

Prompt-writing requirements:

1. Start by reading comparable local prompts and summarizing the structural patterns to reuse.
2. Choose the lightest prompt structure that still makes the target task reliable.
3. Make the prompt copy/paste-ready.
4. Use explicit placeholders only where they materially help the author customize the prompt.
5. Keep instructions concrete, operational, and repo-grounded.
6. If the prompt is for repo code work, require local Effect v4 verification instead of training-data recall.
7. If the prompt is for planning, ideation, or research instead of implementation, tune the output contract accordingly rather than blindly copying implementation instructions.

Final response expectations:

- show the prompt artifact path
- summarize the local prompt patterns reused
- explain why this prompt shape fits the requested task
- list any assumptions you had to make
```

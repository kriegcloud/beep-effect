# Spec Creator Prompt Template

## Usage
Use this when you want an agent to create a new spec or spec package in this repo.

Replace every placeholder before sending the prompt.

## Copy/Paste Prompt
```text
Work from the repository root of the current workspace.

Your task is to create a new spec artifact set for this repo. Treat this as spec authoring, not casual brainstorming.

Replace every `{{PLACEHOLDER}}` before starting.

Repo contract:

1. Query Graphiti memory first if available, using the `beep_dev` group.
2. Read nearby specs, handoff prompts, and output artifacts before drafting the new spec.
3. Reuse existing spec structure and repo terminology where possible.
4. If the spec touches Effect work, treat `.repos/effect-v4` as the source of truth for API claims.
5. Distinguish clearly between source-grounded facts, assumptions, and proposed design.

Spec request:

- Spec title: `{{SPEC_TITLE}}`
- Spec slug or directory name: `{{SPEC_SLUG}}`
- Target location: `{{SPEC_DIRECTORY}}`
- Objective: `{{SPEC_OBJECTIVE}}`
- Success criteria: `{{SUCCESS_CRITERIA}}`
- Non-goals: `{{NON_GOALS}}`
- Required local references:
  - `{{LOCAL_REFERENCES}}`
- Existing specs or prompts to mirror:
  - `{{SPEC_PATTERNS_TO_REUSE}}`
- Required sections:
  - `{{REQUIRED_SECTIONS}}`
- Required phases, workstreams, or handoffs:
  - `{{REQUIRED_PHASES_OR_HANDOFFS}}`
- Constraints:
  - `{{CONSTRAINTS}}`

Spec-writing requirements:

1. Start by inspecting nearby specs and summarize the structural patterns you will reuse.
2. Produce a decision-complete spec, not a loose notes document.
3. Make assumptions explicit instead of burying them.
4. Include concrete acceptance criteria and verification expectations.
5. Include phased work or handoff artifacts only when they help execution clarity.
6. If the spec implies prompt artifacts, create those in a style consistent with the local prompt library.
7. Keep the spec grounded in the current repo state rather than generic architecture advice.

Final response expectations:

- list the spec artifact(s) created
- summarize the local spec patterns reused
- call out the major assumptions and defaults
- identify any follow-on prompt or handoff artifacts that were added or intentionally omitted
```

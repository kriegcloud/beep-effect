# Spec Creator Prompt Template

## Usage
Use this when you want an agent to create a new initiative packet in this repo.

Replace every placeholder before sending the prompt.

## Copy/Paste Prompt
```text
Work from the repository root of the current workspace.

Your task is to create a new initiative packet for this repo. Treat this as initiative authoring, not casual brainstorming.

Replace every `{{PLACEHOLDER}}` before starting.

Repo contract:

1. Query Graphiti memory first if available, using the `beep_dev` group.
2. Read nearby initiative packets, handoff prompts, and output artifacts before drafting the new packet.
3. Reuse existing initiative structure and repo terminology where possible.
4. If the normative spec touches Effect work, treat `.repos/effect-v4` as the source of truth for API claims.
5. Distinguish clearly between source-grounded facts, assumptions, and proposed design.

Initiative request:

- Spec title: `{{SPEC_TITLE}}`
- Spec slug or directory name: `{{SPEC_SLUG}}`
- Target location: `{{SPEC_DIRECTORY}}`
- Objective: `{{SPEC_OBJECTIVE}}`
- Success criteria: `{{SUCCESS_CRITERIA}}`
- Non-goals: `{{NON_GOALS}}`
- Required local references:
  - `{{LOCAL_REFERENCES}}`
- Existing initiative packets or prompts to mirror:
  - `{{SPEC_PATTERNS_TO_REUSE}}`
- Required sections:
  - `{{REQUIRED_SECTIONS}}`
- Required phases, workstreams, or handoffs:
  - `{{REQUIRED_PHASES_OR_HANDOFFS}}`
- Constraints:
  - `{{CONSTRAINTS}}`

Initiative-writing requirements:

1. Start by inspecting nearby initiative packets and summarize the structural patterns you will reuse.
2. Produce a decision-complete packet, not a loose notes document.
3. Make assumptions explicit instead of burying them.
4. Include concrete acceptance criteria and verification expectations.
5. Include phased work or handoff artifacts only when they help execution clarity.
6. If the packet implies prompt artifacts, create those in a style consistent with the local prompt library.
7. Keep the packet grounded in the current repo state rather than generic architecture advice.

Final response expectations:

- list the initiative packet artifacts created
- summarize the local initiative patterns reused
- call out the major assumptions and defaults
- identify any follow-on prompt or handoff artifacts that were added or intentionally omitted
```

# Brainstorm Prompt Template

## Usage
Use this when you want an agent to brainstorm ideas, options, or directions without losing contact with the actual repo.

Replace every placeholder and delete any line that does not apply.

## Copy/Paste Prompt
```text
Work in `/home/elpresidank/YeeBois/projects/beep-effect3`.

This is a brainstorming session, but it must still be grounded in the actual repo and local constraints.

Replace every `{{PLACEHOLDER}}` before starting.

Grounding rules:

1. Query Graphiti memory first if available, using the `beep-dev` group.
2. Do a quick local context pass before proposing ideas:
   - inspect the relevant repo area
   - inspect comparable patterns or prior work
   - inspect `.repos/effect-v4` if the idea touches Effect APIs
3. Reuse existing repo patterns when possible.
4. Distinguish clearly between what already exists, what could be adapted, and what would be net-new.

Brainstorm request:

- Theme: `{{IDEA_THEME}}`
- Problem statement: `{{PROBLEM_STATEMENT}}`
- Target audience or stakeholder: `{{TARGET_AUDIENCE}}`
- Constraints:
  - `{{CONSTRAINTS}}`
- Evaluation axes:
  - `{{EVALUATION_AXES}}`
- Desired number of options: `{{OPTION_COUNT}}`
- Relevant local references:
  - `{{LOCAL_REFERENCES}}`

Output requirements:

1. Start with a short summary of the local context you inspected.
2. Generate multiple concrete options, not vague directions.
3. For each option, give the main upside, the main downside, the likely reuse path, and the main risk.
4. Recommend one path and explain why it wins under the stated constraints.
5. Call out any questions that would materially change the recommendation.

If the brainstorming area touches Effect v4 APIs, verify the relevant API shape against `.repos/effect-v4` before using it in proposals.
```

# P4: Ranked Candidate Inventory

## Status

**NOT_STARTED**

## Objective

Build a durable, evidence-backed inventory of stale, unused, duplicate, or low-value cleanup candidates.

## Candidate Loop Contract

1. Build or refine the ranked inventory.
2. Present one candidate at a time in descending confidence order.
3. Do nothing destructive until the user answers `yes`.
4. When the user approves a candidate, hand it to a fresh executor session using `prompts/CANDIDATE_EXECUTOR_PROMPT.md`.
5. After the executor cleanup finishes, run or record verification, make the candidate commit unless P0 overrides the default cadence, update the checklist, and stop for confirmation.
6. Record rejected or deferred candidates explicitly.
7. P4 closes only when the inventory is exhausted or the user explicitly ends the loop.

## Candidate Contract

Each candidate is required to include:

- `id`
- `path` or package/dependency name
- `category`
- `confidence`
- `evidence`
- `dependents_or_references`
- `script_or_ci_references`
- `tsconfig_or_alias_references`
- `generated_docs_or_inventory_impact`
- `historical_doc_policy`
- `managed_artifact_impact`
- `expected_value`
- `blast_radius`
- `recommended_action`
- `verification_commands`

## Candidate Decision Status Values

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`
- `REJECTED`

## Ranked Inventory

| Rank | Candidate ID | Category | Confidence | Decision | Notes |
|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | Populated during P4 |

## Approved Cleanup Log

| Candidate ID | Verification Summary | Commit | Notes |
|---|---|---|---|
| TBD | TBD | TBD | Populate during P4 |

## Deferred Or Unreviewed Candidates

| Candidate ID | Status | Notes |
|---|---|---|
| TBD | TBD | Populate if the user stops before exhausting the inventory |

## Exit Gate

P4 is complete only when the ranked inventory is durable, every approved candidate has verification, checklist, and commit evidence, and either the inventory is exhausted or the user explicitly ends the candidate loop.

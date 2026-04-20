# Graphiti Memory Protocol

## Purpose

Use Graphiti to retrieve relevant cross-session repo knowledge and to write back durable findings.

## Read Protocol

- prefer `search_memory_facts`
- use `group_ids: ["beep_dev"]` when the tool accepts arrays
- if the wrapper exposes `group_ids` as a string, pass the JSON array literal string `"[\"beep_dev\"]"`
- if the first query fails or returns nothing useful, try one shorter fallback query
- if that still fails, try `get_episodes`
- if Graphiti is unavailable, continue with repo-local fallback and record the exact failure text

## Write Protocol

Write back only durable findings such as:

- rule-surface discoveries
- migration decisions
- tricky capability gaps
- reliable performance findings
- reusable steering-evaluation lessons

Use:

- `group_id: "beep_dev"`
- `source: "text"`
- `source_description: "codex-cli session"`

## Reporting Rule

Whenever Graphiti materially informed a phase, record:

- the exact query
- whether results were useful
- the exact error text on failure
- whether repo-local fallback was used

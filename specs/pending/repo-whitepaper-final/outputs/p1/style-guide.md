# P1 Style Guide

## Voice and Tone

1. Use direct, technical language in architecture and methods sections.
2. Use concise decision framing in leadership-facing transitions.
3. Avoid promotional wording and unsupported superlatives.
4. Keep caveat language explicit and unambiguous.

## Audience Posture

- Primary audience is mixed executive and technical leadership.
- Explain impact and confidence boundaries, not only mechanism details.
- Preserve implementation maturity labels when discussing capabilities.

## Writing Rules

1. Use compact paragraphs, typically three to six sentences.
2. Keep section-level `Claim IDs` and `Evidence IDs` near section headers.
3. Preserve status labels when quoting maturity posture.
4. Distinguish `Fact`, `Inference`, and `Assumption` language explicitly.
5. Do not introduce external sources as normative claims.

## Required Disclosure Language

Include equivalent phrasing for active caveats:

- Deferred reliability carry `C-002` / `E-S03-005` remains open and explicitly tracked.
- D11 governance risks remain open by design under current gate posture.

## Terminology Controls

1. Use canonical terms from D03 and D12.
2. Do not collapse certainty tiers (`deterministic`, `type-system`, `llm-inferred`).
3. Do not collapse status labels (`implemented`, `specified`, `conceptual`).

## Formatting Conventions

1. One H1 per file.
2. Use S01-S10 as top-level manuscript sections.
3. Use numbered lists for ordered procedures.
4. Use tables for mappings, gate summaries, and review logs.

## Prohibited Patterns

1. Unsupported normative claims.
2. Omission of active caveats from risk sections.
3. Language that implies unresolved risks are closed.
4. Placeholder or draft-marker text in complete artifacts.

# Candidate Executor Prompt

You are executing exactly one approved candidate from `specs/pending/repo-cleanup-bloat-staleness/outputs/p4-ranked-candidate-inventory.md`.

## Required Actions

1. Read the cleanup README, checklist, and the approved candidate entry.
2. Reconfirm repo reality and the candidate's current references.
3. Remove only the approved candidate scope and its stale active references.
4. Preserve historical references unless the approved scope explicitly says otherwise.
5. Run the candidate's required verification commands plus any mandatory managed commands.
6. Make exactly one commit for the approved candidate unless `outputs/p0-planning-and-document-classification.md` explicitly overrides the default commit cadence.
7. Update `outputs/cleanup-checklist.md` with decision, cleanup status, verification, and commit reference.
8. Update `outputs/manifest.json` if the candidate changes P4 status or closes the loop.
9. Stop and wait for user confirmation before touching the next candidate.

## Non-Negotiable Rules

- Do not widen scope beyond the approved candidate.
- Do not silently delete adjacent candidates just because they look related.
- Do not skip the commit or verification record for an approved candidate unless the P0 output explicitly changes the rule.
- Do not push or merge.

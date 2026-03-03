# P2 Assumption Register

## Policy

1. Assumptions are allowed only where no D01-D12 evidence supports a statement.
2. Assumptions cannot be presented as normative claims.
3. Assumptions must include owner, resolution strategy, and status.
4. Open assumptions must appear in manuscript assumptions section.

## Register

| Assumption ID | Statement | Reason | Owner | Resolution Strategy | Status |
|---|---|---|---|---|---|
| A-001 | No corpus updates were introduced during the drafting window used for this packet. | Matrix and manuscript were built against a fixed D01-D12 snapshot on 2026-03-03. | Spec Orchestrator | Re-run validators and mapping sync if corpus changes. | open |
| A-002 | Publication distribution channels accept Markdown as canonical source with separately generated exports. | Export automation is outside this package scope. | Editorial Lead | Validate with destination channel owners during release packaging. | open |
| A-003 | Reviewer identities used in this packet satisfy the technical and editorial_compliance role split. | Dual-signoff policy is role-based, not org-chart based, for this execution cycle. | Release Owner | Replace with external named reviewers if governance policy changes. | open |

## Carry-Forward Caveats (Not Assumptions)

1. Deferred reliability carry `C-002` / `E-S03-005` is evidence-backed and remains open.
2. D11 governance risks are evidence-backed and remain open by design.

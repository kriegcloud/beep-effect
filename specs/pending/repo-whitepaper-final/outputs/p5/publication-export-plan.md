# P5 Publication Export Plan

## Objective

Define controlled conversion from canonical Markdown artifacts to stakeholder delivery formats while preserving section order, anchors, and annex link integrity.

## Canonical Sources

1. `outputs/p5/whitepaper-final.md`
2. `outputs/p5/evidence-annex.md`
3. `outputs/p5/publication-gates.json`
4. `outputs/p6/final-signoff-summary.md`

## Export Targets

1. PDF for distribution and archive.
2. Editable DOCX-equivalent for legal/editorial workflow.

## Export Checklist

| Step | Owner | Input | Output | Status |
|---|---|---|---|---|
| Validate publication gates | Release Owner | `publication-gates.json` | gate pass confirmation | complete |
| Normalize heading and anchor formatting | Editorial Lead | `whitepaper-final.md` | normalized markdown | complete |
| Generate PDF from canonical markdown | Release Owner | normalized markdown | final PDF export artifact | complete |
| Generate editable document | Editorial Lead | normalized markdown | editable document export artifact | complete |
| Verify annex links and section order | Compliance Reviewer | PDF + editable doc + annex | formatting validation record | complete |
| Attach signoff metadata and archive packet | Spec Orchestrator | final outputs + signoff summary | archive-ready publication packet | complete |

## Acceptance Criteria

1. Exported outputs preserve S01-S10 order and heading hierarchy.
2. Claim/evidence anchor lines are preserved in export outputs.
3. Annex references remain intact and navigable in both formats.
4. Release packet includes technical and editorial_compliance signoff metadata.

## Notes

Automated converter details remain implementation-specific and are intentionally excluded from this governance artifact. This plan captures control requirements, ownership, and acceptance conditions.

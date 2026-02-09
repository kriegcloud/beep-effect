# P0 Decisions Changelog

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Purpose**: prevent silent drift in locked contracts  

## Entries

### 2026-02-09

- Created changelog file and established no-drift protocol.
- Updated `outputs/P0_DECISIONS.md`:
  - Marked D-01, D-02, D-03, D-04, D-05, D-09, D-10, D-11, D-13 as `LOCKED` based on already-stated spec intent.
  - Converted remaining items to `PROPOSED` with explicit rationale and added P0 exit checklist.

- Tightened and locked additional decisions:
  - Locked D-06 to hash the persisted document payload (`sha256(canonicalJson({ title, content, metadata }))`) to preserve evidence-offset determinism.
  - Locked D-07 to strict unique forever on the mapping (tombstone + resurrect).
  - Locked D-08 to plan/implement a dedicated `relation_evidence` table as the relation evidence-of-record.
  - Locked D-12 (MVP) to single-node durable workflow topology.
  - Locked D-14 (target) to RLS + filters, phased in after MVP with cross-org tests required immediately.
  - Locked D-15 (MVP) to safe-buttons-only (approved RPC/tools; no free-form executable SQL/code).
  - Locked D-16 (MVP) to prompt minimization (extraction may use raw content; meeting prep/Q&A uses slices + citations).
  - Added D-17 (PROPOSED) output disclosure policy (evidence-cited disclosure vs redaction/role-based).

- Added offset determinism decisions/contracts:
  - Added D-18 (LOCKED) offset drift / evidence pin strategy (pin to doc version + offsets).
  - Added C-05 (LOCKED) offset drift invariant contract (offset unit + version pin rules).

- Locked C-02 as canonical Evidence.List contract and explicitly reconciled R8 vs R12 evidence shapes:
  - Evidence.List now requires `documentVersionId` and a canonical `source` discriminator fields (mentionId/relationEvidenceId/meetingPrepBulletId).
  - UI must not read RDF provenance or JSONB evidence directly.

- Locked D-17 (MVP) output disclosure policy:
  - Allow disclosure only when evidence-cited and necessary; otherwise redact/minimize.
  - Require a compliance-safe disclaimer and avoid guarantees in meeting-prep output.

# Phase 2 — External grounding: signature + dms + notes + corpus (21)

Corpora: `~/YeeBois/research/{digital_signature_stuff,dms_stuff,meeting_notes_ai}`,
`~/data-home/oppold-corpus`. Cited by reference. The signature + dms corpora are
both **Box**-centric (Box content store + Box Sign e-signature); notes is a
vendor/dev-ecosystem comparison; the oppold corpus is read **structure-only** (no
client content into this public tree).

## A. Adopted modeling decisions (→ `DECISIONS.md`), each grounded

| ID | Decision | Grounds | Source (by reference) |
|---|---|---|---|
| **G11** | **`Attestation` / `SignatureRequest` VO** — participants as a tagged union on `role` (`signer`/`approver`/`final_copy_reader`), a status lifecycle tagged union (`draft`/`sent`/`viewed`/`signed`/`declined`/`completed`/`expired`/`cancelled`), signer order (sequential/parallel), expiration + reminders, and a link to the signed artifact carrying `Sha256` content hash + `Ed25519Signature` — **wires the unused `primitives.ts` substrate** | N6, kernel R6, P8 | `digital_signature_stuff/repos/box-sign-copilotkit-ai-agent` (`ParticipantRole`, `SignRequestCreateSigner`, request status/options); Box Sign API |
| **G12** | **Document/version model with soft-delete-as-trash** — file/version/metadata-template shape; `trash` = recoverable soft-delete (restore), validating kernel R1; **typed metadata templates** replace `UnknownRecord` document metadata | P6, P2, R1 | `dms_stuff/repos/BOX`, `box-ui-elements` (Box file/version/trash/metadata-template model) |
| **G13** | **Capture-artifact + segment provenance** — a capture artifact (transcript/recording) carries per-speaker, sub-second-**timestamped** segments + a capture lifecycle (`created`/`in_progress`/`media_ready`/`deleted`) + HMAC-signed payload integrity; enriches `Message`/`Turn`/`EmailArtifact` with speaker + time + integrity | P8, workspace W4/W6 | `meeting_notes_ai/...research.md` (Nylas `notetaker.*` lifecycle webhooks; Vexa per-speaker WS segments; screenappai HMAC-SHA256 signed webhooks) |
| **G14** | **Real-corpus hierarchy validation** — the firm corpus is organized **client → matter → document** with `restore`/`organize`/`enrich` manifests + a DuckDB catalog; validates the party→matter→document aggregate hierarchy (P3/N3) and the lineage/manifest (provenance-event) need | P3, N3, law L5/L6 | `~/data-home/oppold-corpus/{catalog,ops}` *structure only* (`*-manifest.jsonl`, `corpus.duckdb`) — **no client content read** |

## B. Cross-corpus convergence (the strongest signal)

Three independent corpora converge on the same shape this initiative already
identified as missing:
- **Versioned, never-overwrite, attributable records** — law (agentmemory G1, mike
  G2), dms (Box version+trash G12), corpus (enrich/organize manifests G14). →
  confirms kernel **R1 soft-delete + G1 bitemporal + N4 lifecycle supersession**.
- **Role-typed participants + status lifecycle** — Box Sign participants/status
  (G11) mirrors workspace's needed `ApprovalDecision` union (N5) and the
  `Principal`/`Membership` role model. → one tagged-union-with-role+status pattern
  serves approval, signature, and membership.
- **Provenance/integrity on artifacts** — content hashing (G10), signature (G11),
  HMAC capture (G13). → confirms wiring `Sha256`/`Ed25519Signature` (kernel R6).

## C. Rejected / deferred (with WHY)
- **Box / meeting-notetaker as integrations** (sync clients, MCP servers, bot
  dispatch, vendor selection) — out of scope: drivers/capabilities, not domain
  language. Belongs to `goals/box-driver` + a capture-capability packet.
- **DuckDB catalog / ingestion-pipeline mechanics** (oppold) — out of scope:
  ingestion tooling, not domain modeling. Adopt only the *entity hierarchy* it validates.

## D. Phase 2 verdict
All six corpora mined (paced, main-loop). The external grounding **confirms the
Phase-1 audit and supplies concrete shapes** for the grounded questions: N6
(attestation, G11), N3/P3 (legal vocabularies, G7/G8), N8 (claim body SPO + edge,
§20C + G1/G4), R3/P9 (temporal validity, G9), P6 (soft-delete/version, G2/G12),
P8 (content-addressing + integrity, G10/G11/G13). No external source contradicted
a Phase-1 recommendation; several strengthened it. Ready for Phase 3 shape/decompose.

# Phase 1 Audit — `workspace` slice (13)

Most entities (10) of any slice; bimodal maturity. **The conversational core
(`Turn`/`Message`/`Thread`) is the best aggregate modeling in the repo; the
candidate/approval/artifact entities are fixture-seed blobs.** Citations
`file:line` under `packages/workspace/domain/src/`.

## 1. Strong half — conversational aggregate (emulate)

| Entity | Highlights | Cite |
|---|---|---|
| `Turn` | **real aggregate**: `items: TurnItems` (tagged union `TurnItem` = Message/ToolCall/ToolResult/ArtifactRef/Activity items via `LiteralKit.mapMembers` + `S.toTaggedUnion("itemType")`), `parentTurnId` (**branching lineage**), typed `threadId`, `turnIndex: NonNegativeInt`; typed refs (`MessageId`/`EmailArtifactId` same-slice; `ActivityId` cross-slice to epistemic) | `entities/Turn/Turn.model.ts:102-205` |
| `Message` | `content: Document` (**`@beep/md` rich text, schema-first**), `role: MessageRole` (LiteralKit system/user/assistant/agent/tool), typed `threadId`/`turnId` | `entities/Message/Message.model.ts:65-95` |
| `Thread` | `title: NonEmptyString`, typed `workspaceId` | `entities/Thread/Thread.model.ts:29-49` |

Gaps even here: `ToolCallItem.payload`/`ToolResultItem.payload` are `UnknownRecord`
(untyped tool I/O); `Thread` has no `status`/`archivedAt`/`lastActivityAt`.

## 2. Weak half — candidate / approval / artifact (fixture-seed blobs)

| Entity | Domain fields | Critical gaps |
|---|---|---|
| `ApprovalGate` `entities/ApprovalGate/ApprovalGate.model.ts:33-37` | `decision: ApprovalDecision`, `lifecycle: CandidateLifecycle`, `snapshot: UnknownRecord`, `fixtureKey` | **`ApprovalDecision = ["pending"]` only** `values/ApprovalDecision/ApprovalDecision.model.ts:25` — the product's core approval gate **cannot express approved/rejected/changes-requested**; no `approverPrincipal`, no `decidedAt`, no `reason`/`rationale`, no typed link to the candidate it gates |
| `CandidateTask` / `CandidateProject` / `CandidateDraft` (identical shape) | `lifecycle: CandidateLifecycle`, `snapshot: UnknownRecord`, `fixtureKey` | **candidate body is `UnknownRecord`**; `CandidateLifecycle = ["candidate"]` only `values/CandidateLifecycle/CandidateLifecycle.model.ts:25`; no typed link to source turn/thread/approval |
| `ContextPacket` `entities/ContextPacket/ContextPacket.model.ts:32-35` | `snapshot: UnknownRecord`, 2× fixtureKey | opaque body; no typed contents/provenance |
| `EmailArtifact` `entities/EmailArtifact/EmailArtifact.model.ts:32-40` | `body:String`, `subject:String`, `from:UnknownRecord`, `to:Array(UnknownRecord)`, `receivedAt:String`, `sourceSpans:Array(String)`, 2× fixtureKey | `from`/`to`→typed `EmailContact` VO (with `Email` VO); `receivedAt:String`→`DateTimeFromMillis`; `sourceSpans:String[]`→`TextAnchor[]`; `body`→non-empty |
| `Workspace` `entities/Workspace/Workspace.model.ts:32-35` | `name:String`, `organizationFixtureKey:String`, `ownerPrincipalFixtureKey:String`, `fixtureKey` | `organizationFixtureKey`→typed `OrganizationId`; `ownerPrincipalFixtureKey`→`Principal`; `name`→`NonEmptyString`; no `status`/lifecycle |

## 3. The two repo-wide anti-patterns this slice exposes

**(a) `snapshot: UnknownRecord` untyped-body pattern.** Appears across
`ApprovalGate`, `CandidateTask`, `CandidateProject`, `CandidateDraft`,
`ContextPacket` (workspace) and `CandidateClaim`, `Activity` (epistemic). The
candidate work products — the things the human approves — are opaque blobs.
**This is the highest-volume schema-first violation in the repo.**

**(b) Placeholder lifecycle divergence.** `CandidateLifecycle = ["candidate"]`
(workspace) is a separate, single-state vocabulary from epistemic's 4-state
`ClaimLifecycle` and from `ApprovalDecision = ["pending"]`. Three lifecycle/decision
vocabularies, all stubs, none reconciled — yet the product spine is one
candidate→approval→authoritative flow.

## 4. Cross-cutting workspace gaps (rubric-scored)

| # | Proposal | Strategy | Rubric (1/2/3/4) | Recommend |
|---|---|---|---|---|
| W1 | Real `ApprovalDecision` tagged union (pending/approved/rejected/changes_requested) + `approverPrincipal` + `decidedAt` + `reason` on `ApprovalGate` | matchable variants + provenance | ✔/✔✔/✔/✔ | **Adopt — top priority (product spine)** |
| W2 | Reconcile the candidate/approval lifecycle vocabularies into one shared model (relate to `ClaimLifecycle`) | shared-kernel + matchable variants | ✔/✔✔/✔/✔ | **Adopt — needs cross-slice decision** |
| W3 | Replace `snapshot: UnknownRecord` with typed candidate bodies (`CandidateTaskBody`, `CandidateDraftBody`, …) | schema-first | ✔/✔✔/✔/✔ | **Adopt (repo-wide pattern, §3a)** |
| W4 | `EmailContact` VO (`Email` + display name) for `from`/`to`; `receivedAt`→`DateTimeFromMillis`; `sourceSpans`→`TextAnchor[]` | value objects + provenance | ✔/✔/✔/✔ | **Adopt** |
| W5 | `Workspace` typed refs (`OrganizationId`, `Principal`) replacing fixtureKeys; `name`→non-empty | identity composition | ✔/✔✔/✔/✔ | **Adopt** |
| W6 | Type `ToolCallItem`/`ToolResultItem` payloads (or a typed tool-IO envelope) | schema-first | ✔/△/✔/✔ | **Adopt selectively** |
| W7 | `.errors.ts` (e.g. `ApprovalOutOfLifecycle`, `CandidateAlreadyDecided`) | tagged errors | ✔/✔/✔/✔ | **Adopt** |
| W8 | `Thread` lifecycle (`status`/`archivedAt`/`lastActivityAt`) | temporal + variants | ✔/△/✔/✔ | **Adopt selectively** |

## 5. Open questions surfaced (→ `DECISIONS.md`)
- NEW (spine-critical): one unified candidate/approval lifecycle, or per-surface
  vocabularies that *relate to* `ClaimLifecycle`? (W2) — cross-slice decision.
- NEW: do candidate bodies (`snapshot`) get one typed shape per candidate kind, or
  a shared `CandidateBody` tagged union? (W3)
- Q6 aggregate roots → **`Turn` and `Thread` are aggregate roots** (Turn already
  composes typed items); confirm `Workspace` as the tenancy aggregate.
- Reuse: `Turn`'s `TurnItem` tagged-union + typed-ref composition is the template
  for law-practice/epistemic relationship modeling.

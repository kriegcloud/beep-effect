# Gold-intake research note: Turn sibling-variant `branchIndex` (2026-06-29)

> Provenance ledger (nugget -> upstream repo + license, external research, in-repo bricks): [`SOURCES.md`](./SOURCES.md).

Non-invasive Case-A extend note. The `workspace-thread-domain` packet is
`completed-retained`; this note records a forward-looking, additive
opportunity for the goal owner. It does **not** edit `SPEC.md`, `PLAN.md`,
`GOAL.md`, phases, or scope.

## Source

- Gold nugget **`LegalEase#7`** (repo `LegalEase`, recommendation **adopt**,
  priority **P2**) — "Conversation branching via parent_id + branch_index
  tree" — `LegalEase/backend/models.py:40-52`.
- Routing cluster **"Conversation branching (branchIndex sibling ordering)"**
  in `explorations/_gold-intake/routing.json`: route `extend-goal`,
  `primaryTarget: goals/workspace-thread-domain`, secondary
  `packages/workspace/domain`, wave P2, theme `agent-memory`.
- Synthesis context: `explorations/_gold-intake/GOLD_SYNTHESIS.md` →
  section **"### Agent memory & learning"** → subsection **"Conversation
  branching via parent_id + branch_index tree"** (lines ~861-869; theme
  paragraph at line 787).

## What `goals/workspace-thread-domain` already covers

The packet already shipped the conversation spine and the *lineage* half of
branching:

- `SPEC.md` Constraints: "Turn = aggregate with ordered tagged-union items …
  Branching = parent-turn lineage; the proof's soft-truncate is the
  degenerate single-branch rendering." Acceptance criterion: "Thread
  branching (parent-turn lineage) round-trips."
- `packages/workspace/domain/src/entities/Turn/Turn.model.ts` already defines
  `Turn` (`BaseEntity.Class`) with:
  - `parentTurnId: S.OptionFromNullOr(WorkspaceIdentity.TurnId)` — persisted
    `parent_turn_id` with a btree index (the lineage edge).
  - `turnIndex: NonNegativeInt` — persisted `turn_index`, the turn's
    **position in the linear thread sequence**.
  - `threadId`, `items` (ordered `TurnItem` tagged union).
- `packages/workspace/tables/.../Turn.table.ts`, the `db-admin` migration, and
  the PGlite branch round-trip proof
  (`history/2026-06-13-workspace-thread-entities.md`) are landed and green.
- Read/timeline surfaces that walk lineage already exist:
  `packages/workspace/use-cases/src/aggregates/Thread/ThreadTimeline.ts` and
  `.../ThreadStore.ts`; repo at
  `packages/workspace/server/src/aggregates/Thread/ThreadStore.repo.ts`.

So this is an **extend, not a rebuild**: the parent-turn tree exists; only the
sibling-variant discriminator is missing.

## Net-new this contributes

- **A `branchIndex` sibling-variant discriminator on `Turn`** (`LegalEase#7`).
  Today `parentTurnId` records *which* turn a turn descends from, but two
  edit/regeneration variants of the *same* turn would both carry the *same*
  `parentTurnId` with **no field to order or distinguish them**. `turnIndex`
  does not fill this gap — it is the linear position in the thread, not a
  sibling index under a shared parent. A `branchIndex` (NonNegativeInt,
  default `0`) lets multiple children of one `parentTurnId` co-exist and be
  stably ordered as alternate-history branches (`LegalEase#7`).
- **Distinguishable regeneration/edit variants** (`LegalEase#7`). This mirrors
  the now-standard message-tree branching model: editing or regenerating
  inserts a new node sharing the same parent, the original stays in place, and
  a sibling navigator selects which branch is "current" — the model never sees
  a sibling branch's contents. Adopted by ChatGPT, LibreChat, Nodea, and
  LangChain's branching-chat surface. [^cb] [^nodea] [^lc]
- **A structural home for multiple candidate-extraction attempts**
  (`LegalEase#7`, theme `agent-memory`). The synthesis frames `branchIndex` as
  letting several candidate or regenerated turns co-exist as branches *before*
  a downstream gate selects one. This is a structural ordering capability only;
  see Cautions for the boundary against this packet's candidate-gating
  Non-Goal.

## Recommended integration (non-invasive)

Folding this in is a small additive change — no SPEC rewrite required. Suggested
shape for the owner to evaluate as a follow-up PR or a tiny extend packet:

1. **Domain** (`packages/workspace/domain/src/entities/Turn/Turn.model.ts`):
   add `branchIndex: NonNegativeInt` to `fields` (default `0` where the schema
   default is safe) and a matching `EntitySchema.persist.int({ columnName:
   "branch_index", indexHints: [...] })` descriptor. Reuse the `NonNegativeInt`
   already imported from `@beep/schema` — same pattern as the existing
   `turnIndex`. Consider a composite index intent on
   `(parent_turn_id, branch_index)` for sibling-ordered reads.
2. **Tables + migration**: regenerate the `Turn.table.ts` column and add a
   `db-admin` migration adding `branch_index` (NOT NULL DEFAULT 0). Because the
   column is back-fillable with a constant default, this stays an additive,
   PGlite-safe migration consistent with the packet's "migrations apply
   cleanly against PGlite" gate.
3. **Read surface (optional, later)**: `ThreadTimeline.ts` /
   `ThreadStore.repo.ts` are the natural consumers if/when the goal owner wants
   sibling-aware traversal (select active branch, list siblings under a
   parent). No change needed to land the field itself.
4. **Sequencing**: keep this behind the owner's call — the packet is
   `completed-retained`, so this is a *new* increment, not a reopen of P0-P3.

## Cautions

- **Reimplement, do not copy (licensing).** `LegalEase` is an external repo and
  its license is unverified here. The nugget is a 2-line SQLAlchemy/Python
  pattern (`parent_id` self-FK + `branch_index` int); treat it as a *pattern*
  and re-express it schema-first in Effect (`BaseEntity.Class` +
  `EntitySchema.persist`). Do not port code.
- **Respect the candidate-gating Non-Goal.** `SPEC.md` Non-Goals: "No
  candidate-state gating of thread content: turns persist as authoritative
  conversational record; proposal blocks (deferred packet) route through
  `ProposeCandidateOutputSet`." `branchIndex` is **structural sibling
  ordering**, not a candidate/approval mechanism. The synthesis' "candidate
  attempts as branches" framing must stay on the structural side of that line —
  do not let `branchIndex` become an approval-state field; that lifecycle lives
  in the epistemic claim-gate / deferred proposal packet.
- **Do not conflate `turnIndex` and `branchIndex`.** `turnIndex` = position in
  the linear thread; `branchIndex` = which variant among siblings sharing a
  `parentTurnId`. Document both clearly to avoid a future ambiguity bug.
- **No locked-decision conflict.** The Decision Log (2026-06-12) endorses
  "thread branching" via parent-turn lineage; `branchIndex` is purely additive
  and consistent with it — it refines, rather than contradicts, the locked
  decision. Soft-truncate single-branch rendering remains the degenerate case
  (`branchIndex = 0` everywhere).
- **Completed-retained.** This note is advisory; it neither reopens phases nor
  changes status, scope, or the manifest's phase/lifecycle fields.

[^cb]: Coding Beauty — "The genius algorithm behind ChatGPT's most powerful UI
    feature" (conversation branching as a parent-pointer message tree;
    edit/regenerate creates a sibling branch, original preserved).
    https://codingbeautydev.com/blog/chatbot-conversation-branching/
[^nodea]: Nodea — "Branching AI Chat: The Complete Guide to Non-Linear
    Conversations" (data model: `nodes` table where every node has a
    `parent_id`; rendered conversation is the root→selected-node path).
    https://nodea.ai/blog/branching-ai-chat-guide
[^lc]: LangChain Docs — "Branching chat" (sibling branches under a shared
    parent; the model never sees a sibling branch's contents).
    https://docs.langchain.com/oss/python/langchain/frontend/branching-chat

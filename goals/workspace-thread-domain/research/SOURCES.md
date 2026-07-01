# Workspace Thread Domain (Turn `branchIndex`) - Sources & Provenance

Provenance ledger for the gold-intake extend-note on this packet: it traces the
single mined nugget that motivates a `branchIndex` sibling-variant field on the
existing `Turn` model back to its upstream repo+license, the external
conversation-branching research, and the in-repo capability it extends. Derived
from the **"Conversation branching (branchIndex sibling ordering)"** routing
cluster.

- **Cluster:** Conversation branching (branchIndex sibling ordering) - theme `agent-memory`, wave P2.
- **Route:** `extend-goal` -> primary `goals/workspace-thread-domain`, secondary `packages/workspace/domain`.
- **Gold-intake provenance:**
  - `explorations/_gold-intake/ROUTING.md` (cluster routing rationale).
  - `explorations/_gold-intake/routing.json` (machine record: route `extend-goal`, primaryTarget, wave P2).
  - `explorations/_gold-intake/GOLD_SYNTHESIS.md` -> `### Agent memory & learning` -> "Conversation branching via parent_id + branch_index tree" (theme paragraph ~line 787; subsection ~lines 861-869).
- **Folded note (the disposition this ledger backs):** [`research/gold-intake-conversation-branching.md`](./gold-intake-conversation-branching.md).
- **Codex review:** none present under this packet.

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `LegalEase#7` | Conversation branching via parent_id + branch_index tree | LegalEase (T2) | `backend/models.py:40-52` | agent-memory | P2 | clean-room reimplement (MIT, but adopt the 2-line pattern schema-first; do not vendor Python) |

**How this informs this packet.** This is a single-nugget cluster, so there is
one sub-area: sibling-variant ordering under a shared parent turn.

- *Take the pattern, not the code.* `LegalEase#7` models `ChatMessage` as a
  tree: `parent_id` (self-FK) plus `branch_index` (0-based int) to distinguish
  regeneration/edit variants of the same node. beep already has the lineage half
  (`Turn.parentTurnId`); the load-bearing contract this nugget carries is the
  *second* column - the sibling discriminator:

  > `branch_index = Column(Integer, nullable=False, default=0)` - tracks which
  > regeneration/edit variant a message represents (0-based).

  The implementing agent should take exactly this: a `branchIndex`
  `NonNegativeInt` (default `0`) on `Turn`, re-expressed schema-first via
  `BaseEntity.Class` + `EntitySchema.persist`, optionally with a composite
  `(parent_turn_id, branch_index)` index for sibling-ordered reads.
- *Leave the candidate/approval semantics.* The nugget's "keep multiple
  candidate-extraction attempts as branches" framing is structural ordering
  only. Per this packet's SPEC Non-Goal ("No candidate-state gating of thread
  content"), `branchIndex` must not become an approval-state field - that
  lifecycle belongs to the deferred proposal/claim-gate packet.
- *Do not conflate with `turnIndex`.* `turnIndex` is linear position in the
  thread; `branchIndex` is which variant among siblings sharing a `parentTurnId`.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| LegalEase | T2 | MIT | Port-with-attribution permitted by license; the note nonetheless recommends clean-room reimplement because it is a trivial 2-line SQLAlchemy pattern best re-expressed schema-first in Effect | The `parent_id` self-FK + `branch_index` int message-tree shape -> beep `Turn.parentTurnId` (exists) + `Turn.branchIndex` (net-new) |

> **Caution (from bundle).** Additive field on the existing `Turn` model; no new
> packet. The note also flags that, although MIT permits porting, the upstream
> license was treated as unverified at note-time, so the safe disposition is to
> reimplement the 2-line pattern schema-first rather than copy code.

## 3. External research sources

The conversation-branching landscape citations actually present in
[`research/gold-intake-conversation-branching.md`](./gold-intake-conversation-branching.md)
(footnotes `[^cb]`, `[^nodea]`, `[^lc]`):

- Coding Beauty - "The genius algorithm behind ChatGPT's most powerful UI feature" (parent-pointer message tree; edit/regenerate creates a sibling branch, original preserved). https://codingbeautydev.com/blog/chatbot-conversation-branching/
- Nodea - "Branching AI Chat: The Complete Guide to Non-Linear Conversations" (data model: `nodes` table where every node has a `parent_id`; rendered conversation is the root->selected-node path). https://nodea.ai/blog/branching-ai-chat-guide
- LangChain Docs - "Branching chat" (sibling branches under a shared parent; the model never sees a sibling branch's contents). https://docs.langchain.com/oss/python/langchain/frontend/branching-chat

These corroborate the now-standard message-tree branching model (ChatGPT,
LibreChat, Nodea, LangChain) cited in the note's "Distinguishable
regeneration/edit variants" bullet.

## 4. In-repo capability references

The `@beep/*` bricks this extend composes (from bundle `secondaryTargets` + the
note's inventory):

- `packages/workspace/domain` - `src/entities/Turn/Turn.model.ts` defines `Turn` (`BaseEntity.Class`) with `parentTurnId`, `turnIndex`, `threadId`, ordered `items`. **EXTEND** - add `branchIndex` field.
- `packages/workspace/tables` - `.../Turn.table.ts` Drizzle table. **EXTEND** - regenerate `branch_index` column.
- `packages/_internal/db-admin` - migrations. **EXTEND (net-new migration)** - additive `branch_index NOT NULL DEFAULT 0`, PGlite-safe.
- `packages/workspace/use-cases` - `src/aggregates/Thread/ThreadTimeline.ts`, `ThreadStore.ts`. **REUSE** (optional later extend for sibling-aware traversal).
- `packages/workspace/server` - `src/aggregates/Thread/ThreadStore.repo.ts`. **REUSE** (optional later extend).
- `@beep/schema` - `NonNegativeInt`. **REUSE** - same import already used by `turnIndex`.

Net-new this cluster contributes: `Turn.branchIndex` sibling-variant
discriminator (and its column/migration). Everything else is reuse/extend of
already-landed surfaces.

## 5. Cross-links & provenance

- **Exploration <-> goal:** packet graduated from `explorations/agent-chat-interface` (see this packet's `SPEC.md` Provenance). The branchIndex opportunity itself originates in the gold-intake initiative, not the source exploration.
- **Sibling packets:** none in this cluster (single-nugget, no split). Packet-level siblings noted in README: `rich-text-foundation`, `desktop-chat-surface`.
- **Cluster id / route:** "Conversation branching (branchIndex sibling ordering)", `extend-goal`, wave P2 (`routing.json`).
- **Packet context:** [`SPEC.md`](../SPEC.md) (normative; Constraints + Non-Goals that bound `branchIndex`), [`SPEC.md` Decision Log](../SPEC.md) (2026-06-12 "thread branching"), [`research/gold-intake-conversation-branching.md`](./gold-intake-conversation-branching.md) (the disposition + recommended integration).
- **Synthesis:** `explorations/_gold-intake/GOLD_SYNTHESIS.md` -> `### Agent memory & learning`.

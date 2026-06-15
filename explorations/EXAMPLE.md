# Example Thread — One Exploration, End to End

A **fictional** exploration (`matter-deadline-radar`) walked through every
stage of the pipeline, showing what the human says, what the agent does, and
what changes on disk. The packet does not exist; the repo citations are real.

Legend:

- **User:** / **Agent:** — the conversation.
- > ▸ blockquotes — what happened on disk after the exchange (the part the
  > `/explore` skill owns).

---

## Session 1 — Inbox triage + capture

**User:** /explore

**Agent:** INBOX.md has 2 untriaged bullets:
1. "deadlines from office action emails should just... appear. radar?"
2. "look at tldraw for canvas"

\#1 has no packet — it names a workflow (docket deadlines → ambient
awareness), worth opening. #2 reads like research input for the existing
`canvas` work, not a new exploration. Open a packet for #1 and attach #2 to
canvas notes?

**User:** yeah. call it matter-deadline-radar

> ▸ `explorations/matter-deadline-radar/` scaffolded from `_template/`
> (manifest: `stage: capture`, `status: active`). ATLAS.md Active gains a
> line. INBOX.md: bullet 1 removed, bullet 2 struck through with
> "→ canvas research".

**Agent:** Packet open. Dump everything in your head about it — fragments
fine, contradictions fine. I'll file, not interrogate.

**User:** ok so. office actions have statutory deadlines. 3 months shortened,
6 with fees. i track them in my head + calendar which is insane. emails from
USPTO come in with the dates buried. i want the runtime to *notice* —
deadline radar. maybe a timeline view? also reminders that escalate. also
this should NOT auto-docket anything, i'm liable for malpractice if it's
wrong. screenshot of my current calendar mess attached.

**Agent:** Filed under today's date, screenshot in assets/. Anything else
while it's hot?

**User:** no that's the shape of it

> ▸ CAPTURE.md gains a `## 2026-06-15` section, verbatim;
> `assets/calendar-mess.png` added. Manifest `stage: research`. README "Next
> Open Question": *"What exists for deadline extraction — in repo and in the
> world?"* Trail: "2026-06-15: opened from INBOX; capture complete."

*Why the agent stayed quiet: capture is append-only intake. Interrogating
here kills the dump. Questions wait for align, when research can make them
sharp.*

---

## Session 2 — Research (note the cold resume)

**User:** /explore matter-deadline-radar

**Agent:** Resuming at **research** — open question: "what exists for
deadline extraction." Running the in-repo inventory and the external sweep.

> ▸ Agent searches `standards/repo-exports.catalog.md`, scans relevant package
> docs/source, and fans out web searches.

**Agent:** RESEARCH.md written. The load-bearing findings:

- **In repo:** `packages/drivers/uspto` already wraps the USPTO ODP API —
  the data source exists. `packages/workspace/domain` has `EmailArtifact`
  (with source spans), `CandidateTask`, `ApprovalGate` — the governance
  primitives for "propose, never auto-docket" already exist.
  **NOT FOUND:** any docketing-rules engine (deadline math: shortened
  statutory periods, extensions, weekends/holidays).
- **External:** docketing rules are a known liability minefield — commercial
  vendors (CalendarRules, CompuLaw) license the rule sets; malpractice
  carriers care. Deadline *extraction* from text is the easy half; the rule
  math is the hard half.
- **Constraint discovered:** the runtime doctrine already requires candidate
  writes + human approval (`goals/agentic-professional-runtime`), which is
  exactly your "no auto-docket" instinct — the architecture agrees with you.

**User:** huh, didn't realize the uspto driver covered ODP already. good.

> ▸ Manifest `stage: align`, `openQuestions` seeded with 3 questions the
> research surfaced. Trail +1.

---

## Session 3 — Align (grilling, with a loop-back)

**Agent:** Three branches to close. First, the biggest:

**Q1 — Where does deadline *math* come from?** Options: (a) license a
commercial rule set, (b) build a rules engine, (c) v1 extracts dates +
proposes tasks but does **no** computed deadlines — attorney does the math at
approval. **Recommend (c)**: it ships the radar without touching the
liability minefield, and the approval gate already forces your eyes on it.

**User:** agreed, (c). the math is my job, noticing is the machine's job.

> ▸ DECISIONS.md entry: Q1 with answer + rationale ("liability stays human;
> radar = noticing, not computing"). `openQuestions` −1.

**Agent:** **Q2 — Is the radar a view or a feed?** Your capture said
"timeline view" *and* "escalating reminders" — those are different products.
Before I recommend: the timeline implies a UI surface in
professional-desktop; reminders imply a notification channel that doesn't
exist in repo yet. Let me verify that's actually true — one minute.

> ▸ Loop-back: agent returns to research, greps for notification
> infrastructure, finds NOT FOUND, appends a dated addendum to RESEARCH.md.
> This is the dotted arrow in the README diagram — normal, recorded, cheap.

**Agent:** Confirmed — no notification driver exists. **Recommend: v1 is the
timeline view only**; reminders become a separate exploration if the radar
proves valuable. Smaller appetite, no new infrastructure.

**User:** fine, but park reminders somewhere i won't lose them

**Agent:** Logging it as a DEFERRED decision with a pointer — it'll be in the
MAP as an explicitly out-of-scope follow-on, not lost.

> ▸ DECISIONS.md: Q2 answered, plus a DEFERRED entry for reminders.
> Q3 ("which matters in scope — all or IP-only?") resolved quickly: IP-only.
> `openQuestions: []`. Manifest `stage: shape`. Trail +1.

---

## Session 4 — Shape (the human owns the picture)

**Agent:** BRIEF.md drafted from capture + research + decisions:

- **Problem** — statutory deadlines live in your head and a calendar;
  USPTO emails bury the dates; missing one is malpractice.
- **Appetite** — 2 weeks: one slice of the desktop UI + extraction lane.
- **Sketch** — EmailArtifact → extraction proposes CandidateTask with
  evidence span → ApprovalGate → approved tasks render on a matter timeline
  in professional-desktop.
- **Rabbit holes** — date-format ambiguity in OCR'd attachments; multi-matter
  emails; timezone edge cases.
- **No-gos** — no deadline computation, no auto-docketing, no reminders, no
  non-IP matters.

**User:** appetite's wrong. 2 weeks for a desktop surface that doesn't exist
yet is fantasy. 6 weeks.

**Agent:** Updated — and that appetite change strengthens the case for
timeline-only scope. Does the brief now match the picture in your head?

**User:** yes

> ▸ BRIEF.md revised. Manifest `stage: decompose`. Trail +1. *The agent
> drafts; the human owns the appetite and says when the picture matches —
> shaping exits on their word, not the agent's.*

---

## Session 5 — Decompose (the capability check bites)

**Agent:** MAP.md draft — two candidate goals:

| Slug | Mission | Depends on | Capabilities cited |
| --- | --- | --- | --- |
| `deadline-extraction-lane` | USPTO email → evidence-backed CandidateTask | none | `@beep/uspto`, `workspace/domain` EmailArtifact + CandidateTask + ApprovalGate |
| `matter-timeline-surface` | timeline view of approved deadline tasks in professional-desktop | extraction lane | `@beep/ui`, atom patterns from `apps/professional-desktop` — plus NET-NEW: date parsing |

One challenge before you read further: I marked date parsing NET-NEW, then
checked the catalog — `@beep/schema` ships DateTime codecs
(`DateTimeFromMillis`, `DateTimeEncoded`, …) and the wink/nlp drivers handle
entity extraction. Downgrading that NET-NEW to a
citation. **The capability check exists precisely to catch reflexive
"I'll build it" — including mine.**

**User:** ha. ok. also kill the escalating-reminders thing entirely, on
reflection it's a different product and i'd never trust it

**Agent:** Killed, not parked? Parking keeps it revisitable.

**User:** killed.

> ▸ MAP.md finalized with the corrected citation. ATLAS.md Killed gains:
> *"deadline-reminders — escalation engine; killed 2026-06-16: different
> product, wouldn't be trusted."* The DEFERRED entry in DECISIONS.md is
> annotated with the kill. Manifest `stage: graduate`. Trail +1.

---

## Session 6 — Graduate (the gate does its job)

**Agent:** Definition-of-ready check:

1. Brief complete (problem/appetite/sketch/rabbit holes/no-gos) — **pass**
2. Open questions empty or deferred-with-rationale — **fail.** Q3's
   answer ("IP-only") never specified *which* IP matter types — patent only,
   or trademark too? The extraction lane's fixtures depend on it.
3. Map names goals with sequencing + first slice — pass
4. Capabilities cited or NET-NEW — pass

Dropping back to **align** for one question: patent-only for v1 (matches the
runtime's law-patent-intake scenario fixtures) or patent+trademark?
**Recommend patent-only** — reuse the existing fixture corpus.

**User:** patent only

> ▸ DECISIONS.md +1, gate re-run: 4/4 pass.

**Agent:** Graduating. Scaffolding `goals/deadline-extraction-lane/` and
`goals/matter-timeline-surface/` from `goals/_template/`: SPEC non-goals
seeded from the brief's no-gos, constraints from rabbit holes, decision logs
from DECISIONS.md, both with back-links to this packet. Manifests
cross-linked. ATLAS: packet moved to Graduated with both goal links.

> ▸ Exploration `status: graduated`. The packet stays forever as provenance —
> when someone asks "why doesn't the radar compute deadlines?", the answer is
> one back-link away (Session 3, Q1).

---

## What to notice

- **Capture was never interrogated**; questions waited until research could
  make them sharp.
- **Every session ended with the loop closed** — manifest, Next Open
  Question, Trail — which is why every later session resumed cold in one line.
- **The loop-back (Session 3) and the gate failure (Session 6) are the
  process working**, not failing: dotted arrows and the DoR diamond in the
  README diagram exist exactly for those moments.
- **The capability check caught the agent itself** reaching for NET-NEW.
- **Killing felt good and cost nothing** — one epitaph line, full provenance.

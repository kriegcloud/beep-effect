---
name: explore
description: >
  Drive an exploration packet through the fuzzy front end: capture -> research
  -> align -> shape -> decompose -> graduate into goals/ packets. Trigger on:
  `/explore`, a new fuzzy idea or brainstorm to capture, "crystallize this",
  "help me break down this vision", decomposing a vision into goal packets,
  triaging explorations/INBOX.md, or resuming any packet under explorations/.
version: 0.1.0
status: active
---

# Explore

Operate the `explorations/` pipeline defined in
[`explorations/README.md`](../../../explorations/README.md). Read that file
once per session before acting; it is the convention authority (stages,
statuses, manifest schema, graduation contract). This skill is the operating
procedure, not a copy of the convention.

## Invocation Forms

- `/explore` — orient: triage `explorations/INBOX.md` if non-empty, then list
  active packets with stage + next open question, and recommend what to pick
  up.
- `/explore new <topic>` — scaffold `explorations/<slug>/` from
  `explorations/_template/` (kebab-case slug; real dates; title from topic),
  add it to `ATLAS.md` Active, then drop into capture intake.
- `/explore <slug> [stage]` — read `explorations/<slug>/ops/manifest.json`
  and resume at its `stage`, or at the explicitly given stage override.

## Session Protocol

1. Read the packet manifest, then the packet `README.md`, then only the
   artifacts the current stage needs (smallest relevant set).
2. Work the stage per the behavior table below.
3. **Always close the loop before ending**: update manifest (`stage`,
   `openQuestions`, `updated`), rewrite the packet README's "Next Open
   Question" and append a dated Trail line, and sync `ATLAS.md` if stage or
   status changed. Cold-session resume depends on this.

## Stage Behavior

**capture** — Frictionless intake. File whatever the user dumps into
`CAPTURE.md` under a dated heading (media into `assets/`, referenced
relatively). Never interrogate, never reorganize, never summarize back at
them. Advance to research only when the user signals the dump is done.

**research** — Ground the idea two ways, then write `RESEARCH.md` with dated
sections: (a) external landscape via web search/fetch, every claim cited;
(b) in-repo capability inventory via targeted source/barrel searches and local
package/docs inspection, citing package + path, marking gaps NOT FOUND. Surface
constraints discovered. Fan out subagents for breadth when the topic is wide.

**align** — Grilling posture (as in the `grill-me` skill): walk the decision
tree one branch-closing question at a time via AskUserQuestion, recommended
answer first with reasoning; explore the codebase instead of asking when the
repo can answer. After each resolution, append a dated entry to
`DECISIONS.md` (Question / Answer / Rationale, including rejected options)
and sync manifest `openQuestions`. Deferred questions are logged DEFERRED
with reason, not silently dropped.

**shape** — Draft `BRIEF.md` (problem, appetite, solution sketch, rabbit
holes, no-gos) from capture + research + decisions, at fat-marker fidelity —
concrete enough to decompose, rough enough to leave design latitude. Iterate
in review loops with the user. Exit only when they confirm it matches the
picture in their head.

**decompose** — Build `MAP.md`: candidate goal packets (slug, mission,
dependencies), sequencing with rationale, the first vertical slice, inherited
risks. Run the capability check: every major component cites an existing repo
capability or is explicitly NET-NEW — challenge any NET-NEW that smells like
an existing brick.

**graduate** — Check the four-point definition-of-ready from
`explorations/README.md`; if any point fails, name it and drop back to the
owning stage. Then, per approved candidate: scaffold `goals/<slug>/` from
`goals/_template/` (per `goals/README.md` rules, GOAL.md launcher included);
seed `SPEC.md` from the brief (no-gos -> non-goals, rabbit holes ->
constraints, DECISIONS -> decision log) with back-links to the exploration,
not copies; cross-link both manifests; update `ATLAS.md` (move packet to
Graduated with goal links); flip exploration status — `graduated`, or keep
`active` if candidates remain.

## Guardrails

- Parking and killing are first-class outcomes. Park with a dated reason in
  `DECISIONS.md`; kill with a one-line epitaph in `ATLAS.md` Killed. Offer
  them when momentum or conviction dies — never let a packet rot as fake
  "active".
- One question at a time during align; batch nothing but trivia.
- `CAPTURE.md` is append-only; never tidy it.
- ATLAS is navigation, never doctrine; load-bearing prose goes to
  `docs/product/` or the goal packet, linked from ATLAS.
- Stage loops are normal (align exposes a research gap -> do the research ->
  return). Record the loop in the README Trail.

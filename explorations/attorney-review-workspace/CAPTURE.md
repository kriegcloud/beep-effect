# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-10-14

Operator, verbatim:

> So I have another agent session looking into usecases for claude mods.
>
> I'd really like use to explore how we could leverage these or existing features to make attorney
> review of various things super ergonomic. Previous attempts at attorney review were very
> confusing & the face it required multiple applications was even more so for him & will be for
> others guaranteed.
>
> Something like an app that allows annotation, notes, highlighting, inline chat, side chat,
> rendering of box sources. Something that integrates directly with claudes docks & tiling would be
> awesome.

The operator attached a screenshot of the Claude desktop app's Code tab. It shows:
- text selected in a session transcript, with the built-in **Start a side chat** and **Reply**
  actions over the selection;
- the session sidebar;
- a PR status bar;
- the prompt box.

The screenshot is kept out of this public repo because it shows account and session names; it is
in the operator's local handoff folder.

Context at capture time:
- The other session's exploration
  [`claude-mods-law-practice`](https://github.com/beep-effect/beep-effect/pull/1711) graduated into
  the goal `practice-claude-mod`. That one Claude Code plugin covers plain-language tool rows,
  Right/Wrong verdict capture on answers, a current-matter band and timer, and ported firm skills.
  It excludes Claude Desktop chat.
- [`claim-element-graph`](../claim-element-graph/README.md) stopped at its shape review on the same
  question: how the attorney confirms or dismisses findings without leaving where he works.
- Previous attorney review attempts include:
  - the practice-kg sitting review app (2026-10-09);
  - the design-figure drawings review rounds;
  - the Box identification review app.
  Each was a separate web page or app.

## 2026-10-14 (re-entry: the attorney question loop)

Routed from the docket spot-check session. The operator asked: "if you are waiting for replies every
30 minutes shouldn't we be setting up the tooling so that this happens via the practice-kg-mcp,
CLIProxyAPI & claude code?" The operator chose to decide it here in an align round rather than as a
side patch.

The input is out of the repo at `$HOME/.cache/beep/handoffs/attorney-followup-loop/INPUT.md`. Its
"Private evidence" section names clients and stays there.

Summary of that input, numbers only:
- The requirement is a standing loop. An agent poses a question with facts, sources and the exact
  options. The attorney answers once, where he already works. The answer is captured as structured
  data and applied under a stated write policy. Unanswered questions keep reminding him, and
  nobody polls.
- A one-question-at-a-time page got all 6 questions answered in one sitting. Two emails asking for
  one date got no reply in more than 9 hours. A later email reply was missed by an in-session
  poller.
- 4 of 6 answers were notes rather than decisions: "pending on client" and "keep reminding".
- Records settled 28 of 34 open items without asking him.
- Failure modes: a transient page server died in a reboot, a connector went stale, and answers
  sat unprocessed.

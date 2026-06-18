# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-18

### The ask (verbatim, from the planning session)

> plan an exploration packet whose goal is to land on how we should deal with
> docketing for my dads solo practice IP lawfirm using deep-research
>
> I want to know:
> - what are the best docketing libraries, integrations, paid solutions,
>   software services out there with the best developer tooling. This could
>   mean handrolling a custom solution we build ourselves or integrating with a
>   paid solution that offers a good API, MCP Server or SDK.
> - we want to give agents we build the ability to deal with docketing for my
>   dad, scheduling, integration with outlook, reminders. This solution would
>   need to be something that we can rely on with potential office actions
>   coming in or court orders. Something that could potentially be years in the
>   future that we can't forget about.
>
> We want the solution that can integrate with agents we build, is reliable and
> has a decent story for developers.

### Locked decisions from the planning-grill (provenance — see DECISIONS.md)

- **End-state:** research → recommend → **pause** before shape/decompose/graduate.
  Land on a recommendation, then stop for human review.
- **Build-vs-buy:** **genuinely open.** Keep handroll / buy / hybrid all live; the
  deep research + evaluation matrix ranks them on evidence.
- **Doctrine positioning:** **vigilance overlay, not system of record.** We never
  become the authoritative docket; we observe triggering events, propose
  *candidate* deadlines, redundantly remind + escalate, and the attorney (or a
  vendor) stays the docket of record. (Resolves the "never miss" vs "don't
  replace docketing" tension via the candidate-only / approval-gate firewall.)
- **Research breadth:** **all three tracks** — IP-prosecution docketing; court /
  litigation deadline engines (Outlook/M365); official-data / handroll route.

### Raw pointers (intake — analysis lives in RESEARCH.md)

- Headline product promise: "It never misses the deadline." Binding non-goal:
  product "does not replace... docketing" (`product-vision-law-practice.md`).
  The collision is this packet's reason to exist.
- Sibling packet `microsoft-365-integration` (opened today) already shapes the
  Outlook/Graph transport — reuse it, don't re-research Graph. It reserves
  `Calendars.ReadWrite`; docketing is what drives that scope.
- Prior art: the fictional `EXAMPLE.md` (`matter-deadline-radar`) killed
  escalating reminders and did no deadline math. This packet revisits both
  consciously — the user explicitly wants reminders + reliability.
- Deadlines that matter: office-action response periods (3-mo shortened /
  6-mo w/ extension fees), filing windows, patent maintenance fees
  (3.5/7.5/11.5 yr), foreign annuities, PCT national-phase (30/31 mo), and
  litigation/court-order deadlines — horizon of *years*, malpractice on miss.

### The framing the planning session produced (full analysis → RESEARCH.md)

Docketing splits into four independently build-vs-buy layers: **L1** event
source / truth feed (mostly have, via `@beep/uspto`/ODP), **L2** rules engine
(the malpractice-grade math vendors sell — the only dangerous layer to
handroll), **L3** agent/approval orchestration (we build — the moat), **L4**
reminder/escalation/Outlook sync (build orchestration, integrate channels). The
approval gate is the stable seam: every branch produces a *candidate* Tom
approves, so A→C→B sequencing needs no rework.

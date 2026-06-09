# Reflection in Agentic Coding — Frontier Report

Date: 2026-06-09. Method: `/deep-research` (96 agents; scope → 5 parallel
searches → fetch → 3-vote adversarial verification → synthesis). All findings
below were verified `high` confidence with citations.

## Headline

Reflection in coding agents must be **grounded in external verification signals
(compiler / tests / CI), not unaided self-critique.** Peer-reviewed evidence shows
intrinsic prompted-LLM self-correction reliably helps only in tasks "exceptionally
suited" for it and often *degrades* reasoning; it "works well" precisely when
reliable external feedback exists — which a coding agent has.

- TACL 2024 survey — https://arxiv.org/abs/2406.01297
- "LLMs Cannot Self-Correct Reasoning Yet", ICLR 2024 — https://arxiv.org/abs/2310.01798

## Q1 — Substrate: is a hook best?

Not alone. Hooks are the deterministic trigger, but a **Stop hook over-fires
(every turn, not task completion) and misses user interrupts**
(https://code.claude.com/docs/en/hooks-guide). Shipped systems (`claude-reflect`)
use a **hybrid**: cheap automatic capture + a manual `/reflect` for the real
processing + human-gated apply, deliberately avoiding autonomous config mutation.
→ Our substrate: the manifest **P3 Close** convention + a `/reflect` skill, not a
Stop hook (also harness-specific, which conflicts with multi-harness portability).

## Q2 — Orchestration: state-machine step and/or command?

Both. Real systems pair an automatic closeout step with on-demand invocation. We
have no goal state-machine in code — lifecycle is `ops/manifest.json` convention —
and the `_template` already declares a **P3 Close** phase, the natural mandatory
anchor, paired with `/reflect`.

## Q3 — Prompt/output strategy

Information-rich reflections (Instructions + Explanation + Solution) **measurably
beat** sparse advice (GPT-4 0.925 vs 0.786). Persist via an explicit consolidation
protocol (ExpeL ADD/EDIT/UPVOTE/DOWNVOTE + importance) with **three-tier
confidence routing** (HIGH critical / MEDIUM best-practice / LOW consideration).

- Renze & Guven 2024 — https://arxiv.org/abs/2405.06682
- ExpeL — https://arxiv.org/pdf/2308.10144

→ Our `ReflectionFrontmatter` requires `{ category, confidence, instruction,
explanation }` findings (information-rich) and confidence-tiered body lessons.

## Q4 — Self-healing CLI

The canonical failure→reflect→repair loop (SelfEvolve generate-then-debug-on-
execution-error; CRITIC tool-based validate/revise) maps directly onto a Yeet
verify/repair/publish operator. This is a **distinct** reflection type from the
episodic goal retro and is this packet's **P2**.

- SelfEvolve — https://arxiv.org/pdf/2306.02907

## Persistence & feedback

Shipped tools persist reflections as durable **file-memory** (CLAUDE.md /
AGENTS.md / skill files), not vector/graph; ExpeL's Faiss+kNN is the research-grade
upgrade. Evidence strongly favors **human-gated apply** over autonomous RSI given
documented over-evaluation of self-correction under unrealistic oracle settings.
→ Our P3 consolidates reflections into file-memory `memory/` (and optionally
Graphiti) rather than auto-mutating config.

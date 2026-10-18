# 2026-10-18 — Codex joins the Claude Code fallback chain

## Directive

Operator ruling of 2026-10-18, given to the repository orchestrator session while the
Cursor seat's Opus quota was exhausted (reset 2026-11-11) and the Codex CLI had just been
switched to a paid ChatGPT account. It amends the
[2026-10-14 routing refresh](./2026-10-14-routing-refresh.md) and the
[2026-10-01 policy](./2026-10-01-fallback-chains.md); every other rule there stands.

Operator, verbatim: "codex shouldn't never be a claude fallback. YOu can use codex."

| # | Decision | Reason | Reversal |
| --- | --- | --- | --- |
| R11 | Codex `gpt-6.1-sol` medium, launched through the approved Codex route (the `codex.heavy` codex-cli binding), is step 2 of the Claude Code chain: `claude-opus-5-5` medium child → Codex `gpt-6.1-sol` medium → `cursor-agent --model claude-opus-5-5-medium` → grok-build `grok -m grok-4.7 --effort medium`. The Codex chain is unchanged and direct Claude stays out of it. | The 2026-10-01 symmetry rule kept a paid, idle OpenAI pool out of reach of the orchestrator that does most of the routing. With Cursor exhausted a Claude orchestrator fell straight to grok-build while Codex had capacity. Quota arbitrage, not a model preference: the step is taken only on a confirmed quota, availability or unsupported-model failure of the Opus child, with argv captured, and never to seek a more favourable review. | Delete the Codex column from the Claude row in `AGENTS.md` and `docs/runbooks/agent-pools.md`, restore the "never in the Claude chain" sentence, and strike this row. |

## Chains after this record

| Originator | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| Codex | `gpt-6.1-sol` medium via the approved Codex route | `cursor-agent --model claude-opus-5-5-medium` | grok-build `grok -m grok-4.7 --effort medium` | — |
| Claude Code | `claude-opus-5-5` medium child | Codex `gpt-6.1-sol` medium via the approved Codex route | `cursor-agent --model claude-opus-5-5-medium` | grok-build `grok -m grok-4.7 --effort medium` |

Unchanged: fallback only on confirmed quota, availability or unsupported-model failures; no
silent same-provider substitution (`gpt-6-sol`, `claude-opus-5` and the aliases stay out);
Cursor-agent, grok-build and Junie workers never delegate onward; Junie is a volume pool, not
a chain step; Muse is opt-in only; existing subscriptions and explicitly authorized API billing
only.

## What changed

- `AGENTS.md` and `docs/runbooks/agent-pools.md`: the Claude row gains the Codex step and the
  chain-symmetry sentence is reworded.
- `SPEC.md` Decision Log: R11.
- No manifest change: the Claude chain's Codex step reuses the existing `codex.heavy` ×
  `codex-cli` binding (`gpt-6.1-sol`, medium), so `beep models check` is unaffected.
- Workstation mirrors of the policy (the operator's global `CLAUDE.md`, its working-style rule
  and the Junie `AGENTS.md` mirror) were amended the same day outside the repository.

## Evidence

- Codex route live on the new account: `codex exec --model gpt-6.1-sol -s read-only "Reply with
  exactly: OK"` answered `OK` at 2026-10-18T23:19Z; `codex login status` reports a ChatGPT login.
- Cursor exhaustion: `ActionRequiredError: You've hit your usage limit for Opus` (2026-10-18,
  reset 2026-11-11), recorded as orchestrator ruling S39.

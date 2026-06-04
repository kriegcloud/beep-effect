# Goals

This directory holds durable goal packets for repo initiatives, research, and
agent execution.

A goal packet is a docs-as-code contract: it gives humans and coding agents a
persistent objective, source hierarchy, decisions, verification surface, stop
conditions, and evidence trail. Execution-capable packets must be directly
runnable through a compact `/goal` launcher.

## Packet Standard

New execution-capable packets must start from [`_template`](./_template).
Reference-only or research-only packets may use a lighter shape only when both
their `README.md` and manifest explicitly mark them non-executable.

```text
goals/<slug>/
  README.md
  SPEC.md
  PLAN.md
  GOAL.md
  ops/manifest.json
  research/
  history/
```

### File Roles

| Path | Role |
| --- | --- |
| `README.md` | Orientation: status, mission, next action, launcher, reading order, evidence pointers. |
| `SPEC.md` | Normative reference: scope, non-goals, constraints, decisions, acceptance, stop conditions. |
| `PLAN.md` | Mutable execution plan: phases, sequencing, verification lane, current blockers. |
| `GOAL.md` | Compact `/goal` launcher for execution agents. It delegates to `SPEC.md` and must not become the normative spec. |
| `ops/manifest.json` | Machine-readable routing: lifecycle, anchor document, launchers, phases, checks, assets. |
| `research/` | Source-backed exploration, tradeoffs, inventories, and freshness-dated notes. |
| `history/` | Archived outputs, closeouts, reflection logs, verification notes, and evidence. |
| `ops/handoffs/` | Optional phase-specific handoffs or secondary execution packets. |
| `ops/prompts/` | Optional reusable prompts or prompt assets. |

### Launcher Rule

Every future execution-capable packet must include `GOAL.md`.

- `GOAL.md` is a launcher, not doctrine.
- `SPEC.md` remains `initiative.packetAnchorDocument` unless a packet has no
  spec.
- `GOAL.md` must reference the packet docs instead of duplicating the full
  contract.
- Target size: at most 3,500 characters.
- Hard maximum: 4,000 characters.
- Verify with `wc -m < goals/<slug>/GOAL.md`.
- The standard launch command is:

```text
/goal follow the instructions in goals/<slug>/GOAL.md
```

New manifests must index launchers near the agent asset metadata:

```json
{
  "initiative": {
    "packetAnchorDocument": "SPEC.md"
  },
  "agentLaunchers": [
    {
      "kind": "codex-goal",
      "path": "GOAL.md",
      "targetChars": 3500,
      "maxChars": 4000,
      "command": "/goal follow the instructions in goals/<slug>/GOAL.md"
    }
  ]
}
```

Some existing manifests still use compatibility schema names such as
`initiative-manifest/v1`, `1.0.0`, or custom legacy shapes. Preserve existing
wire shapes unless a dedicated manifest migration is planned.

## Lifecycle

Directory names do not encode lifecycle state. Lifecycle is declared in each
packet's `README.md` and `ops/manifest.json`.

| State | Meaning |
| --- | --- |
| `active` | Execution is open and the packet must include `GOAL.md`. |
| `paused` | Execution is intentionally stopped; resume conditions must be explicit. |
| `reference` | Retained as design/research precedent; not directly executable unless it has `GOAL.md`. |
| `completed-retained` | Implementation or proof is complete, but the packet remains as evidence or precedent. |
| `removed` | The packet left the working tree; git history is the archive. |

Completed packets are not always removed. Retain a completed packet only when it
continues to serve as evidence, reference design, or launch context for follow-up
work.

## Source Hierarchy

For packet creation and execution:

1. User objective or issue that created the packet.
2. Repo instructions: `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Architecture and package standards that govern the target surface.
4. The packet's `SPEC.md`.
5. The packet's `PLAN.md`.
6. The packet's `GOAL.md` launcher.
7. Supporting `research/`, `ops/`, and `history/` files.

Architecture doctrine and repo instructions outrank packet-local prose when they
conflict.

## New Packet Checklist

1. Copy the template:

```sh
cp -R goals/_template goals/<slug>
```

2. Replace placeholders in all files.
3. Set `initiative.packetAnchorDocument` to `SPEC.md`.
4. Keep `GOAL.md` under the launcher size limit:

```sh
test "$(wc -m < goals/<slug>/GOAL.md)" -le 4000
```

5. Validate the manifest and packet references:

```sh
jq . goals/<slug>/ops/manifest.json
rg -n "<slug>|GOAL.md|agentLaunchers|packetAnchorDocument" goals/<slug>
git diff --check -- goals/<slug>
```

6. If the packet is non-executable, remove `GOAL.md` only after marking the
   packet `reference` or `paused` with an explicit non-executable rationale in
   `README.md` and `ops/manifest.json`.

## Current Goals Snapshot

This snapshot was retained from the local `main` saving commit during the
`firecrawl-and-ontology-packet-plus-poc` merge. Use the filesystem and manifest
commands below as the source of truth when the snapshot drifts.

- `ai-metrics-stack`
- `agent-effectiveness-loop` — Phase 1 complete Phoenix-backed coding-agent
  effectiveness loop; follow-up work now lives in separate goals.
- `agent-effectiveness-phoenix-enrichment` — Phoenix-native annotations,
  datasets, experiments, evals, and prompt/config comparison follow-up.
- `agent-effectiveness-workflow-integration` — repo workflow, operator, CI, and
  agent-handoff integration follow-up.
- `agentic-professional-runtime`
- `agent-governance-control-plane`
- `canvas`
- `codex-security-findings` — local Codex Security finding catalog, current-HEAD
  triage, and remediation queue.
- `file-processing-capability` — schema-first file processing contracts,
  Tika/libpff driver split, and `beep files process` proof packet.
- `ip-law-knowledge-graph`
- `oip-web-production-hardening`
- `ontology-modeling-foundation` — foundation modeling packet for the
  `@beep/rdf` and `@beep/ontology` package split and schema-annotation ontology
  builder POC.
- `oip-web-launch` — implementation complete; launch review pending.
- `repo-codegraph` — deterministic-first codegraph lookup and retrieval
  implementation packet.
- `repo-quality-acceleration` — research-first quality feedback speedup packet.
- `repo-quality-convergence` — 9/10 repo-health scorecard, release guardrail,
  and quality closure packet.
- `repo-context-topology` — generated topology and export catalog work for
  coding-agent symbol discovery.
- `stack-installer`
- `trustgraph-doc-ontology`
- `unified-ai-toolchain` — schema-first AI agent configuration contract packet
  for Claude Code, Codex, Grok Build, JetBrains AI Assistant, and Junie.

## Index Policy

This README defines the packet standard. It should not maintain a hand-written
list of active packets that can drift from the filesystem.

Use filesystem and manifest audits for the live packet index:

```sh
find goals -mindepth 1 -maxdepth 1 -type d ! -name _template | sort
```

```sh
for f in goals/*/ops/manifest.json; do
  jq -r 'input_filename + "\t" +
    ((.initiative.id // .initiative.slug // .id // "unknown") | tostring) +
    "\t" + ((.initiative.status // .status // "unknown") | tostring) +
    "\t" + ((.initiative.packetAnchorDocument // .packetAnchorDocument // "unknown") | tostring)' "$f"
done
```

## Research Basis

This standard follows the local agent-governance packet contracts and external
agent/documentation guidance:

- [OpenAI Codex prompting](https://developers.openai.com/codex/prompting)
- [OpenAI Codex slash commands](https://developers.openai.com/codex/cli/slash-commands)
- [Anthropic Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [GitHub Copilot coding agent best practices](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent-to-work-on-issues/best-practices-for-using-copilot-to-work-on-tasks)
- [AGENTS.md](https://agents.md/)
- [Diataxis](https://diataxis.fr/)

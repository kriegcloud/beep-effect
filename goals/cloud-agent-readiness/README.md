# Agent and Linux Development Readiness

> Bootstrap history: references to `scripts/cloud-session-setup.sh` below record
> the original 2026-10-01 acceptance. That script is retired by workstream C;
> current bootstrap is `scripts/cloud/bootstrap.sh`. Packet lifecycle is unchanged.

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Scope expansion — 2026-10-14

The operator expanded this active goal to include development readiness on managed
Linux machines: the workstation, beep-worker, dankserver, and an isolated worker
on tbk-ubuntu if subsequently provisioned. The display title is now **Agent and
Linux Development Readiness**; the stable packet directory and initiative id stay
`cloud-agent-readiness` so existing links, launches, and history keep working.

Cloud acceptance remains in scope. Managed Linux acceptance is defined by D8–D12
and L0–L4 in `SPEC.md` and `PLAN.md`. Historical cloud probes and completed phases
are evidence for their original environment, not proof of Linux fleet readiness.
The expired cloud-credit deadline is historical context, not a current deadline.

## Mission

Make managed Linux workers ready for beep-effect development and agent work,
with verified secure access, development tools, provider authentication and
package proof. Also make a fresh hosted agent container — Claude Code on the web today, any
ephemeral runner tomorrow — able to clone, install, prove, and publish from this
repo without a workstation: the pinned bun, reachable registries, a harness
that knows which host it is on, and a publish handoff that works where `gh`,
the systemd user manager, and 1Password do not exist.

## Why now

Opened at the operator's request on 2026-10-01. The first cloud probe session
could not install dependencies: the container's bun cannot read the lockfile,
the official bun installer host is denied, and the proxy denies `pkg.pr.new`,
which serves every Effect 4.0.0 snapshot package — so no `bun run beep`
command, typecheck, or test can run there. The full probe is
[`research/2026-10-01-container-probe.md`](./research/2026-10-01-container-probe.md).

This packet passes the roadmap's two accelerator tests. Named consumers: every
cloud session on every packet (the Lane 3 queue and the Lane 2 unlocks were
being sized for cloud lanes when the probe failed). Payback before horizon:
the operator's cloud credits expire 2026-10-08, and nothing else in the
portfolio can spend them until this lands.

## Launch

```text
/goal follow the instructions in goals/cloud-agent-readiness/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth, including decisions D1–D12.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/2026-10-01-container-probe.md`](./research/2026-10-01-container-probe.md) - the evidence (F1–F15).
6. [`research/SOURCES.md`](./research/SOURCES.md) - provenance ledger.
7. [`history/`](./history/) - evidence and closeouts, once they exist.

## Current Phase

Cloud P0/P1 remain complete for their original environment; P2–P6 still need
cloud qualification. On beep-worker, Linux L0 inventory, L1 secure access and L3
representative development proof are complete. L2 is in progress: most tools and
agent accounts are ready, while Azure/Vercel/Cloudflare account access, backend
parity, and additional agent-environment qualification remain explicit follow-up.
L4 fleet closeout is pending; dankserver and an isolated tbk worker are not yet
qualified by the beep-worker receipts.

## Latest Evidence

- [Linux worker setup](./history/2026-10-14-linux-worker-readiness.md): host,
  toolchain, authentication, security, desktop and T3 service receipts.
- [Codex headless audit](./history/2026-10-14-headless-codex-audit.md) and
  [Claude headless audit](./history/2026-10-14-headless-claude-audit.md): initial
  portability findings, with bounded execution and qualification limits.
- [Workstation CLI inventory](./research/2026-10-14-workstation-cli-inventory.json)
  and [opportunities](./research/OPPORTUNITIES.md): parity decisions and friction.
- [T3 provider qualification](./history/2026-10-14-t3-provider-qualification.md)
  and [GitHub qualification](./history/2026-10-14-t3-github-qualification.md):
  remote provider smoke tests and authenticated read-only source-control proof.
- [Original cloud probe](./research/2026-10-01-container-probe.md): historical
  container restrictions; it does not describe the current Linux worker.

## Notes

- The roadmap's machinery-first clause says no new machinery packet starts a
  lane slot while it holds. The operator opened this packet explicitly; it
  runs in parallel under the accelerator principle and does not take a slot.
  Its roadmap row lands in P4 in the same PR as the `AGENTS.md` section.
- The volume-pool doctrine is unchanged. A cloud session runs on the Anthropic
  pool and spends the operator's cloud credits — a fourth meter the runbook
  names alongside Opus, Cursor, and Codex.
- No secret enters a cloud container under this packet. Packets whose proof
  needs an `op://` env file stay outside the cloud lane (D5).
- Moving Effect off the `pkg.pr.new` snapshot onto a published release is a
  dependency-policy decision, not this packet's (non-goal); this packet makes
  the snapshot reachable and the failure loud.

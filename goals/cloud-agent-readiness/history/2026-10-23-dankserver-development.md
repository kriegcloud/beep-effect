# Dankserver development preparation — 2026-10-23

The operator resumed the fleet-readiness packet after parking the initial
tbk-worker setup. They requested development support on dankserver and accepted
a globally available remote-agent skill with its source versioned in Beep.
They selected bare-metal development rather than another KVM guest, explaining
that OpenClaw is no longer used on this host.

## Inventory and boundary

Authenticated inventory confirms Ubuntu 26.04.1, kernel 7.0.0-38, an i7-7700K
with four physical cores/eight threads, 16 GiB RAM and approximately 9.8 GiB
available during the initial observation. This is a point-in-time reading,
not a capacity guarantee. The root filesystem has approximately 3.4 TiB free
on a rotating disk. The unmounted NVMe device and backup/monitoring disks are
not admitted for formatting or development storage.

Monitoring, Phoenix, two web services and OpenClaw components are running.
Existing container health and service state were inventoried without reading
credential values. The current administrator belongs to sudo and privileged
Docker groups; its forwarding-enabled SSH route is for maintenance only.
The development plan uses a separate account without those groups and a
host-enforced aggregate resource limit. Agent launch remains pending proof.

OpenClaw retirement requires an explicit service decision. Its files,
credentials and backups must be retained unless separately authorized for
removal. Monitoring, Phoenix and web services remain outside that retirement.

## Existing failure

`logrotate.service` failed because `/etc/logrotate.d/cloud-init` and
`/etc/logrotate.d/cloud-init-base` contain the same cloud-init log rule following
the OS upgrade. The package ownership and identical contents were confirmed.
Repair must preserve a copy of the superseded rule, validate the complete
configuration and verify the service result.

## Publication and readiness

The dankserver control repository already contains unrelated uncommitted
maintenance changes. New development automation belongs in the isolated
`feat/dankserver-development-worker` worktree; existing changes are preserved.
No new worker or provider acceptance is claimed by this preparation receipt.

The fleet skill is `.claude/skills/remote-development-agents` in Beep. Both
global skill directories link to that versioned source. Preserve this worktree
until the skill is merged and those links are moved to a retained canonical
checkout. Its dankserver profile remains pending until live proof is recorded.

## Provisioned boundary and development proof — October 24 UTC

The operator explicitly approved retirement. The gateway, reviewer, browser,
voice tunnel, version-check timer and exact OpenClaw container were stopped;
services/timer were disabled. Only their specific Tailscale routes were removed.
Monitoring, Phoenix and both websites remained running. Data, credentials and
backup jobs were retained. Managed retirement flags and an early role guard
prevent the controller from restarting the retired stack.

The duplicate logrotate rule was preserved outside active configuration, the
complete configuration passed validation, and logrotate executed successfully.
The system failed-unit list was empty in the subsequent read-only check.

The dedicated `worker` account now has no sudo or privileged Docker group.
Fresh `ssh-dankserver-worker` access passed without forwarding an agent. A
root-owned parent user slice enforces 8 GiB memory, no worker swap, 200% CPU,
low CPU/I/O weights and 2,048 tasks. The worker cannot change that parent.
Its home is a preallocated 256 GiB ext4 image on the existing root disk, mounted
with nodev/nosuid. Protected administrator, service and backup trees deny
worker traversal. No NVMe or backup allocation was formatted.

Rootless Docker and the loopback coding proxy passed user-service restart and
environment checks. A disposable Compose service returned its expected HTTP
marker on loopback and was removed. Node 24.22.1/Bun 1.4.4 and coding/support
tools installed under bounded user jobs. The signed 1Password CLI and corrected
vault access passed the [separate credential receipt](2026-10-24-worker-vault-correction.md).

Beep commit `ff57c724eadd3ab8a1d0ec5ac486c4bbe65aa768` passed a frozen install
(2,473 packages, 53.8 seconds, 3.5 GiB peak) and source/test type checks for
`@beep/types` (under one second, approximately 100 MiB peak). The checkout stayed
clean and package lifecycle restrictions stayed enabled. Existing host services
were running afterward, with roughly 12 GiB available host memory at the
observation. This is a point-in-time result and supports one substantive job at
a time, not arbitrary parallel capacity.

All eleven canonical reference repositories were provisioned over public HTTPS.
The bounded Effect graph build and an `Effect.gen` source query passed, with
clean reference checkouts afterward. The independent Beep-only GitHub token
was created, stored in the dedicated development vault and verified for
repository/Actions reads. Its credential helper rejects unapproved repository
destinations. The token expires November 22, 2026.

Native Codex completed ChatGPT sign-in, stored its credential with mode 0600,
and returned the exact marker in a bounded `gpt-6.1-sol` / medium inference
probe. A separate bounded Codex job then read a disposable Python test fixture,
wrote its implementation and ran the tests under the normal workspace-write
restriction. Its success marker and an independent test recheck passed. This
admits initial serialized Codex development within the recorded host limits.
Repository/toolchain proof is recorded separately above.
Native Claude subsequently completed manual browser authorization and stored
its credential with mode 0600. A bounded `claude-fable-5-1` / medium job read a
disposable Python fixture, wrote its implementation and ran the tests using an
explicit tool allowlist. The provider returned its exact success marker with
zero permission denials, and an independent test run passed. This qualifies
serialized native Claude development within the same host budget. The first
authorization code exchange failed HTTP 400; a fresh manual authorization
completed successfully. No authentication code or token was recorded here.

Other native/proxy coding-provider sign-ins remain in progress. No cloud-account
login or paid overage is admitted. Managed automation, verification scripts and
the operating guide are published in [dankserver PR #1](https://github.com/kriegcloud/dankserver/pull/1).
The fleet skill and operating records are published in
[Beep PR #2222](https://github.com/beep-effect/beep-effect/pull/2222).
Both remain drafts pending the remaining provider checks and publication gates.

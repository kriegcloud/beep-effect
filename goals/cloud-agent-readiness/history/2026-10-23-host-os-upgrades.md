# Ubuntu host upgrade checkpoint — 2026-10-23

## Authorized priority

The operator asked to check the existing hosts and upgrade them to Ubuntu
26.04 LTS before proceeding with the isolated worker. The second target was
clarified as dankserver, managed by its existing control-plane repository.
The local DankStation runs CachyOS and is excluded.

## Initial live evidence

| Host | Installed OS / kernel | Release checker | Service state |
| --- | --- | --- | --- |
| dankserver | Ubuntu 24.04.5 / 6.8.0-147-generic | Stable 26.04.1 offered | OpenClaw gateway active and health endpoint OK; six expected Docker containers running, Phoenix healthy. Existing user openclaw-version-check unit failed; no failed system units. |
| tbk-ubuntu | Ubuntu 24.04.5 / 6.8.0-147-generic | Stable 26.04.1 offered | Ten Rocket Pool containers running; execution and consensus clients fully synced on Ethereum mainnet. An LXD installer failure from this session is recorded separately. |

Both hosts have ample root and boot free space, no dpkg audit findings and no
held packages. These are pre-upgrade observations, not upgrade completion.

## Execution state

Upgrade dankserver first, verify reboot/access/services, then proceed to
tbk-ubuntu. Dankserver's existing YubiKey route passed SSH and sudo; SSH and
sudo configuration syntax checks pass. Package indexes were refreshed and
the five current-release prerequisite updates completed with no removals.
Its unrelated dirty control-plane files are preserved. Root-only configuration
and package checkpoints are in `/root/os-upgrade-20261023/` on dankserver;
its three managed backup services reported success earlier that day.

The main release upgrade ran in root tmux session
`os-upgrade-20261023`. Its reviewed plan removes eight automatically installed
packages, installs 159 and upgrades 1,031. Replacement libraries and NVIDIA
580-server modules for kernel 7.0.0-38 are included, preserving the GTX 1060's
driver family. The release upgrader reported installation complete before the
reboot described below. Optional removal of 121 obsolete packages was deferred
through recovery verification, preserving the previous kernels and libraries.
A separate authenticated root recovery shell was retained through the
pre-reboot checks; that connection ended during reboot.

The existing SSH policy was retained at both configuration prompts. The only
upstream PAM compatibility change applied separately removes `user_readenv=1`
from the locale environment line. The supported `sudo.ws` implementation is
selected through Ubuntu's alternatives mechanism to preserve the existing
global timestamp policy, which sudo-rs does not support. SSH/sudo syntax checks
pass, and fresh independent SSH plus YubiKey sudo authentication both succeeded.
The SSH socket was listening; explicitly starting its service created its
normal runtime directory before the standalone syntax check.

Docker and Tailscale sources now target Resolute, while the existing Chrome
stable and NodeSource Node 22 sources are re-enabled. Repository refresh passed.
The six Docker packages migrated successfully to their matching Resolute builds
with the same application versions and no removals. The new kernel's NVIDIA
module reports 580.178.04. The host CA bundle still excludes both distrusted
roots, dpkg audit is empty, and no system units are failed before reboot.

Reboot was issued at 09:16:35 UTC. SSH became reachable again, but all three
fresh post-reboot FIDO authentication attempts ended with the local SSH agent
refusing the signature. Each owning session exited and the notification route
reports zero active requests. Post-reboot OS/kernel, GPU and application
verification is therefore pending; the operator was asked whether available
for a fresh attempt. The tbk release upgrade has not started while dankserver
recovery verification remains open.
Post-reboot tailnet HTTPS returned 200 and OpenClaw's port-8445 health endpoint
returned `ok=true` / `status=live`. These prove application reachability, not
the still-pending authenticated kernel/GPU/container checks. Dankserver's
existing control-plane repository now targets Resolute for Tailscale, preserving
its unrelated edits; the official Resolute key matches the existing managed
checksum. A local host-upgrade receipt records the compatibility choices and
remaining checks.

At 10:52, 12:17, 13:14, 14:15, 14:43, 15:44 and 16:42 UTC, read-only checks
returned HTTP 200 from dankserver's web endpoint and `ok=true` / `status=live`
from OpenClaw. The tbk execution and
consensus clients were both fully synced on the correct mainnet. No new
authentication attempt was started while waiting for operator availability.
The 13:14 and 15:44 checks also reconfirmed tbk's installed Ubuntu 24.04.5 and running
kernel 6.8.0-147-generic.

The tbk sudo route authenticated successfully on the fresh attempt; its working
OTP-protected SSH connection is retained. The remote Linux account password is collected
only by a masked KDE dialog and passed directly to the remote sudo terminal;
it is not saved or emitted into chat or command output. The first expired
attempt ended; a fresh request was started after the operator asked to retry.
The tbk root-only configuration/package checkpoint is also stored in
`/root/os-upgrade-20261023/` on that host. Its one current-release prerequisite
update completed, dpkg audit is empty, and SSH/sudo configuration syntax checks
pass. Recent validator logs show successful attestations. The host CA bundle
continues to exclude both previously distrusted roots.

During the authentication hold, the interactive tbk administrator SSH channel
was closed cleanly and both session-only prompt-adapter files were removed.
The unprivileged multiplexed SSH connection is retained. The prepared,
root-owned tmux session is idle; no release upgrader has started on tbk.
Resuming privileged work requires fresh administration authentication through
the approved route.

At this checkpoint the pre-upgrade OTP route still applied. Exact account and
prompt-matching details are retained in the private access receipt. The later
hardware-authentication acceptance below supersedes that preparation.

## Dankserver recovery completed

After the operator replied “Ready to retry”, fresh SSH and remote YubiKey sudo
passed. Authenticated checks confirm Ubuntu 26.04.1 LTS, kernel 7.0.0-38-generic,
NVIDIA 580.178.04 working with the GTX 1060, empty dpkg audit and zero pending
package changes. SSH/sudo syntax, UFW tailnet-only ingress, Tailscale online
health, certificate exclusions and read-only container trust mounts pass.
All seven expected user services and six expected containers run, with zero
failed system/user units. The existing non-autorestart OpenClaw sandbox was
started explicitly. Grafana, Prometheus, OpenClaw and Phoenix health pass.

The monitoring disk initially failed its label-based boot mount because old
ZFS signatures coexist with its active ext4 filesystem. Read-only inspection
confirmed clean ext4 and the intact original data. Recovery preserved the
empty boot-created directories, then mounted the verified disk using stable
hardware identity recorded in the private receipt and explicit ext4.
The live fstab and Ansible variables now agree, with mount ordering before
Docker. No disk signature or data was erased; generic probing still warns about
the ambiguity. The generated mount ordering was verified; no second reboot
was performed. Full receipt is in dankserver's
`docs/dankserver-os-upgrade-2026-10-23.md`.

## Reusable sensitive-input route

After dankserver recovery, three masked tbk remote-sudo password prompts expired
without delivery. Their owned helper/dialog/SSH children exited, and the
session-only adapter was removed. No release upgrade or staking stop began.
The unprivileged SSH master remains available and both Rocket Pool clients
were reconfirmed fully synced. The operator was asked whether the dialogs were
visible before any further authentication attempt. The fresh dankserver
administrator shell was closed after its successful final service checks.

The operator confirmed the dialogs were visible and requested a fresh prompt,
then clarified the distinction between the SSH authenticator code and Linux
account password. The next masked password delivery authenticated remote sudo
successfully. This establishes actual GUI delivery and private-consumer
acceptance for the reusable helper in this maintenance session. No value was
printed or stored; the authenticated administration channel is retained for
the tbk upgrade.

The tbk release plan was reviewed: five automatically installed support
packages removed (`keyboxd`, `libimobiledevice6`, `libxmlsec1t64`,
`libxmlsec1t64-openssl`, `packagekit-tools`), 96 newly installed and 687 upgraded,
including replacement libraries and kernel 7.0.0-38. All ten Rocket Pool
containers stopped successfully through `rocketpool service stop --yes` before
confirming installation. Existing Doppelganger Protection remains enabled and
will intentionally delay attestations on restart. Package installation is now
in the persistent root tmux session; recovery verification remains pending.

The tbk upgrader subsequently reported completion. Optional removal of 70
obsolete packages was deferred. Both SSH configuration prompts retained local
policy; only `user_readenv=1` was removed from the locale PAM line. Google
Authenticator and publickey-plus-keyboard-interactive authentication remain
required. A fresh independent SSH login through the reusable masked helper
succeeded before reboot. The supervisor initially misreported that login when
ControlPersist forked its process; the owned master, server acceptance event and
successful fresh-channel command confirmed success. The supervisor now keeps
its connection-only SSH process in the foreground for subsequent monitoring.

Docker and Tailscale sources now target Resolute. Six Docker packages migrated
to equivalent 26.04 builds at unchanged application versions. Package refresh
and install succeeded, the audit is empty, the remaining upgrade simulation is
zero, SSH/sudo syntax passes, no system unit is failed, and both distrusted CA
roots remain excluded. The new kernel and startup image exist on the verified
NVMe boot path. Existing UFW rules were retained. Reboot was requested at
18:04:42 UTC; post-reboot access, kernel and Rocket Pool recovery are pending.

At the operator's request, a dedicated sub-agent implemented the reusable
`plasma-sensitive-entry` skill in an isolated worktree and published
[PR #2113](https://github.com/beep-effect/beep-effect/pull/2113). Its local
installation adds global discovery links under `~/.agents/skills` and
`~/.claude/skills`, plus a marked default rule in `~/.codex/AGENTS.md`.
Existing YubiKey wrappers and agent 1Password routes retain precedence.
Agents must use masked GUI delivery for required human text and stop collection
if that delivery is unavailable; values must not enter chat or tool output.

The installed links point to the skill's worktree, which must be retained until
they can be repointed to a retained checkout containing the merged skill.
Synthetic helper tests and a resolver-only check establish automated behavior
and availability of kdialog, a selected Plasma display and the user bus when
the caller supplies trusted current-user runtime metadata. The resolver check
intercepted dialog launch: it did not open a dialog or collect a credential.
The later tbk sudo authentication above establishes live masked-dialog delivery
and acceptance through a private adapter; earlier successful tbk prompts used
the previous session-only bridge.
PR publication, hosted readiness and merge remain separate from this local
activation; use the PR and its exact-head closeout evidence for current status.

The skill branch's published head is
`1e3081497f4ed922dc609354930c75930e37f2d0` (push accepted 16:30:08 UTC).
The child finished its bounded observation at 17:14:38 UTC: local HEAD, Git
transport and REST branch ref agree, but PR metadata still names old head
`2a6b89d95208d2aa5a2d3ed3e85776c9af174492` with unknown mergeability and no
workflows for the published head. A later parent read agreed. Local publication
gates and 19 synthetic helper tests pass. Earlier-head hosted checks/review do
not qualify the new revision. No owned PR observer remains active; retain the
worktree and resume exact-head hosted validation when GitHub acknowledges it.
This is an unresolved GitHub synchronization inconsistency, not merge readiness.

## Required preservation and verification

- Keep root-only copies of changed host configuration and package inventories;
  preserve PAM, SSH, networking, Docker data, custom trust-store changes and
  service definitions. Existing staking backup exclusion remains in force.
- Inspect the release upgrader's package-removal plan before confirming it;
  preserve working access, examine SSH/sudo compatibility and third-party
  repositories, and use a persistent remote terminal.
- After each reboot, verify OS/kernel, fresh authenticated administration,
  network/firewall state and each host's actual service health. Running
  containers alone do not qualify validator recovery.
- Return to the guest design after both host upgrades are verified. No guest,
  guest volume or guest firewall rules have been provisioned.

## tbk post-reboot and hardware access proof

The host booted at 18:06:24 UTC on Ubuntu 26.04.1 LTS and kernel
7.0.0-38-generic. Fresh SSH OTP and remote sudo account-password authentication
passed through the masked private-delivery route. Package audit and upgrade
simulation are empty, SSH/sudo syntax passes, no system units are failed,
Tailscale reports online with no health findings, and both excluded CA roots
remain excluded. Existing UFW rules were retained, including the existing
public SSH and Ethereum peer ports; this host is not described as tailnet-only.

All ten Rocket Pool containers started successfully through the existing
Smartnode command. Both execution and consensus clients subsequently reported
fully synced on Ethereum mainnet. Lighthouse's enabled doppelganger protection
continues its initial safety delay; fresh attestation evidence remains pending
at this checkpoint. Its documented delay is approximately 12–20 minutes:
[Lighthouse doppelganger protection](https://lighthouse-book.sigmaprime.io/validator_doppelganger.html).
No protection setting, validator data or slashing database was changed.

The operator then requested the same YubiKey SSH/sudo route as dankserver and
beep-worker (D22), and named the workstation wrapper `ssh-tbk-ubuntu`.
The existing dedicated hardware agent and key were reused; no private key was
transferred. The known working `libpam_rssh.so` module was copied from dankserver,
verified against SHA-256
`fa4cd68d57fdf4cd9068fcf42d4dbd137534a2ffdfd56ae05c94923db3c68a70`,
and checked for resolved dependencies on tbk. This matches the prior worker
setup; the older guide's `pam_ssh_agent_auth.so` recipe is stale.

The administrator sudo key file is root-owned; sudo retains only that user's
`SSH_AUTH_SOCK` addition. PAM tries hardware authentication before the existing
account-password fallback. Agents must cancel a missed-touch password fallback
and follow the bounded YubiKey retry policy. The new Ubuntu sudo-rs provider
passed live hardware authentication; no provider or timestamp-policy change
was needed.

Fresh hardware SSH and a forced fresh sudo authentication both passed on an
isolated SSH listener bound only to loopback, reached through the existing
authenticated connection. Normal SSH was then changed through
`/etc/ssh/sshd_config.d/40-tbk-yubikey.conf`: public-key authentication only,
ED25519-SK only, required touch, no password or keyboard-interactive login,
and no root login. Effective configuration and syntax were checked before
reloading the service. A second fresh normal-port SSH and forced sudo test
passed, returning root identity. Ordinary wrapper mode then passed with no
forwarded agent, and the former software key was denied. The temporary listener
was stopped and its port confirmed closed.

Workstation command `~/.local/bin/ssh-tbk-ubuntu` preserves strict existing
host-key trust, initializes or reuses the dedicated hardware agent, checks the
expected identity and emits owned Plasma notification/sound requests. Normal
mode does not forward an agent; `--admin` explicitly forwards it for sudo.
The local `tbk-ubuntu` and `rocketpool` SSH aliases now select the hardware key
and leave forwarding off. Use the wrapper for notifications. Its verified
snapshot and prior SSH config are retained privately under
`~/.local/state/beep/tbk-yubikey-20261023/`.

Root-only original SSH/PAM/sudo/authorized-key copies are in
`/root/security-bootstrap-20261023/`. Its `rollback-yubi.sh` restores the changed
authentication policy from a verified recovery shell; the script passes syntax
validation but was not executed after successful acceptance. Restoring the
workstation's saved SSH config completes rollback to the prior OTP route.
The original administrator session remains open while validator recovery is
being observed. No guest or guest administration identity has been created.

## Final host-maintenance acceptance

Lighthouse reported all managed validators active, with fresh successful
attestations. Both clients were fully synced on the intended network and all
expected containers were running. The doppelganger delay completed without changing its
configuration. Final package audit is empty and no system unit is failed.
This closes the tbk post-upgrade recovery check; it is a point-in-time recovery
proof, not a guarantee of future validator performance under guest workload.

The authenticated root recovery shell and the temporary OTP SSH master were
closed cleanly after the new hardware route passed. Owned staging files and
private prompt adapters were removed; configuration checkpoints and the installed
wrapper remain. There are zero active owned touch notifications. Both requested
host upgrades are complete. Guest provisioning remains unstarted, with the
guest-only administration identity decision presented to the operator.

A later PR #2113 metadata check still reported the old head and update timestamp.
The Plasma skill is installed and used successfully, but exact published-head
hosted validation and merge readiness remain blocked by that inconsistency.

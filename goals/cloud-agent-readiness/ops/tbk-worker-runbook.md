# tbk-worker operation

The development worker is a KVM guest on the Rocket Pool host. Its operating
contract is SPEC decisions D12–D36 and D40. The dated
[setup receipt](../history/2026-10-23-tbk-worker-design.md) distinguishes verified
behavior from outstanding acceptance. This runbook does not admit larger
allocations, additional network peers or additional credential scopes.

## Connect

From DankStation:

```sh
ssh-tbk-worker
```

This logs in as `worker`, with a hardware touch, no forwarded SSH agent and no
sudo. The checkout is `$HOME/YeeBois/projects/beep-effect`. Node and Bun follow
that checkout's pins. Shells and user services resolve the approved local tools.

Use `ssh-tbk-worker --admin -tt` only for guest administration. It selects the
separate `tbkadmin` account and forwards only the guest-specific YubiKey identity;
sudo requests another touch. Never forward the host/fleet agent into the guest.
End the administrative shell when maintenance is complete.

The guest receives public-internet egress and replies to incoming connections.
Only DankStation may initiate tailnet SSH to it. Guest initiation to the host,
LAN, private networks and other tailnet machines is blocked. Development
services bind to guest loopback; use an explicit SSH local port forward when
needed. Tailscale Serve, Funnel, subnet routes and exit-node use are not enabled.

## Start and inspect from the host

```sh
ssh-tbk-ubuntu --admin -tt
sudo -i
cat /run/tbk-worker/health.json
/usr/local/libexec/tbk-worker-guard snapshot
virsh domstate tbk-worker
/usr/local/sbin/tbk-worker-start
```

Startup is manual after a host reboot. The helper verifies the resource and
network boundaries, fresh healthy readings, 60 consecutive healthy seconds,
48 GiB available host memory, active guard/network services and no protective
stop latch. Direct `virsh start` cannot bypass the single-use start permit.

The guard checks execution/consensus synchronization, fresh chain heads and
107 active validators. It also requires at least 16 GiB available host memory,
host memory full pressure at most 1%, host I/O full pressure at most 10%, and
filesystem headroom. Pressure values are the kernel's ten-second averages.
Sustained failure or missing readings for 90 seconds stops the guest. A broken
containment boundary stops it immediately. Loss of the guard also stops it.

The stop requests guest shutdown, allows 60 seconds, then forces it off if
needed. Forced shutdown can lose running work. The guard never restarts or
reconfigures staking services, and never automatically restarts the guest.

## Respond to a protective stop

1. Leave the worker off. Read `/var/lib/tbk-worker/protective-stop.json`, the
   current health file and `journalctl -u tbk-worker-guard.service`.
2. Check Rocket Pool activity and synchronization, available memory, filesystem
   headroom, kernel storage errors and the exact recorded failure. Compare
   `/proc/pressure/io` with the worker and staking-container cgroup pressure;
   whole-host pressure alone does not identify which workload was delayed.
3. Inspect interrupted work before retrying it. Preserve successful receipts;
   do not replay an uncertain installation or disk operation.
4. Record the investigation and recovery plan in a root-only receipt, then
   archive the latch explicitly. Do not delete it merely to make startup pass.
5. Use the guarded start command. Keep the original limits and thresholds unless
   a separate decision changes them. Begin with serialized work and observation.

The October 23 installation workload caused one real I/O-pressure stop. The
validator activity observations stayed healthy, but the original record lacked
per-workload numeric history. A later serialized package check passed. This is
not qualification for arbitrary parallel workloads or proof of zero impact.

## Resource and workload boundaries

- Four vCPUs confined to two host physical cores and their four threads; the
  aggregate VM/helper budget is 400% CPU. The host can still use these cores.
- Guest RAM 32 GiB; aggregate ceiling 36 GiB, pressure threshold 34 GiB and no
  swap for the VM group. No ballooning or automatic restart after failure.
- A preallocated 512 GiB guest disk on a separate SATA allocation. The existing
  old system volume and staking/backup/ZFS storage are preserved.
- Combined QEMU disk ceiling 100 MiB/s and 5,000 operations/second, no burst.
  The conservative host backstop allows 50 MiB/s and 2,500 operations/second
  in each direction.

Start with one substantive build/install/reference job at a time. Use finite
systemd jobs with explicit CPU/memory limits and `UnsetEnvironment=SSH_AUTH_SOCK`.
Graft uses its installed bounded wrapper and shared slice. Structural indexing
does not authorize `--deep`, unbounded aggregate refresh or new scheduled jobs.

Rootless Docker belongs to `worker`; root Docker/containerd services are masked.
The user Docker and coding-proxy services must have no SSH agent or OP credential
in their live process environments. A worker-local SSH-agent service is masked;
this does not affect the separate administrative forwarded identity.

## Credentials and coding providers

Run `op-doctor` for the scoped account's identity, vault, permissions, PATH and
approved credential-read checks. It prints status only. Do not use desktop
sign-in to repair an agent secret failure or grant broader vault access to make
a workstation-specific diagnostic pass.

The dedicated service account can read `BEEP_SECRETS` and
`tbk-worker-development`, as explicitly approved in D40. It has no other vault,
environment or vault-creation access. Read-only vault access exposes all items
in those vaults; the stored credentials retain their own upstream permissions.
Use only credentials needed for the authorized task. Its protected credential
store is mode 0600; current recovery material is in the human-only Employee
vault. The former one-vault account was revoked after replacement verification.

The GitHub token expires November 22, 2026. It grants the selected Beep repository
Contents, Issues and Pull requests read/write, plus Actions and Metadata
read-only. No organization, administration, secrets or Workflows permissions
are granted. The `gh` wrapper and HTTPS Git helper read it from the vault for
each operation; the helper refuses other repository destinations. Rotate the
vault item through the authorized human/admin route before expiry. The guest
service account cannot edit it.

Native Codex, Claude, Cursor, Grok and Muse authentication is separate from the
loopback coding proxy. Installation or a running proxy with an empty model
catalog does not establish provider readiness. Cloud CLIs are installed but
cloud account sign-ins remain deferred. Do not copy host/fleet or beep-worker
authentication directories to satisfy parity.

The October 23 continuation verified five native logins. Native Codex
(`gpt-6.1-sol`, medium), Claude (`claude-fable-5-1`, medium), Grok (`grok-4.7`,
medium) and Muse (`muse-spark-1.3`, medium) returned their exact test markers.
Cursor selected `claude-opus-5-5-medium` with its sandbox enabled, then reported
the subscription's Opus quota exhausted until November 11. Do not enable paid
overages or silently substitute a model to make that receipt pass.

The familiar proxy commands are installed: `claudex` uses GPT-6.1-Sol medium,
`claudeg` uses Grok 4.7, `claudep` uses Fable 5.1 medium, and `claudem` uses
Muse Wonder 1.0 medium. Each passed a bounded inference-only check. They read
the local proxy credential directly into the child process, remove the SSH
agent and OP variables, and use loopback only. The proxy restored all four
providers and its 62-model catalog after a user-service restart. This does not
qualify arbitrary provider tools, MCP workflows or parallel agent capacity.

Cursor's CLI needs a guest AppArmor profile for its sandbox helper. The
root-owned `tbk-cursor-sandbox-agent-cli` profile is limited to the worker's
Cursor helper path and based on Cursor's official support package, with
explicit user-namespace, self-signal and observed UID-map helper permissions.
AppArmor remains active and the system-wide user-namespace restriction stays
enabled. If a future Cursor update fails, inspect the exact helper denial;
do not disable AppArmor or the global restriction. The dated receipt records
the original failure and successful sandbox startup separately from quota.

## Reversal and recovery

For a planned stop, use `virsh shutdown tbk-worker --mode agent,acpi` from the
authenticated host shell and verify `virsh domstate` becomes `shut off`.
Investigate an unresponsive guest before an explicitly chosen forced stop.

Stopping the guest reverses development resource consumption without changing
staking services. Keep the VM disk, saved definitions and root-only bootstrap
backups until retention is decided. Do not remove its logical volume, reformat
the SATA disk or delete old system/backup/ZFS data as a cleanup shortcut.

Revoke the dedicated GitHub token and 1Password service account, remove the
worker's Tailscale enrollment/grant and retire its guest-only SSH identity when
decommissioning. Those are separate actions; merely stopping a VM does not
revoke credentials. Restore authentication/firewall definitions from the saved
prechange receipts only after identifying the exact failed component.

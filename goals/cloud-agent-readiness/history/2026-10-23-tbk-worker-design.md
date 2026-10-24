# Staking-host worker design checkpoint — 2026-10-23

This is a chronological receipt. Earlier development-only credential decisions
and exclusions were superseded by D40 and the
[worker vault correction](2026-10-24-worker-vault-correction.md). Worker jobs
now have full shared-vault read access; environment cleanup does not enforce
item-level or per-job secret isolation. Exact host identifiers, prior network
policy and validator activity details are retained in private receipts.

## Scope and decisions

The operator resumed the isolated tbk-ubuntu worker covered by D12 and accepted
a KVM virtual machine (D13), then libvirt/QEMU as its manager (D14).
The initial guest will be a command-line worker (D15), with agent, build, test,
container and web-service workflows accessed through SSH and the tailnet.
The full desktop additions on beep-worker are not part of this first guest.
The operator then selected 4 vCPUs and 32 GiB of RAM as the initial allocation
(D16). Future growth remains conditional on workload/validator evidence and a
separate allocation decision.
The operator accepted a 512 GiB guest disk using only verified free capacity
on the old Ubuntu SATA SSD, retaining the existing 100 GiB system volume (D17).
This remains conditional on privileged capacity and drive-health checks.
The operator accepted the restricted network policy (D18): approved operator
inbound access, public-internet egress and established replies, with guest-
initiated private host/LAN/other-tailnet connections denied by default.
The operator chose a dedicated development-only 1Password service account
(D19), superseding shared-account reuse for this guest.
This is a continuation of this goal packet.
The archived chat titled "Verify Wi-Fi and plan switch setup" supplied the
earlier secure SSH procedure and provisional resource-sizing discussion.
The operator requested a one-question-at-a-time design interview before
provisioning. Guest OS is now accepted in D20 and privileged storage evidence
is recorded below. Detailed enforcement budgets, credential membership, guest
administrative access and implementation acceptance remain open.

## Secure access proof

The working flow uses a temporary mode-0700 helper in the user's private runtime
directory. OpenSSH invokes KDialog with masked input through SSH_ASKPASS;
the code passes directly to SSH without entering chat, command arguments or
saved logs. The helper accepts verification-code prompts only. The GUI process
receives only the required display, runtime-directory and session-bus variables.
After authentication, actual remote hostname, user and uptime commands succeeded
through the multiplexed connection. The temporary helper was removed.

A socket/master presence probe alone was insufficient evidence of authentication.
Remote `sudo -n true` still requires authentication. No verified privileged
administration route has been established in this continuation.

## Live inventory and limits of evidence

This is the initial inventory before the host upgrades recorded below.

| Surface | Observation |
| --- | --- |
| Host | Ubuntu 24.04.5 LTS, kernel 6.8.0-147-generic, bare metal |
| CPU | Xeon Silver 4210R, 10 physical cores / 20 threads, one NUMA node, VT-x |
| Memory | Approximately 124.5 GiB total, 101 GiB available in this snapshot; 8 GiB swap with about 30 MiB used |
| Virtualization | `/dev/kvm` exists; cgroup v2 exposes CPU, cpuset, memory and I/O controllers |
| Root/staking storage | Approximately 3.7 TiB NVMe-backed root volume, 1.9 TiB used and 1.7 TiB available; shared with the running host |
| Other storage | Four approximately 1.8 TiB SATA SSDs: one old LVM installation, one mounted backup volume, and two with ZFS signatures. Ownership and reusable capacity remain unresolved. |
| Rocket Pool | Ten expected containers were running. This is process-availability evidence, not current sync, attestation or peak-load proof. |

Earlier sizing discussed 4 vCPU / 32 GiB initially and potentially 8 vCPU /
48 GiB later. The first allocation is now accepted; growth is not. A fresh idle snapshot does not
establish a safe allocation; collect validator and host pressure evidence before
and during representative guest work. No disk is approved for formatting.

A subsequent topology read confirmed sibling thread pairs 0/10 through 9/19.
Available memory remained approximately 101 GiB. Memory pressure averages were
zero; CPU and I/O pressure were low during the short observation. This is a
point-in-time check, not peak-load or guest acceptance evidence. Sudo's readable
PAM entry includes the host's common-auth stack; it does not establish a working
YubiKey administration path.

The host's common-auth stack uses pam_unix password authentication. It does not
currently provide the planned hardware-backed sudo route. The persistent mount
configuration confirms that the backup SATA volume retains its backup role.
The old SATA LVM volume is 100 GiB within an approximately 1.8 TiB partition;
the actual free extents remain unverified until privileged LVM inventory.
The accepted conditional storage path is a new 512 GiB guest volume in verified unused
extents, preserving the old logical volume and avoiding the active staking NVMe,
backup disk and ZFS-signature disks. This proposal is not permission to erase data.

The live network layout includes a bonded physical LAN interface, separate
Docker networks and a Tailscale interface. UFW's configuration enables its
firewall, but effective rules have not yet been inspected with privilege.
Do not infer guest isolation from UFW being enabled or from a NAT network.

## Accepted network policy

The accepted policy is a dedicated guest network and separate Tailscale
identity: approved operator devices may initiate SSH and development-service
connections; the guest may use the public internet for development, while
initiating connections to the host's private/control services, the LAN and
other tailnet machines is denied unless explicitly admitted for a workflow.
The operator accepted this policy; implementation and path verification remain.

[Libvirt networking](https://libvirt.org/formatnetwork.html) supplies network
configuration; NAT alone does not establish the required destination policy.
[Tailscale access control](https://tailscale.com/docs/features/access-control/acls)
must be checked as well because the guest's encrypted overlay can reach peers
independently of ordinary LAN destination filtering. Apply boundaries outside
the guest, cover IPv4 and IPv6, and verify both allowed and denied paths without
disrupting current Docker or staking connectivity. Keep minimal guest network
bootstrap services explicitly scoped. No network changes have been applied.

## Accepted credential policy

D10 permitted the workstation service-account credential to be reused on managed
Linux, and the beep-worker receipt records that reuse. Its current accessible
vaults have not been audited in this continuation. For this guest, the accepted
refinement is a separate 1Password service account with read access only to
selected development vaults, excluding staking, host/tailnet administration and
broader fleet credentials. If existing vault boundaries are too broad, use a
dedicated development vault containing only the admitted material. Keep the
approved CLI shim and secure delivery procedure. No account, vault or credential
has been created, changed or transferred in this continuation.

[1Password service accounts](https://www.1password.dev/service-accounts) support
vault and action scoping. Audit the effective scope and verify the actual needed
operation with output suppressed; a successful login alone is insufficient.

## Accepted guest OS and host-maintenance priority

The operator selected Ubuntu Server 26.04 LTS using an official verified image,
matching the release family already qualified on beep-worker. The
[official release index](https://releases.ubuntu.com/26.04/) offers 26.04.1 server
images, and [Ubuntu's lifecycle](https://ubuntu.com/about/release-cycle)
lists standard security maintenance through May 2031. The operator subsequently
requested upgrades of tbk-ubuntu and dankserver before guest provisioning.
Initial checks found both hosts on 24.04.5 with the stable 26.04.1 upgrade offered.
The clarified second target is dankserver, not the local CachyOS workstation.
See the [host upgrade checkpoint](2026-10-23-host-os-upgrades.md).
Repository toolchain pins and actual workflow checks still apply to the guest.

Guest access initially conflicted between D11's forwarded administration agent
and D12's guest boundary. D23 now resolves that conflict with a guest-only
credential and separate agent, described below. The workstation/host
administrative identity must never be forwarded into the guest.

## Introduced host change

Ubuntu's LXC/LXD auto-install launchers installed LXD 5.21.8 from the
5.21/stable/ubuntu-24.04 snap channel when called for version inventory.
The operator was informed of the unintended installation. After establishing
proper administrator access, root listings reconfirmed no instances, images,
storage pools or managed LXD networks. `snap remove lxd` completed successfully;
`snap list lxd` confirms it is absent. The specific failed installer unit was
cleared. No development guest has been created.

## Privileged storage evidence

During host upgrade preparation, LVM confirmed `ubuntu-vg` on `/dev/sda3` has
1,761.01 GiB of free extents and retains its existing 100 GiB `ubuntu-lv`.
The separate NVMe group `ubuntu-vg-1` remains allocated to the host root LV.
The intended SATA device was confirmed against the stable identity retained
in the private storage receipt. Its SMART self-assessment passed;
reallocated sectors, uncorrectable errors, program/erase failures and CRC errors
are all zero. These observations support the accepted 512 GiB allocation,
subject to rechecking device identity and free extents immediately before
creation. No volume, filesystem or partition has been changed.

## VM manager research

The operator accepted libvirt/QEMU. A subsequent SSH read still succeeds;
package inventory did not find the queried libvirt/QEMU management packages,
and `virsh` is absent from the remote shell's PATH. Installation remains ahead.
[Libvirt domain configuration](https://libvirt.org/formatdomain.html) documents
whole-domain CPU quotas, vCPU/emulator/I/O-thread controls, memory configuration
and block-device I/O tuning. These match D12's need for explicit host-enforced
limits, subject to verifying the installed version and effective cgroup state.

[LXD 5.21 instance options](https://canonical.com/lxd/docs/v5.21/reference/instance_options/)
support VM vCPU counts and pinning; its documented `limits.cpu.allowance` and
`limits.cpu.priority` options apply to containers. Additional host-side policy
would need separate design and verification for an equivalent whole-VM CPU
budget. The unintended installation does not determine the manager choice.

## Next evidence

Record the next accepted design decision in SPEC; establish privileged access
without weakening authentication; identify the storage owner's permitted scope;
collect current sync/validator and resource-pressure baseline; then implement
and test the agreed guest limits, connectivity and disable/rollback procedure.
The original cloud phases and fleet-readiness status remain unchanged.

## Host administration completed after upgrade

The operator explicitly requested hardware-backed SSH and sudo on tbk-ubuntu,
matching the two existing hosts, plus workstation command `ssh-tbk-ubuntu`.
Fresh hardware SSH and sudo passed first through a loopback-only test listener,
then through the normal SSH port. Ordinary wrapper mode proves no forwarded
agent; `--admin` mode forwards only the existing dedicated hardware agent.
The former software key is rejected. The root-owned sudo key store and saved
recovery configuration are documented in the
[host checkpoint](2026-10-23-host-os-upgrades.md).

This completes D22's host-access work. The separate D23 guest decision follows;
the workstation/host administrative agent must not enter the development VM.

## Accepted guest administration identity

The operator accepted a distinct SSH credential on the existing physical
YubiKey, loaded into a dedicated agent containing only the guest credential.
Only explicit guest administration forwards this agent for hardware-backed
sudo. Normal development sessions and agent workloads receive no forwarded
agent. The new key is authorized only on the guest, whose administration and
workload accounts must remain separate. This narrows D12's prohibition to the
host/fleet administrative identity and resolves the previous D11/D12 conflict.
No new credential has been enrolled and no guest exists yet.

## CPU enforcement research

Libvirt documents a whole-domain `global_period`/`global_quota`, separate from
per-vCPU limits, plus vCPU, emulator and I/O thread placement. Its pinning
settings apply after emulator launch, so an affinity-only configuration cannot
be described as covering startup. Use a pre-existing host cgroup boundary if
the accepted policy requires confinement from process creation, and inspect
actual inherited limits, helper placement and load behavior before admission.
Source: [libvirt CPU tuning](https://libvirt.org/formatdomain.html#cpu-tuning).
The operator subsequently accepted D24: confine the four-vCPU VM to two physical
cores and their four hardware threads, with a combined four-logical-CPU runtime
ceiling covering the VM and its supporting processes. Host workloads remain
eligible for all ten physical cores; these are not exclusively reserved cores.
Recheck sibling topology before choosing exact CPU IDs, then verify enforcement
from startup and under representative workload. No affinity, quota or host
service placement was changed when recording this decision.

## Memory protection research

The operator accepted D25: 32 GiB of guest RAM within a 36 GiB total host-memory
ceiling, no host swap for the VM and no automatic restart after memory-limit
failure. QEMU/helper overhead must be measured; the initial 4 GiB allowance is
not yet proven sufficient. Reclaim pressure at 34 GiB is an implementation
candidate below the accepted hard ceiling. If that ceiling cannot be maintained,
the guest may be terminated and lose running work. Guest-internal swap, if
admitted, stays on the separate guest disk and remains subject to its I/O budget.
No guest, memory control or swap setting was changed when recording the decision.

[systemd resource controls](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html)
document hierarchical CPU placement, memory pressure/hard limits and swap
limits. [Libvirt memory tuning](https://libvirt.org/formatdomain.html#memory-tuning)
warns that an undersized hard limit can kill QEMU. Verify the installed versions,
effective cgroup values and representative peak usage before admitting work;
do not describe the 4 GiB allowance as already proven sufficient.

## Accepted disk I/O policy

The accepted guest disk uses verified spare capacity on the separate SATA SSD
while preserving its old system volume (D17). The operator accepted D26's
combined read/write limits of 100 MiB/s and 5,000 I/O operations per second,
with no extra burst allowance. These are initial values to validate against
a representative development workload, not a measured guarantee of host safety.
No disk allocation or I/O policy has yet been applied.

[Libvirt disk tuning](https://libvirt.org/formatdomain.html#hard-drives-floppy-disks-cdroms)
supports total byte-rate and operation-rate limits, plus a shared group if more
guest disks are later admitted. Verify the installed version, effective limits
and actual read/write throttling using only disposable guest-owned data.
Initial disk preparation also needs explicit rate/concurrency limits so it
does not bypass the eventual guest control. Compare validator and host pressure
with the idle baseline before normal work; do not benchmark staking/backup data.

## Accepted lifecycle and protection policy

The operator accepted D27: guest autostart stays disabled after host boot.
An explicit start requires healthy host/Rocket Pool checks. A host-side guard
requests graceful guest shutdown after sustained client-health failures or
severe host pressure, allows up to 60 seconds, then forces the guest off if it
has not stopped. Any protective stop requires investigation and explicit
restart, with no automatic restart. The operator accepted that forced shutdown
can lose guest work. No guard or guest lifecycle settings have yet been deployed.

The [virsh manual](https://libvirt.org/manpages/virsh.html#shutdown) documents
that graceful shutdown is asynchronous and depends on guest cooperation.
The implementation must verify actual stopped state, distinguish stale/missing
telemetry from healthy readings, and validate signal thresholds against the
available host metrics before enabling the guard. Synthetic signal tests must
not degrade live validators. The guard has authority over the guest only;
it must never stop, restart, reconfigure or remove staking services or data.

## Accepted inbound device scope

A read-only workstation tailnet inventory identifies DankStation, Tom-PC and
beep-worker among the current devices. The operator accepted D28: admit only
DankStation initially, for SSH and explicitly exposed guest development
services. Other devices remain excluded until an explicit scope decision.
Network admission grants neither an SSH key nor an administrator role.
The guest still cannot initiate connections to host/LAN/other-tailnet control
surfaces under D18. No ACL/grant or device enrollment has been changed.

## Credential boundary preparation

The canonical current-shell `op` shim reports the service-account route.
Sanitized vault and item-list operations succeeded: the account can see one
vault containing 39 items. Label-based classification suggests mixed repository,
coding-provider, cloud-deployment and host/network uses, with many unclassified
items. Labels do not establish actual credential capabilities. The existing
vault is not qualified as development-only; D19's dedicated guest vault path
therefore remains the implementation target. No secret value was displayed,
credential transferred, service account created or vault changed by this audit.

The one `op-doctor` run passed current-shell identity and metadata access, but
its user-systemd surface checks lacked a reachable session bus and reported a
fallback PATH finding. Current-shell metadata access was independently proven;
this does not qualify service launch environments. Verify explicit service PATH
and the selected backend on the guest. The desktop Environments MCP is absent
and was skipped; no desktop sign-in or unlock repair was requested.

The operator accepted D29: admit only individually audited repository,
package-registry and coding-provider credentials initially. Cloud-account
authentication and deployment capabilities remain a separate selection. The guest's readonly
1Password permission does not make the stored provider credentials readonly;
their actual remote permissions need independent verification before copying.

## Beep-worker baseline requested

The operator subsequently requested aiming for the setup used on beep-worker.
D30 adopts its documented headless development environment as the baseline.
This comparison uses the dated setup and follow-up receipts below; it is not a
fresh inventory of beep-worker and does not establish current authentication.
No guest, credential or cloud session has been created by this comparison.

| Area | Recorded beep-worker setup | Guest implementation target |
| --- | --- | --- |
| Development | Node/nvm, pinned Bun, Python/uv, Rust/Cargo, Git/build tools, mise, pnpm and portless | Same workflow coverage, current repository pins and verified official sources |
| Containers | Rootless Docker, lingering user service, Compose/Buildx, disposable container and loopback HTTP proof | Same pattern inside the guest; guest services remain inside its host-enforced budget |
| Coding agents | Native Codex, Claude, Cursor, Grok and Muse; separately authenticated local CLIProxyAPI and wrappers | Same admitted provider workflows; preserve approved model routes and qualify each authentication path separately |
| Development credentials | Canonical 1Password shim, shared service account, GitHub CLI and HTTPS Git helper | Canonical shim with the guest-specific account and vault under D19/D29; verify headless retrieval without desktop unlock |
| Reference and proof tooling | Graft shared resource guard, Beep CLI, package proof, detached Yeet jobs and recovery checks | Reuse bounded local tooling and qualification patterns; adapt concurrency to four vCPUs/32 GiB and preserve D18's network boundary |
| Cloud utilities | AWS/Pulumi, Azure, Vercel and Cloudflare logins with successful read operations; Terraform and other utilities installed | The operator confirmed the same tools with coding credentials initially; install cloud tools without signing in under D29/D30 |
| Desktop | Chrome, 1Password Desktop, ChatGPT Desktop and T3 were additional explicit workflows | D15 remains command-line first; expose a web workflow only when selected within D28's device/port policy |
| Administration and recovery | Hardware SSH/sudo, shared fleet admin identity, post-boot service and credential checks | D23's guest-only identity and agent, with guest restart/recovery proof and D27's manual host-boot startup |

Evidence: [initial worker setup](2026-10-14-linux-worker-readiness.md),
[cloud authentication](2026-10-14-cloud-cli-authentication.md),
[AWS/Pulumi backend access](2026-10-14-pulumi-backend-qualification.md),
[Graft resource guard](2026-10-14-graft-resource-guards.md),
[reboot recovery](2026-10-14-reboot-recovery.md), and
[headless GitHub credential recovery](2026-10-14-github-credential-recovery.md).
The cloud receipts prove successful reads, not read-only credential scopes or
deployment readiness. The operator resolved the scope question by selecting
the same tools with coding credentials initially. Cloud-account authentication
and deployment credentials remain deferred; no further parity clarification is
needed before implementing this baseline.

## Storage implementation preparation

D31 selects a new 544 GiB host LV/filesystem to hold the accepted 512 GiB guest
disk, leaving 32 GiB for filesystem metadata and setup headroom. It remains
conditional on fresh stable-device, free-extent and health checks. Use a
dedicated ext4 filesystem with an explicit small reserved-block allowance and
large-file inode profile; preserve the old 100 GiB system volume and LVM metadata.
Only the new filesystem is formatted. Guest image preparation must be bounded
by the accepted aggregate I/O budget and must not write to existing data volumes.

A newly allocated raw LV is not assumed to contain zeros throughout. QEMU
documents raw-file preallocation using `posix_fallocate`; the Linux allocation
contract makes previously unwritten regions read as zeros. The guest receives
the image file rather than the underlying LV. Sources:
[QEMU image options](https://www.qemu.org/docs/master/system/images.html),
[Linux allocation semantics](https://man7.org/linux/man-pages/man2/fallocate.2.html),
and [LVM allocation options](https://man7.org/linux/man-pages/man8/lvcreate.8.html).

A disposable local test imported an 8 MiB QCOW2 source into a preallocated
64 MiB raw target. Conversion preserved the target size, known data and zero
reads, but released some preallocated zero ranges. Reapplying allocation after
conversion restored full allocation and preserved the data/zero checks. The
implementation therefore requires final preallocation and verifies it before
first boot, with guest discard disabled. This is local preparation proof;
the actual SATA ext4 filesystem still needs qualification. No host storage
was changed by these tests, and their disposable files were removed.

## Tailnet policy preparation

Read the current policy through the authenticated Tailscale admin console.
The audit identified policy changes needed to enforce the guest admission
boundary. Exact prior policy is retained privately. Existing service-tag
isolation and regression tests must be retained.

Prepared an unsaved draft implementing D18/D28:

- Give the guest its own operator-owned `tag:tbk-worker` identity at enrollment.
- Use explicit approved device and existing service destinations. Preserve
  current node coverage; future service tags require an explicit rule.
- Admit only DankStation's verified IPv4/IPv6 identity to guest TCP 22.
  Initial development web access uses SSH forwarding. No new Tailscale SSH
  rule, Funnel permission, subnet route or exit-node permission is added.
- Add no guest-source grant. Preserve all existing SSH, Funnel, host-alias,
  other-user and service-tag policy sections.
- Retain all eight original tests and add 24 cases for allowed workstation SSH,
  rejected other-device access, guest egress denial and existing owner reach.

The local node inventory contains ten nodes, with no advertised subnet or
exit-node route in the observed status. The draft uses member/tag destinations
so it does not depend on hard-coding every current destination address.
[Tailscale policy syntax](https://tailscale.com/docs/reference/syntax/policy-file)
documents user/device/tag selectors and the distinction between user-owned
devices and tagged identities. IP-set subtraction cannot remove tags, per the
[IP-set limitations](https://tailscale.com/docs/features/tailnet-policy-file/ip-sets),
so it is not used as an unverified tag-exclusion shortcut.

The browser diff and owner preview show the intended changes. Local comparison
confirms the original tests and unchanged sections are preserved, and the
private before/candidate files match the browser-captured text. The operator then gave the browser-required action-time confirmation. Save
completed, and the persisted JSON semantically matches the approved candidate
(the server reformatted whitespace). All 32 tests are visible in the saved
test listing and passed the save gate. Original policy, candidate, applied
policy, checksums, diff and screenshots are retained privately; the console's
version history also provides rollback. The three existing servers still
answered SSH banner probes, and fresh hardware-backed SSH to tbk-ubuntu
succeeded after the save. No guest is enrolled, so real guest allowed/denied
path tests remain outstanding.


## Initial host implementation after D32

Fresh post-policy hardware SSH and regular sudo succeeded. The login-shell
variant initially fell through to a password without a hardware challenge;
inspection showed its separate PAM file lacked the existing hardware rule.
Its original was saved privately and the same rule was added before the
unchanged recovery includes. A fresh login-shell authentication check remains.
No password was collected as a substitute for the hardware route.

At 20:38 UTC the host had about 101 GiB available, no memory pressure, no
failed services, and all managed validators active with recent successful
attestations. Consensus reported synchronized, non-optimistic and execution
online; execution reported mainnet, no synchronization and 49 peers. This
is a short baseline, not peak-load qualification.

Installed Ubuntu's QEMU 10.2.1 and libvirt 12.0 packages with daemon startup
held during preparation. The package-created default NAT network was disabled
and stopped before guest creation. Removed the package-added user membership
in the new libvirt management group; its management socket is root-only.
Automatic guest restore and TCP/TLS management sockets are disabled. A
fail-closed QEMU hook currently rejects every guest start while protection
qualification is incomplete. There is still no defined or booted guest.

The aggregate `tbk.slice` contains the management/logging daemons and all
provisioning jobs. Kernel files verify CPUs 8, 9, 18 and 19 (two physical
cores), 400000/100000 CPU quota, 34 GiB memory-high, 36 GiB memory-max and
zero swap. A conservative host I/O backstop gives reads and writes each
50 MiB/s and 2,500 operations/s, keeping their sum within D26. This means
a read-only or write-only stream is initially limited to half the combined
budget. Domain-level combined throttling and runtime load proof remain.

Fresh stable-device/LVM/SMART checks passed. Saved LVM metadata, created only
the new 544 GiB SATA LV, formatted it as ext4 with one percent reserved space,
and mounted it at the owned worker pool with nodev/nosuid/noexec. The old
100 GiB LV remains at its original extents. The 512 GiB raw image is fully
preallocated, with about 26 GiB filesystem headroom after reservation. Sample
zero reads passed before import. Ubuntu's official Server 26.04 cloud image
passed the installed cloud-image keyring signature, SHA-256 and QEMU content
comparison. Preallocation was reapplied after conversion, the full image size
remains 512 GiB, and a tail zero sample passed. The expected comparison size
warning reflects the deliberately larger destination; content matched.

Created the approved guest-only YubiKey identity with the masked Plasma
process available for its enrollment PIN. A separate workstation agent holds
exactly that one identity. Temporary enrollment adapters were removed. The
host/fleet agent was not forwarded to a guest. Guest SSH/sudo proof remains.

Host resource-control and image-verification mechanisms follow
[libvirt cgroup partitions](https://libvirt.org/cgroups.html),
[systemd resource controls](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html),
and [Ubuntu image verification](https://ubuntu.com/docs/public-images/public-images-reference/artifacts/).
Actual guest execution and protection admission remain separate gates.

## Network and stopped-domain qualification

The worker network uses a dedicated bridge and static IPv4 addressing, with
public resolvers and no host DNS/DHCP service. A separate host nftables table
rejects private/reserved destinations, the host's observed public address,
local host services, source spoofing, IPv6 underlay and forwarding through any
interface except the physical uplink. Only established replies may enter the
worker bridge. Narrow iptables acceptance rules coexist with the existing
Docker/UFW/Tailscale stack. The worker network has no autostart.

A disposable network namespace on that bridge first exposed an overly strict
connection-state expression that blocked DNS replies. It was corrected before
any guest boot. The repeated probe passed public HTTPS/DNS, rejected host SSH,
execution/consensus APIs and both host/workstation private tailnet addresses,
and incremented the private-destination and source-spoof drop counters. The
probe namespace, veth pair and resolver file were cleaned up. Host-WAN and
IPv6-specific probes and actual guest overlay tests remain outstanding.
These are host-underlay checks, not proof of guest Tailscale enrollment.

The secret-free cloud-init seed contains the guest public key, `tbkadmin` and
`worker` accounts, key-only SSH, admin-only agent forwarding, and the previously
verified PAM module. Workloads have no sudo grant. Domain XML validates and is
defined with four vCPUs, 32 GiB memory, the aggregate resource partition, shared
100 MiB/s and 5,000 IOPS disk throttling, no balloon, no shared host filesystem
or device passthrough, and a userspace network backend. Autostart and managed
restore are disabled. A test start was rejected by the preparation hook; the
VM remains shut off and has never booted.

## Accepted first health-guard timing (D33)

Accepted by the operator on 2026-10-23: require 60 consecutive healthy seconds before
manual startup, then tolerate at most 90 seconds of continuous client-health
failure, missing telemetry or severe host pressure before the accepted graceful
shutdown/60-second forced-stop sequence. Initial severe
pressure thresholds are available memory below 16 GiB, memory full-stall
average above one percent, or I/O full-stall average above ten percent; require
at least 48 GiB available before starting the 32 GiB guest. Chain heads older
than 60 seconds, unsynchronized/optimistic/offline client state, or stale
validator activity are failures. Calibrate using fresh observations and prove
persistence/recovery with synthetic signals. Lost isolation/resource controls
must fail closed without waiting for the health tolerance.

### Guard and pre-boot qualification

The host guard and firewall restoration services are now installed and enabled.
The guard runs outside the guest's resource group, with its own small CPU/memory
limits, so guest exhaustion does not consume its budget. It checks every
15 seconds, requires fresh health readings, verifies CPU/memory/disk and network
boundaries, and refreshes the denied host public address. A watchdog or service
stop invokes a separate guest-only protection service. The force-stop fallback
validates the QEMU process identity and uses a process descriptor if libvirt
cannot answer. A stopped guest creates no unnecessary protective-stop latch.

Eight synthetic test cases pass on workstation and host, including brief-fault
recovery, the 90-second deadline, immediate boundary failure, stale/insufficient
start readings, graceful shutdown, unresponsive-libvirt fallback, and the actual
shell hook's single-use/expired/invalid permit behavior. These tests use fake
time and processes; they do not disturb staking services. Actual running-guest
shutdown and watchdog-loss acceptance remain required.

The manual start command performs fresh boundary checks and requires an active
guard, 60 healthy seconds and 48 GiB free memory. Its root-only permit lasts
30 seconds and is consumed by the libvirt preparation hook. The hook also checks
a fresh health stamp. Direct libvirt start without a permit was rejected while
the domain remained shut off. AppArmor initially blocked an external helper;
the corrected hook uses shell builtins and only narrowly scoped access to its
permit and health files, retaining libvirt's existing execution restrictions.
Firewall restoration was restarted successfully while the guest was off; guard
loss correctly observed an already-stopped guest without creating a restart lock.

Additional underlay probes pass: the host public-address path was denied with
matching firewall counters, and IPv6 could not connect even with an explicit
guest route and neighbor entry. IPv6 is disabled on the bridge; this probe does
not claim that the redundant IPv6 firewall rule saw a packet. Temporary probe
interfaces/namespaces were removed.

Aligned direct reads and writes of a fully written disposable 512 MiB pool file
each took 10.23 seconds, approximately 50 MiB/s. This verifies the conservative
host backstop in each direction; QEMU's combined 100 MiB/s/5,000-IOPS throttle
still needs runtime inspection. An earlier utility-based direct-read attempt
failed, and a read of unwritten image regions measured zero-fill behavior rather
than disk throughput; neither was accepted as proof. The disposable file was
removed, and a fresh live health snapshot reported no client failures and about
101 GiB available memory before first boot.


## First boot, containment and access qualification

The worker has now booted through the approved health gate. This supersedes the
earlier preboot checkpoints. Cloud-init completed without errors. The Ubuntu
26.04.1 guest has four vCPUs, 32 GiB assigned memory, a 512 GiB disk and no swap.
The QEMU process is confined by its enforcing AppArmor profile and the aggregate
CPU, memory, swap and disk limits; its threads remain within the selected CPUs.

- An aligned direct-I/O test measured approximately 50 MiB/s for reads and writes
  separately, matching the conservative host backstop. The QEMU combined limit
  remains 100 MiB/s and 5,000 operations per second, without burst allowance.
- A bounded load test touched 28 GiB and ran six CPU workers. Aggregate host-side
  memory peaked at 33.88 GiB, below the 36 GiB ceiling, with zero swap. Every
  sampled health check remained healthy. Its average CPU use across allocation
  and compute phases was about 2.50 logical CPUs; this is not a measured
  four-CPU sustained-throughput claim.
- The approved Tailscale enrollment completed with only the worker tag. Actual
  workstation SSH and guest-only YubiKey administration succeeded. Ordinary
  worker sessions have no forwarded agent and cannot sudo. The administrative
  session exposes only the dedicated guest key and successfully authenticates
  sudo with a hardware touch.
- Guest-initiated tailnet SSH to the host and workstation was blocked over both
  address families. Host-initiated SSH to the guest was also blocked. Earlier
  underlay private-address, local-service, spoofing and WAN-hairpin tests passed.
- Stopping the guard service caused a graceful guest shutdown in about four
  seconds. A separately controlled freeze of the exact QEMU process caused
  forced termination after the 60-second allowance plus a five-second control
  timeout. Both stops were verified, and the guest stayed off until explicit
  acknowledgement and manual startup. Host client health remained healthy.
- The restart latch specifically rejected startup even after the healthy window
  passed. Controlled-test receipts were archived before acknowledging each latch.
  No staking service was restarted or reconfigured by these tests.

These are bounded qualification results. Development tool installation, audited
credentials and representative repository/provider workflows remain open.


## Dedicated credential account and headless installation

The operator approved creation of the restricted service account and its protected
guest installation. Live 1Password details show one read-only vault, zero
environments and no vault-creation permission. Token delivery used only process
memory and SSH stdin; no token entered a transcript, command argument, clipboard
or intermediate transfer file. The final guest credential store is mode 0600,
and the human-only vault holds a recovery copy. A scoped headless doctor verifies
the service-account identity and exact vault set. The vault remains empty.

The workstation doctor initially required a workstation-specific implementation
file and broader vault inventory. Porting those assumptions would contradict
the worker's accepted scope. The installed guest doctor instead checks only the
approved vault, credential ownership/modes, shell/service PATH and absence of
credentials or an SSH agent in the user manager. This is configuration proof,
not proof of reading an admitted provider credential.

Installed the current repository-pinned Node 24.22.1 and checksum-verified Bun
1.4.4, plus uv-managed Python, Rust and mise. Rootless Docker is enabled for the
unprivileged worker; root Docker/containerd services are masked. A disposable
container and an nginx Compose service bound to loopback both passed and were
removed. Provider CLIs and cloud tools are being installed from vendor sources;
cloud sign-ins remain deferred. Native/provider authentication is separate.

The guest's network manager recreated an IPv6 link-local address after reboot,
despite the early sysctl. Added an explicit empty link-local policy to its network
configuration and applied it; the address is absent. The independent host-side
IPv6 underlay restrictions continued to protect the boundary throughout.

## Real pressure stop and diagnostic restart

During concurrent tool installation and repository qualification, the guard
observed sustained host I/O full pressure above the accepted threshold and
stopped the guest gracefully at 21:51 UTC. The latch recorded `io_pressure` as
the only reason. The existing guard records labels, not a numeric pressure
history, so that event alone cannot distinguish VM throttling from shared host
contention or establish a causal effect on staking.

The inspected validator logs showed all managed validators active, successful
attestation publications and no validator warnings/errors.
Execution logs had no warning/error lines. Consensus logged one rejected gossip
block with an invalid proposer signature; no kernel storage error was found in
the inspected window. These observations do not establish every attestation's
on-chain inclusion or prove the absence of all performance impact.

After host health recovered, archived the latch with an investigation receipt
and explicitly acknowledged it for a diagnostic restart. No limit, threshold,
fault tolerance or network policy changed. A temporary bounded observer samples
host, worker and staking-container I/O pressure plus physical-device counters
every five seconds. Work is now serialized during qualification.

The repository log survived the stop and proves that frozen install, Beep CLI,
and the representative package's quick lint/type checks had already completed
successfully, with a clean checkout. Peak job memory was 9 GiB and zero swap.

Restart qualification found the distribution's late environment configuration
overrode the worker's service PATH. Moved the worker configuration after that
vendor file, including mise shims and rootless Docker. The default empty user
SSH-agent socket also exported its address into the user manager. Masked that
worker-only socket/service and the unused GPG SSH socket. The administrative
forwarded guest-only YubiKey route is separate. Fresh checks confirm Docker and
the coding proxy have no SSH agent or OP credentials in their environments;
the scoped 1Password doctor passes again. Guest underlay IPv6 remains absent,
and the completed security update does not require another reboot.

GitHub passkey authentication succeeded. The operator approved a 30-day
fine-grained token limited to the Beep repository: Contents, Issues and Pull
requests read/write; Actions and required Metadata read-only; no organization,
administration, secrets or Workflows permissions. Expiration is November 22,
2026. Creation, vault storage and worker authentication still need final proof.

## Repository credential and serialized qualification

Created the approved fine-grained GitHub token and saved it as a concealed API
credential in the dedicated development vault. The one-time token moved from
the GitHub page to the vault field only in process memory. It was not printed,
copied to the clipboard or placed in an intermediate transfer file. Final
GitHub details confirm exactly the approved repository and permissions, with
November 22 expiration and zero organization permissions.

The guest service account can read that single admitted item. The `gh` adapter
resolves it for its child process; the HTTPS Git credential helper only returns
it to Git's pipes for the selected repository and refuses other destinations.
No duplicate GitHub token is stored in a local Git credential file. Authenticated
identity and Actions-result reads pass. A push dry run authenticated successfully;
a subsequent remote-ref check confirms that no proof branch was created. This
is transport and authorization proof, not a published commit or pull request.

A second, serialized representative lint/type check passed in 51 seconds with
5.1 GiB peak memory and no swap. The checkout remains clean. Eleven canonical
reference members were provisioned sequentially through the repository CLI;
new SSH origins were converted to their HTTPS equivalents. No admin agent,
provider credential, dependency installation, deep model pass or refresh timer
was used for those clones. Structural graph/query qualification is separate.

Verified installed versions include Docker 29.9.2, 1Password CLI 2.41.1,
Azure CLI 2.91.0 and Ansible core 2.21.5. The distribution GitHub CLI is 2.46.0;
its scoped API and Git authentication paths pass. Native coding-provider sign-in
is in progress; a waiting OpenAI passkey challenge is not authenticated proof.

## Reference proof and pressure observations

All eleven provisioned reference checkouts are clean. The Effect structural
build parsed all 1,967 input files, creating 23,903 nodes and 50,289 edges, with
no reported parse failures. Its freshness check reports `graph.ok=true`, and a
source-backed query returned file locations. Pending meaning summaries remain
expected: no deep pass or model quota was used. This proves Effect's member
graph, not every member graph or an unscoped aggregate graph.

The 20-minute diagnostic observation retained 240 samples. Peak full I/O avg10
was 22.47% at host scope and 34.27% in the worker group. Corresponding maxima
in the execution, consensus and validator groups were 0.31%, 1.07% and 0.00%.
These are per-scope peaks across the window, not necessarily simultaneous
readings. Short host-pressure spikes recovered; no further protective stop
occurred during serialized repository/reference qualification. This supports
keeping initial work serialized, not weakening the accepted host threshold or
claiming the original stop was a false alarm.

Added numeric host memory/I/O pressure to each guard journal sample and its
current health file; future protective-stop receipts include the last health
record and its timestamp. The diagnostic copy is optional so a missing or
malformed record cannot prevent emergency stopping. Nine synthetic tests pass
locally and on the host. Installed the exact tested file with the VM stopped,
preserving the previous version. All limits, thresholds and deadlines are
unchanged. Fresh live health records contain the numeric measurements.

Installed the baseline worker proof launcher and its separate workload/control
slices with no swap. The launcher selects one cheap-gate lane and removes the
SSH agent. Its help path passes; the prior real bounded repository job is the
workload evidence. Full detached Yeet and all-provider inference remain separate
acceptance. Home instructions describe the guest's actual limits and credential
scope instead of copying workstation privilege/desktop assumptions.

OpenAI's existing-account passkey challenge was not completed before the
bounded CLI sign-in expired. Closed the expired browser attempt and discarded
its private code output. Codex reports not logged in; no provider readiness is
claimed from installation alone.

## Final guest restart checkpoint

The guest was shut down cleanly after owned jobs completed, then started again
through the unchanged healthy-window gate. Host-side checks confirm the guest
running with four vCPUs, 32 GiB RAM, automatic startup disabled, no protective
latch and no failed host systemd units. The live guard boundary/client snapshot
reports no failures and 97.2 GiB available host memory. Guest-agent network
inspection confirms the underlay IPv6 address remains absent after this boot.

Three fresh ordinary worker SSH attempts failed at the hardware signing step.
Each finished before the next request; after the third, released all requests
under the operator's attempt limit. No password fallback, bypass or changed
SSH/PAM policy was used. The final post-boot user-service PATH, credential and
provider checks are therefore pending, even though their live pre-restart
checks passed. The prepared read-only checker has not been run for this boot.
The earlier guest administrative and ordinary SSH proofs retain their original
scope. All owned maintenance root shells and SSH connections were closed.

The worker remains running behind the guard; coding-provider authentication is
not complete. The next operator-present continuation starts with a fresh ordinary
YubiKey login, executes the prepared post-boot checks, and then completes native
and proxy coding-provider sign-ins. Cloud sign-ins remain deferred.

## Operator-present authentication continuation

The operator authorized a fresh authentication round. Ordinary guest-only
YubiKey SSH succeeded. The prepared post-restart checker now passes all twenty
checks: new boot, enabled and active rootless Docker/proxy, correct user-service
PATH and serial quality default, no SSH agent or OP credentials in the user
manager or service processes, scoped 1Password operation, GitHub identity and
Actions read, no swap, no underlay IPv6, clean checkout, and authenticated-only
proxy access. The private receipt is `post-reboot-proof.json` in the worker
bootstrap cache. Its zero proxy models reflects the pre-provider-login state.

Fresh native Codex authentication completed through the operator's OpenAI
passkey and the CLI-originated device code. A bounded inference-only check on
GPT-6.1-Sol at medium effort exited zero in 5.8 seconds, returned the exact
requested marker and emitted zero tool events. Native Claude subscription
authentication also completed after explicit approval of its displayed scopes,
including connector and plugin management. Its Fable 5.1 medium check exited
zero in 3.3 seconds with the exact marker and a non-error result. No API billing
account or new paid credential was created.

Cursor native authentication succeeded, but the first inference check stopped
before model execution because its sandbox could not start under Ubuntu's
AppArmor user-namespace restrictions. This is an execution prerequisite failure,
not an authentication failure or successful inference. The official Cursor
Linux documentation prescribes its standalone CLI AppArmor support profile;
targeted remediation is in progress without disabling system-wide restrictions.
Grok, Muse and separate proxy-provider qualification remain open at this
checkpoint. Native authentication does not establish proxy authentication.

## Completed provider authentication and bounded inference

The operator approved Grok's displayed persistent identity/API/Grok.com scope.
Its fresh native device login completed, followed by Muse's own Meta device
login. Muse's official launcher installed Muse Code 1.4.12. Native and proxy
credentials were created on this guest; no prior machine's authentication
directory was copied.

| Native route | Selected model and effort | Result |
| --- | --- | --- |
| Codex | GPT-6.1-Sol, medium | Exit zero, exact marker, zero tool events, 5.8 seconds |
| Claude | Fable 5.1, medium | Exit zero, exact marker, non-error result, 3.3 seconds |
| Cursor | Opus 5.5 medium | Authentication and sandbox startup pass; inference blocked by Opus subscription quota, reset November 11 |
| Grok | Grok 4.7, medium | Exit zero, exact marker, one model call/turn, 4.4 seconds |
| Muse native | Spark 1.3, medium | Exit zero, exact terminal marker, one model response task, 1.7 seconds |

Muse's first smoke used the temporary directory as its workspace, which the
runtime rejects because process-lifetime output would be inside the workspace.
A dedicated empty test directory resolved this without disabling protection.
The passing run disabled shell, writes, web tools, reminders and human-input
tools. Original failed receipts remain alongside corrected evidence.

Cursor's initial failure was resolved with a root-owned profile derived from
the official Cursor 0.6.2 support package. It covers only the worker account's
CLI helper path, explicitly enables user namespaces for AppArmor 5, permits
self-signals, and adds `dac_override` for the observed `newuidmap` denial.
The exact installed profile has SHA-256
`534818be8134ad9dd91da9d9a3aecaa85e1f4bf12f9edff4a6100a7e76118d42`.
Syntax validation and profile loading pass; AppArmor remains active and
`apparmor_restrict_unprivileged_userns` remains one. Cursor then initialized
the approved medium model with sandboxing enabled and returned its account
quota error. No spending limit, alternate model or global security change was
used. The fresh guest-only administrative SSH/sudo round succeeded; its root
shell and forwarded-agent connection were closed after verification.
See [Cursor's documented standalone Linux prerequisite](https://cursor.com/docs/agent/security/run-modes).

Four separate CLIProxyAPI logins completed for OpenAI, Claude, xAI and Meta.
The temporary loopback callback tunnel for Claude was removed after login.
The local proxy advertises 62 models, including all four accepted selections.
Installed `claudex`, `claudeg`, `claudep` and `claudem` wrappers; each reads the
proxy credential privately, removes OP variables and the SSH agent, and
executes Claude Code against loopback. All four returned exactly `4` to a
bounded arithmetic prompt, exited zero and reported non-error results:
GPT-6.1-Sol medium (3.5 seconds), Grok 4.7 (2.7), Fable 5.1 (4.0), and Muse
Wonder 1.0 medium (2.8). Built-in tools were disabled and MCP configuration was
strictly empty. No broad provider tool, SDK or concurrency qualification is
claimed. Claude and Grok default model/effort pins now match repository policy.

After restarting the proxy service, sixteen final worker checks pass: both
background services active; no administrative agent or OP environment in the
services/user manager; ordinary SSH has no agent; all four proxy model families
restored; unauthenticated API access returns 401; five native and four proxy
credential files are worker-owned and mode 0600; checkout clean; no swap;
scoped 1Password and GitHub Actions reads pass; all eight successful native/
proxy inference receipts validate. Cursor remains explicitly quota-blocked.
The private final receipt is `final-provider-proof.json`; all individual proofs
and original failures remain in the worker bootstrap cache.

## Final host health after provider qualification

Fresh host SSH and hardware-backed sudo succeeded. The first sudo touch
expired, its password fallback was cancelled, and the second announced touch
succeeded. The read-only guard snapshot reports no boundary or client failures
and 96.5 GiB available host memory. The current guard record is healthy, less
than nine seconds old, with roughly ten consecutive healthy minutes and both
memory/I/O full-pressure averages at zero. The domain is running, autostart is
disabled, both guard services are active, no protective latch exists, and no
host systemd unit is failed. Saved `final-auth-host-check.json` in the protected
host bootstrap receipt directory. Both the root shell and host SSH session
were then closed and the owned touch notification removed.

This admits initial serialized development under the existing limits. It does
not establish arbitrary workload safety, uninterrupted historical attestation
inclusion, or a live host-reboot recovery test. Those scopes, the Cursor quota
blocker, and the packet's broader cloud/publication work remain distinct.

## Operator parking decision

On October 23, the operator selected “Park setup here; keep the verified worker
ready.” Setup work is parked at the verified checkpoint above. The worker was
left running under the existing guard, resource limits and network policy;
manual startup after host reboot remains the agreed policy. No further
qualification, credential changes, publication or monitoring was started for
this parking decision. Maintenance sessions and temporary authentication
resources were already closed. Resume further setup only on operator request;
retain the Cursor quota blocker, broader qualification boundaries and local
uncommitted documentation state in the handoff.

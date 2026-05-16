# P1 Pause Handoff - 2026-05-14

Status: paused by operator request; P1 remains blocked.

## Pause Reason

The operator paused the P1 live proof run for the day after completing the
initial local Windows VM operating-system install. No macOS or Windows proof
artifact bundle was produced before the pause.

## Preserved Repository State

- Branch at pause: `feat/stack-installer-p1-live`.
- P1A and the P1 live harness remain implemented and committed on the branch.
- P2 AI Mode, MCP runtime, recovery, portability, signing, and distribution
  work remain untouched.
- The post-proof `$quality-review-fix-loop` remains pending and must not run
  until real macOS and Windows proof artifacts exist and pass
  `p1:proof:audit-all`.

## Windows VM State Before Cleanup

- Local libvirt VM name: `stack-installer-win11`.
- Virtual disk size had been reduced from 128 GiB to 80 GiB.
- Windows 11 Enterprise Evaluation was installed.
- A Windows user was created through a Microsoft account sign-in.
- The operator recorded the Microsoft account username, Microsoft account
  password, and VM PIN in 1Password. Do not commit those references or values;
  retrieve them from 1Password interactively if the VM route is recreated.
- A clean-installed bootable base image was created briefly at
  `/var/lib/libvirt/images/stack-installer/stack-installer-win11-clean-installed.qcow2`,
  then removed during cleanup at the operator's request.

## Cleanup Performed

The local VM route was cleaned up to return host storage:

- Stopped the tokenized proof upload servers and detached proof watcher.
- Discarded the stale local proof upload token and generated ignored proof
  window files under `output/stack-installer/p1-live`.
- Shut down and undefined the libvirt domain `stack-installer-win11`.
- Removed the VM active disk:
  `/var/lib/libvirt/images/stack-installer/stack-installer-win11.qcow2`.
- Removed the temporary clean-installed base image and metadata:
  `/var/lib/libvirt/images/stack-installer/stack-installer-win11-clean-installed.qcow2`
  and
  `/var/lib/libvirt/images/stack-installer/stack-installer-win11-clean-installed.txt`.
- Removed the temporary helper ISOs:
  `/var/lib/libvirt/boot/stack-installer/stack-installer-p1-windows-helper.iso`
  and
  `/var/lib/libvirt/boot/stack-installer/stack-installer-p1-windows-helper-v2.iso`.

Post-cleanup verification showed no `stack-installer-win11` libvirt domain, no
matching qemu/virt-viewer/proof-upload/proof-watch processes, and the VM image
directory reduced to `4.0K`.

The official installer cache was intentionally kept to avoid a re-download:

- `/var/lib/libvirt/boot/stack-installer/windows-11-enterprise-eval-25h2-x64.iso`
- `/var/lib/libvirt/boot/stack-installer/virtio-win.iso`
- `/var/lib/libvirt/boot/stack-installer/Windows11EnterpriseHashValues.pdf`

That cache was `7.4G` at pause time. Remove
`/var/lib/libvirt/boot/stack-installer` only if reclaiming those extra
installer gigabytes is more important than avoiding another download.

## Proof State At Pause

Required proof bundles remain missing:

- `output/stack-installer/p1-live/stack-installer-p1-macos.tgz`
- `output/stack-installer/p1-live/stack-installer-p1-windows.zip`

Required extracted proof directories remain missing:

- `output/stack-installer/p1-live/macos/`
- `output/stack-installer/p1-live/windows/`

Because the upload window was stopped and its stale token discarded, resume by
starting a fresh upload window instead of reusing any old token.

## Resume Checklist

1. Recreate or choose a real Windows proof environment.
   - For the local VM route, create a new 80 GiB qcow2 disk under
     `/var/lib/libvirt/images/stack-installer/`.
   - Reuse the kept Windows Enterprise Evaluation ISO if it is still present.
   - Use SATA disk and `e1000e` networking so Windows setup can see disk and
     network without VirtIO driver loading.
2. Recreate the non-secret helper ISO or copy the current commands from
   `ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md`.
3. Start a new tokenized upload window from repo root:

```bash
node initiatives/stack-installer/ops/start-proof-upload-window.mjs \
  --host 100.117.213.114 \
  --port 8765 \
  --output-root output/stack-installer/p1-live \
  --advertised-url http://dankputer.tailc7c348.ts.net:8765 \
  --replace-existing
```

4. Start a new detached proof watcher:

```bash
node initiatives/stack-installer/ops/start-proof-watch-window.mjs \
  --output-root output/stack-installer/p1-live \
  --watch-attempts 120960 \
  --watch-interval-ms 5000 \
  --replace-existing
```

5. Run the Windows proof using
   `initiatives/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md`.
6. Obtain the macOS proof from a real macOS environment.
7. After both bundles land, run:

```bash
cd apps/stack-installer
bun run p1:proof:intake -- --output-root ../../output/stack-installer/p1-live
bun run p1:proof:audit-all -- --output-root ../../output/stack-installer/p1-live
```

8. Only after `p1:proof:audit-all` passes, run the post-proof
   `$quality-review-fix-loop` and update
   `history/outputs/p1-pr-readiness-review.md`.

## Stop Conditions Still In Force

- Do not paste plaintext Microsoft, Discord, 1Password, Claude, Codex, or
  upload-token values into repo files, chat, logs, PR comments, or screencasts.
- Do not mark P1 or the active `/goal` complete until macOS and Windows proof
  artifacts exist, `p1:proof:audit-all` passes, the manifest/history are
  updated with final proof evidence, and the post-proof review has zero
  required blockers or explicit waivers.

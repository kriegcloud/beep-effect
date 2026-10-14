# Reboot recovery qualification — 2026-10-14

Status: **pending physical-console diagnosis; recovery not qualified**.
The operator selected reboot recovery after the proxy route receipt. The
worker readiness checkout was at
`6d6cec22b5164ef9830b5171e7c7ad580b098d96` before reboot.

## Preflight and authorized reboot

- No systemd user jobs or active detached proof services were running.
- Docker, T3 and CLIProxyAPI user services were active and enabled.
- Tailscale, SSH service/socket, UFW and fail2ban were enabled.
- User lingering was enabled and the desktop seat reported idle.
- The remaining SSH-launched Claude process was identified by exact argv
  membership as an old `auth login --claudeai` process, not a development run.
- Recorded the old boot id `628bce3b-4dde-44be-a7dc-5d604f9efd89`, source,
  manifest hash and hashes of the eight existing repository changes in private
  worker `~/.cache/beep/readiness/reboot/preflight.json`.
- Used the existing ssh-beep-worker-yubi admin wrapper and a real PTY. Remote
  sudo requested a YubiKey touch; `sudo -v && sudo -n systemctl reboot`
  completed with the SSH command exiting zero and its connection closing.
  No password substitute or permission weakening was used.

## Current observation

The pre-reboot SSH control socket disappeared. Repeated bounded port/banner
probes have not found SSH at tailnet `100.91.48.48` or last LAN `192.168.1.8`.
Local Tailscale status reports the peer offline. These facts do not identify
whether firmware selected another disk, boot is stalled, Ubuntu networking is
unavailable, or the LAN address changed. Firmware boot priority was not
previously qualified; that is a candidate to inspect, not a confirmed cause.

Requested the monitor state through the structured operator prompt. No fresh
SSH authentication was launched against an unavailable service, and no
authentication wait remains pending. No disk, firmware, bootloader or network
configuration was changed in response to this uncertainty.

## Required completion

Use the physical-console observation to diagnose boot/access, then establish
fresh key-authenticated SSH. Verify a new boot id, preserved source/manifest/
existing-file hashes, Tailscale, user lingering, Docker, T3 and CLIProxyAPI,
runtime versions and ordinary model checking. Verify security service health
through the appropriate authorized privilege route. Enabled-before-reboot
does not establish automatic post-boot recovery.

The local receipt cannot yet be synchronized to the offline worker. Its last
synchronized readiness source remains 6d6cec22b5. Do not close reboot acceptance
or fleet readiness based on the successful reboot command alone.

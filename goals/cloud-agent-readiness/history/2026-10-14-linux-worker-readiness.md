# Linux worker setup checkpoint — 2026-10-14

## Scope and provenance

The operator expanded cloud-agent-readiness to managed Linux development and
agent readiness, authorized reusing the workstation 1Password service account,
and requested Grok, Muse, CLIProxyAPI and broad development/cloud CLI parity.
The display title changed; packet id/path and original cloud history remain.
CLI/agent/headless parity is the baseline. Subsequent explicit additions are
Chrome (default browser), 1Password Desktop, the workstation's ChatGPT/Codex
desktop application and T3 Code. Human browser/account setup follows installation.

## Completed steps and proof

1. Confirmed installed Ubuntu 26.04.1 on beep-worker's Inland SSD. Its ext4 root
   already occupies the drive; there is no LVM expansion to perform. Existing
   Windows storage was preserved. Legacy BIOS GRUB boots; default firmware boot
   priority remains a separate physical-console verification.
2. Established bootstrap SSH without printing or saving the account password.
   Installed the existing YubiKey ED25519-SK public key; fresh key auth passed.
3. Inspected dankserver's actual PAM configuration: it uses **libpam_rssh.so**,
   not the older pam_ssh_agent_auth module in its historical recipe. The latter
   rejected the FIDO key. Deployed the same trusted module with saved PAM config,
   root-owned permitted key file and preserved SSH_AUTH_SOCK. `sudo -k; sudo -v;
   sudo -n id -u` requested a YubiKey touch and returned `0`.
4. Enrolled Tailscale and verified its Running state and fresh FIDO SSH over the
   tailnet. Disabled root/password/keyboard-interactive SSH; required publickey
   and touch; removed the bootstrap LAN firewall rule. UFW permits SSH through
   tailscale0, and fail2ban's systemd-backed SSH jail is active. Security updates
   do not force reboot; AC inactivity suspend is disabled.
5. Installed the canonical 1Password PATH shim and helper scripts. Transferred
   the explicitly authorized service account directly over SSH to mode-0600
   storage. `op vault list` succeeded with output suppressed; identity reports
   SERVICE_ACCOUNT. No credential values enter this packet.
6. Installed development tools from vendor or distro sources. Bun archive
   matched the repository's pinned SHA256. Configured shell startup so fresh
   noninteractive SSH resolves the intended tools.
7. Configured rootless Docker, enabled its lingering user service and disabled
   root Docker/containerd services. A disposable hello-world image ran; a
   disposable nginx Compose service answered HTTP on loopback, then was removed.
8. Authenticated GitHub CLI and configured its HTTPS Git credential helper.
   Authenticated native Codex, Claude Code, Cursor Agent, Grok and Muse. Muse
   verified Model API access; Grok's model-catalog query succeeded.
9. Installed checksum-verified CLIProxyAPI release, a loopback user service,
   protected client key/config, and separately authenticated Claude, Codex,
   xAI and Meta providers. Its authenticated catalog contains 62 models and the
   expected native/proxy aliases. Installed claudex, claudeg, claudep and claudem.
10. Cloned a clean checkout, ran `bun install --frozen-lockfile` (2,647 packages),
    `bun run beep --help`, and `bun run beep quality package-verify @beep/types
    --quick`: lint and typecheck passed. The checkout remained clean.

## Verified tool versions

| Tool | Worker version |
| --- | --- |
| Node / nvm | 24.21.0 / 0.40.8 |
| Bun | 1.4.2 (repository pin) |
| Python / uv | 3.14.8 / 0.12.23 |
| Rust / Cargo | 1.99.0 / 1.99.0 |
| Docker / Compose / Buildx | 29.9.0 / 5.6.0 / 0.38.0 |
| 1Password CLI | 2.41.0 |
| Codex / Claude Code | 0.162.1 / 2.1.299 |
| Cursor Agent | 2026.10.14-0f9edde |
| Grok / Muse | 1.0.57 / 1.4.7-R6101.1 |
| CLIProxyAPI | 8.0.27 |
| mise / pnpm / portless | 2026.10.8 / 12.11.2 / 0.15.8 |
| Pulumi / Terraform | 3.267.0 / 1.15.9 |
| AWS CLI / aws-vault | 2.37.9 / 7.16.2 |
| Ansible core / rclone / direnv | 2.21.5 / 1.75.2 / 2.37.1 |

## Remaining work and claim boundaries

- Install/verify Azure, Vercel, Wrangler/cloudflared and explicit desktop additions;
  complete their actual authentication and workflows separately from installation.
- Perform the broader workstation scan and identify portable config versus
  desktop/host-specific paths and services. Original cloud phases remain pending.
- Proxy has one authenticated account per provider. Workstation inventory had
  five Codex, four Claude, one xAI and one Meta account; account-pool parity is
  not established. No paid inference has been used as a substitute for proof.
- AWS/Pulumi tools are installed; credential-route and actual service-operation
  verification remain separate. No infrastructure deployment has been performed.
- Launch bounded headless sessions after baseline setup, instruct them to record
  command evidence and friction, then convert findings into goal additions.
  Tests receive no forwarded administrator agent and cannot modify cloud or
  staking resources, install packages, or access credential stores.
- Neither dankserver nor the staking host is newly provisioned by this checkpoint.
  Any tbk-ubuntu development worker requires isolated compute/storage boundaries.

## Recovery

PAM and SSH originals are saved on the worker under the security-bootstrap backup
directory. Recovery sessions stayed live while changes were verified. Revoke
worker service-account access by removing its credential or rotating the shared
account. Disable the user Docker/proxy services to reverse their runtime setup.

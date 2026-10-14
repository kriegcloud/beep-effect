# Readiness friction ledger

| Date | Friction and evidence | Prevention or proposed goal addition |
| --- | --- | --- |
| 2026-10-14 | Historical sudo recipe said pam_ssh_agent_auth; the live dankserver PAM file uses pam_rssh. Old module rejected ED25519-SK before a touch. | Treat live managed-host configuration as the source; pin/build the FIDO-aware module reproducibly and verify fresh sudo. |
| 2026-10-14 | Fresh FIDO SSH requests can expire while unrelated browser approvals are being completed; two agent-refused attempts preceded a successful third attempt. | Persistent touch notifications, serialized hardware operations and bounded retries. |
| 2026-10-14 | Compose HTTP probe raced nginx startup: curl returned an empty reply immediately after up. | Poll a bounded real HTTP readiness check and always tear down the disposable service. |
| 2026-10-14 | 1Password service-account item reads require --vault even for an item UUID. Doctor confirmed service-account identity; vault-scoped retry follows. | Inventory full UUID references and verify the actual required operation, not a desktop sign-in assumption. |
| 2026-10-14 | Local op-doctor found shim ordering failure in the systemd fallback surface when the user bus is unavailable. | Include user-systemd PATH and op-lane tests in portability acceptance; do not infer desktop state from an agent failure. |
| 2026-10-14 | Mise checksum filenames contain a ./ prefix; first exact filename lookup missed it. The correct published checksum subsequently matched. | Fail closed before executing installers and normalize manifest filename prefixes. |

## Headless qualification findings

Two bounded native sessions completed: Codex gpt-6.1-sol/medium in a read-only
sandbox and Claude Opus 5.5/medium in plan mode. Full sanitized reports are in
history/2026-10-14-headless-{codex,claude}-audit.md. These are audit results, not
proof of publish/merge readiness. Codex's sandbox denied network/user-bus access;
its failed gh/op probes do not contradict the direct SSH authentication proofs.
Claude's plan session connected to the user manager but ignored untrusted
project permission entries. The first audit began before the remaining CLI scan
was complete; missing-tool findings are timestamped initial-wave evidence.

| Finding | Classification | Disposition / next proof |
| --- | --- | --- |
| Bun archive setup omitted bunx; shadcn and next-devtools MCP failed with ENOENT. | Introduced provisioning omission | Created bunx beside Bun; version now matches the repo pin. Fresh MCP startup remains a separate proof. |
| Graft absent at initial startup; Effect references absent. | Host-specific dependency/setup gap | Installed Graft CLI; version passes. Native parser and structural graph qualification plus approved reference provisioning remain needed; never run a deep build as a shortcut. |
| ~/.config/beep/models.yaml absent. | Host configuration gap | Provision the nonsecret model manifest and qualify native/proxy defaults against current aliases. |
| Borrowed node_modules symlink made the disposable checkout untracked and redirected Yeet's reported ledger to the source clone. | Introduced audit harness shortcut; source path ownership needs attribution | Replace borrowed dependencies with an independent frozen install before treating checkout/ledger behavior as repository drift. Do not patch Yeet from this ambiguous probe. |
| Read-only sandbox denied gh/op network and user-systemd bus; op-doctor could not write temporary diagnostics. | Execution-profile restriction | Declare capabilities by execution profile; separate sandbox constraints from actual authentication/service state. |
| Box MCP lacked host authorization; other MCPs assume IDE/local endpoints or op-backed configuration. | Workflow/host-specific integration gap | Create required/optional MCP matrix and qualify each actual host-scoped workflow. CLI login does not authenticate every connector. |
| Claude ignored 64 permission entries because project trust had not been established. | Headless bootstrap gap | Add an explicit trusted-checkout enrollment step and record trust separately from provider sign-in. |
| Retired cloud-session-setup.sh commands still appear in SPEC acceptance; cloud runbook closeout differs from D4. | Inherited contract drift | Reconcile current commands and publish/closeout boundaries per host class; preserve historical evidence as history. |
| Desktop notifications/hooks lack managed-worker guards and detached Yeet slice/job behavior is unproven. | Inherited workstation coupling | Add explicit supported host capabilities and qualify attached versus detached jobs; never equate help output with full Yeet readiness. |
| npm skipped native/parser/workerd install scripts. | Package-manager policy difference | Scoped package-script approval plus native runtime proof; no blanket global allow-all. |
| opencode-ai@2.0.27 absent from npm despite workstation opencode v2.0.27. | Packaging/provenance mismatch | Trace the actual workstation package source and install its correct artifact; do not silently substitute another CLI version or product. |


## T3 remote qualification findings — 2026-10-14

- Use the same release channel and compare orchestration protocol versions;
  two installations labelled 0.0.45 had incompatible protocols. Worker CLI,
  backend and desktop now use nightly 0.0.46-nightly.20261014.3093 / protocol 2.
- Separate native saved-environment enablement from a direct browser connection.
  The operator's native environment was Off, while the test existed on the host.
- Pairing codes are one-time: opening the URL in a browser spends it before
  Add environment. Paste fresh links directly into the intended client dialog.
- Supervised T3 approvals belong to the human UI. Its MCP pending-request tools
  expose questions, not shell approval resolution. Browser automation can operate
  specifically authorized read-only approvals without changing runtime mode.
- Configure enabled T3 provider instances and explicit executable paths for the
  installed Cursor/Grok/Muse clients, then qualify those providers independently.
- Version commands may write alias/update metadata. Preserve sandbox protection;
  record warning-only writes separately from actual CLI execution failures.
- Headless agent self-reports need comparison against actual activity and elapsed
  timers. This run inaccurately claimed no approvals and a two-minute duration.

Evidence: [T3 remote smoke](../history/2026-10-14-t3-remote-smoke.md).


## T3 provider qualification follow-up — 2026-10-14

The installed Claude, Cursor, Grok and Muse providers are now enabled and each
has a successful T3 shell smoke. Cursor's separate SDK browser login, exact
AppArmor helper profiles and D21-respecting test are recorded in
[provider qualification](../history/2026-10-14-t3-provider-qualification.md).

- Maintain version-pinned Cursor sandbox AppArmor attachments during upgrades.
- Match smoke commands to provider-lane policy; Cursor Git checks belong to the
  orchestrator under D21. Do not loosen the deny rule to reuse a generic test.
- Qualify T3's own GitHub account binding; its PR lookups hit rate limits while
  authenticated native gh had its full core allowance. Resolved for read-only
  discovery/list/detail workflows by the follow-up qualification below.
- Review Claude SDK's MCP allowedTools/canUseTool shadowing warning separately.
- Refresh browser/native connection grants only through an explicit operator
  action when management permissions are required; viewing status is distinct
  from provider management.

## T3 GitHub qualification follow-up — 2026-10-14

The worker's gh 2.46.0 lacked T3's documented >=2.81 structured account
discovery interface. Installed checksum-verified official gh 2.102.0 in the
user-local PATH, preserved the existing login, and restarted the idle T3 backend.
T3's browser UI now reports authenticated GitHub and loads PR lists and details.
Enforce the compatibility floor during provisioning and verify both structured
account discovery and the actual T3 workflow. Native gh authentication alone
was insufficient proof. GitHub writes/publishing were not exercised.

Evidence: [GitHub qualification](../history/2026-10-14-t3-github-qualification.md).

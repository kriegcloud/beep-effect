# Evidence — onboarding proof, run 4 (2026-10-20)

VM restored from the `claude-signed-in` snapshot (Claude Desktop installed,
gateway 0.1.0 installed), `practice-setup.exe` built from the #1771 head
(gateway 0.1.1 embedded), run by the operator in the VM's interactive
session. Screenshots every 15 s under
`~/VMs/practice-gateway/shots/onboarding-proof-20261015-0238/` (not in repo);
`onboarding-proof.sh verify` output summarized below.

## What passed

- `practice-setup` run record: `claude-desktop` and `claude-sign-in`
  skipped (already done), `gateway-extension` **done** ("Claude lists the
  gateway at the bundled version"), `onboarding-handoff` done;
  `complete: true`.
- Claude's extension registry lists
  `local.mcpb.beep-effect-contributors.beep-practice-gateway` at **0.1.1**:
  the 0.1.0 → 0.1.1 update path works.
- The onboarding interview ran in plain language and `setup_profile_save`
  **succeeded** (the run-3 `itLimits` decode failure is fixed). The saved
  profile chose Box Drive, Microsoft 365 and Windows Credential Manager and
  recorded **FreshBooks** as a `practice-billing` gap, the demand data D7
  asked for. Admin rights `available`, proxy `none`.
- The installed gateway's `--self-check` returns `ok: true`,
  `extensionVersion: 0.1.1`, `profileSaved: true`.

## Findings (fixed in the follow-up PR)

1. **No `.mcpb` file type.** Claude Desktop auto-updated in the VM
   (2.9939.4 → 2.37337.1, 10-14). Neither version registers `.mcpb` with
   Windows (`assoc .mcpb`: not found; no HKCU/HKLM class or Open-with
   entry), so `explorer.exe <bundle>` showed Windows' "Select an app to open
   this .mcpb file" dialog with Notepad and Media Player. A lawyer cannot
   recover from that. Both Claude bundles still handle `.mcpb`/`.dxt`
   paths from `open-file` and the command line, so the bootstrapper now
   starts the per-user `claude.exe` with the bundle path.
2. **Repairs could not be approved in Claude Desktop.** Claude does not
   advertise MCP elicitation, so `ElicitedApprovals` declined every repair
   without asking; Claude told the lawyer it "can't show the approval prompt"
   and fell back to manual steps. The gateway now asks in a topmost Windows
   Yes/No dialog when an MCP client is calling but cannot elicit
   (`GatewayApprovals`).
3. **Signed-in check false negative.** Outside an MCP call (`--self-check`)
   `claude-signed-in` reported "No signed-in Claude session" on a signed-in
   machine. It now reads Claude's own sign-in marker from `config.json`
   (per-user and MSIX paths), key presence only.
4. **Microsoft 365 offered as a one-click repair without an app ID.** The
   summary said "I can do this for you once you approve it: Open the
   Microsoft sign-in page" while the probe said no app ID is configured. A
   new `m365-app-configured` requirement (a lawyer `configure` step) now
   gates `m365-consented`, so the sign-in repair is offered only once it can
   work.

## Also observed

- The snapshot's Claude session expired between 10-15 and 10-20 while
  `lastKnownAccountUuid` stayed in `config.json`, so the bootstrapper's
  sign-in step skipped and Claude asked for sign-in when opened. The marker
  proves an account signed in once, not that the session is live; the
  bootstrapper's hand-off still lands in Claude, which shows its own sign-in.
- The VM's display was stuck at 1280×800 on the basic adapter; SPICE guest
  tools (QXL driver + vdagent) are now in the `claude-signed-in` snapshot so
  the guest follows the viewer window.

# Evidence — onboarding proof, run 5 (2026-10-21)

Re-proof of the run-4 fixes (#1935). The VM started from the
`agents-signed-in` snapshot, with gateway 0.1.0 installed and Claude's
saved session expired. `practice-setup.exe` was built from this lane with
gateway 0.1.2. An agent drove every console step from the host (virsh
screenshots, QMP tablet clicks and key events, interactive scheduled
tasks). The operator's only step was signing in to Claude Desktop.
Screenshots are kept out of the repo, under
`~/VMs/practice-gateway/shots/drive/`.

## Fixes proven

1. **Bundle goes straight to Claude.** `practice-setup` started the
   per-user `claude.exe` with the bundle, and Windows' "Select an app"
   dialog never appeared. Claude was signed out at that moment. After the
   operator signed in, Claude showed the Beep Practice Gateway Update
   dialog for the file it had been handed. Update, then Install, moved
   Claude's registry entry to **0.1.2**.
2. **Repairs can be approved.** Claude called `setup_repair` for
   `box-drive-installed`. The gateway showed a topmost Windows dialog,
   "Practice gateway: approve a change", reading "Install Box Drive for
   your Windows account. Why: … Should the practice gateway make this
   change now?" After Yes, the repair ran and failed with its planned
   plain reason (no Box Drive installer route yet). Claude relayed the
   manual box.com/drive step.
3. **Signed-in check.** The installed gateway's `--self-check` reports
   `claude-signed-in: satisfied` outside an MCP call, using Claude's
   `config.json` marker.
4. **Microsoft 365 gated on its app ID.** `m365-app-configured` is a
   lawyer `configure` step ("Ask whoever set up the practice gateway for
   your firm's Microsoft 365 app ID, then enter it in Claude: Settings,
   Extensions, Beep Practice Gateway, Configure."). `m365-consented` is
   `blocked` on it, and the summary no longer offers the sign-in as a
   repair.

Interview and profile: the interview ran in plain language, one question
at a time. `setup_profile_save` stored Box Drive, Microsoft 365 and Windows
Credential Manager, plus a `practice-billing` gap naming **Clio**; admin
rights `available`, proxy `none`. Self-check: `ok: true`,
`extensionVersion: 0.1.2`, `profileSaved: true`, 2 of 9 checks pass. The
two lawyer steps are the Microsoft 365 app ID and BitLocker; Box Drive is
offered as a repair.

## New findings

5. **Stale `claude://` handler (fixed in this PR).** Claude updated itself
   again (`app-3.1623.0` staged). Its registered `claude://` handler still
   named `app-2.9939.4\claude.exe`, which no longer exists, so the
   hand-off's `Start-Process claude://…` failed with "Claude could not be
   opened". The per-user `claude.exe` launcher accepts the link as an
   argument and opened a new chat with the onboarding message filled in.
   `openLink` now goes through the launcher, with `Start-Process` kept as
   the MSIX fallback; the prefilled chat from run 1, finding 3, now lands.
6. **Expired session passes the sign-in step (follow-up).** The run
   skipped `claude-sign-in` because `lastKnownAccountUuid` was still in
   `config.json` after the session expired. The 10-minute gateway watch
   then ran out while the operator signed in, so the run stopped with the
   drag-onto-Settings fallback; a rerun recovered. The bootstrapper needs a
   live-session signal, or a watch that waits while Claude shows its
   sign-in screen.
7. **One Claude permission prompt per gateway tool (follow-up).** The
   lawyer met five "Claude wants to use … from Beep Practice Gateway"
   prompts (guide, profile get and save, status, repair) besides the
   gateway's own approval. The onboarding skill should say these will
   appear, and that "Always allow" is fine for the read-only setup tools.
8. **Interview facts land in the signed-in account's Claude memory.**
   Claude showed "Memory updated" during the interview. The facts are
   practice-level, with no client data, but the lawyer should know Claude
   may remember them.
9. **Cowork is Claude's default composer mode.** The hand-off chat opened
   in Cowork. The console's "Chat tab" hint still holds, and the message
   survived switching to Chat.
10. BitLocker's instruction still says "Ask your IT administrator" when the
    profile records `adminRights: available` (known, minor).

Operator steps this run: signing in to Claude Desktop (account
credentials). There was no UAC prompt.

## Follow-ups resolved (2026-10-22)

Findings 6, 7 and 10 are fixed in gateway 0.1.3 and the matching
`practice-setup`: a second bundle hand-off and watch, a permission-prompt note
in the console hand-off and in onboarding skill Step 1, and BitLocker wording
that follows the profile's admin rights. Finding 6 was not solved with a
cookie check. Claude's `sessionKey` cookie carries a 28-day expiry, yet the
session signed in on 10-14 had ended by 10-20, so the cookie cannot prove a
live session.

Checked on the proof VM (2026-10-22, `claude-signed-in` snapshot, gateway
0.1.2 to 0.1.3, agent-driven): `practice-setup` finished all four steps, and
the console showed the sign-in-first line and the "Always allow" note. Claude
listed the gateway at 0.1.3. With the saved profile's `adminRights:
available`, `--self-check` gives "Turn on BitLocker for drive C: open
Settings, search for BitLocker (on some computers it is called Device
encryption), turn it on, and approve the Windows prompt." The second hand-off
needs an expired session, so it is covered by unit tests only. Claude's own
"Make Claude Docs…" promo opened over the gateway dialog on this run; the
lawyer has to close it first.

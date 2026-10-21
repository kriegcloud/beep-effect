# Practice review hub: the review queue on the tailnet

The review hub (`apps/practice-review-hub`) keeps the attorney's review queue
on the workstation: the items waiting for a verdict, the questions waiting for
an answer, and the verdicts and answers given. It serves them as one MCP
endpoint on `127.0.0.1`. `tailscale serve` exposes that endpoint on the
tailnet. Every request requires both an allowed tailnet login and an
independent bearer credential.

Three things feed or read the hub's data directory:

- docket intake writes a question for every needs-review message into
  `items.jsonl` when `DOCKET_INTAKE_REVIEW_HUB_DIR` is set;
- the hub reads the items and appends verdicts and answers;
- the daily notice reads the items and answers and, at most once a day,
  emails the attorney how many questions wait. The email holds the count only,
  never a question.

Nothing in the repository installs these units, and the hub never writes the
calendar. This runbook is the manual install.

| Unit | Sample | Environment file |
| --- | --- | --- |
| `practice-review-hub.service` | `apps/practice-review-hub/deploy/practice-review-hub.service` | `$HOME/.config/beep-practice-review-hub/hub.env` |
| `practice-review-notice.service` | `apps/practice-review-hub/deploy/practice-review-notice.service` | `$HOME/.config/beep-practice-review-hub/notice.env` |
| `practice-review-notice.timer` | `apps/practice-review-hub/deploy/practice-review-notice.timer` | none |

## 1. Deploy checkout and data directory

Run the hub from the pinned deploy checkout the practice services use
([practice services](practice-services.md), section 1). An upgrade there
upgrades the hub too (section 7).

Pick the data directory and write its absolute path wherever this runbook
says `<data-dir>`, for example `$HOME/.local/state/beep/practice-review-hub`
spelled out in full. systemd and `op run` do not expand `$HOME`.

```bash
mkdir -p -m 0700 <data-dir>
```

The hub creates `items.jsonl`, `verdicts.jsonl` and `answers.jsonl` there on
the first write, owner-only. The notice keeps one claim file per notice day
in `notice-sent/` beside them. Keep the directory: the verdict and answer
files are the record of what the attorney decided. The claim files are only
a guard and can be pruned once their day has passed.

## 2. The hub unit

```bash
cp apps/practice-review-hub/deploy/practice-review-hub.service $HOME/.config/systemd/user/
# edit the REPLACE_ values: the deploy checkout, $HOME, the bun shim,
# <data-dir>, the attorney's tailnet login (section 4), and a free port
# (the examples below use 8787, the hub's default)
systemd-analyze --user verify $HOME/.config/systemd/user/practice-review-hub.service
systemctl --user daemon-reload
systemctl --user enable --now practice-review-hub.service
journalctl --user -u practice-review-hub.service -f
```

The hub binds `127.0.0.1` only. Other local OS users can reach that port and
forge the proxy login header, so the server also requires an independent
bearer token. Before starting it, create a random token of 32–256 characters
in the approved secret store. Store its reference as
`PRACTICE_REVIEW_HUB_API_TOKEN` in the owner-only `hub.env` file. The sample
unit uses `op run` to resolve it; do not use systemd `EnvironmentFile=` for
`op://` references. Replace the unit's `REPLACE_WITH_OP_PATH` too.

Provision the same token into the authorized MCP client's protected credential
configuration as `Authorization: Bearer <token>`. Keep it out of command-line
arguments, source control, URLs and diagnostic output. Tailscale forwards that
header; the hub independently checks it before accepting the login header.
A missing or invalid token returns 403, and missing configuration prevents
startup. The default HTTP tracing redaction protects `Authorization`.

Existing installations must provision the token on both the service and its
clients before upgrading. Reverting the code would restore the vulnerable
header-only boundary; keep the service stopped if rolling back. No live
service or secret is changed by this repository update.

## 3. Expose it on the tailnet with `tailscale serve`

`tailscale serve` terminates HTTPS on the workstation's tailnet name and
proxies to the loopback port. For every request from a user's device it sets
`Tailscale-User-Login` to that user's tailnet login, which is what the hub's
allow-list checks. Requests from tagged devices carry no login and get 403.

Running `tailscale serve` as your own user needs the Tailscale operator
permission, granted once by an administrator of the workstation:

```bash
sudo tailscale set --operator="$USER"
```

Give the hub its own HTTPS port on the tailnet name. Check what is served
already first: the bare name (port 443) often proxies another service, and
`--https=443` would replace it. Using the unit's loopback port as the HTTPS
port too keeps the two easy to match; with another port in the unit, change
both numbers:

```bash
tailscale serve status
tailscale serve --bg --https=8787 http://127.0.0.1:8787
tailscale serve status
```

The hub's tailnet address then carries the port:
`https://<workstation>.<tailnet>.ts.net:8787/mcp`.

`--bg` keeps the configuration across reboots. The tailnet must allow HTTPS
certificates; the first `tailscale serve` prints a link to turn them on when
they are off. Never use `tailscale funnel` for the hub: it would publish the
endpoint on the internet.

## 4. Find the attorney's tailnet login and allow it

The allow-list holds tailnet logins, the `LoginName` of a Tailscale user, such
as `<attorney-login>`. To read it from the workstation, find the attorney's
device and its tailnet IP, then ask who owns it:

```bash
tailscale status
tailscale whois <attorney-device-ip>
```

Copy the `LoginName` under `User:`. The Users page of the Tailscale admin
console shows the same value.

Check that this login belongs to the attorney alone. The login identifies the
Tailscale user, not the device: every device signed in as the same user sends
the same `Tailscale-User-Login`. When the attorney's device was set up with
the operator's account, allowing that login lets every one of the operator's
devices, agent workers included, record verdicts and answers as the attorney.
In `tailscale status`, the attorney's device must be the only device of its
user. If it is not, invite the attorney to the tailnet as their own user and
sign their device in with that account. When the tailnet has a custom access
policy, it must let that user reach the workstation on the hub's HTTPS port. Put it in the unit's `--allowed-logins` (several
logins are separated by commas, without spaces), then:

```bash
systemctl --user daemon-reload
systemctl --user restart practice-review-hub.service
```

The match is exact and case-sensitive.

## 5. Docket intake writes the questions

Add the data directory to the docket intake environment file
(`$HOME/.config/beep-docket-intake/service.env`). It is a path, not a secret:

```bash
DOCKET_INTAKE_REVIEW_HUB_DIR="<data-dir>"
```

```bash
systemctl --user restart docket-intake.service
```

From the next cycle on, every needs-review message in the docket ledger is in
`items.jsonl` as a question. Each cycle stores only questions that changed, so
the file grows only when something new needs review. A question that could
not be stored is logged (`docket intake questions were not stored`) and
stored again next cycle; the docket entries are written either way. Without
the variable, docket intake runs exactly as before.

## 6. The daily notice

The notice sends one email from the attorney's mailbox to itself, through
the existing agent outbox registration
([M365 agent outbox registration](m365-agent-outbox-registration.md)). That
registration already holds `Mail.ReadWrite` and `Mail.Send` scoped to the one
mailbox, so the notice needs no new grant. Never use the docket intake
registration here: it must never be able to send.

Create the environment file (mode `0600`) with `op://` references to the
outbox fields:

```bash
PRACTICE_REVIEW_NOTICE_TENANT_ID="op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_M365_OUTBOX_TENANT_ID"
PRACTICE_REVIEW_NOTICE_CLIENT_ID="op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_M365_OUTBOX_CLIENT_ID"
PRACTICE_REVIEW_NOTICE_CERT_THUMBPRINT_SHA256="op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_M365_OUTBOX_CERT_THUMBPRINT_SHA256"
PRACTICE_REVIEW_NOTICE_CERT_PRIVATE_KEY="op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_M365_OUTBOX_CERT_PRIVATE_KEY"
PRACTICE_REVIEW_NOTICE_MAILBOX="op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_M365_OUTBOX_MAILBOX"
```

The unit runs the notice under `op run --env-file=<file>`. Do not give the
file to systemd's `EnvironmentFile=`: systemd passes each reference through
as a literal string, and the notice refuses a value that is still an
`op://` reference. Check that it resolves, with no output:

```bash
op run --env-file=$HOME/.config/beep-practice-review-hub/notice.env -- true >/dev/null
```

Install the service and its timer. Replace the REPLACE_ values in the service
(the deploy checkout, `$HOME`, the environment file, the bun shim,
`<data-dir>` and the practice's IANA time zone, such as `America/Chicago`).
The timer runs at 08:30 in the workstation's local time; add the zone after
the time when the practice is elsewhere.

```bash
cp apps/practice-review-hub/deploy/practice-review-notice.service $HOME/.config/systemd/user/
cp apps/practice-review-hub/deploy/practice-review-notice.timer $HOME/.config/systemd/user/
systemd-analyze --user verify $HOME/.config/systemd/user/practice-review-notice.service $HOME/.config/systemd/user/practice-review-notice.timer
systemctl --user daemon-reload
systemctl --user enable --now practice-review-notice.timer
systemctl --user list-timers practice-review-notice.timer
```

Run it once by hand and read its one-line outcome (`sent`, `already-sent` or
`nothing-waiting`):

```bash
systemctl --user start practice-review-notice.service
journalctl --user -u practice-review-notice.service -n 20
```

The notice claims the day before it sends, by creating
`notice-sent/<YYYY-MM-DD>` with an exclusive create. Only one run can claim a
day, so the timer and a hand-started run together still send at most one
email. `Persistent=true` runs a morning missed while the workstation was off
at the next start.

A send that fails keeps the day's claim, so that day gets no email and the
timer tries again the next morning. The claim is not released automatically
because a failed send is not always a missing email: Graph can fail after the
message went out. To resend the same day:

1. Read the failure in the journal (the command above).
2. In the attorney's mailbox, look in Sent Items for today's
   "Claude: N questions waiting" notice. If it is there, stop: it was sent.
   If an unsent copy sits in Drafts, delete it.
3. Release the claim and run the notice again. The file is named for today in
   the time zone the service passes as `--time-zone`:

```bash
rm <data-dir>/notice-sent/$(TZ=<time-zone> date +%F)
systemctl --user start practice-review-notice.service
journalctl --user -u practice-review-notice.service -n 20
```

## 7. Verify

On the workstation, a request without credentials gets 403, including one
that forges an allowed `Tailscale-User-Login`:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:<port>/mcp \
  -H 'Tailscale-User-Login: <attorney-login>'
```

From the attorney's device, signed in to the tailnet as an allowed login, an
MCP discover through `tailscale serve` succeeds when its independent bearer
credential is supplied too. For the curl probe, provision an owner-only
`hub-auth.headers` file containing the Authorization header using your approved
secret tool; never put the token in shell history or an argument. Save the request body as
`discover.json`:

```json
{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{},"io.modelcontextprotocol/clientInfo":{"name":"curl","version":"0.0.0"}}}}
```

```bash
curl -s https://<workstation>.<tailnet>.ts.net:8787/mcp \
  -H @hub-auth.headers \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: server/discover' \
  --data-binary @discover.json
```

The answer is HTTP 200 with `"supportedVersions":["2026-07-28"]` and the
server name `practice-review-hub`. On Windows run the same command as
`curl.exe`, one line. The same request from a device signed in as any other
login, the operator's own devices included, gets 403.

The hub tolerates in-progress appends: a last line that has no line break yet
is left for the next read, so docket intake can store questions while the hub
reads them.

## 8. Upgrade

The hub runs from the practice-services deploy checkout, so upgrade it with
the practice services ([practice services](practice-services.md), section 4),
stopping and starting the hub with them:

```bash
systemctl --user stop practice-review-hub.service
# fetch and check out the new commit in the deploy checkout, then bun install --frozen-lockfile
systemctl --user start practice-review-hub.service
```

The notice needs no restart: each run starts from the checkout as it is.
For a rollback to another revision that enforces the independent credential,
use the same stop/update/start sequence. When rolling back to a revision before
this authentication fix, keep `practice-review-hub.service` stopped: restarting
that revision restores the vulnerable header-only authorization boundary.

## 9. Remove

```bash
systemctl --user disable --now practice-review-notice.timer practice-review-hub.service
tailscale serve --https=8787 off
rm $HOME/.config/systemd/user/practice-review-hub.service \
  $HOME/.config/systemd/user/practice-review-notice.service \
  $HOME/.config/systemd/user/practice-review-notice.timer
systemctl --user daemon-reload
```

`tailscale serve --https=8787 off` removes the hub's listener from the example
installation. If you selected a different HTTPS port, use that port here.
Inspect `tailscale serve status` first and preserve listeners used by other services.
Remove `DOCKET_INTAKE_REVIEW_HUB_DIR` from the docket intake environment file
and restart `docket-intake.service`. Keep `<data-dir>`: it holds the verdicts
and answers.

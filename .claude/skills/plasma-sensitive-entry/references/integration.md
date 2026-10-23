# Adapter contract

The helper is a building block for an authorized consumer, not a command that
returns a credential to the assistant. Exit codes: 0 delivered, 1 cancelled or
rejected by dialog, 2 unavailable/invalid/error, 3 timeout. Treat every nonzero
exit as no usable answer. Never display captured stderr or exception details.

The adapter must create `os.pipe()`, launch `prompt.py` with `--write-fd` naming
its write end and `pass_fds=(write_fd,)`, close its own write end, and drain the
read end while the child runs. Bound the read and child's lifetime; terminate
and reap only owned children on cancellation. Never reuse another agent's pipe.
Do not wait before draining: a long answer can fill the pipe. Limit accepted
answer bytes for the specific consumer, and reject oversize input without
printing it. Before delivery, line-oriented authentication consumers must reject
CR, LF, NUL and every other control character incompatible with that consumer.
The helper already rejects CR/LF/NUL; adapters must still enforce their own
protocol rules. A remote sudo PTY adapter must never forward multiline text
that could be interpreted as shell input after authentication. Send successful bytes directly to the authorized consumer; close
both descriptors in `finally`. Parent cancellation must also terminate its
owned helper and dialog, not leave a background prompt.

For remote SSH text challenges, prefer the existing remote wrapper. An SSH
askpass adapter may call the pipe helper and return the answer to SSH's private
askpass channel only. Never run an askpass helper directly in an agent tool.
Keep host-key verification enabled. Scope any temporary executable helper to a
mode-700 directory in the owned runtime directory and remove it when done.
A connection-only multiplex master can separate authentication from mutations;
verify its socket ownership before use and close only the master you created.

For remote sudo, connect through the established authorized SSH lane. An adapter
must use a unique challenge sentinel and a separate post-authentication ready
sentinel, discard all pre-authentication output, and check terminal echo is off
before sending bytes. A prompt string alone is insufficient evidence of success.
Restrict the remote command to the authorized action; never infer permission to
open an unrestricted root shell. Handle interrupted reads, EOF and Linux PTY
EIO without dumping buffered bytes. Reap owned child PIDs on every exit path;
restore local terminal attributes before reporting sanitized status.

Never retry after a timeout until you know whether the action began. Inspect
state through the authorized connection first. The dialog is a transport for a
human-provided value, not permission to bypass PAM, SSH, 1Password or a failed
approval gate.

## Current-user GUI preparation

An agent tool may lack user-bus metadata even while Plasma is running. Before
launching the pipe helper, a trusted adapter may prepare **its own current
user's** runtime/bus context as below. Preserve an already complete selected
GUI context; do not run this recipe to replace a different selected bus.
Never inspect another UID's session or print a user-manager environment dump.

```python
import os
import stat
import subprocess

def current_user_gui_env():
    uid = os.geteuid()
    if uid == 0 or uid != os.getuid():
        raise RuntimeError("Plasma session unavailable")
    runtime = f"/run/user/{uid}"
    bus = f"{runtime}/bus"
    directory, socket = os.lstat(runtime), os.lstat(bus)
    if (not stat.S_ISDIR(directory.st_mode) or directory.st_uid != uid
            or directory.st_mode & 0o077 or not stat.S_ISSOCK(socket.st_mode)
            or socket.st_uid != uid):
        raise RuntimeError("Plasma session unavailable")
    metadata = {"XDG_RUNTIME_DIR": runtime,
                "DBUS_SESSION_BUS_ADDRESS": f"unix:path={bus}"}
    if any(os.environ.get(key, value) != value for key, value in metadata.items()):
        raise RuntimeError("Plasma session unavailable")
    env = os.environ | metadata
    reachable = subprocess.run(
        ["busctl", "--user", "status"], env=env, stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
    if reachable.returncode != 0:
        raise RuntimeError("Plasma session unavailable")
    return env
```

Use the returned environment only for the owned helper/authentication lane's
`Popen(..., env=env, pass_fds=(write_fd,))`. Catch preparation errors and timeout
at the adapter boundary and report only unavailable; never print exceptions.
This sets only nonsecret runtime/bus metadata. `prompt.py` then resolves display
metadata consistently through the user manager, refusing mixed sessions. Do not
guess a display or run `kdialog --password` directly. Successful ownership,
socket and bus probes qualify GUI infrastructure; only a live masked-dialog
acceptance check can qualify actual dialog delivery.

## Concrete SSH consumer

Use the [SSH askpass adapter](../scripts/ssh-askpass.py) as `SSH_ASKPASS` only inside the existing approved
remote SSH wrapper when it needs a text challenge. The executable must have an
absolute path. Set `SSH_ASKPASS_REQUIRE=force` for that single SSH invocation;
set `NumberOfPasswordPrompts=1`, restrict `PreferredAuthentications` to the
approved challenge mechanism, and disable password fallback for an OTP-only
flow (`PasswordAuthentication=no`). One prompt per method alone does not
prevent a second authentication method from prompting. The adapter terminates its direct SSH authentication parent after any refused,
cancelled, expired or failed text callback, preventing an empty response or
another method from reopening the dialog.
The owning supervisor must reap that SSH process before any retry. Use a
connection-only foreground `ssh -M -N` under the owning supervisor with
no controlling terminal (`setsid`) and a private owned ControlPath. Retain the
wrapper's exact identity, host-key, FIDO and notification settings. Name the
host/action in the agent's announcement before the SSH call. The trusted
caller must also set command-scoped `PLASMA_AUTH_TITLE` (host and action) and
`PLASMA_AUTH_LABEL` (exact field, such as authenticator OTP, and destination).
The caller must also set `PLASMA_AUTH_SSH_PROMPT` to the complete trusted
OpenSSH callback form: `(remote-user@effective-host) configured challenge`.
Build the prefix from the wrapper's effective remote user and host, substituting
its configured `HostKeyAlias` when set, then append the verified service
challenge. A bare PAM challenge is insufficient. A synthetic example is
`(operator@host-alias.example.invalid) Verification code:`; OpenSSH may append
a trailing space. Matching strips only trailing ASCII spaces/tabs from both
sides; it preserves the entire identity prefix, leading whitespace, punctuation
and all other characters. The callback argument is never copied into the
trusted expected value. These values contain nonsecret metadata only. The adapter refuses missing context or any
callback whose literal prompt differs; an arbitrary "Password:" is never
assumed to mean OTP. Unknown prompts, including a FIDO PIN or key passphrase,
are refused without a dialog. OpenSSH normally converts a nonzero askpass
exit into an empty authentication response, consuming a failed attempt. This
adapter therefore terminates its still-direct verified SSH authentication
parent before returning any text-path refusal or failure, including a prefix
mismatch, missing context, cancellation or timeout. The connection-only lane's
owning supervisor must wait/reap that SSH process and confirm termination
before any retry; an adapter cannot reap its own parent. Keep the one-attempt and
method restrictions above as defense in depth. Notification/confirmation paths
remain separate and never signal SSH. PIN-requiring FIDO stays entirely under
the canonical dispatcher.
Never copy untrusted remote prompt text into these variables merely to make a
mismatch pass. For example, label an OTP
as "Enter the authenticator code for the approved host's SSH sign-in" and a
remote sudo password separately as an account password. The SSH adapter does
not collect remote sudo passwords. Do not use this
for local sudo or to bypass a missing remote-wrapper authorization.

The adapter accepts only a direct `ssh` parent (Linux `/proc` misuse guard),
reads at most 4096 bytes from the helper's private pipe, and sends stdout only
to SSH's internally captured askpass channel after the helper exits 0. Its
stdout must never be independently captured by an agent tool. It compares
SSH's prompt argument only with the trusted exact expected
challenge and never displays that untrusted argument. `SSH_ASKPASS_PROMPT=none`
is notification-only (exit 0), and `confirm` is a permission request (exit 2,
never silently approve). Both return without a text dialog or signalling SSH.
Keep the canonical FIDO wrapper's notifier/confirmation dispatcher in charge
of those callbacks; never replace it with this text adapter. Do not combine
this adapter with FIDO keys requiring PIN entry. An approved wrapper must own
any FIDO notification/PIN dispatch separately before routing only its known
text challenge here. OpenSSH's callback semantics are defined in its
[readpass.c implementation](https://github.com/openssh/openssh-portable/blob/master/readpass.c);
keyboard-interactive prefixing is in
[sshconnect2.c](https://github.com/openssh/openssh-portable/blob/master/sshconnect2.c).
Adapter cancellation closes descriptors and terminates/reaps its owned helper; the
helper kills/reaps its owned dialog. Monitor the same owned SSH process until
connection success or failure; SSH authentication failure must discard the
value, and any retry must respect the three-attempt limit and cancellation.
Never run a remote command that echoes the received value. A successful SSH
master can then carry the authorized operation without another text prompt.

## Workstation discovery installation

Run `python3 <skill>/scripts/install.py` once from the reviewed checkout. It
adds discovery links at the current-user installation destinations
`$HOME/.agents/skills` and `$HOME/.claude/skills`, and a
marked default rule to `~/.codex/AGENTS.md`, preserving existing instructions.
It refuses a competing skill directory/link. New Codex chats discover the
rule regardless of cwd; already running chats keep their loaded instructions.
Claude discovers the skill globally through its ambient trigger description.
The repository's AGENTS rule also covers fresh clones without installation.

The links point to this checkout: keep the worktree until merge, then repoint
them to the retained main checkout only after it contains this skill. Do not
retire a worktree that still owns installed discovery links. To roll back,
remove only the two links after verifying their targets, and remove only the
marked block from `~/.codex/AGENTS.md`; preserve the rest of the file.
Installation is local activation, separate from PR publication or merge.

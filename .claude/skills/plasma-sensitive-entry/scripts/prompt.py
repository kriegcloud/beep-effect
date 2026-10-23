#!/usr/bin/env python3
"""Deliver masked Plasma input to an inherited private pipe, never stdout."""
import argparse
import os
import shutil
import select
import signal
import time
import stat
import subprocess
import sys

GUI_KEYS = {"DISPLAY", "WAYLAND_DISPLAY", "XAUTHORITY", "DBUS_SESSION_BUS_ADDRESS", "XDG_RUNTIME_DIR"}


def run_owned(args, env, timeout):
    """Bound capture and always reap the owned process, including interruption."""
    child = subprocess.Popen(args, env=env, stdin=subprocess.DEVNULL,
                             stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                             start_new_session=True)
    completed = False
    try:
        output, _ = child.communicate(timeout=timeout)
        completed = True
        return subprocess.CompletedProcess(args, child.returncode, output, b"")
    finally:
        if not completed or child.poll() is None:
            # This fresh process group contains only this helper's child lane.
            try:
                os.killpg(child.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        child.wait(timeout=5)
        if child.stdout is not None:
            child.stdout.close()


def prompt(fd, title, label, timeout=60):
    """Return only a status; the authorized adapter owns the receiving pipe."""
    target = os.fstat(fd)
    if fd < 3 or not stat.S_ISFIFO(target.st_mode):
        return 2
    # Reject dup(stdout/stderr/stdin), which can otherwise look like a pipe
    # with a safe descriptor number while still reaching a tool transcript.
    for standard in (0, 1, 2):
        try:
            stream = os.fstat(standard)
        except OSError:
            continue
        if (target.st_dev, target.st_ino) == (stream.st_dev, stream.st_ino):
            return 2
    if not 1 <= timeout <= 300:
        return 2
    dialog = shutil.which("kdialog")
    if dialog is None:
        return 2
    env = {key: value for key, value in os.environ.items() if key in GUI_KEYS or key in {"PATH", "HOME", "LANG", "LC_ALL"}}
    # Preserve a complete caller-selected session. For discovery, accept the
    # manager's GUI metadata only as one consistent unit, never mixed sessions.
    if not (env.get("DBUS_SESSION_BUS_ADDRESS") and (env.get("WAYLAND_DISPLAY") or env.get("DISPLAY"))):
        session = run_owned(["systemctl", "--user", "show-environment"], env, 5)
        if session.returncode != 0:
            return 2
        discovered = {}
        for line in session.stdout.decode("utf-8", errors="replace").splitlines():
            key, separator, value = line.partition("=")
            if separator and key in GUI_KEYS:
                discovered[key] = value
        del session
        if any(key in env and env[key] != value for key, value in discovered.items()):
            return 2
        env.update(discovered)
    if not env.get("DBUS_SESSION_BUS_ADDRESS") or not (env.get("WAYLAND_DISPLAY") or env.get("DISPLAY")):
        return 2
    try:
        result = run_owned([dialog, "--title", title, "--password", label], env, timeout)
    except subprocess.TimeoutExpired:
        # run_owned kills and reaps the owned dialog on timeout.
        return 3
    if result.returncode != 0:
        return 1
    answer = result.stdout.removesuffix(b"\n")
    del result
    if not answer or b"\n" in answer or b"\r" in answer or b"\x00" in answer:
        return 2
    try:
        remaining = memoryview(answer)
        os.set_blocking(fd, False)
        deadline = time.monotonic() + 5
        while remaining:
            wait = deadline - time.monotonic()
            if wait <= 0 or not select.select([], [fd], [], wait)[1]:
                return 2
            remaining = remaining[os.write(fd, remaining):]
    finally:
        del answer
    return 0


def cancel_owned_prompt(_signum, _frame):
    # Raising through run_owned kills and reaps its active child.
    raise KeyboardInterrupt


def main():
    signal.signal(signal.SIGTERM, cancel_owned_prompt)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-fd", type=int, required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--label", required=True)
    parser.add_argument("--timeout", type=int, default=60)
    args = parser.parse_args()
    try:
        return prompt(args.write_fd, args.title, args.label, args.timeout)
    except KeyboardInterrupt:
        return 1
    except (OSError, subprocess.SubprocessError):
        return 2


if __name__ == "__main__":
    sys.exit(main())

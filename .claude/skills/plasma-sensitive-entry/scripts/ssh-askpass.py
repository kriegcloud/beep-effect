#!/usr/bin/env python3
"""SSH-only adapter: stdout is SSH's private askpass channel, never a tool result."""
import os
from pathlib import Path
import select
import signal
import subprocess
import sys
import time


def stop_authentication(ssh_pid):
    """Signal only the still-direct SSH parent; its owning supervisor reaps it."""
    if os.getppid() == ssh_pid:
        try:
            os.kill(ssh_pid, signal.SIGTERM)
        except ProcessLookupError:
            pass


def main():
    # Prevent the common mistake of running this script in a tool terminal.
    # This is a misuse guard, not a security boundary against local processes.
    hint = os.environ.get("SSH_ASKPASS_PROMPT")
    if hint == "none":
        return 0  # Notification only: never collect text or signal SSH.
    if hint == "confirm":
        return 2  # Empty successful output would approve an SSH permission request.
    if hint not in (None, ""):
        return 2
    ssh_pid = os.getppid()
    if Path(f"/proc/{ssh_pid}/comm").read_text().strip() != "ssh":
        return 2
    title = os.environ.get("PLASMA_AUTH_TITLE", "")
    label = os.environ.get("PLASMA_AUTH_LABEL", "")
    expected = os.environ.get("PLASMA_AUTH_SSH_PROMPT", "").rstrip(" \t")
    # OpenSSH prefixes keyboard-interactive challenges with the effective
    # remote user and host/HostKeyAlias. Never strip that identity boundary.
    if not expected.startswith("(") or ") " not in expected or len(sys.argv) != 2 or sys.argv[1].rstrip(" \t") != expected:
        stop_authentication(ssh_pid)
        return 2
    if not title or not label or any(len(value) > 500 or any(ord(char) < 32 for char in value) for value in (title, label, expected)):
        stop_authentication(ssh_pid)
        return 2
    try:
        reader, writer = os.pipe()
    except OSError:
        stop_authentication(ssh_pid)
        raise
    child = None
    answer = bytearray()
    delivered = False
    try:
        child = subprocess.Popen(
            [sys.executable, str(Path(__file__).with_name("prompt.py")),
             "--write-fd", str(writer), "--title", title,
             "--label", label,
             "--timeout", "60"],
            pass_fds=(writer,), stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.close(writer)
        writer = None
        deadline = time.monotonic() + 70
        while True:
            wait = deadline - time.monotonic()
            if wait <= 0 or not select.select([reader], [], [], wait)[0]:
                return 3
            part = os.read(reader, 4096)
            if not part:
                break
            answer.extend(part)
            if len(answer) > 4096:
                return 2
        status = child.wait(timeout=5)
        if status in (1, 3):
            return 1
        if status != 0 or not answer:
            return 2
        # Only SSH receives this pipe; never invoke this adapter directly.
        sys.stdout.buffer.write(answer + b"\n")
        sys.stdout.buffer.flush()
        delivered = True
        return 0
    finally:
        if not delivered:
            stop_authentication(ssh_pid)
        answer.clear()
        if writer is not None:
            os.close(writer)
        os.close(reader)
        if child is not None:
            if child.poll() is None:
                child.terminate()
                try:
                    child.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    child.kill()
                    child.wait(timeout=5)
            else:
                child.wait()


def cancelled(_signum, _frame):
    raise KeyboardInterrupt


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, cancelled)
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(1)
    except (OSError, subprocess.SubprocessError):
        sys.exit(2)

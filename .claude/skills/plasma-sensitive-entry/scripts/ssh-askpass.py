#!/usr/bin/env python3
"""SSH-only adapter: stdout is SSH's private askpass channel, never a tool result."""
import os
from pathlib import Path
import select
import signal
import subprocess
import sys
import time


def main():
    # Prevent the common mistake of running this script in a tool terminal.
    # This is a misuse guard, not a security boundary against local processes.
    ssh_pid = os.getppid()
    if Path(f"/proc/{ssh_pid}/comm").read_text().strip() != "ssh":
        return 2
    title = os.environ.get("PLASMA_AUTH_TITLE", "")
    label = os.environ.get("PLASMA_AUTH_LABEL", "")
    if not title or not label or any(len(value) > 500 or any(ord(char) < 32 for char in value) for value in (title, label)):
        return 2
    reader, writer = os.pipe()
    child = None
    answer = bytearray()
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
            # Stop this authentication owner so SSH cannot open another method's
            # dialog after explicit cancellation or expiration. No action has
            # authenticated while its askpass callback is still outstanding.
            os.kill(ssh_pid, signal.SIGTERM)
            return 1
        if status != 0 or not answer:
            return 2
        # Only SSH receives this pipe; never invoke this adapter directly.
        sys.stdout.buffer.write(answer + b"\n")
        sys.stdout.buffer.flush()
        return 0
    finally:
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

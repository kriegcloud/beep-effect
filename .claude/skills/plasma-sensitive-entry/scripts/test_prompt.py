"""Synthetic delivery/failure tests; no desktop prompts or real credentials."""
import contextlib
import io
import os
import subprocess
import unittest
from unittest.mock import patch

import prompt


class PromptTests(unittest.TestCase):
    def setUp(self):
        self.reader, self.writer = os.pipe()
        self.addCleanup(os.close, self.reader)
        self.addCleanup(os.close, self.writer)
        self.session = subprocess.CompletedProcess([], 0, b"DISPLAY=:synthetic\nDBUS_SESSION_BUS_ADDRESS=unix:path=/synthetic\n", b"")

    def run_dialog(self, result):
        output = io.StringIO()
        with patch.dict(os.environ, {}, clear=True), patch.object(prompt.shutil, "which", return_value="/synthetic/kdialog"), patch.object(prompt, "run_owned", side_effect=[self.session, result]), contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            status = prompt.prompt(self.writer, "Synthetic action", "Synthetic field")
        self.assertEqual(output.getvalue(), "")
        return status

    def assert_no_delivery(self):
        os.set_blocking(self.reader, False)
        with self.assertRaises(BlockingIOError):
            os.read(self.reader, 1024)

    def test_success_delivers_only_to_pipe(self):
        self.assertEqual(self.run_dialog(subprocess.CompletedProcess([], 0, b"synthetic-answer\n", b"")), 0)
        self.assertEqual(os.read(self.reader, 1024), b"synthetic-answer")

    def test_cancel_discards_output(self):
        self.assertEqual(self.run_dialog(subprocess.CompletedProcess([], 1, b"discard-this\n", b"private-error")), 1)
        self.assert_no_delivery()

    def test_timeout_delivers_nothing(self):
        self.assertEqual(self.run_dialog(subprocess.TimeoutExpired("synthetic", 60, output=b"discard-this")), 3)
        self.assert_no_delivery()

    def test_empty_or_multiline_input_is_rejected(self):
        for value in (b"\n", b"first\nsecond\n", b"nul\x00\n", b"cr\r\n"):
            self.assertEqual(self.run_dialog(subprocess.CompletedProcess([], 0, value, b"")), 2)
            self.assert_no_delivery()

    def test_standard_and_regular_file_descriptors_rejected(self):
        with patch.object(prompt, "run_owned") as run:
            for fd in (0, 1, 2):
                self.assertEqual(prompt.prompt(fd, "title", "label"), 2)
            duplicate = os.dup(1)
            try:
                self.assertEqual(prompt.prompt(duplicate, "title", "label"), 2)
            finally:
                os.close(duplicate)
            with open(os.devnull, "wb") as sink:
                self.assertEqual(prompt.prompt(sink.fileno(), "title", "label"), 2)
            run.assert_not_called()

    def test_missing_gui_fails_without_dialog(self):
        with patch.object(prompt.shutil, "which", return_value="/synthetic/kdialog"), patch.dict(os.environ, {}, clear=True), patch.object(prompt, "run_owned", return_value=subprocess.CompletedProcess([], 0, b"", b"")) as run:
            self.assertEqual(prompt.prompt(self.writer, "title", "label"), 2)
            self.assertEqual(run.call_count, 1)
        self.assert_no_delivery()


if __name__ == "__main__":
    unittest.main()

class ProcessTests(unittest.TestCase):
    """Exercise real child cleanup and pipe delivery with synthetic executables."""
    def test_direct_askpass_invocation_refuses_without_output(self):
        from pathlib import Path
        import sys
        result = subprocess.run([sys.executable, str(Path(__file__).with_name("ssh-askpass.py"))], capture_output=True, timeout=5)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout + result.stderr, b"")

    def test_selected_session_metadata_is_preserved(self):
        reader, writer = os.pipe()
        try:
            env = {"DISPLAY": ":selected", "DBUS_SESSION_BUS_ADDRESS": "unix:path=/selected"}
            responses = [subprocess.CompletedProcess([], 0, b"DISPLAY=:manager\nDBUS_SESSION_BUS_ADDRESS=unix:path=/manager\n", b""), subprocess.CompletedProcess([], 1, b"", b"")]
            with patch.dict(os.environ, env, clear=True), patch.object(prompt.shutil, "which", return_value="/synthetic/kdialog"), patch.object(prompt, "run_owned", return_value=responses[1]) as run:
                self.assertEqual(prompt.prompt(writer, "title", "label"), 1)
                self.assertEqual(run.call_count, 1)
                self.assertEqual(run.call_args.args[1]["DISPLAY"], ":selected")
                self.assertEqual(run.call_args.args[1]["DBUS_SESSION_BUS_ADDRESS"], "unix:path=/selected")
        finally:
            os.close(reader)
            os.close(writer)

class InstallTests(unittest.TestCase):
    def test_preserves_instructions_and_is_repeatable(self):
        from pathlib import Path
        import tempfile
        import install
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            source = home / "source"
            source.mkdir()
            instructions = home / ".codex/AGENTS.md"
            instructions.parent.mkdir()
            instructions.write_text("Existing human instructions.\n")
            install.install(home, source)
            first = instructions.read_text()
            install.install(home, source)
            self.assertEqual(instructions.read_text(), first)
            self.assertTrue(first.startswith("Existing human instructions.\n"))
            self.assertEqual(first.count(install.START), 1)
            self.assertEqual((home / ".agents/skills/plasma-sensitive-entry").resolve(), source)

    def test_competing_install_refuses_before_mutation(self):
        from pathlib import Path
        import tempfile
        import install
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            target = home / ".claude/skills/plasma-sensitive-entry"
            target.mkdir(parents=True)
            with self.assertRaises(RuntimeError):
                install.install(home, home / "source")
            self.assertFalse((home / ".agents/skills/plasma-sensitive-entry").exists())
            self.assertFalse((home / ".codex/AGENTS.md").exists())

class LifecycleTests(unittest.TestCase):
    def check_owned_dialog_cleanup(self, cancel):
        from pathlib import Path
        import signal
        import sys
        import tempfile
        import time
        helper = Path(__file__).with_name("prompt.py").resolve()
        with tempfile.TemporaryDirectory(prefix="plasma-synthetic-") as directory:
            root = Path(directory)
            fake = root / "kdialog"
            fake.write_text('#!/usr/bin/python3\nimport os,time\nfrom pathlib import Path\nPath(__file__).with_name("dialog.pid").write_text(str(os.getpid()))\ntime.sleep(30)\n')
            fake.chmod(0o700)
            reader, writer = os.pipe()
            env = {**os.environ, "PATH": str(root) + ":" + os.environ["PATH"], "DISPLAY": ":synthetic", "DBUS_SESSION_BUS_ADDRESS": "unix:path=/synthetic"}
            child = subprocess.Popen([sys.executable, str(helper), "--write-fd", str(writer), "--title", "Synthetic lifecycle test", "--label", "No human input requested", "--timeout", "1"], pass_fds=(writer,), stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
            os.close(writer)
            try:
                deadline = time.monotonic() + 3
                while not (root / "dialog.pid").exists() and time.monotonic() < deadline:
                    time.sleep(.01)
                self.assertTrue((root / "dialog.pid").exists())
                dialog_pid = int((root / "dialog.pid").read_text())
                if cancel:
                    child.send_signal(signal.SIGTERM)
                output, error = child.communicate(timeout=7)
                self.assertEqual(child.returncode, 1 if cancel else 3)
                self.assertEqual(output + error + os.read(reader, 4096), b"")
                with self.assertRaises(ProcessLookupError):
                    os.kill(dialog_pid, 0)
            finally:
                os.close(reader)
                if child.poll() is None:
                    child.kill()
                    child.wait(timeout=5)

    def test_timeout_reaps_owned_dialog_without_delivery(self):
        self.check_owned_dialog_cleanup(False)

    def test_cancellation_reaps_owned_dialog_without_delivery(self):
        self.check_owned_dialog_cleanup(True)

class AskpassTests(unittest.TestCase):
    def load_adapter(self):
        import importlib.util
        from pathlib import Path
        spec = importlib.util.spec_from_file_location("ssh_askpass", Path(__file__).with_name("ssh-askpass.py"))
        adapter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(adapter)
        return adapter

    def test_missing_trusted_context_refuses_collection(self):
        adapter = self.load_adapter()
        with patch.object(adapter.Path, "read_text", return_value="ssh\n"), patch.object(adapter.os, "getppid", return_value=424242), patch.dict(os.environ, {}, clear=True), patch.object(adapter.os, "kill") as kill, patch.object(adapter.subprocess, "Popen") as launch:
            self.assertEqual(adapter.main(), 2)
            launch.assert_not_called()
            kill.assert_called_once_with(424242, __import__("signal").SIGTERM)

    def test_cancel_and_expiration_stop_only_authentication_parent(self):
        from unittest.mock import Mock
        import signal
        adapter = self.load_adapter()
        env = {"PLASMA_AUTH_TITLE": "Synthetic host: connect", "PLASMA_AUTH_LABEL": "Synthetic OTP to SSH", "PLASMA_AUTH_SSH_PROMPT": "(operator@host-alias.example.invalid) Verification code:"}
        for status in (1, 3):
            child = Mock()
            child.wait.return_value = status
            child.poll.return_value = status
            with patch.object(adapter.Path, "read_text", return_value="ssh\n"), patch.object(adapter.os, "getppid", return_value=424242), patch.object(adapter.sys, "argv", ["ssh-askpass.py", "(operator@host-alias.example.invalid) Verification code: "]), patch.dict(os.environ, env, clear=True), patch.object(adapter.subprocess, "Popen", return_value=child), patch.object(adapter.os, "kill") as kill:
                self.assertEqual(adapter.main(), 1)
                kill.assert_called_once_with(424242, signal.SIGTERM)

class CallbackClassificationTests(unittest.TestCase):
    def test_notifications_and_confirmations_never_collect_or_signal(self):
        adapter = AskpassTests().load_adapter()
        for hint, expected in (("none", 0), ("confirm", 2)):
            with patch.dict(os.environ, {"SSH_ASKPASS_PROMPT": hint}, clear=True), patch.object(adapter.subprocess, "Popen") as launch, patch.object(adapter.os, "kill") as kill:
                self.assertEqual(adapter.main(), expected)
                launch.assert_not_called()
                kill.assert_not_called()

    def test_unknown_and_fido_pin_text_callbacks_are_refused(self):
        adapter = AskpassTests().load_adapter()
        env = {"PLASMA_AUTH_TITLE": "Synthetic host: connect", "PLASMA_AUTH_LABEL": "Synthetic OTP to SSH", "PLASMA_AUTH_SSH_PROMPT": "(operator@host-alias.example.invalid) Verification code:"}
        for challenge in ("Enter PIN for authenticator:", "Enter passphrase for key:", "Password:", "Verification code: ", "(other@host-alias.example.invalid) Verification code: ", "(operator@other.example.invalid) Verification code: ", "(operator@host-alias.example.invalid) Verification code:\n"):
            with patch.dict(os.environ, env, clear=True), patch.object(adapter.os, "getppid", return_value=424242), patch.object(adapter.Path, "read_text", return_value="ssh\n"), patch.object(adapter.sys, "argv", ["ssh-askpass.py", challenge]), patch.object(adapter.subprocess, "Popen") as launch, patch.object(adapter.os, "kill") as kill:
                self.assertEqual(adapter.main(), 2)
                launch.assert_not_called()
                kill.assert_called_once_with(424242, __import__("signal").SIGTERM)

class InstallMarkerTests(unittest.TestCase):
    def test_reversed_markers_refuse_without_changing_existing_instructions(self):
        from pathlib import Path
        import tempfile
        import install
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            instructions = home / ".codex/AGENTS.md"
            instructions.parent.mkdir()
            original = install.END + "\nExisting instructions.\n" + install.START + "\n"
            instructions.write_text(original)
            with self.assertRaises(RuntimeError):
                install.install(home, home / "source")
            self.assertEqual(instructions.read_text(), original)
            self.assertFalse((home / ".agents/skills/plasma-sensitive-entry").exists())

class OpenSshPromptTests(unittest.TestCase):
    def test_prefixed_callback_with_trailing_space_delivers_to_ssh_channel(self):
        from types import SimpleNamespace
        from unittest.mock import Mock
        adapter = AskpassTests().load_adapter()
        env = {"PLASMA_AUTH_TITLE": "Synthetic host: connect", "PLASMA_AUTH_LABEL": "Synthetic OTP to SSH", "PLASMA_AUTH_SSH_PROMPT": "(operator@host-alias.example.invalid) Verification code:"}
        child = Mock()
        child.wait.return_value = 0
        child.poll.return_value = 0
        captured = io.BytesIO()

        def launch(args, **_kwargs):
            writer = int(args[args.index("--write-fd") + 1])
            os.write(writer, b"synthetic-otp")
            return child

        with patch.dict(os.environ, env, clear=True), patch.object(adapter.Path, "read_text", return_value="ssh\n"), patch.object(adapter.sys, "argv", ["ssh-askpass.py", "(operator@host-alias.example.invalid) Verification code: \t"]), patch.object(adapter.sys, "stdout", SimpleNamespace(buffer=captured)), patch.object(adapter.subprocess, "Popen", side_effect=launch), patch.object(adapter.os, "kill") as kill:
            self.assertEqual(adapter.main(), 0)
            kill.assert_not_called()
        self.assertEqual(captured.getvalue(), b"synthetic-otp\n")

class RefusalLifecycleTests(unittest.TestCase):
    def test_pipe_setup_failure_stops_verified_authentication_owner(self):
        import signal
        adapter = AskpassTests().load_adapter()
        expected = "(operator@host-alias.example.invalid) Verification code:"
        env = {"PLASMA_AUTH_TITLE": "Synthetic host: connect", "PLASMA_AUTH_LABEL": "Synthetic OTP to SSH", "PLASMA_AUTH_SSH_PROMPT": expected}
        with patch.dict(os.environ, env, clear=True), patch.object(adapter.Path, "read_text", return_value="ssh\n"), patch.object(adapter.os, "getppid", return_value=424242), patch.object(adapter.sys, "argv", ["ssh-askpass.py", expected + " "]), patch.object(adapter.os, "pipe", side_effect=OSError("synthetic setup failure")), patch.object(adapter.os, "kill") as kill:
            with self.assertRaises(OSError):
                adapter.main()
            kill.assert_called_once_with(424242, signal.SIGTERM)

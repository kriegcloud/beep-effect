"""Zero-model admission and private-directory tests for the retained probe."""

import os
import pathlib
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest


class ProbeGuards(unittest.TestCase):
    def setUp(self):
        source = pathlib.Path(__file__).with_name("mitigation_probe.py").resolve()
        root = next(parent for parent in source.parents if (parent / ".git").exists())
        (root / ".beep").mkdir(exist_ok=True)
        self.scratch = tempfile.TemporaryDirectory(prefix="probe-guards-", dir=root / ".beep")
        self.addCleanup(self.scratch.cleanup)
        self.home = pathlib.Path(self.scratch.name) / "synthetic-home"
        self.base = self.home / ".cache" / "beep" / "owned-probe"
        self.base.mkdir(parents=True, mode=0o700)
        self.script = self.base / source.name
        shutil.copyfile(source, self.script)
        self.workspace = self.base / "workspace"

    def run_probe(self, *flags):
        return subprocess.run(
            [sys.executable, str(self.script), *flags],
            env={"HOME": str(self.home), "PATH": str(self.home / "no-provider-tools")},
            capture_output=True,
            text=True,
            timeout=5,
            preexec_fn=lambda: os.umask(0o022),
        )

    def assert_no_provider_artifacts(self):
        self.assertFalse((self.base / "control.sock").exists())
        self.assertFalse((self.base / "persistent-raw.private.jsonl").exists())
        self.assertFalse((self.base / "persistent-stderr.private.log").exists())
        self.assertFalse((self.base / "persistent-results.json").exists())

    def test_missing_opt_in_precedes_all_mutations(self):
        for flags in [(), ("--prepare-only",)]:
            result = self.run_probe(*flags)
            self.assertEqual(result.returncode, 2)
            self.assertIn("--run-model-probes is required", result.stderr)
            self.assertFalse(self.workspace.exists())
            self.assert_no_provider_artifacts()

    def test_new_workspace_is_private_even_with_permissive_parent_umask(self):
        result = self.run_probe("--run-model-probes", "--prepare-only")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(stat.S_IMODE(self.workspace.stat().st_mode), 0o700)
        self.assertEqual(list(self.workspace.iterdir()), [])
        self.assert_no_provider_artifacts()
        self.assertFalse((self.home / ".codex").exists())

    def test_existing_unsuitable_workspace_is_not_repaired(self):
        self.workspace.mkdir(mode=0o755)
        self.workspace.chmod(0o755)
        result = self.run_probe("--run-model-probes", "--prepare-only")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("pre-existing workspace", result.stderr)
        self.assertEqual(stat.S_IMODE(self.workspace.stat().st_mode), 0o755)
        self.assert_no_provider_artifacts()

    def test_symlink_and_nonempty_workspace_are_refused(self):
        target = self.base / "other"
        target.mkdir(mode=0o700)
        self.workspace.symlink_to(target, target_is_directory=True)
        self.assertNotEqual(self.run_probe("--run-model-probes", "--prepare-only").returncode, 0)
        self.workspace.unlink()
        self.workspace.mkdir(mode=0o700)
        sentinel = self.workspace / "retained"
        sentinel.write_text("preserve me")
        self.assertNotEqual(self.run_probe("--run-model-probes", "--prepare-only").returncode, 0)
        self.assertEqual(sentinel.read_text(), "preserve me")
        self.assert_no_provider_artifacts()

    def test_empty_private_existing_workspace_is_accepted(self):
        self.workspace.mkdir(mode=0o700)
        self.assertEqual(self.run_probe("--run-model-probes", "--prepare-only").returncode, 0)
        self.assert_no_provider_artifacts()

    def test_existing_socket_path_is_not_removed(self):
        socket = self.base / "control.sock"
        socket.symlink_to(self.base / "missing")
        result = self.run_probe("--run-model-probes", "--prepare-only")
        self.assertNotEqual(result.returncode, 0)
        self.assertTrue(socket.is_symlink())
        self.assertFalse(self.workspace.exists())

    def test_nonprivate_probe_directory_is_rejected_before_workspace_creation(self):
        self.base.chmod(0o755)
        result = self.run_probe("--run-model-probes", "--prepare-only")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("probe directory", result.stderr)
        self.assertFalse(self.workspace.exists())


if __name__ == "__main__":
    unittest.main()

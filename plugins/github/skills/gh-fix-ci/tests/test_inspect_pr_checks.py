"""Regression for untrusted job logs shown by the gh-fix-ci inspector."""

import importlib.util
from pathlib import Path
from unittest import TestCase, mock


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "inspect_pr_checks.py"
SPEC = importlib.util.spec_from_file_location("inspect_pr_checks", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
inspector = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(inspector)


class JobLogSanitizationTest(TestCase):
    def test_nested_escape_cannot_reconstruct_clipboard_command(self):
        payload = b"\x1b]52;c;Y2xpcGJvYXJkLXRlc3Q=\x1b[31m\x07\n##[error]failed\n"

        with (
            mock.patch.object(inspector, "fetch_repo_slug", return_value="example/repo"),
            mock.patch.object(inspector, "run_gh_command_raw", return_value=(0, payload, "")),
        ):
            log, error = inspector.fetch_job_log("123", Path("."))

        self.assertEqual(error, "")
        self.assertIn("##[error]failed", log)
        self.assertNotIn("\x1b", log)
        self.assertNotIn("\x07", log)


if __name__ == "__main__":
    import unittest

    unittest.main()

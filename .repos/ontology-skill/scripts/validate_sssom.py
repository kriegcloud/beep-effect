"""Pre-commit hook: validate SSSOM mapping files using sssom-py CLI.

Validates each staged .sssom.tsv file individually since sssom validate
accepts only one positional input.
Exit 0 if all files are valid, exit 1 on any validation failure.
"""

from __future__ import annotations

import subprocess
import sys


def main() -> int:
    """Validate SSSOM files passed as arguments."""
    if not sys.argv[1:]:
        return 0

    errors = 0
    for path in sys.argv[1:]:
        result = subprocess.run(
            ["sssom", "validate", path],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            print(f"FAIL  {path}:\n{result.stderr.strip()}", file=sys.stderr)
            errors += 1

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())

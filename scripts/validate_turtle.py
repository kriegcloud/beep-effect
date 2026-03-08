"""Pre-commit hook: validate Turtle syntax using rdflib.

Parses each staged .ttl file and reports syntax errors.
Exit 0 if all files are valid, exit 1 on any parse failure.
"""

from __future__ import annotations

import sys

from rdflib import Graph
from rdflib.exceptions import ParserError


def main() -> int:
    """Validate Turtle files passed as arguments."""
    if not sys.argv[1:]:
        return 0

    errors = 0
    for path in sys.argv[1:]:
        try:
            g = Graph()
            g.parse(path, format="turtle")
        except (ParserError, Exception) as e:
            print(f"FAIL  {path}: {e}", file=sys.stderr)
            errors += 1

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())

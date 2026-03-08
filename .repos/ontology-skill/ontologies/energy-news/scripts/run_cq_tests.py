"""Run all CQ/TBox/Neg SPARQL tests against the merged ontology.

Tests are categorized:
- CQ tests (SELECT): expect non-empty result sets
- TBox tests (ASK): expect True
- Neg tests (ASK): expect False
- Verify tests (SELECT): expect zero-row results (no violations)
"""

from pathlib import Path

import yaml
from rdflib import Graph

TESTS_DIR = Path(__file__).parent.parent / "tests"
MERGED = Path("/tmp/enews-merged-v03.ttl")


def load_manifest() -> dict:
    """Load the test manifest."""
    manifest_path = TESTS_DIR / "cq-test-manifest.yaml"
    with manifest_path.open() as f:
        return yaml.safe_load(f)


def _run_ask_test(
    g: Graph,
    test_id: str,
    query_text: str,
    expected: object,
) -> tuple[str, str]:
    """Run an ASK query test. Returns (category, message) where category is 'passed' or 'failed'."""
    result = g.query(query_text)
    actual = bool(result.askAnswer)
    expected_bool = str(expected).lower() == "true"
    if actual == expected_bool:
        return "passed", f"{test_id}: ASK={actual} (expected {expected_bool})"
    return "failed", f"{test_id}: ASK={actual} but expected {expected_bool}"


def _run_select_test(
    g: Graph,
    test_id: str,
    query_text: str,
    expected: str,
) -> tuple[str, str]:
    """Run a SELECT query test. Returns (category, message)."""
    result = g.query(query_text)
    rows = list(result)
    if expected == "non_empty" and len(rows) > 0:
        return "passed", f"{test_id}: {len(rows)} rows (expected non_empty)"
    if expected == "non_empty" and len(rows) == 0:
        return "failed", f"{test_id}: 0 rows (expected non_empty)"
    if expected == "empty" and len(rows) == 0:
        return "passed", f"{test_id}: 0 rows (expected empty)"
    if expected == "empty" and len(rows) > 0:
        return "failed", f"{test_id}: {len(rows)} rows (expected empty)"
    return "passed", f"{test_id}: {len(rows)} rows"


def _run_manifest_tests(
    g: Graph,
    tests: list[dict],
    default_expected: object,
    default_type: str,
    passed: list[str],
    failed: list[str],
    skipped: list[str],
) -> None:
    """Run a batch of manifest-defined tests."""
    for test in tests:
        test_id = test["id"]
        test_file = TESTS_DIR / test["file"]
        expected = test.get("expected", default_expected)
        test_type = test.get("type", default_type)

        if not test_file.exists():
            skipped.append(f"{test_id}: file not found ({test_file.name})")
            continue

        query_text = test_file.read_text()
        try:
            if test_type == "ASK":
                cat, msg = _run_ask_test(g, test_id, query_text, expected)
            else:
                cat, msg = _run_select_test(g, test_id, query_text, str(expected))
            (passed if cat == "passed" else failed).append(msg)
        except Exception as e:
            failed.append(f"{test_id}: ERROR - {e}")


def run_tests(g: Graph) -> tuple[list[str], list[str], list[str]]:
    """Run all tests and return (passed, failed, skipped) lists."""
    manifest = load_manifest()
    passed: list[str] = []
    failed: list[str] = []
    skipped: list[str] = []

    results = (passed, failed, skipped)
    _run_manifest_tests(g, manifest.get("cq_tests", []), "non_empty", "SELECT", *results)
    _run_manifest_tests(g, manifest.get("tbox_tests", []), True, "ASK", *results)
    _run_manifest_tests(
        g,
        manifest.get("non_entailment_tests", []),
        False,
        "ASK",
        *results,
    )

    # --- Verify Tests (zero-violation queries) ---
    for vf in sorted(TESTS_DIR.glob("verify-*.sparql")):
        test_id = vf.stem
        try:
            result = g.query(vf.read_text())
            rows = list(result)
            if len(rows) == 0:
                passed.append(f"{test_id}: 0 violations")
            else:
                failed.append(f"{test_id}: {len(rows)} violations found")
        except Exception as e:
            failed.append(f"{test_id}: ERROR - {e}")

    return passed, failed, skipped


def main() -> None:
    """Run the full test suite."""
    print(f"Loading ontology from {MERGED}")
    g = Graph()
    g.parse(MERGED, format="turtle")
    print(f"  {len(g)} triples loaded\n")

    passed, failed, skipped = run_tests(g)

    print("=" * 60)
    print(f"RESULTS: {len(passed)} passed, {len(failed)} failed, {len(skipped)} skipped")
    print("=" * 60)

    if passed:
        print(f"\n✓ PASSED ({len(passed)}):")
        for p in passed:
            print(f"  ✓ {p}")

    if failed:
        print(f"\n✗ FAILED ({len(failed)}):")
        for f in failed:
            print(f"  ✗ {f}")

    if skipped:
        print(f"\n⊘ SKIPPED ({len(skipped)}):")
        for s in skipped:
            print(f"  ⊘ {s}")

    print()
    if failed:
        print("OVERALL: FAIL")
        raise SystemExit(1)
    print("OVERALL: PASS")


if __name__ == "__main__":
    main()

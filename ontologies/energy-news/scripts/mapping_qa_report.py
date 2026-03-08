"""Generate quality report for SSSOM mapping files."""

import contextlib
from collections import Counter
from pathlib import Path

import yaml

MAPPINGS_DIR = Path(__file__).parent.parent / "mappings"


def parse_sssom(filepath: Path) -> tuple[dict, list[dict]]:
    """Parse an SSSOM TSV file into metadata and rows."""
    metadata_lines: list[str] = []
    data_lines: list[str] = []

    with filepath.open() as f:
        for line in f:
            if line.startswith("#"):
                metadata_lines.append(line[1:])
            else:
                data_lines.append(line.rstrip())

    # Parse metadata
    metadata_text = "\n".join(metadata_lines)
    metadata = yaml.safe_load(metadata_text) or {}

    # Parse TSV data
    if not data_lines:
        return metadata, []

    headers = data_lines[0].split("\t")
    rows = []
    for line in data_lines[1:]:
        if not line.strip():
            continue
        values = line.split("\t")
        row = dict(zip(headers, values, strict=False))
        rows.append(row)

    return metadata, rows


def generate_report(filepath: Path, metadata: dict, rows: list[dict]) -> str:
    """Generate a quality report for one mapping file."""
    lines = [f"### {filepath.name}", ""]

    # Basic stats
    lines.append(f"- **Mappings:** {len(rows)}")
    lines.append(f"- **Subject source:** {metadata.get('subject_source', 'N/A')}")
    lines.append(f"- **Object source:** {metadata.get('object_source', 'N/A')}")
    lines.append(f"- **License:** {metadata.get('license', 'N/A')}")
    lines.append("")

    # Predicate distribution
    pred_counts = Counter(r.get("predicate_id", "unknown") for r in rows)
    lines.append("**Predicate distribution:**")
    lines.append("")
    lines.append("| Predicate | Count |")
    lines.append("|-----------|-------|")
    for pred, count in pred_counts.most_common():
        lines.append(f"| `{pred}` | {count} |")
    lines.append("")

    # Confidence distribution
    confidences = _extract_confidences(rows)
    if confidences:
        _append_confidence_stats(lines, confidences)

    # Justification distribution
    just_counts = Counter(r.get("mapping_justification", "unknown") for r in rows)
    lines.append("**Justification methods:**")
    lines.append("")
    for just, count in just_counts.most_common():
        lines.append(f"- `{just}`: {count}")
    lines.append("")

    # Check for potential issues
    issues = _find_issues(rows)
    if issues:
        lines.append("**Issues found:**")
        lines.append("")
        lines.extend(f"- {issue}" for issue in issues)
        lines.append("")
    else:
        lines.append("**Issues found:** None")
        lines.append("")

    return "\n".join(lines)


def _extract_confidences(rows: list[dict]) -> list[float]:
    """Extract valid confidence values from mapping rows."""
    confidences: list[float] = []
    for r in rows:
        with contextlib.suppress(ValueError):
            confidences.append(float(r.get("confidence", 0)))
    return confidences


def _append_confidence_stats(lines: list[str], confidences: list[float]) -> None:
    """Append confidence distribution stats to report lines."""
    avg_conf = sum(confidences) / len(confidences)
    min_conf = min(confidences)
    max_conf = max(confidences)
    high = sum(1 for c in confidences if c >= 0.85)
    medium = sum(1 for c in confidences if 0.70 <= c < 0.85)
    low = sum(1 for c in confidences if c < 0.70)

    lines.append("**Confidence distribution:**")
    lines.append("")
    lines.append(f"- Mean: {avg_conf:.2f}")
    lines.append(f"- Range: {min_conf:.2f} - {max_conf:.2f}")
    lines.append(f"- High (>=0.85): {high}")
    lines.append(f"- Medium (0.70-0.84): {medium}")
    lines.append(f"- Low (<0.70): {low}")
    lines.append("")


def _find_issues(rows: list[dict]) -> list[str]:
    """Find potential issues in mapping rows."""
    issues: list[str] = []

    # Self-mappings
    issues.extend(
        f"Self-mapping: {r.get('subject_id')}"
        for r in rows
        if r.get("subject_id") == r.get("object_id")
    )

    # Duplicate mappings
    seen: set[tuple[str | None, ...]] = set()
    for r in rows:
        key = (r.get("subject_id"), r.get("predicate_id"), r.get("object_id"))
        if key in seen:
            issues.append(f"Duplicate: {key}")
        seen.add(key)

    # exactMatch transitivity check
    exact_subjects = [
        r.get("subject_id") for r in rows if r.get("predicate_id") == "skos:exactMatch"
    ]
    if len(exact_subjects) > 3:
        issues.append(
            f"Warning: {len(exact_subjects)} exactMatch mappings - check for transitive cliques"
        )

    return issues


def main() -> None:
    """Generate quality report for all mapping files."""
    mapping_files = sorted(MAPPINGS_DIR.glob("*.sssom.tsv"))

    report_lines = [
        "# SSSOM Mapping Quality Report — Energy News Ontology v0.3.0",
        "",
        "**Date:** 2026-02-26",
        f"**Files evaluated:** {len(mapping_files)}",
        "",
    ]

    total_mappings = 0
    all_preds: Counter[str] = Counter()
    all_confs: list[float] = []

    for mf in mapping_files:
        metadata, rows = parse_sssom(mf)
        total_mappings += len(rows)
        for r in rows:
            all_preds[r.get("predicate_id", "unknown")] += 1
            with contextlib.suppress(ValueError):
                all_confs.append(float(r.get("confidence", 0)))

        report_lines.append(generate_report(mf, metadata, rows))

    # Summary
    summary = [
        "## Overall Summary",
        "",
        f"- **Total mapping files:** {len(mapping_files)}",
        f"- **Total mappings:** {total_mappings}",
        "",
        "**Aggregate predicate distribution:**",
        "",
        "| Predicate | Count | % |",
        "|-----------|-------|---|",
    ]
    for pred, count in all_preds.most_common():
        pct = count / total_mappings * 100 if total_mappings else 0
        summary.append(f"| `{pred}` | {count} | {pct:.0f}% |")
    summary.append("")

    if all_confs:
        avg = sum(all_confs) / len(all_confs)
        summary.append(
            f"**Aggregate confidence:** mean {avg:.2f}, "
            f"range {min(all_confs):.2f} - {max(all_confs):.2f}"
        )
        summary.append("")

    # No exactMatch used — good
    exact_count = all_preds.get("skos:exactMatch", 0)
    if exact_count == 0:
        summary.append("**Transitivity risk:** None (no skos:exactMatch mappings used)")
    else:
        summary.append(
            f"**Transitivity risk:** {exact_count} skos:exactMatch mappings — "
            "verify no unintended transitive cliques"
        )
    summary.append("")

    report_lines[4:4] = summary

    report_text = "\n".join(report_lines)
    report_path = MAPPINGS_DIR / "mapping-qa-report.md"
    report_path.write_text(report_text)
    print(report_text)
    print(f"\nReport written to {report_path}")


if __name__ == "__main__":
    main()

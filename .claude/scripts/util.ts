import type { CommonAncestorsResult } from "@beep/claude/scripts/analyze-architecture";
import * as A from "effect/Array";

export const renderCommonAncestors = (result: CommonAncestorsResult): string => {
  const sections = A.empty<string>();

  sections.push(`<common_ancestors n="${result.inputServices.length}">`);

  sections.push("  <input>");
  for (const service of result.inputServices) {
    sections.push(`    <service>${service}</service>`);
  }
  sections.push("  </input>");
  sections.push("");

  sections.push(`  <shared_dependencies n="${result.commonDependencies.length}">`);
  for (const dep of result.commonDependencies) {
    const coverageStr = `${dep.coverage}/${result.inputServices.length}`;
    sections.push(`    <dependency coverage="${coverageStr}" risk="${dep.risk}">`);
    sections.push(`      <service>${dep.service}</service>`);
    sections.push(`      <affected_by>${dep.affectedBy.join(", ")}</affected_by>`);
    sections.push(`    </dependency>`);
  }
  sections.push("  </shared_dependencies>");
  sections.push("");

  sections.push("  <root_cause_candidates>");
  for (const candidate of result.rootCauseCandidates) {
    const coveragePct = Math.round((candidate.coverage / result.inputServices.length) * 100);
    sections.push(
      `    <candidate rank="${candidate.rank}" service="${candidate.service}" coverage="${coveragePct}%" />`
    );
  }
  sections.push("  </root_cause_candidates>");

  sections.push("</common_ancestors>");

  return sections.join("\n");
};

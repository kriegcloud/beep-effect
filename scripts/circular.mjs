/**
 * Circular dependency check for tooling and packages.
 *
 * Uses madge to detect circular imports across the monorepo's
 * source directories. Exits with code 1 if any cycles are found.
 *
 * @since 0.0.0
 */
import madge from "madge";

const dirs = ["tooling/cli/src", "tooling/repo-utils/src", "tooling/codebase-search/src"];

let hasCircular = false;

for (const dir of dirs) {
  const result = await madge(dir, {
    fileExtensions: ["ts"],
    tsConfig: "tsconfig.json",
    detectiveOptions: { ts: { skipTypeImports: true } },
  });

  const circular = result.circular();
  if (circular.length > 0) {
    hasCircular = true;
    console.error(`Circular dependencies in ${dir}:`);
    for (const cycle of circular) {
      console.error(`  ${cycle.join(" → ")}`);
    }
  }
}

if (hasCircular) {
  process.exit(1);
} else {
  console.log("No circular dependencies found.");
}

/* biome-ignore lint: no-undef needed for Node globals */
import * as Fs from "node:fs";
import * as Path from "node:path";
import madge from "madge";

function findTsFiles(dirs) {
  const files = [];

  for (const dir of dirs) {
    if (!Fs.existsSync(dir)) continue;

    function walk(path) {
      const entries = Fs.readdirSync(path, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = Path.join(path, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
          files.push(fullPath);
        }
      }
    }

    walk(dir);
  }

  return files;
}

const dirs = ["packages", "tooling", "apps", "groking-effect-v4/src"];

const files = findTsFiles(dirs);

if (files.length === 0) {
  console.log("⚠️  No TypeScript files found");
  process.exit(0);
}

madge(files, {
  detectiveOptions: {
    ts: {
      skipTypeImports: true,
    },
  },
})
  .then((res) => {
    const circular = res.circular();
    if (circular.length) {
      console.error("❌ Circular dependencies found:");
      console.error(circular);
      process.exit(1);
    }
    console.log("✅ No circular dependencies found");
  })
  .catch((err) => {
    console.error("Error analyzing dependencies:", err.message);
    process.exit(1);
  });

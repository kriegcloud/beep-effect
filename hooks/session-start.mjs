#!/usr/bin/env node
/**
 * SessionStart hook: detect Effect project and inject core patterns.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const cwd = process.env.CLAUDE_CWD || process.cwd();

function detectEffect() {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    return "effect" in deps || "@effect/platform" in deps || "@effect/cli" in deps;
  } catch {
    return false;
  }
}

function loadSkill() {
  const skillPath = join(pluginRoot, "skills", "effect-ts", "SKILL.md");
  try {
    const content = readFileSync(skillPath, "utf-8");
    // Strip frontmatter
    const match = content.match(/^---[\s\S]*?---\n([\s\S]*)$/);
    return match ? match[1].trim() : content;
  } catch {
    return null;
  }
}

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"));

if (detectEffect()) {
  const skill = loadSkill();
  if (skill) {
    const output = {
      hookSpecificOutput: {
        additionalContext: `<effect-ts-patterns>\n${skill}\n</effect-ts-patterns>`,
      },
    };
    process.stdout.write(JSON.stringify(output));
  } else {
    process.stdout.write("{}");
  }
} else {
  process.stdout.write("{}");
}

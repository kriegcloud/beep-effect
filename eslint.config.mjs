import { DocsESLintConfig } from "@beep/repo-configs/eslint/DocsESLintConfig";
import { globalIgnores } from "eslint/config";

const eslintProfile = process.env.BEEP_ESLINT_PROFILE ?? "docs";

// The docs profile remains until lane B migrates its parser. Deprecated APIs use
// the dedicated Oxlint profile through the repository CLI.
if (eslintProfile !== "docs") {
  throw new Error(`Unsupported BEEP_ESLINT_PROFILE: ${eslintProfile}`);
}

// `.claude/worktrees/**` holds session-local linked worktrees (other checkouts'
// files that CI never sees); linting them couples this clone's gate to whatever
// those sessions have checked out. The Impeccable mirrors are vendored agent
// tooling whose upstream UMD bundle is not authored workspace source.
// `infra/lambda/**/build/**` is gitignored esbuild bundle output (vendored shim
// code) that eslint would otherwise scan. The `.runtime-*` directories under the
// vitest-instrumentation fixtures are gitignored disposable subprocess fixtures
// (see `.gitignore`); a killed test run can leave one behind, and it must not
// turn the lint gate red.
export default [
  globalIgnores([
    "**/src-tauri/target/**",
    ".claude/worktrees/**",
    ".claude/skills/impeccable/**",
    // Graft-generated wiring (the two shims and the skill files); the repo-owned
    // graft-loader.cjs beside the shims is linted.
    ".claude/helpers/graft-hooks.cjs",
    ".claude/helpers/graft-statusline.cjs",
    ".claude/skills/graft/**",
    ".grok/**",
    ".github/skills/impeccable/**",
    // Vendored skills stay byte-exact upstream (skills-lock.json `vendored`
    // entries; knowledge-surface-automation design B23).
    ".claude/skills/grill-me/**",
    ".claude/skills/oracle/**",
    ".claude/skills/portless/**",
    ".claude/skills/shadcn/**",
    ".claude/skills/teach/**",
    ".claude/skills/turborepo/**",
    "infra/lambda/**/build/**",
    "packages/tooling/test-kit/test-utils/test/fixtures/vitest-instrumentation/.runtime-*/**",
  ]),
  ...DocsESLintConfig,
];

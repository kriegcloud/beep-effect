import * as fs from "node:fs/promises";
import * as nodePath from "node:path";
import { runKgIndexNode } from "@beep/repo-cli/commands/kg";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";

const createFixtureRepo = async (base: string): Promise<void> => {
  await fs.mkdir(nodePath.join(base, "packages", "fixture", "src"), { recursive: true });
  await fs.mkdir(nodePath.join(base, "tooling", "ast-kg", ".cache"), { recursive: true });
  await fs.writeFile(nodePath.join(base, "tsconfig.packages.json"), "{}\n", "utf8");
  await fs.writeFile(
    nodePath.join(base, "packages", "fixture", "src", "dep.ts"),
    ["/**", " * @module fixture", " * @domain testing", " */", "export const dep = 1;", ""].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    nodePath.join(base, "packages", "fixture", "src", "index.ts"),
    [
      "import { dep } from './dep';",
      "/**",
      " * @category example",
      " * @provides dep",
      " */",
      "export function runThing(): number {",
      "  return dep;",
      "}",
      "",
    ].join("\n"),
    "utf8"
  );
};

describe("kg command", () => {
  it("runs full then delta empty changed with no writes", async () => {
    const root = nodePath.join(process.cwd(), `tooling/cli/_test-kg-${Date.now()}`);
    await createFixtureRepo(root);

    const previousRoot = process.env.BEEP_KG_ROOT_OVERRIDE;
    process.env.BEEP_KG_ROOT_OVERRIDE = root;
    try {
      const full = await runKgIndexNode("full", O.none());
      expect(full.mode).toBe("full");
      expect(full.selectedCount).toBeGreaterThan(0);
      expect(full.writes).toBeGreaterThan(0);

      const delta = await runKgIndexNode("delta", O.none());
      expect(delta.mode).toBe("delta");
      expect(delta.selectedCount).toBe(0);
      expect(delta.writes).toBe(0);
    } finally {
      if (previousRoot === undefined) {
        delete process.env.BEEP_KG_ROOT_OVERRIDE;
      } else {
        process.env.BEEP_KG_ROOT_OVERRIDE = previousRoot;
      }
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("is idempotent on replay and supports outage spool fallback", async () => {
    const idempotentRoot = nodePath.join(process.cwd(), `tooling/cli/_test-kg-idempotent-${Date.now()}`);
    await createFixtureRepo(idempotentRoot);

    const previousRoot = process.env.BEEP_KG_ROOT_OVERRIDE;
    const previousOutage = process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE;
    process.env.BEEP_KG_ROOT_OVERRIDE = idempotentRoot;

    try {
      const first = await runKgIndexNode("full", O.none());
      expect(first.writes).toBeGreaterThan(0);

      const second = await runKgIndexNode("full", O.none());
      expect(second.writes).toBe(0);
      expect(second.replayHits).toBeGreaterThan(0);

      const outageRoot = nodePath.join(process.cwd(), `tooling/cli/_test-kg-outage-${Date.now()}`);
      await createFixtureRepo(outageRoot);
      process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE = "true";
      process.env.BEEP_KG_ROOT_OVERRIDE = outageRoot;
      const outage = await runKgIndexNode("full", O.none());
      expect(outage.packetNoThrow).toBe(true);
      expect(outage.spoolWrites).toBeGreaterThan(0);
      await fs.rm(outageRoot, { recursive: true, force: true });
    } finally {
      if (previousRoot === undefined) {
        delete process.env.BEEP_KG_ROOT_OVERRIDE;
      } else {
        process.env.BEEP_KG_ROOT_OVERRIDE = previousRoot;
      }
      if (previousOutage === undefined) {
        delete process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE;
      } else {
        process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE = previousOutage;
      }
      await fs.rm(idempotentRoot, { recursive: true, force: true });
    }
  });
});

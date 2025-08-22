import { createRootGroup } from "@beep/logos/createRootGroup";
import { addRuleToGroup } from "@beep/logos/crud";
import { prepare, runPrepared } from "@beep/logos/prepare";
import { run } from "@beep/logos/run";
import { buildSampleRoot } from "@beep/logos/test/rules-engine/test-util";
import { describe, expect, test } from "vitest";

describe("prepare / runPrepared", () => {
  test("parity: pass case", () => {
    const { root } = buildSampleRoot();
    const value = {
      string: "bob",
      boolean: true,
      number: 20,
      array: ["alice"],
      object: { name: "bob" },
      generic: "bob",
    };

    const direct = run(root, value);
    const prepared = runPrepared(root, value);

    expect(prepared).toBe(direct);
    expect(prepared).toBeTruthy();
  });

  test("parity: fail case", () => {
    const { root } = buildSampleRoot();
    const value = {
      string: "bob",
      boolean: true,
      number: 20,
      array: ["alice"],
      object: { name: "bob" },
      generic: "bobby",
    };

    const direct = run(root, value);
    const prepared = runPrepared(root, value);

    expect(prepared).toBe(direct);
    expect(prepared).toBeFalsy();
  });

  test("invalid structure throws on prepare", () => {
    const { root, firstRule } = buildSampleRoot();
    // Corrupt a rule to break schema validation
    const bad = { ...firstRule } as any;
    delete bad.id;
    root.rules.splice(0, 1, bad);

    expect(() => prepare(root)).toThrowError();
  });

  test("empty rules returns true", () => {
    const emptyRoot = createRootGroup({ logicalOp: "and" });
    const prepared = runPrepared(emptyRoot, {});
    expect(prepared).toBe(true);
  });

  test("or short-circuit avoids missing-field throw", () => {
    const root = createRootGroup({ logicalOp: "or" });
    addRuleToGroup(root, {
      field: "present",
      op: { _tag: "isTruthy" },
      type: "genericType",
    });
    addRuleToGroup(root, {
      field: "missing",
      op: { _tag: "in" },
      type: "string",
      value: "x",
      ignoreCase: false,
    });

    const value = { present: "yes" };
    const prepared = runPrepared(root, value);
    const direct = run(root, value);

    expect(prepared).toBe(direct);
    expect(prepared).toBe(true);
  });
});

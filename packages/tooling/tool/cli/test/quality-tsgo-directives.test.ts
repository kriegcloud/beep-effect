import {
  effectDiagnosticsDirectiveExemptions,
  isEffectDiagnosticsDirectiveForTesting,
  isRejectedEffectDiagnosticsDirectiveForTesting,
} from "@beep/repo-cli/commands/Quality/Quality.command";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import { pipe } from "effect/Function";

describe("Effect diagnostics directive policy", () => {
  const directive = A.join(["@effect", "diagnostics"], "-");
  const retiredConformancePath = "packages/tooling/test-kit/test-utils/src/FileSystemConformance.ts";
  const retiredConformanceDirective = `// ${directive} strictEffectProvide:skip-file`;
  const shimPath = "vitest.setup.ts";
  const sharedConfigPath = "vitest.shared.ts";
  const sharedConfigDirective = `// ${directive} nodeBuiltinImport:skip-file`;
  const shimRules = ["nodeBuiltinImport", "asyncFunction", "newPromise", "processEnv", "globalTimers", "globalRandom"];

  it("declares exactly two exemptions: the root Bun shim and the root shared Vitest config", () => {
    expect(A.map(effectDiagnosticsDirectiveExemptions, (exemption) => exemption.path)).toEqual([
      shimPath,
      sharedConfigPath,
    ]);
    expect(A.map(effectDiagnosticsDirectiveExemptions, (exemption) => [...exemption.rules])).toEqual([
      shimRules,
      ["nodeBuiltinImport"],
    ]);
  });

  it.each(shimRules)("admits the exact %s skip-file line at the root Bun shim only", (rule) => {
    const line = `// ${directive} ${rule}:skip-file`;
    expect(isEffectDiagnosticsDirectiveForTesting(line)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(line, shimPath)).toBe(false);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(line, retiredConformancePath)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(line, "packages/example/src/main.ts")).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(`${line} -- reason`, shimPath)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(`// ${directive}-next-line ${rule}:off`, shimPath)).toBe(
      true
    );
  });

  it("admits only the exact nodeBuiltinImport skip-file line at the root shared Vitest config", () => {
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(sharedConfigDirective, sharedConfigPath)).toBe(false);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(sharedConfigDirective, retiredConformancePath)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(sharedConfigDirective, "vitest.config.ts")).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(retiredConformanceDirective, sharedConfigPath)).toBe(true);
    expect(
      isRejectedEffectDiagnosticsDirectiveForTesting(
        `// ${directive}-next-line nodeBuiltinImport:off`,
        sharedConfigPath
      )
    ).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(`${sharedConfigDirective} -- reason`, sharedConfigPath)).toBe(
      true
    );
  });

  it("rejects the retired conformance rule at the shim path and unrelated rules at both exempt paths", () => {
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(retiredConformanceDirective, shimPath)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(`// ${directive} schemaNumber:skip-file`, shimPath)).toBe(
      true
    );
    expect(
      isRejectedEffectDiagnosticsDirectiveForTesting(`// ${directive} schemaNumber:skip-file`, sharedConfigPath)
    ).toBe(true);
  });

  it.each([
    `// ${directive} strictEffectProvide:off`,
    `/** ${directive} nodeBuiltinImport:skip-file */`,
    `/* ${directive} */`,
    `  // ${directive}-next-line globalConsole:off`,
    `// ${directive}-next-line`,
  ])("recognizes every directive form and rejects it by default: %s", (line) => {
    expect(isEffectDiagnosticsDirectiveForTesting(line)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(line, "packages/example/src/main.ts")).toBe(true);
  });

  it("rejects the retired conformance entrypoint directive at its former path", () => {
    expect(isEffectDiagnosticsDirectiveForTesting(retiredConformanceDirective)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(retiredConformanceDirective, retiredConformancePath)).toBe(
      true
    );
    expect(
      pipe(retiredConformanceDirective, isRejectedEffectDiagnosticsDirectiveForTesting(retiredConformancePath))
    ).toBe(true);
  });

  it("allows the shared-config directive at its exact path without changing recognition", () => {
    expect(isEffectDiagnosticsDirectiveForTesting(sharedConfigDirective)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(sharedConfigDirective, sharedConfigPath)).toBe(false);
    expect(pipe(sharedConfigDirective, isRejectedEffectDiagnosticsDirectiveForTesting(sharedConfigPath))).toBe(false);
  });

  it.each([
    "vitest.config.ts",
    "packages/example/vitest.shared.ts",
    `fixtures/${sharedConfigPath}`,
    `${sharedConfigPath}x`,
    `${sharedConfigPath}/index.ts`,
    `./${sharedConfigPath}`,
    `/${sharedConfigPath}`,
    "Vitest.shared.ts",
  ])("rejects the shared-config directive at another path: %s", (filePath) => {
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(sharedConfigDirective, filePath)).toBe(true);
    expect(pipe(sharedConfigDirective, isRejectedEffectDiagnosticsDirectiveForTesting(filePath))).toBe(true);
  });

  it.each([
    retiredConformanceDirective,
    `${sharedConfigDirective} strictEffectProvide:skip-file`,
    `${sharedConfigDirective},strictEffectProvide:skip-file`,
    `// ${directive} strictEffectProvide:skip-file nodeBuiltinImport:skip-file`,
    `${sharedConfigDirective} nodeBuiltinImport:skip-file`,
    `// ${directive}-next-line nodeBuiltinImport:skip-file`,
    `// ${directive}-next-line nodeBuiltinImport:off`,
    `// ${directive}-next-line`,
    `// ${directive} nodeBuiltinImport:off`,
    `// ${directive} off`,
    `// ${directive} *:off`,
    `// ${directive}`,
    `/* ${directive} nodeBuiltinImport:skip-file */`,
    `/** ${directive} nodeBuiltinImport:skip-file */`,
    `//${directive} nodeBuiltinImport:skip-file`,
    `// ${directive}  nodeBuiltinImport:skip-file`,
    `// ${directive} nodeBuiltinImport: skip-file`,
    `// ${directive} nodeBuiltinImport:skip-next-line`,
    ` ${sharedConfigDirective}`,
    `${sharedConfigDirective} `,
    `${sharedConfigDirective} // reason`,
  ])("rejects unapproved directives even at the shared-config path: %s", (line) => {
    expect(isEffectDiagnosticsDirectiveForTesting(line)).toBe(true);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(line, sharedConfigPath)).toBe(true);
  });

  it.each([
    `const prefix = "${directive}";`,
    `Historical prose mentions ${directive} without being a directive.`,
    "// ordinary comment",
  ])("ignores non-directive mentions: %s", (line) => {
    expect(isEffectDiagnosticsDirectiveForTesting(line)).toBe(false);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(line, sharedConfigPath)).toBe(false);
    expect(isRejectedEffectDiagnosticsDirectiveForTesting(line, "packages/example/src/main.ts")).toBe(false);
  });
});

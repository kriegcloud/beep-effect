import { type CompilerOptions, ConfigurationShape } from "@beep/repo-cli/commands/DocgenV2/Configuration";
import { Cause, Exit } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeConfiguration = S.decodeUnknownSync(ConfigurationShape);
const decodeConfigurationExit = S.decodeUnknownExit(ConfigurationShape);

const renderSchemaFailure = (exit: Exit.Exit<unknown, S.SchemaError>): string =>
  Exit.isFailure(exit) ? Cause.pretty(exit.cause) : "";

describe("DocgenV2 Configuration schema", () => {
  it("applies shared compiler option defaults", () => {
    const decoded = decodeConfiguration({});
    const expected: CompilerOptions = {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      moduleResolution: "Bundler",
      target: "ES2022",
      lib: ["ES2022", "DOM"],
    };

    expect(decoded.parseCompilerOptions).toEqual(expected);
    expect(decoded.examplesCompilerOptions).toEqual(expected);
  });

  it("accepts strict encoded compiler options objects", () => {
    const decoded = decodeConfiguration({
      parseCompilerOptions: {
        noEmit: true,
        moduleResolution: "Bundler",
        target: "ES2022",
        jsx: "react-jsx",
        paths: {
          "@beep/*": ["src/*"],
        },
      },
    });

    expect(decoded.parseCompilerOptions).toEqual({
      noEmit: true,
      moduleResolution: "Bundler",
      target: "ES2022",
      jsx: "react-jsx",
      paths: {
        "@beep/*": ["src/*"],
      },
    });
  });

  it("accepts tsconfig path strings for both compiler option entries", () => {
    const decoded = decodeConfiguration({
      parseCompilerOptions: "./tsconfig.docgen.json",
      examplesCompilerOptions: "./tsconfig.examples.json",
    });

    expect(decoded.parseCompilerOptions).toBe("./tsconfig.docgen.json");
    expect(decoded.examplesCompilerOptions).toBe("./tsconfig.examples.json");
  });

  it("rejects unexpected compiler option keys", () => {
    const exit = decodeConfigurationExit({
      parseCompilerOptions: {
        unexpected: true,
      },
    });

    expect(Exit.isFailure(exit)).toBe(true);
    expect(renderSchemaFailure(exit)).toContain("Unexpected key");
    expect(renderSchemaFailure(exit)).toContain("unexpected");
  });

  it("rejects invalid compiler option semantic combinations", () => {
    const exit = decodeConfigurationExit({
      parseCompilerOptions: {
        allowImportingTsExtensions: true,
        moduleResolution: "NodeNext",
        noEmit: true,
      },
    });

    expect(Exit.isFailure(exit)).toBe(true);
    expect(renderSchemaFailure(exit)).toContain("allowImportingTsExtensions");
    expect(renderSchemaFailure(exit)).toContain("moduleResolution");
  });
});

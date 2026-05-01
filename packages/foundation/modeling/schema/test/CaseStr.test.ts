import { KebabCaseStr, PascalCaseStr, SnakeCaseStr } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("KebabCaseStr", () => {
  const decode = S.decodeUnknownSync(KebabCaseStr);

  it("accepts lowercase kebab-case values that start with a letter", () => {
    expect(decode("command")).toBe("command");
    expect(decode("command-handler")).toBe("command-handler");
    expect(decode("command-handler-2")).toBe("command-handler-2");
  });

  it("rejects digit-leading and non-kebab-case values", () => {
    expect(() => decode("1-command")).toThrow("Must be KebabCase format");
    expect(() => decode("Command-Handler")).toThrow("Must be KebabCase format");
    expect(() => decode("command_handler")).toThrow("Must be KebabCase format");
  });
});

describe("PascalCaseStr", () => {
  const decode = S.decodeUnknownSync(PascalCaseStr);

  it("accepts PascalCase values", () => {
    expect(decode("WorkflowStatus")).toBe("WorkflowStatus");
    expect(decode("URLParser")).toBe("URLParser");
    expect(decode("A")).toBe("A");
  });

  it("rejects lowercase-leading and separator-based values", () => {
    expect(() => decode("workflowStatus")).toThrow("Must be PascalCase format");
    expect(() => decode("Workflow_Status")).toThrow("Must be PascalCase format");
    expect(() => decode("Workflow-Status")).toThrow("Must be PascalCase format");
  });
});

describe("SnakeCaseStr", () => {
  const decode = S.decodeUnknownSync(SnakeCaseStr);

  it("accepts lowercase snake_case values", () => {
    expect(decode("workflow_status")).toBe("workflow_status");
    expect(decode("workflow_status_2")).toBe("workflow_status_2");
  });

  it("rejects uppercase and hyphenated values", () => {
    expect(() => decode("WorkflowStatus")).toThrow("Must be SnakeCase format");
    expect(() => decode("workflow-status")).toThrow("Must be SnakeCase format");
  });
});
